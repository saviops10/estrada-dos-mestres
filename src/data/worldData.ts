import { Realm, Entity, Altar, Refugee } from '../types/game';

export const MW = 32;
export const MH = 32;

function blank(fill: number): number[][] {
  return Array.from({ length: MH }, () => Array(MW).fill(fill));
}

function edge(m: number[][], tile: number) {
  for (let i = 0; i < MW; i++) {
    m[0][i] = tile;
    m[MH - 1][i] = tile;
    m[i][0] = tile;
    m[i][MW - 1] = tile;
  }
}

function fillRect(m: number[][], x0: number, y0: number, x1: number, y1: number, tile: number) {
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (y > 0 && x > 0 && y < MH - 1 && x < MW - 1) {
        m[y][x] = tile;
      }
    }
  }
}

function corridor(m: number[][], x0: number, y0: number, x1: number, y1: number) {
  let x = x0;
  let y = y0;
  let guard = 0;
  while (guard++ < 80) {
    fillRect(m, x, y, x + 1, y + 1, 0);
    if (x === x1 && y === y1) break;
    if (x !== x1) x += Math.sign(x1 - x);
    else y += Math.sign(y1 - y);
  }
}

// 63 Sacred Points with Guardians from Brazilian Tradition (Tranca-Rua, Capa Preta, Quebra Galho, Pantera Negra, etc.)
export const ATLAS: Record<string, [string, string, string, string, string?][]> = {
  encruzilhadas: [
    ["e01", "Encruzilhada das Sete Vias", "Abertura de Caminhos & Fuga", "Tranca-Rua", "Portal"],
    ["e02", "Caminho da Lua Negra", "Navegação Noturna Furtiva", "Exu Mirim", "Trilha"],
    ["e03", "Praça dos Quatro Ventos", "Comunicação dos Quilombolas", "Gira Mundo", "Praça"],
    ["e04", "Portal das Estradas", "Translocação Oculta", "Tata Caveira", "Portal"],
    ["e05", "Viela das Lanternas", "Iluminação Espiritual", "Maria Mulambo", "Viela"],
    ["e06", "Ponte dos Destinos", "Escolha & Consequência", "Capa Preta", "Ponte"],
    ["e07", "Mercado das Sombras", "Troca & Negociação de Armas", "Treme Terra", "Mercado"],
    ["e08", "Estrada do Cruzeiro", "Proteção em Viagem", "Caveira", "Estrada"],
    ["e09", "Marco das Três Trilhas", "Divinação dos Sentinelas", "Meia Noite", "Marco"]
  ],
  cruzeiros: [
    ["c01", "Cruzeiro das Brumas", "Visão na Neblina", "Caboclo do Cruzeiro", "Cruzeiro"],
    ["c02", "Campo das Sete Cruzes", "Proteção Múltipla", "Sete Cruzeiros", "Campo"],
    ["c03", "Vila do Marco Antigo", "Ancestralidade dos Livres", "Velho do Cruzeiro", "Vila"],
    ["c04", "Estrada do Silêncio", "Meditação Profunda & Foco", "Monge do Silêncio", "Estrada"],
    ["c05", "Largo das Lanternas", "Guia Espiritual dos Foragidos", "Mestra das Lanternas", "Largo"],
    ["c06", "Portal de Pedra", "Firmeza de Rocha", "Guardião de Pedra", "Portal"],
    ["c07", "Colina do Cruzeiro", "Elevação de Axé", "Caboclo da Colina", "Colina"],
    ["c08", "Passagem das Sombras", "Travessia Segura de Tropas", "Sombra do Cruzeiro", "Passagem"],
    ["c09", "Praça do Caminhante", "Hospedagem dos Irmãos", "Pai do Caminho", "Praça"]
  ],
  matas: [
    ["m01", "Mata das Árvores Antigas", "Sabedoria das Raízes", "Jequitibá Rei", "Floresta"],
    ["m02", "Clareira da Lua", "Cura Lunar & Ervas", "Mãe da Lua", "Clareira"],
    ["m03", "Trilha do Corvo", "Mensageiro dos Quilombos", "Quebra Galho", "Trilha"],
    ["m04", "Vila dos Cipós", "Flexibilidade na Capoeira", "Mestre Cipó", "Vila"],
    ["m05", "Bosque das Brumas", "Camuflagem na Mata", "Pantera Negra", "Bosque"],
    ["m06", "Pântano Esquecido", "Purificação dos Pés", "Senhora do Lodo", "Pântano"],
    ["m07", "Árvore dos Ecos", "Memória Viva dos Ancestrais", "Gameleira Sagrada", "Árvore"],
    ["m08", "Passagem das Raízes", "Conexão Subterrânea", "Morcego", "Passagem"],
    ["m09", "Santuário Selvagem", "Refúgio Inexpugnável", "Caboclo Flecheiro", "Santuário"]
  ],
  "calunga-grande": [
    ["g01", "Praia da Fuga da Caravela", "Ciclos & Libertação", "Iemanjá", "Praia"],
    ["g02", "Porto das Almas", "Chegada e Partida", "Barqueiro", "Porto"],
    ["g03", "Baía do Crepúsculo", "Transição das Águas", "Oxumaré", "Baía"],
    ["g04", "Ilha das Brumas", "Isolamento Sagrado", "Mestra da Névoa", "Ilha"],
    ["g05", "Cais da Lua", "Intuição & Marés", "Lua Cheia", "Cais"],
    ["g06", "Farol Esquecido", "Orientação das Jangadas", "Guardião do Farol", "Farol"],
    ["g07", "Gruta das Ondas", "Som Primordial do Mar", "Sirena Ancestral", "Gruta"],
    ["g08", "Enseada do Silêncio", "Paz do Guerreiro", "Mar Calmo", "Enseada"],
    ["g09", "Costa dos Navegantes", "Jornada além-mar", "Navegador Antigo", "Costa"]
  ],
  "calunga-pequena": [
    ["p01", "Cemitério das Brumas", "Comunicação com Ancestrais", "Omulu", "Cemitério"],
    ["p02", "Portal das Lápides", "Acesso ao Além & Revelação", "Exu Cemitério", "Portal"],
    ["p03", "Jardim Silencioso", "Paz Eterna dos Livres", "Mãe do Jardim", "Jardim"],
    ["p04", "Capela Antiga", "Fé & Resistência", "Padre das Almas", "Capela"],
    ["p05", "Campo dos Ciprestes", "Proteção contra Capitães", "Cipreste Velho", "Campo"],
    ["p06", "Cripta das Sombras", "Segredos dos Miasmas", "Guardião da Cripta", "Cripta"],
    ["p07", "Mausoléu da Lua", "Memória dos Mártires", "Lua Prateada", "Mausoléu"],
    ["p08", "Alameda das Memórias", "Lembrança Viva da África", "Ancestral Silencioso", "Alameda"],
    ["p09", "Portão de Pedra", "Limiar Definitivo", "Tata Caveira", "Portão"]
  ],
  lira: [
    ["l01", "Cidade da Lira", "Harmonia dos Tambores", "Rei da Lira", "Cidade"],
    ["l02", "Praça Escarlate", "Paixão Criativa & Berimbau", "Rainha Escarlate", "Praça"],
    ["l03", "Beco dos Tambores", "Ritmo de Guerra & Ginga", "Mestre Tambor", "Beco"],
    ["l04", "Salão das Máscaras", "Disfarce Urbano", "Mestre das Máscaras", "Salão"],
    ["l05", "Rua dos Artistas", "Expressão & Rodas", "Artista Errante", "Rua"],
    ["l06", "Jardim das Lanternas", "Luz na Escuridão", "Mestra das Lanternas", "Jardim"],
    ["l07", "Mercado da Meia-Noite", "Troca Mística de Pólvora", "Feitor da Noite", "Mercado"],
    ["l08", "Pátio dos Espelhos", "Auto-conhecimento do Guerreiro", "Espelho Mágico", "Pátio"],
    ["l09", "Palácio das Ilusões", "Distração dos Captores", "Ilusionista Supremo", "Palácio"]
  ],
  almas: [
    ["a01", "Portal das Almas", "Transição de Coragem", "Barqueiro das Almas", "Portal"],
    ["a02", "Cidade do Crepúsculo", "Existência no Limiar", "Prefeito do Crepúsculo", "Cidade"],
    ["a03", "Ponte dos Ecos", "Vozes dos Pretos Velhos", "Eco Eterno", "Ponte"],
    ["a04", "Torre do Silêncio", "Vigília dos Engenhos", "Vigia Silencioso", "Torre"],
    ["a05", "Jardim Etéreo", "Ervas da Imortalidade", "Jardineiro das Almas", "Jardim"],
    ["a06", "Vila das Brumas", "Irmandade Ancestral", "Anciã da Bruma", "Vila"],
    ["a07", "Templo do Limiar", "Rito de Passagem ao Combate", "Sacerdote do Véu", "Templo"],
    ["a08", "Castelo do Véu", "Mistério da Vitória", "Senhor do Véu", "Castelo"],
    ["a09", "Trono das Sombras", "Autoridade do Quilombo", "Rainha das Sombras", "Trono"]
  ]
};

function fromAtlas(id: string, index: number, x: number, y: number, kind: Entity['kind'] = 'point'): Entity {
  const row = ATLAS[id][index];
  return {
    kind,
    id: row[0],
    name: row[1],
    power: row[2],
    mestre: row[3],
    type: row[4] || 'Ponto Sagrado',
    x,
    y,
    realm: id,
    countsAsPoint: kind === 'point' || kind === 'portal',
    visited: false,
    secretClue: `Guardião ${row[3]} sopra: "Confie na Ginga da Capoeira e colha Alecrim para blindar seu corpo contra miasmas."`
  };
}

export function createEncruzilhadas(): Realm {
  const m = blank(4);
  for (let y = 2; y < MH - 1; y++) {
    for (let x = 2; x < MW - 1; x++) {
      const street = (x % 6 === 2 || x % 6 === 3 || y % 6 === 2 || y % 6 === 3);
      if (street) m[y][x] = 0;
    }
  }
  edge(m, 4);
  const spots = [[9, 9], [15, 9], [21, 9], [9, 15], [15, 15], [21, 15], [9, 21], [15, 21], [21, 21]];
  const entities: Entity[] = spots.map((p, i) => fromAtlas('encruzilhadas', i, p[0], p[1], i === 7 ? 'portal' : 'point'));
  entities.push({ kind: 'fire', id: 'fire-e', name: 'Braseiro da esquina', x: 15, y: 17.2 });
  entities.push({ kind: 'person', id: 'pe1', name: 'Andarilho Tranca-Rua', x: 9, y: 16.5, line: 'Aqui toda rua encontra outra. Lance pedras para despistar os capitães armados.' });
  entities.push({ kind: 'person', id: 'pe2', name: 'Lanterninha Gira Mundo', x: 21, y: 12.5, line: 'A viela acende quando o Cruzeiro do centro abre.' });
  // Enemy Capitão do Mato
  entities.push({
    kind: 'enemy',
    id: 'cap-e1',
    name: 'Capitão do Mato',
    x: 12,
    y: 9,
    hp: 40,
    maxHp: 40,
    enemyType: 'capitao',
    speed: 1.2
  });

  return {
    id: 'encruzilhadas',
    name: 'Reino das Encruzilhadas',
    blurb: 'Cidade de ruas retas patrulhada por milícias. Tranca-Rua guarda as passagens.',
    map: m,
    entities,
    spawn: { x: 15, y: 18.5, angle: -Math.PI / 2 },
    returnSpawn: { x: 15, y: 17.4, angle: -Math.PI / 2 },
    theme: { sky0: '#2c2418', sky1: '#8a7048', floor0: '#6a5844', floor1: '#2a2118' },
    enterLine: 'Encruzilhadas. Tranca-Rua vigia. Use pedras para distrair patrulhas e abra caminho.'
  };
}

export function createMatas(): Realm {
  const m = blank(1);
  fillRect(m, 11, 11, 20, 20, 0);
  fillRect(m, 12, 12, 13, 14, 3);
  fillRect(m, 18, 12, 19, 14, 3);
  fillRect(m, 12, 17, 14, 18, 4);
  corridor(m, 15, 15, 4, 4);
  corridor(m, 15, 15, 26, 4);
  corridor(m, 15, 15, 4, 26);
  corridor(m, 15, 15, 26, 26);
  corridor(m, 4, 15, 27, 15);
  corridor(m, 15, 4, 15, 27);
  [[4, 4], [26, 4], [4, 26], [26, 26], [4, 15], [26, 15], [15, 4], [15, 26]].forEach(([x, y]) => fillRect(m, x - 1, y - 1, x + 1, y + 1, 0));
  edge(m, 3);

  const spots = [[4, 4], [16, 15], [26, 15], [13, 16], [5, 15], [26, 5], [15, 5], [5, 26], [26, 26]];
  const entities: Entity[] = spots.map((p, i) => fromAtlas('matas', i, p[0], p[1], i === 1 ? 'portal' : 'point'));
  entities.push({ kind: 'fire', id: 'fire-m', name: 'Fogueira da aldeia', x: 16.8, y: 17.2 });
  entities.push({ kind: 'person', id: 'pm1', name: 'Mateiro Quebra Galho', x: 14.2, y: 16.8, line: 'A mata tem arruda, guiné e alecrim. Cace javalis e coelhos para alimentar o Quilombo.' });
  entities.push({ kind: 'person', id: 'pm2', name: 'Menina Nia', x: 18.5, y: 16.2, line: 'Não saia da trilha desarmado. Prepare lanças e flechas!' });

  // Wildlife Fauna: Rabbit and Boar
  entities.push({
    kind: 'animal',
    id: 'ani-m1',
    name: 'Coelho Selvagem',
    x: 18,
    y: 13,
    hp: 15,
    maxHp: 15,
    animalType: 'coelho',
    speed: 1.6
  });
  entities.push({
    kind: 'animal',
    id: 'ani-m2',
    name: 'Javali da Mata',
    x: 6,
    y: 6,
    hp: 35,
    maxHp: 35,
    animalType: 'javali',
    speed: 1.1
  });
  entities.push({
    kind: 'animal',
    id: 'ani-m3',
    name: 'Pato Silvestre',
    x: 24,
    y: 18,
    hp: 15,
    maxHp: 15,
    animalType: 'pato',
    speed: 1.4
  });

  return {
    id: 'matas',
    name: 'Reino das Matas',
    blurb: 'Aldeia no claro, floresta densa e fauna silvestre sob a bênção de Quebra Galho e Pantera Negra.',
    map: m,
    entities,
    spawn: { x: 16, y: 18.2, angle: -Math.PI / 2 },
    returnSpawn: { x: 16, y: 17.2, angle: -Math.PI / 2 },
    theme: { sky0: '#143226', sky1: '#3d8a52', floor0: '#3e5a28', floor1: '#182010' },
    enterLine: 'Matas. O ar cheira a alecrim e terra molhada. Cace animais e colha ervas para sobreviver.'
  };
}

export function createPorto(): Realm {
  const m = blank(0);
  edge(m, 2);
  for (let y = 1; y < MH - 1; y++) for (let x = 22; x < MW - 1; x++) m[y][x] = 6;
  for (let x = 18; x <= 29; x++) for (let y = 15; y <= 17; y++) m[y][x] = 0;
  for (let x = 18; x <= 28; x++) for (let y = 6; y <= 8; y++) m[y][x] = 0;
  for (let y = 2; y < 30; y++) m[y][18] = 0;
  [[25, 4], [28, 11], [27, 21], [24, 26], [29, 8]].forEach(([x, y]) => { if (m[y][x] === 6) m[y][x] = 2; });
  fillRect(m, 8, 5, 10, 8, 5);
  fillRect(m, 12, 5, 15, 7, 4);
  fillRect(m, 12, 20, 15, 23, 4);
  fillRect(m, 6, 18, 8, 21, 2);

  const spots = [[20.5, 11.5], [14.5, 14.5], [20.5, 22.5], [26.5, 7], [27.5, 16], [6.5, 6.5], [5.5, 23.5], [20.5, 27.5], [10.5, 16.5]];
  const entities: Entity[] = spots.map((p, i) => fromAtlas('calunga-grande', i, p[0], p[1], i === 1 ? 'portal' : 'point'));
  entities.push({ kind: 'fire', id: 'fire-g', name: 'Braseiro do cais', x: 19.2, y: 16 });
  entities.push({ kind: 'person', id: 'pg1', name: 'Mestre Obá', x: 17.2, y: 16.2, line: 'Foi aqui que a caravela aportou. A Capoeira salvou nossa pele quando saltamos ao mar!' });
  entities.push({ kind: 'person', id: 'pg2', name: 'Pescadora Iemanjá', x: 24.5, y: 16.8, line: 'Os peixes nas águas rasas podem ser pescados com a lança.' });
  // Fish wildlife in water edge
  entities.push({
    kind: 'animal',
    id: 'ani-g1',
    name: 'Cardume de Peixes',
    x: 22.5,
    y: 16.5,
    hp: 10,
    maxHp: 10,
    animalType: 'peixe',
    speed: 0.8
  });
  // Colonial militia guard
  entities.push({
    kind: 'enemy',
    id: 'mil-g1',
    name: 'Miliciano Colonial',
    x: 10,
    y: 18,
    hp: 35,
    maxHp: 35,
    enemyType: 'miliciano',
    speed: 1.0
  });

  return {
    id: 'calunga-grande',
    name: 'Reino da Calunga Grande',
    blurb: 'Litoral e porto onde aportou a caravela negreira. O mar de Iemanjá e os rochedos da fuga.',
    map: m,
    entities,
    spawn: { x: 16.5, y: 16, angle: 0 },
    returnSpawn: { x: 16.2, y: 14.5, angle: Math.PI / 2 },
    theme: { sky0: '#16344a', sky1: '#7eb4d4', floor0: '#c2a06a', floor1: '#6a4e30' },
    enterLine: 'Calunga Grande. A praia da fuga! As ondas ainda ecoam os gritos do desembarque.'
  };
}

export function createCemiterio(): Realm {
  const m = blank(0);
  edge(m, 2);
  for (let y = 3; y < 29; y++) {
    if (y % 3 === 0) continue;
    for (let x = 3; x < 29; x++) if (x % 2 === 0) m[y][x] = 8;
  }
  fillRect(m, 13, 13, 18, 18, 0);
  fillRect(m, 14, 14, 17, 15, 5);
  m[15][15] = 0; m[15][16] = 0;
  fillRect(m, 14, 27, 17, 30, 0);

  const spots = [[5, 6], [15, 6], [25, 6], [7, 12], [15.5, 16.8], [25, 12], [7, 24], [15, 24], [16, 28.2]];
  const entities: Entity[] = spots.map((p, i) => fromAtlas('calunga-pequena', i, p[0], p[1], i === 8 ? 'portal' : 'point'));
  entities.push({ kind: 'fire', id: 'fire-p', name: 'Vela do portão', x: 14.2, y: 28.2 });
  entities.push({ kind: 'person', id: 'pp1', name: 'Omulu dos Ossos', x: 15, y: 21, line: 'Cuidado com os Kiumbas. Mantenha a tocha acesa ou os miasmas devoram seu Axé!' });

  // Kiumba dark astral entities
  entities.push({
    kind: 'enemy',
    id: 'kiumba-1',
    name: 'Kiumba das Lápides',
    x: 8,
    y: 10,
    hp: 30,
    maxHp: 30,
    enemyType: 'kiumba',
    speed: 0.9
  });
  entities.push({
    kind: 'enemy',
    id: 'kiumba-2',
    name: 'Miasma Errante',
    x: 20,
    y: 20,
    hp: 30,
    maxHp: 30,
    enemyType: 'kiumba',
    speed: 0.8
  });

  return {
    id: 'calunga-pequena',
    name: 'Reino da Calunga Pequena',
    blurb: 'Cemitério ancestral protegido por Omulu e Tata Caveira. Mantenha a tocha viva contra Kiumbas.',
    map: m,
    entities,
    spawn: { x: 15, y: 26.5, angle: -Math.PI / 2 },
    returnSpawn: { x: 15, y: 26.5, angle: -Math.PI / 2 },
    theme: { sky0: '#16141a', sky1: '#6a6258', floor0: '#4a4036', floor1: '#1a1612' },
    enterLine: 'Calunga Pequena. Névoa fria e sussurros ancestrais. A tocha dissipa os miasmas.'
  };
}

export function createLira(): Realm {
  const m = blank(0);
  edge(m, 4);
  for (let y = 5; y < 27; y += 4) {
    for (let x = 3; x < 29; x++) if (x % 6 !== 0) m[y][x] = 9;
  }
  fillRect(m, 12, 12, 19, 19, 0);
  fillRect(m, 14, 6, 17, 8, 5);

  const spots = [[16, 10], [16, 15.5], [8, 8], [24, 8], [8, 16], [24, 16], [10, 22], [16, 22], [22, 22]];
  const entities: Entity[] = spots.map((p, i) => fromAtlas('lira', i, p[0], p[1], i === 1 ? 'portal' : 'point'));
  entities.push({ kind: 'fire', id: 'fire-l', name: 'Fogueira da praça', x: 13.4, y: 15.5 });
  const people: [string, number, number, string][] = [
    ['Feirante Meia Noite', 13.2, 13.4, 'Na Lira os captores bebem e se distraem. A hora do ataque virá com os 49 libertos!'],
    ['Mascarada Dandara', 18.2, 14.2, 'Compro ferro para flechas e troco ervas. A Capoeira faz a festa e a guerra.'],
    ['Tocador de Berimbau', 15.2, 18.2, 'Ouça o toque de São Bento Grande: é sinal de rasteira certeira.'],
    ['Comerciante Treme Terra', 17.4, 17.2, 'Cada banca guarda suprimentos para os quilombolas.']
  ];
  people.forEach((p, i) => entities.push({ kind: 'person', id: 'pl' + i, name: p[0], x: p[1], y: p[2], line: p[3] }));

  return {
    id: 'lira',
    name: 'Reino da Lira',
    blurb: 'Cidade de feiras, música e berimbaus. Lugar onde se compram flechas e se planeja a revolta.',
    map: m,
    entities,
    spawn: { x: 16, y: 17.8, angle: -Math.PI / 2 },
    returnSpawn: { x: 16, y: 17.6, angle: -Math.PI / 2 },
    theme: { sky0: '#3a1830', sky1: '#c46a98', floor0: '#8a5844', floor1: '#321c18' },
    enterLine: 'Lira. O toque do berimbau reverbera nas vielas. Meia Noite e Dandara abrem a roda.'
  };
}

export function createAlmas(): Realm {
  const m = blank(10);
  for (let x = 1; x < 31; x++) for (let y = 14; y <= 17; y++) m[y][x] = 0;
  for (let y = 1; y < 31; y++) for (let x = 7; x <= 9; x++) m[y][x] = 0;
  for (let y = 1; y < 31; y++) for (let x = 22; x <= 24; x++) m[y][x] = 0;
  [[8, 6], [23, 6], [8, 24], [23, 24], [16, 15]].forEach(([x, y]) => fillRect(m, x - 2, y - 2, x + 2, y + 2, 0));
  fillRect(m, 15, 12, 17, 13, 5);
  fillRect(m, 7, 4, 9, 5, 5);
  fillRect(m, 22, 4, 24, 5, 5);
  fillRect(m, 7, 22, 9, 23, 5);
  fillRect(m, 22, 22, 24, 23, 5);
  edge(m, 10);

  const spots = [[8, 8], [23, 8], [12, 15.5], [8, 3.5], [19, 15.5], [23, 26], [16, 15.5], [8, 26], [26, 15.5]];
  const entities: Entity[] = spots.map((p, i) => fromAtlas('almas', i, p[0], p[1], i === 6 ? 'portal' : 'point'));
  entities.push({ kind: 'fire', id: 'fire-a', name: 'Braseiro do templo', x: 14.2, y: 16.2 });
  entities.push({ kind: 'person', id: 'pa1', name: 'Vovó Maria Conga', x: 18.4, y: 16.2, line: 'Filho meu, banha teu peito com guiné e arruda. Os Pretos Velhos cobrem teus passos.' });

  return {
    id: 'almas',
    name: 'Reino das Almas',
    blurb: 'Vales montanhosos e templos dos Pretos Velhos. Onde a oração e a sabedoria fortalecem a alma.',
    map: m,
    entities,
    spawn: { x: 16, y: 17.4, angle: -Math.PI / 2 },
    returnSpawn: { x: 16, y: 17.5, angle: -Math.PI / 2 },
    theme: { sky0: '#1a2830', sky1: '#8eb4bc', floor0: '#6a7270', floor1: '#242c2c' },
    enterLine: 'Almas. O fumo de cachimbo de Vovó Maria Conga abençoa os guerreiros da liberdade.'
  };
}

export function createQuilombo(): Realm {
  const m = blank(1);
  fillRect(m, 8, 8, 23, 24, 0);
  for (let x = 8; x <= 23; x++) { m[8][x] = 4; m[22][x] = 4; }
  for (let y = 8; y <= 22; y++) { m[y][8] = 4; m[y][23] = 4; }
  m[22][15] = 0;
  m[22][16] = 0;
  fillRect(m, 14, 23, 17, 26, 0);
  fillRect(m, 11, 11, 13, 13, 3);
  fillRect(m, 18, 11, 20, 13, 3);
  fillRect(m, 11, 17, 13, 18, 4);
  edge(m, 3);

  return {
    id: 'quilombo',
    name: 'Quilombo Central',
    blurb: 'Santuário de refúgio e quartel-general da libertação. Onde os 49 foragidos se reúnem e treinam Capoeira.',
    safe: true,
    map: m,
    entities: [
      { kind: 'portal', id: 'quilombo-cruzeiro', name: 'Cruzeiro do Quilombo', x: 15.5, y: 19.5, countsAsPoint: false },
      { kind: 'fire', id: 'fire-q', name: 'Grande Fogueira Sagrada', x: 15.5, y: 14.5 },
      { kind: 'person', id: 'pq1', name: 'Mestre da Capoeira', x: 15.5, y: 17.4, line: 'Vem para a roda! A Ginga ilude o feitor e a Meia-Lua derruba a espada do capitão.' },
      { kind: 'person', id: 'pq2', name: 'Anciã Iyalorixá Naná', x: 17.6, y: 14.6, line: 'Aqui a fogueira não se apaga. Todos os 49 resgatados encontram comida, banho de ervas e armas.' },
      { kind: 'person', id: 'pq3', name: 'Dandara Guerreira', x: 13.4, y: 15.6, line: 'Quando os 49 irmãos estiverem reunidos, partiremos juntos para quebrar as correntes dos engenhos!' }
    ],
    spawn: { x: 15.5, y: 16.4, angle: -Math.PI / 2 },
    returnSpawn: { x: 15.5, y: 17.8, angle: -Math.PI / 2 },
    theme: { sky0: '#243018', sky1: '#d7b15a', floor0: '#8a6234', floor1: '#2c1c10' },
    enterLine: 'Quilombo Central. Chão sagrado e fortificado! Treine Capoeira, descanse e organize a revolta.'
  };
}

export function createEspaco(): Realm {
  const m = blank(11);
  fillRect(m, 12, 12, 19, 19, 0);
  corridor(m, 15, 15, 15, 4);
  corridor(m, 15, 15, 15, 27);
  corridor(m, 15, 15, 4, 15);
  corridor(m, 15, 15, 27, 15);
  corridor(m, 17, 13, 25, 6);
  corridor(m, 13, 17, 7, 25);
  corridor(m, 17, 17, 25, 25);
  fillRect(m, 13, 3, 17, 7, 0);
  fillRect(m, 13, 24, 17, 28, 0);
  fillRect(m, 3, 13, 7, 17, 0);
  fillRect(m, 24, 13, 28, 17, 0);
  fillRect(m, 23, 4, 27, 8, 0);
  fillRect(m, 5, 23, 9, 27, 0);
  fillRect(m, 23, 23, 28, 28, 0);
  edge(m, 11);

  const spots = [[15.5, 15.2], [15.5, 12.5], [18.2, 14.2], [15.5, 18.2], [12.6, 14.2], [15.5, 9.2], [22.5, 15.5], [15.5, 22.2], [9.2, 15.5]];
  const entities: Entity[] = spots.map((p, i) => fromAtlas('cruzeiros', i, p[0], p[1], 'point'));

  const gates: [string, string, number, number, string][] = [
    ['encruzilhadas', 'Reino das Encruzilhadas', 15.5, 4.6, '#e4a65f'],
    ['matas', 'Reino das Matas', 4.6, 15.5, '#a8c47c'],
    ['calunga-grande', 'Reino da Calunga Grande', 27.2, 15.5, '#9bb4d2'],
    ['calunga-pequena', 'Reino da Calunga Pequena', 15.5, 27.2, '#d8c6a0'],
    ['lira', 'Reino da Lira', 7.2, 25.2, '#d58bb1'],
    ['almas', 'Reino das Almas', 25.2, 6.2, '#79c5cb'],
    ['quilombo', 'Quilombo Central', 26.2, 26.2, '#e7b85a']
  ];
  gates.forEach((g) => entities.push({ kind: 'gate', id: 'gate-' + g[0], to: g[0], name: g[1], x: g[2], y: g[3], color: g[4] }));
  entities.push({ kind: 'fire', id: 'fire-c', name: 'Chama do entre-reinos', x: 17.2, y: 16.4 });

  return {
    id: 'cruzeiros',
    name: 'Reino dos Cruzeiros',
    blurb: 'Não é uma cidade. É o espaço-portal entre todos os outros seis reinos e o Quilombo.',
    map: m,
    entities,
    spawn: { x: 15.5, y: 17.4, angle: -Math.PI / 2 },
    arrivals: {
      encruzilhadas: { x: 15.5, y: 8.4, angle: -Math.PI / 2 },
      matas: { x: 8.4, y: 15.5, angle: Math.PI },
      'calunga-grande': { x: 23.4, y: 15.5, angle: 0 },
      'calunga-pequena': { x: 15.5, y: 23.4, angle: Math.PI / 2 },
      lira: { x: 8.2, y: 23.5, angle: Math.atan2(25.2 - 23.5, 7.2 - 8.2) },
      almas: { x: 24.2, y: 8.2, angle: Math.atan2(6.2 - 8.2, 25.2 - 24.2) },
      quilombo: { x: 24.2, y: 24.2, angle: Math.atan2(26.2 - 24.2, 26.2 - 24.2) }
    },
    theme: { sky0: '#07060f', sky1: '#1a1430', floor0: '#3a3458', floor1: '#100e18', space: true },
    enterLine: 'Espaço dos Cruzeiros. Portais celestes conectam os 7 reinos ao Quilombo Central.'
  };
}

export function createInitialWorld(): Record<string, Realm> {
  return {
    cruzeiros: createEspaco(),
    encruzilhadas: createEncruzilhadas(),
    matas: createMatas(),
    'calunga-grande': createPorto(),
    'calunga-pequena': createCemiterio(),
    lira: createLira(),
    almas: createAlmas(),
    quilombo: createQuilombo()
  };
}

export const MARK_ICONS: Record<string, { symbol: string; color: string; desc: string }> = {
  encruzilhadas: { symbol: '✖', color: '#e4a65f', desc: 'Tranca-Rua & Portais' },
  cruzeiros: { symbol: '🕯', color: '#b9b4d4', desc: 'Espaço Astral & Portais' },
  matas: { symbol: '🌿', color: '#a8c47c', desc: 'Quebra Galho & Caça' },
  'calunga-grande': { symbol: '🌊', color: '#9bb4d2', desc: 'Iemanjá & Caravela' },
  'calunga-pequena': { symbol: '💀', color: '#d8c6a0', desc: 'Omulu & Miasmas' },
  lira: { symbol: '🎭', color: '#d58bb1', desc: 'Meia Noite & Berimbaus' },
  almas: { symbol: '🪦', color: '#79c5cb', desc: 'Pretos Velhos & Véu' },
  quilombo: { symbol: '🔥', color: '#e7b85a', desc: 'Quilombo dos 49 Livres' }
};

export const MUNDI_NODES = [
  { id: 'cruzeiros', x: 360, y: 200 },
  { id: 'encruzilhadas', x: 360, y: 70 },
  { id: 'almas', x: 550, y: 110 },
  { id: 'calunga-grande', x: 590, y: 240 },
  { id: 'calunga-pequena', x: 360, y: 340 },
  { id: 'lira', x: 130, y: 280 },
  { id: 'matas', x: 120, y: 110 },
  { id: 'quilombo', x: 630, y: 80 }
];

export const INITIAL_SHRINES: Altar[] = [
  {
    id: 'altar_pedra',
    name: 'Pedra das Almas',
    symbol: '🪦',
    color: '#79c5cb',
    location: { x: 16, y: 15 },
    activated: false,
    offerings: 0,
    maxOfferings: 3,
    offeringName: 'Tabaco Sagrado & Argila Branca',
    power: 'Conexão profunda com Tata Caveira',
    buff: '+35 de Axé Máximo permanente',
    guardianName: 'Tata Caveira',
    guardianMessage: '“Para libertar os teus irmãos na Calunga, segue o rastro dos ciprestes onde a noite é mais funda. A chave do feitor quebra com a rasteira da Capoeira.”'
  },
  {
    id: 'altar_gameleira',
    name: 'Gameleira Sagrada',
    symbol: '🌿',
    color: '#a8c47c',
    location: { x: 16, y: 15 },
    activated: false,
    offerings: 0,
    maxOfferings: 3,
    offeringName: 'Ervas de Arruda, Guiné & Cabaça',
    power: 'Sabedoria de Quebra Galho',
    buff: '+25 de Vida (HP) Máxima permanente',
    guardianName: 'Quebra Galho',
    guardianMessage: '“Nas Matas, o Capitão do Mato teme o canto do corvo. Lance pedras no bambuzal para atrair a sentinela para longe do cativeiro dos 7 irmãos.”'
  },
  {
    id: 'altar_oxum',
    name: 'Cachoeira de Oxum',
    symbol: '🌊',
    color: '#9bb4d2',
    location: { x: 14, y: 14 },
    activated: false,
    offerings: 0,
    maxOfferings: 3,
    offeringName: 'Banho de Macassá & Alecrim',
    power: 'Ciclos e purificação de miasmas',
    buff: '+20% de resistência à Sede e Miasmas',
    guardianName: 'Iemanjá das Marés',
    guardianMessage: '“No Porto da Calunga Grande, a maré baixa revela as passagens onde os captores prendem os foragidos. Limpe os miasmas com chá de alecrim.”'
  },
  {
    id: 'altar_caçador',
    name: 'Clareira do Mestre Caçador',
    symbol: '🎭',
    color: '#d58bb1',
    location: { x: 16, y: 15 },
    activated: false,
    offerings: 0,
    maxOfferings: 3,
    offeringName: 'Carne Seca de Caça & Mel Silvestre',
    power: 'Agilidade de Pantera Negra',
    buff: '+25% de velocidade de corrida e dano de lança',
    guardianName: 'Pantera Negra',
    guardianMessage: '“Na Lira, os captores vigiam as esquinas armados. A agilidade da Capoeira Ancestral e a pontaria do arco quebram qualquer sentinela.”'
  }
];

export const INITIAL_REFUGEES: Refugee[] = [
  // Encruzilhadas (0) - 7 escravizados a libertar
  { id: 'ref_encruza_1', name: 'Dandara dos Ventos', title: 'Guerreira da Capoeira e Líder de Palmares', kingdomIndex: 0, rescued: false, locationHint: 'Próxima ao Marco das Três Trilhas' },
  { id: 'ref_encruza_2', name: 'Tião Batedor', title: 'Mensageiro dos Quatro Cantos', kingdomIndex: 0, rescued: false, locationHint: 'Na Viela das Lanternas' },
  { id: 'ref_encruza_3', name: 'Alaba da Noite', title: 'Guardiã dos Portais de Fuga', kingdomIndex: 0, rescued: false, locationHint: 'No Portal das Estradas' },
  { id: 'ref_encruza_4', name: 'Bako Rastreador', title: 'Vigia Noturno de Emboscadas', kingdomIndex: 0, rescued: false, locationHint: 'Perto do Mercado das Sombras' },
  { id: 'ref_encruza_5', name: 'Zola Tecelã', title: 'Guardiã das Trilhas Ocultas', kingdomIndex: 0, rescued: false, locationHint: 'Na Ponte dos Destinos' },
  { id: 'ref_encruza_6', name: 'Mandla Flecha', title: 'Corredor das Sete Vias', kingdomIndex: 0, rescued: false, locationHint: 'Na Encruzilhada Central' },
  { id: 'ref_encruza_7', name: 'Kioni Protetor', title: 'Sentinela do Cruzeiro das Estradas', kingdomIndex: 0, rescued: false, locationHint: 'Na Estrada do Cruzeiro' },

  // Cruzeiros (1) - 7 escravizados a libertar
  { id: 'ref_cruzeiro_1', name: 'Tio Tião Griô', title: 'Contador de Histórias e Guardião da Memória', kingdomIndex: 1, rescued: false, locationHint: 'Junto à Chama do Entre-Reinos' },
  { id: 'ref_cruzeiro_2', name: 'Iyalorixá Naná', title: 'Mãe das Ervas Medicinais', kingdomIndex: 1, rescued: false, locationHint: 'No Largo das Lanternas' },
  { id: 'ref_cruzeiro_3', name: 'Lumumba Ferreiro', title: 'Forjador de Lanças e Facões', kingdomIndex: 1, rescued: false, locationHint: 'No Portal de Pedra' },
  { id: 'ref_cruzeiro_4', name: 'Ayana Cantora', title: 'Mestra dos Cantos de Coragem', kingdomIndex: 1, rescued: false, locationHint: 'Na Colina do Cruzeiro' },
  { id: 'ref_cruzeiro_5', name: 'Simão Mateiro', title: 'Mateiro do Cruzeiro do Sul', kingdomIndex: 1, rescued: false, locationHint: 'Na Passagem das Sombras' },
  { id: 'ref_cruzeiro_6', name: 'Zuri Pescador', title: 'Navegador dos Rios Silenciosos', kingdomIndex: 1, rescued: false, locationHint: 'Na Praça do Caminhante' },
  { id: 'ref_cruzeiro_7', name: 'Kalu Guardião', title: 'Acólito da Tocha Sagrada', kingdomIndex: 1, rescued: false, locationHint: 'No Campo das Sete Cruzes' },

  // Matas (2) - 7 escravizados a libertar
  { id: 'ref_matas_1', name: 'Nia das Folhas', title: 'Menina dos Pássaros e Ervas Silvestres', kingdomIndex: 2, rescued: false, locationHint: 'Na Clareira da Lua' },
  { id: 'ref_matas_2', name: 'Curador Juremeiro', title: 'Mestre das Raízes Sagradas da Jurema', kingdomIndex: 2, rescued: false, locationHint: 'Na Árvore dos Ecos' },
  { id: 'ref_matas_3', name: 'Makena da Mata', title: 'Rastreadora Invisível nas Folhagens', kingdomIndex: 2, rescued: false, locationHint: 'Na Vila dos Cipós' },
  { id: 'ref_matas_4', name: 'Jabari Caçador', title: 'Atirador de Arco e Flecha', kingdomIndex: 2, rescued: false, locationHint: 'No Bosque das Brumas' },
  { id: 'ref_matas_5', name: 'Aissatou Coletora', title: 'Extratora de Resinas e Cabaças', kingdomIndex: 2, rescued: false, locationHint: 'No Pântano Esquecido' },
  { id: 'ref_matas_6', name: 'Kwame Flecheiro', title: 'Guerreiro das Copas de Jequitibá', kingdomIndex: 2, rescued: false, locationHint: 'Na Mata das Árvores Antigas' },
  { id: 'ref_matas_7', name: 'Tendai Sentinela', title: 'Guardião dos Bambuzais Sagrados', kingdomIndex: 2, rescued: false, locationHint: 'Na Passagem das Raízes' },

  // Calunga Grande (3) - 7 escravizados a libertar
  { id: 'ref_mar_1', name: 'Mestre Obá Forjador', title: 'Ferreiro Naval e Guerreiro de Capoeira', kingdomIndex: 3, rescued: false, locationHint: 'No Cais da Lua' },
  { id: 'ref_mar_2', name: 'Yawa Nadadora', title: 'Mergulhadora das Marés e Falésias', kingdomIndex: 3, rescued: false, locationHint: 'Na Praia da Fuga' },
  { id: 'ref_mar_3', name: 'Kofi Remador', title: 'Remador de Canoas de Fuga', kingdomIndex: 3, rescued: false, locationHint: 'No Porto das Almas' },
  { id: 'ref_mar_4', name: 'Malaika Vigia', title: 'Sentinela das Altas Falésias', kingdomIndex: 3, rescued: false, locationHint: 'No Farol Esquecido' },
  { id: 'ref_mar_5', name: 'Badu das Conchas', title: 'Mergulhador de Pérolas e Arpão', kingdomIndex: 3, rescued: false, locationHint: 'Na Gruta das Ondas' },
  { id: 'ref_mar_6', name: 'Amina Astrônoma', title: 'Leitora das Estrelas do Mar', kingdomIndex: 3, rescued: false, locationHint: 'Na Costa dos Navegantes' },
  { id: 'ref_mar_7', name: 'Tau das Rochas', title: 'Guardião dos Rochedos do Litoral', kingdomIndex: 3, rescued: false, locationHint: 'Na Enseada do Silêncio' },

  // Calunga Pequena (4) - 7 escravizados a libertar
  { id: 'ref_morte_1', name: 'Babá Alagbá', title: 'Sacerdote dos Ancestrais e da Memória', kingdomIndex: 4, rescued: false, locationHint: 'No Portal das Lápides' },
  { id: 'ref_morte_2', name: 'Nzinga Guardiã', title: 'Protetora das Relíquias e Ossos Sagrados', kingdomIndex: 4, rescued: false, locationHint: 'Na Capela Antiga' },
  { id: 'ref_morte_3', name: 'Enitan da Travessia', title: 'Curandeira da Febre e dos Miasmas', kingdomIndex: 4, rescued: false, locationHint: 'No Jardim Silencioso' },
  { id: 'ref_morte_4', name: 'Femi Escultor', title: 'Talhador de Marcos de Liberdade', kingdomIndex: 4, rescued: false, locationHint: 'No Campo dos Ciprestes' },
  { id: 'ref_morte_5', name: 'Thabo Zelador', title: 'Protetor dos Segredos da Cripta', kingdomIndex: 4, rescued: false, locationHint: 'Na Cripta das Sombras' },
  { id: 'ref_morte_6', name: 'Niazi Pensador', title: 'Sábio do Silêncio da Noite', kingdomIndex: 4, rescued: false, locationHint: 'No Mausoléu da Lua' },
  { id: 'ref_morte_7', name: 'Siku da Guarda', title: 'Guardião do Limiar de Omulu', kingdomIndex: 4, rescued: false, locationHint: 'No Portão de Pedra' },

  // Lira (5) - 7 escravizados a libertar
  { id: 'ref_lira_1', name: 'Mestre Alabê', title: 'Tocador do Atabaque Rúnico', kingdomIndex: 5, rescued: false, locationHint: 'No Beco dos Tambores' },
  { id: 'ref_lira_2', name: 'Dandara da Lira', title: 'Mestra de Rodas e Rasteiras Rápidas', kingdomIndex: 5, rescued: false, locationHint: 'Na Praça Escarlate' },
  { id: 'ref_lira_3', name: 'Jabulani do Berimbau', title: 'Mestre do Berimbau de Gunga', kingdomIndex: 5, rescued: false, locationHint: 'No Salão das Máscaras' },
  { id: 'ref_lira_4', name: 'Chidi Contador', title: 'Contador de Provérbios dos Orixás', kingdomIndex: 5, rescued: false, locationHint: 'Na Rua dos Artistas' },
  { id: 'ref_lira_5', name: 'Halima Soprano', title: 'Cantora dos Hinos de Oxum', kingdomIndex: 5, rescued: false, locationHint: 'No Jardim das Lanternas' },
  { id: 'ref_lira_6', name: 'Sekou Flautista', title: 'Músico de Bambu e Sopro Mágico', kingdomIndex: 5, rescued: false, locationHint: 'No Mercado da Meia-Noite' },
  { id: 'ref_lira_7', name: 'Faraji Mestre de Força', title: 'Campeão de Luta e Resistência', kingdomIndex: 5, rescued: false, locationHint: 'No Palácio das Ilusões' },

  // Almas (6) - 7 escravizados a libertar
  { id: 'ref_almas_1', name: 'Vovó Maria Conga', title: 'Rezadeira Centenária dos Pretos Velhos', kingdomIndex: 6, rescued: false, locationHint: 'No Templo do Limiar' },
  { id: 'ref_almas_2', name: 'Pai Joaquim d\'Angola', title: 'Sábio do Cachimbo Protetor e da Palha', kingdomIndex: 6, rescued: false, locationHint: 'No Castelo do Véu' },
  { id: 'ref_almas_3', name: 'Tio Benguela', title: 'Guardião da Travessia dos Ecos', kingdomIndex: 6, rescued: false, locationHint: 'Na Ponte dos Ecos' },
  { id: 'ref_almas_4', name: 'Menina Candinha', title: 'Médium de Visões Premonitórias', kingdomIndex: 6, rescued: false, locationHint: 'No Jardim Etéreo' },
  { id: 'ref_almas_5', name: 'Zandile Carpinteira', title: 'Construtora de Paliçadas e Fortes', kingdomIndex: 6, rescued: false, locationHint: 'Na Vila das Brumas' },
  { id: 'ref_almas_6', name: 'Odion Astrônomo', title: 'Filho do Sol Poente e Vigia', kingdomIndex: 6, rescued: false, locationHint: 'Na Torre do Silêncio' },
  { id: 'ref_almas_7', name: 'Mestre Kunde Menor', title: 'Discípulo da Pedra das Almas', kingdomIndex: 6, rescued: false, locationHint: 'No Trono das Sombras' }
];
