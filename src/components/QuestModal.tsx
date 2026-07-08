import React from 'react';
import { motion } from 'motion/react';
import { X, Trophy, Calendar, Sparkles, CheckCircle2, Circle, Coins, BookOpen } from 'lucide-react';
import { SavedGameState } from '../game/types';

interface QuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: SavedGameState;
  onClaimReward: (category: 'dailyQuests' | 'achievements' | 'storyMissions', id: string, rewardGold: number) => void;
}

export const QuestModal: React.FC<QuestModalProps> = ({
  isOpen,
  onClose,
  gameState,
  onClaimReward,
}) => {
  if (!isOpen) return null;

  const { dailyQuests, achievements, storyMissions } = gameState.questProgress;

  const renderQuestCategory = (
    title: string,
    icon: React.ReactNode,
    quests: any[],
    categoryKey: 'dailyQuests' | 'achievements' | 'storyMissions'
  ) => {
    return (
      <div className="space-y-3.5">
        <h3 className="flex items-center gap-2 text-xs font-black tracking-wider uppercase text-[#d7ccc8] pb-1.5 border-b border-[#5d4037]/50">
          {icon}
          {title} ({quests.filter(q => q.done).length}/{quests.length})
        </h3>

        <div className="space-y-2.5">
          {quests.map((q) => {
            const progressPercent = Math.min(100, Math.floor((q.current / q.target) * 100));
            const isCompleted = q.done;
            const isClaimed = q.claimed;

            return (
              <div
                key={q.id}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isClaimed
                    ? 'bg-[#35271d]/40 border-[#5d4037] opacity-60'
                    : isCompleted
                    ? 'bg-[#8bc34a]/10 border-[#8bc34a] shadow-md shadow-[#8bc34a]/5'
                    : 'bg-[#3e2723] border-[#5d4037]'
                }`}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-[#8bc34a] shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#8d6e63] shrink-0" />
                    )}
                    <h4 className="font-bold text-sm text-[#ffeb3b]">{q.name}</h4>
                  </div>
                  <p className="text-xs text-[#d7ccc8] leading-relaxed pl-7">{q.desc}</p>
                  
                  {/* Progress bar */}
                  {!isCompleted && (
                    <div className="pl-7 pt-1.5 flex items-center gap-3">
                      <div className="flex-1 h-2 bg-[#2e1f14] rounded-full overflow-hidden border border-[#8d6e63]/50">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-stone-300 shrink-0">
                        {q.current}/{q.target}
                      </span>
                    </div>
                  )}
                </div>

                {/* Reward & Action */}
                <div className="shrink-0 flex items-center gap-3 justify-end md:justify-start pl-7 md:pl-0">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#2e1f14] border border-[#8d6e63]/40">
                    <Coins className="w-3.5 h-3.5 text-[#ffc107]" />
                    <span className="font-mono font-bold text-xs text-[#ffeb3b]">{q.reward}g</span>
                  </div>

                  {isCompleted ? (
                    isClaimed ? (
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                        Claimed
                      </span>
                    ) : (
                      <button
                        onClick={() => onClaimReward(categoryKey, q.id, q.reward)}
                        className="py-1 px-3 bg-[#ffeb3b] hover:bg-[#ffc107] text-stone-950 font-black text-xs uppercase rounded-lg border-2 border-white transition-all shadow-sm active:scale-95 cursor-pointer"
                      >
                        Claim
                      </button>
                    )
                  ) : (
                    <span className="text-[10px] font-bold text-[#8d6e63] uppercase tracking-wider">
                      In Progress
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
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
            <Trophy className="w-5 h-5 animate-bounce" />
            <h2 className="text-xl font-black tracking-tight uppercase font-sans">Quests & Achievements</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#d7ccc8] hover:text-white hover:bg-[#5d4037] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-8 max-h-[65vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#5d4037]">
          {/* Daily Quests */}
          {renderQuestCategory(
            "Daily Quests",
            <Calendar className="w-4 h-4 text-[#ffeb3b]" />,
            dailyQuests,
            'dailyQuests'
          )}

          {/* Story Missions */}
          {renderQuestCategory(
            "Story Missions",
            <BookOpen className="w-4 h-4 text-sky-400" />,
            storyMissions,
            'storyMissions'
          )}

          {/* Achievements */}
          {renderQuestCategory(
            "Achievements",
            <Trophy className="w-4 h-4 text-amber-500 animate-pulse" />,
            achievements,
            'achievements'
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 bg-[#35271d] border-[#8d6e63] text-center text-xs text-[#d7ccc8]">
          Complete story missions to unlock advanced farm upgrades and expand your capabilities.
        </div>
      </motion.div>
    </div>
  );
};
