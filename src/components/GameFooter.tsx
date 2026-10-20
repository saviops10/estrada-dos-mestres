import React from 'react';

interface GameFooterProps {
  currentRealmBlurb: string;
  foundPointsCount: number;
  totalPointsCount: number;
}

export const GameFooter: React.FC<GameFooterProps> = ({
  currentRealmBlurb,
  foundPointsCount,
  totalPointsCount
}) => {
  return (
    <footer className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-2 bg-[#100e0c] border-t border-[#3a2e1c] text-xs text-[#b7a48a] select-none">
      {/* Lore Diary */}
      <div className="flex items-center gap-2">
        <span className="text-[#e4c16a] font-serif font-semibold">
          Diário:
        </span>
        <span className="italic text-[#f3ead7]">
          {foundPointsCount} de {totalPointsCount} pontos reconhecidos · {currentRealmBlurb}
        </span>
      </div>

      {/* Controls helper */}
      <div className="flex items-center gap-2 text-[11px] text-[#7c6d5b]">
        <span>
          <kbd className="px-1.5 py-0.5 rounded bg-[#1c1814] border border-[#4a3b24] text-[#e4c16a] font-mono text-[10px]">
            WASD
          </kbd>{' '}
          andar
        </span>
        <span>·</span>
        <span>
          <kbd className="px-1.5 py-0.5 rounded bg-[#1c1814] border border-[#4a3b24] text-[#e4c16a] font-mono text-[10px]">
            E
          </kbd>{' '}
          agir
        </span>
        <span>·</span>
        <span>
          <kbd className="px-1.5 py-0.5 rounded bg-[#1c1814] border border-[#4a3b24] text-[#e4c16a] font-mono text-[10px]">
            M
          </kbd>{' '}
          mapa local
        </span>
        <span>·</span>
        <span>
          <kbd className="px-1.5 py-0.5 rounded bg-[#1c1814] border border-[#4a3b24] text-[#e4c16a] font-mono text-[10px]">
            T
          </kbd>{' '}
          tocha
        </span>
      </div>
    </footer>
  );
};
