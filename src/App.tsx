import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coins, Sparkles, Flame, Plus, Minus, Moon, Sun, 
  ShoppingBag, Hammer, Heart, Settings, Briefcase, 
  Hand, ShieldAlert, ArrowRight, Trophy, ArrowUpCircle
} from 'lucide-react';

import { GameCanvas } from './game3d/GameCanvas';
import { SavedGameState, InventoryItem, CROPS } from './game/types';

// Modal imports
import { InventoryModal } from './components/InventoryModal';
import { ShopModal } from './components/ShopModal';
import { BuildModal } from './components/BuildModal';
import { AnimalsModal } from './components/AnimalsModal';
import { SettingsModal } from './components/SettingsModal';
import { NpcDialogModal } from './components/NpcDialogModal';
import { QuestModal } from './components/QuestModal';
import { UpgradeBuildingsModal } from './components/UpgradeBuildingsModal';

const SAVE_KEY = 'evergrove_farming_sim_save';

const DEFAULT_STATE = (): SavedGameState => {
  const randomSeed = Math.floor(100000 + Math.random() * 900000).toString();
  return {
    seed: randomSeed,
    coins: 500,
    gems: 10,
    xp: 0,
    level: 1,
    energy: 100,
    day: 1,
    hour: 6,
    minute: 0,
    season: 'Spring',
    weather: 'Sunny',
    inventory: [
      { id: 'hoe', name: 'Iron Hoe', type: 'tool', count: 1, description: 'Till tilled plots for seed planting.', color: '#ad7f58' },
      { id: 'water_can', name: 'Watering Can', type: 'tool', count: 1, description: 'Moisten dry farmland to grow crops.', color: '#4cc9f0' },
      { id: 'axe', name: 'Logging Axe', type: 'tool', count: 1, description: 'Chop down wild trees for lumber.', color: '#a2d2ff' },
      { id: 'pickaxe', name: 'Mining Pickaxe', type: 'tool', count: 1, description: 'Shatter large boulders for building stone.', color: '#7a828a' },
      { id: 'scythe', name: 'Scythe', type: 'tool', count: 1, description: 'Used to clear weeds, grass, and destroy dead/growing crops.', color: '#dee2e6' },
      { id: 'fishing_rod', name: 'Fishing Rod', type: 'tool', count: 1, description: 'Cast into rivers to catch fresh, valuable fish.', color: '#fcbf49' },
      { id: 'wheat_seeds', name: 'Wheat Seeds', type: 'seed', count: 10, description: 'Grows hardy golden grain.', color: '#e2b13c' },
      { id: 'carrot_seeds', name: 'Carrot Seeds', type: 'seed', count: 5, description: 'Grows crunchy orange roots.', color: '#e2733c' },
    ],
    crops: {},
    tilledTiles: {},
    structures: {},
    animals: [],
    clearedObjects: [],
    buildings: {
      barn: { id: 'barn', level: 1, name: 'Red Barn' },
      coop: { id: 'coop', level: 1, name: 'Chicken Coop' },
      shed: { id: 'shed', level: 0, name: 'Cow Shed' },
      storage: { id: 'storage', level: 0, name: 'Silo Storage' },
      workshop: { id: 'workshop', level: 0, name: 'Crafting Workshop' },
      bakery: { id: 'bakery', level: 0, name: 'Farm Bakery' },
      windmill: { id: 'windmill', level: 1, name: 'Seeded Windmill' },
      greenhouse: { id: 'greenhouse', level: 0, name: 'Ruined Greenhouse' },
    },
    questProgress: {
      dailyQuests: [
        { id: 'daily_water', name: 'Nourish the Earth', desc: 'Water 3 growing crops on tilled soil', target: 3, current: 0, reward: 50, done: false, claimed: false },
        { id: 'daily_harvest', name: 'Reap the Harvest', desc: 'Harvest any ripe crop with your bare hands', target: 1, current: 0, reward: 80, done: false, claimed: false },
        { id: 'daily_chop', name: 'Lumberjack Duties', desc: 'Chop a tree or log with your Axe', target: 1, current: 0, reward: 60, done: false, claimed: false }
      ],
      achievements: [
        { id: 'ach_millionaire', name: 'Gold Rush', desc: 'Earn a lifetime total of 5,000 gold', target: 5000, current: 350, reward: 200, done: false, claimed: false },
        { id: 'ach_level', name: 'Professional Farmer', desc: 'Reach Character Level 5', target: 5, current: 1, reward: 150, done: false, claimed: false },
        { id: 'ach_animals', name: 'Animal Whisperer', desc: 'Keep 5 happy livestock animals on the farm', target: 5, current: 0, reward: 250, done: false, claimed: false },
        { id: 'ach_fish', name: 'Master Angler', desc: 'Successfully catch 10 fish from the river', target: 10, current: 0, reward: 180, done: false, claimed: false }
      ],
      storyMissions: [
        { id: 'story_greenhouse', name: 'Rebuild the Greenhouse', desc: 'Upgrade the Greenhouse to Level 1 to grow crops in any season (Requires 30 wood, 30 stone, 500g)', target: 1, current: 0, reward: 500, done: false, claimed: false },
        { id: 'story_friend', name: 'Village Greetings', desc: 'Introduce yourself and reach 1 Heart with Robin the Carpenter (250 Friendship Points)', target: 250, current: 0, reward: 200, done: false, claimed: false },
        { id: 'story_animals', name: 'First Livestock', desc: 'Buy any animal (Chicken, Cow, or Sheep) from the market', target: 1, current: 0, reward: 150, done: false, claimed: false }
      ]
    },
    settings: {
      volume: 60,
      music: true,
      sound: true,
      speed: 1,
    },
    friendships: {
      robin: { name: 'Robin the Carpenter', points: 0, hearts: 0, chattedToday: false, giftedToday: false },
      pierre: { name: 'Pierre the Shopkeeper', points: 0, hearts: 0, chattedToday: false, giftedToday: false },
      lewis: { name: 'Mayor Lewis', points: 0, hearts: 0, chattedToday: false, giftedToday: false },
    },
    machines: {}
  };
};

function TabButton({ icon, label, active, onClick, title }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title || label}
      className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200 border-2 ${
        active
          ? 'bg-gradient-to-br from-[#8bc34a] to-[#689f38] border-white text-white shadow-lg shadow-[#8bc34a]/30 scale-105'
          : 'bg-[#5d4037]/80 border-[#d7ccc8]/40 text-[#d7ccc8] hover:bg-[#6d4c41] hover:border-[#d7ccc8]/60'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export default function App() {
  const [gameState, setGameState] = useState<SavedGameState>(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const def = DEFAULT_STATE();
        // Safely migrate existing older saves
        return {
          ...def,
          ...parsed,
          buildings: parsed.buildings ? { ...def.buildings, ...parsed.buildings } : def.buildings,
          questProgress: parsed.questProgress ? {
            dailyQuests: parsed.questProgress.dailyQuests || def.questProgress.dailyQuests,
            achievements: parsed.questProgress.achievements || def.questProgress.achievements,
            storyMissions: parsed.questProgress.storyMissions || def.questProgress.storyMissions,
          } : def.questProgress,
          settings: parsed.settings ? { ...def.settings, ...parsed.settings } : def.settings,
          friendships: parsed.friendships ? { ...def.friendships, ...parsed.friendships } : def.friendships,
          machines: parsed.machines ? { ...def.machines, ...parsed.machines } : def.machines,
          weather: parsed.weather || 'Sunny'
        };
      }
    } catch (e) {
      console.warn('Could not read save state, returning default');
    }
    return DEFAULT_STATE();
  });

  const [activeTool, setActiveTool] = useState<string>('hand');
  const [activeModal, setActiveModal] = useState<'inventory' | 'shop' | 'build' | 'animals' | 'settings' | 'npc_dialog' | 'quests' | 'upgrades' | null>(null);
  const [activeNpcId, setActiveNpcId] = useState<string | null>(null);

  const playerPosRef = useRef({ x: 15, y: 15 });

  // Save changes automatically
  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
    } catch (e) {
      console.warn('Failed to save state to localStorage', e);
    }
  }, [gameState]);

  // Listen for NPC dialogue trigger from Phaser
  useEffect(() => {
    const handleOpenNpcDialog = (e: Event) => {
      const customEvent = e as CustomEvent<{ npcId: string }>;
      const npcId = customEvent.detail?.npcId;
      if (npcId) {
        setActiveNpcId(npcId);
        setActiveModal('npc_dialog');
        playBeep(440, 'triangle', 0.1);
      }
    };

    window.addEventListener('open_npc_dialog', handleOpenNpcDialog);
    return () => {
      window.removeEventListener('open_npc_dialog', handleOpenNpcDialog);
    };
  }, []);

  const handlePlayerMove3D = useCallback((x: number, z: number) => {
    playerPosRef.current = { x, y: z };
  }, []);

  // --- AUDIO SYNTHESIS HELPER ---
  const playBeep = (freq = 440, type: OscillatorType = 'sine', dur = 0.08) => {
    if (!gameState.settings?.sound) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch (e) {}
  };

  // --- TRIGGER ACTIONS FROM HOTBAR ---
  const handleSelectTool = (toolId: string) => {
    playBeep(520, 'sine', 0.06);
    setActiveTool(toolId);
  };

  // --- GAMEPLAY ACTION TRIGGERS FROM MODALS ---

  const handleUseItem = (item: InventoryItem) => {
    if (item.count <= 0) return;
    playBeep(330, 'triangle', 0.15);

    setGameState((prev) => {
      const updatedInv = prev.inventory.map((i) => {
        if (i.id === item.id) {
          return { ...i, count: i.count - 1 };
        }
        return i;
      }).filter((i) => i.count > 0);

      return {
        ...prev,
        inventory: updatedInv,
        energy: Math.min(100, prev.energy + 25)
      };
    });
  };

  // Shop Buy
  const handleBuyItem = (itemId: string, name: string, type: 'seed' | 'tool' | 'material' | 'crop', price: number, color: string, description: string) => {
    if (gameState.coins < price) return;
    playBeep(660, 'sine', 0.1);

    setGameState((prev) => {
      let updatedInv = [...prev.inventory];
      const existingIdx = updatedInv.findIndex((i) => i.id === itemId);

      if (type === 'tool') {
        if (existingIdx !== -1) {
          playBeep(220, 'sawtooth', 0.2); // error beep
          return prev;
        }
        updatedInv.push({
          id: itemId,
          name,
          type,
          count: 1,
          description,
          color
        });
      } else {
        const buyCount = (itemId === 'wood' || itemId === 'stone' || itemId === 'fiber') ? 5 : 1;
        if (existingIdx !== -1) {
          updatedInv[existingIdx].count += buyCount;
        } else {
          updatedInv.push({
            id: itemId,
            name,
            type,
            count: buyCount,
            description,
            color
          });
        }
      }

      const nextState = {
        ...prev,
        coins: prev.coins - price,
        inventory: updatedInv
      };

      return nextState;
    });
  };

  // Shop Sell
  const handleSellItem = (itemId: string, price: number) => {
    const invIdx = gameState.inventory.findIndex((i) => i.id === itemId && i.count > 0);
    if (invIdx === -1) return;
    playBeep(880, 'sine', 0.12);

    setGameState((prev) => {
      let updatedInv = [...prev.inventory];
      updatedInv[invIdx].count -= 1;
      if (updatedInv[invIdx].count === 0) {
        updatedInv.splice(invIdx, 1);
      }

      const nextState = {
        ...prev,
        coins: prev.coins + price,
        inventory: updatedInv
      };

      return nextState;
    });
  };

  const handleSelectBuild = (type: 'fence' | 'path' | 'scarecrow' | 'lantern', costWood: number, costStone: number, costGold: number) => {
    const woodInv = gameState.inventory.find((i) => i.id === 'wood');
    const stoneInv = gameState.inventory.find((i) => i.id === 'stone');
    const woodCount = woodInv ? woodInv.count : 0;
    const stoneCount = stoneInv ? stoneInv.count : 0;

    if (woodCount < costWood || stoneCount < costStone || gameState.coins < costGold) return;

    playBeep(400, 'triangle', 0.18);
    setGameState((prev) => {
      const updatedInv = prev.inventory.map((i) => {
        if (i.id === 'wood') return { ...i, count: i.count - costWood };
        if (i.id === 'stone') return { ...i, count: i.count - costStone };
        return i;
      }).filter((i) => i.count > 0);

      const key = `${playerPosRef.current.x},${playerPosRef.current.y}`;
      return {
        ...prev,
        coins: prev.coins - costGold,
        inventory: updatedInv,
        structures: {
          ...prev.structures,
          [key]: { id: key, type, x: playerPosRef.current.x, y: playerPosRef.current.y }
        }
      };
    });
    setActiveModal(null);
  };

  // Animals Feed
  const handleFeedAnimal = (id: string) => {
    const fiberInvIdx = gameState.inventory.findIndex((i) => i.id === 'fiber' && i.count >= 1);
    if (fiberInvIdx === -1) return;
    playBeep(580, 'sine', 0.1);

    setGameState((prev) => {
      // Deduct fiber
      let updatedInv = [...prev.inventory];
      updatedInv[fiberInvIdx].count -= 1;
      if (updatedInv[fiberInvIdx].count === 0) {
        updatedInv.splice(fiberInvIdx, 1);
      }

      const updatedAnimals = prev.animals.map((anim) => {
        if (anim.id === id) {
          return { ...anim, fed: true, affection: Math.min(100, anim.affection + 10) };
        }
        return anim;
      });

      const nextState = {
        ...prev,
        inventory: updatedInv,
        animals: updatedAnimals
      };

      return nextState;
    });
  };

  // Animals Harvest Product
  const handleHarvestAnimal = (id: string, productType: string) => {
    playBeep(720, 'sine', 0.15);

    setGameState((prev) => {
      const updatedAnimals = prev.animals.map((anim) => {
        if (anim.id === id) {
          return { ...anim, hasProduct: false };
        }
        return anim;
      });

      const existingProdIdx = prev.inventory.findIndex((i) => i.id === productType);
      let updatedInv = [...prev.inventory];

      let prodName = 'Egg';
      let prodDesc = 'Fresh egg.';
      let prodCol = '#f8f9fa';
      if (productType === 'milk') {
        prodName = 'Milk';
        prodDesc = 'Creamy bucketed farm milk.';
        prodCol = '#4cc9f0';
      } else if (productType === 'wool') {
        prodName = 'Wool';
        prodDesc = 'Fine thick soft sheep fleece.';
        prodCol = '#dee2e6';
      } else if (productType === 'truffle') {
        prodName = 'Black Truffle';
        prodDesc = 'A highly valuable, exotic underground fungus dug up by pigs.';
        prodCol = '#3d2511';
      } else if (productType === 'duck_egg') {
        prodName = 'Duck Egg';
        prodDesc = 'Rich and oily large duck egg.';
        prodCol = '#ffee32';
      } else if (productType === 'goat_milk') {
        prodName = 'Goat Milk';
        prodDesc = 'Highly nutritious and tangy fresh goat milk.';
        prodCol = '#e9ecef';
      } else if (productType === 'horse_hair') {
        prodName = 'Horse Hair';
        prodDesc = 'Strong and glossy horse tail hair for fine brush craft.';
        prodCol = '#9c6644';
      } else if (productType === 'rabbit_foot') {
        prodName = 'Rabbit Foot';
        prodDesc = 'A legendary lucky token. Shimmers under the sun.';
        prodCol = '#ffffff';
      } else if (productType === 'dog_bone') {
        prodName = 'Ancient Bone';
        prodDesc = 'An old preserved bone dug up by your dog. Valuable to scholars.';
        prodCol = '#e09f67';
      } else if (productType === 'cat_mouse') {
        prodName = 'Catch of the Day';
        prodDesc = 'A tiny mouse caught by your cat. Good for compost or sale.';
        prodCol = '#f4a261';
      }

      if (existingProdIdx !== -1) {
        updatedInv[existingProdIdx].count += 1;
      } else {
        updatedInv.push({
          id: productType,
          name: prodName,
          type: 'crop',
          count: 1,
          description: prodDesc,
          color: prodCol
        });
      }

      // Reward some small XP too
      let nextXp = prev.xp + 10;
      let nextLevel = prev.level;
      if (nextXp >= prev.level * 200) {
        nextXp -= prev.level * 200;
        nextLevel += 1;
      }

      const nextState = {
        ...prev,
        inventory: updatedInv,
        animals: updatedAnimals,
        xp: nextXp,
        level: nextLevel
      };

      return nextState;
    });
  };

  // Animals Purchase
  const handleBuyAnimal = (type: string, price: number, name: string) => {
    if (gameState.coins < price) return;
    playBeep(440, 'sine', 0.1);

    setGameState((prev) => {
      const nextAnimals = [...prev.animals, {
        id: `${type}_${Date.now()}`,
        type: type as any,
        name,
        fed: false,
        affection: 20,
        lastFedDay: prev.day,
        hasProduct: false
      }];

      const nextState = {
        ...prev,
        coins: prev.coins - price,
        animals: nextAnimals
      };

      return nextState;
    });
  };

  // Settings: Toggle Sound
  const handleToggleSound = () => {
    setGameState(prev => ({
      ...prev,
      settings: { ...prev.settings, sound: !prev.settings.sound }
    }));
  };

  // Settings: Change Seed
  const handleUpdateSeed = (newSeed: string) => {
    setGameState((prev) => ({
      ...DEFAULT_STATE(),
      seed: newSeed
    }));
  };

  // Settings: Reset data
  const handleResetGame = () => {
    playBeep(220, 'sawtooth', 0.3);
    localStorage.removeItem(SAVE_KEY);
    setGameState(DEFAULT_STATE());
    setActiveModal(null);
  };

  const handleSleepOvernight = () => {
    playBeep(480, 'triangle', 0.25);
    setGameState((prev) => {
      const hoursPassed = 18;
      const minutesElapsed = (prev.day) * 1440 + 6 * 60 - ((prev.day - 1) * 1440 + prev.hour * 60 + prev.minute) + 18 * 60;

      const updatedCrops: SavedGameState['crops'] = {};
      for (const [key, crop] of Object.entries(prev.crops)) {
        const cropType = CROPS[crop.cropId];
        if (!cropType) { updatedCrops[key] = crop; continue; }

        const totalGrowMinutes = cropType.growTime * 60;
        const minutesSincePlanted = (prev.day) * 1440 + 6 * 60 - crop.plantedAt + 18 * 60;
        const maxStage = cropType.stages - 1;
        const stage = Math.min(maxStage, Math.floor((minutesSincePlanted / totalGrowMinutes) * (maxStage + 1)));

        const shouldWilt = !crop.watered && prev.day > crop.plantedAt / 1440;
        const finalStage = shouldWilt && stage < maxStage ? Math.max(0, stage - 1) : stage;

        updatedCrops[key] = {
          ...crop,
          stage: finalStage,
          watered: false,
          lastWateredAt: crop.watered ? (prev.day) * 1440 + 6 * 60 + 18 * 60 : crop.lastWateredAt,
        };
      }

      const updatedAnimals = prev.animals.map(a => ({
        ...a,
        fed: false,
        lastFedDay: prev.day + 1,
      }));

      return {
        ...prev,
        day: prev.day + 1,
        hour: 6,
        minute: 0,
        energy: 100,
        crops: updatedCrops,
        animals: updatedAnimals,
      };
    });
  };

  // Claim Quest Reward
  const handleClaimQuestReward = (
    category: 'dailyQuests' | 'achievements' | 'storyMissions',
    questId: string,
    rewardGold: number
  ) => {
    playBeep(880, 'sine', 0.15);
    setTimeout(() => playBeep(1100, 'sine', 0.2), 100);

    setGameState((prev) => {
      const categoryList = prev.questProgress[category].map((q) => {
        if (q.id === questId) {
          return { ...q, claimed: true };
        }
        return q;
      });

      const nextState = {
        ...prev,
        coins: prev.coins + rewardGold,
        questProgress: {
          ...prev.questProgress,
          [category]: categoryList
        }
      };

      return nextState;
    });
  };

  const handleZoomIn = () => {};
  const handleZoomOut = () => {};

  // Calculate current XP requirement
  const xpRequirement = gameState.level * 200;
  const xpPercent = Math.min(100, (gameState.xp / xpRequirement) * 100);

  // Time format
  const formattedTime = () => {
    const h = gameState.hour === 0 ? 12 : gameState.hour > 12 ? gameState.hour - 12 : gameState.hour;
    const m = gameState.minute < 10 ? `0${gameState.minute}` : gameState.minute;
    const ampm = gameState.hour >= 12 ? 'PM' : 'AM';
    return `${h}:${m} ${ampm}`;
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-stone-950 font-sans select-none">
      
      {/* 1. 3D GAME CANVAS */}
      <div className="absolute inset-0 w-full h-full z-0">
        <GameCanvas gameState={gameState} onPlayerMove={handlePlayerMove3D} activeTool={activeTool} />
      </div>

      {/* 2. RECONCILED HUD / UI LAYOUT */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-10">
        
        {/* --- TOP BAR HUD --- */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pointer-events-auto">
          {/* Clock, Day & Season Widget */}
          <div className="flex items-center gap-3.5 bg-[#35271d]/90 backdrop-blur-sm border-2 border-[#8d6e63]/80 px-4 py-2 rounded-xl shadow-lg shadow-black/20">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#5d4037] to-[#795548] border border-[#d7ccc8]/50 text-[#ffeb3b] shadow-inner">
              {gameState.hour >= 6 && gameState.hour <= 18 ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-indigo-400" />}
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#d7ccc8] font-sans">
                {gameState.season} • Day {gameState.day}
              </div>
              <div className="text-sm font-black font-mono text-[#ffeb3b] drop-shadow-[0_0_6px_rgba(255,235,59,0.3)]">{formattedTime()}</div>
            </div>

            {/* Rest / Sleep overnight */}
            <button
              onClick={handleSleepOvernight}
              title="Sleep Overnight"
              className="ml-2 flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[#5d4037] to-[#6d4c41] hover:from-[#6d4c41] hover:to-[#795548] border border-[#d7ccc8]/50 text-[#d7ccc8] hover:text-white rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow-md"
            >
              <Moon className="w-3.5 h-3.5" />
              Sleep
            </button>
          </div>

          {/* Level & XP progression bar */}
          <div className="flex items-center gap-3 bg-[#35271d]/90 backdrop-blur-sm border-2 border-[#8d6e63]/80 px-4 py-2 rounded-xl shadow-lg shadow-black/20 min-w-[200px]">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#8bc34a] to-[#558b2f] text-white font-black font-sans text-base border-2 border-white/50 shadow-lg shadow-[#8bc34a]/30 drop-shadow-[0_0_8px_rgba(139,195,74,0.3)]">
              {gameState.level}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center text-[10px] font-bold text-[#d7ccc8]">
                <span>LVL {gameState.level} PROGRESS</span>
                <span className="font-mono text-[#ffeb3b]">{gameState.xp}/{xpRequirement} XP</span>
              </div>
              <div className="w-full bg-[#2e1f14] h-3 rounded-full overflow-hidden mt-1 border border-[#d7ccc8]/50 shadow-inner">
                <div 
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#689f38] via-[#8bc34a] to-[#aed581] shadow-[0_0_8px_rgba(139,195,74,0.5)]"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Wallet: Coins & Gems & Energy bar */}
          <div className="flex items-center gap-4 bg-[#35271d]/90 backdrop-blur-sm border-2 border-[#8d6e63]/80 px-4 py-2 rounded-xl shadow-lg shadow-black/20">
            {/* Coins */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-br from-[#2e1f14] to-[#3e2f24] border border-[#d7ccc8]/40 rounded-lg shadow-inner">
              <Coins className="w-4 h-4 text-[#ffc107] drop-shadow-[0_0_4px_rgba(255,193,7,0.5)]" />
              <span className="font-mono font-black text-[#ffeb3b] text-sm drop-shadow-[0_0_4px_rgba(255,235,59,0.3)]">{gameState.coins}g</span>
            </div>

            {/* Gems */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-br from-[#2e1f14] to-[#3e2f24] border border-[#d7ccc8]/40 rounded-lg shadow-inner">
              <Sparkles className="w-4 h-4 text-[#ce93d8] drop-shadow-[0_0_4px_rgba(206,147,216,0.5)]" />
              <span className="font-mono font-black text-purple-300 text-sm drop-shadow-[0_0_4px_rgba(206,147,216,0.3)]">{gameState.gems}</span>
            </div>

            {/* Energy */}
            <div className="flex items-center gap-3 pl-2 border-l border-[#8d6e63]/60">
              <div className="flex items-center gap-1">
                <Flame className={`w-4 h-4 ${gameState.energy < 20 ? 'text-red-500 animate-pulse' : 'text-orange-400'}`} />
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-bold text-[#d7ccc8] leading-none">Energy</span>
                  <span className="font-mono font-bold text-stone-200 text-xs mt-0.5">{gameState.energy}/100</span>
                </div>
              </div>
              <div className="w-20 bg-[#2e1f14] h-3.5 rounded-sm overflow-hidden border border-[#d7ccc8]/40 p-0.5 hidden sm:block shadow-inner">
                <div 
                  className="h-full rounded-xs transition-all duration-300 bg-gradient-to-r from-[#e65100] to-[#ff9800] shadow-[0_0_6px_rgba(255,152,0,0.4)]"
                  style={{ width: `${gameState.energy}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- CAMERA ZOOM & ALERTS AREA --- */}
        <div className="flex flex-col items-end gap-3 pointer-events-auto self-end mb-2">
          {/* Zoom widgets */}
          <div className="flex flex-col gap-1.5 bg-[#35271d] border-2 border-[#8d6e63] p-1.5 rounded-xl shadow-lg">
            <button
              onClick={handleZoomIn}
              className="p-1.5 bg-[#5d4037] hover:bg-[#6d4c41] text-[#d7ccc8] hover:text-white rounded-lg transition-all border border-[#3e2723]"
              title="Zoom In"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 bg-[#5d4037] hover:bg-[#6d4c41] text-[#d7ccc8] hover:text-white rounded-lg transition-all border border-[#3e2723]"
              title="Zoom Out"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* --- BOTTOM TOOLBAR HUD --- */}
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-3 pointer-events-auto bg-[#4a3728]/95 backdrop-blur-sm border-t-4 border-l-2 border-r-2 border-[#35271d]/80 p-3.5 rounded-t-2xl shadow-2xl shadow-black/30">
          
          {/* 1. HOTBAR (Selected tools & seeds) */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 px-2.5 bg-[#35271d]/80 border-2 border-[#8d6e63]/60 rounded-2xl scrollbar-thin scrollbar-thumb-[#5d4037]">
              
              {/* Hand Tool Slot */}
              <button
                onClick={() => handleSelectTool('hand')}
                className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-lg border transition-all ${
                  activeTool === 'hand' 
                    ? 'bg-[#ffccbc] border-4 border-[#ffab91] text-[#35271d] shadow-md scale-105' 
                    : 'bg-[#8d6e63] border-2 border-[#d7ccc8] text-[#d7ccc8] hover:bg-[#9e7e73]'
                }`}
                title="Hand: Interact & Harvest"
              >
                <Hand className="w-5 h-5" />
                <span className="text-[8px] uppercase font-bold tracking-tight mt-0.5 leading-none">Hand</span>
              </button>

              {/* General tools & seeds in Inventory */}
              {gameState.inventory.filter(i => i.type === 'tool' || i.type === 'seed').map((item) => {
                const isSelected = activeTool === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTool(item.id)}
                    className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-lg border transition-all ${
                      isSelected 
                        ? 'bg-[#ffccbc] border-4 border-[#ffab91] text-[#35271d] shadow-md scale-105' 
                        : 'bg-[#8d6e63] border-2 border-[#d7ccc8] text-[#d7ccc8] hover:bg-[#9e7e73]'
                    }`}
                    title={`${item.name}: ${item.description}`}
                  >
                    <span 
                      className="w-2.5 h-2.5 rounded-full border border-white/25 shadow-xs"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[8px] uppercase font-bold tracking-tight text-center mt-1 truncate max-w-[44px]">
                      {item.name.replace(' Seeds', '').replace('Copper ', '')}
                    </span>
                    {item.type === 'seed' && (
                      <span className="absolute -top-1 -right-1 px-1 py-0.2 text-[8px] font-black font-mono rounded bg-[#35271d] text-[#ffeb3b] border border-[#8d6e63]">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Helper info based on active tool */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#2e1f14] border border-[#8d6e63] rounded-xl text-xs text-[#d7ccc8]">
              <span className="font-bold text-[#ffeb3b] uppercase tracking-wider text-[10px]">Active Tool:</span>
              <span>
                {activeTool === 'hand' && 'Hand (Harvest ripe crops & collect flowers)'}
                {activeTool === 'hoe' && 'Hoe (Plow flat grass tiles to tilled plots)'}
                {activeTool === 'water_can' && 'Water Can (Water dry tilled plot)'}
                {activeTool === 'axe' && 'Axe (Chop wood trees)'}
                {activeTool === 'pickaxe' && 'Pickaxe (Break stones)'}
                {activeTool.endsWith('_seeds') && `Plant ${activeTool.replace('_seeds', '').toUpperCase()} seeds on tilled plots`}
              </span>
            </div>
          </div>

          {/* 2. TAB CONTROLS (Inventory, Shop, Build, Animals, Upgrades, Quests, Settings) */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 border-t border-[#35271d] pt-3">
            <TabButton icon={<Briefcase className="w-4 h-4" />} label="Bag" active={activeModal === 'inventory'} onClick={() => { playBeep(440); setActiveModal('inventory'); }} />
            <TabButton icon={<ShoppingBag className="w-4 h-4" />} label="Market" active={activeModal === 'shop'} onClick={() => { playBeep(440); setActiveModal('shop'); }} />
            <TabButton icon={<Hammer className="w-4 h-4" />} label="Build" active={activeModal === 'build'} onClick={() => { playBeep(440); setActiveModal('build'); }} />
            <TabButton icon={<Heart className="w-4 h-4" />} label="Animals" active={activeModal === 'animals'} onClick={() => { playBeep(440); setActiveModal('animals'); }} />
            <TabButton icon={<ArrowUpCircle className="w-4 h-4" />} label="Upgrades" active={activeModal === 'upgrades'} onClick={() => { playBeep(440); setActiveModal('upgrades'); }} title="Upgrade Buildings & Manage Processing Machines" />
            <TabButton icon={<Trophy className="w-4 h-4" />} label="Quests" active={activeModal === 'quests'} onClick={() => { playBeep(440); setActiveModal('quests'); }} title="Daily Quests, Missions & Achievements" />
            <TabButton icon={<Settings className="w-4 h-4" />} label="Settings" active={activeModal === 'settings'} onClick={() => { playBeep(440); setActiveModal('settings'); }} />
          </div>

        </div>

      </div>

      {/* 3. MODALS RENDERING (AnimatePresence transitions) */}
      <AnimatePresence>
        {activeModal === 'inventory' && (
          <InventoryModal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            inventory={gameState.inventory}
            onUseItem={handleUseItem}
            onUpdateInventory={(newInv) => {
              setGameState(prev => ({ ...prev, inventory: newInv }));
            }}
          />
        )}
        
        {activeModal === 'shop' && (
          <ShopModal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            coins={gameState.coins}
            inventory={gameState.inventory}
            playerLevel={gameState.level}
            onBuyItem={handleBuyItem}
            onBuyAnimal={handleBuyAnimal}
            onSellItem={handleSellItem}
          />
        )}

        {activeModal === 'build' && (
          <BuildModal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            coins={gameState.coins}
            inventory={gameState.inventory}
            onSelectBuild={handleSelectBuild}
          />
        )}

        {activeModal === 'animals' && (
          <AnimalsModal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            coins={gameState.coins}
            animals={gameState.animals}
            inventory={gameState.inventory}
            onBuyAnimal={handleBuyAnimal}
            onFeedAnimal={handleFeedAnimal}
            onHarvestAnimal={handleHarvestAnimal}
          />
        )}

        {activeModal === 'settings' && (
          <SettingsModal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            seed={gameState.seed}
            soundEnabled={gameState.settings?.sound ?? true}
            onToggleSound={handleToggleSound}
            onUpdateSeed={handleUpdateSeed}
            onResetGame={handleResetGame}
          />
        )}

        {activeModal === 'npc_dialog' && activeNpcId && (
          <NpcDialogModal
            isOpen={true}
            onClose={() => { setActiveModal(null); setActiveNpcId(null); }}
            npcId={activeNpcId}
            gameState={gameState}
            onStateUpdate={(updatedState) => {
              setGameState(updatedState);
            }}
            playBeep={playBeep}
          />
        )}

        {activeModal === 'quests' && (
          <QuestModal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            gameState={gameState}
            onClaimReward={handleClaimQuestReward}
          />
        )}

        {activeModal === 'upgrades' && (
          <UpgradeBuildingsModal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            gameState={gameState}
            onStateUpdate={(updatedState) => {
              setGameState(updatedState);
            }}
            playBeep={playBeep}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
