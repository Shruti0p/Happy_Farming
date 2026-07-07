// assets.js - loads SVG sprite and provides simple sound placeholders
export function loadSprites() {
  return fetch('assets/icons.svg').then(r => r.text()).then(svg => {
    const div = document.createElement('div');
    div.style.display = 'none';
    div.innerHTML = svg;
    document.body.appendChild(div);
  }).catch(() => { /* ignore */ });
}

let audioCtx = null;
let muted = false;
export function setMuted(v){ muted = !!v; try{ localStorage.setItem('farmverse-muted', muted? '1':'0'); }catch(e){} }
export function isMuted(){ return muted; }
export function playBeep(type = 'click'){
  try{
    if(muted) return;
    if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type === 'click' ? 'square' : 'sine';
    o.frequency.value = type === 'coin' ? 900 : 420;
    g.gain.value = 0.06;
    o.connect(g); g.connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + 0.08);
  }catch(e){/* audio blocked */}
}

// load persisted mute
try{ const m = localStorage.getItem('farmverse-muted'); if(m==='1') muted = true; }catch(e){}

export const ASSETS = {
  crops: {
    wheat: { id: 'wheat', name: 'Wheat', icon: '🌾', seedPrice: 12, sellPrice: 18, growTime: 30, stages: 3 },
    corn: { id: 'corn', name: 'Corn', icon: '🌽', seedPrice: 28, sellPrice: 36, growTime: 45, stages: 3, unlockLevel: 3 },
    tomato: { id: 'tomato', name: 'Tomato', icon: '🍅', seedPrice: 42, sellPrice: 52, growTime: 55, stages: 3, unlockLevel: 4 },
    potato: { id: 'potato', name: 'Potato', icon: '🥔', seedPrice: 56, sellPrice: 70, growTime: 65, stages: 3, unlockLevel: 5 },
  },
  products: [
    { id: 'wheat', name: 'Wheat', icon: '🌾', sellPrice: 18 },
    { id: 'corn', name: 'Corn', icon: '🌽', sellPrice: 36 },
    { id: 'tomato', name: 'Tomato', icon: '🍅', sellPrice: 52 },
    { id: 'potato', name: 'Potato', icon: '🥔', sellPrice: 70 },
    { id: 'eggs', name: 'Eggs', icon: '🥚', sellPrice: 22 },
    { id: 'milk', name: 'Milk', icon: '🥛', sellPrice: 36 },
  ],
};

export const BUILDINGS = [
  { id: 'barn', name: 'Barn', price: 80, unlockLevel: 2, description: 'Allows you to house animals.', icon: '🏠' },
  { id: 'greenhouse', name: 'Greenhouse', price: 150, unlockLevel: 4, description: 'Grow crops faster year-round.', icon: '🌿' },
  { id: 'barnExpansion', name: 'Animal Pen', price: 220, unlockLevel: 6, description: 'Hold more animals and products.', icon: '🐄' },
];

export const ANIMALS = [
  { id: 'chicken', name: 'Chicken', price: 90, unlockLevel: 2, requirement: 'barn', icon: '🐔', description: 'Produces eggs over time.', productId: 'eggs', productName: 'Eggs', productIcon: '🥚', productSellPrice: 22, produceTime: 35 },
  { id: 'cow', name: 'Cow', price: 180, unlockLevel: 5, requirement: 'barn', icon: '🐄', description: 'Produces milk over time.', productId: 'milk', productName: 'Milk', productIcon: '🥛', productSellPrice: 36, produceTime: 60 },
];
