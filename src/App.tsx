import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Realm,
  PlayerState,
  SurvivalState,
  ViewMode,
  Entity,
  Altar,
  Refugee,
  WeaponType
} from './types/game';
import {
  createInitialWorld,
  INITIAL_SHRINES,
  INITIAL_REFUGEES
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
import { HerbalismModal } from './components/HerbalismModal';
import { CapoeiraModal } from './components/CapoeiraModal';
import { PrologueModal } from './components/PrologueModal';
import { RevoltaClimaxModal } from './components/RevoltaClimaxModal';
import { PauseMenuModal } from './components/PauseMenuModal';

const SAVE_KEY = 'estrada_mestres_react_v3';

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
    radar: true,
    miasmas: 0,
    activeWeapon: 'capoeira',
    inventory: {
      meat: 2,
      water: 3,
      arruda: 2,
      guine: 2,
      alecrim: 2,
      arrows: 10,
      spears: 2,
      stones: 99
    },
    capoeira: {
      ginga: true,
      rasteira: false,
      meiaLua: false,
      level: 1
    },
    phase: 'fase1_fuga',
    quilomboFounded: false,
    revoltProgress: 0
  });

  const [altars, setAltars] = useState<Altar[]>(INITIAL_SHRINES);
  const [refugees, setRefugees] = useState<Refugee[]>(INITIAL_REFUGEES);

  const [viewMode, setViewMode] = useState<ViewMode>('game');
  const [isAttacking, setIsAttacking] = useState<boolean>(false);
  const [attackType, setAttackType] = useState<'melee' | 'kick' | 'throw'>('melee');
  const [toast, setToast] = useState<string | null>(
    'Fuga & Furtividade: use pedras para distrair capitães e liberte seus irmãos!'
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
    }, 4500);
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
      // start fresh
    }
  }, []);

  // Nearest interactive entity
  const findNearestEntity = useCallback((): Entity | null => {
    const rank: Record<string, number> = {
      portal: 0,
      gate: 1,
      point: 2,
      fire: 3,
      person: 4,
      animal: 5,
      enemy: 6
    };
    const candidates = currentRealm.entities
      .filter((e) => !e.isDead && dist(player, e) < 1.85)
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

      if (toId === 'quilombo' && survival.phase === 'fase1_fuga') {
        setSurvival((prev) => ({
          ...prev,
          phase: 'fase2_libertacao',
          quilomboFounded: true,
          axe: Math.min(100, prev.axe + 30)
        }));
        say('✦ FASE 1 CONCLUÍDA! O Quilombo Central foi estabelecido. Inicia a Fase 2: Libertação dos 49!');
      } else {
        say(dest.enterLine);
      }

      setCurrentRealmId(toId);
      setPlayer({
        x: arrival.x,
        y: arrival.y,
        angle: arrival.angle
      });
      setViewMode('game');
    },
    [world, currentRealmId, survival.phase, say]
  );

  // Kick with foot (Capoeira chute frontal / martelo / rasteira)
  const handleKick = useCallback(() => {
    setIsAttacking(true);
    setAttackType('kick');
    setTimeout(() => setIsAttacking(false), 240);

    const target = nearestEntity;
    if (!target) {
      say('Chute frontal no ar! O golpe mantém os capitães distantes.');
      return;
    }

    if (target.kind === 'enemy') {
      let dmg = 24;
      let msg = 'Chute de Capoeira certeiro!';
      if (survival.capoeira.rasteira) {
        dmg += 12;
        msg = 'Rasteira desferida! O capitão foi desequilibrado e perdeu a postura!';
      }

      const targetHp = (target.hp ?? 30) - dmg;
      if (targetHp <= 0) {
        target.isDead = true;
        setSurvival((prev) => ({ ...prev, axe: Math.min(100, prev.axe + 15) }));
        say(`${msg} Inimigo neutralizado! +15 de Axé.`);
      } else {
        target.hp = targetHp;
        say(`${msg} Dano: ${dmg}. O inimigo recua.`);
      }
      saveGame();
      return;
    }

    if (target.kind === 'animal') {
      const targetHp = (target.hp ?? 15) - 20;
      if (targetHp <= 0) {
        target.isDead = true;
        setSurvival((prev) => ({
          ...prev,
          inventory: { ...prev.inventory, meat: prev.inventory.meat + 1 }
        }));
        say(`Chute certeiro! Você abateu o ${target.name}. +Carne coletada.`);
      } else {
        target.hp = targetHp;
        say(`Acertou o ${target.name} com um chute!`);
      }
      saveGame();
    }
  }, [nearestEntity, survival.capoeira, say, saveGame]);

  // Main Attack & Hunting / Stealth Distraction mechanic
  const handleAttack = useCallback(() => {
    const isTorchOn = survival.torch;

    // Se a tocha estiver acesa, a mão direita está ocupada:
    // O golpe desarmado ou de capoeira é automaticamente executado com os PÉS!
    if (isTorchOn && (survival.activeWeapon === 'capoeira' || survival.activeWeapon === 'pedra')) {
      if (survival.activeWeapon === 'pedra') {
        // Arremesso com a mão esquerda livre
        setIsAttacking(true);
        setAttackType('throw');
        setTimeout(() => setIsAttacking(false), 240);

        // Distrai inimigos próximos
        const nearbyEnemy = currentRealm.entities.find(
          (e) => !e.isDead && e.kind === 'enemy' && dist(player, e) < 5.5
        );
        if (nearbyEnemy) {
          say(`🪨 Pedra arremessada! O ${nearbyEnemy.name} ouviu o ruído e foi investigar longe do posto.`);
        } else {
          say('🪨 Pedra arremessada na mata para criar distração acústica.');
        }
        return;
      }

      // Golpe com o pé
      handleKick();
      return;
    }

    // Ataque com duas mãos livres
    setIsAttacking(true);
    setAttackType('melee');
    setTimeout(() => setIsAttacking(false), 240);

    const weapon = survival.activeWeapon;
    const target = nearestEntity;

    if (!target) {
      if (weapon === 'pedra') {
        say('🪨 Pedra arremessada na mata para criar distração acústica.');
      } else if (weapon === 'capoeira') {
        say('Ginga e punhos em guarda! Foco em furtividade e esquiva.');
      }
      return;
    }

    // Hunting Fauna
    if (target.kind === 'animal') {
      const dmg = weapon === 'lanca' ? 35 : weapon === 'arco' ? 25 : weapon === 'pedra' ? 15 : 14;
      const targetHp = (target.hp ?? 15) - dmg;

      if (targetHp <= 0) {
        target.isDead = true;
        setSurvival((prev) => ({
          ...prev,
          inventory: {
            ...prev.inventory,
            meat: prev.inventory.meat + (target.animalType === 'javali' ? 2 : 1)
          }
        }));
        say(`Você abateu o ${target.name}! +Carne fresca adicionada aos suprimentos.`);
      } else {
        target.hp = targetHp;
        say(`Você acertou o ${target.name} com ${weapon}! Ele tenta fugir.`);
      }
      saveGame();
      return;
    }

    // Combating Enemies (Capitães do Mato / Kiumbas / Milicianos)
    if (target.kind === 'enemy') {
      let dmg = weapon === 'lanca' ? 35 : weapon === 'arco' ? 25 : weapon === 'pedra' ? 12 : 20;
      let specialMsg = '';

      if (weapon === 'capoeira') {
        if (survival.capoeira.meiaLua) {
          dmg += 20;
          specialMsg = ' Meia-Lua de Compasso desferida com impacto devastador!';
        } else if (survival.capoeira.rasteira) {
          dmg += 10;
          specialMsg = ' Rasteira certeira derruba o capitão!';
        }
      }

      if (target.enemyType === 'kiumba' && !survival.torch) {
        setSurvival((prev) => ({ ...prev, axe: Math.max(0, prev.axe - 10) }));
        specialMsg += ' Sem tocha, o miasma drenou 10 de seu Axé!';
      }

      const targetHp = (target.hp ?? 30) - dmg;

      if (targetHp <= 0) {
        target.isDead = true;
        setSurvival((prev) => ({
          ...prev,
          axe: Math.min(100, prev.axe + 15),
          inventory: {
            ...prev.inventory,
            arrows: prev.inventory.arrows + 3
          }
        }));
        say(`Vitória! O ${target.name} foi derrotado.${specialMsg} +Axé e flechas recuperadas.`);
      } else {
        target.hp = targetHp;
        say(`Golpe contra o ${target.name}! Dano: ${dmg}.${specialMsg}`);
      }
      saveGame();
      return;
    }

    say(`Ação com ${weapon} executada.`);
  }, [survival, nearestEntity, handleKick, currentRealm, player, say, saveGame]);

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

        // Buff Axé & award sacred herbs
        setSurvival((prev) => ({
          ...prev,
          axe: Math.min(100, prev.axe + 6),
          inventory: {
            ...prev.inventory,
            arruda: prev.inventory.arruda + 1,
            guine: prev.inventory.guine + 1,
            alecrim: prev.inventory.alecrim + 1
          }
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
      say('Nada ao alcance. Procure um Cruzeiro, um portal, fogueira ou ponto de força.');
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
      say(`${e.name} — ${e.power || 'Poder ancestral'}. Mestre: ${e.mestre || 'Guardião Sagrado'}. +Ervas colhidas!`);
      return;
    }

    if (e.kind === 'fire') {
      setSurvival((prev) => ({
        ...prev,
        hp: Math.min(100, prev.hp + 14),
        hunger: Math.min(100, prev.hunger + 10),
        thirst: Math.min(100, prev.thirst + 6),
        miasmas: Math.max(0, prev.miasmas - 20)
      }));
      say('O fogo sagrado dissipa miasmas, cura feridas e sacia o espírito.');
      return;
    }

    if (e.kind === 'person') {
      say(`${e.name}: “${e.line || 'Salve os caminhos da liberdade.'}”`);
      return;
    }

    if (e.kind === 'animal' || e.kind === 'enemy') {
      handleAttack();
    }
  }, [nearestEntity, markPoint, currentRealmId, travelTo, handleAttack, say]);

  // Make offering to altar
  const handleMakeOffering = (altarId: string) => {
    setAltars((prev) =>
      prev.map((altar) => {
        if (altar.id !== altarId) return altar;
        const nextOfferings = altar.offerings + 1;
        const isActivated = nextOfferings >= altar.maxOfferings;
        if (isActivated && !altar.activated) {
          say(`✦ ${altar.name} despertou! ${altar.guardianName} concede bênção: ${altar.buff}`);
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
    setRefugees((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, rescued: true } : r));
      const newlyRescuedTotal = next.filter((r) => r.rescued).length;

      if (newlyRescuedTotal >= 49) {
        setSurvival((s) => ({
          ...s,
          phase: 'fase3_revolta',
          axe: 100
        }));
        say('✦ TODOS OS 49 IRMÃOS RESGATADOS! Inicia a Fase 3: A Grande Revolta dos Engenhos!');
      } else {
        const found = next.find((r) => r.id === id);
        say(`Irmão liberto: ${found?.name} (${found?.title})! Total: ${newlyRescuedTotal}/49.`);
      }

      return next;
    });

    setSurvival((prev) => ({
      ...prev,
      axe: Math.min(100, prev.axe + 8)
    }));
    saveGame();
  };

  // Herbalism Actions
  const handleBrewTea = () => {
    setSurvival((prev) => {
      if (prev.inventory.arruda < 1 || prev.inventory.guine < 1) return prev;
      say('Chá de Arruda e Guiné preparado e ingerido! Miasmas purificados e Axé restaurado.');
      return {
        ...prev,
        miasmas: Math.max(0, prev.miasmas - 45),
        axe: Math.min(100, prev.axe + 25),
        inventory: {
          ...prev.inventory,
          arruda: prev.inventory.arruda - 1,
          guine: prev.inventory.guine - 1
        }
      };
    });
  };

  const handleTakeBath = () => {
    setSurvival((prev) => {
      if (prev.inventory.alecrim < 2 || prev.inventory.arruda < 1) return prev;
      say('Banho de Alecrim tomado! Todos os miasmas astrais foram purificados.');
      return {
        ...prev,
        miasmas: 0,
        axe: Math.min(100, prev.axe + 35),
        inventory: {
          ...prev.inventory,
          alecrim: prev.inventory.alecrim - 2,
          arruda: prev.inventory.arruda - 1
        }
      };
    });
  };

  const handleCookMeat = () => {
    setSurvival((prev) => {
      if (prev.inventory.meat < 1) return prev;
      say('Carne de caça assada na brasa! Fome e Vida revigoradas.');
      return {
        ...prev,
        hunger: Math.min(100, prev.hunger + 35),
        hp: Math.min(100, prev.hp + 18),
        inventory: {
          ...prev.inventory,
          meat: prev.inventory.meat - 1
        }
      };
    });
  };

  const handleCraftArrow = () => {
    setSurvival((prev) => {
      say('5 Flechas com ponta de pedra fabricadas!');
      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          arrows: prev.inventory.arrows + 5
        }
      };
    });
  };

  const handleCraftSpear = () => {
    setSurvival((prev) => {
      say('Lança de madeira talhada com sucesso!');
      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          spears: prev.inventory.spears + 1
        }
      };
    });
  };

  // Capoeira Learning
  const handleLearnSkill = (skill: 'ginga' | 'rasteira' | 'meiaLua') => {
    const cost = skill === 'ginga' ? 15 : skill === 'rasteira' ? 30 : 50;
    if (survival.axe < cost) {
      say(`Axé insuficiente para aprender este movimento (necessário ${cost}).`);
      return;
    }

    setSurvival((prev) => ({
      ...prev,
      axe: prev.axe - cost,
      capoeira: {
        ...prev.capoeira,
        [skill]: true,
        level: prev.capoeira.level + 1
      }
    }));
    say(`Movimento de Capoeira aprendido com sucesso: ${skill.toUpperCase()}!`);
  };

  // Launch Phase 3 Climax Offensive
  const handleLaunchOffensive = () => {
    setSurvival((prev) => {
      const nextProgress = Math.min(100, prev.revoltProgress + 35);
      if (nextProgress >= 100) {
        say('✦ VITÓRIA ABSOLUTA! Os engenhos foram tomados e todos os cativos libertados!');
        return { ...prev, revoltProgress: 100, phase: 'vitoria' };
      }
      say(`Ataque coordenado desferido! Engenhos sitiados (${nextProgress}%).`);
      return { ...prev, revoltProgress: nextProgress };
    });
  };

  // Reset Game
  const handleResetGame = () => {
    localStorage.removeItem(SAVE_KEY);
    window.location.reload();
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

      // ESC: Toggle Pause / Screen Resources Menu
      if (e.code === 'Escape') {
        setViewMode((prev) => (prev === 'game' ? 'pause' : 'game'));
        return;
      }

      if (e.code === 'KeyE') {
        interact();
      }

      if (e.code === 'Space') {
        handleAttack();
      }

      if (e.code === 'KeyF') {
        handleKick();
      }

      // Weapon switching 1, 2, 3, 4
      if (e.code === 'Digit1') {
        setSurvival((s) => ({ ...s, activeWeapon: 'capoeira' }));
        say(survival.torch ? 'Arma ativa: Capoeira (Chutes com os pés, tocha na mão)' : 'Arma ativa: Capoeira Ancestral (Mãos Livres / Ginga).');
      }
      if (e.code === 'Digit2') {
        setSurvival((s) => ({ ...s, activeWeapon: 'pedra' }));
        say('Arma ativa: Pedras de Arremesso (recurso infinito para distração).');
      }
      if (e.code === 'Digit3') {
        setSurvival((s) => ({ ...s, activeWeapon: 'lanca' }));
        say('Arma ativa: Lança Pesada.');
      }
      if (e.code === 'Digit4') {
        setSurvival((s) => ({ ...s, activeWeapon: 'arco' }));
        say('Arma ativa: Arco & Flechas.');
      }

      if (e.code === 'KeyT') {
        setSurvival((prev) => {
          const next = !prev.torch;
          say(next ? 'Tocha acesa (Mão direita ocupada · Chutes com os pés ativados).' : 'Tocha apagada (Mãos livres).');
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
  }, [interact, handleAttack, handleKick, say, currentRealmId]);

  // 1-second survival meters & environmental tick loop
  useEffect(() => {
    if (viewMode !== 'game') return;

    const timer = setInterval(() => {
      setSurvival((prev) => {
        let hp = prev.hp;
        let miasmas = prev.miasmas;
        const hunger = Math.max(0, prev.hunger - 0.22);
        const thirst = Math.max(0, prev.thirst - 0.28);

        // Health regen near fire
        const flame = currentRealm.entities.find((e) => e.kind === 'fire');
        if (flame && dist(player, flame) < 2.5 && hp < 100) {
          hp = Math.min(100, hp + 2.5);
          miasmas = Math.max(0, miasmas - 5);
        }

        // Enemy presence drains Axé / HP
        const kiumbaNear = currentRealm.entities.find(
          (e) => !e.isDead && e.enemyType === 'kiumba' && dist(player, e) < 3.5
        );
        if (kiumbaNear && !prev.torch) {
          miasmas = Math.min(100, miasmas + 5);
          hp = Math.max(0, hp - 2.0);
        }

        // Starvation damage
        if (hunger < 8 || thirst < 8) {
          hp = Math.max(0, hp - 2.5);
        }

        // Death / respawn handling
        if (hp <= 0) {
          const s = currentRealm.returnSpawn || currentRealm.spawn;
          setPlayer({ x: s.x, y: s.y, angle: s.angle });
          say('Você desfalece na escuridão e acorda junto ao fogo sagrado.');
          return {
            ...prev,
            hp: 45,
            hunger: 45,
            thirst: 45,
            miasmas: 0
          };
        }

        return {
          ...prev,
          hp,
          hunger,
          thirst,
          miasmas
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [viewMode, currentRealm, player, say]);

  // Counts
  const pointsOf = (r: Realm) => r.entities.filter((e) => e.countsAsPoint);
  const foundCount = Object.values(world).reduce(
    (n, r) => n + pointsOf(r).filter((e) => e.visited).length,
    0
  );
  const hereCount = pointsOf(currentRealm).filter((e) => e.visited).length;
  const rescuedCount = refugees.filter((r) => r.rescued).length;

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
        rescuedCount={rescuedCount}
        realmSafe={currentRealm.safe}
        onToggleTorch={() =>
          setSurvival((s) => {
            const next = !s.torch;
            say(next ? 'Tocha acesa (Mão direita ocupada · Chutes com os pés ativos).' : 'Tocha apagada (Mãos livres).');
            return { ...s, torch: next };
          })
        }
        onOpenLocalMap={() => {
          setInspectRealmId(currentRealmId);
          setFromAtlas(false);
          setViewMode('localMap');
        }}
        onOpenAtlas={() => setViewMode('atlas')}
        onToggleRadar={() => setSurvival((s) => ({ ...s, radar: !s.radar }))}
        onSelectWeapon={(w: WeaponType) => setSurvival((s) => ({ ...s, activeWeapon: w }))}
        onOpenHerbalism={() => setViewMode('herbs')}
        onOpenCapoeira={() => setViewMode('capoeira')}
        onOpenPhaseTracker={() => {
          if (survival.phase === 'fase1_fuga') setViewMode('prologue');
          else if (survival.phase === 'fase3_revolta' || survival.phase === 'vitoria') setViewMode('revolta');
          else setViewMode('refugees');
        }}
      />

      {/* Ticker Lore Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#0e0c0a] border-b border-[#2a2118] text-[11px] text-[#b7a48a]">
        <span className="truncate max-w-[70%]">
          {currentRealm.enterLine}
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setViewMode('pause')}
            className="text-[10px] text-[#ffd05b] hover:underline cursor-pointer"
          >
            [ESC] Menu / Pausa
          </button>
          <span className="hidden sm:inline-block font-mono text-[10px] text-[#e4c16a]">
            {currentRealm.safe ? 'Quilombo · Santuário' : `${hereCount}/9 pontos neste reino`}
          </span>
        </div>
      </div>

      {/* Main 2.5D Canvas Area */}
      <GameCanvas
        realm={currentRealm}
        player={player}
        state={survival}
        nearestEntity={nearestEntity}
        toast={toast}
        isAttacking={isAttacking}
        attackType={attackType}
        onInteract={interact}
        onAttack={handleAttack}
        onKick={handleKick}
        onToggleTorch={() =>
          setSurvival((s) => {
            const next = !s.torch;
            say(next ? 'Tocha acesa (Mão direita ocupada · Chutes ativos).' : 'Tocha apagada (Mãos livres).');
            return { ...s, torch: next };
          })
        }
        onOpenLocalMap={() => {
          setInspectRealmId(currentRealmId);
          setFromAtlas(false);
          setViewMode('localMap');
        }}
        onPlayerChange={setPlayer}
        onMovePlayer={handleMovePlayer}
      />

      {/* Footer */}
      <GameFooter
        currentRealmBlurb={currentRealm.blurb}
        foundPointsCount={foundCount}
        totalPointsCount={63}
      />

      {/* Pause Menu [ESC] */}
      {viewMode === 'pause' && (
        <PauseMenuModal
          state={survival}
          onClose={() => setViewMode('game')}
          onToggleRadar={() => setSurvival((s) => ({ ...s, radar: !s.radar }))}
          onToggleTorch={() =>
            setSurvival((s) => {
              const next = !s.torch;
              say(next ? 'Tocha acesa.' : 'Tocha apagada.');
              return { ...s, torch: next };
            })
          }
          onSelectWeapon={(w: WeaponType) => setSurvival((s) => ({ ...s, activeWeapon: w }))}
          onOpenView={(mode) => setViewMode(mode)}
          onResetGame={handleResetGame}
        />
      )}

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
          onTravelToRealm={(realmId) => travelTo(realmId)}
        />
      )}

      {viewMode === 'localMap' && (
        <LocalMapModal
          realm={world[inspectRealmId] || currentRealm}
          player={player}
          isCurrentRealm={inspectRealmId === currentRealmId}
          onClose={() => setViewMode('game')}
          onBackToAtlas={fromAtlas ? () => setViewMode('atlas') : undefined}
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

      {viewMode === 'herbs' && (
        <HerbalismModal
          inventory={survival.inventory}
          miasmas={survival.miasmas}
          onBrewTea={handleBrewTea}
          onTakeBath={handleTakeBath}
          onCookMeat={handleCookMeat}
          onCraftArrow={handleCraftArrow}
          onCraftSpear={handleCraftSpear}
          onClose={() => setViewMode('game')}
        />
      )}

      {viewMode === 'capoeira' && (
        <CapoeiraModal
          capoeira={survival.capoeira}
          axe={survival.axe}
          onLearnSkill={handleLearnSkill}
          onClose={() => setViewMode('game')}
        />
      )}

      {viewMode === 'prologue' && (
        <PrologueModal
          onStartEscape={() => {
            travelTo('calunga-grande');
            setViewMode('game');
          }}
          onClose={() => setViewMode('game')}
        />
      )}

      {viewMode === 'revolta' && (
        <RevoltaClimaxModal
          rescuedCount={rescuedCount}
          revoltProgress={survival.revoltProgress}
          onLaunchOffensive={handleLaunchOffensive}
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
