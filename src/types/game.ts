export type EntityKind =
  | 'point'
  | 'portal'
  | 'gate'
  | 'fire'
  | 'person'
  | 'animal'
  | 'enemy'
  | 'guardian';

export type WeaponType = 'capoeira' | 'pedra' | 'lanca' | 'arco';

export type AnimalType = 'coelho' | 'javali' | 'pato' | 'peixe';

export type EnemyType = 'kiumba' | 'capitao' | 'miliciano';

export type CampaignPhase = 'fase1_fuga' | 'fase2_libertacao' | 'fase3_revolta' | 'vitoria';

export interface Entity {
  id: string;
  kind: EntityKind;
  name: string;
  x: number;
  y: number;
  hp?: number;
  maxHp?: number;
  visited?: boolean;
  countsAsPoint?: boolean;
  power?: string;
  mestre?: string;
  realm?: string;
  line?: string;
  to?: string;
  color?: string;
  type?: string;
  animalType?: AnimalType;
  enemyType?: EnemyType;
  isDead?: boolean;
  speed?: number;
  secretClue?: string;
}

export interface RealmTheme {
  sky0: string;
  sky1: string;
  floor0: string;
  floor1: string;
  space?: boolean;
}

export interface SpawnPoint {
  x: number;
  y: number;
  angle: number;
}

export interface Realm {
  id: string;
  name: string;
  blurb: string;
  safe?: boolean;
  map: number[][];
  entities: Entity[];
  spawn: SpawnPoint;
  returnSpawn?: SpawnPoint;
  arrivals?: Record<string, SpawnPoint>;
  theme: RealmTheme;
  enterLine: string;
}

export interface PlayerState {
  x: number;
  y: number;
  angle: number;
}

export interface Inventory {
  meat: number;
  water: number;
  arruda: number;
  guine: number;
  alecrim: number;
  arrows: number;
  spears: number;
  stones: number; // infinity available
}

export interface CapoeiraSkills {
  ginga: boolean;
  rasteira: boolean;
  meiaLua: boolean;
  level: number;
}

export interface SurvivalState {
  hp: number;
  hunger: number;
  thirst: number;
  axe: number;
  torch: boolean;
  radar: boolean;
  miasmas: number; // 0 to 100% miasma contamination from dark entities
  activeWeapon: WeaponType;
  inventory: Inventory;
  capoeira: CapoeiraSkills;
  phase: CampaignPhase;
  quilomboFounded: boolean;
  revoltProgress: number; // 0 to 100% in Phase 3
}

export interface Altar {
  id: string;
  name: string;
  symbol: string;
  color: string;
  location: { x: number; y: number };
  activated: boolean;
  offerings: number;
  maxOfferings: number;
  power: string;
  buff: string;
  offeringName: string;
  guardianName: string;
  guardianMessage: string;
}

export interface Refugee {
  id: string;
  name: string;
  title: string;
  kingdomIndex: number;
  rescued: boolean;
  locationHint?: string;
}

export type ViewMode =
  | 'game'
  | 'localMap'
  | 'atlas'
  | 'reinos'
  | 'pontos'
  | 'altares'
  | 'refugees'
  | 'herbs'
  | 'capoeira'
  | 'prologue'
  | 'revolta'
  | 'pause';
