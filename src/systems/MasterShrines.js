// MasterShrines.js — Gestão dos 4 Altares Tutelares e Oferendas
// Skills: test_debugging + security_scan (4 altares: Pedra das Almas, Gameleira, Oxum, Caçador)

export class MasterShrines {
  constructor() {
    this.altars = [
      {
        id: 'altar_pedra',
        name: 'Pedra das Almas',
        symbol: '🪦',
        color: '#79c5cb',
        location: { x: -120, y: 40 },
        activated: false,
        offerings: 0,
        maxOfferings: 3,
        power: 'Conexão com Mestre Kunde',
        buff: '+35 Axé Máximo permanente'
      },
      {
        id: 'altar_gameleira',
        name: 'Gameleira Sagrada',
        symbol: '🌿',
        color: '#a8c47c',
        location: { x: 80, y: -20 },
        activated: false,
        offerings: 0,
        maxOfferings: 3,
        power: 'Sabedoria das raízes ancestrais',
        buff: '+25 HP Máximo permanente'
      },
      {
        id: 'altar_oxum',
        name: 'Cachoeira de Oxum',
        symbol: '🌊',
        color: '#9bb4d2',
        location: { x: -80, y: 60 },
        activated: false,
        offerings: 0,
        maxOfferings: 3,
        power: 'Ciclos e renovação',
        buff: '+20 Hydration Máximo permanente'
      },
      {
        id: 'altar_caçador',
        name: 'Clareira do Mestre Caçador',
        symbol: '🎭',
        color: '#d58bb1',
        location: { x: 120, y: 40 },
        activated: false,
        offerings: 0,
        maxOfferings: 3,
        power: 'Agilidade e caça',
        buff: '+15% de velocidade de strafe em 1ª Pessoa'
      }
    ];
    
    this.loadState();
  }
  
  loadState() {
    try {
      const saved = localStorage.getItem('shrines_state');
      if (saved) {
        const state = JSON.parse(saved);
        this.altars = this.altars.map((altar, i) => ({
          ...altar,
          activated: state.altars && state.altars[i] ? state.altars[i].activated : false,
          offerings: state.altars && state.altars[i] ? state.altars[i].offerings : 0
        }));
      }
    } catch(e) {
      console.warn('Erro ao carregar altares:', e);
    }
  }
  
  saveState() {
    try {
      localStorage.setItem('shrines_state', JSON.stringify({
        altars: this.altars.map(a => ({ activated: a.activated, offerings: a.offerings }))
      }));
    } catch(e) {
      console.warn('Erro ao salvar altares:', e);
    }
  }
  
  // Offering to an altar
  offer(id, offeringCount = 1) {
    const altar = this.altars.find(a => a.id === id);
    if (!altar) return { success: false, reason: 'altar_not_found' };
    
    if (altar.offerings + offeringCount > altar.maxOfferings) {
      return { success: false, reason: 'max_offerings_reached', current: altar.offerings, max: altar.maxOfferings };
    }
    
    altar.offerings += offeringCount;
    
    // Check if altar is fully activated
    if (altar.offerings >= altar.maxOfferings) {
      altar.activated = true;
    }
    
    this.saveState();
    return { success: true, altar, newOfferings: altar.offerings, max: altar.maxOfferings, activated: altar.activated };
  }
  
  // Activate altar without offerings (for game progression)
  activate(id) {
    const altar = this.altars.find(a => a.id === id);
    if (!altar) return { success: false, reason: 'altar_not_found' };
    altar.activated = true;
    this.saveState();
    return { success: true, altar };
  }
  
  // Get activated altars count
  getActivatedCount() {
    return this.altars.filter(a => a.activated).length;
  }
  
  getAll() {
    return { ...this.altars };
  }
}