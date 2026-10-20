import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Realm,
  PlayerState,
  SurvivalState,
  ViewMode,
  Entity,
  Altar,
  Refugee
} from './types/game';
import {
  createInitialWorld,
  INITIAL_SHRINES,
  INITIAL_REFUGEES,
  ATLAS
} from './data/worldData';
import { tryMovePlayer, dist } from './engine/raycaster';
import { GameHeader } from './components/GameHeader';
import { HudBar } from './components/HudBar';
import { GameCanvas } from './components/GameCanvas';
import { GameFooter } from './components/GameFooter';
import { AtlasModal } from './components/AtlasModal';
import { LocalMapModal } from './components/LocalMapModal';
import { ShrinesModal } from './components/ShrinesModal';
import { RefugeesModal } from './components/RefugeesModal';
import { RealmInfoDrawer } from './components/RealmInfoDrawer';

const SAVE_KEY = 'estrada_mestres_react_v1';

export function App() {
  const [world, setWorld] = useState<Record<string, Realm>>(createInitialWorld);
  const [currentRealmId, setCurrentRealmId] = useState<string>('cruzeiros');
  const [inspectRealmId, setInspectRealmId] = useState<string>('cruzeiros');
  const [fromAtlas, setFromAtlas] = useState<boolean>(false);

  const [player, setPlayer] = useState<PlayerState>({
    x: 15.5,
    y: 17.4,
    angle: -Math.PI / 2
  });

  const [survival, setSurvival] = useState<SurvivalState>({
    hp: 100,
    hunger: 72,
    thirst: 72,
    axe: 40,
    torch: true,
    radar: true
  });

  const [altars, setAltars] = useState<Altar[]>(INITIAL_SHRINES);
  const [refugees, setRefugees] = useState<Refugee[]>(INITIAL_REFUGEES);

  const [viewMode, setViewMode] = useState<ViewMode>('game');
  const [toast, setToast] = useState<string | null>(
    'O Reino dos Cruzeiros não é uma cidade. É o espaço sagrado entre os outros seis.'
  );

  const keysDown = useRef<Set<string>>(new Set());
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentRealm = world[currentRealmId] || world.cruzeiros;

  // Say notification helper
  const say = useCallback((message: string) => {
    setToast(message);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 4200);
  }, []);

  // Save game to localStorage
  const saveGame = useCallback(() => {
    try {
      const visitedIds: string[] = [];
      Object.values(world).forEach((r) => {
        r.entities.forEach((e) => {
          if (e.visited) visitedIds.push(e.id);
        });
      });

      const data = {
        visited: visitedIds,
        realm: currentRealmId,
        player,
        survival,
        altars: altars.map((a) => ({ id: a.id, activated: a.activated, offerings: a.offerings })),
        refugees: refugees.map((r) => ({ id: r.id, rescued: r.rescued }))
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch {
      // ignore localStorage errors
    }
  }, [world, currentRealmId, player, survival, altars, refugees]);

  // Load game from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (!saved) return;
      const data = JSON.parse(saved);

      if (data.visited && Array.isArray(data.visited)) {
        const visitedSet = new Set(data.visited);
        setWorld((prev) => {
          const next = { ...prev };
          Object.keys(next).forEach((key) => {
            next[key] = {
              ...next[key],
              entities: next[key].entities.map((e) => ({
                ...e,
                visited: visitedSet.has(e.id) ? true : e.visited
              }))
            };
          });
          return next;
        });
      }

      if (data.realm && world[data.realm]) {
        setCurrentRealmId(data.realm);
      }
      if (data.player) setPlayer(data.player);
      if (data.survival) setSurvival(data.survival);

      if (data.altars && Array.isArray(data.altars)) {
        setAltars((prev) =>
          prev.map((a) => {
            const found = data.altars.find((d: { id: string }) => d.id === a.id);
            return found ? { ...a, activated: found.activated, offerings: found.offerings } : a;
          })
        );
      }

      if (data.refugees && Array.isArray(data.refugees)) {
        setRefugees((prev) =>
          prev.map((r) => {
            const found = data.refugees.find((d: { id: string }) => d.id === r.id);
            return found ? { ...r, rescued: found.rescued } : r;
          })
        );
      }
    } catch {
      // start fresh on corrupted data
    }
  }, []);

  // Nearest interactive entity
  const findNearestEntity = useCallback((): Entity | null => {
    const rank: Record<string, number> = {
      portal: 0,
      gate: 1,
      point: 2,
      fire: 3,
      person: 4
    };
    const candidates = currentRealm.entities
      .filter((e) => dist(player, e) < 1.45)
      .sort((a, b) => (rank[a.kind] ?? 9) - (rank[b.kind] ?? 9) || dist(player, a) - dist(player, b));

    return candidates[0] || null;
  }, [currentRealm, player]);

  const nearestEntity = findNearestEntity();

  // Travel between realms
  const travelTo = useCallback(
    (toId: string, fromId: string = currentRealmId) => {
      const dest = world[toId];
      if (!dest) return;

      const arrival =
        toId === 'cruzeiros'
          ? dest.arrivals?.[fromId] || dest.spawn
          : dest.returnSpawn || dest.spawn;

      setCurrentRealmId(toId);
      setPlayer({
        x: arrival.x,
        y: arrival.y,
        angle: arrival.angle
      });
      say(dest.enterLine);
      setViewMode('game');
    },
    [world, currentRealmId, say]
  );

  // Mark a point of force as visited
  const markPoint = useCallback(
    (entity: Entity) => {
      if (entity.countsAsPoint && !entity.visited) {
        setWorld((prev) => {
          const next = { ...prev };
          const realm = next[currentRealmId];
          if (realm) {
            next[currentRealmId] = {
              ...realm,
              entities: realm.entities.map((e) =>
                e.id === entity.id ? { ...e, visited: true } : e
              )
            };
          }
          return next;
        });

        // Buff Axé
        setSurvival((prev) => ({
          ...prev,
          axe: Math.min(100, prev.axe + 4)
        }));

        saveGame();
      }
    },
    [currentRealmId, saveGame]
  );

  // Interact with nearest entity
  const interact = useCallback(() => {
    const e = nearestEntity;
    if (!e) {
      say('Nada ao alcance. Procure um Cruzeiro, um portal ou um ponto de força.');
      return;
    }

    if (e.kind === 'portal') {
      markPoint(e);
      say(`${e.name} se abre. Você deixa o reino e ingressa no Espaço dos Cruzeiros.`);
      travelTo('cruzeiros', currentRealmId);
      return;
    }

    if (e.kind === 'gate') {
      if (e.to) {
        say(`O portal entrega sua travessia ao ${e.name}.`);
        travelTo(e.to, 'cruzeiros');
      }
      return;
    }

    if (e.kind === 'point') {
      markPoint(e);
      say(`${e.name} — ${e.power || 'Poder ancestral'}. Mestre: ${e.mestre || 'Desconhecido'}.`);
      return;
    }

    if (e.kind === 'fire') {
      setSurvival((prev) => ({
        ...prev,
        hp: Math.min(100, prev.hp + 12),
        hunger: Math.min(100, prev.hunger + 8),
        thirst: Math.min(100, prev.thirst + 4)
      }));
      say('O fogo sagrado devolve calor, vida e sacia o espírito.');
      return;
    }

    if (e.kind === 'person') {
      say(`${e.name}: “${e.line || 'Salve os caminhos.'}”`);
    }
  }, [nearestEntity, markPoint, currentRealmId, travelTo, say]);

  // Make offering to altar
  const handleMakeOffering = (altarId: string) => {
    setAltars((prev) =>
      prev.map((altar) => {
        if (altar.id !== altarId) return altar;
        const nextOfferings = altar.offerings + 1;
        const isActivated = nextOfferings >= altar.maxOfferings;
        if (isActivated && !altar.activated) {
          say(`✦ ${altar.name} despertou! Bênção permanente concedida: ${altar.buff}`);
        } else {
          say(`Oferenda depositada no ${altar.name} (${nextOfferings}/${altar.maxOfferings}).`);
        }
        return {
          ...altar,
          offerings: Math.min(altar.maxOfferings, nextOfferings),
          activated: isActivated
        };
      })
    );
    saveGame();
  };

  // Rescue a refugee
  const handleRescueRefugee = (id: string) => {
    setRefugees((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        say(`Irmão resgatado: ${r.name} (${r.title})!`);
        return { ...r, rescued: true };
      })
    );
    setSurvival((prev) => ({
      ...prev,
      axe: Math.min(100, prev.axe + 6)
    }));
    saveGame();
  };

  // Move player via touch controls
  const handleMovePlayer = (forward: number, strafe: number, turn: number) => {
    if (turn !== 0) {
      setPlayer((prev) => ({
        ...prev,
        angle: prev.angle + turn * 0.15
      }));
    }

    if (forward !== 0 || strafe !== 0) {
      setPlayer((prev) => {
        const next = { ...prev };
        const speed = 0.55;
        const dirX = Math.cos(next.angle);
        const dirY = Math.sin(next.angle);
        const moveX = (dirX * forward - dirY * strafe) * speed;
        const moveY = (dirY * forward + dirX * strafe) * speed;
        tryMovePlayer(next, currentRealm.map, next.x + moveX, next.y + moveY);
        return next;
      });
    }
  };

  // Keyboard navigation & game loop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysDown.current.add(e.code);

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.repeat) return;

      if (e.code === 'KeyE') {
        interact();
      }

      if (e.code === 'KeyT') {
        setSurvival((prev) => {
          const next = !prev.torch;
          say(next ? 'Tocha acesa.' : 'Tocha apagada.');
          return { ...prev, torch: next };
        });
      }

      if (e.code === 'KeyM') {
        setViewMode((prev) => {
          if (prev === 'localMap') return 'game';
          setInspectRealmId(currentRealmId);
          setFromAtlas(false);
          return 'localMap';
        });
      }

      if (e.code === 'Escape') {
        setViewMode('game');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown.current.delete(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [interact, say, currentRealmId]);

  // Main real-time physics & survival tick
  useEffect(() => {
    let lastTime = performance.now();
    let animId: number;

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (viewMode === 'game') {
        const keys = keysDown.current;
        let turn = 0;
        if (keys.has('ArrowLeft')) turn -= 1;
        if (keys.has('ArrowRight')) turn += 1;

        let forward = 0;
        let strafe = 0;
        if (keys.has('KeyW') || keys.has('ArrowUp')) forward += 1;
        if (keys.has('KeyS') || keys.has('ArrowDown')) forward -= 1;
        if (keys.has('KeyA')) strafe -= 1;
        if (keys.has('KeyD')) strafe += 1;

        const isRunning = keys.has('ShiftLeft') || keys.has('ShiftRight');
        const speed = (isRunning ? 3.1 : 1.85) * dt;

        if (turn !== 0 || forward !== 0 || strafe !== 0) {
          setPlayer((prev) => {
            const next = { ...prev };
            next.angle += turn * dt * 1.85;

            if (forward !== 0 || strafe !== 0) {
              const dirX = Math.cos(next.angle);
              const dirY = Math.sin(next.angle);
              const moveX = (dirX * forward - dirY * strafe) * speed;
              const moveY = (dirY * forward + dirX * strafe) * speed;
              tryMovePlayer(next, currentRealm.map, next.x + moveX, next.y + moveY);
            }

            return next;
          });
        }

        // Survival meters tick
        setSurvival((prev) => {
          let hp = prev.hp;
          const hunger = Math.max(0, prev.hunger - dt * 0.22);
          const thirst = Math.max(0, prev.thirst - dt * 0.28);

          // Health regen near fire
          const flame = currentRealm.entities.find((e) => e.kind === 'fire');
          if (flame && dist(player, flame) < 2.2 && hp < 100) {
            hp = Math.min(100, hp + dt * 1.8);
          }

          // Starvation damage
          if (hunger < 8 || thirst < 8) {
            hp = Math.max(0, hp - dt * 2.2);
          }

          // Death / respawn handling
          if (hp <= 0) {
            const s = currentRealm.returnSpawn || currentRealm.spawn;
            setPlayer({ x: s.x, y: s.y, angle: s.angle });
            say('Você desfalece na escuridão e acorda junto ao fogo sagrado.');
            return {
              ...prev,
              hp: 42,
              hunger: 42,
              thirst: 42
            };
          }

          return {
            ...prev,
            hp,
            hunger,
            thirst
          };
        });
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [viewMode, currentRealm, player, say]);

  // Counts
  const pointsOf = (r: Realm) => r.entities.filter((e) => e.countsAsPoint);
  const foundCount = Object.values(world).reduce(
    (n, r) => n + pointsOf(r).filter((e) => e.visited).length,
    0
  );
  const hereCount = pointsOf(currentRealm).filter((e) => e.visited).length;

  return (
    <div className="flex flex-col h-screen w-screen bg-[#07060b] text-[#f3ead7] overflow-hidden select-none font-sans">
      {/* Game Header */}
      <GameHeader
        currentRealm={currentRealm}
        onOpenView={(mode) => setViewMode(mode)}
        activeMode={viewMode}
      />

      {/* Top HUD Bar */}
      <HudBar
        state={survival}
        foundCount={foundCount}
        hereCount={hereCount}
        realmSafe={currentRealm.safe}
        onToggleTorch={() =>
          setSurvival((s) => ({ ...s, torch: !s.torch }))
        }
        onOpenLocalMap={() => {
          setInspectRealmId(currentRealmId);
          setFromAtlas(false);
          setViewMode('localMap');
        }}
        onOpenAtlas={() => setViewMode('atlas')}
        onToggleRadar={() =>
          setSurvival((s) => ({ ...s, radar: !s.radar }))
        }
      />

      {/* Ticker Lore Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#0e0c0a] border-b border-[#2a2118] text-[11px] text-[#b7a48a]">
        <span className="truncate max-w-[70%]">
          {currentRealm.enterLine}
        </span>
        <span className="hidden sm:inline-block font-mono text-[10px] text-[#e4c16a]">
          {currentRealm.safe ? 'Zona Sagrada' : `${hereCount}/9 pontos neste reino`}
        </span>
      </div>

      {/* Main 2.5D Canvas Area */}
      <GameCanvas
        realm={currentRealm}
        player={player}
        state={survival}
        nearestEntity={nearestEntity}
        toast={toast}
        onInteract={interact}
        onToggleTorch={() => setSurvival((s) => ({ ...s, torch: !s.torch }))}
        onOpenLocalMap={() => {
          setInspectRealmId(currentRealmId);
          setFromAtlas(false);
          setViewMode('localMap');
        }}
        onMovePlayer={handleMovePlayer}
      />

      {/* Footer */}
      <GameFooter
        currentRealmBlurb={currentRealm.blurb}
        foundPointsCount={foundCount}
        totalPointsCount={63}
      />

      {/* Modals & Drawers */}
      {viewMode === 'atlas' && (
        <AtlasModal
          world={world}
          currentRealmId={currentRealmId}
          onClose={() => setViewMode('game')}
          onSelectLocalMap={(realmId) => {
            setInspectRealmId(realmId);
            setFromAtlas(true);
            setViewMode('localMap');
          }}
          onTravelToRealm={(realmId) => {
            travelTo(realmId);
          }}
        />
      )}

      {viewMode === 'localMap' && (
        <LocalMapModal
          realm={world[inspectRealmId] || currentRealm}
          player={player}
          isCurrentRealm={inspectRealmId === currentRealmId}
          onClose={() => setViewMode('game')}
          onBackToAtlas={
            fromAtlas
              ? () => {
                  setViewMode('atlas');
                }
              : undefined
          }
        />
      )}

      {viewMode === 'altares' && (
        <ShrinesModal
          altars={altars}
          onMakeOffering={handleMakeOffering}
          onClose={() => setViewMode('game')}
        />
      )}

      {viewMode === 'refugees' && (
        <RefugeesModal
          refugees={refugees}
          onRescueRefugee={handleRescueRefugee}
          onClose={() => setViewMode('game')}
        />
      )}

      {(viewMode === 'reinos' || viewMode === 'pontos') && (
        <RealmInfoDrawer
          mode={viewMode}
          world={world}
          currentRealm={currentRealm}
          onClose={() => setViewMode('game')}
          onSelectRealm={(realmId) => {
            setInspectRealmId(realmId);
            setViewMode('localMap');
          }}
        />
      )}
    </div>
  );
}

export default App;
