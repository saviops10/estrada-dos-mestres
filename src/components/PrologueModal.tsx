import React from 'react';
import { X, Sparkles, Compass } from 'lucide-react';

interface PrologueModalProps {
  onStartEscape: () => void;
  onClose: () => void;
}

export const PrologueModal: React.FC<PrologueModalProps> = ({
  onStartEscape,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-lg animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-[#0c0812] border-2 border-[#8b6914] rounded-2xl shadow-[0_0_50px_rgba(212,175,55,0.2)] overflow-hidden flex flex-col">
        {/* Banner with dark evocative slave ship atmosphere */}
        <div className="relative p-6 bg-gradient-to-b from-[#1a100a] via-[#100914] to-[#0c0812] border-b border-[#3a2e1c]">
          <span className="text-3xl mb-2 inline-block">🚢 ⚓</span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#e4c16a] font-serif tracking-wider">
            O Despertar na Caravela Negreira
          </h2>
          <p className="text-xs text-[#a8957c] mt-1 font-mono">
            Prólogo · Litoral do Brasil Pré-Colonial · A Travessia
          </p>
        </div>

        {/* Narrative Text */}
        <div className="p-6 space-y-4 text-xs sm:text-sm text-[#d4c6b2] leading-relaxed overflow-y-auto max-h-[60vh]">
          <p>
            Na escuridão claustrofóbica do porão do navio negreiro, o cheiro de maresia e suor impregna cada tábua de madeira. Amarrado e exausto pelas semanas de oceano bravio, você adormece em desespero.
          </p>
          <div className="p-3.5 rounded-xl bg-[#17101f] border border-[#3e2e4f] text-[#f4d7ff] italic space-y-2">
            <p className="font-semibold text-[#e4c16a] flex items-center gap-1.5 not-italic">
              <Sparkles className="w-4 h-4 text-[#ffd05b]" />
              A Voz dos Ancestrais no Sonho Premonitório:
            </p>
            <p>
              “Filho da terra livre! Não te curvas à corrente. Quando o navio encostar no litoral, o mar se agitará e as matas te chamarão. Tranca-Rua abrirá o caminho, Quebra Galho te ocultará e a Capoeira te fará vento. Foge e funda o Quilombo dos 49!”
            </p>
          </div>
          <p>
            O casco range contra a areia da costa da Calunga Grande. No tumulto dos marinheiros que descarregam os fardos sob a névoa matinal, você rompe as amarras, salta pelas águas revoltas e corre em direção à Mata Atlântica!
          </p>
          <div className="p-3 rounded-lg bg-[#1a140e] border border-[#4a3b24] text-[11px] text-[#e4c16a] space-y-1">
            <strong>Missão da Fase 1:</strong>
            <p>
              Sobreviva aos primeiros momentos na mata, cace para saciar a fome, colete pedras e alcance a segurança sagrada do Quilombo Central.
            </p>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="p-4 bg-[#120d18] border-t border-[#3a2e1c] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-xs text-[#b7a48a] hover:text-[#f3ead7] transition-colors cursor-pointer"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={onStartEscape}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8b6914] to-[#e4c16a] text-[#120a04] font-bold text-xs sm:text-sm tracking-wide shadow-lg hover:brightness-110 active:scale-98 transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Iniciar Fuga para a Mata!</span>
          </button>
        </div>
      </div>
    </div>
  );
};
