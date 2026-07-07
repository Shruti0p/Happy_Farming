const SAVE_KEY = 'farmverse-progress';
const PLOT_COUNT = 6;
const ANIMAL_SLOT_COUNT = 6;
const LEVEL_XP_STEP = 100;
const HAPPY_FEED_SPEED = 0.75;
const HAPPY_BONUS_XP = 10;

const crops = [
  { id: 'wheat', name: 'Wheat', icon: '🌾', seedPrice: 10, sellPrice: 12, growTime: 12000, xpReward: 20, unlockLevel: 1 },
  { id: 'corn', name: 'Corn', icon: '🌽', seedPrice: 25, sellPrice: 30, growTime: 18000, xpReward: 35, unlockLevel: 3 },
  { id: 'tomato', name: 'Tomato', icon: '🍅', seedPrice: 42, sellPrice: 50, growTime: 22000, xpReward: 50, unlockLevel: 5 },
  { id: 'potato', name: 'Potato', icon: '🥔', seedPrice: 60, sellPrice: 72, growTime: 26000, xpReward: 65, unlockLevel: 8 },
  { id: 'rice', name: 'Rice', icon: '🍚', seedPrice: 80, sellPrice: 96, growTime: 30000, xpReward: 85, unlockLevel: 10 },
  { id: 'cotton', name: 'Cotton', icon: '🧺', seedPrice: 110, sellPrice: 130, growTime: 35000, xpReward: 110, unlockLevel: 15 },
  { id: 'sugarcane', name: 'Sugarcane', icon: '🎋', seedPrice: 145, sellPrice: 175, growTime: 42000, xpReward: 145, unlockLevel: 20 },
];

const animals = [
  { id: 'chicken', name: 'Chicken', icon: '🐔', productId: 'eggs', productName: 'Eggs', productIcon: '🥚', buyPrice: 80, produceTime: 20000, xpReward: 45, unlockLevel: 3, feedItems: ['animalFeed'] },
  { id: 'goat', name: 'Goat', icon: '🦙', productId: 'goatMilk', productName: 'Goat Milk', productIcon: '🍼', buyPrice: 140, produceTime: 30000, xpReward: 70, unlockLevel: 5, feedItems: ['animalFeed'] },
  { id: 'cow', name: 'Cow', icon: '🐄', productId: 'milk', productName: 'Milk', productIcon: '🥛', buyPrice: 190, produceTime: 34000, xpReward: 85, unlockLevel: 8, feedItems: ['animalFeed'] },
  { id: 'pig', name: 'Pig', icon: '🐖', productId: 'truffle', productName: 'Truffle', productIcon: '🍄', buyPrice: 240, produceTime: 38000, xpReward: 100, unlockLevel: 12, feedItems: ['animalFeed'] },
  { id: 'sheep', name: 'Sheep', icon: '🐑', productId: 'wool', productName: 'Wool', productIcon: '🧶', buyPrice: 300, produceTime: 42000, xpReward: 120, unlockLevel: 15, feedItems: ['animalFeed'] },
  { id: 'duck', name: 'Duck', icon: '🦆', productId: 'duckEggs', productName: 'Duck Eggs', productIcon: '🪺', buyPrice: 340, produceTime: 44000, xpReward: 135, unlockLevel: 20, feedItems: ['animalFeed'] },
  { id: 'beeHouse', name: 'Bee House', icon: '🐝', productId: 'honey', productName: 'Honey', productIcon: '🍯', buyPrice: 420, produceTime: 48000, xpReward: 160, unlockLevel: 25, feedItems: ['animalFeed'] },
];

const buildings = [
  { id: 'barn', name: 'Barn', icon: '🏠', price: 60, unlockLevel: 2, description: 'Keeps your farm organized.', recipes: [] },
  { id: 'feedMill', name: 'Feed Mill', icon: '🌾', price: 120, unlockLevel: 4, description: 'Converts wheat into animal feed.', recipes: ['animalFeed'] },
  { id: 'dairy', name: 'Dairy', icon: '🧀', price: 180, unlockLevel: 6, description: 'Makes cheese from milk and goat milk.', recipes: ['cheese', 'goatCheese'] },
  { id: 'bakery', name: 'Bakery', icon: '🍞', price: 260, unlockLevel: 10, description: 'Bakes flour, bread, and cake.', recipes: ['flour', 'bread', 'cake'] },
  { id: 'textileWorkshop', name: 'Textile Workshop', icon: '🧵', price: 320, unlockLevel: 15, description: 'Turns cotton and wool into thread and cloth.', recipes: ['thread', 'cloth'] },
  { id: 'sugarMill', name: 'Sugar Mill', icon: '🍬', price: 380, unlockLevel: 20, description: 'Processes sugarcane into sugar.', recipes: ['sugar'] },
];

const processingRecipes = [
  { id: 'animalFeed', name: 'Animal Feed', icon: '🥣', building: 'feedMill', inputs: [{ item: 'wheat', qty: 1 }], output: { item: 'animalFeed', qty: 1 }, time: 15000, xpReward: 18 },
  { id: 'cheese', name: 'Cheese', icon: '🧀', building: 'dairy', inputs: [{ item: 'milk', qty: 1 }], output: { item: 'cheese', qty: 1 }, time: 20000, xpReward: 25 },
  { id: 'goatCheese', name: 'Goat Cheese', icon: '🧀', building: 'dairy', inputs: [{ item: 'goatMilk', qty: 1 }], output: { item: 'goatCheese', qty: 1 }, time: 22000, xpReward: 28 },
  { id: 'flour', name: 'Flour', icon: '🥣', building: 'bakery', inputs: [{ item: 'wheat', qty: 1 }], output: { item: 'flour', qty: 1 }, time: 16000, xpReward: 18 },
  { id: 'bread', name: 'Bread', icon: '🍞', building: 'bakery', inputs: [{ item: 'flour', qty: 1 }], output: { item: 'bread', qty: 1 }, time: 22000, xpReward: 32 },
  { id: 'cake', name: 'Cake', icon: '🎂', building: 'bakery', inputs: [{ item: 'eggs', qty: 1 }, { item: 'flour', qty: 1 }], output: { item: 'cake', qty: 1 }, time: 28000, xpReward: 45 },
  { id: 'thread', name: 'Thread', icon: '🧵', building: 'textileWorkshop', inputs: [{ item: 'cotton', qty: 1 }], output: { item: 'thread', qty: 1 }, time: 20000, xpReward: 30 },
  { id: 'cloth', name: 'Cloth', icon: '🧺', building: 'textileWorkshop', inputs: [{ item: 'wool', qty: 1 }], output: { item: 'cloth', qty: 1 }, time: 26000, xpReward: 42 },
  { id: 'sugar', name: 'Sugar', icon: '🍬', building: 'sugarMill', inputs: [{ item: 'sugarcane', qty: 1 }], output: { item: 'sugar', qty: 1 }, time: 18000, xpReward: 22 },
];

const processedProducts = [
  { id: 'animalFeed', name: 'Animal Feed', icon: '🥣', sellPrice: 18 },
  { id: 'cheese', name: 'Cheese', icon: '🧀', sellPrice: 55 },
  { id: 'goatCheese', name: 'Goat Cheese', icon: '🧀', sellPrice: 68 },
  { id: 'flour', name: 'Flour', icon: '🥣', sellPrice: 20 },
  { id: 'bread', name: 'Bread', icon: '🍞', sellPrice: 82 },
  { id: 'cake', name: 'Cake', icon: '🎂', sellPrice: 145 },
  { id: 'thread', name: 'Thread', icon: '🧵', sellPrice: 48 },
  { id: 'cloth', name: 'Cloth', icon: '🧺', sellPrice: 95 },
  { id: 'sugar', name: 'Sugar', icon: '🍬', sellPrice: 38 },
];

const cropMap = new Map(crops.map((crop) => [crop.id, crop]));
const animalMap = new Map(animals.map((animal) => [animal.id, animal]));
const recipeMap = new Map(processingRecipes.map((recipe) => [recipe.id, recipe]));
const productDefinitions = [
  ...crops.map((crop) => ({ id: crop.id, name: crop.name, icon: crop.icon, sellPrice: crop.sellPrice })),
  ...animals.map((animal) => ({ id: animal.productId, name: animal.productName, icon: animal.productIcon, sellPrice: Math.round(animal.buyPrice * 0.45) })),
  ...processedProducts,
];
const productMap = new Map(productDefinitions.map((item) => [item.id, item]));

const orderTemplates = [
  { title: 'Baker order', requirements: { bread: 1 }, rewardCoins: 90, rewardXP: 45 },
  { title: 'Farmer market', requirements: { wheat: 3 }, rewardCoins: 40, rewardXP: 20 },
  { title: 'Breakfast delivery', requirements: { eggs: 2, flour: 1 }, rewardCoins: 95, rewardXP: 40 },
  { title: 'Dairy crate', requirements: { cheese: 1 }, rewardCoins: 70, rewardXP: 35 },
  { title: 'Sweet request', requirements: { sugar: 1, bread: 1 }, rewardCoins: 110, rewardXP: 55 },
  { title: 'Textile order', requirements: { cloth: 1 }, rewardCoins: 105, rewardXP: 50 },
  { title: 'Gift bundle', requirements: { honey: 1, cake: 1 }, rewardCoins: 160, rewardXP: 75 },
];

const initialState = {
  coins: 100,
  xp: 0,
  level: 1,
  selectedCrop: 'wheat',
  seedInventory: crops.reduce((acc, crop) => ({ ...acc, [crop.id]: crop.id === 'wheat' ? 1 : 0 }), {}),
  harvestInventory: productDefinitions.reduce((acc, product) => ({ ...acc, [product.id]: 0 }), {}),
  plots: Array.from({ length: PLOT_COUNT }, () => ({ status: 'empty', cropId: null, plantedAt: null })),
  animalSlots: Array.from({ length: ANIMAL_SLOT_COUNT }, () => ({ animalId: null, acquiredAt: null, produceAt: null, fedAt: null, happyUntil: null, lastCollectedAt: null })),
  buildings: [],
  orders: [],
};

class Player {
  constructor(state) {
    this.state = state;
    this.lastLevel = state.level;
  }

  get coins() {
    return this.state.coins;
  }

  set coins(value) {
    this.state.coins = Math.max(0, value);
  }

  get xp() {
    return this.state.xp;
  }

  set xp(value) {
    this.state.xp = Math.max(0, value);
    this.updateLevel();
  }

  get level() {
    return this.state.level;
  }

  updateLevel() {
    const nextLevel = Math.floor(this.state.xp / LEVEL_XP_STEP) + 1;
    this.state.level = Math.max(1, nextLevel);
  }

  addCoins(amount) {
    this.coins += amount;
  }

  addXP(amount) {
    this.xp += amount;
    const leveledUp = this.state.level > this.lastLevel;
    this.lastLevel = this.state.level;
    return leveledUp;
  }
}

class CropPlot {
  constructor(index, data, cropMap, onStateChanged) {
    this.index = index;
    this.data = data;
    this.cropMap = cropMap;
    this.onStateChanged = onStateChanged;
    this.element = this.createPlotCard();
    this.timer = null;
    this.updateUI();
  }

  createPlotCard() {
    const card = document.createElement('button');
    card.className = 'plot-card';
    card.dataset.index = this.index;
    card.type = 'button';
    card.innerHTML = `
      <div class="crop-icon"></div>
      <div class="plot-ground"></div>
      <div class="plot-label"></div>
      <div class="progress-ring"></div>
    `;
    card.addEventListener('click', () => this.handleClick());
    return card;
  }

  get cropDefinition() {
    return this.data.cropId ? this.cropMap.get(this.data.cropId) : null;
  }

  get isEmpty() {
    return this.data.status === 'empty';
  }

  get isGrowing() {
    return this.data.status === 'growing';
  }

  get isReady() {
    return this.data.status === 'ready';
  }

  get growTime() {
    return this.cropDefinition?.growTime || 0;
  }

  get timeLeft() {
    if (!this.data.plantedAt || !this.cropDefinition) return 0;
    const elapsed = Date.now() - this.data.plantedAt;
    return Math.max(0, this.growTime - elapsed);
  }

  get progressPercent() {
    if (!this.cropDefinition) return 0;
    return Math.min(100, ((this.growTime - this.timeLeft) / this.growTime) * 100);
  }

  get growthStage() {
    if (!this.isGrowing) return '';
    const ratio = 1 - this.timeLeft / this.growTime;
    if (ratio < 0.33) return 'Seedling';
    if (ratio < 0.75) return 'Growing';
    return 'Ripening';
  }

  handleClick() {
    if (this.isEmpty) {
      this.onStateChanged('plant', this.index);
    } else if (this.isReady) {
      this.onStateChanged('harvest', this.index);
    }
  }

  plant(cropId) {
    this.data.status = 'growing';
    this.data.cropId = cropId;
    this.data.plantedAt = Date.now();
    this.startTimer();
    this.updateUI();
  }

  harvest() {
    const cropId = this.data.cropId;
    this.data.status = 'empty';
    this.data.plantedAt = null;
    this.data.cropId = null;
    clearInterval(this.timer);
    this.timer = null;
    this.updateUI();
    return cropId;
  }

  startTimer() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      if (this.isGrowing && this.timeLeft <= 0) {
        this.data.status = 'ready';
        clearInterval(this.timer);
        this.timer = null;
      }
      this.updateUI();
    }, 250);
  }

  hydrateTimer() {
    if (this.isGrowing) {
      if (this.timeLeft <= 0) {
        this.data.status = 'ready';
        this.data.plantedAt = null;
      } else {
        this.startTimer();
      }
    }
    this.updateUI();
  }

  updateUI() {
    const icon = this.element.querySelector('.crop-icon');
    const label = this.element.querySelector('.plot-label');
    const ring = this.element.querySelector('.progress-ring');

    if (this.isEmpty) {
      icon.textContent = '🌱';
      label.textContent = 'Empty plot';
      ring.textContent = 'Plant';
      this.element.style.background = 'radial-gradient(circle at top, #e3ffde 0%, #c4eeb3 35%, #8dc764 100%)';
      this.element.title = 'Empty plot — click to plant your selected seed.';
    } else if (this.isGrowing) {
      icon.textContent = this.cropDefinition.icon;
      label.textContent = `${this.growthStage} ${this.cropDefinition.name}`;
      ring.textContent = `${Math.ceil(this.progressPercent)}%`;
      this.element.style.background = 'radial-gradient(circle at top, #fff9c4 0%, #d9f2a2 45%, #8dc764 100%)';
      this.element.title = `${this.cropDefinition.name} is growing. Ready in ${Math.ceil(this.timeLeft / 1000)}s.`;
    } else {
      icon.textContent = this.cropDefinition.icon;
      label.textContent = `${this.cropDefinition.name} ready`;
      ring.textContent = 'Harvest';
      this.element.style.background = 'radial-gradient(circle at top, #ffe6a8 0%, #f5d684 45%, #8dc764 100%)';
      this.element.title = `${this.cropDefinition.name} is ready to harvest.`;
    }
  }
}

class AnimalSlot {
  constructor(index, data, animalMap, onAction) {
    this.index = index;
    this.data = data;
    this.animalMap = animalMap;
    this.onAction = onAction;
    this.element = this.createAnimalCard();
    this.timer = null;
    this.updateUI();
  }

  createAnimalCard() {
    const card = document.createElement('div');
    card.className = 'animal-card';
    card.innerHTML = `
      <div class="animal-icon"></div>
      <div class="animal-title"><div></div><div class="animal-status"></div></div>
      <div class="animal-actions"></div>
    `;
    return card;
  }

  get animalDefinition() {
    return this.data.animalId ? this.animalMap.get(this.data.animalId) : null;
  }

  get isEmpty() {
    return !this.data.animalId;
  }

  get hasProduct() {
    return this.data.produceAt && Date.now() >= this.data.produceAt;
  }

  get isProducing() {
    return this.data.animalId && !this.hasProduct;
  }

  get timeLeft() {
    if (!this.data.produceAt) return 0;
    return Math.max(0, this.data.produceAt - Date.now());
  }

  get progressPercent() {
    if (!this.data.produceAt || !this.animalDefinition) return 0;
    const total = this.animalDefinition.produceTime;
    const elapsed = Math.min(total, total - this.timeLeft);
    return Math.min(100, (elapsed / total) * 100);
  }

  get isHappy() {
    return this.data.happyUntil && Date.now() < this.data.happyUntil;
  }

  get feedOptions() {
    return this.animalDefinition?.feedItems || [];
  }

  get feedHint() {
    if (!this.animalDefinition) return '';
    return `Feed with ${this.feedOptions.join(' or ')}`;
  }

  collectProduct() {
    if (!this.hasProduct) return;
    this.onAction('collect', this.index);
  }

  feedAnimal() {
    this.onAction('feed', this.index);
  }

  updateUI() {
    const icon = this.element.querySelector('.animal-icon');
    const title = this.element.querySelector('.animal-title > div');
    const status = this.element.querySelector('.animal-status');
    const actions = this.element.querySelector('.animal-actions');

    actions.innerHTML = '';

    if (this.isEmpty) {
      icon.textContent = '➕';
      title.textContent = 'Empty stall';
      status.textContent = 'Buy an animal to fill this stall.';
      return;
    }

    const animal = this.animalDefinition;
    icon.textContent = animal.icon;
    title.textContent = animal.name;

    if (this.hasProduct) {
      status.textContent = `${animal.productName} ready`; 
      const collectButton = document.createElement('button');
      collectButton.textContent = 'Collect';
      collectButton.addEventListener('click', () => this.collectProduct());
      actions.appendChild(collectButton);
    } else {
      status.textContent = `Producing ${animal.productName} — ${Math.ceil(this.timeLeft / 1000)}s`; 
    }

    const feedButton = document.createElement('button');
    feedButton.textContent = 'Feed';
    feedButton.title = this.feedHint;
    feedButton.addEventListener('click', () => this.feedAnimal());
    actions.appendChild(feedButton);

    this.element.querySelectorAll('.happy-label').forEach((label) => label.remove());
    if (this.isHappy) {
      const happyLabel = document.createElement('small');
      happyLabel.className = 'happy-label';
      happyLabel.textContent = 'Happy! Faster production.';
      happyLabel.style.color = '#2e7d32';
      this.element.appendChild(happyLabel);
    }
  }
}

class FarmGame {
  constructor() {
    this.state = this.loadState();
    this.player = new Player(this.state);
    this.plotElements = [];
    this.animalElements = [];
    this.farmGrid = document.getElementById('farmGrid');
    this.animalGrid = document.getElementById('animalGrid');
    this.coinsValue = document.getElementById('coinsValue');
    this.xpValue = document.getElementById('xpValue');
    this.levelValue = document.getElementById('levelValue');
    this.storageValue = document.getElementById('storageValue');
    this.unlockedCropsElement = document.getElementById('unlockedCrops');
    this.shopList = document.getElementById('shopList');
    this.animalShopList = document.getElementById('animalShopList');
    this.seedInventory = document.getElementById('seedInventory');
    this.productInventory = document.getElementById('productInventory');
    this.marketList = document.getElementById('marketList');
    this.buildingShopList = document.getElementById('buildingShopList');
    this.buildingArea = document.getElementById('buildingArea');
    this.orderBoard = document.getElementById('orderBoard');
    this.toast = document.getElementById('toast');
    this.resetButton = document.getElementById('resetButton');

    this.initPlots();
    this.initAnimals();
    this.initBuildings();
    this.ensureOrders();
    this.bindEvents();
    this.refreshUI();
    this.saveState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (!saved) return JSON.parse(JSON.stringify(initialState));
      const data = JSON.parse(saved);
      const merged = { ...initialState, ...data };
      merged.seedInventory = { ...initialState.seedInventory, ...merged.seedInventory };
      merged.harvestInventory = { ...initialState.harvestInventory, ...merged.harvestInventory };
      merged.plots = merged.plots ? merged.plots.slice(0, PLOT_COUNT) : [];
      while (merged.plots.length < PLOT_COUNT) {
        merged.plots.push({ status: 'empty', cropId: null, plantedAt: null });
      }
      merged.animalSlots = merged.animalSlots ? merged.animalSlots.slice(0, ANIMAL_SLOT_COUNT) : [];
      while (merged.animalSlots.length < ANIMAL_SLOT_COUNT) {
        merged.animalSlots.push({ animalId: null, acquiredAt: null, produceAt: null, fedAt: null, happyUntil: null, lastCollectedAt: null });
      }
      merged.buildings = Array.isArray(merged.buildings) ? merged.buildings : [];
      merged.orders = Array.isArray(merged.orders) ? merged.orders : [];
      merged.selectedCrop = merged.selectedCrop || 'wheat';
      return merged;
    } catch (error) {
      console.warn('Failed to load FarmVerse progress, resetting state.', error);
      return JSON.parse(JSON.stringify(initialState));
    }
  }

  saveState() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
  }

  initPlots() {
    this.farmGrid.innerHTML = '';
    this.plotElements = [];
    this.state.plots.forEach((plotData, index) => {
      const plot = new CropPlot(index, plotData, cropMap, (action, plotIndex) => this.handlePlotAction(action, plotIndex));
      this.farmGrid.appendChild(plot.element);
      this.plotElements.push(plot);
      plot.hydrateTimer();
    });
  }

  initAnimals() {
    this.animalGrid.innerHTML = '';
    this.animalElements = [];
    this.state.animalSlots.forEach((animalData, index) => {
      const slot = new AnimalSlot(index, animalData, animalMap, (action, slotIndex) => this.handleAnimalAction(action, slotIndex));
      this.animalGrid.appendChild(slot.element);
      this.animalElements.push(slot);
      this.hydrateAnimalTimer(slot);
    });
  }

  initBuildings() {
    this.buildingArea.innerHTML = '';
    this.state.buildings.forEach((buildingData, index) => {
      const card = this.createBuildingCard(buildingData, index);
      this.buildingArea.appendChild(card);
      this.hydrateBuildingTimer(card, buildingData);
    });
  }

  ensureOrders() {
    if (!this.state.orders || this.state.orders.length === 0) {
      this.state.orders = this.createOrders(3);
    }
  }

  get selectedCrop() {
    return this.state.selectedCrop;
  }

  set selectedCrop(value) {
    this.state.selectedCrop = value;
  }

  get unlockedCrops() {
    return crops.filter((crop) => this.player.level >= crop.unlockLevel);
  }

  handlePlotAction(action, index) {
    if (action === 'plant') {
      this.plantCrop(index);
    }

    if (action === 'harvest') {
      this.harvestCrop(index);
    }

    this.refreshUI();
    this.saveState();
  }

  plantCrop(index) {
    const plot = this.plotElements[index];
    if (!plot.isEmpty) return;

    const cropId = this.selectedCrop;
    const crop = cropMap.get(cropId);
    if (!crop) {
      this.showToast('Select a seed from the shop.');
      return;
    }

    if (this.player.level < crop.unlockLevel) {
      this.showToast(`${crop.name} unlocks at level ${crop.unlockLevel}.`);
      return;
    }

    if ((this.state.seedInventory[cropId] || 0) <= 0) {
      this.showToast(`Buy ${crop.name} seeds before planting.`);
      return;
    }

    this.state.seedInventory[cropId] -= 1;
    plot.plant(cropId);
    this.showToast(`${crop.name} planted.`);
  }

  harvestCrop(index) {
    const plot = this.plotElements[index];
    if (!plot.isReady) return;

    const cropId = plot.harvest();
    const crop = cropMap.get(cropId);
    const currentValue = this.state.harvestInventory[cropId] || 0;
    this.state.harvestInventory[cropId] = currentValue + 1;
    const leveledUp = this.player.addXP(crop.xpReward);
    this.showToast(`${crop.name} harvested. +${crop.xpReward} XP`);
    if (leveledUp) {
      this.showToast(`Level up! You reached level ${this.player.level}.`);
    }
  }

  buySeed(cropId) {
    const crop = cropMap.get(cropId);
    if (!crop) return;

    if (this.player.level < crop.unlockLevel) {
      this.showToast(`${crop.name} unlocks at level ${crop.unlockLevel}.`);
      return;
    }

    if (this.player.coins < crop.seedPrice) {
      this.showToast('Not enough coins to buy seeds.');
      return;
    }

    this.player.addCoins(-crop.seedPrice);
    this.state.seedInventory[cropId] = (this.state.seedInventory[cropId] || 0) + 1;
    this.selectedCrop = cropId;
    this.showToast(`${crop.name} seeds purchased.`);
    this.refreshUI();
    this.saveState();
  }

  selectSeed(cropId) {
    const crop = cropMap.get(cropId);
    if (!crop) return;

    if (this.player.level < crop.unlockLevel) {
      this.showToast(`${crop.name} unlocks at level ${crop.unlockLevel}.`);
      return;
    }

    this.selectedCrop = cropId;
    this.refreshUI();
  }

  sellCrop(itemId) {
    const item = productMap.get(itemId);
    if (!item) return;

    const amount = this.state.harvestInventory[itemId] || 0;
    if (amount <= 0) return;

    this.state.harvestInventory[itemId] -= 1;
    this.player.addCoins(item.sellPrice);
    this.showToast(`${item.name} sold for ${item.sellPrice} coins.`);
    this.refreshUI();
    this.saveState();
  }

  buyAnimal(animalId) {
    const animal = animalMap.get(animalId);
    if (!animal) return;

    if (this.player.level < animal.unlockLevel) {
      this.showToast(`${animal.name} unlocks at level ${animal.unlockLevel}.`);
      return;
    }

    const freeSlotIndex = this.state.animalSlots.findIndex((slot) => !slot.animalId);
    if (freeSlotIndex === -1) {
      this.showToast('No free animal stalls available.');
      return;
    }

    if (this.player.coins < animal.buyPrice) {
      this.showToast('Not enough coins to buy this animal.');
      return;
    }

    this.player.addCoins(-animal.buyPrice);
    const slot = this.state.animalSlots[freeSlotIndex];
    const now = Date.now();
    slot.animalId = animal.id;
    slot.acquiredAt = now;
    slot.produceAt = now + animal.produceTime;
    slot.fedAt = null;
    slot.happyUntil = null;
    slot.lastCollectedAt = null;
    this.animalElements[freeSlotIndex].updateUI();
    this.showToast(`${animal.name} purchased!`);
    this.refreshUI();
    this.saveState();
  }

  handleAnimalAction(action, slotIndex) {
    if (action === 'collect') {
      this.collectAnimalProduct(slotIndex);
    }
    if (action === 'feed') {
      this.feedAnimal(slotIndex);
    }
    this.refreshUI();
    this.saveState();
  }

  collectAnimalProduct(slotIndex) {
    const slot = this.state.animalSlots[slotIndex];
    const animal = animalMap.get(slot.animalId);
    if (!animal || !slot.produceAt || Date.now() < slot.produceAt) return;

    const productId = animal.productId;
    this.state.harvestInventory[productId] = (this.state.harvestInventory[productId] || 0) + 1;
    const bonusXP = slot.happyUntil && Date.now() < slot.happyUntil ? HAPPY_BONUS_XP : 0;
    const xpGain = animal.xpReward + bonusXP;
    const leveledUp = this.player.addXP(xpGain);
    this.showToast(`${animal.productName} collected. +${xpGain} XP`);
    if (leveledUp) {
      this.showToast(`Level up! You reached level ${this.player.level}.`);
    }

    const now = Date.now();
    const speedFactor = slot.happyUntil && now < slot.happyUntil ? HAPPY_FEED_SPEED : 1;
    slot.produceAt = now + Math.round(animal.produceTime * speedFactor);
    slot.lastCollectedAt = now;
    slot.fedAt = null;
  }

  feedAnimal(slotIndex) {
    const slot = this.state.animalSlots[slotIndex];
    const animal = animalMap.get(slot.animalId);
    if (!animal) {
      this.showToast('No animal in this stall to feed.');
      return;
    }

    const foodType = animal.feedItems.find((item) => (this.state.harvestInventory[item] || 0) > 0);
    if (!foodType) {
      this.showToast(`You need ${animal.feedItems.join(' or ')} to feed this animal.`);
      return;
    }

    this.state.harvestInventory[foodType] -= 1;
    const now = Date.now();
    slot.fedAt = now;
    slot.happyUntil = now + 30000;
    if (slot.produceAt && Date.now() < slot.produceAt) {
      const remaining = slot.produceAt - Date.now();
      slot.produceAt = Date.now() + Math.max(1000, Math.round(remaining * HAPPY_FEED_SPEED));
    }

    this.showToast(`${animal.name} fed with ${foodType}. It feels happy!`);
    this.animalElements[slotIndex].updateUI();
  }

  hydrateAnimalTimer(slot) {
    if (!slot.data.animalId || !slot.data.produceAt) return;
    const update = () => {
      if (slot.hasProduct) {
        clearInterval(slot.timer);
        slot.timer = null;
        slot.updateUI();
        return;
      }
      slot.updateUI();
    };
    if (!slot.timer) {
      slot.timer = setInterval(update, 250);
    }
  }

  refreshUI() {
    this.coinsValue.textContent = this.player.coins;
    this.xpValue.textContent = this.player.xp;
    this.levelValue.textContent = this.player.level;
    this.storageValue.textContent = `Seeds: ${Object.values(this.state.seedInventory).reduce((sum, qty) => sum + qty, 0)} | Products: ${Object.values(this.state.harvestInventory).reduce((sum, qty) => sum + qty, 0)}`;
    this.plotElements.forEach((plot) => plot.updateUI());
    this.animalElements.forEach((slot) => slot.updateUI());
    this.buildShop();
    this.buildAnimalShop();
    this.buildBuildingShop();
    this.buildBuildingArea();
    this.buildInventory();
    this.buildMarket();
    this.buildOrderBoard();
    this.buildCropSummary();
  }

  buildShop() {
    this.shopList.innerHTML = '';

    crops.forEach((crop) => {
      const unlocked = this.player.level >= crop.unlockLevel;
      const item = document.createElement('div');
      item.className = `shop-item${this.selectedCrop === crop.id ? ' selected' : ''}${!unlocked ? ' locked' : ''}`;
      item.innerHTML = `
        <div class="label">
          <span>${crop.icon} ${crop.name}</span>
          <small class="meta">Seed: ${crop.seedPrice} coins • Sell: ${crop.sellPrice} coins</small>
          <small class="meta">Grow: ${Math.round(crop.growTime / 1000)}s • XP: ${crop.xpReward}</small>
        </div>
        <div class="meta">
          <button type="button" ${!unlocked ? 'disabled' : ''}>Buy</button>
        </div>
      `;

      item.addEventListener('click', (event) => {
        if (!unlocked) return;
        if (event.target.tagName.toLowerCase() === 'button') {
          this.buySeed(crop.id);
          return;
        }
        this.selectSeed(crop.id);
      });

      if (!unlocked) {
        const lockLabel = document.createElement('small');
        lockLabel.textContent = `Unlocks at level ${crop.unlockLevel}`;
        lockLabel.style.display = 'block';
        lockLabel.style.marginTop = '8px';
        lockLabel.style.color = '#7b8f9a';
        item.querySelector('.label').appendChild(lockLabel);
      }

      this.shopList.appendChild(item);
    });
  }

  buildAnimalShop() {
    this.animalShopList.innerHTML = '';

    animals.forEach((animal) => {
      const unlocked = this.player.level >= animal.unlockLevel;
      const hasSlot = this.state.animalSlots.some((slot) => !slot.animalId);
      const affordable = this.player.coins >= animal.buyPrice;
      const item = document.createElement('div');
      item.className = `shop-item${!unlocked ? ' locked' : ''}`;
      item.innerHTML = `
        <div class="label">
          <span>${animal.icon} ${animal.name}</span>
          <small class="meta">Buy: ${animal.buyPrice} coins</small>
          <small class="meta">Produces: ${animal.productIcon} ${animal.productName}</small>
        </div>
        <div class="meta">
          <button type="button" ${!unlocked || !hasSlot || !affordable ? 'disabled' : ''}>Buy</button>
        </div>
      `;

      item.addEventListener('click', (event) => {
        if (!unlocked || !hasSlot || !affordable) return;
        if (event.target.tagName.toLowerCase() === 'button') {
          this.buyAnimal(animal.id);
        }
      });

      if (!unlocked) {
        const lockLabel = document.createElement('small');
        lockLabel.textContent = `Unlocks at level ${animal.unlockLevel}`;
        lockLabel.style.display = 'block';
        lockLabel.style.marginTop = '8px';
        lockLabel.style.color = '#7b8f9a';
        item.querySelector('.label').appendChild(lockLabel);
      }

      if (!hasSlot && unlocked) {
        const slotLabel = document.createElement('small');
        slotLabel.textContent = 'No free stalls';
        slotLabel.style.display = 'block';
        slotLabel.style.marginTop = '8px';
        slotLabel.style.color = '#aa5511';
        item.querySelector('.label').appendChild(slotLabel);
      }

      this.animalShopList.appendChild(item);
    });
  }

  buildBuildingShop() {
    this.buildingShopList.innerHTML = '';

    buildings.forEach((building) => {
      const unlocked = this.player.level >= building.unlockLevel;
      const owned = this.state.buildings.some((ownedBuilding) => ownedBuilding.buildingId === building.id);
      const affordable = this.player.coins >= building.price;
      const item = document.createElement('div');
      item.className = `shop-item${!unlocked ? ' locked' : ''}`;
      item.innerHTML = `
        <div class="label">
          <span>${building.icon} ${building.name}</span>
          <small class="meta">Price: ${building.price} coins</small>
          <small class="meta">${building.description}</small>
        </div>
        <div class="meta">
          <button type="button" ${!unlocked || owned || !affordable ? 'disabled' : ''}>Buy</button>
        </div>
      `;

      item.querySelector('button').addEventListener('click', () => this.purchaseBuilding(building.id));

      if (!unlocked) {
        const lockLabel = document.createElement('small');
        lockLabel.textContent = `Unlocks at level ${building.unlockLevel}`;
        lockLabel.style.display = 'block';
        lockLabel.style.marginTop = '8px';
        lockLabel.style.color = '#7b8f9a';
        item.querySelector('.label').appendChild(lockLabel);
      }

      if (owned) {
        const ownedLabel = document.createElement('small');
        ownedLabel.textContent = 'Owned';
        ownedLabel.style.display = 'block';
        ownedLabel.style.marginTop = '8px';
        ownedLabel.style.color = '#2e7d32';
        item.querySelector('.label').appendChild(ownedLabel);
      }

      this.buildingShopList.appendChild(item);
    });
  }

  createBuildingCard(buildingData, index) {
    const building = buildings.find((b) => b.id === buildingData.buildingId);
    const card = document.createElement('div');
    card.className = 'building-card';
    card.dataset.index = index;
    card.innerHTML = `
      <div class="building-title">
        <strong>${building.icon} ${building.name}</strong>
        <span class="building-meta">${buildingData.activeRecipeId ? 'Busy' : 'Ready'}</span>
      </div>
      <div class="building-meta">${building.description}</div>
      <div class="recipe-actions"></div>
    `;

    const actions = card.querySelector('.recipe-actions');
    if (!buildingData.activeRecipeId) {
      const availableRecipes = processingRecipes.filter((recipe) => recipe.building === building.id);
      if (availableRecipes.length === 0) {
        const noRecipe = document.createElement('div');
        noRecipe.textContent = 'No recipes available yet.';
        actions.appendChild(noRecipe);
      }
      availableRecipes.forEach((recipe) => {
        const button = document.createElement('button');
        const requirementText = recipe.inputs.map((input) => `${input.qty} ${productMap.get(input.item).name}`).join(', ');
        button.textContent = `Make ${recipe.name}`;
        button.addEventListener('click', () => this.startRecipe(index, recipe.id));
        actions.appendChild(button);
      });
    } else {
      const recipe = recipeMap.get(buildingData.activeRecipeId);
      const status = document.createElement('div');
      status.className = 'building-meta';
      if (Date.now() >= buildingData.finishAt) {
        status.textContent = `${recipe.name} finished — collect now.`;
        const collectButton = document.createElement('button');
        collectButton.textContent = `Collect ${recipe.output.qty}`;
        collectButton.addEventListener('click', () => this.collectBuildingProduct(index));
        actions.appendChild(collectButton);
      } else {
        status.textContent = `Processing ${recipe.name} — ${Math.ceil((buildingData.finishAt - Date.now()) / 1000)}s`;
        actions.appendChild(status);
      }
    }

    return card;
  }

  buildBuildingArea() {
    this.buildingArea.innerHTML = '';
    this.state.buildings.forEach((buildingData, index) => {
      const card = this.createBuildingCard(buildingData, index);
      this.buildingArea.appendChild(card);
      this.hydrateBuildingTimer(card, buildingData);
    });
  }

  buildOrderBoard() {
    this.orderBoard.innerHTML = '';
    this.state.orders.forEach((order, index) => {
      const card = document.createElement('div');
      card.className = 'order-card';
      const items = Object.entries(order.requirements).map(([itemId, qty]) => {
        const item = productMap.get(itemId) || { name: itemId, icon: '❓' };
        return `<div>${item.icon} ${item.name}: ${qty}</div>`;
      }).join('');
      card.innerHTML = `
        <div class="order-title">
          <strong>${order.title}</strong>
          <span class="order-meta">Reward ${order.rewardCoins} coins</span>
        </div>
        <div class="order-items">${items}</div>
        <div class="order-actions"></div>
      `;
      const button = document.createElement('button');
      button.textContent = 'Complete';
      button.disabled = !this.canCompleteOrder(order);
      button.addEventListener('click', () => this.completeOrder(index));
      card.querySelector('.order-actions').appendChild(button);
      this.orderBoard.appendChild(card);
    });
  }

  purchaseBuilding(buildingId) {
    const building = buildings.find((b) => b.id === buildingId);
    if (!building) return;
    if (this.player.level < building.unlockLevel) {
      this.showToast(`${building.name} unlocks at level ${building.unlockLevel}.`);
      return;
    }
    if (this.player.coins < building.price) {
      this.showToast('Not enough coins to buy this building.');
      return;
    }
    if (this.state.buildings.some((owned) => owned.buildingId === building.id)) {
      this.showToast('You already own this building.');
      return;
    }
    this.player.addCoins(-building.price);
    this.state.buildings.push({ buildingId: building.id, acquiredAt: Date.now(), activeRecipeId: null, startAt: null, finishAt: null });
    this.showToast(`${building.name} built!`);
    this.refreshUI();
    this.saveState();
  }

  startRecipe(buildingIndex, recipeId) {
    const slot = this.state.buildings[buildingIndex];
    const recipe = recipeMap.get(recipeId);
    if (!slot || !recipe) return;
    if (slot.activeRecipeId) {
      this.showToast('This building is already processing.');
      return;
    }
    if (!this.hasRequiredItems(recipe.inputs)) {
      this.showToast('Missing ingredients for that recipe.');
      return;
    }
    this.removeRecipeInputs(recipe.inputs);
    const now = Date.now();
    slot.activeRecipeId = recipe.id;
    slot.startAt = now;
    slot.finishAt = now + recipe.time;
    this.showToast(`${recipe.name} started.`);
    this.refreshUI();
    this.saveState();
  }

  collectBuildingProduct(buildingIndex) {
    const slot = this.state.buildings[buildingIndex];
    const recipe = recipeMap.get(slot.activeRecipeId);
    if (!slot || !recipe || Date.now() < slot.finishAt) return;
    const outputItem = recipe.output.item;
    this.state.harvestInventory[outputItem] = (this.state.harvestInventory[outputItem] || 0) + recipe.output.qty;
    const leveledUp = this.player.addXP(recipe.xpReward);
    const outputName = productMap.get(outputItem)?.name || outputItem;
    this.showToast(`${recipe.output.qty} x ${outputName} collected.`);
    if (leveledUp) this.showToast(`Level up! You reached level ${this.player.level}.`);
    slot.activeRecipeId = null;
    slot.startAt = null;
    slot.finishAt = null;
    this.refreshUI();
    this.saveState();
  }

  hydrateBuildingTimer(card, buildingData) {
    if (!buildingData.activeRecipeId || !buildingData.finishAt) return;
    const update = () => {
      const recipe = recipeMap.get(buildingData.activeRecipeId);
      if (!recipe) return;
      if (Date.now() >= buildingData.finishAt) {
        clearInterval(card._buildingTimer);
        card._buildingTimer = null;
        this.refreshUI();
        return;
      }
    };
    if (!card._buildingTimer) {
      card._buildingTimer = setInterval(update, 250);
    }
  }

  createOrders(count) {
    const orders = [];
    for (let i = 0; i < count; i += 1) {
      const template = orderTemplates[Math.floor(Math.random() * orderTemplates.length)];
      orders.push({ ...template, id: `${template.title}-${Date.now()}-${i}` });
    }
    return orders;
  }

  canCompleteOrder(order) {
    return Object.entries(order.requirements).every(([itemId, qty]) => (this.state.harvestInventory[itemId] || 0) >= qty);
  }

  completeOrder(orderIndex) {
    const order = this.state.orders[orderIndex];
    if (!order || !this.canCompleteOrder(order)) return;
    Object.entries(order.requirements).forEach(([itemId, qty]) => {
      this.state.harvestInventory[itemId] -= qty;
    });
    this.player.addCoins(order.rewardCoins);
    const leveledUp = this.player.addXP(order.rewardXP);
    this.showToast(`${order.title} completed! +${order.rewardCoins} coins.`);
    if (leveledUp) this.showToast(`Level up! You reached level ${this.player.level}.`);
    this.state.orders[orderIndex] = this.createOrders(1)[0];
    this.refreshUI();
    this.saveState();
  }

  hasRequiredItems(inputs) {
    return inputs.every((input) => (this.state.harvestInventory[input.item] || 0) >= input.qty);
  }

  removeRecipeInputs(inputs) {
    inputs.forEach((input) => {
      this.state.harvestInventory[input.item] -= input.qty;
    });
  }

  buildInventory() {
    this.seedInventory.innerHTML = '';
    this.productInventory.innerHTML = '';

    crops.forEach((crop) => {
      const seedTile = document.createElement('div');
      seedTile.className = 'inventory-tile';
      seedTile.innerHTML = `<span>${crop.icon} ${crop.name}</span><span class="meta">${this.state.seedInventory[crop.id] || 0}</span>`;
      this.seedInventory.appendChild(seedTile);
    });

    productDefinitions.forEach((item) => {
      const tile = document.createElement('div');
      tile.className = 'inventory-tile';
      tile.innerHTML = `<span>${item.icon} ${item.name}</span><span class="meta">${this.state.harvestInventory[item.id] || 0}</span>`;
      this.productInventory.appendChild(tile);
    });
  }

  buildMarket() {
    this.marketList.innerHTML = '';

    productDefinitions.forEach((item) => {
      const canSell = (this.state.harvestInventory[item.id] || 0) > 0;
      const row = document.createElement('div');
      row.className = 'market-row';
      row.innerHTML = `
        <div class="label">
          <span>${item.icon} ${item.name}</span>
          <small class="meta">Qty: ${this.state.harvestInventory[item.id] || 0}</small>
        </div>
        <div class="meta">
          <button type="button" ${!canSell ? 'disabled' : ''}>Sell ${item.sellPrice}</button>
        </div>
      `;

      row.querySelector('button').addEventListener('click', () => this.sellCrop(item.id));
      this.marketList.appendChild(row);
    });
  }

  buildCropSummary() {
    const cropText = this.unlockedCrops.map((crop) => crop.icon + ' ' + crop.name).join(', ');
    const animalText = this.unlockedAnimals.map((animal) => animal.icon + ' ' + animal.name).join(', ');
    const parts = [];
    if (cropText) parts.push(`Crops: ${cropText}`);
    if (animalText) parts.push(`Animals: ${animalText}`);
    this.unlockedCropsElement.textContent = parts.join(' • ') || 'No crops or animals unlocked yet.';
  }

  get unlockedAnimals() {
    return animals.filter((animal) => this.player.level >= animal.unlockLevel);
  }

  bindEvents() {
    this.resetButton.addEventListener('click', () => {
      if (confirm('Reset your FarmVerse progress and start fresh?')) {
        localStorage.removeItem(SAVE_KEY);
        window.location.reload();
      }
    });
    window.addEventListener('beforeunload', () => this.saveState());
  }

  showToast(message) {
    clearTimeout(this.toastTimeout);
    this.toast.textContent = message;
    this.toast.classList.add('visible');
    this.toastTimeout = setTimeout(() => {
      this.toast.classList.remove('visible');
    }, 2200);
  }
}

window.addEventListener('DOMContentLoaded', () => new FarmGame());
