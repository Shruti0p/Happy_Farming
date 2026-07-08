import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Hammer, HelpCircle, ShieldAlert, Wheat, ArrowUpCircle, Settings, Flame, Loader2, Sparkles, Coins } from 'lucide-react';
import { SavedGameState, InventoryItem } from '../game/types';

interface UpgradeBuildingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: SavedGameState;
  onStateUpdate: (updatedState: SavedGameState) => void;
  playBeep: (freq?: number, type?: OscillatorType, dur?: number) => void;
}

export const UpgradeBuildingsModal: React.FC<UpgradeBuildingsModalProps> = ({
  isOpen,
  onClose,
  gameState,
  onStateUpdate,
  playBeep,
}) => {
  const [activeTab, setActiveTab] = useState<'buildings' | 'machines'>('buildings');
  const [procFeedback, setProcFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const woodCount = gameState.inventory.find(i => i.id === 'wood')?.count || 0;
  const stoneCount = gameState.inventory.find(i => i.id === 'stone')?.count || 0;

  // 1. Buildings Definition
  const buildingList = [
    {
      id: 'coop',
      name: 'Chicken Coop',
      desc: 'Houses chickens, ducks, and rabbits. Upgrades unlock premium livestock breeds.',
      maxLvl: 3,
      levels: {
        1: { benefit: 'Houses standard Clucky Chickens.', costWood: 0, costStone: 0, costGold: 0 },
        2: { benefit: 'Unlocks Puddle Ducks.', costWood: 25, costStone: 20, costGold: 300 },
        3: { benefit: 'Unlocks Cotton Rabbits.', costWood: 45, costStone: 35, costGold: 600 },
      }
    },
    {
      id: 'barn',
      name: 'Red Barn',
      desc: 'Houses cows, goats, and horses. Upgrades unlock larger, more valuable beasts.',
      maxLvl: 3,
      levels: {
        1: { benefit: 'Houses standard Bessie Cows.', costWood: 0, costStone: 0, costGold: 0 },
        2: { benefit: 'Unlocks Alpine Goats.', costWood: 30, costStone: 25, costGold: 450 },
        3: { benefit: 'Unlocks Thoroughbred Horses.', costWood: 55, costStone: 45, costGold: 900 },
      }
    },
    {
      id: 'shed',
      name: 'Cow Shed',
      desc: 'Cozy shed tailored for household farm animals like Cats and Dogs.',
      maxLvl: 1,
      levels: {
        0: { benefit: 'Ruined. Barn Cats and Herding Dogs cannot be bought.', costWood: 15, costStone: 15, costGold: 200 },
        1: { benefit: 'Repaired. Unlocks Barn Cats & Herding Dogs.', costWood: 0, costStone: 0, costGold: 0 },
      }
    },
    {
      id: 'greenhouse',
      name: 'Ruined Greenhouse',
      desc: 'A giant mystical greenhouse. Restoring it completely protects crops from withered states.',
      maxLvl: 1,
      levels: {
        0: { benefit: 'Ruined. Provides no growth protection.', costWood: 40, costStone: 40, costGold: 600 },
        1: { benefit: 'Fully Repaired! Automatically prevents crops from dying/withering.', costWood: 0, costStone: 0, costGold: 0 },
      }
    },
    {
      id: 'bakery',
      name: 'Farm Bakery',
      desc: 'Enables baking raw wheat crops into nutritious Bread.',
      maxLvl: 1,
      levels: {
        0: { benefit: 'Locked. Cannot process bakery products.', costWood: 30, costStone: 25, costGold: 400 },
        1: { benefit: 'Fully Operational! Allows baking Bread to sell for 180g.', costWood: 0, costStone: 0, costGold: 0 },
      }
    },
    {
      id: 'workshop',
      name: 'Crafting Workshop',
      desc: 'Increases wood & stone sell values by 20% due to specialized refining tools.',
      maxLvl: 1,
      levels: {
        0: { benefit: 'Locked. Materials sell for standard prices.', costWood: 25, costStone: 25, costGold: 300 },
        1: { benefit: 'Active! Sells wood/stone/fiber raw goods for 20% more gold.', costWood: 0, costStone: 0, costGold: 0 },
      }
    }
  ];

  // Upgrade building trigger
  const handleUpgradeBuilding = (bldId: string, currentLvl: number) => {
    const bldDef = buildingList.find(b => b.id === bldId);
    if (!bldDef) return;

    const nextLvl = currentLvl + 1;
    const upgradeReq = (bldDef.levels as any)[currentLvl === 0 ? 0 : nextLvl];
    if (!upgradeReq) return;

    const { costWood, costStone, costGold } = upgradeReq;

    if (woodCount < costWood || stoneCount < costStone || gameState.coins < costGold) {
      playBeep(220, 'sawtooth', 0.2);
      return;
    }

    playBeep(440, 'triangle', 0.15);
    setTimeout(() => playBeep(580, 'sine', 0.25), 100);

    // Deduct materials & update building level
    const updatedInv = gameState.inventory.map((i) => {
      if (i.id === 'wood') return { ...i, count: i.count - costWood };
      if (i.id === 'stone') return { ...i, count: i.count - costStone };
      return i;
    }).filter((i) => i.count > 0);

    const updatedBuildings = {
      ...gameState.buildings,
      [bldId]: {
        ...(gameState.buildings as any)[bldId],
        level: nextLvl,
        name: nextLvl === 1 ? bldDef.name.replace('Ruined ', '') : `${bldDef.name} (Lvl ${nextLvl})`
      }
    };

    // Story quests triggers
    let storyQuests = [...gameState.questProgress.storyMissions];
    if (bldId === 'greenhouse' && nextLvl === 1) {
      storyQuests = storyQuests.map((q) => {
        if (q.id === 'story_greenhouse') return { ...q, current: 1, done: true };
        return q;
      });
    }

    const nextState = {
      ...gameState,
      coins: gameState.coins - costGold,
      inventory: updatedInv,
      buildings: updatedBuildings,
      questProgress: {
        ...gameState.questProgress,
        storyMissions: storyQuests
      }
    };

    onStateUpdate(nextState);
  };

  // 2. Crop processing machines definition
  const machinesList = [
    { id: 'mayo_maker', name: 'Mayo Maker', costWood: 15, costStone: 5, costGold: 100, ingredient: 'egg', product: 'mayo', pName: 'Artisan Mayonnaise', color: '#ffffe0', desc: 'Processes raw eggs into creamy premium jars of mayonnaise (sells for 90g).' },
    { id: 'cheese_press', name: 'Cheese Press', costWood: 20, costStone: 10, costGold: 150, ingredient: 'milk', product: 'cheese', pName: 'Artisan Cheese', color: '#ffd166', desc: 'Presses raw bucketed milk into delicious wheels of aged cheese (sells for 140g).' },
    { id: 'loom', name: 'Artisan Loom', costWood: 25, costStone: 5, costGold: 200, ingredient: 'wool', product: 'cloth', pName: 'Fine Fabric Cloth', color: '#dee2e6', desc: 'Weaves sheep wool into fine fabric cloth rolls (sells for 180g).' },
    { id: 'preserves_jar', name: 'Preserves Jar', costWood: 10, costStone: 15, costGold: 100, ingredient: 'tomato', product: 'tomato_jam', pName: 'Tomato Jam Jar', color: '#ef476f', desc: 'Preserves fresh garden tomatoes into tasty jars of sweet jam (sells for 110g).' },
    { id: 'seed_maker', name: 'Seed Maker', costWood: 15, costStone: 15, costGold: 120, ingredient: 'corn', product: 'corn_seeds', pName: 'Corn Seeds x3', color: '#ffee32', desc: 'Extracts corn kernels into three complete packets of corn seeds!' }
  ];

  // Craft a new machine
  const handleCraftMachine = (macId: string, woodCost: number, stoneCost: number, goldCost: number) => {
    if (woodCount < woodCost || stoneCount < stoneCost || gameState.coins < goldCost) {
      playBeep(220, 'sawtooth', 0.2);
      return;
    }

    playBeep(880, 'sine', 0.15);

    const updatedInv = gameState.inventory.map((i) => {
      if (i.id === 'wood') return { ...i, count: i.count - woodCost };
      if (i.id === 'stone') return { ...i, count: i.count - stoneCost };
      return i;
    }).filter((i) => i.count > 0);

    const nextState = {
      ...gameState,
      coins: gameState.coins - goldCost,
      inventory: updatedInv,
      machines: {
        ...gameState.machines,
        [macId]: {
          id: macId,
          active: false,
          progress: 0,
          currentInput: null,
          currentOutput: null
        }
      }
    };

    onStateUpdate(nextState);
    setProcFeedback(`Successfully crafted and activated the ${macId.replace('_', ' ').toUpperCase()}!`);
  };

  // Run a machine
  const handleProcessMachine = (macId: string, ingredientId: string, outputId: string, outName: string, outCol: string) => {
    const hasIng = gameState.inventory.find(i => i.id === ingredientId)?.count || 0;
    if (hasIng <= 0) {
      playBeep(220, 'sawtooth', 0.2);
      setProcFeedback(`You do not have any raw ${ingredientId} in your bag!`);
      return;
    }

    playBeep(600, 'triangle', 0.2);

    // Deduct ingredient
    const updatedInv = gameState.inventory.map((i) => {
      if (i.id === ingredientId) return { ...i, count: i.count - 1 };
      return i;
    }).filter((i) => i.count > 0);

    // Run processing
    const nextState = {
      ...gameState,
      inventory: updatedInv,
      machines: {
        ...gameState.machines,
        [macId]: {
          id: macId,
          active: true,
          progress: 50, // 50% processed immediately! Completed on sleep!
          currentInput: ingredientId,
          currentOutput: outputId
        }
      }
    };

    onStateUpdate(nextState);
    setProcFeedback(`Processing ${ingredientId.toUpperCase()}... Will finish overnight when you sleep!`);
  };

  // Collect processed artisan goods
  const handleCollectMachine = (macId: string, outputId: string, outName: string, outCol: string) => {
    playBeep(950, 'sine', 0.12);
    setTimeout(() => playBeep(1200, 'sine', 0.18), 80);

    const existingIdx = gameState.inventory.findIndex(i => i.id === outputId);
    let updatedInv = [...gameState.inventory];

    const prodCount = macId === 'seed_maker' ? 3 : 1;
    const isSeed = outputId.endsWith('_seeds');

    if (existingIdx !== -1) {
      updatedInv[existingIdx].count += prodCount;
    } else {
      updatedInv.push({
        id: outputId,
        name: outName,
        type: isSeed ? 'seed' : 'crop',
        count: prodCount,
        description: isSeed ? `Sow in soil plots.` : `Highly premium artisan product of fine quality.`,
        color: outCol
      });
    }

    const nextState = {
      ...gameState,
      inventory: updatedInv,
      machines: {
        ...gameState.machines,
        [macId]: {
          id: macId,
          active: false,
          progress: 0,
          currentInput: null,
          currentOutput: null
        }
      }
    };

    onStateUpdate(nextState);
    setProcFeedback(`Collected ${prodCount}x ${outName}!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-3xl overflow-hidden border-4 bg-[#4a3728] border-[#35271d] rounded-xl shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 bg-[#35271d] border-[#8d6e63]">
          <div className="flex items-center gap-2 text-[#ffeb3b]">
            <Hammer className="w-5 h-5" />
            <h2 className="text-xl font-black tracking-tight uppercase font-sans">Upgrades & Machines</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-xs font-bold text-[#d7ccc8]">
              <span>Wood: <strong className="text-amber-200 font-mono">{woodCount}</strong></span>
              <span>Stone: <strong className="text-stone-300 font-mono">{stoneCount}</strong></span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-[#d7ccc8] hover:text-white hover:bg-[#5d4037] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-[#3e2723] border-b-2 border-[#35271d]">
          <button
            onClick={() => setActiveTab('buildings')}
            className={`flex-1 py-3 text-xs font-black tracking-wider uppercase border-r border-[#35271d] transition-all ${
              activeTab === 'buildings'
                ? 'bg-[#4a3728] text-[#ffeb3b] border-b-4 border-b-[#ffeb3b]'
                : 'text-[#d7ccc8] hover:bg-[#4a3728]/50'
            }`}
          >
            🏗️ Farm Buildings
          </button>
          <button
            onClick={() => setActiveTab('machines')}
            className={`flex-1 py-3 text-xs font-black tracking-wider uppercase transition-all ${
              activeTab === 'machines'
                ? 'bg-[#4a3728] text-[#ffeb3b] border-b-4 border-b-[#ffeb3b]'
                : 'text-[#d7ccc8] hover:bg-[#4a3728]/50'
            }`}
          >
            ⚙️ Processing Machines
          </button>
        </div>

        {/* Feedback block */}
        {procFeedback && (
          <div className="mx-6 mt-4 p-2.5 text-xs font-bold bg-[#35271d] text-[#ffcc00] border border-dashed border-[#8d6e63] rounded-lg">
            {procFeedback}
          </div>
        )}

        {/* Content Area */}
        <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#5d4037]">
          {activeTab === 'buildings' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {buildingList.map((b) => {
                const currentLevel = (gameState.buildings as any)[b.id]?.level || 0;
                const isMax = currentLevel >= b.maxLvl;
                
                const upgradeReq = isMax ? null : (b.levels as any)[currentLevel === 0 ? 0 : currentLevel + 1];
                const canUpgrade = upgradeReq && woodCount >= upgradeReq.costWood && stoneCount >= upgradeReq.costStone && gameState.coins >= upgradeReq.costGold;

                return (
                  <div
                    key={b.id}
                    className="p-4 rounded-xl border-2 border-[#5d4037] bg-[#3e2723] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-black text-sm text-[#ffeb3b]">{b.name}</h3>
                        <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold bg-[#2e1f14] text-[#d7ccc8] border border-[#8d6e63]">
                          LVL {currentLevel}
                        </span>
                      </div>
                      <p className="text-xs text-stone-200 mb-3.5 leading-relaxed">{b.desc}</p>
                      
                      {/* Current benefit info */}
                      <div className="p-2.5 rounded bg-[#2e1f14] border border-[#8d6e63]/30 mb-3.5">
                        <span className="text-[9px] font-black uppercase text-[#8d6e63] tracking-wide block mb-0.5">CURRENT EFFECT:</span>
                        <span className="text-xs text-stone-300">
                          {(b.levels as any)[currentLevel]?.benefit || 'Locked/Ruined.'}
                        </span>
                      </div>
                    </div>

                    {!isMax && upgradeReq && (
                      <div className="mt-2 space-y-3 pt-3 border-t border-[#35271d]">
                        <div className="text-[10px] font-bold text-amber-200">
                          Next Upgrade Benefit: <span className="text-stone-300 font-normal">{upgradeReq.benefit}</span>
                        </div>
                        
                        {/* Cost list */}
                        <div className="flex items-center gap-3 text-xs font-mono font-bold text-stone-300">
                          <span className={woodCount >= upgradeReq.costWood ? 'text-amber-200' : 'text-red-400'}>W: {upgradeReq.costWood}</span>
                          <span className={stoneCount >= upgradeReq.costStone ? 'text-stone-300' : 'text-red-400'}>S: {upgradeReq.costStone}</span>
                          <span className={gameState.coins >= upgradeReq.costGold ? 'text-[#ffeb3b]' : 'text-red-400'}>{upgradeReq.costGold}g</span>
                        </div>

                        <button
                          disabled={!canUpgrade}
                          onClick={() => handleUpgradeBuilding(b.id, currentLevel)}
                          className="w-full py-1.5 px-3 font-bold text-xs text-white bg-[#8bc34a] hover:bg-green-500 border border-white disabled:opacity-35 rounded-lg transition-colors font-sans shadow-sm"
                        >
                          {currentLevel === 0 ? 'Repair Building' : 'Upgrade Level'}
                        </button>
                      </div>
                    )}

                    {isMax && (
                      <div className="text-center py-2 text-xs font-black text-[#8bc34a] uppercase tracking-wider">
                        ★ Maximum Level Reached
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Crafted Machines Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {machinesList.map((m) => {
                  const myMacState = (gameState.machines as any)[m.id];
                  const hasMachine = !!myMacState;

                  // Materials verification
                  const canCraft = woodCount >= m.costWood && stoneCount >= m.costStone && gameState.coins >= m.costGold;
                  const ingredientCount = gameState.inventory.find(i => i.id === m.ingredient)?.count || 0;

                  return (
                    <div
                      key={m.id}
                      className="p-4 rounded-xl border-2 border-[#5d4037] bg-[#3e2723] flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <h3 className="font-black text-sm text-[#ffeb3b]">{m.name}</h3>
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${hasMachine ? 'bg-[#8bc34a]/10 text-[#8bc34a] border-[#8bc34a]/30' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                            {hasMachine ? 'Crafted' : 'Not Crafted'}
                          </span>
                        </div>
                        <p className="text-xs text-stone-200 mb-3 leading-relaxed">{m.desc}</p>
                      </div>

                      {hasMachine ? (
                        <div className="mt-3 pt-3 border-t border-[#35271d] space-y-3">
                          {myMacState.active ? (
                            myMacState.progress >= 100 ? (
                              <div className="space-y-2">
                                <div className="text-xs font-bold text-[#8bc34a] animate-pulse">
                                  ✓ Processing finished! {m.pName} is ready!
                                </div>
                                <button
                                  onClick={() => handleCollectMachine(m.id, m.product, m.pName, m.color)}
                                  className="w-full py-1.5 bg-[#ffeb3b] hover:bg-[#ffc107] text-stone-950 font-black text-xs rounded-lg border-2 border-white transition-all shadow-sm"
                                >
                                  Collect Artisan Good
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <div className="flex justify-between items-center text-[10px] text-amber-200 font-bold">
                                  <span>Processing {m.ingredient.toUpperCase()}...</span>
                                  <span>{myMacState.progress}%</span>
                                </div>
                                <div className="w-full bg-[#2e1f14] h-2 rounded-full overflow-hidden border border-[#8d6e63]/40">
                                  <div className="bg-[#ff9800] h-full" style={{ width: `${myMacState.progress}%` }} />
                                </div>
                                <p className="text-[9px] text-stone-400 italic">Completes when you sleep overnight!</p>
                              </div>
                            )
                          ) : (
                            <div className="flex items-center justify-between gap-3 bg-[#2e1f14] p-2.5 rounded-lg border border-[#8d6e63]/20">
                              <div className="text-left">
                                <span className="text-[9px] uppercase font-black text-[#8d6e63] block">LOAD INGREDIENT:</span>
                                <span className="text-xs text-stone-300 font-bold">
                                  {m.ingredient.toUpperCase()} <span className="text-[#ffeb3b] font-mono">({ingredientCount} owned)</span>
                                </span>
                              </div>
                              <button
                                disabled={ingredientCount <= 0}
                                onClick={() => handleProcessMachine(m.id, m.ingredient, m.product, m.pName, m.color)}
                                className="py-1 px-3 bg-[#8bc34a] hover:bg-green-500 disabled:opacity-30 text-white font-bold text-xs rounded-lg transition-all"
                              >
                                Load
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="mt-3 pt-3 border-t border-[#35271d] space-y-2">
                          <div className="flex items-center justify-between text-[10px] text-stone-300 font-bold">
                            <span>Craft Costs:</span>
                            <span className="flex gap-2 font-mono">
                              <span className={woodCount >= m.costWood ? 'text-amber-200' : 'text-red-400'}>W:{m.costWood}</span>
                              <span className={stoneCount >= m.costStone ? 'text-stone-300' : 'text-red-400'}>S:{m.costStone}</span>
                              <span className={gameState.coins >= m.costGold ? 'text-[#ffeb3b]' : 'text-red-400'}>{m.costGold}g</span>
                            </span>
                          </div>
                          <button
                            disabled={!canCraft}
                            onClick={() => handleCraftMachine(m.id, m.costWood, m.costStone, m.costGold)}
                            className="w-full py-1.5 px-3 font-bold text-xs text-white bg-[#5d4037] hover:bg-[#6d4c41] border border-[#d7ccc8]/40 disabled:opacity-30 rounded-lg transition-colors font-sans shadow-sm"
                          >
                            Craft Machine
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 bg-[#35271d] border-[#8d6e63] text-center text-xs text-[#d7ccc8]">
          Upgrading your farm buildings unlocks new livestock categories, increases material sell values, and enables crop processing.
        </div>
      </motion.div>
    </div>
  );
};
