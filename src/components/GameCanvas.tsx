import React, { useRef, useEffect, useState } from 'react';
import { Realm, PlayerState, SurvivalState, Entity } from '../types/game';
import { RaycasterRenderer } from '../engine/raycaster';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  RotateCw,
  Hand,
  Flame,
  Compass
} from 'lucide-react';

interface GameCanvasProps {
  realm: Realm;
  player: PlayerState;
  state: SurvivalState;
  nearestEntity: Entity | null;
  toast: string | null;
  onInteract: () => void;
  onToggleTorch: () => void;
  onOpenLocalMap: () => void;
  onMovePlayer: (forward: number, strafe: number, turn: number) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  realm,
  player,
  state,
  nearestEntity,
  toast,
  onInteract,
  onToggleTorch,
  onOpenLocalMap,
  onMovePlayer
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<RaycasterRenderer | null>(null);
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const [touchControlsActive, setTouchControlsActive] = useState(false);

  // Initialize renderer
  if (!rendererRef.current) {
    rendererRef.current = new RaycasterRenderer(480);
  }

  // Animation frame rendering loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderLoop = (time: number) => {
      if (rendererRef.current) {
        rendererRef.current.render(
          ctx,
          canvas.width,
          canvas.height,
          player,
          realm,
          state,
          time
        );
      }
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [player, realm, state]);

  // Pointer lock handling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handlePointerLockChange = () => {
      setIsPointerLocked(document.pointerLockElement === canvas);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === canvas) {
        player.angle += e.movementX * 0.0032;
      }
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [player]);

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
        return `[E] Reconhecer ${e.name}`;
      case 'person':
        return `[E] Falar com ${e.name}`;
      case 'fire':
        return `[E] Descansar no ${e.name}`;
      default:
        return `[E] Interagir com ${e.name}`;
    }
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
          className="w-full h-full object-contain rounded-xl border border-[#6a542c] shadow-[0_0_0_4px_#1a140f,0_20px_50px_rgba(0,0,0,0.65)] cursor-crosshair bg-black"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Pointer Lock hint overlay */}
        {!isPointerLocked && (
          <div
            onClick={requestLock}
            className="absolute top-3 right-3 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#100e0c]/80 hover:bg-[#1a1410] border border-[#4a3b24] text-[11px] text-[#b7a48a] hover:text-[#e4c16a] transition-colors cursor-pointer pointer-events-auto"
          >
            <span>Clique na tela para travar o mouse</span>
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

      {/* On-Screen Touch / Mobile Controls (Visible on touch devices or toggleable) */}
      <div className="mt-3 w-full max-w-[960px] flex items-center justify-between gap-2 px-2 sm:hidden">
        {/* Left: Direction Pad */}
        <div className="grid grid-cols-3 gap-1.5 w-36">
          <div />
          <button
            type="button"
            onPointerDown={() => onMovePlayer(1, 0, 0)}
            className="p-3 rounded-lg bg-[#1c1814] active:bg-[#342a1e] border border-[#4a3b24] text-[#e4c16a] flex items-center justify-center cursor-pointer"
            aria-label="Frente"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <div />

          <button
            type="button"
            onPointerDown={() => onMovePlayer(0, -1, 0)}
            className="p-3 rounded-lg bg-[#1c1814] active:bg-[#342a1e] border border-[#4a3b24] text-[#e4c16a] flex items-center justify-center cursor-pointer"
            aria-label="Esquerda"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onPointerDown={() => onMovePlayer(-1, 0, 0)}
            className="p-3 rounded-lg bg-[#1c1814] active:bg-[#342a1e] border border-[#4a3b24] text-[#e4c16a] flex items-center justify-center cursor-pointer"
            aria-label="Trás"
          >
            <ArrowDown className="w-5 h-5" />
          </button>

          <button
            type="button"
            onPointerDown={() => onMovePlayer(0, 1, 0)}
            className="p-3 rounded-lg bg-[#1c1814] active:bg-[#342a1e] border border-[#4a3b24] text-[#e4c16a] flex items-center justify-center cursor-pointer"
            aria-label="Direita"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Center: Turn Controls */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onPointerDown={() => onMovePlayer(0, 0, -1)}
              className="p-2.5 rounded-lg bg-[#1c1814] active:bg-[#342a1e] border border-[#4a3b24] text-[#b7a48a] flex items-center justify-center cursor-pointer"
              title="Girar Esquerda"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onPointerDown={() => onMovePlayer(0, 0, 1)}
              className="p-2.5 rounded-lg bg-[#1c1814] active:bg-[#342a1e] border border-[#4a3b24] text-[#b7a48a] flex items-center justify-center cursor-pointer"
              title="Girar Direita"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleTorch}
            className={`p-2 rounded-lg border text-xs flex items-center justify-center gap-1 ${
              state.torch
                ? 'bg-[#3a2814] text-[#ffe08a] border-[#e4c16a]'
                : 'bg-[#1c1814] text-[#b7a48a] border-[#4a3b24]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Tocha</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col gap-2 w-32">
          <button
            type="button"
            onClick={onInteract}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-[#8b6914] to-[#e4c16a] active:opacity-90 text-[#1a140c] font-bold text-sm shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Hand className="w-4 h-4" />
            <span>Agir [E]</span>
          </button>

          <button
            type="button"
            onClick={onOpenLocalMap}
            className="py-2 px-3 rounded-lg bg-[#1c1814] active:bg-[#2c241c] border border-[#4a3b24] text-[#f3ead7] text-xs flex items-center justify-center gap-1 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-[#e4c16a]" />
            <span>Mapa [M]</span>
          </button>
        </div>
      </div>
    </div>
  );
};
