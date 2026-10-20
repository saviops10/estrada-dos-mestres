import React from 'react';
import { CapoeiraSkills } from '../types/game';
import { X, Shield, Swords, Sparkles, Award } from 'lucide-react';

interface CapoeiraModalProps {
  capoeira: CapoeiraSkills;
  axe: number;
  onLearnSkill: (skill: 'ginga' | 'rasteira' | 'meiaLua') => void;
  onClose: () => void;
}

export const CapoeiraModal: React.FC<CapoeiraModalProps> = ({
  capoeira,
  axe,
  onLearnSkill,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-[#0f0a14] border-2 border-[#8b6914] rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#171120] to-[#1a120c] border-b border-[#3a2e1c]">
          <div className="flex items-center gap-3">
            <span className="text-2xl text-[#e4c16a]">🥋</span>
            <div>
              <h2 className="text-lg font-bold text-[#e4c16a] tracking-wide font-serif">
                Roda de Capoeira Ancestral
              </h2>
              <p className="text-xs text-[#b7a48a]">
                Treinamento corporal e espiritual com os Mestres no Quilombo
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

        {/* Intro Lore */}
        <div className="p-4 bg-[#14101b] border-b border-[#3a2e1c] text-xs text-[#b7a48a] leading-relaxed">
          <p className="italic">
            “O cativo não nasce guerreiro; mas na roda do Quilombo, ao som do berimbau, seu corpo aprende a dança da luta e a malícia que desequilibra as armas de fogo e espadas dos capitães do mato.”
          </p>
          <div className="mt-2 flex items-center justify-between text-[#e4c16a] font-medium">
            <span>Nível de Mestria: Nível {capoeira.level}</span>
            <span className="font-mono text-xs">Axé Disponível: {Math.round(axe)}</span>
          </div>
        </div>

        {/* Moves List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Ginga */}
          <div className="p-3.5 rounded-xl bg-[#14101a] border border-[#3a2e1c] flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#7cff6b]" />
                <h3 className="font-bold text-xs text-[#f3ead7]">
                  A Ginga Ancestral
                </h3>
                {capoeira.ginga && (
                  <span className="text-[10px] text-[#7cff6b] font-medium bg-[#7cff6b]/10 px-1.5 py-0.5 rounded border border-[#7cff6b]/30">
                    Dominada
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#b7a48a] mt-1">
                Movimentação ritmada contínua que esquiva de 25% dos ataques e reduz o cansaço na corrida.
              </p>
            </div>
            {!capoeira.ginga ? (
              <button
                type="button"
                onClick={() => onLearnSkill('ginga')}
                className="px-3 py-1.5 rounded-lg bg-[#271d15] hover:bg-[#3b2a1a] text-[#ffe08a] border border-[#e4c16a]/60 text-xs font-medium transition-colors cursor-pointer"
              >
                Aprender (15 Axé)
              </button>
            ) : (
              <span className="text-xs text-[#7cff6b] font-mono">Ativa</span>
            )}
          </div>

          {/* Rasteira */}
          <div className="p-3.5 rounded-xl bg-[#14101a] border border-[#3a2e1c] flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Swords className="w-4 h-4 text-[#ffd05b]" />
                <h3 className="font-bold text-xs text-[#f3ead7]">
                  Rasteira de Derrubada
                </h3>
                {capoeira.rasteira && (
                  <span className="text-[10px] text-[#7cff6b] font-medium bg-[#7cff6b]/10 px-1.5 py-0.5 rounded border border-[#7cff6b]/30">
                    Dominada
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#b7a48a] mt-1">
                Golpe rasteiro nos pés do oponente que desequilibra capitães armados e desarma espadas.
              </p>
            </div>
            {!capoeira.rasteira ? (
              <button
                type="button"
                onClick={() => onLearnSkill('rasteira')}
                disabled={!capoeira.ginga}
                className="px-3 py-1.5 rounded-lg bg-[#271d15] hover:bg-[#3b2a1a] disabled:opacity-40 disabled:cursor-not-allowed text-[#ffe08a] border border-[#e4c16a]/60 text-xs font-medium transition-colors cursor-pointer"
              >
                Aprender (30 Axé)
              </button>
            ) : (
              <span className="text-xs text-[#7cff6b] font-mono">Ativa</span>
            )}
          </div>

          {/* Meia-Lua de Compasso */}
          <div className="p-3.5 rounded-xl bg-[#14101a] border border-[#3a2e1c] flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#ff5f8a]" />
                <h3 className="font-bold text-xs text-[#f3ead7]">
                  Meia-Lua de Compasso
                </h3>
                {capoeira.meiaLua && (
                  <span className="text-[10px] text-[#7cff6b] font-medium bg-[#7cff6b]/10 px-1.5 py-0.5 rounded border border-[#7cff6b]/30">
                    Dominada
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#b7a48a] mt-1">
                Chute giratório apoiado no chão que desfere dano crítico devastador em combate corpo a corpo.
              </p>
            </div>
            {!capoeira.meiaLua ? (
              <button
                type="button"
                onClick={() => onLearnSkill('meiaLua')}
                disabled={!capoeira.rasteira}
                className="px-3 py-1.5 rounded-lg bg-[#271d15] hover:bg-[#3b2a1a] disabled:opacity-40 disabled:cursor-not-allowed text-[#ffe08a] border border-[#e4c16a]/60 text-xs font-medium transition-colors cursor-pointer"
              >
                Aprender (50 Axé)
              </button>
            ) : (
              <span className="text-xs text-[#7cff6b] font-mono">Ativa</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
