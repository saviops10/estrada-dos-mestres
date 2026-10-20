import React from 'react';
import { SurvivalState, WeaponType } from '../types/game';
import { Flame, Compass, Sparkles, Shield, Eye, Swords, Leaf } from 'lucide-react';

interface HudBarProps {
  state: SurvivalState;
  foundCount: number;
  hereCount: number;
  rescuedCount: number;
  realmSafe?: boolean;
  onToggleTorch: () => void;
  onOpenLocalMap: () => void;
  onOpenAtlas: () => void;
  onToggleRadar: () => void;
  onSelectWeapon: (weapon: WeaponType) => void;
  onOpenHerbalism: () => void;
  onOpenCapoeira: () => void;
  onOpenPhaseTracker: () => void;
}

export const HudBar: React.FC<HudBarProps> = ({
  state,
  foundCount,
  hereCount,
  rescuedCount,
  realmSafe,
  onToggleTorch,
  onOpenLocalMap,
  onOpenAtlas,
  onToggleRadar,
  onSelectWeapon,
  onOpenHerbalism,
  onOpenCapoeira,
  onOpenPhaseTracker
}) => {
  const hpPercent = Math.max(0, Math.min(100, state.hp));
  const hungerPercent = Math.max(0, Math.min(100, state.hunger));
  const thirstPercent = Math.max(0, Math.min(100, state.thirst));
  const axePercent = Math.max(0, Math.min(100, state.axe));

  const axeLabel = state.axe >= 80 ? 'Axé Imbuído dos Mestres' : 'Axé Iluminado';

  const phaseLabel =
    state.phase === 'fase1_fuga'
      ? 'Fase 1: Fuga & Estabelecer Quilombo'
      : state.phase === 'fase2_libertacao'
      ? `Fase 2: Libertação (${rescuedCount}/49)`
      : state.phase === 'fase3_revolta'
      ? 'Fase 3: A Grande Revolta dos Engenhos!'
      : 'Vitória: Terra Livre';

  return (
    <div className="flex flex-col bg-[#100e0c]/95 border-b border-[#3a2e1c] text-xs shadow-md select-none">
      {/* Top Section: Phase banner & Quick shortcuts */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#17121b] border-b border-[#2c2236] text-[11px]">
        {/* Campaign Phase Badge */}
        <button
          type="button"
          onClick={onOpenPhaseTracker}
          className="flex items-center gap-1.5 text-[#ffd05b] hover:text-[#fff] transition-colors cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-[#e4c16a] animate-ping" />
          <strong className="font-serif">{phaseLabel}</strong>
        </button>

        {/* Weapons Switch Bar */}
        <div className="flex items-center gap-1">
          <span className="text-[#8e7f6e] mr-1 hidden sm:inline-block">Arma:</span>

          <button
            type="button"
            onClick={() => onSelectWeapon('capoeira')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
              state.activeWeapon === 'capoeira'
                ? 'bg-[#3b2a16] text-[#ffd05b] border-[#e4c16a]'
                : 'bg-[#18131e] text-[#a8957c] border-[#382f42] hover:border-[#685570]'
            }`}
            title="Capoeira Ancestral (Mãos Livres / Ginga / Rasteira) [Tecla 1]"
          >
            🥋 Capoeira [1]
          </button>

          <button
            type="button"
            onClick={() => onSelectWeapon('pedra')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
              state.activeWeapon === 'pedra'
                ? 'bg-[#3b2a16] text-[#ffd05b] border-[#e4c16a]'
                : 'bg-[#18131e] text-[#a8957c] border-[#382f42] hover:border-[#685570]'
            }`}
            title="Arremesso de Pedras (Infinito do chão) [Tecla 2]"
          >
            🪨 Pedras [2]
          </button>

          <button
            type="button"
            onClick={() => onSelectWeapon('lanca')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
              state.activeWeapon === 'lanca'
                ? 'bg-[#3b2a16] text-[#ffd05b] border-[#e4c16a]'
                : 'bg-[#18131e] text-[#a8957c] border-[#382f42] hover:border-[#685570]'
            }`}
            title={`Lança Pesada (${state.inventory.spears} disponíveis) [Tecla 3]`}
          >
            🗡️ Lança ({state.inventory.spears}) [3]
          </button>

          <button
            type="button"
            onClick={() => onSelectWeapon('arco')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
              state.activeWeapon === 'arco'
                ? 'bg-[#3b2a16] text-[#ffd05b] border-[#e4c16a]'
                : 'bg-[#18131e] text-[#a8957c] border-[#382f42] hover:border-[#685570]'
            }`}
            title={`Arco & Flechas (${state.inventory.arrows} flechas) [Tecla 4]`}
          >
            🏹 Arco ({state.inventory.arrows}) [4]
          </button>
        </div>

        {/* Action drawers */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenHerbalism}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#18261e] hover:bg-[#23382c] text-[#a8c47c] border border-[#3e6b4a] transition-colors cursor-pointer"
            title="Abrir Ervanária & Preparo de Chás/Banhos"
          >
            <Leaf className="w-3 h-3" />
            <span>Ervas ({state.inventory.arruda + state.inventory.guine + state.inventory.alecrim})</span>
          </button>

          <button
            type="button"
            onClick={onOpenCapoeira}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#2a1e16] hover:bg-[#3d2c20] text-[#ffd05b] border border-[#8b6914] transition-colors cursor-pointer"
            title="Treino de Capoeira no Quilombo"
          >
            <Swords className="w-3 h-3" />
            <span>Capoeira</span>
          </button>
        </div>
      </div>

      {/* Main Meters & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2">
        {/* Vital Meters */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          {/* HP */}
          <div className="min-w-[105px]">
            <div className="flex justify-between items-center text-[#b7a48a] mb-1">
              <span className="font-medium text-[#ffd0dc]">Vida</span>
              <span className="font-mono text-[11px] text-[#f3ead7]">{Math.round(hpPercent)}</span>
            </div>
            <div className="h-2 w-full bg-[#2a241c] rounded-full overflow-hidden border border-[#4a3b24]/40">
              <div
                className="h-full bg-gradient-to-r from-[#ff5f8a] to-[#ffd0dc] transition-all duration-300"
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>

          {/* Fome */}
          <div className="min-w-[105px]">
            <div className="flex justify-between items-center text-[#b7a48a] mb-1">
              <span className="font-medium text-[#ffe08a]">Fome</span>
              <span className="font-mono text-[11px] text-[#f3ead7]">{Math.round(hungerPercent)}%</span>
            </div>
            <div className="h-2 w-full bg-[#2a241c] rounded-full overflow-hidden border border-[#4a3b24]/40">
              <div
                className="h-full bg-gradient-to-r from-[#ff8a3d] to-[#ffe08a] transition-all duration-300"
                style={{ width: `${hungerPercent}%` }}
              />
            </div>
          </div>

          {/* Sede */}
          <div className="min-w-[105px]">
            <div className="flex justify-between items-center text-[#b7a48a] mb-1">
              <span className="font-medium text-[#9be7ff]">Sede</span>
              <span className="font-mono text-[11px] text-[#f3ead7]">{Math.round(thirstPercent)}%</span>
            </div>
            <div className="h-2 w-full bg-[#2a241c] rounded-full overflow-hidden border border-[#4a3b24]/40">
              <div
                className="h-full bg-gradient-to-r from-[#3d8dff] to-[#9be7ff] transition-all duration-300"
                style={{ width: `${thirstPercent}%` }}
              />
            </div>
          </div>

          {/* Axé */}
          <div className="min-w-[125px]">
            <div className="flex justify-between items-center text-[#b7a48a] mb-1">
              <span className="font-medium text-[#7cff6b] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#e4c16a]" />
                {axeLabel}
              </span>
              <span className="font-mono text-[11px] text-[#f3ead7]">{Math.round(axePercent)}</span>
            </div>
            <div className="h-2 w-full bg-[#2a241c] rounded-full overflow-hidden border border-[#4a3b24]/40">
              <div
                className="h-full bg-gradient-to-r from-[#7cff6b] via-[#e4c16a] to-[#fff1a8] transition-all duration-300"
                style={{ width: `${axePercent}%` }}
              />
            </div>
          </div>

          {/* Miasma alert pill if infected */}
          {state.miasmas > 0 && (
            <div className="min-w-[90px]">
              <div className="flex justify-between items-center text-[#e0b0ff] mb-1">
                <span className="font-medium text-[10px]">Miasma</span>
                <span className="font-mono text-[10px] text-[#ff8aff]">{Math.round(state.miasmas)}%</span>
              </div>
              <div className="h-2 w-full bg-[#2a1433] rounded-full overflow-hidden border border-[#5e1f70]">
                <div
                  className="h-full bg-gradient-to-r from-[#8b24a3] to-[#e052ff] transition-all duration-300"
                  style={{ width: `${Math.min(100, state.miasmas)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenLocalMap}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1c1814] hover:bg-[#2c241c] text-[#f3ead7] border border-[#4a3b24] hover:border-[#e4c16a] transition-colors cursor-pointer"
            title="Ver mapa local 2D [Tecla M]"
          >
            <Compass className="w-3.5 h-3.5 text-[#e4c16a]" />
            <span>Mapa Local [M]</span>
          </button>

          <button
            type="button"
            onClick={onToggleTorch}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
              state.torch
                ? 'bg-[#3a2814] text-[#ffe08a] border-[#e4c16a]'
                : 'bg-[#1c1814] text-[#b7a48a] border-[#4a3b24] hover:border-[#8b6914]'
            }`}
            title="Acender ou apagar tocha [Tecla T]"
          >
            <Flame className={`w-3.5 h-3.5 ${state.torch ? 'text-[#ff9800] animate-pulse' : 'text-[#776856]'}`} />
            <span>{state.torch ? 'Tocha Acesa' : 'Tocha Apagada'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleRadar}
            className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] transition-colors cursor-pointer ${
              state.radar
                ? 'bg-[#18241e] text-[#a8c47c] border-[#3e6b4a]'
                : 'bg-[#1c1814] text-[#776856] border-[#4a3b24]'
            }`}
            title="Ligar/Desligar Radar"
          >
            <Eye className="w-3 h-3" />
            <span>Radar</span>
          </button>

          {/* Rescued Brothers Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#16120e] border border-[#e4c16a]/50 text-[#e4c16a] font-medium">
            <span>
              {realmSafe
                ? `Pontos ${foundCount}/63 · Resgatados ${rescuedCount}/49`
                : `Pontos ${foundCount}/63 · Aqui ${hereCount}/9`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
