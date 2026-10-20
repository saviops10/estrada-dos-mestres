import React from 'react';
import { Inventory } from '../types/game';
import { X, Sparkles, Flame, Coffee, Shield, Package } from 'lucide-react';

interface HerbalismModalProps {
  inventory: Inventory;
  miasmas: number;
  onBrewTea: () => void;
  onTakeBath: () => void;
  onCookMeat: () => void;
  onCraftArrow: () => void;
  onCraftSpear: () => void;
  onClose: () => void;
}

export const HerbalismModal: React.FC<HerbalismModalProps> = ({
  inventory,
  miasmas,
  onBrewTea,
  onTakeBath,
  onCookMeat,
  onCraftArrow,
  onCraftSpear,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-[#0f0a14] border-2 border-[#8b6914] rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#171120] to-[#1a120c] border-b border-[#3a2e1c]">
          <div className="flex items-center gap-3">
            <span className="text-2xl text-[#a8c47c]">🌿</span>
            <div>
              <h2 className="text-lg font-bold text-[#e4c16a] tracking-wide font-serif">
                Ervanária & Recursos Ancestrais
              </h2>
              <p className="text-xs text-[#b7a48a]">
                Ervas sagradas, preparo de chás, banhos contra miasmas e mantimentos
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

        {/* Miasma Warning Bar if infected */}
        {miasmas > 0 && (
          <div className="px-5 py-2.5 bg-[#250d2e] border-b border-[#5e1f70] flex items-center justify-between text-xs text-[#f3ead7]">
            <span className="flex items-center gap-1.5 text-[#ff8aff] font-medium">
              <Sparkles className="w-4 h-4 text-[#ff5f8a]" />
              Contaminação por Miasmas Astrais: {Math.round(miasmas)}%
            </span>
            <span className="text-[11px] text-[#e0b0ff]">
              Tome um Banho de Alecrim ou beba Chá de Arruda para purificar!
            </span>
          </div>
        )}

        {/* Resources Grid */}
        <div className="p-4 border-b border-[#3a2e1c] bg-[#14101b]">
          <div className="text-xs font-semibold text-[#e4c16a] mb-2 flex items-center gap-1.5">
            <Package className="w-4 h-4" /> Suprimentos Coletados
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-[#1c1724] border border-[#382f42] flex justify-between items-center">
              <span>🌿 Arruda</span>
              <strong className="text-[#a8c47c] font-mono">{inventory.arruda}</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-[#1c1724] border border-[#382f42] flex justify-between items-center">
              <span>🌱 Guiné</span>
              <strong className="text-[#a8c47c] font-mono">{inventory.guine}</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-[#1c1724] border border-[#382f42] flex justify-between items-center">
              <span>🌾 Alecrim</span>
              <strong className="text-[#a8c47c] font-mono">{inventory.alecrim}</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-[#1c1724] border border-[#382f42] flex justify-between items-center">
              <span>🥩 Carne de Caça</span>
              <strong className="text-[#ff8a3d] font-mono">{inventory.meat}</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-[#1c1724] border border-[#382f42] flex justify-between items-center">
              <span>🏹 Flechas</span>
              <strong className="text-[#ffd05b] font-mono">{inventory.arrows}</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-[#1c1724] border border-[#382f42] flex justify-between items-center">
              <span>🗡️ Lanças</span>
              <strong className="text-[#ffd05b] font-mono">{inventory.spears}</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-[#1c1724] border border-[#382f42] flex justify-between items-center col-span-2">
              <span>🪨 Pedras de Arremesso</span>
              <strong className="text-[#7cff6b] font-mono">Infinito (chão)</strong>
            </div>
          </div>
        </div>

        {/* Preparation & Ritual Crafting */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Chá de Arruda e Guiné */}
          <div className="p-3.5 rounded-xl bg-[#14101a] border border-[#3a2e1c] flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Coffee className="w-4 h-4 text-[#a8c47c]" />
                <h3 className="font-bold text-xs text-[#f3ead7]">
                  Chá de Arruda & Guiné
                </h3>
              </div>
              <p className="text-[11px] text-[#b7a48a] mt-1">
                Dissipa 40% dos miasmas astrais e recupera 25 pontos de Axé.
              </p>
              <span className="text-[10px] text-[#e4c16a]">
                Requer: 1 Arruda + 1 Guiné
              </span>
            </div>
            <button
              type="button"
              onClick={onBrewTea}
              disabled={inventory.arruda < 1 || inventory.guine < 1}
              className="px-3 py-1.5 rounded-lg bg-[#271d15] hover:bg-[#3b2a1a] disabled:opacity-40 disabled:cursor-not-allowed text-[#ffe08a] border border-[#e4c16a]/60 text-xs font-medium transition-colors cursor-pointer"
            >
              Preparar Chá
            </button>
          </div>

          {/* Banho de Descarrego */}
          <div className="p-3.5 rounded-xl bg-[#14101a] border border-[#3a2e1c] flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#79c5cb]" />
                <h3 className="font-bold text-xs text-[#f3ead7]">
                  Banho Sagrado de Alecrim & Macassá
                </h3>
              </div>
              <p className="text-[11px] text-[#b7a48a] mt-1">
                Purifica 100% dos miasmas e concede escudo espiritual contra Kiumbas.
              </p>
              <span className="text-[10px] text-[#e4c16a]">
                Requer: 2 Alecrim + 1 Arruda
              </span>
            </div>
            <button
              type="button"
              onClick={onTakeBath}
              disabled={inventory.alecrim < 2 || inventory.arruda < 1}
              className="px-3 py-1.5 rounded-lg bg-[#18282b] hover:bg-[#233a3e] disabled:opacity-40 disabled:cursor-not-allowed text-[#9be7ff] border border-[#79c5cb]/60 text-xs font-medium transition-colors cursor-pointer"
            >
              Tomar Banho
            </button>
          </div>

          {/* Assar Carne */}
          <div className="p-3.5 rounded-xl bg-[#14101a] border border-[#3a2e1c] flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#ff8a3d]" />
                <h3 className="font-bold text-xs text-[#f3ead7]">
                  Assar Carne de Caça na Brasa
                </h3>
              </div>
              <p className="text-[11px] text-[#b7a48a] mt-1">
                Restaura 35% de Fome e 15 de Vida (HP).
              </p>
              <span className="text-[10px] text-[#e4c16a]">
                Requer: 1 Carne
              </span>
            </div>
            <button
              type="button"
              onClick={onCookMeat}
              disabled={inventory.meat < 1}
              className="px-3 py-1.5 rounded-lg bg-[#3a1d12] hover:bg-[#4f2819] disabled:opacity-40 disabled:cursor-not-allowed text-[#ffd0dc] border border-[#ff8a3d]/60 text-xs font-medium transition-colors cursor-pointer"
            >
              Assar Carne
            </button>
          </div>

          {/* Fabricar Flechas */}
          <div className="p-3.5 rounded-xl bg-[#14101a] border border-[#3a2e1c] flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-xs text-[#f3ead7]">
                Fabricar 5 Flechas
              </h3>
              <p className="text-[11px] text-[#b7a48a] mt-1">
                Munição para o Arco de caça e combate furtivo à distância.
              </p>
              <span className="text-[10px] text-[#e4c16a]">
                Requer: Pedras (infinitas) + Ramos da mata
              </span>
            </div>
            <button
              type="button"
              onClick={onCraftArrow}
              className="px-3 py-1.5 rounded-lg bg-[#271d15] hover:bg-[#3b2a1a] text-[#ffe08a] border border-[#e4c16a]/60 text-xs font-medium transition-colors cursor-pointer"
            >
              Fabricar (+5)
            </button>
          </div>

          {/* Forjar Lança */}
          <div className="p-3.5 rounded-xl bg-[#14101a] border border-[#3a2e1c] flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-xs text-[#f3ead7]">
                Talhar Lança Pesada
              </h3>
              <p className="text-[11px] text-[#b7a48a] mt-1">
                Arma de alcance médio para caça de javalis e defesa contra milicianos.
              </p>
            </div>
            <button
              type="button"
              onClick={onCraftSpear}
              className="px-3 py-1.5 rounded-lg bg-[#271d15] hover:bg-[#3b2a1a] text-[#ffe08a] border border-[#e4c16a]/60 text-xs font-medium transition-colors cursor-pointer"
            >
              Forjar Lança (+1)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
