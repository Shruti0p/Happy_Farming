import React from 'react';
import { motion } from 'motion/react';
import { X, Hammer, HammerIcon, Coins } from 'lucide-react';
import { InventoryItem } from '../game/types';

interface BuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  inventory: InventoryItem[];
  onSelectBuild: (structureType: 'fence' | 'path' | 'scarecrow' | 'lantern', costWood: number, costStone: number, costGold: number) => void;
}

export const BuildModal: React.FC<BuildModalProps> = ({
  isOpen,
  onClose,
  coins,
  inventory,
  onSelectBuild,
}) => {
  if (!isOpen) return null;

  // Retrieve current wood & stone counts
  const woodCount = inventory.find((i) => i.id === 'wood')?.count || 0;
  const stoneCount = inventory.find((i) => i.id === 'stone')?.count || 0;

  const buildItems = [
    {
      id: 'fence' as const,
      name: 'Wooden Fence',
      description: 'Sturdy wooden fencing to corral your farm animals and define boundaries.',
      costWood: 2,
      costStone: 0,
      costGold: 10,
      color: '#8b5a2b',
    },
    {
      id: 'path' as const,
      name: 'Gravel Path',
      description: 'Pave beautiful rustic paths to easily navigate your growing farm plot.',
      costWood: 0,
      costStone: 1,
      costGold: 5,
      color: '#d9b382',
    },
    {
      id: 'scarecrow' as const,
      name: 'Scarecrow',
      description: 'A charming pumpkin-head scarecrow to ward off crows and beautify fields.',
      costWood: 4,
      costStone: 0,
      costGold: 25,
      color: '#f77f00',
    },
    {
      id: 'lantern' as const,
      name: 'Garden Lantern',
      description: 'An elegant dark iron post with a glowing golden light to illuminate the night.',
      costWood: 1,
      costStone: 2,
      costGold: 40,
      color: '#ffea00',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-xl overflow-hidden border-4 bg-[#4a3728] border-[#35271d] rounded-xl shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 bg-[#35271d] border-[#8d6e63]">
          <div className="flex items-center gap-2 text-[#ffeb3b]">
            <Hammer className="w-5 h-5" />
            <h2 className="text-xl font-black tracking-tight uppercase font-sans">Craft & Build</h2>
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

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {buildItems.map((item) => {
            const hasWood = woodCount >= item.costWood;
            const hasStone = stoneCount >= item.costStone;
            const hasGold = coins >= item.costGold;
            const canBuild = hasWood && hasStone && hasGold;

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border-2 border-[#5d4037] bg-[#3e2723] hover:border-[#ffeb3b] transition-colors gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <span
                    className="w-6 h-6 rounded-md border border-white/20 mt-1 flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <h3 className="font-bold text-[#d7ccc8]">{item.name}</h3>
                    <p className="mt-1 text-xs text-stone-300 leading-relaxed max-w-sm">
                      {item.description}
                    </p>
                    
                    {/* Requirements Tags */}
                    <div className="flex flex-wrap items-center gap-2 mt-3 text-[10px] uppercase font-bold tracking-wider">
                      {item.costWood > 0 && (
                        <span className={`px-2 py-0.5 rounded-md ${hasWood ? 'bg-[#8bc34a]/10 text-[#8bc34a] border border-[#8bc34a]/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                          {item.costWood} Wood
                        </span>
                      )}
                      {item.costStone > 0 && (
                        <span className={`px-2 py-0.5 rounded-md ${hasStone ? 'bg-[#8bc34a]/10 text-[#8bc34a] border border-[#8bc34a]/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                          {item.costStone} Stone
                        </span>
                      )}
                      {item.costGold > 0 && (
                        <span className={`px-2 py-0.5 rounded-md flex items-center gap-1 ${hasGold ? 'bg-[#8bc34a]/10 text-[#ffeb3b] border border-[#8bc34a]/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                          <Coins className="w-3 h-3" />
                          {item.costGold} Gold
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  disabled={!canBuild}
                  onClick={() => onSelectBuild(item.id, item.costWood, item.costStone, item.costGold)}
                  className="flex items-center justify-center gap-1.5 w-full sm:w-auto py-2 px-4 text-xs font-bold text-white bg-[#8bc34a] hover:bg-green-500 border border-white disabled:opacity-30 rounded-lg transition-colors font-sans whitespace-nowrap shadow-sm"
                >
                  <HammerIcon className="w-3.5 h-3.5" />
                  Build
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 bg-[#35271d] border-[#8d6e63] text-center text-xs text-[#d7ccc8]">
          Tip: Once built, use the hotbar to select placing coordinates in front of your character.
        </div>
      </motion.div>
    </div>
  );
};
