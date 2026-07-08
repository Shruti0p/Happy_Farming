export interface CropType {
  id: string;
  name: string;
  seedPrice: number;
  sellPrice: number;
  growTime: number; // in game hours
  color: string;
  stages: number; // number of visual growth stages
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'seed' | 'crop' | 'material' | 'tool';
  count: number;
  description?: string;
  color?: string;
}

export interface CropState {
  cropId: string;
  stage: number; // 0 to maxStage
  watered: boolean;
  plantedAt: number; // game minutes
  lastWateredAt: number; // game minutes
  unwateredDays?: number; // Days without water
}

export interface StructureState {
  id: string;
  type: 'fence' | 'path' | 'scarecrow' | 'lantern' | 'mayo_maker' | 'cheese_press' | 'loom' | 'seed_maker' | 'preserves_jar';
  x: number;
  y: number;
}

export interface AnimalState {
  id: string;
  type: 'chicken' | 'cow' | 'sheep' | 'pig' | 'duck' | 'goat' | 'horse' | 'rabbit' | 'dog' | 'cat';
  name: string;
  fed: boolean;
  affection: number; // 0 to 100
  lastFedDay: number;
  hasProduct: boolean;
  x?: number; // Roaming coordinates
  y?: number;
  sleeping?: boolean;
}

export interface QuestItem {
  id: string;
  name: string;
  desc: string;
  target: number;
  current: number;
  reward: number;
  done: boolean;
  claimed: boolean;
}

export interface SavedGameState {
  seed: string;
  coins: number;
  gems: number;
  xp: number;
  level: number;
  energy: number;
  day: number;
  hour: number;
  minute: number;
  season: 'Spring' | 'Summer' | 'Autumn' | 'Winter';
  weather: 'Sunny' | 'Rain' | 'Storm' | 'Cloudy' | 'Wind';
  inventory: InventoryItem[];
  crops: { [key: string]: CropState }; // Key: "gridX,gridY"
  structures: { [key: string]: StructureState }; // Key: "gridX,gridY"
  animals: AnimalState[];
  clearedObjects: string[]; // Set of "gridX,gridY" that were pre-generated trees/rocks/bushes but cleared
  playerPos?: { x: number; y: number };
  buildings: {
    barn: { id: string; level: number; name: string };
    coop: { id: string; level: number; name: string };
    shed: { id: string; level: number; name: string };
    storage: { id: string; level: number; name: string };
    workshop: { id: string; level: number; name: string };
    bakery: { id: string; level: number; name: string };
    windmill: { id: string; level: number; name: string };
    greenhouse: { id: string; level: number; name: string };
  };
  questProgress: {
    dailyQuests: QuestItem[];
    achievements: QuestItem[];
    storyMissions: QuestItem[];
  };
  settings: {
    volume: number;
    music: boolean;
    sound: boolean;
    speed: number;
  };
  friendships: {
    [key: string]: {
      name: string;
      points: number; // 0 to 1250 (250 pts = 1 heart, max 5 hearts)
      hearts: number;
      chattedToday: boolean;
      giftedToday: boolean;
    }
  };
  machines: {
    [key: string]: {
      id: string;
      type: 'mayo_maker' | 'cheese_press' | 'loom' | 'seed_maker' | 'preserves_jar';
      x: number;
      y: number;
      processing: boolean;
      ingredientId?: string;
      timeLeft: number; // in-game minutes left
      finished: boolean;
    }
  };
}

export const CROPS: { [key: string]: CropType } = {
  wheat: {
    id: 'wheat',
    name: 'Wheat',
    seedPrice: 10,
    sellPrice: 25,
    growTime: 6, // 6 game hours
    color: '#e2b13c',
    stages: 4,
  },
  tomato: {
    id: 'tomato',
    name: 'Tomato',
    seedPrice: 20,
    sellPrice: 55,
    growTime: 12, // 12 game hours
    color: '#e23c3c',
    stages: 4,
  },
  carrot: {
    id: 'carrot',
    name: 'Carrot',
    seedPrice: 15,
    sellPrice: 40,
    growTime: 8, // 8 game hours
    color: '#e2733c',
    stages: 4,
  },
  strawberry: {
    id: 'strawberry',
    name: 'Strawberry',
    seedPrice: 30,
    sellPrice: 85,
    growTime: 18, // 18 game hours
    color: '#e23c7c',
    stages: 4,
  },
  corn: {
    id: 'corn',
    name: 'Corn',
    seedPrice: 25,
    sellPrice: 65,
    growTime: 14, // 14 game hours
    color: '#f0e34b',
    stages: 4,
  },
};
