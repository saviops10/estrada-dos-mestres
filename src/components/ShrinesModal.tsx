import React from 'react';
import { Altar } from '../types/game';
import { X, Sparkles, Check, Gift } from 'lucide-react';

interface ShrinesModalProps {
  altars: Altar[];
  onMakeOffering: (altarId: string) => void;
  onClose: () => void;
}

export const ShrinesModal: React.FC<ShrinesModalProps> = ({
  altars,
  onMakeOffering,
  onClose
}) => {
  const activatedCount = altars.filter((a) => a.activated).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-[#0f0a14] border-2 border-[#8b6914] rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#171120] to-[#1a120c] border-b border-[#3a2e1c]">
          <div className="flex items-center gap-3">
            <span className="text-2xl text-[#79c5cb]">🪦</span>
            <div>
              <h2 className="text-lg font-bold text-[#e4c16a] tracking-wide font-serif">
                Altares Tutelares dos Mestres
              </h2>
              <p className="text-xs text-[#b7a48a]">
                4 Altares sagrados nos 4 cantos da cosmologia ({activatedCount}/4 Ativados)
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

        {/* List of Altars */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <p className="text-xs text-[#b7a48a] italic leading-relaxed">
            Faça oferendas rituais com ervas, frutos, tabaco e banhos aos quatro altares para despertar a bênção permanente dos Mestres tutelares.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {altars.map((altar) => {
              const progress = Math.min(100, Math.round((altar.offerings / altar.maxOfferings) * 100));

              return (
                <div
                  key={altar.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                    altar.activated
                      ? 'bg-gradient-to-br from-[#1c1912] to-[#17121b] border-[#e4c16a] shadow-lg'
                      : 'bg-[#14101a] border-[#382f42] hover:border-[#4a3b24]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{altar.symbol}</span>
                        <div>
                          <h3 className="font-bold text-sm text-[#f3ead7] font-serif">
                            {altar.name}
                          </h3>
                          <span className="text-[11px] text-[#e4c16a] font-medium">
                            {altar.power}
                          </span>
                        </div>
                      </div>

                      {altar.activated ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e4c16a]/20 text-[#e4c16a] border border-[#e4c16a]/50 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Ativo
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#b7a48a] font-mono">
                          {altar.offerings}/{altar.maxOfferings}
                        </span>
                      )}
                    </div>

                    <div className="my-2.5 p-2 rounded-lg bg-[#0b0810] border border-[#2c2236] text-[11px] space-y-1">
                      <div className="text-[#a8957c]">
                        <strong>Oferenda sagrada:</strong>{' '}
                        <span className="text-[#f3ead7]">{altar.offeringName}</span>
                      </div>
                      <div className="text-[#7cff6b] flex items-center gap-1 font-medium">
                        <Sparkles className="w-3 h-3 text-[#e4c16a]" />
                        Bênção: {altar.buff}
                      </div>
                    </div>

                    {/* Progress track */}
                    <div className="h-1.5 w-full bg-[#201828] rounded-full overflow-hidden my-2">
                      <div
                        className="h-full bg-gradient-to-r from-[#e4c16a] to-[#7cff6b] transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#2c2236] flex items-center justify-between gap-2">
                    <span className="text-[10px] text-[#7c6d5b]">
                      {altar.activated ? 'Bênção ativada na alma' : 'Oferendas necessárias: ' + (altar.maxOfferings - altar.offerings)}
                    </span>

                    {!altar.activated && (
                      <button
                        type="button"
                        onClick={() => onMakeOffering(altar.id)}
                        className="flex items-center gap-1 px-3 py-1 rounded-md bg-[#2d1f14] hover:bg-[#422e1c] text-[#ffe08a] border border-[#e4c16a]/60 text-xs font-medium transition-colors cursor-pointer"
                      >
                        <Gift className="w-3.5 h-3.5" />
                        <span>Fazer Oferenda</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
