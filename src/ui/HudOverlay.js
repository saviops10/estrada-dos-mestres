// HudOverlay.js — Interface HUD com 6 Barras (Fome, Sede, Axé, Tocha, Patuá, Resgatados)
// Skills: create_component + style_component

export class HudOverlay {
  constructor(container) {
    this.container = typeof container === 'string' ? 
      document.getElementById(container) : container;
    this.init();
  }
  
  init() {
    if (!this.container) {
      console.error('HUD container not found');
      return;
    }
    
    this.container.innerHTML = `
      <div class="hud-root" id="hud-root">
        <div class="hud-bar hud-bar-hunger" title="Fome">
          <span class="hud-label">Fome</span>
          <span class="hud-value" id="hunger-value">50%</span>
        </div>
        <div class="hud-bar hud-bar-thirst" title="Sede">
          <span class="hud-label">Sede</span>
          <span class="hud-value" id="thirst-value">70%</span>
        </div>
        <div class="hud-bar hud-bar-axe" title="Axé">
          <span class="hud-label">Axé</span>
          <span class="hud-value" id="axe-value">Iluminado</span>
        </div>
        <div class="hud-bar hud-bar-torch" title="Tocha">
          <span class="hud-label">Tocha</span>
          <span class="hud-value" id="torch-value">ACESA</span>
        </div>
        <div class="hud-bar hud-bar-patua" title="Patuá">
          <span class="hud-label">Patuá</span>
          <span class="hud-value" id="patua-status">Brilhante</span>
        </div>
        <div class="hud-bar hud-bar-rescued" title="Resgatados">
          <span class="hud-label">Resgatados</span>
          <span class="hud-value" id="rescued-value">0/49</span>
        </div>
      </div>
    `;
    
    this.bindEvents();
    this.updateAll();
  }
  
  bindEvents() {
    // Event listeners podem ser adicionados aqui para atualizações em tempo real
  }
  
  // Atualizar todas as barras
  updateAll(status) {
    const statusObj = status || this.getDefaultStatus();
    
    this.updateBar('hunger-value', statusObj.hunger, '%');
    this.updateBar('thirst-value', statusObj.thirst, '%');
    this.updateBar('axe-value', statusObj.axe);
    this.updateBar('torch-value', statusObj.torch ? 'ACESA' : 'APAGADA');
    this.updateBar('patua-status', statusObj.patuya ? 'Brilhante' : 'Apagado');
    this.updateBar('rescued-value', `${statusObj.rescued || 0}/49`);
  }
  
  getDefaultStatus() {
    return {
      hunger: 50,
      thirst: 70,
      axe: 'Iluminado',
      torch: true,
      patuya: true,
      rescued: 0
    };
  }
  
  // Atualizar barra individual
  updateBar(elementId, value, suffix = '') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    let displayValue = value;
    if (suffix && typeof value === 'number') {
      displayValue = `${value}${suffix}`;
    } else if (suffix && typeof value === 'boolean') {
      displayValue = value ? 'ACESA' : 'APAGADA';
    } else if (typeof value !== 'string' && typeof value !== 'number') {
      displayValue = String(value);
    }
    
    element.textContent = displayValue;
    
    // Mudar cor baseada no valor
    if (suffix === '%') {
      const percent = parseInt(value);
      if (percent <= 20) {
        element.style.color = '#ff5f57'; // vermelho crítico
      } else if (percent <= 40) {
        element.style.color = '#fca503'; // laranja warning
      } else if (percent <= 70) {
        element.style.color = '#e6e600'; // amarelo caution
      } else {
        element.style.color = '#38bdf8'; // verde ok
      }
    }
  }
}