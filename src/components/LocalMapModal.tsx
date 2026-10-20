import React, { useRef, useEffect } from 'react';
import { Realm, PlayerState } from '../types/game';
import { MW, MH, ATLAS } from '../data/worldData';
import { tileColor } from '../engine/raycaster';
import { X, ArrowLeft, Shield, MapPin, CheckCircle2 } from 'lucide-react';

interface LocalMapModalProps {
  realm: Realm;
  player: PlayerState;
  isCurrentRealm: boolean;
  onClose: () => void;
  onBackToAtlas?: () => void;
}

export const LocalMapModal: React.FC<LocalMapModalProps> = ({
  realm,
  player,
  isCurrentRealm,
  onClose,
  onBackToAtlas
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#0c1210';
    ctx.fillRect(0, 0, width, height);

    // Compute tile scale
    const scale = Math.min((width - 32) / MW, (height - 32) / MH);
    const ox = (width - MW * scale) / 2;
    const oy = (height - MH * scale) / 2;

    // Draw tiles
    for (let y = 0; y < MH; y++) {
      for (let x = 0; x < MW; x++) {
        ctx.fillStyle = tileColor(realm.map[y][x], realm);
        ctx.fillRect(ox + x * scale, oy + y * scale, Math.ceil(scale), Math.ceil(scale));
      }
    }

    // Grid lines subtle
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= MW; i++) {
      ctx.beginPath();
      ctx.moveTo(ox + i * scale, oy);
      ctx.lineTo(ox + i * scale, oy + MH * scale);
      ctx.stroke();
    }
    for (let j = 0; j <= MH; j++) {
      ctx.beginPath();
      ctx.moveTo(ox, oy + j * scale);
      ctx.lineTo(ox + MW * scale, oy + j * scale);
      ctx.stroke();
    }

    // Draw gates & fires
    realm.entities.forEach((e) => {
      if (e.kind === 'fire') {
        ctx.fillStyle = '#ff8a3d';
        ctx.beginPath();
        ctx.arc(ox + e.x * scale, oy + e.y * scale, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (e.kind === 'gate') {
        ctx.fillStyle = e.color || '#9bb4d2';
        ctx.fillRect(ox + e.x * scale - 4, oy + e.y * scale - 4, 8, 8);
      } else if (e.kind === 'person') {
        ctx.fillStyle = '#f0c8a0';
        ctx.beginPath();
        ctx.arc(ox + e.x * scale, oy + e.y * scale, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw points of force with numbers
    const points = realm.entities.filter((e) => e.countsAsPoint);
    points.forEach((e, i) => {
      const px = ox + e.x * scale;
      const py = oy + e.y * scale;

      ctx.fillStyle = e.visited ? '#8d7a48' : '#ffe08a';
      ctx.beginPath();
      ctx.arc(px, py, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#1a140c';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#1a140c';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(i + 1), px, py);
    });

    // Draw Player if in this realm
    if (isCurrentRealm) {
      const px = ox + player.x * scale;
      const py = oy + player.y * scale;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(player.angle);

      // Red pointer arrow
      ctx.fillStyle = '#ff4d4d';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(-6, 5);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-6, -5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Vision cone
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 24, -0.4, 0.4);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }, [realm, player, isCurrentRealm]);

  const points = realm.entities.filter((e) => e.countsAsPoint);
  const visitedCount = points.filter((e) => e.visited).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[94vh] flex flex-col bg-[#0f0a14] border-2 border-[#8b6914] rounded-xl shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#171120] to-[#1a120c] border-b border-[#3a2e1c]">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#e4c16a] tracking-wide font-serif">
                Mapa Local — {realm.name}
              </h2>
              <p className="text-xs text-[#b7a48a]">
                {realm.blurb} · {points.length > 0 ? `${visitedCount}/${points.length} pontos reconhecidos` : 'Refúgio'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onBackToAtlas && (
              <button
                type="button"
                onClick={onBackToAtlas}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-[#241e16] hover:bg-[#342a1e] text-[#f3ead7] border border-[#4a3b24] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar ao Atlas</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#b7a48a] hover:text-[#e4c16a] hover:bg-[#251d14] border border-[#4a3b24] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Canvas map */}
          <div className="flex-1 relative flex items-center justify-center p-3 bg-[#08070d] border-b md:border-b-0 md:border-r border-[#3a2e1c]">
            <canvas
              ref={canvasRef}
              width={540}
              height={540}
              className="max-w-full max-h-[500px] w-auto h-auto rounded-lg border border-[#4a3b24] shadow-inner"
            />
            {isCurrentRealm && (
              <div className="absolute top-5 left-5 px-2.5 py-1 rounded bg-[#100e0c]/90 border border-[#e4c16a]/50 text-[11px] text-[#e4c16a] font-mono shadow">
                📍 Você está aqui
              </div>
            )}
          </div>

          {/* Sidebar with points */}
          <div className="w-full md:w-80 flex flex-col bg-[#14101a] overflow-hidden">
            <div className="p-3 border-b border-[#3a2e1c] bg-[#1a1422] text-xs font-semibold text-[#e4c16a]">
              Pontos de Força deste Reino
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
              {realm.safe ? (
                <div className="p-3 rounded-lg bg-[#1c1610] border border-[#4a3b24] text-[#b7a48a] space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                    <Shield className="w-4 h-4" /> Zona de Paz e Refúgio
                  </div>
                  <p>
                    Nenhum inimigo atravessa as paliçadas do Quilombo. As fogueiras curam suas feridas e
                    o Cruzeiro abre passagem para o centro dos reinos.
                  </p>
                </div>
              ) : points.length === 0 ? (
                <div className="text-center text-[#7c6d5b] py-6">
                  Nenhum ponto registrado neste mapa.
                </div>
              ) : (
                points.map((p, idx) => (
                  <div
                    key={p.id}
                    className={`p-2.5 rounded-lg border flex items-start gap-2.5 ${
                      p.visited
                        ? 'bg-[#1b1912] border-[#8b6914] text-[#f3ead7]'
                        : 'bg-[#18131e] border-[#2f2736] text-[#b7a48a]'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5 ${
                        p.visited ? 'bg-[#e4c16a] text-[#1a140c]' : 'bg-[#2a2233] text-[#b7a48a]'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <strong className="text-[#f3ead7] truncate">{p.name}</strong>
                        {p.visited && (
                          <span className="text-[10px] text-[#e4c16a] flex items-center gap-0.5 shrink-0">
                            <CheckCircle2 className="w-3 h-3" />
                          </span>
                        )}
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
          </div>
        </div>
      </div>
    </div>
  );
};
