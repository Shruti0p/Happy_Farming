import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Heart, Gift, MessageSquare, Award, Coins } from 'lucide-react';
import { InventoryItem, SavedGameState } from '../game/types';

interface NpcDialogModalProps {
  isOpen: boolean;
  onClose: () => void;
  npcId: string;
  gameState: SavedGameState;
  onStateUpdate: (updatedState: SavedGameState) => void;
  playBeep: (freq?: number, type?: OscillatorType, dur?: number) => void;
}

export const NpcDialogModal: React.FC<NpcDialogModalProps> = ({
  isOpen,
  onClose,
  npcId,
  gameState,
  onStateUpdate,
  playBeep,
}) => {
  if (!isOpen) return null;

  const npc = gameState.friendships[npcId];
  if (!npc) return null;

  const [giftSuccessMsg, setGiftSuccessMsg] = useState<string | null>(null);

  // Custom dialogues based on friendship hearts
  const dialogues: { [key: string]: string[] } = {
    robin: [
      "Hi there! Need some wood? I've been busy fixing up the workshop.",
      "Your farm is starting to look great! Let me know if you need any construction help.",
      "The forest is so peaceful. Harvesting wood is hard work but very rewarding.",
      "You're a great friend! I love designing wooden structures for your farm.",
      "We've made a wonderful farm village together! You're practically family now!"
    ],
    pierre: [
      "Welcome to the local market! Always selling the finest seasonal seeds.",
      "Business has been steady, thanks to you! Any fresh crops you want to sell?",
      "I love seeing your farm grow. It means more premium fresh goods for our village!",
      "You always bring the best crops. Pierre's Market wouldn't be the same without you.",
      "You're my absolute favorite trading partner and best friend! Let's build a farming empire!"
    ],
    lewis: [
      "Hello, young farmer! As Mayor of this beautiful village, I welcome you.",
      "Remember to take care of your crops. Watering them daily is key to a rich harvest.",
      "The seasonal festival is approaching. Everyone is excited to see your farm layout!",
      "I am so proud of how far you've come. The town's reputation has skyrocketed because of you!",
      "It is an honor to have you as a resident. This village is forever in your debt, friend!"
    ]
  };

  const getDialogueText = () => {
    const list = dialogues[npcId] || ["Hello!"];
    const index = Math.min(list.length - 1, npc.hearts);
    return list[index];
  };

  const giftTastes: { [key: string]: { loves: string[]; dislikes: string[] } } = {
    robin: {
      loves: ['wood', 'stone', 'fiber'],
      dislikes: ['wheat_seeds', 'tomato_seeds', 'carrot_seeds', 'corn_seeds', 'strawberry_seeds']
    },
    pierre: {
      loves: ['wheat', 'tomato', 'carrot', 'strawberry', 'corn'],
      dislikes: ['wood', 'stone', 'dog_bone', 'cat_mouse']
    },
    lewis: {
      loves: ['milk', 'goat_milk', 'wheat', 'egg', 'duck_egg'],
      dislikes: ['dog_bone', 'cat_mouse']
    }
  };

  const handleGiveGift = (item: InventoryItem) => {
    if (npc.giftedToday) {
      playBeep(220, 'sawtooth', 0.2);
      setGiftSuccessMsg("Already gave a gift to this resident today!");
      return;
    }

    playBeep(880, 'sine', 0.15);
    const taste = giftTastes[npcId] || { loves: [], dislikes: [] };
    let pointsGained = 50; // Neutral gift
    let reaction = "liked";

    if (taste.loves.includes(item.id)) {
      pointsGained = 150; // Loved gift
      reaction = "absolutely loved";
    } else if (taste.dislikes.includes(item.id)) {
      pointsGained = -50; // Disliked gift
      reaction = "disliked";
    }

    const nextPoints = Math.max(0, Math.min(1250, npc.points + pointsGained));
    const nextHearts = Math.floor(nextPoints / 250);

    const updatedInv = gameState.inventory.map((i) => {
      if (i.id === item.id) {
        return { ...i, count: i.count - 1 };
      }
      return i;
    }).filter((i) => i.count > 0);

    const nextState = {
      ...gameState,
      inventory: updatedInv,
      friendships: {
        ...gameState.friendships,
        [npcId]: {
          ...npc,
          points: nextPoints,
          hearts: nextHearts,
          giftedToday: true
        }
      }
    };

    onStateUpdate(nextState);
    setGiftSuccessMsg(`${npc.name} ${reaction} the ${item.name}! (${pointsGained > 0 ? '+' : ''}${pointsGained} Friendship Points)`);
  };

  const colors: { [key: string]: string } = {
    robin: '#e76f51',
    pierre: '#9c27b0',
    lewis: '#ffd166'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg overflow-hidden border-4 bg-[#4a3728] border-[#35271d] rounded-xl shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 bg-[#35271d] border-[#8d6e63]">
          <div className="flex items-center gap-2 text-[#ffeb3b]">
            <MessageSquare className="w-5 h-5" />
            <h2 className="text-lg font-black tracking-tight uppercase font-sans">Resident Dialogue</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#d7ccc8] hover:text-white hover:bg-[#5d4037] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-6">
          {/* Character Card */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-[#3e2723] border-2 border-[#5d4037]">
            {/* Portrait placeholder */}
            <div 
              className="w-16 h-16 rounded-xl border-2 border-white/25 flex flex-col items-center justify-center text-white text-2xl font-black shadow-md shrink-0"
              style={{ backgroundColor: colors[npcId] || '#4e3520' }}
            >
              {npc.name[0]}
            </div>
            <div className="flex-1">
              <h3 className="text-base font-black text-[#ffeb3b]">{npc.name}</h3>
              <p className="text-xs text-[#d7ccc8] uppercase tracking-wider font-bold mt-0.5">
                {npcId === 'robin' ? 'Master Carpenter' : npcId === 'pierre' ? 'Market Owner' : 'Town Mayor'}
              </p>
              {/* Friendship hearts */}
              <div className="flex items-center gap-1 mt-2.5">
                {Array.from({ length: 5 }).map((_, i) => {
                  const isFilled = i < npc.hearts;
                  return (
                    <Heart 
                      key={i} 
                      className={`w-5 h-5 ${isFilled ? 'text-red-500 fill-red-500 animate-pulse' : 'text-[#5d4037]'}`} 
                    />
                  );
                })}
                <span className="text-xs font-mono font-bold text-stone-300 ml-2">({npc.points}/1250)</span>
              </div>
            </div>
          </div>

          {/* Dialogue bubble */}
          <div className="relative p-4 rounded-xl bg-[#2e1f14] border-2 border-[#8d6e63] text-stone-100 text-sm leading-relaxed font-sans shadow-inner">
            <div className="absolute top-[-8px] left-[32px] w-4 h-4 rotate-45 bg-[#2e1f14] border-l-2 border-t-2 border-[#8d6e63]" />
            "{getDialogueText()}"
          </div>

          {/* Gift giving */}
          <div>
            <h4 className="flex items-center gap-1.5 text-xs font-black tracking-wider uppercase text-[#d7ccc8] mb-3">
              <Gift className="w-4 h-4 text-pink-400" />
              Give Gift from Bag
            </h4>

            {giftSuccessMsg && (
              <div className="mb-3.5 p-2.5 text-xs font-bold bg-[#35271d] text-[#ffcc00] border border-dashed border-[#8d6e63] rounded-lg">
                {giftSuccessMsg}
              </div>
            )}

            <div className="flex gap-2 overflow-x-auto py-2.5 px-1.5 bg-[#2e1f14] rounded-lg border border-[#8d6e63] scrollbar-thin scrollbar-thumb-[#5d4037]">
              {gameState.inventory.filter(i => i.type !== 'tool').length === 0 ? (
                <span className="text-xs text-stone-400 italic p-1">No items to gift in bag!</span>
              ) : (
                gameState.inventory.filter(i => i.type !== 'tool').map((item) => (
                  <button
                    key={item.id}
                    disabled={npc.giftedToday}
                    onClick={() => handleGiveGift(item)}
                    className="shrink-0 flex flex-col items-center justify-center p-2 rounded-lg bg-[#5d4037] hover:bg-[#6d4c41] border border-[#d7ccc8]/40 hover:border-white transition-all disabled:opacity-35"
                    title={`Gift: ${item.name}`}
                  >
                    <span 
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[9px] font-bold text-[#d7ccc8] mt-1.5 max-w-[50px] truncate">{item.name}</span>
                    <span className="text-[8px] font-mono text-amber-200">x{item.count}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 bg-[#35271d] border-[#8d6e63] text-center text-xs text-[#d7ccc8]">
          Talk to villagers daily and give their favorite items to build high friendship levels.
        </div>
      </motion.div>
    </div>
  );
};
