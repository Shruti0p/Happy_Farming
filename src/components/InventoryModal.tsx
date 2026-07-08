import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Sparkles, Flame, Move } from 'lucide-react';
import { InventoryItem } from '../game/types';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  onUseItem: (item: InventoryItem) => void;
  onUpdateInventory?: (newInventory: InventoryItem[]) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onUseItem,
  onUpdateInventory,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [hoveredItem, setHoveredItem] = useState<InventoryItem | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  // 1. Categories Definition
  const categories = ['All', 'Seeds', 'Crops', 'Food', 'Tools', 'Materials', 'Resources'];

  // Helper to match category
  const matchesCategory = (item: InventoryItem, cat: string) => {
    if (cat === 'All') return true;
    if (cat === 'Seeds') return item.type === 'seed';
    if (cat === 'Crops') return item.type === 'crop' && !['milk', 'egg', 'wool'].includes(item.id);
    if (cat === 'Food') return ['berry', 'carrot', 'tomato', 'strawberry', 'milk', 'egg', 'fish_trout', 'fish_salmon', 'fish_carp'].includes(item.id);
    if (cat === 'Tools') return item.type === 'tool';
    if (cat === 'Materials') return item.type === 'material';
    if (cat === 'Resources') return ['wood', 'stone', 'fiber', 'flower', 'wool', 'milk', 'egg', 'fish_trout', 'fish_salmon', 'fish_carp'].includes(item.id);
    return false;
  };

  // 2. Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIdxStr = e.dataTransfer.getData('text/plain');
    if (!sourceIdxStr) return;
    const sourceIndex = parseInt(sourceIdxStr, 10);
    
    if (isNaN(sourceIndex) || sourceIndex < 0 || sourceIndex >= inventory.length) return;
    if (targetIndex < 0 || targetIndex >= inventory.length) return;

    // Swap items in inventory
    const newInventory = [...inventory];
    const temp = newInventory[sourceIndex];
    newInventory[sourceIndex] = newInventory[targetIndex];
    newInventory[targetIndex] = temp;

    onUpdateInventory?.(newInventory);
    setDraggedIndex(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl overflow-hidden border-4 bg-[#4a3728] border-[#35271d] rounded-xl shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 bg-[#35271d] border-[#8d6e63] flex-shrink-0">
          <div className="flex items-center gap-2 text-[#ffeb3b]">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <h2 className="text-xl font-black tracking-tight uppercase font-sans">Farm Satchel</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#d7ccc8] hover:text-white hover:bg-[#5d4037] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="bg-[#3e2723] border-b border-[#35271d] p-2 flex gap-1 overflow-x-auto scrollbar-none flex-shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-[#ffeb3b] text-[#3e2723] shadow-md'
                  : 'text-[#d7ccc8] hover:bg-[#5d4037] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Satchel Grid Slots */}
        <div className="p-6 overflow-y-auto max-h-[50vh] flex-grow">
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {/* We render up to 18 slots. If an item matches the category and falls in slot index, we render it */}
            {Array.from({ length: 18 }).map((_, index) => {
              // Find the item that sits at this slot index in the main inventory
              const item = inventory[index];
              const isVisible = item && matchesCategory(item, activeCategory);
              
              // If we are filtering, we want to only show items matching category.
              // To preserve slot sorting visually, we show empty slots if there is no item or if item is filtered.
              if (!item) {
                // Empty Slot
                return (
                  <div
                    key={`empty-${index}`}
                    className="aspect-square rounded-lg border-2 border-dashed border-[#5d4037] bg-[#2e1f14]/50 flex items-center justify-center text-[#5d4037]/40 text-[10px] font-bold font-mono"
                  >
                    SLOT {index + 1}
                  </div>
                );
              }

              if (!isVisible) {
                // Dimmed empty placeholder when filtered out
                return (
                  <div
                    key={`filtered-${index}`}
                    className="aspect-square rounded-lg border-2 border-[#5d4037]/20 bg-[#2e1f14]/20 flex items-center justify-center text-[#5d4037]/20 text-[10px] font-bold font-mono"
                  >
                    -
                  </div>
                );
              }

              const canConsume = ['berry', 'carrot', 'tomato', 'strawberry', 'milk', 'egg', 'fish_trout', 'fish_salmon', 'fish_carp'].includes(item.id);

              return (
                <div
                  key={item.id}
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onMouseEnter={() => setHoveredItem(item)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`aspect-square relative rounded-lg border-2 p-1.5 flex flex-col justify-between cursor-grab active:cursor-grabbing transition-all ${
                    draggedIndex === index
                      ? 'border-[#ffeb3b] bg-[#5d4037] scale-95 opacity-50'
                      : 'border-[#5d4037] bg-[#3e2723] hover:border-[#ffeb3b] hover:scale-105'
                  }`}
                >
                  {/* Color Swatch Visual */}
                  <div className="flex items-center justify-between">
                    <span
                      className="w-4.5 h-4.5 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: item.color || '#fff' }}
                    />
                    
                    {item.type !== 'tool' && (
                      <span className="px-1 py-0.2 text-[9px] font-black rounded bg-[#2e1f14] text-[#ffeb3b] border border-[#8d6e63] font-mono">
                        {item.count}
                      </span>
                    )}
                  </div>

                  {/* Drag Indicator handle icon overlay on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity pointer-events-none">
                    <Move className="w-4 h-4 text-white" />
                  </div>

                  {/* Name label */}
                  <span className="text-[10px] font-bold text-center text-[#d7ccc8] truncate mt-1 w-full leading-tight">
                    {item.name.replace(' Seeds', '').replace('Copper ', '')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Tooltip Panel & Quick Action */}
        <div className="p-4 border-t-2 bg-[#35271d] border-[#8d6e63] flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="flex-1 text-center sm:text-left">
            {hoveredItem ? (
              <div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: hoveredItem.color }}
                  />
                  <h4 className="font-bold text-[#ffeb3b] text-sm uppercase">{hoveredItem.name}</h4>
                  <span className="text-[9px] px-1.5 py-0.2 bg-[#4a3728] text-[#d7ccc8] rounded uppercase font-bold tracking-wider">
                    {hoveredItem.type}
                  </span>
                </div>
                <p className="text-xs text-stone-200 mt-0.5 leading-relaxed">
                  {hoveredItem.description || `${hoveredItem.name} inventory item.`}
                </p>
              </div>
            ) : (
              <p className="text-xs text-[#d7ccc8]/70 italic">
                Hover over items to read descriptions. Drag & drop items to organize your hotbar bag!
              </p>
            )}
          </div>

          {/* Quick consume button */}
          {hoveredItem && ['berry', 'carrot', 'tomato', 'strawberry', 'milk', 'egg', 'fish_trout', 'fish_salmon', 'fish_carp'].includes(hoveredItem.id) && (
            <button
              onClick={() => onUseItem(hoveredItem)}
              disabled={hoveredItem.count <= 0}
              className="flex items-center gap-1.5 py-1.5 px-4 text-xs font-bold text-white bg-[#8bc34a] hover:bg-green-500 border border-white rounded-lg transition-all shadow-md flex-shrink-0 uppercase"
            >
              <Flame className="w-3.5 h-3.5" />
              Eat (+25 Energy)
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
