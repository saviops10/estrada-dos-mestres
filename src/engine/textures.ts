// textures.ts — Gerador Procedural de Texturas Pixel-Art 64x64 em Tempo Real
// Cria texturas ricas para paredes, cais, pedras, palicadas e altares

const TEXTURE_SIZE = 64;

export interface TextureMap {
  [key: number]: ImageData;
}

function createOffscreenContext(): CanvasRenderingContext2D {
  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE_SIZE;
  canvas.height = TEXTURE_SIZE;
  return canvas.getContext('2d')!;
}

// 1. Mata Atlântica (Casca de árvore, musgo e cipós verdes)
function generateMataTexture(): ImageData {
  const ctx = createOffscreenContext();
  ctx.fillStyle = '#1c3d24';
  ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);

  // Casca e ranhuras
  for (let x = 0; x < TEXTURE_SIZE; x += 4) {
    const shade = (Math.sin(x * 0.4) + 1) * 12;
    ctx.fillStyle = `rgb(${20 + shade}, ${45 + shade}, ${25 + shade})`;
    ctx.fillRect(x, 0, 3, TEXTURE_SIZE);
  }

  // Folhagens e cipós
  ctx.fillStyle = '#2f6938';
  for (let i = 0; i < 40; i++) {
    const rx = (i * 17) % TEXTURE_SIZE;
    const ry = (i * 29) % TEXTURE_SIZE;
    ctx.fillRect(rx, ry, 3, 5);
  }
  ctx.fillStyle = '#489656';
  for (let i = 0; i < 20; i++) {
    const rx = (i * 23) % TEXTURE_SIZE;
    const ry = (i * 31) % TEXTURE_SIZE;
    ctx.fillRect(rx, ry, 2, 3);
  }
  return ctx.getImageData(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
}

// 2. Pedra Colonial / Cantaria (Blocos de pedra cinza com rejunte escuro e musgo)
function generateStoneTexture(): ImageData {
  const ctx = createOffscreenContext();
  ctx.fillStyle = '#555b61';
  ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);

  // Blocos de pedra
  const rows = 4;
  const rowHeight = TEXTURE_SIZE / rows;

  for (let r = 0; r < rows; r++) {
    const y = r * rowHeight;
    const offset = (r % 2) * 16;
    for (let x = 0; x < TEXTURE_SIZE; x += 32) {
      const bx = (x + offset) % TEXTURE_SIZE;
      const shade = ((r + bx) % 3) * 8;
      ctx.fillStyle = `rgb(${95 + shade}, ${100 + shade}, ${105 + shade})`;
      ctx.fillRect(bx + 1, y + 1, 30, rowHeight - 2);

      // Rejunte escuro
      ctx.fillStyle = '#2d3033';
      ctx.fillRect(bx, y, 32, 1);
      ctx.fillRect(bx, y, 1, rowHeight);
    }
  }

  // Manchas de tempo e musgo
  ctx.fillStyle = '#3f593e';
  for (let i = 0; i < 16; i++) {
    ctx.fillRect((i * 13) % TEXTURE_SIZE, (i * 19) % TEXTURE_SIZE, 3, 2);
  }
  return ctx.getImageData(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
}

// 3. Tronco Gigante / Madeira
function generateTrunkTexture(): ImageData {
  const ctx = createOffscreenContext();
  ctx.fillStyle = '#422817';
  ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);

  for (let x = 0; x < TEXTURE_SIZE; x += 8) {
    const shade = (x % 16 === 0) ? -15 : 10;
    ctx.fillStyle = `rgb(${75 + shade}, ${48 + shade}, ${28 + shade})`;
    ctx.fillRect(x, 0, 7, TEXTURE_SIZE);

    // Nós de madeira
    ctx.fillStyle = '#29180c';
    ctx.fillRect(x + 2, (x * 7) % TEXTURE_SIZE, 3, 6);
  }
  return ctx.getImageData(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
}

// 4. Paliçada do Quilombo (Troncos apontados e amarras)
function generatePalisadeTexture(): ImageData {
  const ctx = createOffscreenContext();
  ctx.fillStyle = '#26160b';
  ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);

  const logs = 6;
  const logWidth = TEXTURE_SIZE / logs;

  for (let l = 0; l < logs; l++) {
    const lx = l * logWidth;
    // Tronco
    ctx.fillStyle = l % 2 === 0 ? '#7d5229' : '#8c5d31';
    ctx.fillRect(lx + 1, 0, logWidth - 2, TEXTURE_SIZE);

    // Sombra lateral do tronco para dar volume 3D
    ctx.fillStyle = '#452912';
    ctx.fillRect(lx + 1, 0, 2, TEXTURE_SIZE);
    ctx.fillStyle = '#ab7542';
    ctx.fillRect(lx + logWidth - 3, 0, 1, TEXTURE_SIZE);

    // Amarras de cipó / corda
    ctx.fillStyle = '#c2a66f';
    ctx.fillRect(lx, 16, logWidth, 3);
    ctx.fillRect(lx, 44, logWidth, 3);
  }
  return ctx.getImageData(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
}

// 5. Altar Sagrado / Ouro e Pemba Riscada
function generateAltarTexture(): ImageData {
  const ctx = createOffscreenContext();
  ctx.fillStyle = '#b89337';
  ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);

  // Borda sagrada entalhada
  ctx.fillStyle = '#7a5a14';
  ctx.fillRect(0, 0, TEXTURE_SIZE, 4);
  ctx.fillRect(0, TEXTURE_SIZE - 4, TEXTURE_SIZE, 4);
  ctx.fillRect(0, 0, 4, TEXTURE_SIZE);
  ctx.fillRect(TEXTURE_SIZE - 4, 0, 4, TEXTURE_SIZE);

  // Glifos e símbolos de ponto riscado
  ctx.fillStyle = '#fce492';
  ctx.fillRect(8, 8, TEXTURE_SIZE - 16, 2);
  ctx.fillRect(8, TEXTURE_SIZE - 10, TEXTURE_SIZE - 16, 2);

  // Cruz central com sol
  ctx.fillStyle = '#261705';
  ctx.fillRect(TEXTURE_SIZE / 2 - 2, 16, 4, 32);
  ctx.fillRect(20, TEXTURE_SIZE / 2 - 2, 24, 4);
  return ctx.getImageData(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
}

// 6. Caravela Negreira / Cais do Porto (Madeira naval tratada com piche)
function generateCaravelaTexture(): ImageData {
  const ctx = createOffscreenContext();
  ctx.fillStyle = '#1e242b';
  ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);

  // Tábuas horizontais de navio
  for (let y = 0; y < TEXTURE_SIZE; y += 12) {
    ctx.fillStyle = (y % 24 === 0) ? '#384857' : '#2b3742';
    ctx.fillRect(0, y + 1, TEXTURE_SIZE, 10);

    // Pregos / rebites de ferro
    ctx.fillStyle = '#111417';
    ctx.fillRect(6, y + 5, 2, 2);
    ctx.fillRect(26, y + 5, 2, 2);
    ctx.fillRect(46, y + 5, 2, 2);

    // Linha escura de calafeto
    ctx.fillStyle = '#0f1317';
    ctx.fillRect(0, y, TEXTURE_SIZE, 1);
  }
  return ctx.getImageData(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
}

// 8. Muro de Cemitério / Adobe Colonial
function generateAdobeTexture(): ImageData {
  const ctx = createOffscreenContext();
  ctx.fillStyle = '#b0a48b';
  ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);

  // Rachaduras antigas
  ctx.fillStyle = '#6e634e';
  for (let i = 0; i < 30; i++) {
    const rx = (i * 23) % TEXTURE_SIZE;
    const ry = (i * 19) % TEXTURE_SIZE;
    ctx.fillRect(rx, ry, 2, 3);
  }

  // Base com umidade da terra
  ctx.fillStyle = '#5e4e3b';
  ctx.fillRect(0, TEXTURE_SIZE - 10, TEXTURE_SIZE, 10);
  return ctx.getImageData(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
}

// 9. Cidade da Lira (Tijolos terracota com lanternas)
function generateLiraTexture(): ImageData {
  const ctx = createOffscreenContext();
  ctx.fillStyle = '#873c3c';
  ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);

  for (let y = 0; y < TEXTURE_SIZE; y += 8) {
    const offset = (y % 16 === 0) ? 0 : 12;
    for (let x = 0; x < TEXTURE_SIZE; x += 24) {
      const bx = (x + offset) % TEXTURE_SIZE;
      ctx.fillStyle = '#b55555';
      ctx.fillRect(bx + 1, y + 1, 22, 6);
      ctx.fillStyle = '#421a1a';
      ctx.fillRect(bx, y, 24, 1);
    }
  }
  return ctx.getImageData(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
}

// 10. Rochas das Almas (Granito e pedra ardósia escura)
function generateAlmasTexture(): ImageData {
  const ctx = createOffscreenContext();
  ctx.fillStyle = '#475357';
  ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);

  for (let i = 0; i < 50; i++) {
    const rx = (i * 29) % TEXTURE_SIZE;
    const ry = (i * 37) % TEXTURE_SIZE;
    ctx.fillStyle = i % 2 === 0 ? '#63747a' : '#2b3336';
    ctx.fillRect(rx, ry, 3, 3);
  }
  return ctx.getImageData(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
}

// 11. Espaço Astral dos Cruzeiros (Vazio cósmico com runas roxas e douradas)
function generateSpaceTexture(): ImageData {
  const ctx = createOffscreenContext();
  ctx.fillStyle = '#0a0817';
  ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);

  // Constelações
  ctx.fillStyle = '#c7b0ff';
  for (let i = 0; i < 25; i++) {
    const rx = (i * 19) % TEXTURE_SIZE;
    const ry = (i * 31) % TEXTURE_SIZE;
    ctx.fillRect(rx, ry, (i % 3 === 0) ? 2 : 1, (i % 3 === 0) ? 2 : 1);
  }
  return ctx.getImageData(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
}

export function buildProceduralTextures(): TextureMap {
  return {
    1: generateMataTexture(),
    2: generateStoneTexture(),
    3: generateTrunkTexture(),
    4: generatePalisadeTexture(),
    5: generateAltarTexture(),
    6: generateCaravelaTexture(),
    8: generateAdobeTexture(),
    9: generateLiraTexture(),
    10: generateAlmasTexture(),
    11: generateSpaceTexture()
  };
}
