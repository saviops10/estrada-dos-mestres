// SpiritEnergy.js — Gestão da Barra de Axé e Estados Espirituais
// Skills: security_scan + code_quality_check (Barra Axé, estados Iluminado/Imbuido)

export class SpiritEnergy {
  constructor() {
    this.axe = 'Iluminado'; // Estados: Iluminado / Imbuido dos Mestres
    this.axeLevel = 0; // 0 a 100
    this.axeRegenRate = 0.5; // por minuto em áreas sagradas
    this.axeDrainRate = 0.2; // por minuto em combate/escuridão
    
    this.lastUpdate = Date.now();
    this.ritualsCompleted = 0;
    this.blessings = [];
    
    this.loadState();
    this.startTick();
  }
  
  loadState() {
    try {
      const saved = localStorage.getItem('spirit_energy_state');
      if (saved) {
        const state = JSON.parse(saved);
        this.axe = state.axe ?? 'Iluminado';
        this.axeLevel = state.axeLevel ?? 0;
        this.ritualsCompleted = state.ritualsCompleted ?? 0;
        this.blessings = state.blessings || [];
      }
    } catch(e) {
      console.warn('Erro ao carregar energia espiritual:', e);
    }
  }
  
  saveState() {
    try {
      localStorage.setItem('spirit_energy_state', JSON.stringify({
        axe: this.axe,
        axeLevel: this.axeLevel,
        ritualsCompleted: this.ritualsCompleted,
        blessings: this.blessings
      }));
    } catch(e) {
      console.warn('Erro ao salvar energia espiritual:', e);
    }
  }
  
  startTick() {
    this.tickInterval = setInterval(() => this.tick(), 30000); // a cada 30s
  }
  
  tick() {
    // Regeneração em áreas sagradas (perto de altar ativado, quilombo)
    const isNearSacredArea = this.isNearSacredArea();
    if (isNearSacredArea && this.axeLevel < 100) {
      this.axeLevel = Math.min(100, this.axeLevel + this.axeRegenRate);
    }
    // Drenagem em combate/escuridão
    if (!isNearSacredArea && this.axeLevel > 0) {
      this.axeLevel = Math.max(0, this.axeLevel - this.axeDrainRate);
    }
    
    // Estados baseados no level
    if (this.axeLevel >= 80 && this.axe !== 'Imbuido dos Mestres') {
      this.axe = 'Imbuido dos Mestres';
    } else if (this.axeLevel < 80 && this.axe !== 'Iluminado') {
      this.axe = 'Iluminado';
    }
    
    this.saveState();
  }
  
  isNearSacredArea() {
    // Lógica simplificada: perto de altar ativado ou quilombo
    // Em implementação full seria verificada distância no mapa
    return Math.random() > 0.5; // placeholder - implementação full verifica no mapa
  }
  
  // Ganhar axé através de ações sagradas
  gainAxe(amount) {
    this.axeLevel = Math.min(100, this.axeLevel + amount);
    if (this.axeLevel >= 80 && this.axe !== 'Imbuido dos Mestres') {
      this.axe = 'Imbuido dos Mestres';
    }
    this.saveState();
    return { success: true, axe: this.axe, axeLevel: this.axeLevel };
  }
  
  // Perder axé através de combate ou escuridão
  loseAxe(amount) {
    this.axeLevel = Math.max(0, this.axeLevel - amount);
    if (this.axeLevel < 80 && this.axe === 'Imbuido dos Mestres') {
      this.axe = 'Iluminado';
    }
    this.saveState();
    return { success: true, axe: this.axe, axeLevel: this.axeLevel };
  }
  
  // Rituales completados
  completeRitual() {
    this.ritualsCompleted++;
    this.saveState();
    return { success: true, ritualsCompleted: this.ritualsCompleted };
  }
  
  addBlessing(blessing) {
    this.blessings.push(blessing);
    this.saveState();
    return { success: true, blessings: this.blessings };
  }
  
  getStatus() {
    return {
      axe: this.axe,
      axeLevel: this.axeLevel,
      ritualsCompleted: this.ritualsCompleted,
      blessings: this.blessings
    };
  }
}