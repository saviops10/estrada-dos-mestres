import React from 'react';
import { Realm } from '../types/game';
import { X, CheckCircle2, Circle } from 'lucide-react';

interface RealmInfoDrawerProps {
  mode: 'reinos' | 'pontos';
  world: Record<string, Realm>;
  currentRealm: Realm;
  onClose: () => void;
  onSelectRealm: (realmId: string) => void;
}

export const RealmInfoDrawer: React.FC<RealmInfoDrawerProps> = ({
  mode,
  world,
  currentRealm,
  onClose,
  onSelectRealm
}) => {
  const realms = Object.values(world);
  const currentPoints = currentRealm.entities.filter((e) => e.countsAsPoint);

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-md bg-[#130f18]/95 border-l border-[#8b6914] shadow-2xl backdrop-blur-md flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#3a2e1c] bg-[#1a1422]">
        <h3 className="font-bold text-sm text-[#e4c16a] font-serif">
          {mode === 'reinos' ? 'Cosmologia dos Reinos' : `Pontos — ${currentRealm.name}`}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-[#b7a48a] hover:text-[#f3ead7] hover:bg-[#251d14] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-[#b7a48a]">
        {mode === 'reinos' ? (
          <>
            <p className="leading-relaxed italic">
              Seis reinos são cidades sagradas, cada uma com 9 pontos de força. O Reino dos Cruzeiros é o espaço astral entre elas. O Quilombo é o refúgio seguro dos livres: não há inimigos e a fogueira cura o corpo.
            </p>

            <div className="space-y-2.5">
              {realms.map((realm) => {
                const points = realm.entities.filter((e) => e.countsAsPoint);
                const visited = points.filter((e) => e.visited).length;
                const isCurrent = realm.id === currentRealm.id;

                return (
                  <div
                    key={realm.id}
                    onClick={() => onSelectRealm(realm.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-[#221a12] border-[#e4c16a] text-[#f3ead7]'
                        : 'bg-[#18131e] border-[#2f2736] hover:border-[#4a3b24]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <strong className="text-[#f3ead7] text-xs">{realm.name}</strong>
                      {realm.safe ? (
                        <span className="text-[10px] text-amber-300">Zona Segura</span>
                      ) : (
                        <span className="text-[10px] text-[#e4c16a] font-mono">
                          {visited}/9 pontos
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#b7a48a] mt-1 line-clamp-2">
                      {realm.blurb}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <p className="leading-relaxed italic">
              {currentRealm.blurb}
            </p>

            <div className="space-y-2">
              {currentRealm.safe ? (
                <div className="p-4 rounded-lg bg-[#18131e] border border-[#3a2e1c] text-center space-y-2">
                  <p className="text-[#e4c16a] font-bold">Sem pontos de força</p>
                  <p>Aqui você descansa junto à Grande Fogueira. O Cruzeiro no centro devolve sua passagem para o Reino dos Cruzeiros.</p>
                </div>
              ) : currentPoints.length === 0 ? (
                <div className="p-4 text-center text-[#7c6d5b]">
                  Nenhum ponto registrado.
                </div>
              ) : (
                currentPoints.map((p, idx) => (
                  <div
                    key={p.id}
                    className={`p-2.5 rounded-lg border flex items-start gap-2.5 ${
                      p.visited
                        ? 'bg-[#1b1912] border-[#8b6914] text-[#f3ead7]'
                        : 'bg-[#18131e] border-[#2f2736] text-[#b7a48a]'
                    }`}
                  >
                    {p.visited ? (
                      <CheckCircle2 className="w-4 h-4 text-[#e4c16a] shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-[#5c4f3d] shrink-0 mt-0.5" />
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-[#f3ead7] truncate">{p.name}</span>
                        <span className="font-mono text-[10px] text-[#7c6d5b]">#{idx + 1}</span>
                      </div>
                      {p.power && (
                        <div className="text-[11px] text-[#e4c16a] mt-0.5">
                          {p.power}
                        </div>
                      )}
                      {p.mestre && (
                        <div className="text-[10px] text-[#9bb4d2] mt-0.5">
                          Mestre: {p.mestre}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
