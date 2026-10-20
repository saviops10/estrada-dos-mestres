// Camera.js — Controle de Câmera, Rotação e Head-Bobbing
// Skills: style_component + cross_browser_test

export class Camera {
  constructor(options = {}) {
    this.fov = 66; // Field of view em graus (estilo DOOM)
    this.speed = 3; // Unidades por segundo
    this.sensitivity = 0.15; // Sensibilidade de mouse
    this.headBob = true; // Efeito de balanço ao correr
    this.canMove = true;
    
    this.position = { x: 0, y: 0, z: 0 };
    this.rotation = { x: 0, y: 0 }; // pitch, yaw
    this.velocity = { x: 0, z: 0 };
    
  this.isRunning = false;
    this.lastTime = Date.now();
    
    this.initMouseListeners();
    this.lastUpdate = Date.now();
  }
  
  initMouseListeners() {
    // Listeners serão adicionados pelo jogo principal
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
  }
  
  onMouseMove(event) {
    // Capturar rotação do mouse para olhar ao redor
    // Isso será conectado pelo jogo principal
    if (this.canMove) {
      this.rotation.y += event.movementX * this.sensitivity;
      this.rotation.x += event.movementY * this.sensitivity;
      // Limitar pitch para não dar looping
      this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));
    }
  }
  
  onKeyDown(event) {
    // Capturar teclado para movimento
    // Isto será conectado pelo jogo principal
    const key = event.key.toLowerCase();
    
    const movement = {
      forward: key === 'w' || key === 'arrowup',
      backward: key === 's' || key === 'arrowdown',
      left: key === 'a' || key === 'arrowleft',
      right: key === 'd' || key === 'arrowright',
      run: key === 'shift'
    };
    
    this.handleInput(movement);
  }
  
  onKeyUp(event) {
    const key = event.key.toLowerCase();
    // Parar movimento específico quando soltar tecla
  }
  
  handleInput(input) {
    const now = Date.now();
    const delta = (now - this.lastTime) / 1000; // segundos
    this.lastTime = now;
    
    this.isRunning = input.run;
    
    // Movimentoforward/backward
    if (input.forward) {
      this.velocity.z -= this.speed * delta * (this.isRunning ? 1.5 : 1);
    }
    if (input.backward) {
      this.velocity.z += this.speed * delta * (this.isRunning ? 1.5 : 1);
    }
    // Strafe left/right
    if (input.left) {
      this.velocity.x -= this.speed * delta * (this.isRunning ? 1.5 : 1);
    }
    if (input.right) {
      this.velocity.x += this.speed * delta * (this.isRunning ? 1.5 : 1);
    }
  }
  
  // Atualizar posição e calcular head-bobbing
  update(deltaTime) {
    // Aplicar velocidade com aceleração suave
    this.position.x += this.velocity.x * deltaTime;
    this.position.z += this.velocity.z * deltaTime;
    
    // Head-Bobbing ao correr (efeito de passos)
    if (this.isRunning) {
      this.headBobTimer = (this.headBobTimer || 0) + deltaTime;
      const bobOffset = Math.sin(this.headBobTimer * 10) * 0.5 * (this.isRunning ? 1 : 0.5);
      // Aplicar offset Y na posição (simplificado)
      this.position.y = bobOffset;
    } else {
      // Retornar posição Y natural quando não está correndo
      if (this.position.y !== 0) {
        this.position.y = 0; // Reset slowly
      }
    }
  }
  
  // Verificar colisão simples com walls
  checkWallCollision(mapData) {
    // Implementação simplificada - verifica se a posição está dentro de bounds
    const margin = 0.5;
    if (this.position.x < margin) this.position.x = margin;
    if (this.position.x > mapData.width - margin) this.position.x = mapData.width - margin;
    if (this.position.z < margin) this.position.z = margin;
    if (this.position.z > mapData.depth - margin) this.position.z = mapData.depth - margin;
  }
  
  // Getter para posição
  getPosition() {
    return { ...this.position };
  }
  
  getRotation() {
    return { ...this.rotation };
  }
  
  // Limpar intervalo de tick
  destroy() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }
}