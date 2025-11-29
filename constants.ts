import { FactionType, UnitStats } from './types';

export const BOARD_SIZE = 7;
export const PHASE_DURATION = 60; // seconds

export const FACTIONS: Record<FactionType, {
  name: string;
  description: string;
  specialAbility: string;
  color: string;
  units: UnitStats[];
}> = {
  Antz: {
    name: 'Antz',
    description: 'Well rounded units',
    specialAbility: 'Builders and Pounders can do both actions (Build & Destroy)',
    color: 'bg-red-600',
    units: [
      { id: 'a_w', name: 'Worker', type: 'Builder', cost: 3, move: 1, attack: 0, health: 1, maxHealth: 1, work: 1 },
      { id: 'a_l', name: 'Laborer', type: 'Builder', cost: 5, move: 1, attack: 0, health: 2, maxHealth: 2, work: 2 },
      { id: 'a_c', name: 'Constructor', type: 'Builder', cost: 8, move: 1, attack: 0, health: 3, maxHealth: 3, work: 3 },
      { id: 'a_f', name: 'Fire', type: 'Striker', cost: 4, move: 2, attack: 1, health: 2, maxHealth: 2, work: 0 },
      { id: 'a_b', name: 'Bull', type: 'Striker', cost: 6, move: 2, attack: 2, health: 3, maxHealth: 3, work: 0 },
      { id: 'a_bu', name: 'Bullet', type: 'Striker', cost: 9, move: 2, attack: 3, health: 4, maxHealth: 4, work: 0 },
    ]
  },
  Beetlez: {
    name: 'Beetlez',
    description: 'Strong pounders',
    specialAbility: 'Units take 0 damage unless it is lethal',
    color: 'bg-blue-600',
    units: [
      { id: 'b_w', name: 'Worker', type: 'Builder', cost: 3, move: 1, attack: 0, health: 1, maxHealth: 1, work: 1 },
      { id: 'b_l', name: 'Laborer', type: 'Builder', cost: 5, move: 1, attack: 0, health: 2, maxHealth: 2, work: 2 },
      { id: 'b_c', name: 'Constructor', type: 'Builder', cost: 8, move: 1, attack: 0, health: 3, maxHealth: 3, work: 3 },
      { id: 'b_t', name: 'Tinker', type: 'Pounder', cost: 4, move: 1, attack: 0, health: 1, maxHealth: 1, work: 2 },
      { id: 'b_s', name: 'Scraper', type: 'Pounder', cost: 6, move: 1, attack: 0, health: 2, maxHealth: 2, work: 3 },
      { id: 'b_d', name: 'Destructor', type: 'Pounder', cost: 9, move: 1, attack: 0, health: 3, maxHealth: 3, work: 4 },
      { id: 'b_du', name: 'Dung', type: 'Striker', cost: 4, move: 2, attack: 1, health: 2, maxHealth: 2, work: 0 },
      { id: 'b_a', name: 'Atlas', type: 'Striker', cost: 6, move: 2, attack: 2, health: 3, maxHealth: 3, work: 0 },
      { id: 'b_h', name: 'Herculees', type: 'Striker', cost: 8, move: 2, attack: 2, health: 4, maxHealth: 4, work: 0 },
    ]
  },
  Beez: {
    name: 'Beez',
    description: 'High mobility low stats',
    specialAbility: 'Double movement through enemy territory',
    color: 'bg-yellow-500',
    units: [
      { id: 'be_w', name: 'Worker', type: 'Builder', cost: 3, move: 2, attack: 0, health: 1, maxHealth: 1, work: 1 },
      { id: 'be_l', name: 'Laborer', type: 'Builder', cost: 5, move: 2, attack: 0, health: 1, maxHealth: 1, work: 1 },
      { id: 'be_c', name: 'Constructor', type: 'Builder', cost: 7, move: 3, attack: 0, health: 2, maxHealth: 2, work: 2 },
      { id: 'be_t', name: 'Tinker', type: 'Pounder', cost: 4, move: 2, attack: 0, health: 1, maxHealth: 1, work: 1 },
      { id: 'be_s', name: 'Scraper', type: 'Pounder', cost: 6, move: 2, attack: 0, health: 1, maxHealth: 1, work: 1 },
      { id: 'be_d', name: 'Destructor', type: 'Pounder', cost: 8, move: 3, attack: 0, health: 2, maxHealth: 2, work: 2 },
      { id: 'be_b', name: 'Bumble', type: 'Striker', cost: 5, move: 2, attack: 2, health: 1, maxHealth: 1, work: 0 },
      { id: 'be_ca', name: 'Carpenter', type: 'Striker', cost: 7, move: 2, attack: 3, health: 2, maxHealth: 2, work: 0 },
      { id: 'be_k', name: 'Killer', type: 'Striker', cost: 9, move: 2, attack: 4, health: 3, maxHealth: 3, work: 0 },
    ]
  },
  Mantiz: {
    name: 'Mantiz',
    description: 'High attack',
    specialAbility: 'Units may move double their movement value',
    color: 'bg-green-600',
    units: [
      { id: 'm_w', name: 'Worker', type: 'Builder', cost: 3, move: 1, attack: 0, health: 1, maxHealth: 1, work: 1 },
      { id: 'm_l', name: 'Laborer', type: 'Builder', cost: 5, move: 1, attack: 0, health: 1, maxHealth: 1, work: 1 },
      { id: 'm_c', name: 'Constructor', type: 'Builder', cost: 8, move: 1, attack: 0, health: 2, maxHealth: 2, work: 2 },
      { id: 'm_t', name: 'Tinker', type: 'Pounder', cost: 4, move: 1, attack: 0, health: 1, maxHealth: 1, work: 1 },
      { id: 'm_s', name: 'Scraper', type: 'Pounder', cost: 6, move: 1, attack: 0, health: 1, maxHealth: 1, work: 1 },
      { id: 'm_d', name: 'Destructor', type: 'Pounder', cost: 8, move: 1, attack: 0, health: 2, maxHealth: 2, work: 2 },
      { id: 'm_r', name: 'Rainbow', type: 'Striker', cost: 5, move: 2, attack: 2, health: 2, maxHealth: 2, work: 0 },
      { id: 'm_p', name: 'Praying', type: 'Striker', cost: 7, move: 2, attack: 3, health: 3, maxHealth: 3, work: 0 },
      { id: 'm_sh', name: 'Shrimp', type: 'Striker', cost: 9, move: 2, attack: 4, health: 4, maxHealth: 4, work: 0 },
    ]
  }
};

export const INITIAL_UNLOCKS = {
  Antz: ['a_w', 'a_f'],
  Beetlez: ['b_w', 'b_t', 'b_du'],
  Beez: ['be_w', 'be_t', 'be_b'],
  Mantiz: ['m_w', 'm_t', 'm_r'],
};
