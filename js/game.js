import { loadSprites, ASSETS, BUILDINGS, ANIMALS, playBeep, setMuted, isMuted } from './assets.js';
import { bindSettingsButton, bindToolbar, showToast, showPanel, closeAllPanels, setTopbar, hideLoading } from './ui.js';
import { Grid, renderGrid } from './grid.js';

const SAVE_KEY = 'farmverse-v2-state';
const DEFAULT_SEED_INVENTORY = { wheat: 3, corn: 0, tomato: 0, potato: 0 };

class Game {
  constructor() {
    this.grid = new Grid(10, 10);
    this.state = {
      coins: 220,
      xp: 0,
      level: 1,
      selectedTool: 'plant',
      selectedCrop: 'wheat',
      seedInventory: { ...DEFAULT_SEED_INVENTORY },
      harvestInventory: {},
      buildings: [],
      animals: [],
      lastTick: Date.now(),
    };
    this.load();
    this.initializeInventory();
    this.initializeAnimals();
    this.container = document.getElementById('farm');
    this.setup();
  }

  initializeInventory() {
    Object.keys(ASSETS.crops).forEach(id => {
      if (!(id in this.state.seedInventory)) this.state.seedInventory[id] = 0;
    });
    ASSETS.products.forEach(product => {
      if (!(product.id in this.state.harvestInventory)) this.state.harvestInventory[product.id] = 0;
    });
  }

  initializeAnimals() {
    this.state.animals = (this.state.animals || []).map(animal => {
      const def = ANIMALS.find(a => a.id === animal.id);
      const nextProductAt = animal.nextProductAt || (Date.now() + ((def?.produceTime || 30) * 1000));
      return {
        id: animal.id,
        acquiredAt: animal.acquiredAt || Date.now(),
        nextProductAt,
        storedProduct: animal.storedProduct || 0,
      };
    });
  }

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        Object.assign(this.state, saved);
        this.initializeInventory();
        this.initializeAnimals();
        this.applyXp();
      }
    } catch (e) {}
  }

  save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
      this.grid.save();
    } catch (e) {}
  }

  setup() {
    this.interval = setInterval(() => this.tick(), 1000);
    loadSprites().then(() => {});
    bindToolbar(tool => this.onToolbarAction(tool));
    bindSettingsButton(() => this.openSettingsPanel());
    this.render();
    hideLoading();
  }

  onToolbarAction(tool) {
    if (['inventory', 'market', 'animals', 'buildings'].includes(tool)) {
      this.openPanel(tool);
      return;
    }
    this.setTool(tool);
  }

  setTool(tool) {
    this.state.selectedTool = tool;
    this.save();
    showToast(`Selected ${tool}`, 900);
    this.render();
  }

  openPanel(type) {
    closeAllPanels();
    if (type === 'inventory') return this.showInventoryPanel();
    if (type === 'market') return this.showMarketPanel();
    if (type === 'animals') return this.showAnimalsPanel();
    if (type === 'buildings') return this.showBuildingsPanel();
  }

  openSettingsPanel() {
    closeAllPanels();
    const html = `<div class="panel-header"><h3>Settings</h3></div>
      <div style="display:flex;align-items:center;gap:10px;margin-top:8px;">
        <label for="muteToggle">Mute sounds</label>
        <input type="checkbox" id="muteToggle" />
      </div>`;
    showPanel('panel-shop', html);
    const cb = document.getElementById('muteToggle');
    if (!cb) return;
    cb.checked = isMuted();
    cb.addEventListener('change', () => { setMuted(cb.checked); showToast(cb.checked ? 'Muted' : 'Sound on'); });
  }

  showInventoryPanel() {
    const ownedAnimalIds = this.state.animals.map(a => a.id);
    const seedRows = Object.values(ASSETS.crops).map(c => `
      <div class="inventory-tile">
        <span><strong>${c.icon}</strong> ${c.name}</span>
        <span class="meta">${this.state.seedInventory[c.id] || 0} seeds</span>
      </div>`).join('');
    const harvestRows = ASSETS.products.map(p => `
      <div class="inventory-tile">
        <span><strong>${p.icon}</strong> ${p.name}</span>
        <span class="meta">${this.state.harvestInventory[p.id] || 0} pcs</span>
      </div>`).join('');
    const buildingRows = BUILDINGS.map(b => `
      <div class="inventory-tile">
        <span><strong>${b.icon}</strong> ${b.name}</span>
        <span class="meta">${this.state.buildings.includes(b.id) ? 'Owned' : `Unlocks at Lv ${b.unlockLevel}`}</span>
      </div>`).join('');
    const animalRows = ANIMALS.map(a => `
      <div class="inventory-tile">
        <span><strong>${a.icon}</strong> ${a.name}</span>
        <span class="meta">${ownedAnimalIds.includes(a.id) ? 'Owned' : `Unlocks at Lv ${a.unlockLevel}`}</span>
      </div>`).join('');
    const inventoryHtml = `<div class="panel-header"><h3>Inventory</h3></div>
      <div class="inventory-card">
        <section class="inventory-section"><h4>Seeds</h4><div class="inventory-grid">${seedRows}</div></section>
        <section class="inventory-section"><h4>Harvest</h4><div class="inventory-grid">${harvestRows}</div></section>
        <section class="inventory-section"><h4>Buildings</h4><div class="inventory-grid">${buildingRows}</div></section>
        <section class="inventory-section"><h4>Animals</h4><div class="inventory-grid">${animalRows}</div></section>
      </div>`;
    showPanel('panel-inventory', inventoryHtml);
  }

  showMarketPanel() {
    const marketHtml = `<div class="panel-header"><h3>Seed Market</h3></div>
      <div class="shop-list">${Object.values(ASSETS.crops).map(c => {
        const locked = this.state.level < (c.unlockLevel || 1);
        const disabled = locked || this.state.coins < c.seedPrice;
        return `
          <div class="market-row ${locked ? 'locked' : ''}">
            <div class="label"><strong>${c.icon} ${c.name}</strong><span>${c.seedPrice}¢ per seed</span><span>${locked ? `Unlocks at Lv ${c.unlockLevel}` : ''}</span></div>
            <button ${disabled ? 'disabled' : ''} data-buy="${c.id}">${locked ? 'Locked' : 'Buy'}</button>
          </div>`;
      }).join('')}</div>`;
    showPanel('panel-shop', marketHtml);
    document.querySelectorAll('#panel-shop [data-buy]').forEach(btn => {
      btn.addEventListener('click', () => this.buySeed(btn.dataset.buy));
    });
  }

  showAnimalsPanel() {
    const ownedAnimals = this.state.animals || [];
    const ownedIds = ownedAnimals.map(a => a.id);
    const ownedRows = ownedAnimals.map(a => {
      const def = ANIMALS.find(d => d.id === a.id);
      const ready = a.storedProduct > 0;
      const timeLeft = Math.max(0, a.nextProductAt - Date.now());
      const minutes = Math.floor(timeLeft / 60000);
      const seconds = Math.floor((timeLeft % 60000) / 1000);
      const timerLabel = ready ? 'Ready to collect' : `Next in ${minutes > 0 ? `${minutes}m ` : ''}${seconds}s`;
      return `
        <div class="market-row">
          <div class="label"><strong>${def.icon} ${def.name}</strong><span>${def.description}</span><span>Stored ${a.storedProduct} ${def.productName}</span><span>${timerLabel}</span></div>
          <button ${!ready ? 'disabled' : ''} data-collect="${a.id}">Collect</button>
        </div>`;
    }).join('');
    const availableRows = ANIMALS.map(a => {
      const locked = this.state.level < a.unlockLevel || !this.state.buildings.includes(a.requirement);
      const owned = ownedIds.includes(a.id);
      const label = owned ? 'Owned' : locked ? `Unlocks at Lv ${a.unlockLevel}` : `${a.price}¢`;
      const disabled = locked || owned || this.state.coins < a.price;
      return `
        <div class="market-row ${locked ? 'locked' : ''}">
          <div class="label"><strong>${a.icon} ${a.name}</strong><span>${a.description}</span><span>${label}</span></div>
          <button ${disabled ? 'disabled' : ''} data-animal="${a.id}">${owned ? 'Owned' : 'Buy'}</button>
        </div>`;
    }).join('');
    const html = `<div class="panel-header"><h3>Animals</h3></div>
      <div class="shop-list">${ownedRows}${availableRows}</div>`;
    showPanel('panel-shop', html);
    document.querySelectorAll('#panel-shop [data-collect]').forEach(btn => {
      btn.addEventListener('click', () => this.collectAnimalProduct(btn.dataset.collect));
    });
    document.querySelectorAll('#panel-shop [data-animal]').forEach(btn => {
      btn.addEventListener('click', () => this.buyAnimal(btn.dataset.animal));
    });
  }

  showBuildingsPanel() {
    const rows = BUILDINGS.map(b => {
      const owned = this.state.buildings.includes(b.id);
      const locked = this.state.level < b.unlockLevel;
      const disabled = owned || locked || this.state.coins < b.price;
      return `
        <div class="market-row ${locked ? 'locked' : ''}">
          <div class="label"><strong>${b.icon} ${b.name}</strong><span>${b.description}</span><span>${owned ? 'Owned' : `Price ${b.price}¢`}</span></div>
          <button ${disabled ? 'disabled' : ''} data-building="${b.id}">${owned ? 'Owned' : locked ? 'Locked' : 'Buy'}</button>
        </div>`;
    }).join('');
    const html = `<div class="panel-header"><h3>Buildings</h3></div>
      <div class="shop-list">${rows}</div>`;
    showPanel('panel-shop', html);
    document.querySelectorAll('#panel-shop [data-building]').forEach(btn => {
      btn.addEventListener('click', () => this.buyBuilding(btn.dataset.building));
    });
  }

  buySeed(id) {
    const crop = ASSETS.crops[id];
    if (!crop) return;
    if (this.state.level < (crop.unlockLevel || 1)) { showToast('Crop locked until higher level', 1000); return; }
    if (this.state.coins < crop.seedPrice) { showToast('Not enough coins', 1000); return; }
    this.state.coins -= crop.seedPrice;
    this.state.seedInventory[id] = (this.state.seedInventory[id] || 0) + 1;
    this.save();
    showToast(`Bought 1 ${crop.name} seed`, 1000);
    this.render();
    this.showMarketPanel();
  }

  buyBuilding(id) {
    const building = BUILDINGS.find(b => b.id === id);
    if (!building) return;
    if (this.state.buildings.includes(id)) { showToast('Building already owned', 1000); return; }
    if (this.state.level < building.unlockLevel) { showToast('Building unlocked later', 1000); return; }
    if (this.state.coins < building.price) { showToast('Not enough coins', 1000); return; }
    this.state.coins -= building.price;
    this.state.buildings.push(id);
    this.save();
    showToast(`Purchased ${building.name}`, 1200);
    this.render();
    this.showBuildingsPanel();
  }

  buyAnimal(id) {
    const animal = ANIMALS.find(a => a.id === id);
    if (!animal) return;
    if (this.state.animals.some(a => a.id === id)) { showToast('Animal already owned', 1000); return; }
    if (this.state.level < animal.unlockLevel) { showToast('Animal unlocked later', 1000); return; }
    if (!this.state.buildings.includes(animal.requirement)) { showToast('Build a barn first', 1000); return; }
    if (this.state.coins < animal.price) { showToast('Not enough coins', 1000); return; }
    this.state.coins -= animal.price;
    this.state.animals.push({
      id: animal.id,
      acquiredAt: Date.now(),
      nextProductAt: Date.now() + (animal.produceTime * 1000),
      storedProduct: 0,
    });
    this.save();
    showToast(`Adopted ${animal.name}`, 1200);
    this.render();
    this.showAnimalsPanel();
  }

  renderCropPicker() {
    const root = document.getElementById('crop-selector');
    if (!root) return;
    root.innerHTML = Object.values(ASSETS.crops).map(c => {
      const locked = this.state.level < (c.unlockLevel || 1);
      const selected = this.state.selectedCrop === c.id;
      return `
        <button class="crop-card ${selected ? 'active' : ''} ${locked ? 'locked' : ''}" data-crop="${c.id}" ${locked ? 'disabled' : ''}>
          <div class="crop-icon">${c.icon}</div>
          <div class="crop-name">${c.name}</div>
          <div class="crop-meta">${this.state.seedInventory[c.id] || 0} seeds • ${c.unlockLevel ? `Lv ${c.unlockLevel}` : 'Available'}</div>
        </button>`;
    }).join('');
    root.querySelectorAll('[data-crop]').forEach(btn => btn.addEventListener('click', () => this.setSelectedCrop(btn.dataset.crop)));
  }

  setSelectedCrop(cropId) {
    const crop = ASSETS.crops[cropId];
    if (!crop) return;
    if (this.state.level < (crop.unlockLevel || 1)) { showToast(`Unlock ${crop.name} at Lv ${crop.unlockLevel}`, 1000); return; }
    this.state.selectedCrop = cropId;
    this.save();
    showToast(`${crop.name} selected`, 900);
    this.render();
  }

  onTileClick(tile) {
    const tool = this.state.selectedTool;
    if (tool === 'hoe') {
      if (tile.type === 'grass') {
        this.grid.setTile(tile.x, tile.y, { type: 'soil' });
        showToast('Tilled soil', 900);
        playBeep('click');
        this.render();
      } else {
        showToast('Can only hoe grass', 900);
      }
      return;
    }

    if (tool === 'plant') {
      if (tile.type !== 'soil') { showToast('Plant on tilled soil', 900); return; }
      if (tile.content && tile.content.crop) { showToast('Already planted', 900); return; }
      const cropId = this.state.selectedCrop;
      const cropDef = ASSETS.crops[cropId];
      if (!cropDef) { showToast('Select a crop first', 900); return; }
      if ((this.state.seedInventory[cropId] || 0) <= 0) { showToast('No seeds available', 1000); return; }
      tile.content = { crop: cropId, plantedAt: Date.now(), stage: 0 };
      this.state.seedInventory[cropId]--;
      this.grid.save();
      this.save();
      playBeep('click');
      showToast(`Planted ${cropDef.name}`, 1000);
      this.render();
      return;
    }

    if (tool === 'harvest') {
      if (tile.content && tile.content.crop) {
        const crop = tile.content;
        const growth = this.getCropGrowth(crop);
        if (growth.stage >= growth.maxStage) {
          const cropDef = ASSETS.crops[crop.crop];
          this.state.coins += cropDef.sellPrice;
          this.state.xp += 8;
          this.applyXp();
          this.state.harvestInventory[cropDef.id] = (this.state.harvestInventory[cropDef.id] || 0) + 1;
          tile.content = null;
          this.save();
          this.grid.save();
          showToast(`Harvested ${cropDef.name} +${cropDef.sellPrice}¢`, 1200);
          playBeep('coin');
          this.render();
        } else {
          showToast('Crop is not ready', 900);
        }
      } else {
        showToast('Nothing to harvest', 900);
      }
      return;
    }

    if (tool === 'water') {
      if (tile.content && tile.content.crop) {
        showToast('Watering helps growth', 900);
        playBeep('click');
      } else {
        showToast('No crop to water', 900);
      }
      return;
    }
  }

  getCropGrowth(crop) {
    const def = ASSETS.crops[crop.crop || crop];
    const planted = crop.plantedAt || 0;
    const elapsed = Math.max(0, (Date.now() - planted) / 1000);
    let total = def ? def.growTime : 30;
    if (this.state.buildings.includes('greenhouse')) {
      total = Math.max(8, total * 0.82);
    }
    const pct = Math.min(1, elapsed / total);
    const stage = Math.floor(pct * (def.stages - 1));
    return { pct, stage, maxStage: def.stages - 1 };
  }

  getAnimalDef(id) {
    return ANIMALS.find(a => a.id === id);
  }

  collectAnimalProduct(id) {
    const animal = this.state.animals.find(a => a.id === id);
    if (!animal) return;
    if (animal.storedProduct <= 0) { showToast('Nothing to collect yet', 1000); return; }
    const def = this.getAnimalDef(id);
    this.state.harvestInventory[def.productId] = (this.state.harvestInventory[def.productId] || 0) + animal.storedProduct;
    animal.storedProduct = 0;
    this.save();
    showToast(`Collected ${def.productName}`, 1100);
    this.render();
  }

  applyXp() {
    const oldLevel = this.state.level;
    this.state.level = Math.floor(this.state.xp / 100) + 1;
    if (this.state.level > oldLevel) {
      showToast(`Leveled up! Now Lv ${this.state.level}`, 1400);
    }
  }

  tick() {
    let changed = false;
    const now = Date.now();
    this.grid.tiles.forEach(t => {
      if (t.content && t.content.crop) {
        const g = this.getCropGrowth(t.content);
        if (g.stage !== t.content.stage) {
          t.content.stage = g.stage;
          changed = true;
        }
      }
    });
    this.state.animals.forEach(animal => {
      const def = this.getAnimalDef(animal.id);
      if (!def) return;
      if (now >= animal.nextProductAt) {
        animal.storedProduct = (animal.storedProduct || 0) + 1;
        animal.nextProductAt = now + (def.produceTime * 1000);
        changed = true;
      }
    });
    if (changed) {
      this.grid.save();
      this.save();
      this.render();
    }
  }

  getXpPct() { return Math.min(1, (this.state.xp % 100) / 100); }

  render() {
    this.renderCropPicker();
    renderGrid(this.grid, this.container, tile => this.onTileClick(tile));
    setTopbar(this.state.coins, this.state.level, this.getXpPct());
    this.updateToolbarState();
  }

  updateToolbarState() {
    document.querySelectorAll('.bottom-toolbar .tool').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tool === this.state.selectedTool);
    });
  }
}

window.addEventListener('load', () => { const g = new Game(); window.farmverse = g; });
