import React from 'react';
import { SurvivalState } from '../types/game';
import { Flame, Compass, MapPin, Sparkles, Shield, Eye } from 'lucide-react';

interface HudBarProps {
  state: SurvivalState;
  foundCount: number;
  hereCount: number;
  realmSafe?: boolean;
  onToggleTorch: () => void;
  onOpenLocalMap: () => void;
  onOpenAtlas: () => void;
  onToggleRadar: () => void;
}

export const HudBar: React.FC<HudBarProps> = ({
  state,
  foundCount,
  hereCount,
  realmSafe,
  onToggleTorch,
  onOpenLocalMap,
  onOpenAtlas,
  onToggleRadar
}) => {
  const hpPercent = Math.max(0, Math.min(100, state.hp));
  const hungerPercent = Math.max(0, Math.min(100, state.hunger));
  const thirstPercent = Math.max(0, Math.min(100, state.thirst));
  const axePercent = Math.max(0, Math.min(100, state.axe));

  const axeLabel = state.axe >= 80 ? 'Axé Imbuído dos Mestres' : 'Axé Iluminado';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#100e0c]/95 border-b border-[#3a2e1c] text-xs shadow-md select-none">
      {/* Vital Meters */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        {/* HP */}
        <div className="min-w-[110px]">
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
        <div className="min-w-[110px]">
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
        <div className="min-w-[110px]">
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
          title="Ligar/Desligar Radar no canto do jogo"
        >
          <Eye className="w-3 h-3" />
          <span>Radar</span>
        </button>

        {/* Counter Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#16120e] border border-[#e4c16a]/50 text-[#e4c16a] font-medium">
          <MapPin className="w-3.5 h-3.5 text-[#e4c16a]" />
          <span>
            {realmSafe
              ? `Pontos ${foundCount}/63 · Zona Segura`
              : `Pontos ${foundCount}/63 · Aqui ${hereCount}/9`}
          </span>
        </div>
      </div>
    </div>
  );
};
