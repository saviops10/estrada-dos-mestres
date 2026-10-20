import React from 'react';
import { Realm, ViewMode } from '../types/game';
import { Compass, Map, Shield, Users, Sparkles, BookOpen } from 'lucide-react';

interface GameHeaderProps {
  currentRealm: Realm;
  onOpenView: (mode: ViewMode) => void;
  activeMode: ViewMode;
  onResetGame?: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  currentRealm,
  onOpenView,
  activeMode
}) => {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-[#100e0c] border-b border-[#3a2e1c] select-none shadow-sm">
      {/* Brand & Realm badge */}
      <div className="flex items-center gap-2 sm:gap-3">
        <h1 className="font-bold text-base sm:text-lg text-[#e4c16a] tracking-wider font-serif flex items-center gap-2">
          <span>Estrada dos Mestres</span>
        </h1>
        <span className="hidden sm:inline-block text-[#3a2e1c]">|</span>
        <span className="text-xs text-[#b7a48a] font-medium bg-[#191410] px-2 py-0.5 rounded border border-[#3a2e1c]">
          {currentRealm.name} · <span className="text-[#e4c16a]">1ª pessoa</span>
        </span>
      </div>

      {/* Navigation Buttons */}
      <nav className="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => onOpenView('game')}
          className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
            activeMode === 'game'
              ? 'bg-[#3a2b16] text-[#ffd05b] border-[#e4c16a]'
              : 'bg-[#1c1814] text-[#f3ead7] border-[#4a3b24] hover:border-[#e4c16a]'
          }`}
        >
          Jogo
        </button>

        <button
          type="button"
          onClick={() => onOpenView('reinos')}
          className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#1c1814] text-[#f3ead7] border border-[#4a3b24] hover:border-[#e4c16a] transition-colors cursor-pointer"
        >
          Reinos
        </button>

        <button
          type="button"
          onClick={() => onOpenView('pontos')}
          className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#1c1814] text-[#f3ead7] border border-[#4a3b24] hover:border-[#e4c16a] transition-colors cursor-pointer"
        >
          Pontos
        </button>

        <button
          type="button"
          onClick={() => onOpenView('altares')}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-[#1c1814] text-[#79c5cb] border border-[#4a3b24] hover:border-[#79c5cb] transition-colors cursor-pointer"
          title="Altares Tutelares e Oferendas"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Altares</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenView('refugees')}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-[#1c1814] text-[#ffd0dc] border border-[#4a3b24] hover:border-[#ffd0dc] transition-colors cursor-pointer"
          title="Resgate dos 49 Irmãos Foragidos"
        >
          <Users className="w-3.5 h-3.5" />
          <span>Resgate</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenView('atlas')}
          className="flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold bg-gradient-to-r from-[#2c1d10] to-[#3a2912] text-[#e4c16a] border border-[#e4c16a] hover:brightness-110 transition-all cursor-pointer shadow-sm"
        >
          <Map className="w-3.5 h-3.5 text-[#e4c16a]" />
          <span>Atlas Múndi</span>
        </button>
      </nav>
    </header>
  );
};
