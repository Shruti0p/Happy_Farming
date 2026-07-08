import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Coins, ShoppingBag, ArrowUpRight, ArrowDownRight, Hammer, Heart } from 'lucide-react';
import { CROPS, InventoryItem } from '../game/types';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  inventory: InventoryItem[];
  onBuyItem: (itemId: string, name: string, type: 'seed' | 'tool' | 'material' | 'crop', price: number, color: string, description: string) => void;
  onBuyAnimal: (type: 'chicken' | 'cow' | 'sheep', price: number, name: string) => void;
  onSellItem: (itemId: string, price: number) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  onClose,
  coins,
  inventory,
  onBuyItem,
  onBuyAnimal,
  onSellItem,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('Seeds');

  if (!isOpen) return null;

  // Shop Categories Tabs
  const categories = ['Seeds', 'Tools', 'Decorations', 'Animals', 'Sell Goods'];

  // 1. Seeds Category
  const seedItems = Object.values(CROPS).map(crop => ({
    id: `${crop.id}_seeds`,
    name: `${crop.name} Seeds`,
    price: crop.seedPrice,
    type: 'seed' as const,
    color: crop.color,
    description: `Plant on tilled soil. Grows in ${crop.growTime} hrs. Sells for ${crop.sellPrice}g.`,
    cropId: crop.id
  }));

  // 2. Tools Category
  const toolItems = [
    { id: 'scythe', name: 'Scythe', price: 50, type: 'tool' as const, color: '#dee2e6', description: 'Used to clear weeds, grass, and destroy dead/growing crops.' },
    { id: 'fishing_rod', name: 'Fishing Rod', price: 75, type: 'tool' as const, color: '#fcbf49', description: 'Cast into rivers to hook fresh, valuable fish.' },
    { id: 'copper_hoe', name: 'Copper Hoe', price: 150, type: 'tool' as const, color: '#ad7f58', description: 'An upgraded iron tool to plow fields smoothly.' },
    { id: 'gold_watering_can', name: 'Gold Watering Can', price: 200, type: 'tool' as const, color: '#ffd166', description: 'A gorgeous, double-capacity watering can.' }
  ];

  // 3. Decorations Category
  const decorationItems = [
    { id: 'wood', name: 'Chop Timber', price: 15, type: 'material' as const, color: '#8f5c35', description: 'Bundle of 5 pre-cut seasoned wood.' },
    { id: 'stone', name: 'Quarry Stone', price: 15, type: 'material' as const, color: '#7a828a', description: 'Pack of 5 solid building stones.' },
    { id: 'fiber', name: 'Grass Fiber', price: 10, type: 'material' as const, color: '#38b000', description: 'Bundle of 5 soft green grass fibers.' }
  ];

  // 4. Animals Category
  const animalItems = [
    { id: 'chicken', name: 'Baby Chick', price: 100, type: 'chicken' as const, color: '#f8f9fa', description: 'Chirping white chick. Grows up to produce eggs daily!' },
    { id: 'cow', name: 'Spotted Calf', price: 250, type: 'cow' as const, color: '#ffffff', description: 'Playful baby calf. Produces buckets of milk daily.' },
    { id: 'sheep', name: 'Fluffy Lamb', price: 200, type: 'sheep' as const, color: '#dee2e6', description: 'Warm baby sheep. Grows a soft, shearable wool coat.' }
  ];

  // 5. Sell Goods List (Sells crops and items back to market)
  const sellableList = [
    { id: 'wheat', name: 'Wheat', price: 25, color: '#e2b13c' },
    { id: 'tomato', name: 'Tomato', price: 55, color: '#e23c3c' },
    { id: 'carrot', name: 'Carrot', price: 40, color: '#e2733c' },
    { id: 'strawberry', name: 'Strawberry', price: 85, color: '#e23c7c' },
    { id: 'corn', name: 'Corn', price: 65, color: '#f0e34b' },
    { id: 'wood', name: 'Wood', price: 5, color: '#8f5c35' },
    { id: 'stone', name: 'Stone', price: 5, color: '#7a828a' },
    { id: 'fiber', name: 'Fiber', price: 2, color: '#38b000' },
    { id: 'berry', name: 'Wild Berry', price: 12, color: '#f72585' },
    { id: 'flower', name: 'Wild Flower', price: 8, color: '#f15bb5' },
    { id: 'egg', name: 'Fresh Egg', price: 15, color: '#f8f9fa' },
    { id: 'milk', name: 'Farm Milk', price: 45, color: '#4cc9f0' },
    { id: 'wool', name: 'Sheep Wool', price: 60, color: '#dee2e6' },
    { id: 'fish_trout', name: 'Rainbow Trout', price: 30, color: '#4895ef' },
    { id: 'fish_salmon', name: 'River Salmon', price: 60, color: '#ffcad4' },
    { id: 'fish_carp', name: 'Golden Carp', price: 120, color: '#ffd166' }
  ];

  // Check if player already owns tool
  const hasTool = (toolId: string) => {
    return inventory.some(item => item.id === toolId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-3xl overflow-hidden border-4 bg-[#4a3728] border-[#35271d] rounded-xl shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 bg-[#35271d] border-[#8d6e63] flex-shrink-0">
          <div className="flex items-center gap-2 text-[#ffeb3b]">
            <ShoppingBag className="w-5 h-5" />
            <h2 className="text-xl font-black tracking-tight uppercase font-sans">Valley Seed & Trade</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#2e1f14] border border-[#8d6e63] rounded-lg">
              <Coins className="w-4 h-4 text-[#ffc107] animate-pulse" />
              <span className="font-mono font-black text-[#ffeb3b]">{coins}g</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-[#d7ccc8] hover:text-white hover:bg-[#5d4037] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Categories Tab Bar */}
        <div className="bg-[#3e2723] border-b border-[#35271d] p-2 flex gap-1 overflow-x-auto scrollbar-none flex-shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-[#8bc34a] text-white shadow-md'
                  : 'text-[#d7ccc8] hover:bg-[#5d4037]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto max-h-[50vh] flex-grow">
          
          {/* SEEDS */}
          {activeCategory === 'Seeds' && (
            <div className="space-y-3">
              <p className="text-xs text-[#d7ccc8]/70 italic mb-2">Buy fresh seasonal crop seeds to cultivate on plowed plots.</p>
              {seedItems.map((item) => {
                const canAfford = coins >= item.price;
                return (
                  <div key={item.id} className="flex items-center justify-between p-3.5 rounded-lg border-2 border-[#5d4037] bg-[#3e2723] hover:border-[#ffeb3b] transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: item.color }} />
                      <div>
                        <h4 className="font-bold text-[#d7ccc8]">{item.name}</h4>
                        <p className="text-xs text-stone-300">{item.description}</p>
                      </div>
                    </div>
                    <button
                      disabled={!canAfford}
                      onClick={() => onBuyItem(item.id, item.name, 'seed', item.price, item.color, `Plant this to grow delicious ${item.name.replace(' Seeds', '')}.`)}
                      className="flex items-center gap-1.5 py-1.5 px-3 font-black font-mono text-xs text-white bg-[#8bc34a] hover:bg-green-500 border border-white rounded-lg disabled:opacity-30 disabled:hover:bg-[#8bc34a] transition-colors shadow-sm"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      {item.price}g
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* TOOLS */}
          {activeCategory === 'Tools' && (
            <div className="space-y-3">
              <p className="text-xs text-[#d7ccc8]/70 italic mb-2">Purchase basic utility tools or advanced upgrades to boost farming yields.</p>
              {toolItems.map((item) => {
                const owned = hasTool(item.id);
                const canAfford = coins >= item.price && !owned;
                return (
                  <div key={item.id} className="flex items-center justify-between p-3.5 rounded-lg border-2 border-[#5d4037] bg-[#3e2723] hover:border-[#ffeb3b] transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: item.color }} />
                      <div>
                        <h4 className="font-bold text-[#d7ccc8]">{item.name}</h4>
                        <p className="text-xs text-stone-300">{item.description}</p>
                      </div>
                    </div>
                    {owned ? (
                      <span className="text-[10px] uppercase font-black px-2.5 py-1 bg-[#2e1f14] text-[#8bc34a] border border-[#8d6e63] rounded-lg">Owned</span>
                    ) : (
                      <button
                        disabled={!canAfford}
                        onClick={() => onBuyItem(item.id, item.name, 'tool', item.price, item.color, item.description)}
                        className="flex items-center gap-1.5 py-1.5 px-3 font-black font-mono text-xs text-white bg-[#8bc34a] hover:bg-green-500 border border-white rounded-lg disabled:opacity-30 disabled:hover:bg-[#8bc34a] transition-colors shadow-sm"
                      >
                        <Coins className="w-3.5 h-3.5" />
                        {item.price}g
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* DECORATIONS / MATERIALS */}
          {activeCategory === 'Decorations' && (
            <div className="space-y-3">
              <p className="text-xs text-[#d7ccc8]/70 italic mb-2">Stock up on basic construction materials for building fences, lanterns, and paths.</p>
              {decorationItems.map((item) => {
                const canAfford = coins >= item.price;
                return (
                  <div key={item.id} className="flex items-center justify-between p-3.5 rounded-lg border-2 border-[#5d4037] bg-[#3e2723] hover:border-[#ffeb3b] transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: item.color }} />
                      <div>
                        <h4 className="font-bold text-[#d7ccc8]">{item.name}</h4>
                        <p className="text-xs text-stone-300">{item.description}</p>
                      </div>
                    </div>
                    <button
                      disabled={!canAfford}
                      onClick={() => onBuyItem(item.id, item.name.replace('chop ', '').replace('quarry ', '').replace('grass ', ''), 'material', item.price, item.color, item.description)}
                      className="flex items-center gap-1.5 py-1.5 px-3 font-black font-mono text-xs text-white bg-[#8bc34a] hover:bg-green-500 border border-white rounded-lg disabled:opacity-30 disabled:hover:bg-[#8bc34a] transition-colors shadow-sm"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      {item.price}g
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* ANIMALS */}
          {activeCategory === 'Animals' && (
            <div className="space-y-3">
              <p className="text-xs text-[#d7ccc8]/70 italic mb-2">Buy young livestock to rear on your farm. Requires a Coop or Barn!</p>
              {animalItems.map((item) => {
                const canAfford = coins >= item.price;
                const petName = `${item.name.split(' ')[1]} ${Math.floor(Math.random() * 90 + 10)}`;
                return (
                  <div key={item.id} className="flex items-center justify-between p-3.5 rounded-lg border-2 border-[#5d4037] bg-[#3e2723] hover:border-[#ffeb3b] transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: item.color }} />
                      <div>
                        <h4 className="font-bold text-[#d7ccc8]">{item.name}</h4>
                        <p className="text-xs text-stone-300">{item.description}</p>
                      </div>
                    </div>
                    <button
                      disabled={!canAfford}
                      onClick={() => onBuyAnimal(item.id, item.price, petName)}
                      className="flex items-center gap-1.5 py-1.5 px-3 font-black font-mono text-xs text-[#35271d] bg-[#ffd166] hover:bg-[#ffb300] border border-white rounded-lg disabled:opacity-30 disabled:hover:bg-[#ffd166] transition-colors shadow-sm"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      {item.price}g
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* SELL GOODS */}
          {activeCategory === 'Sell Goods' && (
            <div className="space-y-3">
              <p className="text-xs text-[#d7ccc8]/70 italic mb-2">Sell your farm-grown crops, foraged berries, animal products, and fresh fish for gold.</p>
              {sellableList.map((sellItem) => {
                const invItem = inventory.find((i) => i.id === sellItem.id);
                const count = invItem ? invItem.count : 0;

                return (
                  <div
                    key={sellItem.id}
                    className={`flex items-center justify-between p-3.5 rounded-lg border-2 transition-colors ${
                      count > 0
                        ? 'border-[#ffeb3b] bg-[#3e2723]'
                        : 'border-[#5d4037] bg-[#3e2723]/60 opacity-40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: sellItem.color }} />
                      <div>
                        <h4 className="font-bold text-[#d7ccc8]">{sellItem.name}</h4>
                        <p className="text-xs text-[#ffccbc]">In satchel: {count}</p>
                      </div>
                    </div>

                    <button
                      disabled={count <= 0}
                      onClick={() => onSellItem(sellItem.id, sellItem.price)}
                      className="flex items-center gap-1.5 py-1.5 px-3 font-black font-mono text-xs text-stone-950 bg-[#ffeb3b] hover:bg-[#ffc107] border border-white disabled:bg-stone-850 disabled:text-[#8d6e63] rounded-lg transition-colors shadow-sm"
                    >
                      <Coins className="w-3.5 h-3.5 animate-bounce" />
                      Sell for {sellItem.price}g
                    </button>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 bg-[#35271d] border-[#8d6e63] text-center text-xs text-[#d7ccc8] flex-shrink-0">
          The merchant visits Evergrove village every Monday morning. Trade wisely to maximize your gold!
        </div>
      </motion.div>
    </div>
  );
};
