export type FactionType = 'Antz' | 'Beetlez' | 'Mantiz' | 'Beez';

export type UnitType = 'Builder' | 'Pounder' | 'Striker';

export interface UnitStats {
  name: string;
  cost: number;
  move: number;
  attack: number;
  health: number;
  maxHealth: number;
  work: number;
  type: UnitType;
  id: string; // Unique ID for tech tree matching
}

export interface Unit extends UnitStats {
  instanceId: string;
  ownerId: string;
  x: number;
  y: number;
  hasActed: boolean;
  currentHealth: number;
}

export interface PlayerState {
  id: string; // Peer ID
  name: string;
  isReady: boolean;
  faction: FactionType | null;
  resources: number;
  unlockedUnits: string[]; // IDs of units unlocked
  unitsBuilt: number;
  unitsKilled: number;
}

export interface GameState {
  phase: 'LOBBY' | 'STARTING' | 'RESOURCE' | 'BUILDING' | 'ACTION' | 'GAME_OVER';
  turnNumber: number;
  players: PlayerState[];
  units: Unit[];
  pylons: number[][]; // 8x8 grid of pylon health (0-5)
  // Board control is derived from pylons
  chatMessages: ChatMessage[];
  winnerId: string | null;
  phaseTimeRemaining: number;
  actionQueue: string[]; // List of unit instanceIds to act in order
  currentActorIndex: number;
}

export interface ChatMessage {
  senderId: string;
  text: string;
  timestamp: number;
}

export interface NetworkMessage {
  type: 'JOIN' | 'CHAT' | 'UPDATE_PLAYER' | 'START_GAME' | 'PHASE_CHANGE' | 'SYNC_STATE' | 'SUBMIT_BUILD_ORDERS' | 'ANIMATION_EVENT';
  payload?: any;
}

export interface BuildOrder {
  unitId: string;
  targetX: number;
  targetY: number;
  type: 'BUILD_UNIT' | 'UNLOCK_TECH';
}