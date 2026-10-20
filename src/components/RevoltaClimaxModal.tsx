import React from 'react';
import { Swords, Flame, Sparkles, CheckCircle2, Shield } from 'lucide-react';

interface RevoltaClimaxModalProps {
  rescuedCount: number;
  revoltProgress: number;
  onLaunchOffensive: () => void;
  onClose: () => void;
}

export const RevoltaClimaxModal: React.FC<RevoltaClimaxModalProps> = ({
  rescuedCount,
  revoltProgress,
  onLaunchOffensive,
  onClose
}) => {
  const isReady = rescuedCount >= 49;
  const isVictory = revoltProgress >= 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/92 backdrop-blur-lg animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-[#0c0812] border-2 border-[#e4c16a] rounded-2xl shadow-[0_0_60px_rgba(228,193,106,0.3)] overflow-hidden flex flex-col">
        {/* Banner */}
        <div className="p-6 bg-gradient-to-r from-[#29130d] via-[#1a0f1e] to-[#0c0812] border-b border-[#3a2e1c]">
          <span className="text-3xl mb-1 inline-block">🔥 ⚔️ 🕊️</span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#e4c16a] font-serif tracking-wider">
            {isVictory
              ? 'Vitória Absoluta: Terra Livre e Colonizadores Expulsos!'
              : 'Fase 3: A Grande Revolta dos Engenhos'}
          </h2>
          <p className="text-xs text-[#a8957c] mt-1 font-mono">
            O Clímax da Libertação Ancestral · Ataque Coordenado das Forças Quilombolas
          </p>
        </div>

        {/* Narrative & Tactical Status */}
        <div className="p-6 space-y-4 text-xs sm:text-sm text-[#d4c6b2] leading-relaxed overflow-y-auto max-h-[60vh]">
          {isVictory ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[#142918] border border-[#3e824e] text-[#d4ffd8] space-y-2">
                <h3 className="font-bold text-[#7cff6b] flex items-center gap-2 text-base">
                  <CheckCircle2 className="w-5 h-5 text-[#7cff6b]" />
                  Os Engenhos Foram Tomados e as Correntes Quebradas!
                </h3>
                <p>
                  Com a união dos 49 guerreiros foragidos, a força sagrada dos Pontos de Força e a maestria da Capoeira, o ataque aos engenhos e fazendas coloniais foi devastador.
                </p>
                <p>
                  Todos os cativos remanescentes foram libertados. As milícias e capitães do mato fugiram em desespero para as caravelas, e estas terras agora pulsam como território soberano dos povos livres!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p>
                Os 7 Reinos Sagrados ecoam o toque dos atabaques e berimbaus. Com os irmãos foragidos resgatados e a sintonia espiritual consolidada nos altares, chegou o momento supremo:
              </p>
              <div className="p-3.5 rounded-xl bg-[#1c120c] border border-[#522f18] text-[#ffe6d6] space-y-2">
                <h4 className="font-bold text-[#ff8a3d] flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#ff5f8a]" />
                  O Plano Tático dos 49:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-[#d6b7a2]">
                  <li>Dandara e os guerreiros das Encruzilhadas bloqueiam as estradas de fuga.</li>
                  <li>Mestre Obá e os remadores da Calunga Grande cortam o suprimento das caravelas.</li>
                  <li>Os arqueiros das Matas neutralizam as sentinelas nas torres dos engenhos.</li>
                  <li>Os mestres de Capoeira da Lira e do Quilombo invadem a casa-grande e libertam a senzala.</li>
                </ul>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs text-[#e4c16a] font-medium">
                  <span>Ofensiva contra os Engenhos</span>
                  <span className="font-mono">{revoltProgress}% Concluído</span>
                </div>
                <div className="h-3 w-full bg-[#201524] rounded-full overflow-hidden border border-[#4a3b24]">
                  <div
                    className="h-full bg-gradient-to-r from-[#e4c16a] via-[#ff8a3d] to-[#7cff6b] transition-all duration-500"
                    style={{ width: `${revoltProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 bg-[#120d18] border-t border-[#3a2e1c] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-[#b7a48a] hover:text-[#f3ead7] transition-colors cursor-pointer"
          >
            {isVictory ? 'Continuar Explorando' : 'Aguardar'}
          </button>

          {!isVictory && (
            <button
              type="button"
              onClick={onLaunchOffensive}
              disabled={!isReady}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide shadow-lg transition-all cursor-pointer ${
                isReady
                  ? 'bg-gradient-to-r from-[#ff5f8a] via-[#ff8a3d] to-[#e4c16a] text-[#120a04] hover:brightness-110 active:scale-98'
                  : 'bg-[#291e14] text-[#776655] border border-[#4a3b24] cursor-not-allowed'
              }`}
            >
              <Swords className="w-4 h-4" />
              <span>
                {isReady ? 'Comandar Ofensiva aos Engenhos!' : `Necessário 49 Irmãos (${rescuedCount}/49)`}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
