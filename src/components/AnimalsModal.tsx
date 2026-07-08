import React from 'react';
import { motion } from 'motion/react';
import { X, Heart, Milk, Egg, Shield, PlusCircle, Sparkles, Coins, CheckCircle, Wheat } from 'lucide-react';
import { AnimalState, InventoryItem } from '../game/types';

interface AnimalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  animals: AnimalState[];
  inventory: InventoryItem[];
  onBuyAnimal: (type: string, price: number, name: string) => void;
  onFeedAnimal: (id: string, costFiber: number) => void;
  onHarvestAnimal: (id: string, productType: string) => void;
}

export const AnimalsModal: React.FC<AnimalsModalProps> = ({
  isOpen,
  onClose,
  coins,
  animals,
  inventory,
  onBuyAnimal,
  onFeedAnimal,
  onHarvestAnimal,
}) => {
  if (!isOpen) return null;

  // Count fiber in inventory
  const fiberCount = inventory.find((i) => i.id === 'fiber')?.count || 0;

  // Available animals to buy
  const buyAnimalTypes = [
    { type: 'chicken' as const, name: 'Clucky Chicken', price: 150, product: 'egg', pName: 'Fresh Egg', desc: 'Produces high-quality organic eggs daily.', color: '#f8f9fa' },
    { type: 'duck' as const, name: 'Puddle Duck', price: 250, product: 'duck_egg', pName: 'Duck Egg', desc: 'Loves water. Produces rich, large duck eggs.', color: '#ffee32' },
    { type: 'rabbit' as const, name: 'Cotton Rabbit', price: 350, product: 'rabbit_foot', pName: 'Rabbit Foot', desc: 'A soft, fluffy pet that produces lucky rabbit feet.', color: '#ffffff' },
    { type: 'cow' as const, name: 'Bessie Cow', price: 450, product: 'milk', pName: 'Creamy Milk', desc: 'Produces rich and creamy bucketed milk.', color: '#ffcad4' },
    { type: 'goat' as const, name: 'Alpine Goat', price: 500, product: 'goat_milk', pName: 'Goat Milk', desc: 'Produces tangy, premium goat milk.', color: '#e9ecef' },
    { type: 'sheep' as const, name: 'Wooly Sheep', price: 600, product: 'wool', pName: 'Soft Wool', desc: 'Produces thick wool for cloth and yarn crafting.', color: '#dee2e6' },
    { type: 'pig' as const, name: 'Truffle Pig', price: 750, product: 'truffle', pName: 'Black Truffle', desc: 'Noses around the farm. Unearths rare black truffles.', color: '#ffb3c1' },
    { type: 'horse' as const, name: 'Thoroughbred Horse', price: 1200, product: 'horse_hair', pName: 'Horse Hair', desc: 'A majestic companion. Sheds premium hair for brush crafting.', color: '#9c6644' },
    { type: 'cat' as const, name: 'Barn Cat', price: 200, product: 'cat_mouse', pName: 'Catch of the Day', desc: 'Keeps pests away. Catches stray mice overnight.', color: '#f4a261' },
    { type: 'dog' as const, name: 'Herding Dog', price: 250, product: 'dog_bone', pName: 'Ancient Bone', desc: 'Dugs up ancient buried fossils and old bones.', color: '#e09f67' },
  ];

  // Random animal names generator
  const cuteNames: { [key: string]: string[] } = {
    chicken: ['Henrietta', 'Penny', 'Cluckers', 'Pip', 'Nugget', 'Eggy'],
    cow: ['Clarabelle', 'Moolan', 'Buttercup', 'Daisy', 'Coco', 'Bessie'],
    sheep: ['Shaun', 'Cotton', 'Sherman', 'Snowball', 'Lambchop', 'Fluffy'],
    pig: ['Hamlet', 'Waddles', 'Porky', 'Oinkers', 'Bacon', 'Wilbur'],
    duck: ['Donald', 'Daffy', 'Quackers', 'Puddles', 'Webby', 'Ferdinand'],
    goat: ['Billy', 'Gruff', 'Gomer', 'Nanny', 'Chevre', 'Ramsey'],
    horse: ['Spirit', 'Pegasus', 'Bandit', 'Clyde', 'Trigger', 'Duchess'],
    rabbit: ['Bugs', 'Thumper', 'Lola', 'Peter', 'Floppy', 'Clover'],
    dog: ['Rover', 'Buddy', 'Rex', 'Buster', 'Sadie', 'Max'],
    cat: ['Luna', 'Milo', 'Oliver', 'Simba', 'Garfield', 'Felix'],
  };

  const triggerBuy = (type: string, price: number) => {
    const list = cuteNames[type] || ['Cute Animal'];
    const randomName = list[Math.floor(Math.random() * list.length)] + ' #' + (animals.filter(a => a.type === type).length + 1);
    onBuyAnimal(type, price, randomName);
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
            <Heart className="w-5 h-5 animate-pulse" />
            <h2 className="text-xl font-black tracking-tight uppercase font-sans">Livestock & Barnyard</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#2e1f14] border border-[#d7ccc8] rounded-lg">
              <Coins className="w-4 h-4 text-[#ffc107]" />
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

        {/* Content Area */}
        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
          {/* BUY ANIMALS PANEL */}
          <div>
            <h3 className="flex items-center gap-2 mb-3.5 text-xs font-black tracking-wider uppercase text-[#d7ccc8]">
              <PlusCircle className="w-4 h-4 text-green-500" />
              Purchase Livestock
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {buyAnimalTypes.map((anim) => {
                const canAfford = coins >= anim.price;
                return (
                  <div
                    key={anim.type}
                    className="flex flex-col justify-between p-4 rounded-lg border-2 border-[#5d4037] bg-[#3e2723] hover:border-[#ffeb3b] transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="w-5 h-5 rounded-md border border-white/20 shadow-sm"
                          style={{ backgroundColor: anim.color }}
                        />
                        <span className="text-xs font-black text-[#ffeb3b] font-mono">
                          {anim.price}g
                        </span>
                      </div>
                      <h4 className="font-bold text-[#d7ccc8]">{anim.name}</h4>
                      <p className="mt-1 text-xs text-stone-300 leading-relaxed min-h-[36px]">
                        {anim.desc}
                      </p>
                    </div>

                    <button
                      disabled={!canAfford}
                      onClick={() => triggerBuy(anim.type, anim.price)}
                      className="mt-4 w-full py-1.5 px-3 font-bold text-xs text-white bg-[#8bc34a] hover:bg-green-500 border border-white disabled:opacity-30 rounded-lg transition-colors font-sans shadow-sm"
                    >
                      Buy Animal
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MY ANIMALS LIST */}
          <div>
            <div className="flex items-center justify-between mb-3.5 border-t-2 border-[#35271d] pt-5">
              <h3 className="flex items-center gap-2 text-xs font-black tracking-wider uppercase text-[#d7ccc8]">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
                Your Barn Animals ({animals.length})
              </h3>
              <div className="text-xs text-[#d7ccc8]/80">
                My Hay Feed: <strong className="text-[#ffeb3b] font-mono">{fiberCount}</strong> units of fiber
              </div>
            </div>

            {animals.length === 0 ? (
              <div className="text-center py-8 text-stone-400 border border-dashed border-[#5d4037] rounded-xl">
                No animals in your pen yet. Buy a chicken to get fresh eggs!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {animals.map((animal) => {
                  const hasFeed = fiberCount >= 1;
                  const canFeed = !animal.fed;

                  return (
                    <div
                      key={animal.id}
                      className="flex flex-col justify-between p-4 rounded-lg border-2 border-[#5d4037] bg-[#3e2723]"
                    >
                      <div>
                        {/* Title Row */}
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-[#d7ccc8]">{animal.name}</h4>
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${animal.fed ? 'bg-[#8bc34a]/10 text-[#8bc34a] border border-[#8bc34a]/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
                            {animal.fed ? 'Fed' : 'Hungry'}
                          </span>
                        </div>

                        {/* Affection meter */}
                        <div className="flex items-center gap-2 mt-2">
                          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                          <div className="w-full bg-[#2e1f14] h-2 rounded-full border border-[#8d6e63] overflow-hidden">
                            <div
                              className="bg-red-500 h-full transition-all duration-300"
                              style={{ width: `${animal.affection}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-[#d7ccc8]">{animal.affection}%</span>
                        </div>
                      </div>

                      {/* Actions row */}
                      <div className="flex gap-2 mt-4 pt-3 border-t border-[#35271d]">
                        {/* Feed Button */}
                        <button
                          disabled={!canFeed || !hasFeed}
                          onClick={() => onFeedAnimal(animal.id, 1)}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 px-3 text-xs font-bold text-[#d7ccc8] bg-[#5d4037] hover:bg-[#6d4c41] border border-[#d7ccc8] disabled:opacity-30 rounded-lg transition-colors font-sans"
                        >
                          <Wheat className="w-3.5 h-3.5 text-amber-400" />
                          Feed (1 Fiber)
                        </button>

                        {/* Harvest Button */}
                        {animal.hasProduct ? (
                          <button
                            onClick={() => {
                              const definition = buyAnimalTypes.find(b => b.type === animal.type);
                              onHarvestAnimal(animal.id, definition?.product || 'egg');
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-black text-stone-950 bg-[#ffeb3b] hover:bg-[#ffc107] border border-white rounded-lg transition-colors font-sans animate-pulse shadow-sm"
                          >
                            {animal.type === 'chicken' ? <Egg className="w-3.5 h-3.5" /> : animal.type === 'cow' ? <Milk className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                            Harvest
                          </button>
                        ) : (
                          <div className="flex-1 flex items-center justify-center gap-1 py-1.5 px-3 text-[10px] font-bold uppercase text-[#8d6e63] tracking-wider">
                            <CheckCircle className="w-3 h-3 text-stone-500" />
                            Growing Product
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 bg-[#35271d] border-[#8d6e63] text-center text-xs text-[#d7ccc8]">
          Happy fed animals increase their affection level and produce premium resources overnight.
        </div>
      </motion.div>
    </div>
  );
};
