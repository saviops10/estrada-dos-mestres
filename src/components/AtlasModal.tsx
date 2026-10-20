import React, { useState } from 'react';
import { Realm } from '../types/game';
import { ATLAS, MARK_ICONS, MUNDI_NODES } from '../data/worldData';
import { X, Search, Compass, ChevronRight, CheckCircle2, Shield, Sparkles } from 'lucide-react';

interface AtlasModalProps {
  world: Record<string, Realm>;
  currentRealmId: string;
  onClose: () => void;
  onSelectLocalMap: (realmId: string) => void;
  onTravelToRealm: (realmId: string) => void;
}

export const AtlasModal: React.FC<AtlasModalProps> = ({
  world,
  currentRealmId,
  onClose,
  onSelectLocalMap,
  onTravelToRealm
}) => {
  const [selectedRealmId, setSelectedRealmId] = useState<string>(currentRealmId);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const selectedRealm = world[selectedRealmId] || world.cruzeiros;
  const mark = MARK_ICONS[selectedRealmId] || { symbol: '✦', color: '#e4c16a', desc: '' };

  const points = ATLAS[selectedRealmId] || [];
  const realmEntities = selectedRealm.entities.filter((e) => e.countsAsPoint);
  const visitedCount = realmEntities.filter((e) => e.visited).length;

  const totalVisited = Object.values(world).reduce(
    (acc, r) => acc + r.entities.filter((e) => e.countsAsPoint && e.visited).length,
    0
  );

  const filteredPoints = points.filter(([id, name, power, mestre]) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      name.toLowerCase().includes(q) ||
      power.toLowerCase().includes(q) ||
      mestre.toLowerCase().includes(q) ||
      id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[94vh] flex flex-col bg-[#0f0a14] border-2 border-[#8b6914] rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#171120] to-[#1a120c] border-b border-[#3a2e1c]">
          <div className="flex items-center gap-3">
            <span className="text-2xl" style={{ color: mark.color }}>
              {mark.symbol}
            </span>
            <div>
              <h2 className="text-lg font-bold text-[#e4c16a] tracking-wide font-serif">
                Atlas dos Sete Reinos — Mapa-Múndi
              </h2>
              <p className="text-xs text-[#b7a48a]">
                63 Pontos de Força sagrados · Cosmologia dos Mestres Ancestrais ({totalVisited}/63 reconhecidos)
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

        {/* Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
          {/* Left: SVG Interactive Map */}
          <div className="flex-1 relative bg-[#090810] flex flex-col items-center justify-center p-4 min-h-[340px] select-none border-b lg:border-b-0 lg:border-r border-[#3a2e1c]">
            <svg
              viewBox="0 0 740 420"
              className="w-full h-auto max-h-[500px] drop-shadow-xl"
            >
              {/* Star Background Pattern */}
              <defs>
                <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#d4af37" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#090810" stopOpacity="0" />
                </radialGradient>
              </defs>

              <circle cx="360" cy="200" r="180" fill="url(#centerGlow)" />

              {/* Connecting Astral Roads */}
              {MUNDI_NODES.slice(1).map((node) => {
                const isSelected = selectedRealmId === node.id;
                return (
                  <g key={`road-${node.id}`}>
                    <line
                      x1="360"
                      y1="200"
                      x2={node.x}
                      y2={node.y}
                      stroke={isSelected ? '#e4c16a' : '#3a3458'}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                      strokeDasharray={isSelected ? 'none' : '4 3'}
                      className="transition-all duration-300"
                    />
                  </g>
                );
              })}

              {/* Extra connection between Almas and Quilombo */}
              <line
                x1="550"
                y1="110"
                x2="630"
                y2="80"
                stroke="#634f2a"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />

              {/* Nodes */}
              {MUNDI_NODES.map((node) => {
                const realm = world[node.id];
                const nodeMark = MARK_ICONS[node.id];
                const isHere = node.id === currentRealmId;
                const isSelected = node.id === selectedRealmId;
                const visitedHere = realm
                  ? realm.entities.filter((e) => e.countsAsPoint && e.visited).length
                  : 0;

                return (
                  <g
                    key={node.id}
                    className="cursor-pointer group"
                    onClick={() => setSelectedRealmId(node.id)}
                  >
                    {/* Outer halo */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isSelected ? 32 : 25}
                      fill={isSelected ? `${nodeMark.color}33` : '#161320'}
                      stroke={isSelected ? '#f3ead7' : nodeMark.color}
                      strokeWidth={isSelected ? '3' : '2'}
                      className="transition-all duration-300 group-hover:stroke-[#fff]"
                    />

                    {/* Visited indicator ring */}
                    {visitedHere > 0 && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isSelected ? 36 : 28}
                        fill="none"
                        stroke="#e4c16a"
                        strokeWidth="1"
                        strokeDasharray="2 3"
                        className="animate-spin-slow origin-center"
                        style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                      />
                    )}

                    {/* Symbol */}
                    <text
                      x={node.x}
                      y={node.y + 6}
                      textAnchor="middle"
                      fill={isSelected ? '#fff' : nodeMark.color}
                      fontSize="18"
                      className="select-none font-bold"
                    >
                      {nodeMark.symbol}
                    </text>

                    {/* Realm Name Label */}
                    <text
                      x={node.x}
                      y={node.y + (node.id === 'cruzeiros' ? -34 : 44)}
                      textAnchor="middle"
                      fill={isSelected ? '#f3ead7' : '#b7a48a'}
                      fontSize="11.5"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      className="font-serif select-none"
                    >
                      {realm?.name.replace('Reino das ', '').replace('Reino dos ', '').replace('Reino da ', '')}
                      {isHere && ' 📍'}
                    </text>

                    {/* Visited points tally */}
                    {!realm?.safe && (
                      <text
                        x={node.x}
                        y={node.y + (node.id === 'cruzeiros' ? -46 : 56)}
                        textAnchor="middle"
                        fill="#b7a48a"
                        fontSize="9.5"
                        className="font-mono select-none"
                      >
                        {visitedHere}/9
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Quick Map Legend & Hint */}
            <div className="w-full flex items-center justify-between text-[11px] text-[#b7a48a] pt-2 px-2">
              <span className="flex items-center gap-1.5">
                <span className="text-amber-400">✦</span>
                Clique num nó para inspecionar os 9 pontos. O Cruzeiro no centro conecta todos.
              </span>
              <span className="hidden sm:inline-block">
                📍 Você está em: <strong className="text-[#e4c16a]">{world[currentRealmId]?.name}</strong>
              </span>
            </div>
          </div>

          {/* Right: Realm Details & 9 Sacred Points List */}
          <div className="w-full lg:w-[420px] flex flex-col bg-[#14101a] overflow-hidden">
            {/* Realm Card Header */}
            <div className="p-4 border-b border-[#3a2e1c] bg-[#1a1422]">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl" style={{ color: mark.color }}>
                      {mark.symbol}
                    </span>
                    <h3 className="text-base font-bold text-[#f3ead7] font-serif">
                      {selectedRealm.name}
                    </h3>
                  </div>
                  <p className="text-xs text-[#b7a48a] mt-1 italic">
                    {selectedRealm.blurb}
                  </p>
                </div>
                {selectedRealm.safe && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-amber-900/60 text-amber-200 border border-amber-500/50 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Seguro
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => onSelectLocalMap(selectedRealmId)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#241e16] hover:bg-[#342a1e] text-[#f3ead7] border border-[#e4c16a]/60 text-xs font-medium transition-colors cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5 text-[#e4c16a]" />
                  <span>Ver Mapa Local 2D</span>
                </button>

                {selectedRealmId !== currentRealmId && (
                  <button
                    type="button"
                    onClick={() => onTravelToRealm(selectedRealmId)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#3b2a14] hover:bg-[#4d3619] text-[#ffe08a] border border-[#e4c16a] text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Viajar ao Reino</span>
                  </button>
                )}
              </div>
            </div>

            {/* Points Filter Search */}
            <div className="px-3.5 py-2 border-b border-[#3a2e1c] bg-[#110e16]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#7c6d5b]" />
                <input
                  type="text"
                  placeholder="Buscar ponto, mestre ou poder..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1 text-xs bg-[#191420] text-[#f3ead7] placeholder-[#7c6d5b] border border-[#3a2e1c] rounded-md focus:outline-none focus:border-[#e4c16a]"
                />
              </div>
            </div>

            {/* List of 9 Points */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <div className="flex justify-between items-center px-1 text-[11px] text-[#b7a48a]">
                <span>Pontos Sagrados ({filteredPoints.length})</span>
                {!selectedRealm.safe && (
                  <span className="text-[#e4c16a]">
                    {visitedCount}/9 reconhecidos
                  </span>
                )}
              </div>

              {selectedRealm.safe ? (
                <div className="p-4 rounded-lg bg-[#1a1410] border border-[#4a3b24] text-xs text-[#b7a48a] space-y-2">
                  <p className="font-semibold text-[#e4c16a]">Refúgio Sagrado do Quilombo</p>
                  <p>
                    Aqui não há pontos de contagem nem perigo. O fogo sagrado restaura sua vida e sacia
                    sua alma. O Cruzeiro no centro devolve sua passagem para o Reino dos Cruzeiros.
                  </p>
                </div>
              ) : filteredPoints.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#7c6d5b]">
                  Nenhum ponto encontrado com este termo.
                </div>
              ) : (
                filteredPoints.map(([id, name, power, mestre, type], index) => {
                  const entity = realmEntities.find((e) => e.id === id);
                  const isVisited = entity?.visited;

                  return (
                    <div
                      key={id}
                      className={`p-2.5 rounded-lg border transition-all text-xs flex items-start gap-2.5 ${
                        isVisited
                          ? 'bg-[#1b1912] border-[#8b6914] text-[#f3ead7]'
                          : 'bg-[#17131e] border-[#2f2736] text-[#b7a48a] hover:border-[#4a3b24]'
                      }`}
                    >
                      <div className="flex flex-col items-center mt-0.5">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                            isVisited
                              ? 'bg-[#e4c16a] text-[#1a140c]'
                              : 'bg-[#2a2233] text-[#b7a48a]'
                          }`}
                        >
                          {index + 1}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-bold text-[#f3ead7] truncate">{name}</h4>
                          {isVisited ? (
                            <span className="text-[10px] text-[#e4c16a] flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Reconhecido
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#7c6d5b]">Por visitar</span>
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px]">
                          <span>
                            <strong className="text-[#a8957c]">Poder:</strong>{' '}
                            <span className="text-[#e4c16a]">{power}</span>
                          </span>
                          <span>
                            <strong className="text-[#a8957c]">Mestre:</strong>{' '}
                            <span className="text-[#9bb4d2]">{mestre}</span>
                          </span>
                        </div>
                        <div className="mt-1 text-[10px] text-[#7c6d5b]">
                          Tipo: {type || 'Ponto Sagrado'} · ID: {id}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
