import React from 'react';
import { SurvivalState, WeaponType, ViewMode } from '../types/game';
import {
  X,
  Play,
  Eye,
  Flame,
  Compass,
  Map,
  Sparkles,
  Users,
  Leaf,
  Swords,
  Footprints,
  RotateCcw,
  BookOpen
} from 'lucide-react';

interface PauseMenuModalProps {
  state: SurvivalState;
  onClose: () => void;
  onToggleRadar: () => void;
  onToggleTorch: () => void;
  onSelectWeapon: (weapon: WeaponType) => void;
  onOpenView: (mode: ViewMode) => void;
  onResetGame: () => void;
}

export const PauseMenuModal: React.FC<PauseMenuModalProps> = ({
  state,
  onClose,
  onToggleRadar,
  onToggleTorch,
  onSelectWeapon,
  onOpenView,
  onResetGame
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[94vh] flex flex-col bg-[#0f0a14] border-2 border-[#8b6914] rounded-2xl shadow-[0_0_50px_rgba(212,175,55,0.25)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#171120] to-[#1a120c] border-b border-[#3a2e1c]">
          <div className="flex items-center gap-3">
            <span className="text-2xl text-[#e4c16a]">📜</span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#e4c16a] tracking-wide font-serif">
                Menu de Estratégia & Recursos [ESC]
              </h2>
              <p className="text-xs text-[#b7a48a]">
                Sobrevivência Ancestral, Furtividade e Navegação
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#b7a48a] hover:text-[#e4c16a] hover:bg-[#251d14] border border-[#4a3b24] transition-colors cursor-pointer"
            title="Voltar ao jogo [ESC]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Resume button big */}
          <button
            type="button"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#8b6914] to-[#e4c16a] text-[#120a04] font-bold text-sm tracking-wide shadow-md hover:brightness-110 active:scale-98 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Retornar ao Jogo [ESC]</span>
          </button>

          {/* Screen Resources Controls */}
          <div className="p-4 rounded-xl bg-[#14101b] border border-[#3a2e1c] space-y-3">
            <h3 className="font-bold text-xs text-[#e4c16a] uppercase tracking-wider flex items-center gap-1.5 font-serif">
              <Eye className="w-4 h-4 text-[#ffd05b]" />
              Recursos de Visualização & Tocha
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Radar toggle */}
              <div className="p-3 rounded-lg bg-[#1b1524] border border-[#2f2538] flex items-center justify-between">
                <div>
                  <strong className="text-[#f3ead7]">Radar / Minimapa</strong>
                  <p className="text-[11px] text-[#b7a48a]">Exibe mapa tático no canto superior</p>
                </div>
                <button
                  type="button"
                  onClick={onToggleRadar}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer ${
                    state.radar
                      ? 'bg-[#18261e] text-[#a8c47c] border-[#3e6b4a]'
                      : 'bg-[#1c1814] text-[#776856] border-[#4a3b24]'
                  }`}
                >
                  {state.radar ? 'Ligado' : 'Desligado'}
                </button>
              </div>

              {/* Torch toggle */}
              <div className="p-3 rounded-lg bg-[#1b1524] border border-[#2f2538] flex items-center justify-between">
                <div>
                  <strong className="text-[#f3ead7]">Tocha [T]</strong>
                  <p className="text-[11px] text-[#b7a48a]">
                    {state.torch
                      ? 'Ocupa a mão direita · Ativa Chutes com os pés'
                      : 'Mãos livres para armas pesadas e capoeira'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onToggleTorch}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer ${
                    state.torch
                      ? 'bg-[#3a2814] text-[#ffe08a] border-[#e4c16a]'
                      : 'bg-[#1c1814] text-[#776856] border-[#4a3b24]'
                  }`}
                >
                  {state.torch ? 'Acesa' : 'Apagada'}
                </button>
              </div>
            </div>
          </div>

          {/* Arsenal & Postura */}
          <div className="p-4 rounded-xl bg-[#14101b] border border-[#3a2e1c] space-y-3">
            <h3 className="font-bold text-xs text-[#e4c16a] uppercase tracking-wider flex items-center gap-1.5 font-serif">
              <Swords className="w-4 h-4 text-[#ffd05b]" />
              Arsenal & Postura Ativa
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => onSelectWeapon('capoeira')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  state.activeWeapon === 'capoeira'
                    ? 'bg-[#2b1f14] border-[#e4c16a] text-[#ffd05b]'
                    : 'bg-[#18131e] border-[#2f2538] text-[#b7a48a]'
                }`}
              >
                <div className="font-bold text-xs">🥋 Capoeira [1]</div>
                <div className="text-[10px] text-[#b7a48a] mt-1">
                  {state.torch ? 'Chutes com os Pés' : 'Ginga & Punhos'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => onSelectWeapon('pedra')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  state.activeWeapon === 'pedra'
                    ? 'bg-[#2b1f14] border-[#e4c16a] text-[#ffd05b]'
                    : 'bg-[#18131e] border-[#2f2538] text-[#b7a48a]'
                }`}
              >
                <div className="font-bold text-xs">🪨 Pedras [2]</div>
                <div className="text-[10px] text-[#b7a48a] mt-1">
                  Distração furtiva (infinito)
                </div>
              </button>

              <button
                type="button"
                onClick={() => onSelectWeapon('lanca')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  state.activeWeapon === 'lanca'
                    ? 'bg-[#2b1f14] border-[#e4c16a] text-[#ffd05b]'
                    : 'bg-[#18131e] border-[#2f2538] text-[#b7a48a]'
                }`}
              >
                <div className="font-bold text-xs">🗡️ Lança [3]</div>
                <div className="text-[10px] text-[#b7a48a] mt-1">
                  Caça e perfuração pesada
                </div>
              </button>

              <button
                type="button"
                onClick={() => onSelectWeapon('arco')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  state.activeWeapon === 'arco'
                    ? 'bg-[#2b1f14] border-[#e4c16a] text-[#ffd05b]'
                    : 'bg-[#18131e] border-[#2f2538] text-[#b7a48a]'
                }`}
              >
                <div className="font-bold text-xs">🏹 Arco [4]</div>
                <div className="text-[10px] text-[#b7a48a] mt-1">
                  Disparo furtivo à distância
                </div>
              </button>
            </div>
          </div>

          {/* Guia de Fuga & Furtividade */}
          <div className="p-4 rounded-xl bg-[#1c140e] border border-[#5c3a1c] text-[#f4dcc2] space-y-2">
            <h4 className="font-bold text-xs text-[#e4c16a] flex items-center gap-1.5 font-serif">
              <Footprints className="w-4 h-4 text-[#ff8a3d]" />
              Doutrina de Furtividade & Estratégia de Libertação
            </h4>
            <p className="text-[11px] leading-relaxed">
              O foco do jogo <strong>não é a matança</strong>, mas sim a <strong>fuga, a inteligência e a libertação dos irmãos escravizados</strong>:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-[#e0caa8]">
              <li>
                <strong>Arremesso de Pedras [Tecla 2]:</strong> Lance pedras longe para gerar ruídos. Os capitães do mato irão investigar o barulho, abrindo brechas para você passar despercebido.
              </li>
              <li>
                <strong>Mãos Ocupadas & Tocha [Tecla T]:</strong> Ao acender a tocha para enxergar no escuro ou afastar Kiumbas, você usa a mão direita para sustentá-la. Seu golpe desarmado vira um <strong>Chute Frontal ou Martelo com os Pés</strong>.
              </li>
              <li>
                <strong>Libertação Discreta:</strong> Aproxime-se dos irmãos pelas costas ou quando a patrulha estiver distraída e aperte <kbd className="px-1 bg-black/40 rounded border border-[#8b6914] text-[#ffd05b]">E</kbd> para desatar as correntes.
              </li>
            </ul>
          </div>

          {/* Atalhos Rápidos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenView('localMap')}
              className="p-2.5 rounded-lg bg-[#18131e] hover:bg-[#251d2e] border border-[#3a2e1c] text-[#f3ead7] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-[#e4c16a]" />
              <span>Mapa Local [M]</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenView('atlas')}
              className="p-2.5 rounded-lg bg-[#18131e] hover:bg-[#251d2e] border border-[#3a2e1c] text-[#f3ead7] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Map className="w-3.5 h-3.5 text-[#e4c16a]" />
              <span>Atlas Múndi</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenView('herbs')}
              className="p-2.5 rounded-lg bg-[#18131e] hover:bg-[#251d2e] border border-[#3a2e1c] text-[#a8c47c] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Leaf className="w-3.5 h-3.5" />
              <span>Ervanária</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenView('capoeira')}
              className="p-2.5 rounded-lg bg-[#18131e] hover:bg-[#251d2e] border border-[#3a2e1c] text-[#ffd05b] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Capoeira</span>
            </button>
          </div>

          {/* Reset Game option */}
          <div className="pt-3 border-t border-[#2c2236] flex justify-between items-center text-[11px] text-[#7c6d5b]">
            <span>Progresso salvo automaticamente na memória</span>
            <button
              type="button"
              onClick={onResetGame}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#2b1212] hover:bg-[#3d1818] text-[#ff8a8a] border border-[#522222] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reiniciar Campanha</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
