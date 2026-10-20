export type EntityKind = 'point' | 'portal' | 'gate' | 'fire' | 'person';

export interface Entity {
  id: string;
  kind: EntityKind;
  name: string;
  x: number;
  y: number;
  visited?: boolean;
  countsAsPoint?: boolean;
  power?: string;
  mestre?: string;
  realm?: string;
  line?: string;
  to?: string;
  color?: string;
  type?: string;
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

export interface SurvivalState {
  hp: number;
  hunger: number;
  thirst: number;
  axe: number;
  torch: boolean;
  radar: boolean;
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
}

export interface Refugee {
  id: string;
  name: string;
  title: string;
  kingdomIndex: number;
  rescued: boolean;
}

export type ViewMode = 'game' | 'localMap' | 'atlas' | 'reinos' | 'pontos' | 'altares' | 'refugees';
