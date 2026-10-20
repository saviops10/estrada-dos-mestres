import { Realm, Entity, PlayerState, SurvivalState, WeaponType } from '../types/game';
import { MH, MW } from '../data/worldData';
import { buildProceduralTextures, TextureMap } from './textures';

export function tileAt(map: number[][], x: number, y: number): number {
  const cx = Math.floor(x);
  const cy = Math.floor(y);
  if (cy < 0 || cx < 0 || cy >= MH || cx >= MW) return 1;
  return map[cy][cx];
}

export function isSolid(map: number[][], cx: number, cy: number): boolean {
  if (cy < 0 || cx < 0 || cy >= MH || cx >= MW) return true;
  return map[cy][cx] !== 0;
}

export function isBlocked(map: number[][], x: number, y: number, r = 0.2): boolean {
  const minX = Math.floor(x - r);
  const maxX = Math.floor(x + r);
  const minY = Math.floor(y - r);
  const maxY = Math.floor(y + r);

  for (let cy = minY; cy <= maxY; cy++) {
    for (let cx = minX; cx <= maxX; cx++) {
      if (isSolid(map, cx, cy)) {
        const closestX = Math.max(cx, Math.min(cx + 1, x));
        const closestY = Math.max(cy, Math.min(cy + 1, y));
        const dx = x - closestX;
        const dy = y - closestY;
        if (dx * dx + dy * dy < r * r) {
          return true;
        }
      }
    }
  }
  return false;
}

export function tryMovePlayer(player: PlayerState, map: number[][], nx: number, ny: number) {
  const r = 0.18;
  const padding = 0.001;
  const currentX = player.x;
  const currentY = player.y;

  const dx = nx - currentX;
  const dy = ny - currentY;

  let newX = currentX;
  let newY = currentY;

  // 1. Move along X axis with wall clamping & collision resolution
  if (dx > 0) {
    const targetX = currentX + dx;
    const testCol = Math.floor(targetX + r);
    const startRow = Math.floor(currentY - r + padding);
    const endRow = Math.floor(currentY + r - padding);
    let blockedX = false;
    for (let cy = startRow; cy <= endRow; cy++) {
      if (isSolid(map, testCol, cy)) {
        blockedX = true;
        break;
      }
    }
    if (blockedX) {
      newX = Math.max(currentX, testCol - r - padding);
    } else {
      newX = targetX;
    }
  } else if (dx < 0) {
    const targetX = currentX + dx;
    const testCol = Math.floor(targetX - r);
    const startRow = Math.floor(currentY - r + padding);
    const endRow = Math.floor(currentY + r - padding);
    let blockedX = false;
    for (let cy = startRow; cy <= endRow; cy++) {
      if (isSolid(map, testCol, cy)) {
        blockedX = true;
        break;
      }
    }
    if (blockedX) {
      newX = Math.min(currentX, testCol + 1 + r + padding);
    } else {
      newX = targetX;
    }
  }

  // 2. Move along Y axis with wall clamping & collision resolution
  if (dy > 0) {
    const targetY = currentY + dy;
    const testRow = Math.floor(targetY + r);
    const startCol = Math.floor(newX - r + padding);
    const endCol = Math.floor(newX + r - padding);
    let blockedY = false;
    for (let cx = startCol; cx <= endCol; cx++) {
      if (isSolid(map, cx, testRow)) {
        blockedY = true;
        break;
      }
    }
    if (blockedY) {
      newY = Math.max(currentY, testRow - r - padding);
    } else {
      newY = targetY;
    }
  } else if (dy < 0) {
    const targetY = currentY + dy;
    const testRow = Math.floor(targetY - r);
    const startCol = Math.floor(newX - r + padding);
    const endCol = Math.floor(newX + r - padding);
    let blockedY = false;
    for (let cx = startCol; cx <= endCol; cx++) {
      if (isSolid(map, cx, testRow)) {
        blockedY = true;
        break;
      }
    }
    if (blockedY) {
      newY = Math.min(currentY, testRow + 1 + r + padding);
    } else {
      newY = targetY;
    }
  }

  // 3. Diagonal corner check (prevent cutting through convex wall corners)
  if (isBlocked(map, newX, newY, r)) {
    // If combined new position clips a diagonal corner tile, fallback to sliding on the axis with larger movement
    if (Math.abs(dx) >= Math.abs(dy)) {
      if (!isBlocked(map, newX, currentY, r)) {
        player.x = newX;
        return;
      }
    } else {
      if (!isBlocked(map, currentX, newY, r)) {
        player.y = newY;
        return;
      }
    }
    return;
  }

  player.x = newX;
  player.y = newY;
}

export function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
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
  private textures: TextureMap;

  constructor(width: number) {
    this.zbuf = new Float32Array(width);
    this.textures = buildProceduralTextures();
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
    time: number,
    isAttacking = false,
    attackType: 'melee' | 'kick' | 'throw' = 'melee'
  ) {
    this.resize(width);

    const dirX = Math.cos(player.angle);
    const dirY = Math.sin(player.angle);
    const planeX = -dirY * 0.66;
    const planeY = dirX * 0.66;

    // 1. Render Sky & Floor with Perspective & Atmospheric Fog
    this.renderSkyAndFloor(ctx, width, height, realm, state, time);

    const flame = realm.entities.find((e) => e.kind === 'fire') || { x: 9999, y: 9999 };

    // 2. DDA Raycast with 64x64 Texture Sampling
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

      // Light shade calculation with torch and flame
      let light = state.torch ? Math.min(1.18, 1.45 / (0.42 + perp * 0.44)) : 0.12;
      light += Math.max(0, 0.85 - Math.hypot(mapX + 0.5 - flame.x, mapY + 0.5 - flame.y) * 0.22);
      if (state.miasmas > 25) {
        light *= Math.max(0.35, 1 - state.miasmas * 0.006);
      }
      const shade = Math.max(0.05, Math.min(1.25, light));

      // Draw textured wall column
      this.drawTexturedColumn(
        ctx,
        x,
        start,
        end,
        height,
        realm.map[mapY][mapX],
        texX,
        side,
        shade
      );
    }

    // 3. Render Sprites (sorted back to front)
    const sortedSprites = realm.entities
      .filter((e) => !e.isDead)
      .slice()
      .sort((a, b) => dist(player, b) - dist(player, a));

    for (const sprite of sortedSprites) {
      this.drawSprite(ctx, width, height, sprite, player, dirX, dirY, planeX, planeY, time);
    }

    // 4. Atmospheric Vignette Effect
    this.drawVignette(ctx, width, height, state);

    // 5. First-Person Viewmodel (Hands, Weapons & Kicks with Torch Logic)
    this.drawViewmodel(
      ctx,
      width,
      height,
      state,
      time,
      isAttacking,
      attackType
    );

    // 6. Crosshair
    ctx.strokeStyle = '#f5e6b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 5, height / 2);
    ctx.lineTo(width / 2 + 5, height / 2);
    ctx.moveTo(width / 2, height / 2 - 5);
    ctx.lineTo(width / 2, height / 2 + 5);
    ctx.stroke();

    // 7. Radar / Minimap
    if (state.radar) {
      this.drawRadar(ctx, width, height, realm, player);
    }
  }

  // Draw 64x64 Texture Pixel Column
  private drawTexturedColumn(
    ctx: CanvasRenderingContext2D,
    x: number,
    start: number,
    end: number,
    screenHeight: number,
    tileId: number,
    texX: number,
    side: number,
    shade: number
  ) {
    const texData = this.textures[tileId] || this.textures[2] || this.textures[1];
    const texPixels = texData.data;

    const actualStart = Math.max(0, start);
    const actualEnd = Math.min(screenHeight, end);
    const lineH = end - start;
    if (lineH <= 0) return;

    // Sample pixels along the vertical line
    const step = 64 / lineH;
    let texPos = (actualStart - start) * step;

    const sideDim = side === 1 ? 0.76 : 1.0;
    const finalShade = shade * sideDim;

    // Draw in small slices for sharp retro pixel aesthetics
    for (let y = actualStart; y < actualEnd; y++) {
      const texY = Math.min(63, Math.floor(texPos)) & 63;
      texPos += step;

      const idx = (texY * 64 + texX) * 4;
      const r = Math.min(255, Math.floor(texPixels[idx] * finalShade));
      const g = Math.min(255, Math.floor(texPixels[idx + 1] * finalShade));
      const b = Math.min(255, Math.floor(texPixels[idx + 2] * finalShade));

      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  // Sky and Floor with Atmospheric Dithering
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

      ctx.fillStyle = '#211c38';
      ctx.fillRect(0, height / 2, width, height / 2);
      return;
    }

    // Sky with clouds
    const sky = ctx.createLinearGradient(0, 0, 0, height / 2);
    sky.addColorStop(0, state.torch ? theme.sky0 : '#05060a');
    sky.addColorStop(1, state.torch ? theme.sky1 : '#12161a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height / 2);

    // Floor with perspective darkening
    const floor = ctx.createLinearGradient(0, height / 2, 0, height);
    floor.addColorStop(0, '#1a140f');
    floor.addColorStop(0.5, theme.floor0);
    floor.addColorStop(1, theme.floor1);
    ctx.fillStyle = floor;
    ctx.fillRect(0, height / 2, width, height / 2);
  }

  // Sprites: Enemies, Animals, Shrines, Fires
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

    // Fogueira Sagrada / Braseiro
    if (s.kind === 'fire') {
      const top = height / 2;
      const flicker = Math.sin(time * 0.018 + s.x) * 4;
      const g = ctx.createRadialGradient(screenX, top, 2, screenX, top, size * 0.45 + flicker);
      g.addColorStop(0, '#fff9d6');
      g.addColorStop(0.3, '#ffaa2b');
      g.addColorStop(0.7, '#ff4400');
      g.addColorStop(1, 'rgba(255,40,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(screenX, top, size * 0.45 + flicker, 0, Math.PI * 2);
      ctx.fill();

      // Pedras e lenha na base da fogueira
      ctx.fillStyle = '#382516';
      ctx.fillRect(screenX - size * 0.25, top + size * 0.2, size * 0.5, size * 0.12);
      return;
    }

    // Kiumba (Sombra Astral Mística com Olhos Vermelhos)
    if (s.kind === 'enemy' && s.enemyType === 'kiumba') {
      const top = height / 2 - size * 0.2;
      const floatOffset = Math.sin(time * 0.007 + s.x) * 7;
      const g = ctx.createRadialGradient(screenX, top + floatOffset, 2, screenX, top + floatOffset, size * 0.38);
      g.addColorStop(0, '#2d0838');
      g.addColorStop(0.65, '#120417');
      g.addColorStop(1, 'rgba(8,0,12,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(screenX, top + floatOffset, size * 0.38, 0, Math.PI * 2);
      ctx.fill();

      // Olhos flamejantes
      ctx.fillStyle = '#ff2b50';
      ctx.fillRect(screenX - size * 0.09, top + floatOffset - size * 0.04, Math.max(2, size * 0.04), Math.max(2, size * 0.04));
      ctx.fillRect(screenX + size * 0.05, top + floatOffset - size * 0.04, Math.max(2, size * 0.04), Math.max(2, size * 0.04));
      return;
    }

    // Capitão do Mato / Milícia Colonial
    if (s.kind === 'enemy') {
      const left = Math.floor(screenX - size / 2.6);
      const top = Math.floor(height / 2 - size / 2);
      const w = Math.floor(size * 0.75);

      for (let x = left; x < left + w; x++) {
        if (x < 0 || x >= width || this.zbuf[x] + 0.05 < ty) continue;

        // Chapéu colonial de abas largas
        ctx.fillStyle = '#3a2012';
        ctx.fillRect(x, top + size * 0.08, 1, size * 0.1);

        // Farda colonial
        ctx.fillStyle = s.enemyType === 'capitao' ? '#6e2b1f' : '#2b4763';
        ctx.fillRect(x, top + size * 0.18, 1, size * 0.4);

        // Calças e botas de couro
        ctx.fillStyle = '#615440';
        ctx.fillRect(x, top + size * 0.58, 1, size * 0.35);

        // Bacamarte / Espada na mão
        if (x > left + w * 0.7) {
          ctx.fillStyle = '#1c1c1c';
          ctx.fillRect(x, top + size * 0.3, 1, size * 0.45);
        }
      }
      return;
    }

    // Animais Silvestres (Coelho, Javali, Pato, Peixe)
    if (s.kind === 'animal') {
      const left = Math.floor(screenX - size / 3.2);
      const top = Math.floor(height / 2 + size * 0.08);
      const w = Math.floor(size * 0.6);

      let animalColor = '#ba9f83';
      if (s.animalType === 'javali') animalColor = '#422818';
      if (s.animalType === 'pato') animalColor = '#326947';
      if (s.animalType === 'peixe') animalColor = '#4a95bf';

      for (let x = left; x < left + w; x++) {
        if (x < 0 || x >= width || this.zbuf[x] + 0.05 < ty) continue;
        ctx.fillStyle = animalColor;
        ctx.fillRect(x, top, 1, size * 0.32);

        // Detalhe de orelha/olho
        if (x === left + 4) {
          ctx.fillStyle = '#1a140f';
          ctx.fillRect(x, top + 2, 1, 3);
        }
      }
      return;
    }

    // Cruzeiros e Altares Sagrados
    const left = Math.floor(screenX - size / 2);
    const top = Math.floor(height / 2 - size / 2);

    let color = '#e7c27b';
    if (s.kind === 'gate') color = s.color || '#fff';
    else if (s.kind === 'person') color = '#e0b88f';
    else if (s.kind === 'portal') color = '#fff2a8';
    else if (s.visited) color = '#8d784a';

    for (let x = left; x < left + size; x++) {
      if (x < 0 || x >= width || this.zbuf[x] + 0.05 < ty) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x, top + size * 0.2, 1, size * 0.62);

      // Vela / Luz no topo do marco
      if (x > left + size * 0.45 && x < left + size * 0.55) {
        ctx.fillStyle = '#ffeaa7';
        ctx.fillRect(x, top + size * 0.1, 1, size * 0.12);
      }
    }
  }

  // Atmospheric Vignette on Screen Edges
  private drawVignette(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    state: SurvivalState
  ) {
    const g = ctx.createRadialGradient(
      width / 2,
      height / 2,
      width * 0.32,
      width / 2,
      height / 2,
      width * 0.72
    );
    const darkness = state.torch ? 'rgba(7, 5, 11, 0.45)' : 'rgba(3, 2, 6, 0.88)';
    g.addColorStop(0, 'rgba(0, 0, 0, 0)');
    g.addColorStop(1, darkness);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);

    // Miasmas purple vignette edge if contaminated
    if (state.miasmas > 20) {
      const mg = ctx.createRadialGradient(
        width / 2,
        height / 2,
        width * 0.4,
        width / 2,
        height / 2,
        width * 0.7
      );
      mg.addColorStop(0, 'rgba(0, 0, 0, 0)');
      mg.addColorStop(1, `rgba(75, 15, 90, ${Math.min(0.7, state.miasmas * 0.007)})`);
      ctx.fillStyle = mg;
      ctx.fillRect(0, 0, width, height);
    }
  }

  // Realistic Viewmodel:
  // If Torch is ON: Right hand holds lit torch! Attack triggers a Foot Kick (Chute Frontal / Bênção / Martelo).
  // If Torch is OFF: Both hands free (Ginga dual fists or two-handed spear/bow).
  private drawViewmodel(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    state: SurvivalState,
    time: number,
    isAttacking: boolean,
    attackType: 'melee' | 'kick' | 'throw'
  ) {
    const bob = Math.sin(time * 0.008) * 3;
    const isTorchOn = state.torch;

    // Se a tocha estiver ACESA, a mão direita está ocupada com a tocha!
    // O ataque de combate corporal é executado com os PÉS (Chute Frontal / Martelo de Capoeira)!
    if (isTorchOn) {
      // 1. Tocha realista na mão direita
      this.drawRealisticTorch(ctx, width, height, time);

      // 2. Mão esquerda livre em guarda de ginga
      const leftHandX = width * 0.28 + Math.cos(time * 0.006) * 4;
      const leftHandY = height * 0.85 + bob;
      this.drawArmAndFist(ctx, leftHandX, leftHandY, -0.2);

      // 3. Chute com o pé se estiver atacando (ou se for o golpe de capoeira com a tocha acesa)
      if (isAttacking || attackType === 'kick') {
        this.drawFootKick(ctx, width, height, time);
      } else if (state.activeWeapon === 'pedra') {
        // Mão esquerda segura a pedra para arremesso
        this.drawStoneInLeftHand(ctx, leftHandX, leftHandY);
      }
    } else {
      // Tocha apagada: ambas as mãos livres!
      if (state.activeWeapon === 'capoeira') {
        if (attackType === 'kick') {
          this.drawFootKick(ctx, width, height, time);
        } else {
          // Ginga completa com os dois punhos
          const leftX = width * 0.32 + Math.cos(time * 0.006) * 6;
          const leftY = height * 0.8 + bob + (isAttacking ? -35 : 0);
          const rightX = width * 0.64 - Math.cos(time * 0.006) * 6;
          const rightY = height * 0.78 - bob + (isAttacking ? -30 : 0);

          this.drawArmAndFist(ctx, leftX, leftY, -0.25);
          this.drawArmAndFist(ctx, rightX, rightY, 0.25);
        }
      } else if (state.activeWeapon === 'pedra') {
        const handX = width * 0.58;
        const handY = height * 0.78 + bob + (isAttacking ? -40 : 0);
        this.drawHandHoldingStone(ctx, handX, handY);
      } else if (state.activeWeapon === 'lanca') {
        this.drawSpear(ctx, width, height, bob, isAttacking);
      } else if (state.activeWeapon === 'arco') {
        this.drawBow(ctx, width, height, bob, isAttacking);
      }
    }
  }

  // Chute de Capoeira em Primeira Pessoa (Bênção / Martelo Lateral)
  private drawFootKick(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number
  ) {
    const footX = width * 0.5;
    const footY = height * 0.52; // Pé esticado no centro da visão

    ctx.save();
    // Perna vindo da parte inferior
    ctx.strokeStyle = '#4a2b16';
    ctx.lineWidth = 32;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(width * 0.42, height + 40);
    ctx.lineTo(footX, footY + 20);
    ctx.stroke();

    // Faixa / tornozeleira de palha trançada
    ctx.strokeStyle = '#d6c496';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(footX - 12, footY + 24);
    ctx.lineTo(footX + 12, footY + 20);
    ctx.stroke();

    // Pé descalço com calcanhar e sola
    ctx.fillStyle = '#5c381e';
    ctx.beginPath();
    ctx.ellipse(footX, footY, 32, 20, -0.15, 0, Math.PI * 2);
    ctx.fill();

    // Dedos do pé esticados no impacto
    ctx.fillStyle = '#6e4426';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(footX - 16 + i * 8, footY - 14, 5.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Linha de impacto cinético de ar
    ctx.strokeStyle = 'rgba(255, 230, 160, 0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(footX, footY - 10, 36, -Math.PI * 0.8, -Math.PI * 0.2);
    ctx.stroke();

    ctx.restore();
  }

  // Tocha Realista com Cabo de Madeira Rústica, Fogo e Faíscas
  private drawRealisticTorch(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number
  ) {
    const torchX = width * 0.8;
    const torchY = height * 0.76;
    const flicker = Math.sin(time * 0.02) * 3;

    // 1. Braço direito segurando a tocha
    ctx.fillStyle = '#4a2b16';
    ctx.beginPath();
    ctx.moveTo(width * 0.85, height + 30);
    ctx.lineTo(torchX + 12, torchY + 45);
    ctx.lineTo(torchX - 12, torchY + 45);
    ctx.lineTo(width * 0.7, height + 30);
    ctx.closePath();
    ctx.fill();

    // Munhequeira de corda
    ctx.fillStyle = '#bda573';
    ctx.fillRect(torchX - 14, torchY + 40, 28, 8);

    // Mão cerrando o cabo
    ctx.fillStyle = '#5c381e';
    ctx.beginPath();
    ctx.ellipse(torchX, torchY + 36, 16, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Cabo de madeira rústica da tocha
    ctx.fillStyle = '#5c3a21';
    ctx.fillRect(torchX - 4, torchY - 8, 8, 48);
    ctx.fillStyle = '#3d2514';
    ctx.fillRect(torchX - 4, torchY - 8, 3, 48);

    // Braçadeira de ferro que segura o pano embebido em óleo
    ctx.fillStyle = '#1c1b1a';
    ctx.fillRect(torchX - 8, torchY - 14, 16, 8);

    // 3. Chama viva realista com gradiente
    const g = ctx.createRadialGradient(
      torchX + flicker,
      torchY - 26,
      4,
      torchX,
      torchY - 18,
      44
    );
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.2, '#fff494');
    g.addColorStop(0.55, '#ff8a14');
    g.addColorStop(0.85, '#e03800');
    g.addColorStop(1, 'rgba(200, 30, 0, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(torchX + flicker, torchY - 22, 42, 0, Math.PI * 2);
    ctx.fill();

    // 4. Brasas e faíscas subindo
    ctx.fillStyle = '#ffdf7a';
    for (let i = 0; i < 6; i++) {
      const sparkY = (torchY - 30 - ((time * 0.08 + i * 16) % 50));
      const sparkX = torchX + Math.sin(time * 0.03 + i) * 14;
      ctx.fillRect(sparkX, sparkY, 2, 2);
    }
  }

  private drawArmAndFist(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    rot: number
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    // Punho cerrado
    ctx.fillStyle = '#4a2b16';
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 17, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dedos
    ctx.fillStyle = '#5e381f';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(-12 + i * 8, -8, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Amarra de palha/corda
    ctx.fillStyle = '#c7b385';
    ctx.fillRect(-16, 10, 32, 6);

    ctx.restore();
  }

  private drawStoneInLeftHand(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = '#7a7e85';
    ctx.beginPath();
    ctx.arc(x, y - 16, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#474a4f';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  private drawHandHoldingStone(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Pedra
    ctx.fillStyle = '#7a7e85';
    ctx.beginPath();
    ctx.arc(x, y - 12, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#474a4f';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Mão segurando
    ctx.fillStyle = '#4a2b16';
    ctx.beginPath();
    ctx.ellipse(x, y, 18, 16, 0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawSpear(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    bob: number,
    isAttacking: boolean
  ) {
    const tipX = width * 0.5;
    const tipY = height * 0.44 + bob + (isAttacking ? -45 : 0);
    const baseX = width * 0.35;
    const baseY = height + 30;

    // Madeira
    ctx.strokeStyle = '#6e411d';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();

    // Ponta forjada de ferro
    ctx.fillStyle = '#cfd8dc';
    ctx.beginPath();
    ctx.moveTo(tipX, tipY - 26);
    ctx.lineTo(tipX - 9, tipY + 4);
    ctx.lineTo(tipX + 9, tipY + 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#78909c';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  private drawBow(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    bob: number,
    isAttacking: boolean
  ) {
    const bowX = width * 0.48;
    const bowY = height * 0.72 + bob;

    ctx.strokeStyle = '#7d4f29';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(bowX, bowY, 68, -Math.PI * 0.4, Math.PI * 0.4);
    ctx.stroke();

    // Corda
    ctx.strokeStyle = '#f0e6ce';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(bowX + Math.cos(-Math.PI * 0.4) * 68, bowY + Math.sin(-Math.PI * 0.4) * 68);
    ctx.lineTo(bowX - 12 + (isAttacking ? -25 : 0), bowY);
    ctx.lineTo(bowX + Math.cos(Math.PI * 0.4) * 68, bowY + Math.sin(Math.PI * 0.4) * 68);
    ctx.stroke();

    // Flecha
    ctx.strokeStyle = '#ba8d5d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bowX - 12 + (isAttacking ? -25 : 0), bowY);
    ctx.lineTo(bowX + 55 + (isAttacking ? 35 : 0), bowY);
    ctx.stroke();
  }

  // Radar / Minimap
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

    ctx.fillStyle = 'rgba(8,16,18,0.88)';
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

    // Entities
    realm.entities.forEach((e) => {
      if (e.isDead) return;
      if (e.countsAsPoint) {
        ctx.fillStyle = e.visited ? '#8d7a48' : '#ffe08a';
        ctx.fillRect(ox + e.x * scale - 1, oy + e.y * scale - 1, 2, 2);
      } else if (e.kind === 'fire') {
        ctx.fillStyle = '#ff8a3d';
        ctx.fillRect(ox + e.x * scale - 1, oy + e.y * scale - 1, 2.5, 2.5);
      } else if (e.kind === 'enemy') {
        ctx.fillStyle = '#ff2040';
        ctx.fillRect(ox + e.x * scale - 1.5, oy + e.y * scale - 1.5, 3, 3);
      } else if (e.kind === 'animal') {
        ctx.fillStyle = '#7cff6b';
        ctx.fillRect(ox + e.x * scale - 1, oy + e.y * scale - 1, 2, 2);
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
