export interface CropType {
  id: string;
  name: string;
  seedPrice: number;
  sellPrice: number;
  growTime: number; // in game hours
  color: string;
  stages: number; // number of visual growth stages
  level: number; // required farmer level
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
  tilledTiles: { [key: string]: { watered: boolean } }; // Key: "gridX,gridY"
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
    id: 'wheat', name: 'Wheat', seedPrice: 10, sellPrice: 25, growTime: 6, color: '#e2b13c', stages: 4, level: 1,
  },
  carrot: {
    id: 'carrot', name: 'Carrot', seedPrice: 14, sellPrice: 35, growTime: 7, color: '#e2733c', stages: 4, level: 2,
  },
  corn: {
    id: 'corn', name: 'Corn', seedPrice: 18, sellPrice: 45, growTime: 9, color: '#f0e34b', stages: 4, level: 3,
  },
  rice: {
    id: 'rice', name: 'Rice', seedPrice: 16, sellPrice: 40, growTime: 8, color: '#d4e157', stages: 4, level: 3,
  },
  tomato: {
    id: 'tomato', name: 'Tomato', seedPrice: 22, sellPrice: 55, growTime: 11, color: '#e23c3c', stages: 4, level: 4,
  },
  cotton: {
    id: 'cotton', name: 'Cotton', seedPrice: 24, sellPrice: 50, growTime: 10, color: '#f5f5f5', stages: 4, level: 4,
  },
  potato: {
    id: 'potato', name: 'Potato', seedPrice: 28, sellPrice: 65, growTime: 12, color: '#a1887f', stages: 4, level: 5,
  },
  strawberry: {
    id: 'strawberry', name: 'Strawberry', seedPrice: 32, sellPrice: 80, growTime: 15, color: '#e23c7c', stages: 4, level: 6,
  },
  sugarcane: {
    id: 'sugarcane', name: 'Sugarcane', seedPrice: 36, sellPrice: 90, growTime: 16, color: '#66bb6a', stages: 4, level: 7,
  },
};
