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

export const ATLAS: Record<string, [string, string, string, string, string?][]> = {
  encruzilhadas: [
    ["e01", "Encruzilhada das Sete Vias", "Abertura de Caminhos", "Exu", "Portal"],
    ["e02", "Caminho da Lua Negra", "Navegação Noturna", "Exu Mirim", "Trilha"],
    ["e03", "Praça dos Quatro Ventos", "Comunicação", "Exu das 4 Ventos", "Praça"],
    ["e04", "Portal das Estradas", "Translocação", "Tata Caveira", "Portal"],
    ["e05", "Viela das Lanternas", "Iluminação Espiritual", "Maria Mulambo", "Viela"],
    ["e06", "Ponte dos Destinos", "Escolha & Consequência", "Exu Lalu", "Ponte"],
    ["e07", "Mercado das Sombras", "Troca & Negociação", "Exu Tiriri", "Mercado"],
    ["e08", "Estrada do Cruzeiro", "Proteção em Viagem", "Exu Caveira", "Estrada"],
    ["e09", "Marco das Três Trilhas", "Divinação", "Exu Marabô", "Marco"]
  ],
  cruzeiros: [
    ["c01", "Cruzeiro das Brumas", "Visão na Neblina", "Caboclo do Cruzeiro", "Cruzeiro"],
    ["c02", "Campo das Sete Cruzes", "Proteção Múltipla", "Sete Cruzeiros", "Campo"],
    ["c03", "Vila do Marco Antigo", "Ancestralidade", "Velho do Cruzeiro", "Vila"],
    ["c04", "Estrada do Silêncio", "Meditação Profunda", "Monge do Silêncio", "Estrada"],
    ["c05", "Largo das Lanternas", "Guia Espiritual", "Mestra das Lanternas", "Largo"],
    ["c06", "Portal de Pedra", "Firmeza", "Guardião de Pedra", "Portal"],
    ["c07", "Colina do Cruzeiro", "Elevação", "Caboclo da Colina", "Colina"],
    ["c08", "Passagem das Sombras", "Travessia Segura", "Sombra do Cruzeiro", "Passagem"],
    ["c09", "Praça do Caminhante", "Hospedagem Espiritual", "Pai do Caminho", "Praça"]
  ],
  matas: [
    ["m01", "Mata das Árvores Antigas", "Sabedoria Milenar", "Jequitibá Rei", "Floresta"],
    ["m02", "Clareira da Lua", "Cura Lunar", "Mãe da Lua", "Clareira"],
    ["m03", "Trilha do Corvo", "Mensageiro", "Corvo Branco", "Trilha"],
    ["m04", "Vila dos Cipós", "Flexibilidade & Força", "Mestre Cipó", "Vila"],
    ["m05", "Bosque das Brumas", "Ocultamento", "Névoa Verde", "Bosque"],
    ["m06", "Pântano Esquecido", "Transformação", "Senhora do Lodo", "Pântano"],
    ["m07", "Árvore dos Ecos", "Memória Viva", "Gameleira Sagrada", "Árvore"],
    ["m08", "Passagem das Raízes", "Conexão Subterrânea", "Raiz Mãe", "Passagem"],
    ["m09", "Santuário Selvagem", "Refúgio Absoluto", "Pantera Negra", "Santuário"]
  ],
  "calunga-grande": [
    ["g01", "Praia das Marés", "Ciclos & Renovação", "Iemanjá", "Praia"],
    ["g02", "Porto das Almas", "Chegada & Partida", "Barqueiro", "Porto"],
    ["g03", "Baía do Crepúsculo", "Transição", "Oxumaré", "Baía"],
    ["g04", "Ilha das Brumas", "Isolamento Sagrado", "Mestra da Névoa", "Ilha"],
    ["g05", "Cais da Lua", "Intuição", "Lua Cheia", "Cais"],
    ["g06", "Farol Esquecido", "Orientação", "Guardião do Farol", "Farol"],
    ["g07", "Gruta das Ondas", "Som Primordial", "Sirena Ancestral", "Gruta"],
    ["g08", "Enseada do Silêncio", "Paz Profunda", "Mar Calmo", "Enseada"],
    ["g09", "Costa dos Navegantes", "Jornada", "Navegador Antigo", "Costa"]
  ],
  "calunga-pequena": [
    ["p01", "Cemitério das Brumas", "Comunicação Ancestral", "Omulu", "Cemitério"],
    ["p02", "Portal das Lápides", "Acesso ao Além", "Exu Cemitério", "Portal"],
    ["p03", "Jardim Silencioso", "Paz Eterna", "Mãe do Jardim", "Jardim"],
    ["p04", "Capela Antiga", "Fé & Respeito", "Padre das Almas", "Capela"],
    ["p05", "Campo dos Ciprestes", "Proteção dos Mortos", "Cipreste Velho", "Campo"],
    ["p06", "Cripta das Sombras", "Segredos Guardados", "Guardião da Cripta", "Cripta"],
    ["p07", "Mausoléu da Lua", "Memória Iluminada", "Lua Prateada", "Mausoléu"],
    ["p08", "Alameda das Memórias", "Lembrança Viva", "Ancestral Silencioso", "Alameda"],
    ["p09", "Portão de Pedra", "Limiar Definitivo", "Guardião do Portão", "Portão"]
  ],
  lira: [
    ["l01", "Cidade da Lira", "Harmonia Total", "Rei da Lira", "Cidade"],
    ["l02", "Praça Escarlate", "Paixão Criativa", "Rainha Escarlate", "Praça"],
    ["l03", "Beco dos Tambores", "Ritmo do Coração", "Mestre Tambor", "Beco"],
    ["l04", "Salão das Máscaras", "Transformação", "Mestre das Máscaras", "Salão"],
    ["l05", "Rua dos Artistas", "Expressão Livre", "Artista Errante", "Rua"],
    ["l06", "Jardim das Lanternas", "Luz na Festa", "Mestra das Lanternas", "Jardim"],
    ["l07", "Mercado da Meia-Noite", "Troca Mística", "Feitor da Noite", "Mercado"],
    ["l08", "Pátio dos Espelhos", "Auto-conhecimento", "Espelho Mágico", "Pátio"],
    ["l09", "Palácio das Ilusões", "Realidade Fluida", "Ilusionista Supremo", "Palácio"]
  ],
  almas: [
    ["a01", "Portal das Almas", "Transição de Almas", "Barqueiro das Almas", "Portal"],
    ["a02", "Cidade do Crepúsculo", "Existência Limiar", "Prefeito do Crepúsculo", "Cidade"],
    ["a03", "Ponte dos Ecos", "Mensagens do Além", "Eco Eterno", "Ponte"],
    ["a04", "Torre do Silêncio", "Visão Panorâmica", "Vigia Silencioso", "Torre"],
    ["a05", "Jardim Etéreo", "Beleza Imortal", "Jardineiro das Almas", "Jardim"],
    ["a06", "Vila das Brumas", "Comunidade Espiritual", "Anciã da Bruma", "Vila"],
    ["a07", "Templo do Limiar", "Rito de Passagem", "Sacerdote do Véu", "Templo"],
    ["a08", "Castelo do Véu", "Domínio do Mistério", "Senhor do Véu", "Castelo"],
    ["a09", "Trono das Sombras", "Autoridade Espiritual", "Rainha das Sombras", "Trono"]
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
    visited: false
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
  entities.push({ kind: 'person', id: 'pe1', name: 'Andarilho', x: 9, y: 16.5, line: 'Aqui toda rua encontra outra. Não existe beco sem cruz.' });
  entities.push({ kind: 'person', id: 'pe2', name: 'Lanterninha', x: 21, y: 12.5, line: 'A viela acende quando o Cruzeiro do centro abre.' });

  return {
    id: 'encruzilhadas',
    name: 'Reino das Encruzilhadas',
    blurb: 'Cidade de ruas retas que se cruzam sempre. Guardiões de encruzilhada e caminhos abertos.',
    map: m,
    entities,
    spawn: { x: 15, y: 18.5, angle: -Math.PI / 2 },
    returnSpawn: { x: 15, y: 17.4, angle: -Math.PI / 2 },
    theme: { sky0: '#2c2418', sky1: '#8a7048', floor0: '#6a5844', floor1: '#2a2118' },
    enterLine: 'Encruzilhadas. As ruas se cruzam em ângulo reto. O Cruzeiro está no centro.'
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
  entities.push({ kind: 'person', id: 'pm1', name: 'Mateiro', x: 14.2, y: 16.8, line: 'A aldeia é o claro. O resto é mata fechada.' });
  entities.push({ kind: 'person', id: 'pm2', name: 'Menina das folhas', x: 18.5, y: 16.2, line: 'Não saia da trilha. A floresta devolve quem se perde.' });

  return {
    id: 'matas',
    name: 'Reino das Matas',
    blurb: 'Aldeia no claro, floresta densa e espíritos da Jurema em volta.',
    map: m,
    entities,
    spawn: { x: 16, y: 18.2, angle: -Math.PI / 2 },
    returnSpawn: { x: 16, y: 17.2, angle: -Math.PI / 2 },
    theme: { sky0: '#143226', sky1: '#3d8a52', floor0: '#3e5a28', floor1: '#182010' },
    enterLine: 'Matas. Uma aldeia no centro e floresta por todos os lados.'
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
  entities.push({ kind: 'person', id: 'pg1', name: 'Estivador', x: 17.2, y: 16.2, line: 'O mar é o lado direito. O cais entra na água.' });
  entities.push({ kind: 'person', id: 'pg2', name: 'Pescadora', x: 24.5, y: 16.8, line: 'Daqui se vê pedra, cais e o cruzeiro da praia.' });

  return {
    id: 'calunga-grande',
    name: 'Reino da Calunga Grande',
    blurb: 'Cidade portuária e sagrada. Um lado é praia, cais, ondas de Iemanjá e pedra.',
    map: m,
    entities,
    spawn: { x: 16.5, y: 16, angle: 0 },
    returnSpawn: { x: 16.2, y: 14.5, angle: Math.PI / 2 },
    theme: { sky0: '#16344a', sky1: '#7eb4d4', floor0: '#c2a06a', floor1: '#6a4e30' },
    enterLine: 'Calunga Grande. Cidade do porto. À direita, praia, cais e pedras.'
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
  entities.push({ kind: 'person', id: 'pp1', name: 'Coveiro', x: 15, y: 21, line: 'Não é vila. É um cemitério grande, fileira após fileira sob a guarda de Omulu.' });

  return {
    id: 'calunga-pequena',
    name: 'Reino da Calunga Pequena',
    blurb: 'O grande cemitério, limiar sagrado e memórias ancestrais guardadas por Omulu.',
    map: m,
    entities,
    spawn: { x: 15, y: 26.5, angle: -Math.PI / 2 },
    returnSpawn: { x: 15, y: 26.5, angle: -Math.PI / 2 },
    theme: { sky0: '#16141a', sky1: '#6a6258', floor0: '#4a4036', floor1: '#1a1612' },
    enterLine: 'Calunga Pequena. O reino inteiro é um cemitério sagrado.'
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
    ['Feirante', 13.2, 13.4, 'A feira ocupa as ruas. O canto vem de graça.'],
    ['Mascarada', 18.2, 14.2, 'Compro, troco e danço. A Lira é comércio, festa e gente.'],
    ['Tocador', 15.2, 18.2, 'Se ouvir o tambor, você ainda está na cidade certa.'],
    ['Comerciante', 17.4, 17.2, 'Cada banca é um ponto. A praça é o Cruzeiro.']
  ];
  people.forEach((p, i) => entities.push({ kind: 'person', id: 'pl' + i, name: p[0], x: p[1], y: p[2], line: p[3] }));

  return {
    id: 'lira',
    name: 'Reino da Lira',
    blurb: 'Cidade de comércio, feiras, tambores e mistério sob a noite.',
    map: m,
    entities,
    spawn: { x: 16, y: 17.8, angle: -Math.PI / 2 },
    returnSpawn: { x: 16, y: 17.6, angle: -Math.PI / 2 },
    theme: { sky0: '#3a1830', sky1: '#c46a98', floor0: '#8a5844', floor1: '#321c18' },
    enterLine: 'Lira. Feiras, bancas e gente nas ruas. O Cruzeiro é a praça central.'
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
  entities.push({ kind: 'person', id: 'pa1', name: 'Sacristão', x: 18.4, y: 16.2, line: 'As montanhas fecham o reino. As igrejas ficam nos vales espirituais.' });

  return {
    id: 'almas',
    name: 'Reino das Almas',
    blurb: 'Montanhas, vales sagrados e igrejas dos Pretos Velhos onde o véu se desfaz.',
    map: m,
    entities,
    spawn: { x: 16, y: 17.4, angle: -Math.PI / 2 },
    returnSpawn: { x: 16, y: 17.5, angle: -Math.PI / 2 },
    theme: { sky0: '#1a2830', sky1: '#8eb4bc', floor0: '#6a7270', floor1: '#242c2c' },
    enterLine: 'Almas. Vales entre montanhas e igrejas onde o caminho se abre.'
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
    name: 'Quilombo',
    blurb: 'Zona segura e sagrada. Neste chão fortificado não há perigo nem inimigos.',
    safe: true,
    map: m,
    entities: [
      { kind: 'portal', id: 'quilombo-cruzeiro', name: 'Cruzeiro do Quilombo', x: 15.5, y: 19.5, countsAsPoint: false },
      { kind: 'fire', id: 'fire-q', name: 'Fogueira Sagrada', x: 15.5, y: 14.5 },
      { kind: 'person', id: 'pq1', name: 'Guardiã do portão', x: 15.5, y: 17.4, line: 'Pode entrar. Caçador nenhum cruza esta paliçada sagrada.' },
      { kind: 'person', id: 'pq2', name: 'Anciã', x: 17.6, y: 14.6, line: 'Aqui a fogueira não se apaga. Este chão é livre e seguro.' },
      { kind: 'person', id: 'pq3', name: 'Criança', x: 13.4, y: 15.6, line: 'Lá fora tem mata e cidade. Aqui dentro, somos família e força.' }
    ],
    spawn: { x: 15.5, y: 16.4, angle: -Math.PI / 2 },
    returnSpawn: { x: 15.5, y: 17.8, angle: -Math.PI / 2 },
    theme: { sky0: '#243018', sky1: '#d7b15a', floor0: '#8a6234', floor1: '#2c1c10' },
    enterLine: 'Quilombo. Zona segura e refúgio dos ancestrais. Aqui você descansa.'
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
    ['quilombo', 'Quilombo', 26.2, 26.2, '#e7b85a']
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
    enterLine: 'Espaço dos Cruzeiros. Não há cidade aqui: só portais estelares para os outros reinos.'
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
  encruzilhadas: { symbol: '✖', color: '#e4a65f', desc: 'Caminhos & Portais' },
  cruzeiros: { symbol: '🕯', color: '#b9b4d4', desc: 'Espaço-Portal & Silêncio' },
  matas: { symbol: '🌿', color: '#a8c47c', desc: 'Florestas & Clareiras' },
  'calunga-grande': { symbol: '🌊', color: '#9bb4d2', desc: 'Marés & Profundezas' },
  'calunga-pequena': { symbol: '💀', color: '#d8c6a0', desc: 'Limiar & Memória' },
  lira: { symbol: '🎭', color: '#d58bb1', desc: 'Celebração & Mistério' },
  almas: { symbol: '🪦', color: '#79c5cb', desc: 'Espiritual & Véu' },
  quilombo: { symbol: '🔥', color: '#e7b85a', desc: 'Refúgio Seguro dos Livres' }
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
    offeringName: 'Tabaco Sagrado & Argila',
    power: 'Conexão profunda com Mestre Kunde',
    buff: '+35 de Axé Máximo permanente'
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
    offeringName: 'Ervas de Jurema & Cabaça',
    power: 'Sabedoria das raízes ancestrais',
    buff: '+25 de Vida (HP) Máxima permanente'
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
    offeringName: 'Banho de Macassá & Água Doce',
    power: 'Ciclos, renovação e purificação',
    buff: '+20% de resistência à Sede'
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
    offeringName: 'Frutos Silvestres & Mel',
    power: 'Agilidade dos ventos e pontaria',
    buff: '+20% de velocidade de corrida'
  }
];

export const INITIAL_REFUGEES: Refugee[] = [
  // Encruzilhadas (0)
  { id: 'ref_encruza_1', name: 'Dandara', title: 'Guerreira das Sete Vias', kingdomIndex: 0, rescued: false },
  { id: 'ref_encruza_2', name: 'Tião Batedor', title: 'Mensageiro dos Quatro Cantos', kingdomIndex: 0, rescued: false },
  { id: 'ref_encruza_3', name: 'Alaba', title: 'Guardiã dos Portais de Fuga', kingdomIndex: 0, rescued: false },
  { id: 'ref_encruza_4', name: 'Bako', title: 'Rastreador Noturno', kingdomIndex: 0, rescued: false },
  { id: 'ref_encruza_5', name: 'Zola', title: 'Tecelã das Trilhas Ocultas', kingdomIndex: 0, rescued: false },
  { id: 'ref_encruza_6', name: 'Mandla', title: 'Corredor dos Ventos', kingdomIndex: 0, rescued: false },
  { id: 'ref_encruza_7', name: 'Kioni', title: 'Protetor do Cruzeiro das Estradas', kingdomIndex: 0, rescued: false },

  // Cruzeiros (1)
  { id: 'ref_cruzeiro_1', name: 'Tio Tião', title: 'Griô do Cruzeiro das Almas', kingdomIndex: 1, rescued: false },
  { id: 'ref_cruzeiro_2', name: 'Iyalorixá Naná', title: 'Mãe das Ervas e dos Cruzeiros', kingdomIndex: 1, rescued: false },
  { id: 'ref_cruzeiro_3', name: 'Lumumba', title: 'Carregador de Pedras Sagradas', kingdomIndex: 1, rescued: false },
  { id: 'ref_cruzeiro_4', name: 'Ayana', title: 'Cantora dos Hinos Ancestrais', kingdomIndex: 1, rescued: false },
  { id: 'ref_cruzeiro_5', name: 'Simão', title: 'Mateiro do Cruzeiro do Sul', kingdomIndex: 1, rescued: false },
  { id: 'ref_cruzeiro_6', name: 'Zuri', title: 'Pescador dos Rios Místicos', kingdomIndex: 1, rescued: false },
  { id: 'ref_cruzeiro_7', name: 'Kalu', title: 'Acólito das Lanternas', kingdomIndex: 1, rescued: false },

  // Matas (2)
  { id: 'ref_matas_1', name: 'Nia', title: 'Menina dos Pássaros e das Folhas', kingdomIndex: 2, rescued: false },
  { id: 'ref_matas_2', name: 'Curador Juremeiro', title: 'Mestre das Raízes da Jurema', kingdomIndex: 2, rescued: false },
  { id: 'ref_matas_3', name: 'Makena', title: 'Rastreadora Invisível', kingdomIndex: 2, rescued: false },
  { id: 'ref_matas_4', name: 'Jabari', title: 'Caçador de Mutum', kingdomIndex: 2, rescued: false },
  { id: 'ref_matas_5', name: 'Aissatou', title: 'Coletora de Resinas Sagradas', kingdomIndex: 2, rescued: false },
  { id: 'ref_matas_6', name: 'Kwame', title: 'Flecheiro dos Jequitibás', kingdomIndex: 2, rescued: false },
  { id: 'ref_matas_7', name: 'Tendai', title: 'Guardião dos Bambuzais', kingdomIndex: 2, rescued: false },

  // Calunga Grande (3)
  { id: 'ref_mar_1', name: 'Mestre Obá', title: 'Ferreiro dos Corais e da Forja', kingdomIndex: 3, rescued: false },
  { id: 'ref_mar_2', name: 'Yawa', title: 'Mergulhadora das Marés Revoltas', kingdomIndex: 3, rescued: false },
  { id: 'ref_mar_3', name: 'Kofi', title: 'Remador das Ondas Bravas', kingdomIndex: 3, rescued: false },
  { id: 'ref_mar_4', name: 'Malaika', title: 'Sentinela das Falésias', kingdomIndex: 3, rescued: false },
  { id: 'ref_mar_5', name: 'Badu', title: 'Menino das Conchas', kingdomIndex: 3, rescued: false },
  { id: 'ref_mar_6', name: 'Amina', title: 'Astrônoma do Cruzeiro do Mar', kingdomIndex: 3, rescued: false },
  { id: 'ref_mar_7', name: 'Tau', title: 'Guardião dos Rochedos do Sul', kingdomIndex: 3, rescued: false },

  // Calunga Pequena (4)
  { id: 'ref_morte_1', name: 'Babá Alagbá', title: 'Sacerdote dos Ancestrais Sepultados', kingdomIndex: 4, rescued: false },
  { id: 'ref_morte_2', name: 'Nzinga', title: 'Guardiã das Relíquias e Ossos Santos', kingdomIndex: 4, rescued: false },
  { id: 'ref_morte_3', name: 'Enitan', title: 'Partideira da Travessia Negra', kingdomIndex: 4, rescued: false },
  { id: 'ref_morte_4', name: 'Femi', title: 'Escultor dos Marcos Funerários', kingdomIndex: 4, rescued: false },
  { id: 'ref_morte_5', name: 'Thabo', title: 'Zelador das Memórias Esquecidas', kingdomIndex: 4, rescued: false },
  { id: 'ref_morte_6', name: 'Niazi', title: 'Filósofo dos Silêncios', kingdomIndex: 4, rescued: false },
  { id: 'ref_morte_7', name: 'Siku', title: 'Protetor dos Túmulos Anônimos', kingdomIndex: 4, rescued: false },

  // Lira (5)
  { id: 'ref_lira_1', name: 'Mestre Alabê', title: 'Tocador do Tambor de Iemanjá', kingdomIndex: 5, rescued: false },
  { id: 'ref_lira_2', name: 'Dandara da Lira', title: 'Mestra das Rodas de Capoeira e Dança', kingdomIndex: 5, rescued: false },
  { id: 'ref_lira_3', name: 'Jabulani', title: 'Mestre do Berimbau de Barriga', kingdomIndex: 5, rescued: false },
  { id: 'ref_lira_4', name: 'Chidi', title: 'Contador de Fábulas e Histórias', kingdomIndex: 5, rescued: false },
  { id: 'ref_lira_5', name: 'Halima', title: 'Soprano dos Cantos de Oxum', kingdomIndex: 5, rescued: false },
  { id: 'ref_lira_6', name: 'Sekou', title: 'Flautista dos Bambus da Mata', kingdomIndex: 5, rescued: false },
  { id: 'ref_lira_7', name: 'Faraji', title: 'Mestre da Alegria e dos Jogos de Força', kingdomIndex: 5, rescued: false },

  // Almas (6)
  { id: 'ref_almas_1', name: 'Vovó Maria Conga', title: 'Rezadeira Centenária dos Pretos Velhos', kingdomIndex: 6, rescued: false },
  { id: 'ref_almas_2', name: 'Pai Joaquim d\'Angola', title: 'Sábio da Palha e do Cachimbo Protetor', kingdomIndex: 6, rescued: false },
  { id: 'ref_almas_3', name: 'Tio Benguela', title: 'Guardião da Travessia dos Ecos', kingdomIndex: 6, rescued: false },
  { id: 'ref_almas_4', name: 'Menina Candinha', title: 'Médium das Visões Premonitórias', kingdomIndex: 6, rescued: false },
  { id: 'ref_almas_5', name: 'Zandile', title: 'Carpinteira dos Altares da Mata', kingdomIndex: 6, rescued: false },
  { id: 'ref_almas_6', name: 'Odion', title: 'Astrônomo e Filho do Sol Poente', kingdomIndex: 6, rescued: false },
  { id: 'ref_almas_7', name: 'Mestre Kunde Menor', title: 'Discípulo da Pedra das Almas', kingdomIndex: 6, rescued: false }
];
