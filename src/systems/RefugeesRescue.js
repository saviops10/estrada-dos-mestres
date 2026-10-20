// RefugeesRescue.js — Lógica de Resgate dos 49 Irmãos Foragidos
// Skills: integration_tests + test_debugging (49 irmãos em 7 reinos, 7 por reino)

export class RefugeesRescue {
  constructor() {
    this.rescued = 0; // total resgatado
    this.target = 49; // total alvo
    this.byKingdom = {}; // resgate por reino
    this.kingdoms = 7;
    
    // Inicializar estrutura para 7 reinos com 7 membros cada
    for (let i = 0; i < this.kingdoms; i++) {
      this.byKingdom[i] = [];
    }
    
    this.loadState();
  }
  
  loadState() {
    try {
      const saved = localStorage.getItem('refugees_state');
      if (saved) {
        const state = JSON.parse(saved);
        this.rescued = state.rescued ?? 0;
        this.byKingdom = state.byKingdom || {};
        // Garantir estrutura de 7 reinos
        for (let i = 0; i < this.kingdoms; i++) {
          if (!this.byKingdom[i]) this.byKingdom[i] = [];
        }
      }
    } catch(e) {
      console.warn('Erro ao carregar resgate:', e);
    }
  }
  
  saveState() {
    try {
      localStorage.setItem('refugees_state', JSON.stringify({
        rescued: this.rescued,
        byKingdom: this.byKingdom
      }));
    } catch(e) {
      console.warn('Erro ao salvar resgate:', e);
    }
  }
  
  // Resgatar um irmão específico
  rescue(refugeeId, kingdomIndex) {
    // Verificar se já foi resgatado
    const kingdom = this.byKingdom[kingdomIndex];
    if (kingdom.some(r => r.id === refugeeId)) {
      return { success: false, reason: 'already_rescued', id: refugeeId };
    }
    
    // Encontrar o irmão pelo ID
    const refugeeData = this.getRefugeeData(refugeeId);
    if (!refugeeData) return { success: false, reason: 'refugee_not_found' };
    
    // Adicionar à lista do reino
    kingdom.push({
      id: refugeeId,
      name: refugeeData.name,
      title: refugeeData.titulo,
      rescuedAt: Date.now(),
      kingdomIndex
    });
    
    this.rescued++;
    this.saveState();
    return { success: true, rescued: this.rescued, total: this.target, kingdomIndex };
  }
  
  // Get refugee data by ID
  getRefugeeData(id) {
    // Buscar nos 7 reinos definidos no prompt_sistema
    const allRefugees = [];
    
    // Reino 0: Encruzilhadas
    const ref0 = [
      'ref_encruza_1', 'ref_encruza_2', 'ref_encruza_3', 'ref_encruza_4',
      'ref_encruza_5', 'ref_encruza_6', 'ref_encruza_7'
    ];
    // Reino 1: Cruzeiros
    const ref1 = [
      'ref_cruzeiro_1', 'ref_cruzeiro_2', 'ref_cruzeiro_3', 'ref_cruzeiro_4',
      'ref_cruzeiro_5', 'ref_cruzeiro_6', 'ref_cruzeiro_7'
    ];
    // Reino 2: Matas
    const ref2 = [
      'ref_matas_1', 'ref_matas_2', 'ref_matas_3', 'ref_matas_4',
      'ref_matas_5', 'ref_matas_6', 'ref_matas_7'
    ];
    // Reino 3: Calunga Grande
    const ref3 = [
      'ref_mar_1', 'ref_mar_2', 'ref_mar_3', 'ref_mar_4',
      'ref_mar_5', 'ref_mar_6', 'ref_mar_7'
    ];
    // Reino 4: Calunga Pequena
    const ref4 = [
      'ref_morte_1', 'ref_morte_2', 'ref_morte_3', 'ref_morte_4',
      'ref_morte_5', 'ref_morte_6', 'ref_morte_7'
    ];
    // Reino 5: Lira
    const ref5 = [
      'ref_lira_1', 'ref_lira_2', 'ref_lira_3', 'ref_lira_4',
      'ref_lira_5', 'ref_lira_6', 'ref_lira_7'
    ];
    // Reino 6: Almas
    const ref6 = [
      'ref_almas_1', 'ref_almas_2', 'ref_almas_3', 'ref_almas_4',
      'ref_almas_5', 'ref_almas_6', 'ref_almas_7'
    ];
    
    const all = [...ref0, ...ref1, ...ref2, ...ref3, ...ref4, ...ref5, ...ref6];
    return all.find(r => r.id === id);
  }
  
  // Resgatar todos os irmãos de um reino
  rescueKingdom(kingdomIndex) {
    const kingdom = this.byKingdom[kingdomIndex];
    const refData = this.getKingdomRefugees(kingdomIndex);
    
    // Resgate todos que não foram resgatados ainda
    const newlyRescued = refData.filter(r => !kingdom.some(existing => r.id === existing.id));
    
    newlyRescued.forEach(refugee => {
      kingdom.push({
        id: refugee.id,
        name: refugee.name,
        title: refugee.title,
        rescuedAt: Date.now(),
        kingdomIndex
      });
    });
    
    this.rescued += newlyRescued.length;
    this.saveState();
    return {
      success: true,
      rescued: this.rescued,
      total: this.target,
      kingdomIndex,
      newlyRescued: newlyRescued.length,
      totalInKingdom: refData.length
    };
  }
  
  getKingdomRefugees(kingdomIndex) {
    const kingdomsData = [
      // Reino 0: Encruzilhadas - 7 membros
      [
        { id: 'ref_encruza_1', name: 'Dandara', titulo: 'Guerreira das Sete Vias' },
        { id: 'ref_encruza_2', name: 'Tião Batedor', titulo: 'Mensageiro dos Quatro Cantos' },
        { id: 'ref_encruza_3', name: 'Alaba', titulo: 'Guardiã dos Portais de Fuga' },
        { id: 'ref_encruza_4', name: 'Bako', titulo: 'Rastreador Noturno' },
        { id: 'ref_encruza_5', name: 'Zola', titulo: 'Tecelã das Trilhas Ocultas' },
        { id: 'ref_encruza_6', name: 'Mandla', titulo: 'Corredor dos Ventos' },
        { id: 'ref_encruza_7', name: 'Kioni', titulo: 'Protetor do Cruzeiro das Estradas' }
      ],
      // Reino 1: Cruzeiros - 7 membros
      [
        { id: 'ref_cruzeiro_1', name: 'Tio Tião', titulo: 'Griô do Cruzeiro das Almas' },
        { id: 'ref_cruzeiro_2', name: 'Iyalorixá Naná', titulo: 'Mãe das Ervas e dos Cruzeiros' },
        { id: 'ref_cruzeiro_3', name: 'Lumumba', titulo: 'Carregador de Pedras Sagradas' },
        { id: 'ref_cruzeiro_4', name: 'Ayana', titulo: 'Cantora dos Hinos Ancestrais' },
        { id: 'ref_cruzeiro_5', name: 'Simão', titulo: 'Mateiro do Cruzeiro do Sul' },
        { id: 'ref_cruzeiro_6', name: 'Zuri', titulo: 'Pescador dos Rios Místicos' },
        { id: 'ref_cruzeiro_7', name: 'Kalu', titulo: 'Acólito das Lanternas' }
      ],
      // Reino 2: Matas - 7 membros
      [
        { id: 'ref_matas_1', name: 'Nia', titulo: 'Menina dos Pássaros e das Folhas' },
        { id: 'ref_matas_2', name: 'Curador Juremeiro', titulo: 'Mestre das Raízes da Jurema' },
        { id: 'ref_matas_3', name: 'Makena', titulo: 'Rastreadora Invisível' },
        { id: 'ref_matas_4', name: 'Jabari', titulo: 'Caçador de Mutum' },
        { id: 'ref_matas_5', name: 'Aissatou', titulo: 'Coletora de Resinas Sagradas' },
        { id: 'ref_matas_6', name: 'Kwame', titulo: 'Flecheiro dos Jequitibás' },
        { id: 'ref_matas_7', name: 'Tendai', titulo: 'Guardião dos Bambuzais' }
      ],
      // Reino 3: Calunga Grande - 7 membros
      [
        { id: 'ref_mar_1', name: 'Mestre Obá', titulo: 'Ferreiro dos Corais e da Forja' },
        { id: 'ref_mar_2', name: 'Yawa', titulo: 'Mergulhadora das Marés Revoltas' },
        { id: 'ref_mar_3', name: 'Kofi', titulo: 'Remador das Ondas Bravas' },
        { id: 'ref_mar_4', name: 'Malaika', titulo: 'Sentinela das Falésias' },
        { id: 'ref_mar_5', name: 'Badu', titulo: 'Menino das Conchas' },
        { id: 'ref_mar_6', name: 'Amina', titulo: 'Astrônoma do Cruzeiro do Mar' },
        { id: 'ref_mar_7', name: 'Tau', titulo: 'Guardião dos Rochedos do Sul' }
      ],
      // Reino 4: Calunga Pequena - 7 membros
      [
        { id: 'ref_morte_1', name: 'Babá Alagbá', titulo: 'Sacerdote dos Ancestrais Sepultados' },
        { id: 'ref_morte_2', name: 'Nzinga', titulo: 'Guardiã das Relíquias e Ossos Santos' },
        { id: 'ref_morte_3', name: 'Enitan', titulo: 'Partideira da Travessia Negra' },
        { id: 'ref_morte_4', name: 'Femi', titulo: 'Escultor dos Marcos Funerários' },
        { id: 'ref_morte_5', name: 'Thabo', titulo: 'Zelador das Memórias Esquecidas' },
        { id: 'ref_morte_6', name: 'Niazi', titulo: 'Filósofo dos Silêncios' },
        { id: 'ref_morte_7', name: 'Siku', titulo: 'Protetor dos Túmulos Anônimos' }
      ],
      // Reino 5: Lira - 7 membros
      [
        { id: 'ref_lira_1', name: 'Mestre Alabê', titulo: 'Tocador do Tambor de Iemanjá' },
        { id: 'ref_lira_2', name: 'Dandara da Lira', titulo: 'Mestra das Rodas de Capoeira e Dança' },
        { id: 'ref_lira_3', name: 'Jabulani', titulo: 'Mestre do Berimbau de Barriga' },
        { id: 'ref_lira_4', name: 'Chidi', titulo: 'Contador de Fábulas e Histórias' },
        { id: 'ref_lira_5', name: 'Halima', titulo: 'Soprano dos Cantos de Oxum' },
        { id: 'ref_lira_6', name: 'Sekou', titulo: 'Flautista dos Bambus da Mata' },
        { id: 'ref_lira_7', name: 'Faraji', titulo: 'Mestre da Alegria e dos Jogos de Força' }
      ],
      // Reino 6: Almas - 7 membros
      [
        { id: 'ref_almas_1', name: 'Vovó Maria Conga', titulo: 'Rezadeira Centenária dos Pretos Velhos' },
        { id: 'ref_almas_2', name: 'Pai Joaquim d'Angola', titulo: 'Sábio da Palha e do Cachimbo Protetor' },
        { id: 'ref_almas_3', name: 'Tio Benguela', titulo: 'Guardião da Travessia dos Ecos' },
        { id: 'ref_almas_4', name: 'Menina Candinha', titulo: 'Médium das Visões Premonitórias' },
        { id: 'ref_almas_5', name: 'Zandile', titulo: 'Carpinteira dos Altares da Mata' },
        { id: 'ref_almas_6', name: 'Odion', titulo: 'Astrônomo e Filho do Sol Poente' },
        { id: 'ref_almas_7', name: 'Mestre Kunde Menor', titulo: 'Discípulo da Pedra das Almas' }
      ]
    ];
    
    return kingdomsData[kingdomIndex] || [];
  }
  
  getRescueProgress() {
    const byKingdom = {};
    for (let i = 0; i < this.kingdoms; i++) {
      byKingdom[i] = this.byKingdom[i].length;
    }
    return {
      total: this.rescued,
      target: this.target,
      percentage: this.target > 0 ? Math.round((this.rescued / this.target) * 100) : 0,
      byKingdom,
      remaining: this.target - this.rescued
    };
  }
}