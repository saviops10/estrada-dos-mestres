// SurvivalEngine.js — Gestão de Fome, Sede e Recursos da Mata
// Skills: auth_implementation + dtos_schemas
// Estado persistente via state.json + localStorage

export class SurvivalEngine {
  constructor() {
    this.hunger = 50; // 0-100
    this.thirst = 70; // 0-100
    this.hp = 100;    // 0-100
    this.axe = 'Iluminado'; // Iluminado / Imbuido dos Mestres
    this.hydration = 100; // 0-100
    
    this.hungerRate = 0.1; // por minuto
    this.thirstRate = 0.15; // por minuto
    this.hpRegenRate = 0.05; // quando quieto + tocha acesa
    
    this.lastUpdate = Date.now();
    this.resources = {
      herbs: 0,
      water: 0,
      branches: 0,
      food: 0
    };
    
    this.loadState();
    this.startTick();
  }
  
  loadState() {
    try {
      const saved = localStorage.getItem('survival_state');
      if (saved) {
        const state = JSON.parse(saved);
        this.hunger = state.hunger ?? 50;
        this.thirst = state.thirst ?? 70;
        this.hp = state.hp ?? 100;
        this.axe = state.axe ?? 'Iluminado';
        this.hydration = state.hydration ?? 100;
        this.resources = state.resources || { herbs: 0, water: 0, branches: 0, food: 0 };
      }
    } catch(e) {
      console.warn('Erro ao carregar sobrevivência:', e);
    }
  }
  
  saveState() {
    try {
      localStorage.setItem('survival_state', JSON.stringify({
        hunger: this.hunger,
        thirst: this.thirst,
        hp: this.hp,
        axe: this.axe,
        hydration: this.hydration,
        resources: this.resources,
        timestamp: Date.now()
      }));
    } catch(e) {
      console.warn('Erro ao salvar sobrevivência:', e);
    }
  }
  
  startTick() {
    this.tickInterval = setInterval(() => this.tick(), 60000); // a cada minuto
  }
  
  tick() {
    // Fome diminui
    if (this.hunger > 0) {
      this.hunger = Math.max(0, this.hunger - this.hungerRate);
    }
    // Sede diminui
    if (this.thirst > 0) {
      this.thirst = Math.max(0, this.thirst - this.thirstRate);
    }
    // Hidratação diminui mais devagar quando saciado
    if (this.hydration > 0) {
      this.hydration = Math.max(0, this.hydration - 0.05);
    }
    
    // Regeneração de HP quando quieto + tocha acesa
    if (this.hp < 100 && this.hunger < 30 && this.thirst < 30 && this.hydration > 20) {
      this.hp = Math.min(100, this.hp + this.hpRegenRate);
    }
    
    // Efeitos críticos
    if (this.hunger <= 10) {
      // Penalidade de movimento
    }
    if (this.thirst <= 10) {
      // Desidratação: visão turva
    }
    if (this.hp <= 0) {
      // Game over ou estado de incapacidade
    }
    
    this.saveState();
  }
  
  // Actions
  
  eat(amount = 1) {
    this.hunger = Math.min(100, this.hunger + amount * 15);
    this.resources.food = Math.max(0, this.resources.food - amount);
    return { success: true, hunger: this.hunger };
  }
  
  drink(amount = 1) {
    this.thirst = Math.min(100, this.thirst + amount * 12);
    this.resources.water = Math.max(0, this.resources.water - amount);
    this.hydration = Math.min(100, this.hydration + amount * 8);
    return { success: true, thirst: this.thirst, hydration: this.hydration };
  }
  
  collectHerb(type) {
    this.resources.herbs = Math.min(99, this.resources.herbs + 1);
    return { success: true, herbs: this.resources.herbs };
  }
  
  collectWater(source) {
    if (source === 'nascente' || source === 'cachoeira') {
      this.resources.water = Math.min(99, this.resources.water + 1);
      this.drink(1);
      return { success: true, water: this.resources.water };
    }
    return { success: false, reason: 'source_not_potable' };
  }
  
  collectBranch() {
    this.resources.branches = Math.min(99, this.resources.branches + 1);
    return { success: true, branches: this.resources.branches };
  }
  
  toggleAxe() {
    const states = ['Iluminado', 'Imbuido dos Mestres'];
    const currentIndex = states.indexOf(this.axe);
    this.axe = states[(currentIndex + 1) % states.length];
    return { success: true, axe: this.axe };
  }
  
  getStatus() {
    return {
      hunger: this.hunger,
      thirst: this.thirst,
      hp: this.hp,
      axe: this.axe,
      hydration: this.hydration,
      resources: { ...this.resources }
    };
  }
}