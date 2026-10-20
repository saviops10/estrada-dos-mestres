import { Realm, Entity, PlayerState, SurvivalState } from '../types/game';
import { MH, MW } from '../data/worldData';

export function tileAt(map: number[][], x: number, y: number): number {
  const cx = Math.floor(x);
  const cy = Math.floor(y);
  if (cy < 0 || cx < 0 || cy >= MH || cx >= MW) return 1;
  return map[cy][cx];
}

export function isBlocked(map: number[][], x: number, y: number): boolean {
  const r = 0.22;
  const offsets = [
    [r, r], [r, -r], [-r, r], [-r, -r],
    [r, 0], [-r, 0], [0, r], [0, -r]
  ];
  return offsets.some(([dx, dy]) => tileAt(map, x + dx, y + dy) !== 0);
}

export function tryMovePlayer(player: PlayerState, map: number[][], nx: number, ny: number) {
  if (!isBlocked(map, nx, player.y)) {
    player.x = nx;
  }
  if (!isBlocked(map, player.x, ny)) {
    player.y = ny;
  }
}

export function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function columnColor(tile: number, texX: number, side: number, shade: number): string {
  const pal: Record<number, [number, number, number]> = {
    1: [46, 96, 52],
    2: [132, 128, 118],
    3: [96, 62, 34],
    4: [138, 96, 58],
    5: [186, 154, 78],
    6: [48, 110, 168],
    8: [176, 168, 150],
    9: [168, 84, 112],
    10: [88, 104, 118],
    11: [18, 14, 32]
  };

  let [r, g, b] = pal[tile] || [90, 70, 48];
  if ((tile === 4 || tile === 9 || tile === 8) && texX % 9 < 2) {
    r *= 0.62;
    g *= 0.62;
    b *= 0.62;
  }
  if (tile === 6 && texX % 8 < 3) {
    r += 20;
    g += 24;
    b += 10;
  }
  if (side === 1) {
    r *= 0.72;
    g *= 0.72;
    b *= 0.72;
  }
  const c = (v: number) => Math.max(0, Math.min(255, (v * shade) | 0));
  return `rgb(${c(r)},${c(g)},${c(b)})`;
}

export function tileColor(tile: number, realm?: Realm): string {
  const theme = realm?.theme;
  if (theme?.space) return tile === 0 ? '#3a3458' : '#07060f';
  if (tile === 0) return theme?.floor1 || '#2a2118';
  if (tile === 6) return '#2f6fbf';
  if (tile === 8) return '#c8c0ae';
  if (tile === 9) return '#c45b86';
  if (tile === 10) return '#607484';
  if (tile === 1) return '#1d4c2c';
  if (tile === 5) return '#e0b85a';
  return '#6a5340';
}

export class RaycasterRenderer {
  private zbuf: Float32Array;

  constructor(width: number) {
    this.zbuf = new Float32Array(width);
  }

  public resize(width: number) {
    if (this.zbuf.length !== width) {
      this.zbuf = new Float32Array(width);
    }
  }

  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    player: PlayerState,
    realm: Realm,
    state: SurvivalState,
    time: number
  ) {
    this.resize(width);

    const dirX = Math.cos(player.angle);
    const dirY = Math.sin(player.angle);
    const planeX = -dirY * 0.66;
    const planeY = dirX * 0.66;

    // Render Sky and Floor
    this.renderSkyAndFloor(ctx, width, height, realm, state, time);

    // Find fire entity for dynamic lighting
    const flame = realm.entities.find((e) => e.kind === 'fire') || { x: 9999, y: 9999 };

    // Raycasting wall columns
    for (let x = 0; x < width; x++) {
      const cameraX = (2 * x) / width - 1;
      const rayDirX = dirX + planeX * cameraX;
      const rayDirY = dirY + planeY * cameraX;

      let mapX = Math.floor(player.x);
      let mapY = Math.floor(player.y);

      const deltaX = Math.abs(1 / (rayDirX || 1e-8));
      const deltaY = Math.abs(1 / (rayDirY || 1e-8));

      let stepX: number;
      let stepY: number;
      let sideX: number;
      let sideY: number;

      if (rayDirX < 0) {
        stepX = -1;
        sideX = (player.x - mapX) * deltaX;
      } else {
        stepX = 1;
        sideX = (mapX + 1 - player.x) * deltaX;
      }

      if (rayDirY < 0) {
        stepY = -1;
        sideY = (player.y - mapY) * deltaY;
      } else {
        stepY = 1;
        sideY = (mapY + 1 - player.y) * deltaY;
      }

      let hit = 0;
      let side = 0;
      let guard = 0;

      while (hit === 0 && guard++ < 48) {
        if (sideX < sideY) {
          sideX += deltaX;
          mapX += stepX;
          side = 0;
        } else {
          sideY += deltaY;
          mapY += stepY;
          side = 1;
        }
        if (mapY < 0 || mapX < 0 || mapY >= MH || mapX >= MW) {
          hit = 2;
          break;
        }
        if (realm.map[mapY][mapX] !== 0) {
          hit = 1;
        }
      }

      let perp = hit === 1 ? (side === 0 ? sideX - deltaX : sideY - deltaY) : 30;
      if (perp < 0.05) perp = 0.05;
      this.zbuf[x] = perp;

      if (hit !== 1) continue;

      const lineH = Math.min(height * 3, Math.floor(height / perp));
      const start = Math.floor((height - lineH) / 2);
      const end = start + lineH;

      const wallX = side === 0 ? player.y + perp * rayDirY : player.x + perp * rayDirX;
      const texX = Math.floor((wallX - Math.floor(wallX)) * 64) & 63;

      // Calculate shade with torch and fire
      let light = state.torch ? Math.min(1.15, 1.35 / (0.45 + perp * 0.42)) : 0.14;
      light += Math.max(0, 0.8 - Math.hypot(mapX + 0.5 - flame.x, mapY + 0.5 - flame.y) * 0.2);
      const shade = Math.max(0.06, Math.min(1.3, light));

      ctx.fillStyle = columnColor(realm.map[mapY][mapX], texX, side, shade);
      ctx.fillRect(x, Math.max(0, start), 1, Math.min(height, end) - Math.max(0, start));
    }

    // Render Sprites
    const sortedSprites = realm.entities
      .slice()
      .sort((a, b) => dist(player, b) - dist(player, a));

    for (const sprite of sortedSprites) {
      this.drawSprite(ctx, width, height, sprite, player, dirX, dirY, planeX, planeY, time);
    }

    // Render Torch in First-Person
    if (state.torch) {
      this.drawTorch(ctx, width, height, time);
    }

    // Crosshair
    ctx.strokeStyle = '#f5e6b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 5, height / 2);
    ctx.lineTo(width / 2 + 5, height / 2);
    ctx.moveTo(width / 2, height / 2 - 5);
    ctx.lineTo(width / 2, height / 2 + 5);
    ctx.stroke();

    // Radar / Minimap
    if (state.radar) {
      this.drawRadar(ctx, width, height, realm, player);
    }
  }

  private renderSkyAndFloor(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    realm: Realm,
    state: SurvivalState,
    time: number
  ) {
    const theme = realm.theme;
    if (theme.space) {
      ctx.fillStyle = '#05040c';
      ctx.fillRect(0, 0, width, height / 2);

      // Twinkling stars
      ctx.fillStyle = '#f4f0ff';
      for (let i = 0; i < 90; i++) {
        const starX = (i * 97) % width;
        const starY = (i * 53) % (height / 2);
        const twinkle = (Math.sin(time * 0.003 + i) + 1) > 0.5;
        if (twinkle) {
          ctx.fillRect(starX, starY, i % 5 === 0 ? 2 : 1, 1);
        }
      }

      ctx.fillStyle = '#2a2444';
      ctx.fillRect(0, height / 2, width, height / 2);
      return;
    }

    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, height / 2);
    sky.addColorStop(0, state.torch ? theme.sky0 : '#07080c');
    sky.addColorStop(1, state.torch ? theme.sky1 : '#14181c');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height / 2);

    // Floor
    const floor = ctx.createLinearGradient(0, height / 2, 0, height);
    floor.addColorStop(0, theme.floor0);
    floor.addColorStop(1, theme.floor1);
    ctx.fillStyle = floor;
    ctx.fillRect(0, height / 2, width, height / 2);
  }

  private drawSprite(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    s: Entity,
    player: PlayerState,
    dirX: number,
    dirY: number,
    planeX: number,
    planeY: number,
    time: number
  ) {
    const dx = s.x - player.x;
    const dy = s.y - player.y;
    const inv = 1 / (planeX * dirY - dirX * planeY);
    const tx = inv * (dirY * dx - dirX * dy);
    const ty = inv * (-planeY * dx + planeX * dy);

    if (ty <= 0.15) return;

    const screenX = Math.floor((width / 2) * (1 + tx / ty));
    const size = Math.abs(Math.floor(height / ty));
    if (size < 2) return;

    if (s.kind === 'fire') {
      const top = height / 2;
      const flicker = Math.sin(time * 0.015 + s.x) * 4;
      const g = ctx.createRadialGradient(screenX, top, 2, screenX, top, size * 0.45 + flicker);
      g.addColorStop(0, '#fff6c8');
      g.addColorStop(0.35, '#ffb13a');
      g.addColorStop(0.7, '#ff5010');
      g.addColorStop(1, 'rgba(255,50,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(screenX, top, size * 0.45 + flicker, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    const left = Math.floor(screenX - size / 2);
    const top = Math.floor(height / 2 - size / 2);

    let color = '#f0d56a';
    if (s.kind === 'gate') color = s.color || '#fff';
    else if (s.kind === 'person') color = '#f0c8a0';
    else if (s.kind === 'portal') color = '#fff1a8';
    else if (s.visited) color = '#8d7a48';

    for (let x = left; x < left + size; x++) {
      if (x < 0 || x >= width || this.zbuf[x] + 0.05 < ty) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x, top + size * 0.2, 1, size * 0.62);
    }
  }

  private drawTorch(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
    const x = width * 0.72;
    const y = height * 0.78;
    const flameWiggle = Math.sin(time * 0.018) * 3;
    const g = ctx.createRadialGradient(x + flameWiggle, y - 16, 4, x, y - 8, 52);
    g.addColorStop(0, 'rgba(255,244,200,0.95)');
    g.addColorStop(0.4, 'rgba(255,140,30,0.7)');
    g.addColorStop(1, 'rgba(255,60,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x + flameWiggle, y - 14, 48, 0, Math.PI * 2);
    ctx.fill();

    // Torch stick
    ctx.fillStyle = '#c47a32';
    ctx.fillRect(x - 3, y - 6, 6, 36);
    ctx.fillStyle = '#6e3c10';
    ctx.fillRect(x - 5, y - 8, 10, 4);
  }

  private drawRadar(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    realm: Realm,
    player: PlayerState
  ) {
    const size = Math.min(108, width * 0.28);
    const ox = width - size - 8;
    const oy = 8;

    ctx.fillStyle = 'rgba(8,16,18,0.85)';
    ctx.fillRect(ox, oy, size, size);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 1;
    ctx.strokeRect(ox + 0.5, oy + 0.5, size - 1, size - 1);

    const scale = size / MW;
    for (let y = 0; y < MH; y++) {
      for (let x = 0; x < MW; x++) {
        if (realm.map[y][x] === 0) continue;
        ctx.fillStyle = tileColor(realm.map[y][x], realm);
        ctx.fillRect(ox + x * scale, oy + y * scale, Math.ceil(scale), Math.ceil(scale));
      }
    }

    // Entities on radar
    realm.entities.forEach((e) => {
      if (e.countsAsPoint) {
        ctx.fillStyle = e.visited ? '#8d7a48' : '#ffe08a';
        ctx.fillRect(ox + e.x * scale - 1, oy + e.y * scale - 1, 2, 2);
      } else if (e.kind === 'fire') {
        ctx.fillStyle = '#ff8a3d';
        ctx.fillRect(ox + e.x * scale - 1, oy + e.y * scale - 1, 2.5, 2.5);
      } else if (e.kind === 'gate') {
        ctx.fillStyle = e.color || '#9bb4d2';
        ctx.fillRect(ox + e.x * scale - 1, oy + e.y * scale - 1, 2.5, 2.5);
      }
    });

    // Player arrow
    ctx.save();
    ctx.translate(ox + player.x * scale, oy + player.y * scale);
    ctx.rotate(player.angle);
    ctx.fillStyle = '#ff5a5a';
    ctx.beginPath();
    ctx.moveTo(4, 0);
    ctx.lineTo(-3, 2.5);
    ctx.lineTo(-3, -2.5);
    ctx.fill();
    ctx.restore();
  }
}
