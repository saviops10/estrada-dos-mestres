import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Realm, PlayerState, SurvivalState, Entity } from '../types/game';
import { RaycasterRenderer, tryMovePlayer } from '../engine/raycaster';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  RotateCw,
  Hand,
  Flame,
  Compass,
  Swords,
  Footprints
} from 'lucide-react';

interface GameCanvasProps {
  realm: Realm;
  player: PlayerState;
  state: SurvivalState;
  nearestEntity: Entity | null;
  toast: string | null;
  isAttacking: boolean;
  attackType: 'melee' | 'kick' | 'throw';
  onInteract: () => void;
  onAttack: () => void;
  onKick: () => void;
  onToggleTorch: () => void;
  onOpenLocalMap: () => void;
  onPlayerChange?: (player: PlayerState) => void;
  onMovePlayer?: (forward: number, strafe: number, turn: number) => void;
}

type TouchAction = 'forward' | 'backward' | 'strafeLeft' | 'strafeRight' | 'turnLeft' | 'turnRight';

export const GameCanvas: React.FC<GameCanvasProps> = ({
  realm,
  player,
  state,
  nearestEntity,
  toast,
  isAttacking,
  attackType,
  onInteract,
  onAttack,
  onKick,
  onToggleTorch,
  onOpenLocalMap,
  onPlayerChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<RaycasterRenderer | null>(null);
  const [isPointerLocked, setIsPointerLocked] = useState(false);

  // Synchronized state refs for high-performance 60fps loop without React re-render lag
  const playerRef = useRef<PlayerState>({ ...player });
  const realmRef = useRef<Realm>(realm);
  const stateRef = useRef<SurvivalState>(state);
  const isAttackingRef = useRef<boolean>(isAttacking);
  const attackTypeRef = useRef<'melee' | 'kick' | 'throw'>(attackType);

  // Active keys and touch inputs
  const keysDownRef = useRef<Set<string>>(new Set());
  const heldTouchActionRef = useRef<TouchAction | null>(null);

  // Dragging to look around without pointer lock
  const isDraggingRef = useRef<boolean>(false);
  const lastDragXRef = useRef<number>(0);
  const lastTouchXRef = useRef<number>(0);

  // Throttled sync to parent state
  const lastSyncTimeRef = useRef<number>(0);
  const lastSyncedPosRef = useRef<{ x: number; y: number; angle: number }>({
    x: player.x,
    y: player.y,
    angle: player.angle
  });

  // Sync refs when external props change
  useEffect(() => {
    realmRef.current = realm;
  }, [realm]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    isAttackingRef.current = isAttacking;
    attackTypeRef.current = attackType;
  }, [isAttacking, attackType]);

  // If player position changes significantly externally (e.g. travelTo or respawn), update playerRef
  useEffect(() => {
    const dx = Math.abs(player.x - playerRef.current.x);
    const dy = Math.abs(player.y - playerRef.current.y);
    if (dx > 0.4 || dy > 0.4) {
      playerRef.current = { ...player };
      lastSyncedPosRef.current = { ...player };
    }
  }, [player]);

  // Initialize renderer
  if (!rendererRef.current) {
    rendererRef.current = new RaycasterRenderer(480);
  }

  // Keyboard listeners directly in GameCanvas for instant responsive inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      keysDownRef.current.add(e.code);
      if (e.key) keysDownRef.current.add(e.key.toLowerCase());
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDownRef.current.delete(e.code);
      if (e.key) keysDownRef.current.delete(e.key.toLowerCase());
    };

    const handleBlur = () => {
      keysDownRef.current.clear();
      heldTouchActionRef.current = null;
      isDraggingRef.current = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Main Unified Animation Loop: Physics + Raycaster Rendering
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = (time: number) => {
      const dt = Math.min(0.05, (time - lastTime) / 1000);
      lastTime = time;

      const keys = keysDownRef.current;
      const heldTouch = heldTouchActionRef.current;

      // 1. Camera Rotation
      let turn = 0;
      if (keys.has('ArrowLeft') || keys.has('KeyQ') || keys.has('q')) turn -= 1;
      if (keys.has('ArrowRight')) turn += 1;
      if (heldTouch === 'turnLeft') turn -= 1;
      if (heldTouch === 'turnRight') turn += 1;

      if (turn !== 0) {
        playerRef.current.angle += turn * 2.95 * dt;
        // Keep angle in [-PI, PI]
        while (playerRef.current.angle > Math.PI) playerRef.current.angle -= 2 * Math.PI;
        while (playerRef.current.angle < -Math.PI) playerRef.current.angle += 2 * Math.PI;
      }

      // 2. Player Movement (WASD / Arrows / Touch)
      let forward = 0;
      let strafe = 0;
      if (keys.has('KeyW') || keys.has('ArrowUp') || keys.has('w')) forward += 1;
      if (keys.has('KeyS') || keys.has('ArrowDown') || keys.has('s')) forward -= 1;
      if (keys.has('KeyA') || keys.has('a')) strafe -= 1;
      if (keys.has('KeyD') || keys.has('d')) strafe += 1;

      if (heldTouch === 'forward') forward += 1;
      if (heldTouch === 'backward') forward -= 1;
      if (heldTouch === 'strafeLeft') strafe -= 1;
      if (heldTouch === 'strafeRight') strafe += 1;

      if (forward !== 0 || strafe !== 0) {
        const isRunning = keys.has('ShiftLeft') || keys.has('ShiftRight');
        const speed = (isRunning ? 4.2 : 2.7) * dt;

        // Normalize movement vector
        const len = Math.hypot(forward, strafe);
        const normF = forward / len;
        const normS = strafe / len;

        const dirX = Math.cos(playerRef.current.angle);
        const dirY = Math.sin(playerRef.current.angle);
        const moveX = (dirX * normF - dirY * normS) * speed;
        const moveY = (dirY * normF + dirX * normS) * speed;

        tryMovePlayer(
          playerRef.current,
          realmRef.current.map,
          playerRef.current.x + moveX,
          playerRef.current.y + moveY
        );
      }

      // 3. Render 3D Raycaster scene
      if (rendererRef.current) {
        rendererRef.current.render(
          ctx,
          canvas.width,
          canvas.height,
          playerRef.current,
          realmRef.current,
          stateRef.current,
          time,
          isAttackingRef.current,
          attackTypeRef.current
        );
      }

      // 4. Periodically sync player coordinates to parent (10 Hz throttle)
      if (time - lastSyncTimeRef.current > 100) {
        lastSyncTimeRef.current = time;
        const p = playerRef.current;
        const last = lastSyncedPosRef.current;
        if (
          Math.abs(p.x - last.x) > 0.02 ||
          Math.abs(p.y - last.y) > 0.02 ||
          Math.abs(p.angle - last.angle) > 0.03
        ) {
          lastSyncedPosRef.current = { x: p.x, y: p.y, angle: p.angle };
          if (onPlayerChange) {
            onPlayerChange({ ...p });
          }
        }
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [onPlayerChange]);

  // Pointer lock handling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handlePointerLockChange = () => {
      setIsPointerLocked(document.pointerLockElement === canvas);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === canvas) {
        playerRef.current.angle += e.movementX * 0.0028;
        while (playerRef.current.angle > Math.PI) playerRef.current.angle -= 2 * Math.PI;
        while (playerRef.current.angle < -Math.PI) playerRef.current.angle += 2 * Math.PI;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (document.pointerLockElement === canvas) {
        if (e.button === 0) {
          onAttack();
        } else if (e.button === 2) {
          onKick();
        }
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [onAttack, onKick]);

  // Click & Drag to look around when not locked
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (!document.pointerLockElement) {
      isDraggingRef.current = true;
      lastDragXRef.current = e.clientX;
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!document.pointerLockElement && isDraggingRef.current) {
      const deltaX = e.clientX - lastDragXRef.current;
      lastDragXRef.current = e.clientX;
      playerRef.current.angle += deltaX * 0.004;
      while (playerRef.current.angle > Math.PI) playerRef.current.angle -= 2 * Math.PI;
      while (playerRef.current.angle < -Math.PI) playerRef.current.angle += 2 * Math.PI;
    }
  };

  const handleCanvasMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Touch swipe to look around
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      lastTouchXRef.current = e.touches[0].clientX;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      const touchX = e.touches[0].clientX;
      const deltaX = touchX - lastTouchXRef.current;
      lastTouchXRef.current = touchX;
      playerRef.current.angle += deltaX * 0.0045;
      while (playerRef.current.angle > Math.PI) playerRef.current.angle -= 2 * Math.PI;
      while (playerRef.current.angle < -Math.PI) playerRef.current.angle += 2 * Math.PI;
    }
  };

  const requestLock = () => {
    const canvas = canvasRef.current;
    if (canvas && !document.pointerLockElement) {
      canvas.requestPointerLock?.();
    }
  };

  const getPromptText = (e: Entity) => {
    switch (e.kind) {
      case 'gate':
        return `[E] Portal para ${e.name}`;
      case 'portal':
        return `[E] Cruzeiro — Sair para o Espaço Astral`;
      case 'point':
        return `[E] Reconhecer ${e.name} & Oferenda`;
      case 'person':
        return `[E] Falar com ${e.name}`;
      case 'fire':
        return `[E] Descansar & Curar na ${e.name}`;
      case 'animal':
        return state.torch
          ? `[Espaço / F] Chute de Capoeira no ${e.name} (Tocha acesa)`
          : `[Espaço / Clique] Caçar ${e.name} com ${state.activeWeapon}`;
      case 'enemy':
        return state.torch
          ? `[Espaço / F] Chute Frontal no ${e.name} (Tocha ocupa a mão)`
          : `[Espaço / Clique] Atacar ${e.name} com ${state.activeWeapon}`;
      default:
        return `[E] Interagir com ${e.name}`;
    }
  };

  // Touch button hold helpers
  const startTouchMove = (action: TouchAction) => (e: React.PointerEvent) => {
    e.preventDefault();
    heldTouchActionRef.current = action;
  };

  const stopTouchMove = (e: React.PointerEvent) => {
    e.preventDefault();
    heldTouchActionRef.current = null;
  };

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center p-2 sm:p-4 bg-[radial-gradient(ellipse_at_center,#1a140f_0%,#07060b_72%)] select-none overflow-hidden">
      {/* 2.5D Canvas Container */}
      <div className="relative w-full max-w-[960px] aspect-video flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={480}
          height={270}
          onClick={requestLock}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          className="w-full h-full object-contain rounded-xl border border-[#6a542c] shadow-[0_0_0_4px_#1a140f,0_20px_50px_rgba(0,0,0,0.65)] cursor-crosshair bg-black"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Pointer Lock hint overlay */}
        {!isPointerLocked && (
          <div
            onClick={requestLock}
            className="absolute top-3 right-3 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#100e0c]/85 hover:bg-[#1a1410] border border-[#4a3b24] text-[11px] text-[#b7a48a] hover:text-[#e4c16a] transition-colors cursor-pointer pointer-events-auto shadow-md"
          >
            <span>Clique para travar mouse / Arraste para olhar · [WASD] Andar · [ESC] Menu</span>
          </div>
        )}

        {/* Torch & Feet indicator */}
        {state.torch && (
          <div className="absolute bottom-3 right-3 hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-[#1f140a]/85 border border-[#8b6914] text-[10px] text-[#ffd05b]">
            <Footprints className="w-3 h-3 text-[#e4c16a]" />
            <span>Mão direita ocupada com a tocha · Chutes com os pés ativos [F / Espaço]</span>
          </div>
        )}

        {/* Action Prompt */}
        {nearestEntity && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-[#1a1408]/92 border border-[#e4c16a] text-[#e4c16a] font-bold text-xs sm:text-sm tracking-wide shadow-lg flex items-center gap-2 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
            <Hand className="w-4 h-4 text-[#ffd05b] animate-bounce" />
            <span>{getPromptText(nearestEntity)}</span>
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 max-w-[90%] px-4 py-2 rounded-lg bg-[#120e0a]/95 border border-[#4a3b24] text-[#f3ead7] text-xs sm:text-sm text-center shadow-xl pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-200">
            {toast}
          </div>
        )}
      </div>

      {/* On-Screen Touch / Mobile Controls with Continuous Hold Support */}
      <div className="mt-3 w-full max-w-[960px] flex items-center justify-between gap-2 px-2 sm:hidden">
        {/* Left: Direction Pad (Continuous Hold) */}
        <div className="grid grid-cols-3 gap-1.5 w-36">
          <div />
          <button
            type="button"
            onPointerDown={startTouchMove('forward')}
            onPointerUp={stopTouchMove}
            onPointerCancel={stopTouchMove}
            onPointerLeave={stopTouchMove}
            className="p-3 rounded-lg bg-[#1c1814] active:bg-[#342a1e] border border-[#4a3b24] text-[#e4c16a] flex items-center justify-center cursor-pointer select-none"
            aria-label="Frente"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <div />

          <button
            type="button"
            onPointerDown={startTouchMove('strafeLeft')}
            onPointerUp={stopTouchMove}
            onPointerCancel={stopTouchMove}
            onPointerLeave={stopTouchMove}
            className="p-3 rounded-lg bg-[#1c1814] active:bg-[#342a1e] border border-[#4a3b24] text-[#e4c16a] flex items-center justify-center cursor-pointer select-none"
            aria-label="Esquerda"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onPointerDown={startTouchMove('backward')}
            onPointerUp={stopTouchMove}
            onPointerCancel={stopTouchMove}
            onPointerLeave={stopTouchMove}
            className="p-3 rounded-lg bg-[#1c1814] active:bg-[#342a1e] border border-[#4a3b24] text-[#e4c16a] flex items-center justify-center cursor-pointer select-none"
            aria-label="Trás"
          >
            <ArrowDown className="w-5 h-5" />
          </button>

          <button
            type="button"
            onPointerDown={startTouchMove('strafeRight')}
            onPointerUp={stopTouchMove}
            onPointerCancel={stopTouchMove}
            onPointerLeave={stopTouchMove}
            className="p-3 rounded-lg bg-[#1c1814] active:bg-[#342a1e] border border-[#4a3b24] text-[#e4c16a] flex items-center justify-center cursor-pointer select-none"
            aria-label="Direita"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Center: Turn Controls (Continuous Hold) */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onPointerDown={startTouchMove('turnLeft')}
              onPointerUp={stopTouchMove}
              onPointerCancel={stopTouchMove}
              onPointerLeave={stopTouchMove}
              className="p-2.5 rounded-lg bg-[#1c1814] active:bg-[#342a1e] border border-[#4a3b24] text-[#b7a48a] flex items-center justify-center cursor-pointer select-none"
              title="Girar Esquerda"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onPointerDown={startTouchMove('turnRight')}
              onPointerUp={stopTouchMove}
              onPointerCancel={stopTouchMove}
              onPointerLeave={stopTouchMove}
              className="p-2.5 rounded-lg bg-[#1c1814] active:bg-[#342a1e] border border-[#4a3b24] text-[#b7a48a] flex items-center justify-center cursor-pointer select-none"
              title="Girar Direita"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleTorch}
            className={`p-2 rounded-lg border text-xs flex items-center justify-center gap-1 cursor-pointer ${
              state.torch
                ? 'bg-[#3a2814] text-[#ffe08a] border-[#e4c16a]'
                : 'bg-[#1c1814] text-[#b7a48a] border-[#4a3b24]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Tocha</span>
          </button>
        </div>

        {/* Right: Actions (Chute, Ataque, Agir, Mapa) */}
        <div className="flex flex-col gap-2 w-36">
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={onKick}
              className="flex-1 py-2 px-1 rounded-lg bg-[#2e1c10] active:bg-[#452918] border border-[#d4af37] text-[#ffd05b] font-bold text-xs shadow flex items-center justify-center gap-1 cursor-pointer"
              title="Chute de Capoeira (Pé)"
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>Chute</span>
            </button>

            <button
              type="button"
              onClick={onAttack}
              className="flex-1 py-2 px-1 rounded-lg bg-gradient-to-r from-[#8b2b18] to-[#ff5f3d] active:opacity-90 text-[#f3ead7] font-bold text-xs shadow flex items-center justify-center gap-1 cursor-pointer"
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Golpe</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onInteract}
            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#8b6914] to-[#e4c16a] active:opacity-90 text-[#1a140c] font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Hand className="w-4 h-4" />
            <span>Agir [E]</span>
          </button>

          <button
            type="button"
            onClick={onOpenLocalMap}
            className="py-1.5 px-3 rounded-lg bg-[#1c1814] active:bg-[#2c241c] border border-[#4a3b24] text-[#f3ead7] text-xs flex items-center justify-center gap-1 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-[#e4c16a]" />
            <span>Mapa [M]</span>
          </button>
        </div>
      </div>
    </div>
  );
};
