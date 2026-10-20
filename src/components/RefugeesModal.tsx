import React, { useState } from 'react';
import { Refugee } from '../types/game';
import { X, CheckCircle2, UserCheck, Heart } from 'lucide-react';

interface RefugeesModalProps {
  refugees: Refugee[];
  onRescueRefugee: (id: string) => void;
  onClose: () => void;
}

const KINGDOM_NAMES = [
  'Encruzilhadas',
  'Cruzeiros',
  'Matas',
  'Calunga Grande',
  'Calunga Pequena',
  'Lira',
  'Almas'
];

export const RefugeesModal: React.FC<RefugeesModalProps> = ({
  refugees,
  onRescueRefugee,
  onClose
}) => {
  const [selectedKingdom, setSelectedKingdom] = useState<number>(0);

  const rescuedCount = refugees.filter((r) => r.rescued).length;
  const progressPercent = Math.round((rescuedCount / refugees.length) * 100);

  const kingdomRefugees = refugees.filter((r) => r.kingdomIndex === selectedKingdom);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#0f0a14] border-2 border-[#8b6914] rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#171120] to-[#1a120c] border-b border-[#3a2e1c]">
          <div className="flex items-center gap-3">
            <span className="text-2xl text-[#e4c16a]">🕊️</span>
            <div>
              <h2 className="text-lg font-bold text-[#e4c16a] tracking-wide font-serif">
                Resgate dos 49 Irmãos Foragidos
              </h2>
              <p className="text-xs text-[#b7a48a]">
                49 irmãos foragidos nos 7 Reinos ({rescuedCount}/49 resgatados · {progressPercent}%)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#b7a48a] hover:text-[#e4c16a] hover:bg-[#251d14] border border-[#4a3b24] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overall Progress */}
        <div className="px-5 py-2.5 bg-[#14101b] border-b border-[#3a2e1c]">
          <div className="flex justify-between items-center text-xs text-[#b7a48a] mb-1.5">
            <span>Progresso da Libertação</span>
            <span className="font-mono text-[#e4c16a]">{rescuedCount} de 49</span>
          </div>
          <div className="h-2 w-full bg-[#201828] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#e4c16a] via-[#ff8a3d] to-[#7cff6b] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Tabs for Kingdoms */}
        <div className="flex overflow-x-auto gap-1 px-4 py-2 bg-[#0c0912] border-b border-[#3a2e1c] scrollbar-thin">
          {KINGDOM_NAMES.map((name, idx) => {
            const countInK = refugees.filter((r) => r.kingdomIndex === idx && r.rescued).length;
            const isSelected = selectedKingdom === idx;

            return (
              <button
                key={name}
                type="button"
                onClick={() => setSelectedKingdom(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#2b1f14] text-[#e4c16a] border border-[#e4c16a]/60 shadow-sm'
                    : 'text-[#b7a48a] hover:text-[#f3ead7] hover:bg-[#1a1422] border border-transparent'
                }`}
              >
                <span>{name}</span>
                <span className="text-[10px] font-mono opacity-80">({countInK}/7)</span>
              </button>
            );
          })}
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {kingdomRefugees.map((refugee) => (
              <div
                key={refugee.id}
                className={`p-3 rounded-lg border flex items-center justify-between gap-3 transition-all ${
                  refugee.rescued
                    ? 'bg-[#1a1912] border-[#8b6914] text-[#f3ead7]'
                    : 'bg-[#15111c] border-[#2c2436] text-[#b7a48a] hover:border-[#4a3b24]'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <strong className="text-xs text-[#f3ead7] truncate">
                      {refugee.name}
                    </strong>
                    {refugee.rescued && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#7cff6b] shrink-0" />
                    )}
                  </div>
                  <div className="text-[11px] text-[#e4c16a] truncate mt-0.5">
                    {refugee.title}
                  </div>
                  <div className="text-[10px] text-[#7c6d5b] mt-0.5 font-mono">
                    ID: {refugee.id}
                  </div>
                </div>

                <div>
                  {refugee.rescued ? (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[#7cff6b]/10 text-[#7cff6b] border border-[#7cff6b]/30">
                      Resgatado
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onRescueRefugee(refugee.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#271d15] hover:bg-[#3b2a1a] text-[#ffe08a] border border-[#e4c16a]/50 text-xs transition-colors cursor-pointer"
                    >
                      <Heart className="w-3 h-3 text-[#ff8a3d]" />
                      <span>Resgatar</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
