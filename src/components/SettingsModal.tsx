import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Settings, RefreshCw, Volume2, VolumeX, Shuffle, HelpCircle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  seed: string;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onUpdateSeed: (newSeed: string) => void;
  onResetGame: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  seed,
  soundEnabled,
  onToggleSound,
  onUpdateSeed,
  onResetGame,
}) => {
  const [currentSeed, setCurrentSeed] = useState(seed);

  if (!isOpen) return null;

  const handleGenerateRandomSeed = () => {
    const rand = Math.floor(100000 + Math.random() * 900000).toString();
    setCurrentSeed(rand);
  };

  const handleSaveSeed = () => {
    onUpdateSeed(currentSeed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md overflow-hidden border-4 bg-[#4a3728] border-[#35271d] rounded-xl shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 bg-[#35271d] border-[#8d6e63]">
          <div className="flex items-center gap-2 text-[#ffeb3b]">
            <Settings className="w-5 h-5" />
            <h2 className="text-xl font-black tracking-tight uppercase font-sans">Settings & Help</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#d7ccc8] hover:text-white hover:bg-[#5d4037] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto text-stone-200">
          
          {/* CONTROL SCHEME HELP */}
          <div className="p-4 rounded-lg border-2 border-[#5d4037] bg-[#3e2723]">
            <h3 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#ffeb3b] mb-2">
              <HelpCircle className="w-4 h-4" />
              Game Controls
            </h3>
            <ul className="space-y-1.5 text-xs text-[#d7ccc8]/90 leading-relaxed">
              <li>• Move: <strong className="text-white font-mono">W / A / S / D</strong> or <strong className="text-white font-mono">Arrow Keys</strong></li>
              <li>• Run: Hold <strong className="text-white font-mono">SHIFT</strong> while moving</li>
              <li>• Perform Action: <strong className="text-white font-mono">Click</strong> near player</li>
              <li>• Select Tool: Click the hotbar slots</li>
              <li>• Zoom Camera: Use <strong className="text-white font-mono">+ / -</strong> zoom HUD buttons</li>
            </ul>
          </div>

          {/* GAME SEED */}
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-[#d7ccc8]">
              World Generation Seed
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentSeed}
                onChange={(e) => setCurrentSeed(e.target.value.replace(/[^0-9a-zA-Z]/g, ''))}
                className="flex-1 px-3 py-2 bg-[#2e1f14] border-2 border-[#5d4037] focus:border-[#ffeb3b] outline-hidden rounded-lg text-white font-mono text-sm tracking-widest text-center shadow-inner"
                maxLength={10}
              />
              <button
                onClick={handleGenerateRandomSeed}
                title="Shuffle Random Seed"
                className="p-2 bg-[#5d4037] hover:bg-[#6d4c41] text-[#d7ccc8] hover:text-white rounded-lg transition-all border-2 border-[#3e2723]"
              >
                <Shuffle className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[10px] text-[#ffccbc] leading-relaxed">
              Changing the seed resets and regenerates a completely unique world with different tree, rock, and bush placements!
            </p>
          </div>

          {/* AUDIO SYNTHESIS */}
          <div className="flex items-center justify-between p-3.5 border-2 border-[#5d4037] bg-[#3e2723] rounded-lg">
            <div>
              <h4 className="text-sm font-bold text-[#d7ccc8]">Synthesized Beeps</h4>
              <p className="text-xs text-[#d7ccc8]/60 mt-0.5">Toggle sound effects feedback</p>
            </div>
            <button
              onClick={onToggleSound}
              className={`p-2.5 rounded-lg border border-white/25 transition-all ${soundEnabled ? 'bg-[#8bc34a] text-white shadow-sm' : 'bg-[#5d4037] text-[#d7ccc8]'}`}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>

          {/* RESET ALL DATA */}
          <div className="pt-4 border-t-2 border-[#35271d]">
            <button
              onClick={onResetGame}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-bold text-red-100 bg-red-900/40 hover:bg-red-700 hover:text-white border-2 border-red-700 rounded-lg transition-all font-sans"
            >
              <RefreshCw className="w-4 h-4" />
              Reset & Wipe Saved Data
            </button>
          </div>

        </div>

        {/* Save Seed Button */}
        <div className="p-4 bg-[#35271d] border-t-2 border-[#8d6e63] flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-xs font-bold text-[#d7ccc8] hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveSeed}
            className="flex-1 py-2 text-xs font-bold text-white bg-[#8bc34a] hover:bg-green-500 border border-white rounded-lg transition-colors shadow-sm"
          >
            Apply Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
};
