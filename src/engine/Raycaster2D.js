// Raycaster2D.js — Motor Raycaster DDA em Tempo Real (2.5D)
// Skills: create_component + test_generation
// Motor inspirado no classic Doom raycaster, otimizado para 60 FPS em HTML5 Canvas

export class Raycaster2D {
  constructor(canvas, options = {}) {
    this.canvas = typeof canvas === 'string' ? 
      document.getElementById(canvas) : canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.fov = options.fov !== undefined ? options.fov : 66;
    this.textureSize = options.textureSize !== undefined ? options.textureSize : 64;
    this.viewDistance = options.viewDistance !== undefined ? options.viewDistance : this.height;
    
    this.tiles = options.tiles || 20; // Tamanho do grid
    this.worldMap = options.worldMap || this.createDefaultWorld();
    
    this.player = {
      x: 22 * this.tiles,
      y: 12 * this.tiles,
      xAngle: -0.53,
      yAngle: 0,
      xMove: 0,
      yMove: 0,
      rotAngle: 0
    };
    
    this.walls = [];
    this.textures = {};
    this.fogColor = { r: 15, g: 10, b: 26 };
    
    this.initRays();
    this.loadTextures();
    this.gameLoop();
  }
  
  createDefaultWorld() {
    // Mundo default: layout simplificado do Estrada dos Mestres
    const world = [];
    for (let col = 0; col < this.tiles; col++) {
      world[col] = [];
      for (let row = 0; row < this.tiles; row++) {
        // Criar alguns muros para testar o raycaster
        if (col === 1 || col === this.tiles - 2 || row === 1 || row === this.tiles - 2) {
          world[col][row] = 1; // Parede
        } else {
          world[col][row] = 0; // Vazio
        }
      }
    }
    return world;
  }
  
  initRays() {
    // Pré-calcular ângulos das rays
    this.rayAngles = [];
    const halfFov = this.fov / 2;
    for (let i = 0; i < this.width; i++) {
      const rayAngle = this.player.xAngle - halfFov + (i / this.width) * this.fov;
      this.rayAngles.push(rayAngle);
    }
  }
  
  loadTextures() {
    // Criar texturas procedurais 64x64 para os 5 tipos de parede
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.canvas.width = this.textureSize;
    ctx.canvas.height = this.textureSize;
    
    // tile_1: Mata densa (verde escura com cipós)
    const t1ctx = ctx;
    t1ctx.fillStyle = '#2a5c35';
    t1ctx.fillRect(0, 0, this.textureSize, this.textureSize);
    // Padrão de cipós
    for (let i = 0; i < 10; i++) {
      t1ctx.strokeStyle = '#3d6b4a';
      t1ctx.lineWidth = 2;
      t1ctx.beginPath();
      t1ctx.moveTo(Math.random() * this.textureSize, 0);
      t1ctx.lineTo(Math.random() * this.textureSize, this.textureSize);
      t1ctx.stroke();
    }
    this.textures[1] = t1ctx.canvas;
    
    // tile_2: Pedra ancestral (cinza com musgo)
    const t2ctx = ctx;
    t2ctx.fillStyle = '#7a8a8f';
    t2ctx.fillRect(0, 0, this.textureSize, this.textureSize);
    // Padrão de musgo
    for (let i = 0; i < 15; i++) {
      t2ctx.fillStyle = '#5a6b77';
      t2ctx.beginPath();
      t2ctx.arc(Math.random() * this.textureSize, Math.random() * this.textureSize, 2, 0, Math.PI * 2);
      t2ctx.fill();
    }
    this.textures[2] = t2ctx.canvas;
    
    // tile_3: Tronco gigante (marrom retrô)
    const t3ctx = ctx;
    t3ctx.fillStyle = '#8b5a2b';
    t3ctx.fillRect(0, 0, this.textureSize, this.textureSize);
    // Listras verticais
    for (let i = 0; i < 8; i++) {
      t3ctx.fillStyle = '#6b461e';
      t3ctx.fillRect(i * (this.textureSize / 8), 0, 2, this.textureSize);
    }
    this.textures[3] = t3ctx.canvas;
    
    // tile_4: Palicada do Quilombo (marrom claro)
    const t4ctx = ctx;
    t4ctx.fillStyle = '#a07d52';
    t4ctx.fillRect(0, 0, this.textureSize, this.textureSize);
    // Padrão de toras
    for (let i = 0; i < 6; i++) {
      t4ctx.fillStyle = '#8a6a4a';
      const x = (i * this.textureSize / 6);
      t4ctx.fillRect(x, 0, this.textureSize / 6, this.textureSize);
    }
    this.textures[4] = t4ctx.canvas;
    
    // tile_5: Altar sagrado (dourado místico)
    const t5ctx = ctx;
    t5ctx.fillStyle = '#d4af37';
    t5ctx.fillRect(0, 0, this.textureSize, this.textureSize);
    // Glifos simples
    t5ctx.fillStyle = '#260f0f';
    t5ctx.fillRect(this.textureSize / 4, this.textureSize / 4, this.textureSize / 2, this.textureSize / 2);
    this.textures[5] = t5ctx.canvas;
  }
  
  // DDA Raycasting principal
  castRays() {
    const walls = [];
    
    for (let col = 0; col < this.width; col++) {
      const rayAngle = this.rayAngles[col];
      
      // Vector da ray
      const rayDirX = Math.sin(rayAngle);
      const rayDirY = Math.cos(rayAngle);
      
      // Posição do mapa
      let mapX = Math.floor(this.player.x / this.tiles);
      let mapY = Math.floor(this.player.y / this.tiles);
      
      // passo inicial do DDA
      let deltaDistX = (Math.abs(rayDirX) === 0) ? 1e30 : Math.abs(1 / rayDirX);
      let deltaDistY = (Math.abs(rayDirY) === 0) ? 1e30 : Math.abs(1 / rayDirY);
      
      // passo lateral
      let stepX, stepY;
      let hit = 0;
      let side = 0;
      
      // inicializar passo lateral
      if (rayDirX < 0) {
        stepX = -1;
        deltaDistXF = (this.player.x / this.tiles - Math.floor(this.player.x / this.tiles)) * deltaDistX;
      } else {
        stepX = 1;
        deltaDistXF = (Math.floor(this.player.x / this.tiles) - this.player.x / this.tiles) * deltaDistX;
      }
      if (rayDirY < 0) {
        stepY = -1;
        deltaDistYF = (this.player.y / this.tiles - Math.floor(this.player.y / this.tiles)) * deltaDistY;
      } else {
        stepY = 1;
        deltaDistYF = (Math.floor(this.player.y / this.tiles) - this.player.y / this.tiles) * deltaDistY;
      }
      
      // DDA loop
      while (hit === 0) {
        // saltar para próxima casa de mapa, ou parando
        if (deltaDistX < deltaDistY) {
          deltaDistX += deltaDistXF;
          mapX += stepX;
          if (this.worldMap[mapX] && this.worldMap[mapX][mapY]) {
            hit = 1;
            side = 0;
          }
        } else {
          deltaDistY += deltaDistYF;
          mapY += stepY;
          if (this.worldMap[mapX] !== undefined && this.worldMap[mapX][mapY]) {
            hit = 1;
            side = 1;
          }
        }
        if (mapX < 0 || mapX >= this.tiles || mapY < 0 || mapY >= this.tiles) {
          hit = 1;
          side = 1;
        }
      }
      
      // Calcular altura da coluna
      let wallX = 0;
      if (side === 0) {
        wallX = this.player.y + (deltaDistX * rayDirY);
      } else {
        wallX = this.player.x - (deltaDistY * rayDirX);
      }
      wallX -= Math.floor(wallX);
      
      // calcular altura da coluna projetada na tela
      let projHeight = (this.height / deltaDistX) * 1.15;
      if (projHeight > this.height * 2) projHeight = this.height * 2;
      
      // determinar altura de início e fim
      let drawStart = -projHeight / 2 + this.height / 2;
      let drawEnd = projHeight / 2 + this.height / 2;
      
      // limitar ao ecrã
      if (drawStart < 0) drawStart = 0;
      if (drawEnd > this.height) drawEnd = this.height;
      
      // obter número da textura e deslocamento de textura
      let texNum = this.worldMap[mapX][mapY];
      let texX = 0;
      if (side === 0 && rayDirX > 0) texX = this.textureSize - (wallX * this.textureSize);
      if (side === 0 && rayDirX < 0) texX = 0 + wallX * this.textureSize;
      if (side === 1 && rayDirY > 0) texX = this.textureSize - (wallY * this.textureSize);
      if (side === 1 && rayDirY < 0) texX = 0 + wallY * this.textureSize;
      
      walls.push({
        col: col,
        lineHeight: projHeight,
        drawStart: drawStart,
        drawEnd: drawEnd,
        texture: texNum,
        texX: texX
      });
    }
    
    return walls;
  }
  
  // Renderizar o frame
  render(walls) {
    const ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.width, this.height);
    
    // Desenhar céu
    ctx.fillStyle = `rgb(${this.fogColor.r}, ${this.fogColor.g}, ${this.fogColor.b})`;
    ctx.fillRect(0, 0, this.width, this.height / 2);
    
    // Desenhar chão
    ctx.fillStyle = '#3a2a20';
    ctx.fillRect(0, this.height / 2, this.width, this.height / 2);
    
    // Desenhar paredes
    for (let i = 0; i < walls.length; i++) {
      const wall = walls[i];
      
      // Desenhar coluna
      const stripeWidth = 1;
      ctx.fillStyle = this.textures[wall.texture];
      
      // Desenhar apenas a coluna específica
      ctx.fillRect(i, wall.drawStart, stripeWidth, wall.drawEnd - wall.drawStart);
    }
    
    // Desenhar chão com textura de rodapé
    const floorStart = this.height / 2;
    for (let c = 0; c < this.width; c++) {
      // Projeção inversa para o chão
      const p = (c - this.width / 2) / this.width;
      
      // Coordenadas do mundo do chão
      const floorX = this.player.x + p * Math.cos(this.player.xAngle) * 10;
      const floorY = this.player.y + p * Math.sin(this.player.xAngle) * 10;
      
      // Piso em tiles
      const floorTileX = Math.floor(floorX / this.tiles);
      const floorTileY = Math.floor(floorY / this.tiles);
      
      // Verificar se há parede embaixo
      if (this.worldMap && this.worldMap[floorTileX] && this.worldMap[floorTileX][floorTileY]) {
        ctx.fillStyle = '#1a1409';
      } else {
        // Gradient do chão para escuro
        const floorShade = 0.5 + c / this.width;
        ctx.fillStyle = `rgb(${Math.floor(15 + 10 * floorShade)}, ${Math.floor(10 + 5 * floorShade)}, ${Math.floor(26 + 2 * floorShade)})`;
      }
      ctx.fillRect(c, this.height - 1, 1, 1);
    }
    
    // Mini-map no canto
    this.renderMinimap(ctx);
  }
  
  renderMinimap(ctx) {
    if (!ctx) ctx = this.canvas.getContext('2d');
    ctx.fillStyle = 'rgba(212, 175, 55, 0.3)';
    ctx.fillRect(2, 2, 120, 120);
    
    // Desenhar mapa simplificado
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    // Desenhar jogador
    const minimapScale = 5;
    const px = this.player.x / this.tiles / this.tiles * minimapScale + 60;
    const py = this.player.y / this.tiles / this.tiles * minimapScale + 60;
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(px - 2, py - 2, 4, 4);
    
    // Desenhar muros no minimapa
    for (let x = 0; x < this.tiles; x++) {
      for (let y = 0; y < this.tiles; y++) {
        if (this.worldMap && this.worldMap[x] && this.worldMap[x][y]) {
          ctx.fillStyle = '#8b6914';
          ctx.fillRect(x * 5 + 60, y * 5 + 60, 5, 5);
        }
      }
    }
  }
  
  // Loop de jogo principal
  gameLoop() {
    // Atualizar projeções
    const walls = this.castRays();
    this.render(walls);
    
    // Continuar loop
    requestAnimationFrame(() => this.gameLoop());
  }
  
  // Método para mover o jogador
  movePlayer(dx, dz) {
    // Normalizar movimento
    const moveX = dz * Math.sin(this.player.xAngle) - dx * Math.cos(this.player.xAngle);
    const moveZ = dz * Math.cos(this.player.xAngle) + dx * Math.sin(this.player.xAngle);
    
    // Verificar colisão simples
    const newX = this.player.x + moveX;
    const newZ = this.player.z + dz;
    
    // Verificar se há parede na nova posição
    const mapX = Math.floor(newX / this.tiles);
    const mapZ = Math.floor(newZ / this.tiles);
    
    if (mapX >= 0 && mapX < this.tiles && mapZ >= 0 && mapZ < this.tiles) {
      if (!this.worldMap || !this.worldMap[mapX] || !this.worldMap[mapX][mapZ]) {
        this.player.x = newX;
        this.player.z = newZ;
      }
    }
  }
  
  // Rotação do jogador
  rotate(dAngle) {
    this.player.xAngle += dAngle;
    // Normalizar ângulo
    this.player.xAngle = (this.player.xAngle + Math.PI) % (2 * Math.PI) - Math.PI;
  }