import Phaser from 'phaser';
import { generateProceduralTextures } from './assets';
import { SeededRNG } from './rng';
import { CROPS, CropState, InventoryItem, SavedGameState, StructureState } from './types';

export class GameScene extends Phaser.Scene {
  // Game state synced with React
  public gameState!: SavedGameState;
  
  // Phaser elements
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private shiftKey!: Phaser.Input.Keyboard.Key;
  
  // Tilemaps & Layer simulation
  private mapWidth = 60; // tiles
  private mapHeight = 60; // tiles
  private tileSize = 32; // px
  private tiles: { [key: string]: Phaser.GameObjects.Sprite } = {};
  private mapData: number[][] = []; // 0: grass, 1: dirt, 2: water, 3: bridge, 4: path, 5: plowed_dry, 6: plowed_wet
  
  // Static physics groups
  private obstaclesGroup!: Phaser.Physics.Arcade.StaticGroup;
  private interactiveObjects: { [key: string]: {
    sprite: Phaser.GameObjects.Sprite;
    type: 'tree' | 'rock' | 'bush' | 'flower' | 'house' | 'barn' | 'windmill' | 'coop' | 'shed' | 'greenhouse' | 'bakery' | 'workshop' | 'storage' | 'npc_robin' | 'npc_pierre' | 'npc_lewis';
    hits: number;
    gridX: number;
    gridY: number;
    body?: Phaser.Physics.Arcade.StaticBody;
  }} = {};

  // Interactive structures (fences, custom paths)
  private structuresGroup!: Phaser.Physics.Arcade.StaticGroup;
  private structureSprites: { [key: string]: Phaser.GameObjects.Sprite } = {};
  private buildingSprites: { [key: string]: Phaser.GameObjects.Sprite } = {};

  // Crop Sprites (keyed by gridX,gridY)
  private cropSprites: { [key: string]: Phaser.GameObjects.Sprite } = {};

  // Spinning Windmill Blades
  private windmillBladesSprite!: Phaser.GameObjects.Sprite;

  // Selected tool / action state (updated from React)
  public activeTool: string = 'hand'; // hand, hoe, water_can, axe, pickaxe, wheat_seeds, tomato_seeds, etc.

  // Callback to push state updates to React
  private onStateUpdate!: (state: SavedGameState) => void;

  // Highlighting grid indicator
  private hoverIndicator!: Phaser.GameObjects.Graphics;

  // Fishing State variables
  private isFishing = false;
  private fishingBobber: Phaser.GameObjects.Sprite | null = null;
  private fishingLine: Phaser.GameObjects.Graphics | null = null;
  private biteActive = false;
  private fishingTimer: Phaser.Time.TimerEvent | null = null;
  private targetWaterCoord = { x: 0, y: 0 };

  // Weather and lighting simulation
  private weatherGraphics!: Phaser.GameObjects.Graphics;
  private lightingOverlay!: Phaser.GameObjects.Graphics;
  private rainParticles: { x: number; y: number; speed: number; len: number }[] = [];
  private windParticles: { x: number; y: number; speed: number; size: number }[] = [];

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data?: { gameState: SavedGameState; onStateUpdate: (state: SavedGameState) => void }) {
    if (data?.gameState) {
      this.gameState = data.gameState;
      this.onStateUpdate = data.onStateUpdate;
    } else {
      this.gameState = (window as any).__phaserGameState;
      this.onStateUpdate = (window as any).__phaserOnStateUpdate;
    }
  }

  preload() {
    // Generate all beautiful pixel/vector textures procedurally!
    generateProceduralTextures(this);
  }

  create() {
    // Enable arcade physics boundaries
    const worldWidthPx = this.mapWidth * this.tileSize;
    const worldHeightPx = this.mapHeight * this.tileSize;
    this.physics.world.setBounds(0, 0, worldWidthPx, worldHeightPx);

    // Create physics groups
    this.obstaclesGroup = this.physics.add.staticGroup();
    this.structuresGroup = this.physics.add.staticGroup();

    // Create Map & Layout
    this.generateWorldLayout();

    // Spawn Buildings
    this.spawnStaticBuildings();

    // Pre-populate environmental objects (Seeded RNG)
    this.spawnSeededObjects();

    // Re-create user placed structures & crops from saved state
    this.spawnSavedCropsAndStructures();

    // Create Animated Player Sprite
    this.createPlayer();

    // Set up hover/grid highlight indicator
    this.hoverIndicator = this.add.graphics();
    this.hoverIndicator.lineStyle(2, 0xffffff, 0.7);
    this.hoverIndicator.strokeRect(0, 0, this.tileSize, this.tileSize);
    this.hoverIndicator.setVisible(false);

    // Setup input listeners
    this.setupInput();

    // Create Weather graphics overlay
    this.weatherGraphics = this.add.graphics();
    this.weatherGraphics.setScrollFactor(0); // stationary overlay on viewport
    this.weatherGraphics.setDepth(20000); // above all map objects and HUD overlays

    // Create Lighting Overlay graphics
    this.lightingOverlay = this.add.graphics();
    this.lightingOverlay.setScrollFactor(0);
    this.lightingOverlay.setDepth(15000);

    // Camera adjustments
    this.cameras.main.setBounds(0, 0, worldWidthPx, worldHeightPx);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.5); // Default zoom level

    // Collisions
    this.physics.add.collider(this.player, this.obstaclesGroup);
    this.physics.add.collider(this.player, this.structuresGroup);

    // Listeners for React interactions
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.handlePointerDown(pointer);
    });

    // Create Water tile animation timer
    this.time.addEvent({
      delay: 500,
      callback: () => {
        this.animateWater();
      },
      loop: true
    });

    // Start game timeline loop (Time advances 1 game minute every 1 real-life second)
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.advanceGameTime();
      },
      loop: true
    });

    // Push initial synced state to UI
    this.onStateUpdate(this.gameState);
  }

  update() {
    this.handlePlayerMovement();
    this.updateHoverIndicator();

    // Rotate Windmill Blades
    if (this.windmillBladesSprite) {
      this.windmillBladesSprite.angle += 1;
    }

    // Redraw fishing line tip
    if (this.isFishing) {
      this.updateFishingLine();
    }

    // Update building appearances reactively from state
    this.updateBuildingsFromState();

    // Dynamic environmental layers
    this.updateLighting();
    this.drawWeatherEffects();
  }

  // --- MAP GENERATION & SEEDING ---

  private generateWorldLayout() {
    const rng = new SeededRNG(this.gameState.seed);
    this.mapData = [];

    // Setup basic flat grassy plains with randomly placed dirt paths and a beautiful vertical river with a bridge
    for (let y = 0; y < this.mapHeight; y++) {
      this.mapData[y] = [];
      for (let x = 0; x < this.mapWidth; x++) {
        let type = 0; // 0: Grass

        // Vertical River (tiles x=32 to x=34) with curvy shorelines
        const curveOffset = Math.round(Math.sin(y * 0.15) * 2);
        const riverX1 = 32 + curveOffset;
        const riverX2 = 34 + curveOffset;

        if (x >= riverX1 && x <= riverX2) {
          type = 2; // Water
        }

        // Bridge over River (grid y=27 to y=28)
        if (type === 2 && (y === 27 || y === 28)) {
          type = 3; // Bridge
        }

        // Main Dirt Path running from House zone to Bridge
        // House is around x=14, y=15. Let's connect it to River Bridge at x=32, y=27
        if (y === 20 && x >= 14 && x <= 32) {
          type = 4; // Path
        }
        if (x === 14 && y >= 15 && y <= 20) {
          type = 4; // Path to house front door
        }
        if (x === 22 && y >= 15 && y <= 20) {
          type = 4; // Path to barn front door
        }

        this.mapData[y][x] = type;

        // Render basic tile base
        const tx = x * this.tileSize + 16;
        const ty = y * this.tileSize + 16;
        let textureKey = 'tile_grass';

        if (type === 1) textureKey = 'tile_dirt';
        else if (type === 2) textureKey = 'tile_water';
        else if (type === 3) textureKey = 'tile_bridge';
        else if (type === 4) textureKey = 'tile_path';

        const tileSprite = this.add.sprite(tx, ty, textureKey);
        this.tiles[`${x},${y}`] = tileSprite;

        // Water Tiles are physical obstacles (Player cannot cross unless on a bridge)
        if (type === 2) {
          const block = this.add.zone(tx, ty, this.tileSize, this.tileSize);
          this.physics.add.existing(block, true);
          this.obstaclesGroup.add(block);
        }
      }
    }
  }

  // Animates the custom water frames
  private waterFrame = 0;
  private animateWater() {
    this.waterFrame = (this.waterFrame + 1) % 3;
    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        if (this.mapData[y][x] === 2) {
          const tileSprite = this.tiles[`${x},${y}`];
          if (tileSprite) {
            tileSprite.setFrame(this.waterFrame);
          }
        }
      }
    }
  }

  private spawnStaticBuildings() {
    // 1. Cozy Farm House at (14, 15)
    // House width=96, height=96 (3x3 grid cells)
    const hx = 14 * this.tileSize + 48;
    const hy = 15 * this.tileSize + 48;
    const house = this.add.sprite(hx, hy, 'bld_house');
    house.setDepth(10); // Render above floor tiles

    // Add house collider box
    const houseCollider = this.add.zone(hx, hy + 12, 72, 54);
    this.physics.add.existing(houseCollider, true);
    this.obstaclesGroup.add(houseCollider);

    this.interactiveObjects[`14,15`] = {
      sprite: house,
      type: 'house',
      hits: 0,
      gridX: 14,
      gridY: 15
    };
    this.buildingSprites['house'] = house;

    // 2. Red Barn at (22, 15)
    // Barn width=128, height=96 (4x3 grid cells)
    const bx = 22 * this.tileSize + 64;
    const by = 15 * this.tileSize + 48;
    const barn = this.add.sprite(bx, by, 'bld_barn');
    barn.setDepth(10);

    const barnCollider = this.add.zone(bx, by + 12, 110, 54);
    this.physics.add.existing(barnCollider, true);
    this.obstaclesGroup.add(barnCollider);

    this.interactiveObjects[`22,15`] = {
      sprite: barn,
      type: 'barn',
      hits: 0,
      gridX: 22,
      gridY: 15
    };
    this.buildingSprites['barn'] = barn;

    // 3. Spinning Windmill at (8, 25)
    // Base width=96, height=128 (3x4 grid cells)
    const wx = 8 * this.tileSize + 48;
    const wy = 25 * this.tileSize + 64;
    const windmillBase = this.add.sprite(wx, wy, 'bld_windmill_base');
    windmillBase.setDepth(10);

    const windmillCollider = this.add.zone(wx, wy + 24, 64, 60);
    this.physics.add.existing(windmillCollider, true);
    this.obstaclesGroup.add(windmillCollider);

    // Blades on top of hub (centered at offset y = -40 relative to windmill base)
    const b_offset_y = -40;
    this.windmillBladesSprite = this.add.sprite(wx, wy + b_offset_y, 'bld_windmill_blades');
    this.windmillBladesSprite.setDepth(11); // above base

    this.interactiveObjects[`8,25`] = {
      sprite: windmillBase,
      type: 'windmill',
      hits: 0,
      gridX: 8,
      gridY: 25
    };
    this.buildingSprites['windmill'] = windmillBase;

    // 4. Chicken Coop at (27, 15)
    // Coop width=96, height=96 (3x3 grid cells)
    const cx = 27 * this.tileSize + 48;
    const cy = 15 * this.tileSize + 48;
    const coop = this.add.sprite(cx, cy, 'bld_coop');
    coop.setDepth(10);

    const coopCollider = this.add.zone(cx, cy + 12, 72, 54);
    this.physics.add.existing(coopCollider, true);
    this.obstaclesGroup.add(coopCollider);

    this.interactiveObjects[`27,15`] = {
      sprite: coop,
      type: 'coop',
      hits: 0,
      gridX: 27,
      gridY: 15
    };
    this.buildingSprites['coop'] = coop;

    // 5. Cow Shed at (18, 12)
    // Shed width=96, height=96 (3x3 grid cells)
    const sx = 18 * this.tileSize + 48;
    const sy = 12 * this.tileSize + 48;
    const shed = this.add.sprite(sx, sy, 'bld_shed');
    shed.setDepth(9); // behind front row

    const shedCollider = this.add.zone(sx, sy + 12, 72, 54);
    this.physics.add.existing(shedCollider, true);
    this.obstaclesGroup.add(shedCollider);

    this.interactiveObjects[`18,12`] = {
      sprite: shed,
      type: 'shed',
      hits: 0,
      gridX: 18,
      gridY: 12
    };
    this.buildingSprites['shed'] = shed;

    // 6. Silo Storage at (20, 14)
    // Silo width=64, height=128 (2x4 grid cells)
    const stx = 20 * this.tileSize + 32;
    const sty = 14 * this.tileSize + 64;
    const storage = this.add.sprite(stx, sty, 'bld_storage');
    storage.setDepth(10);

    const storageCollider = this.add.zone(stx, sty + 24, 48, 64);
    this.physics.add.existing(storageCollider, true);
    this.obstaclesGroup.add(storageCollider);

    this.interactiveObjects[`20,14`] = {
      sprite: storage,
      type: 'storage',
      hits: 0,
      gridX: 20,
      gridY: 14
    };
    this.buildingSprites['storage'] = storage;

    // 7. Crafting Workshop at (11, 21)
    // Workshop width=96, height=96 (3x3 grid cells)
    const wrx = 11 * this.tileSize + 48;
    const wry = 21 * this.tileSize + 48;
    const workshop = this.add.sprite(wrx, wry, 'bld_workshop');
    workshop.setDepth(10);

    const workshopCollider = this.add.zone(wrx, wry + 12, 72, 54);
    this.physics.add.existing(workshopCollider, true);
    this.obstaclesGroup.add(workshopCollider);

    this.interactiveObjects[`11,21`] = {
      sprite: workshop,
      type: 'workshop',
      hits: 0,
      gridX: 11,
      gridY: 21
    };
    this.buildingSprites['workshop'] = workshop;

    // 8. Farm Bakery at (15, 21)
    // Bakery width=96, height=96 (3x3 grid cells)
    const bkx = 15 * this.tileSize + 48;
    const bky = 21 * this.tileSize + 48;
    const bakery = this.add.sprite(bkx, bky, 'bld_bakery');
    bakery.setDepth(10);

    const bakeryCollider = this.add.zone(bkx, bky + 12, 72, 54);
    this.physics.add.existing(bakeryCollider, true);
    this.obstaclesGroup.add(bakeryCollider);

    this.interactiveObjects[`15,21`] = {
      sprite: bakery,
      type: 'bakery',
      hits: 0,
      gridX: 15,
      gridY: 21
    };
    this.buildingSprites['bakery'] = bakery;

    // 9. Greenhouse at (8, 15)
    // Greenhouse width=128, height=96 (4x3 grid cells)
    const ghx = 8 * this.tileSize + 64;
    const ghy = 15 * this.tileSize + 48;
    const greenhouse = this.add.sprite(ghx, ghy, 'bld_greenhouse_ruined');
    greenhouse.setDepth(10);

    const greenhouseCollider = this.add.zone(ghx, ghy + 12, 110, 54);
    this.physics.add.existing(greenhouseCollider, true);
    this.obstaclesGroup.add(greenhouseCollider);

    this.interactiveObjects[`8,15`] = {
      sprite: greenhouse,
      type: 'greenhouse',
      hits: 0,
      gridX: 8,
      gridY: 15
    };
    this.buildingSprites['greenhouse'] = greenhouse;

    // Spawn villagers standing in appropriate spots
    // Robin stands at (18, 15) near the Barn / Windmill
    const rx = 18 * this.tileSize + 16;
    const ry = 15 * this.tileSize + 16;
    const robin = this.add.sprite(rx, ry, 'npc_robin');
    robin.setDepth(ry);
    this.physics.add.existing(robin, true);
    this.interactiveObjects[`18,15`] = {
      sprite: robin,
      type: 'npc_robin',
      hits: 0,
      gridX: 18,
      gridY: 15
    };

    // Pierre stands at (13, 15) near the Farmhouse
    const px = 13 * this.tileSize + 16;
    const py = 15 * this.tileSize + 16;
    const pierre = this.add.sprite(px, py, 'npc_pierre');
    pierre.setDepth(py);
    this.physics.add.existing(pierre, true);
    this.interactiveObjects[`13,15`] = {
      sprite: pierre,
      type: 'npc_pierre',
      hits: 0,
      gridX: 13,
      gridY: 15
    };

    // Lewis stands at (15, 17) near the core garden plot
    const lx = 15 * this.tileSize + 16;
    const ly = 17 * this.tileSize + 16;
    const lewis = this.add.sprite(lx, ly, 'npc_lewis');
    lewis.setDepth(ly);
    this.physics.add.existing(lewis, true);
    this.interactiveObjects[`15,17`] = {
      sprite: lewis,
      type: 'npc_lewis',
      hits: 0,
      gridX: 15,
      gridY: 17
    };
  }

  private spawnSeededObjects() {
    // Generate beautiful random elements based on World Seed
    const rng = new SeededRNG(this.gameState.seed);

    // Distribute Trees, Rocks, Bushes, Flowers
    for (let y = 4; y < this.mapHeight - 4; y++) {
      for (let x = 4; x < this.mapWidth - 4; x++) {
        // Skip building areas and river
        if (this.mapData[y][x] !== 0) continue; // must be on grass
        if (x >= 4 && x <= 31 && y >= 10 && y <= 30) continue; // Skip core farm buildings zone

        // Generate coordinates
        const coordKey = `${x},${y}`;

        // If user already cleared this pre-generated object, skip it!
        if (this.gameState.clearedObjects.includes(coordKey)) continue;

        const val = rng.next();

        if (val < 0.05) {
          // 5% chance of Tree
          const tx = x * this.tileSize + 16;
          const ty = y * this.tileSize + 16;
          const tree = this.add.sprite(tx, ty, 'obj_tree');
          tree.setDepth(y); // for depth sorting
          tree.setOrigin(0.5, 0.85); // trunk is lower section of 64px height

          // Physics body
          const coll = this.add.zone(tx, ty, 20, 14);
          this.physics.add.existing(coll, true);
          this.obstaclesGroup.add(coll);

          this.interactiveObjects[coordKey] = {
            sprite: tree,
            type: 'tree',
            hits: 0,
            gridX: x,
            gridY: y,
            body: coll.body as Phaser.Physics.Arcade.StaticBody
          };
        } else if (val < 0.10) {
          // 5% chance of Rock
          const rx = x * this.tileSize + 16;
          const ry = y * this.tileSize + 16;
          const rock = this.add.sprite(rx, ry, 'obj_rock');
          rock.setDepth(y);
          rock.setOrigin(0.5, 0.75);

          const coll = this.add.zone(rx, ry, 24, 18);
          this.physics.add.existing(coll, true);
          this.obstaclesGroup.add(coll);

          this.interactiveObjects[coordKey] = {
            sprite: rock,
            type: 'rock',
            hits: 0,
            gridX: x,
            gridY: y,
            body: coll.body as Phaser.Physics.Arcade.StaticBody
          };
        } else if (val < 0.15) {
          // 5% chance of Bush
          const bx = x * this.tileSize + 16;
          const by = y * this.tileSize + 16;
          const bush = this.add.sprite(bx, by, 'obj_bush');
          bush.setDepth(y);

          const coll = this.add.zone(bx, by, 22, 16);
          this.physics.add.existing(coll, true);
          this.obstaclesGroup.add(coll);

          this.interactiveObjects[coordKey] = {
            sprite: bush,
            type: 'bush',
            hits: 0,
            gridX: x,
            gridY: y,
            body: coll.body as Phaser.Physics.Arcade.StaticBody
          };
        } else if (val < 0.22) {
          // 7% chance of Flowers
          const fx = x * this.tileSize + 16;
          const fy = y * this.tileSize + 16;
          const flower = this.add.sprite(fx, fy, 'obj_flower');
          flower.setDepth(y);

          // Flowers are walkthrough (no collider)
          this.interactiveObjects[coordKey] = {
            sprite: flower,
            type: 'flower',
            hits: 0,
            gridX: x,
            gridY: y
          };
        }
      }
    }
  }

  // Restore structures and crops placed by the player
  private spawnSavedCropsAndStructures() {
    // 1. Restoring farm land and crops
    Object.entries(this.gameState.crops).forEach(([coordKey, cropState]) => {
      const [gxStr, gyStr] = coordKey.split(',');
      const gx = parseInt(gxStr);
      const gy = parseInt(gyStr);

      if (this.tiles[coordKey]) {
        // Change soil tile to Plowed Wet/Dry
        this.tiles[coordKey].setTexture(cropState.watered ? 'tile_plowed_wet' : 'tile_plowed_dry');
        this.mapData[gy][gx] = cropState.watered ? 6 : 5;
      }

      // Render the actual growing crop
      const tx = gx * this.tileSize + 16;
      const ty = gy * this.tileSize + 16;
      const cropSprite = this.add.sprite(tx, ty, `crop_${cropState.cropId}`);
      cropSprite.setDepth(gy + 1);
      
      if (cropState.stage === 4) {
        cropSprite.setFrame(3); // Show mature frame but tinted
        cropSprite.setTint(0x7a6b58); // Dead/withered tint
      } else {
        cropSprite.setFrame(cropState.stage);
      }
      
      this.cropSprites[coordKey] = cropSprite;
    });

    // 2. Restoring custom built structures
    Object.entries(this.gameState.structures).forEach(([coordKey, structState]) => {
      const [gxStr, gyStr] = coordKey.split(',');
      const gx = parseInt(gxStr);
      const gy = parseInt(gyStr);
      const tx = gx * this.tileSize + 16;
      const ty = gy * this.tileSize + 16;

      if (structState.type === 'path') {
        // Change underlying tile texture to Path
        this.tiles[coordKey].setTexture('tile_path');
        this.mapData[gy][gx] = 4;
      } else if (structState.type === 'fence') {
        const fenceSprite = this.add.sprite(tx, ty, 'fence_wood');
        fenceSprite.setDepth(gy);
        this.physics.add.existing(fenceSprite, true);
        this.structuresGroup.add(fenceSprite);
        this.structureSprites[coordKey] = fenceSprite;
      } else if (structState.type === 'scarecrow') {
        const scarecrowSprite = this.add.sprite(tx, ty, 'obj_scarecrow');
        scarecrowSprite.setDepth(gy);
        this.physics.add.existing(scarecrowSprite, true);
        this.structuresGroup.add(scarecrowSprite);
        this.structureSprites[coordKey] = scarecrowSprite;
      } else if (structState.type === 'lantern') {
        const lanternSprite = this.add.sprite(tx, ty, 'obj_lantern');
        lanternSprite.setDepth(gy);
        this.physics.add.existing(lanternSprite, true);
        this.structuresGroup.add(lanternSprite);
        this.structureSprites[coordKey] = lanternSprite;
      }
    });
  }

  // --- PLAYER ACTIONS & PHYSICS SETUP ---

  private createPlayer() {
    // Start player near their House
    const startX = 14 * this.tileSize + 48;
    const startY = 18 * this.tileSize + 16;

    this.player = this.physics.add.sprite(startX, startY, 'player_spritesheet');
    this.player.setOrigin(0.5, 0.85); // visual height offset
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(startY); // depth sorting

    // Configure small physics hit box centered at feet
    this.player.body.setSize(16, 12);
    this.player.body.setOffset(8, 34);

    // Create walk/run animations from spritesheet dynamically
    const anims = this.anims;
    
    // Rows: 0=Down, 1=Up, 2=Left, 3=Right
    // Frames: 0=walk1, 1=idle, 2=walk2, 3=idle
    if (!anims.exists('walk_down')) {
      anims.create({
        key: 'walk_down',
        frames: anims.generateFrameNumbers('player_spritesheet', { start: 0, end: 3 }),
        frameRate: 8,
        repeat: -1
      });
      anims.create({
        key: 'idle_down',
        frames: [{ key: 'player_spritesheet', frame: 1 }],
        frameRate: 1
      });

      anims.create({
        key: 'walk_up',
        frames: anims.generateFrameNumbers('player_spritesheet', { start: 4, end: 7 }),
        frameRate: 8,
        repeat: -1
      });
      anims.create({
        key: 'idle_up',
        frames: [{ key: 'player_spritesheet', frame: 5 }],
        frameRate: 1
      });

      anims.create({
        key: 'walk_left',
        frames: anims.generateFrameNumbers('player_spritesheet', { start: 8, end: 11 }),
        frameRate: 8,
        repeat: -1
      });
      anims.create({
        key: 'idle_left',
        frames: [{ key: 'player_spritesheet', frame: 9 }],
        frameRate: 1
      });

      anims.create({
        key: 'walk_right',
        frames: anims.generateFrameNumbers('player_spritesheet', { start: 12, end: 15 }),
        frameRate: 8,
        repeat: -1
      });
      anims.create({
        key: 'idle_right',
        frames: [{ key: 'player_spritesheet', frame: 13 }],
        frameRate: 1
      });
    }

    this.player.play('idle_down');
  }

  private setupInput() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D
    }) as any;
    this.shiftKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
  }

  private handlePlayerMovement() {
    let vx = 0;
    let vy = 0;

    // Movement speed
    const isRunning = this.shiftKey.isDown;
    const speed = isRunning ? 160 : 100;

    // Read WASD or cursors
    if (this.wasd.A.isDown || this.cursors.left?.isDown) {
      vx = -speed;
    } else if (this.wasd.D.isDown || this.cursors.right?.isDown) {
      vx = speed;
    }

    if (this.wasd.W.isDown || this.cursors.up?.isDown) {
      vy = -speed;
    } else if (this.wasd.S.isDown || this.cursors.down?.isDown) {
      vy = speed;
    }

    // Apply diagonal speed scaling
    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    this.player.setVelocity(vx, vy);

    // Update animations and depth-sorting
    if (vx !== 0 || vy !== 0) {
      this.player.setDepth(this.player.y);

      // Play walk animations with speed based on running
      this.player.anims.timeScale = isRunning ? 1.5 : 1.0;
      
      if (Math.abs(vx) > Math.abs(vy)) {
        if (vx < 0) {
          this.player.play('walk_left', true);
        } else {
          this.player.play('walk_right', true);
        }
      } else {
        if (vy < 0) {
          this.player.play('walk_up', true);
        } else {
          this.player.play('walk_down', true);
        }
      }
    } else {
      // Stopped: play idle
      const currentAnim = this.player.anims.currentAnim;
      if (currentAnim) {
        if (currentAnim.key.includes('left')) this.player.play('idle_left');
        else if (currentAnim.key.includes('right')) this.player.play('idle_right');
        else if (currentAnim.key.includes('up')) this.player.play('idle_up');
        else this.player.play('idle_down');
      }
    }
  }

  // --- INTERACTIVE TOOL SYSTEM & AGRICULTURE ---

  private updateHoverIndicator() {
    const pointer = this.input.activePointer;
    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const gridX = Math.floor(worldPoint.x / this.tileSize);
    const gridY = Math.floor(worldPoint.y / this.tileSize);

    // Make sure pointer is inside world bounds
    if (gridX >= 0 && gridX < this.mapWidth && gridY >= 0 && gridY < this.mapHeight) {
      // Draw grid indicator relative to player range (limit range to 2.5 grid cells)
      const px = Math.floor(this.player.x / this.tileSize);
      const py = Math.floor(this.player.y / this.tileSize);
      const dist = Phaser.Math.Distance.Between(px, py, gridX, gridY);

      if (dist <= 3) {
        this.hoverIndicator.setPosition(gridX * this.tileSize, gridY * this.tileSize);
        this.hoverIndicator.setVisible(true);

        // Turn red if action is impossible, otherwise white
        const type = this.mapData[gridY][gridX];
        const coordKey = `${gridX},${gridY}`;
        const hasObstacle = this.interactiveObjects[coordKey] || this.structureSprites[coordKey];

        let indicatorColor = 0xffffff;
        let indicatorAlpha = 0.8;

        if (this.activeTool === 'hoe' && (type !== 0 || hasObstacle)) {
          indicatorColor = 0xff5555;
          indicatorAlpha = 0.7;
        } else if (this.activeTool === 'water_can' && (type !== 5 || hasObstacle)) {
          indicatorColor = 0xff5555;
          indicatorAlpha = 0.7;
        }

        // redraw
        this.hoverIndicator.clear();
        this.hoverIndicator.lineStyle(2, indicatorColor, indicatorAlpha);
        this.hoverIndicator.strokeRect(0, 0, this.tileSize, this.tileSize);
      } else {
        this.hoverIndicator.setVisible(false);
      }
    } else {
      this.hoverIndicator.setVisible(false);
    }
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer) {
    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const gridX = Math.floor(worldPoint.x / this.tileSize);
    const gridY = Math.floor(worldPoint.y / this.tileSize);

    // Limit actions to tiles close to player (reach limit of 3 tiles)
    const px = Math.floor(this.player.x / this.tileSize);
    const py = Math.floor(this.player.y / this.tileSize);
    const distance = Phaser.Math.Distance.Between(px, py, gridX, gridY);

    if (distance > 3) {
      // Out of reach
      return;
    }

    const coordKey = `${gridX},${gridY}`;
    const blockType = this.mapData[gridY]?.[gridX];

    // Check energy constraint
    if (this.gameState.energy <= 0 && this.activeTool !== 'hand' && !this.activeTool.includes('seeds')) {
      this.showTextFeedback(this.player.x, this.player.y - 20, 'No Energy!', '#e63946');
      return;
    }

    // 0. RIVER FISHING ROAD CHECK
    if (this.activeTool === 'fishing_rod') {
      if (blockType === 2) { // Water
        if (this.isFishing) {
          if (this.biteActive) {
            this.catchFish(gridX, gridY);
          } else {
            this.showTextFeedback(this.player.x, this.player.y - 20, 'Too Early!', '#ff5555');
            this.resetFishing();
          }
        } else {
          this.startFishing(gridX, gridY);
        }
      } else {
        if (this.isFishing) {
          this.resetFishing();
        } else {
          this.showTextFeedback(this.player.x, this.player.y - 20, 'Cast into water!', '#4cc9f0');
        }
      }
      return;
    } else {
      if (this.isFishing) {
        this.resetFishing();
      }
    }

    // 0a. SCYTHE INTERACTION
    if (this.activeTool === 'scythe') {
      // 7a. Clear/Harvest crops
      if (this.gameState.crops[coordKey]) {
        const crop = this.gameState.crops[coordKey];
        const cropType = CROPS[crop.cropId];
        
        this.performToolAction(coordKey, () => {
          if (crop.stage === 3) {
            // Harvest it!
            this.addInventoryItem(crop.cropId, cropType.name, 'crop', 1, cropType.color, `Fresh high-quality ${cropType.name}.`);
            this.addXP(25);
            this.spawnFlyingXP(gridX * this.tileSize + 16, gridY * this.tileSize + 16, 25);
            this.showTextFeedback(gridX * this.tileSize + 16, gridY * this.tileSize + 16, `+1 ${cropType.name} (+25 XP)`, '#ffd166');
          } else {
            // Destroy growing or dead crop
            const feedbackText = crop.stage === 4 ? 'Withered Cleared!' : 'Crop Cleared!';
            this.showTextFeedback(gridX * this.tileSize + 16, gridY * this.tileSize + 16, feedbackText, '#dee2e6');
          }

          if (this.cropSprites[coordKey]) {
            this.cropSprites[coordKey].destroy();
            delete this.cropSprites[coordKey];
          }
          
          const col = cropType ? cropType.color : '#7a6b58';
          this.spawnHarvestParticles(gridX * this.tileSize + 16, gridY * this.tileSize + 16, col);
          
          this.tiles[coordKey].setTexture('tile_grass');
          this.mapData[gridY][gridX] = 0; // Grass

          delete this.gameState.crops[coordKey];
          this.syncState();
        });
        return;
      }
      
      // 7b. Restore Plowed Earth back to Grass
      if (blockType === 5 || blockType === 6) {
        this.performToolAction(coordKey, () => {
          this.tiles[coordKey].setTexture('tile_grass');
          this.mapData[gridY][gridX] = 0; // grass
          this.showTextFeedback(gridX * this.tileSize + 16, gridY * this.tileSize + 16, 'Cleared Plot!', '#8bc34a');
          this.syncState();
        });
        return;
      }

      // 7c. Chop Bushes
      if (this.interactiveObjects[coordKey]) {
        const target = this.interactiveObjects[coordKey];
        if (target.type === 'bush') {
          this.performToolAction(coordKey, () => {
            target.hits += 1;
            this.showTextFeedback(target.sprite.x, target.sprite.y - 10, 'Slash!', '#70e000');
            this.spawnHarvestParticles(target.sprite.x, target.sprite.y, '#38b000');

            if (target.hits >= 2) {
              this.clearNaturalObstacle(coordKey);
              this.addInventoryItem('fiber', 'Fiber', 'material', 2, '#38b000', 'Soft plant fibers.');
              this.addInventoryItem('berry', 'Berry', 'crop', 1, '#f72585', 'Sweet edible wild berries.');
              this.addXP(10);
              this.spawnFlyingXP(target.sprite.x, target.sprite.y, 10);
            }
          });
          return;
        }
      }
    }

    // 1. CHOPPING / MINING / CLEARING (axe, pickaxe, hand on natural objects)
    if (this.interactiveObjects[coordKey]) {
      const target = this.interactiveObjects[coordKey];

      if (this.activeTool === 'axe' && target.type === 'tree') {
        this.performToolAction(coordKey, () => {
          target.hits += 1;
          this.showTextFeedback(target.sprite.x, target.sprite.y - 20, 'Chop!', '#a2d2ff');
          this.cameras.main.shake(100, 0.005);
          this.spawnHarvestParticles(target.sprite.x, target.sprite.y, '#8f5c35');

          if (target.hits >= 3) {
            this.clearNaturalObstacle(coordKey);
            this.addInventoryItem('wood', 'Wood', 'material', 3, '#8f5c35', 'Rich sturdy timber logs.');
            this.addXP(15);
            this.spawnFlyingXP(target.sprite.x, target.sprite.y, 15);
          }
        });
        return;
      }

      if (this.activeTool === 'pickaxe' && target.type === 'rock') {
        this.performToolAction(coordKey, () => {
          target.hits += 1;
          this.showTextFeedback(target.sprite.x, target.sprite.y - 10, 'Clang!', '#e9ecef');
          this.cameras.main.shake(100, 0.005);
          this.spawnHarvestParticles(target.sprite.x, target.sprite.y, '#7a828a');

          if (target.hits >= 3) {
            this.clearNaturalObstacle(coordKey);
            this.addInventoryItem('stone', 'Stone', 'material', 3, '#7a828a', 'Hard building stone blocks.');
            this.addXP(15);
            this.spawnFlyingXP(target.sprite.x, target.sprite.y, 15);
          }
        });
        return;
      }

      if (this.activeTool === 'axe' && target.type === 'bush') {
        this.performToolAction(coordKey, () => {
          target.hits += 1;
          this.showTextFeedback(target.sprite.x, target.sprite.y - 10, 'Rustle!', '#70e000');
          this.spawnHarvestParticles(target.sprite.x, target.sprite.y, '#38b000');

          if (target.hits >= 2) {
            this.clearNaturalObstacle(coordKey);
            this.addInventoryItem('fiber', 'Fiber', 'material', 2, '#38b000', 'Soft plant fibers.');
            this.addInventoryItem('berry', 'Berry', 'crop', 2, '#f72585', 'Sweet edible wild berries.');
            this.addXP(10);
            this.spawnFlyingXP(target.sprite.x, target.sprite.y, 10);
          }
        });
        return;
      }

      if (this.activeTool === 'hand' && target.type === 'flower') {
        this.spawnHarvestParticles(target.sprite.x, target.sprite.y, '#f15bb5');
        this.clearNaturalObstacle(coordKey);
        this.addInventoryItem('flower', 'Flower', 'material', 1, '#f15bb5', 'A beautiful freshly picked wild blossom.');
        this.addXP(5);
        this.spawnFlyingXP(target.sprite.x, target.sprite.y, 5);
        return;
      }

      // If clicked a static house or barn with hand
      if (this.activeTool === 'hand' && (target.type === 'house' || target.type === 'barn')) {
        this.showTextFeedback(target.sprite.x, target.sprite.y - 30, `My Cozy ${target.type === 'house' ? 'Home' : 'Barn'}`, '#ffd166');
        return;
      }

      // If clicked an NPC with hand
      if (this.activeTool === 'hand' && target.type.startsWith('npc_')) {
        const npcId = target.type.replace('npc_', '');
        
        // Let's talk! Reward some friendship chatting points on first interaction
        if (this.gameState.friendships && this.gameState.friendships[npcId]) {
          const currentChatted = this.gameState.friendships[npcId].chattedToday;
          if (!currentChatted) {
            this.gameState.friendships[npcId].chattedToday = true;
            this.gameState.friendships[npcId].points = Math.min(1250, this.gameState.friendships[npcId].points + 20);
            this.gameState.friendships[npcId].hearts = Math.floor(this.gameState.friendships[npcId].points / 250);
          }
        }

        // Trigger story mission if we talk to Robin
        if (npcId === 'robin' && this.gameState.questProgress?.storyMissions) {
          this.gameState.questProgress.storyMissions = this.gameState.questProgress.storyMissions.map((q) => {
            if (q.id === 'story_friend') {
              const pts = this.gameState.friendships.robin.points;
              return { ...q, current: pts, done: pts >= 250 };
            }
            return q;
          });
        }

        this.syncState();

        // Dispatch Custom Event to React!
        const event = new CustomEvent('open_npc_dialog', { detail: { npcId } });
        window.dispatchEvent(event);
        return;
      }
    }

    // 2. TILLING / PLOWING EARTH (hoe / copper_hoe)
    if (this.activeTool === 'hoe' || this.activeTool === 'copper_hoe') {
      if (blockType === 0 && !this.interactiveObjects[coordKey] && !this.structureSprites[coordKey]) {
        this.performToolAction(coordKey, () => {
          this.tiles[coordKey].setTexture('tile_plowed_dry');
          this.mapData[gridY][gridX] = 5; // plowed_dry
          this.showTextFeedback(gridX * this.tileSize + 16, gridY * this.tileSize + 16, 'Plowed!', '#d9b382');
        });
      }
      return;
    }

    // 3. WATERING CROPS (water_can / gold_watering_can)
    if (this.activeTool === 'water_can' || this.activeTool === 'gold_watering_can') {
      if (blockType === 5) { // plowed_dry
        this.performToolAction(coordKey, () => {
          this.tiles[coordKey].setTexture('tile_plowed_wet');
          this.mapData[gridY][gridX] = 6; // plowed_wet

          // Update crop watered state
          if (this.gameState.crops[coordKey]) {
            this.gameState.crops[coordKey].watered = true;
            this.gameState.crops[coordKey].lastWateredAt = this.gameState.day * 1440 + this.gameState.hour * 60 + this.gameState.minute;
          }
          this.showTextFeedback(gridX * this.tileSize + 16, gridY * this.tileSize + 16, 'Watered!', '#5ea3f2');
        });
      }
      return;
    }

    // 4. PLANTING SEEDS (wheat_seeds, tomato_seeds, carrot_seeds, strawberry_seeds, corn_seeds)
    if (this.activeTool.endsWith('_seeds')) {
      const cropId = this.activeTool.replace('_seeds', '');
      const seedName = this.activeTool.charAt(0).toUpperCase() + this.activeTool.slice(1).replace('_', ' ');

      if ((blockType === 5 || blockType === 6) && !this.gameState.crops[coordKey]) {
        // Check if player has the seed in inventory
        const seedStackIdx = this.gameState.inventory.findIndex(item => item.id === this.activeTool && item.count > 0);
        if (seedStackIdx !== -1) {
          // Decrement seed
          this.gameState.inventory[seedStackIdx].count -= 1;
          if (this.gameState.inventory[seedStackIdx].count === 0) {
            this.gameState.inventory.splice(seedStackIdx, 1);
            this.activeTool = 'hand'; // reset to hand if out of seeds
          }

          // Plant crop
          const currentTotalMinutes = this.gameState.day * 1440 + this.gameState.hour * 60 + this.gameState.minute;
          const newCrop: CropState = {
            cropId: cropId,
            stage: 0,
            watered: blockType === 6,
            plantedAt: currentTotalMinutes,
            lastWateredAt: blockType === 6 ? currentTotalMinutes : -1,
            unwateredDays: 0
          };

          this.gameState.crops[coordKey] = newCrop;

          // Spawn crop sprite
          const tx = gridX * this.tileSize + 16;
          const ty = gridY * this.tileSize + 16;
          const cropSprite = this.add.sprite(tx, ty, `crop_${cropId}`);
          cropSprite.setDepth(gridY + 1);
          cropSprite.setFrame(0);

          this.cropSprites[coordKey] = cropSprite;
          
          this.performToolAction(coordKey, () => {
            this.showTextFeedback(tx, ty - 10, 'Planted!', '#70e000');
          });
        } else {
          this.showTextFeedback(this.player.x, this.player.y - 20, `No ${seedName}!`, '#ff5555');
        }
      }
      return;
    }

    // 5. HARVESTING RIPE CROPS (hand)
    if (this.activeTool === 'hand') {
      const crop = this.gameState.crops[coordKey];
      if (crop) {
        if (crop.stage === 3) {
          // Ripe crop! Harvest it
          const cropType = CROPS[crop.cropId];
          this.addInventoryItem(crop.cropId, cropType.name, 'crop', 1, cropType.color, `Fresh high-quality ${cropType.name}.`);
          this.addXP(25);
          this.spawnHarvestParticles(gridX * this.tileSize + 16, gridY * this.tileSize + 16, cropType.color);
          this.spawnFlyingXP(gridX * this.tileSize + 16, gridY * this.tileSize + 16, 25);

          // Remove crop sprite
          if (this.cropSprites[coordKey]) {
            this.cropSprites[coordKey].destroy();
            delete this.cropSprites[coordKey];
          }

          // Restore soil back to grass
          this.tiles[coordKey].setTexture('tile_grass');
          this.mapData[gridY][gridX] = 0; // Grass

          delete this.gameState.crops[coordKey];
          this.syncState();
        } else if (crop.stage === 4) {
          // Withered crop - clear message
          this.showTextFeedback(gridX * this.tileSize + 16, gridY * this.tileSize + 16, 'Use Scythe to clear dead crops!', '#7a6b58');
        }
      }
    }
  }

  // Deducts energy, shakes/swings arm, triggers actions
  private performToolAction(coordKey: string, successCallback: () => void) {
    // swing player animation briefly
    const px = this.player.x;
    const py = this.player.y;

    this.gameState.energy = Math.max(0, this.gameState.energy - 2);
    
    // Animate tool swing
    this.animateToolUse(this.activeTool);
    
    // Tiny puff visual particle
    const emitter = this.add.graphics();
    emitter.fillStyle(0xffffff, 0.4);
    emitter.fillCircle(px, py + 10, 4);
    this.tweens.add({
      targets: emitter,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 250,
      onComplete: () => emitter.destroy()
    });

    successCallback();
    this.syncState();
  }

  // --- MAP CLEANING ---

  private clearNaturalObstacle(coordKey: string) {
    const target = this.interactiveObjects[coordKey];
    if (target) {
      // Destroy collider zones if existing
      if (target.body) {
        target.body.gameObject.destroy();
      }

      // Destroy visual sprite
      target.sprite.destroy();

      // Add coordinate to cleared items list so it never regenerates
      if (!this.gameState.clearedObjects.includes(coordKey)) {
        this.gameState.clearedObjects.push(coordKey);
      }

      delete this.interactiveObjects[coordKey];
    }
  }

  // --- CUSTOM BUILDING & STRUCTURE PLACEMENT ---

  public placeStructure(type: 'fence' | 'path' | 'scarecrow' | 'lantern') {
    // Find grid tile in front of the player
    // Based on player direction
    const currentAnim = this.player.anims.currentAnim;
    let dx = 0;
    let dy = 0;

    if (currentAnim) {
      if (currentAnim.key.includes('left')) dx = -1;
      else if (currentAnim.key.includes('right')) dx = 1;
      else if (currentAnim.key.includes('up')) dy = -1;
      else dy = 1; // down
    }

    const px = Math.floor(this.player.x / this.tileSize);
    const py = Math.floor(this.player.y / this.tileSize);

    const gx = px + dx;
    const gy = py + dy;

    // Check bounds
    if (gx < 0 || gx >= this.mapWidth || gy < 0 || gy >= this.mapHeight) return false;

    const coordKey = `${gx},${gy}`;

    // Can only build on flat empty Grass or Dirt
    const currentTileType = this.mapData[gy][gx];
    const isObstacle = this.interactiveObjects[coordKey] || this.structureSprites[coordKey];

    if ((currentTileType !== 0 && currentTileType !== 1) || isObstacle) {
      this.showTextFeedback(this.player.x, this.player.y - 20, 'Cannot Build Here!', '#ff5555');
      return false;
    }

    const tx = gx * this.tileSize + 16;
    const ty = gy * this.tileSize + 16;

    if (type === 'path') {
      // Placing custom gravel path
      this.tiles[coordKey].setTexture('tile_path');
      this.mapData[gy][gx] = 4; // Path

      const newStruct: StructureState = {
        id: `path_${gx}_${gy}`,
        type: 'path',
        x: gx,
        y: gy
      };
      this.gameState.structures[coordKey] = newStruct;
      this.showTextFeedback(tx, ty - 10, 'Gravel Path Placed!', '#ffd166');
    } else if (type === 'fence') {
      // Placing sturdy wooden fence
      const fenceSprite = this.add.sprite(tx, ty, 'fence_wood');
      fenceSprite.setDepth(gy);

      // Add to static group for physical blocking
      this.physics.add.existing(fenceSprite, true);
      this.structuresGroup.add(fenceSprite);

      this.structureSprites[coordKey] = fenceSprite;

      const newStruct: StructureState = {
        id: `fence_${gx}_${gy}`,
        type: 'fence',
        x: gx,
        y: gy
      };
      this.gameState.structures[coordKey] = newStruct;
      this.showTextFeedback(tx, ty - 10, 'Wood Fence Placed!', '#ffd166');
    } else if (type === 'scarecrow') {
      const scarecrowSprite = this.add.sprite(tx, ty, 'obj_scarecrow');
      scarecrowSprite.setDepth(gy);
      this.physics.add.existing(scarecrowSprite, true);
      this.structuresGroup.add(scarecrowSprite);
      this.structureSprites[coordKey] = scarecrowSprite;

      const newStruct: StructureState = {
        id: `scarecrow_${gx}_${gy}`,
        type: 'scarecrow',
        x: gx,
        y: gy
      };
      this.gameState.structures[coordKey] = newStruct;
      this.showTextFeedback(tx, ty - 10, 'Scarecrow Placed!', '#ffd166');
    } else if (type === 'lantern') {
      const lanternSprite = this.add.sprite(tx, ty, 'obj_lantern');
      lanternSprite.setDepth(gy);
      this.physics.add.existing(lanternSprite, true);
      this.structuresGroup.add(lanternSprite);
      this.structureSprites[coordKey] = lanternSprite;

      const newStruct: StructureState = {
        id: `lantern_${gx}_${gy}`,
        type: 'lantern',
        x: gx,
        y: gy
      };
      this.gameState.structures[coordKey] = newStruct;
      this.showTextFeedback(tx, ty - 10, 'Garden Lantern Placed!', '#ffea00');
    }

    this.syncState();
    return true;
  }

  // --- GAME STATE INTEGRATION & SAVING ---

  private addInventoryItem(id: string, name: string, type: 'seed' | 'crop' | 'material' | 'tool', amount: number, color?: string, desc?: string) {
    const existing = this.gameState.inventory.find(item => item.id === id);
    if (existing) {
      existing.count += amount;
    } else {
      this.gameState.inventory.push({
        id,
        name,
        type,
        count: amount,
        color,
        description: desc
      });
    }
    this.syncState();
  }

  private addXP(amount: number) {
    this.gameState.xp += amount;
    const xpNeeded = this.gameState.level * 200; // Formula for next level
    if (this.gameState.xp >= xpNeeded) {
      this.gameState.xp -= xpNeeded;
      this.gameState.level += 1;
      this.gameState.gems += 5; // Bonus gem on level up
      this.gameState.coins += 100; // Bonus gold on level up
      this.gameState.energy = 100; // Refill energy fully
      this.showTextFeedback(this.player.x, this.player.y - 45, 'LEVEL UP!', '#ffd166', 24);

      // Level up fanfare sound notes
      this.playSynthBeep(440, 'triangle', 0.15);
      this.time.delayedCall(120, () => this.playSynthBeep(554, 'triangle', 0.15));
      this.time.delayedCall(240, () => this.playSynthBeep(659, 'triangle', 0.15));
      this.time.delayedCall(360, () => this.playSynthBeep(880, 'triangle', 0.45));
    }
    this.syncState();
  }

  private advanceGameTime() {
    this.gameState.minute += 1;
    if (this.gameState.minute >= 60) {
      this.gameState.minute = 0;
      this.gameState.hour += 1;

      // Energy regenerates slightly in daylight (hours 6 to 18)
      if (this.gameState.hour >= 6 && this.gameState.hour <= 18) {
        this.gameState.energy = Math.min(100, this.gameState.energy + 1);
      }
    }

    if (this.gameState.hour >= 24) {
      this.gameState.hour = 0;
      this.gameState.day += 1;

      // End of day: update crop growth and reset water states!
      this.growCropsOvernight();
    }

    this.syncState();
  }

  private growCropsOvernight() {
    // Cycle Weather & Seasons for the new day
    const r = Math.random();
    let nextWeather: SavedGameState['weather'] = 'Sunny';
    if (r < 0.60) nextWeather = 'Sunny';
    else if (r < 0.75) nextWeather = 'Cloudy';
    else if (r < 0.90) nextWeather = 'Rain';
    else if (r < 0.95) nextWeather = 'Storm';
    else nextWeather = 'Wind';
    this.gameState.weather = nextWeather;

    if (this.gameState.day % 28 === 1) {
      const nextSeasonMap: { [key: string]: SavedGameState['season'] } = {
        'Spring': 'Summer',
        'Summer': 'Autumn',
        'Autumn': 'Winter',
        'Winter': 'Spring'
      };
      this.gameState.season = nextSeasonMap[this.gameState.season] || 'Spring';
    }

    // Rain / Storm automatically waters all tilled soils for the new day!
    const isRainingNextDay = (this.gameState.weather === 'Rain' || this.gameState.weather === 'Storm');
    
    if (isRainingNextDay) {
      for (let y = 0; y < this.mapHeight; y++) {
        for (let x = 0; x < this.mapWidth; x++) {
          if (this.mapData[y][x] === 5) { // plowed_dry
            this.mapData[y][x] = 6; // plowed_wet
            const coordKey = `${x},${y}`;
            if (this.tiles[coordKey]) {
              this.tiles[coordKey].setTexture('tile_plowed_wet');
            }
            if (this.gameState.crops[coordKey]) {
              this.gameState.crops[coordKey].watered = true;
            }
          }
        }
      }
    }

    Object.entries(this.gameState.crops).forEach(([coordKey, cropState]) => {
      const [gxStr, gyStr] = coordKey.split(',');
      const gx = parseInt(gxStr);
      const gy = parseInt(gyStr);

      if (cropState.watered) {
        // Growth stage advances if tilled soil was watered!
        cropState.unwateredDays = 0; // reset
        
        if (cropState.stage < 3) {
          cropState.stage += 1;
          
          // Update frame on the map
          if (this.cropSprites[coordKey]) {
            this.cropSprites[coordKey].setFrame(cropState.stage);
            this.cropSprites[coordKey].clearTint();
          }
        }

        // Soil dries up overnight if NOT raining next day
        if (isRainingNextDay) {
          cropState.watered = true;
          if (this.tiles[coordKey]) {
            this.tiles[coordKey].setTexture('tile_plowed_wet');
            this.mapData[gy][gx] = 6;
          }
        } else {
          cropState.watered = false;
          if (this.tiles[coordKey]) {
            this.tiles[coordKey].setTexture('tile_plowed_dry');
            this.mapData[gy][gx] = 5; // back to plowed_dry
          }
        }
      } else {
        // Crop is left unwatered
        if (cropState.stage < 4) {
          cropState.unwateredDays = (cropState.unwateredDays || 0) + 1;
          
          // If unwatered for 2 days, it dies/withers!
          if (cropState.unwateredDays >= 2) {
            cropState.stage = 4; // Dead/Withered state
            if (this.cropSprites[coordKey]) {
              this.cropSprites[coordKey].setFrame(3);
              this.cropSprites[coordKey].setTint(0x7a6b58); // dead tint
            }
          }
        }

        // Soil dries up too if NOT raining next day
        if (isRainingNextDay) {
          cropState.watered = true;
          if (this.tiles[coordKey]) {
            this.tiles[coordKey].setTexture('tile_plowed_wet');
            this.mapData[gy][gx] = 6;
          }
        } else {
          if (this.tiles[coordKey]) {
            this.tiles[coordKey].setTexture('tile_plowed_dry');
            this.mapData[gy][gx] = 5;
          }
        }
      }
    });

    // Feed animals overnight: animal products are produced
    this.gameState.animals.forEach(animal => {
      if (animal.fed) {
        animal.fed = false; // Reset daily hunger
        animal.affection = Math.min(100, animal.affection + 5);
        animal.hasProduct = true; // Ready to harvest!
      } else {
        animal.affection = Math.max(0, animal.affection - 10); // affinity drops if starved
      }
    });

    // Reset NPC chat daily state
    if (this.gameState.friendships) {
      Object.keys(this.gameState.friendships).forEach(npcKey => {
        this.gameState.friendships[npcKey].chattedToday = false;
      });
    }

    // Check daily quest progress reset
    if (this.gameState.questProgress?.dailyQuests) {
      this.gameState.questProgress.dailyQuests = this.gameState.questProgress.dailyQuests.map(q => {
        return { ...q, current: 0, done: false, claimed: false };
      });
    }

    this.syncState();
  }

  // Visual text popups (+1 Wood, -2 Energy, Level Up, etc.)
  private showTextFeedback(x: number, y: number, text: string, color: string = '#ffffff', fontSize: number = 14) {
    const textObj = this.add.text(x, y, text, {
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: `${fontSize}px`,
      color: color,
      stroke: '#000000',
      strokeThickness: 3,
      fontStyle: 'bold'
    });
    textObj.setOrigin(0.5);
    textObj.setDepth(1000); // Overlay HUD depth

    this.tweens.add({
      targets: textObj,
      y: y - 35,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        textObj.destroy();
      }
    });
  }

  private syncState() {
    this.onStateUpdate({ ...this.gameState });
  }

  // --- PUBLIC INTERACTIVE CONTROLS FOR REACT HUD ---

  public updateActiveTool(toolId: string) {
    this.activeTool = toolId;
  }

  public zoomIn() {
    const nextZoom = Math.min(2.5, this.cameras.main.zoom + 0.2);
    this.cameras.main.setZoom(nextZoom);
  }

  public zoomOut() {
    const nextZoom = Math.max(0.8, this.cameras.main.zoom - 0.2);
    this.cameras.main.setZoom(nextZoom);
  }

  public handleHealAndRestore() {
    // Regenerate player fully (sleeping/eating helper)
    this.gameState.energy = 100;
    this.gameState.hour = 6; // wake up at 6 AM
    this.gameState.minute = 0;
    this.gameState.day += 1;
    this.growCropsOvernight();
    this.showTextFeedback(this.player.x, this.player.y - 30, 'Fully Rested! New Day', '#ffd166');
    this.syncState();
  }

  // --- JUICE, ANIMATIONS & PARTICLE EFFECTS ---

  private animateToolUse(toolId: string) {
    if (toolId === 'hand') return;

    // Determine direction based on player anim
    const currentAnim = this.player.anims.currentAnim;
    let dir = 'down';
    if (currentAnim) {
      if (currentAnim.key.includes('left')) dir = 'left';
      else if (currentAnim.key.includes('right')) dir = 'right';
      else if (currentAnim.key.includes('up')) dir = 'up';
    }

    let tx = this.player.x;
    let ty = this.player.y - 8;
    let startAngle = 0;
    let endAngle = 0;

    if (dir === 'down') {
      tx += 6;
      ty += 2;
      startAngle = -80;
      endAngle = 10;
    } else if (dir === 'up') {
      tx -= 6;
      ty -= 6;
      startAngle = 80;
      endAngle = -10;
    } else if (dir === 'left') {
      tx -= 6;
      startAngle = 45;
      endAngle = -45;
    } else if (dir === 'right') {
      tx += 6;
      startAngle = -45;
      endAngle = 45;
    }

    let textureKey = 'tool_hoe';
    if (toolId === 'water_can' || toolId === 'gold_watering_can') {
      textureKey = 'tool_water_can';
      this.playSynthBeep(440, 'sine', 0.15);
    } else if (toolId === 'axe') {
      textureKey = 'tool_axe';
      this.playSynthBeep(120, 'square', 0.08);
    } else if (toolId === 'pickaxe') {
      textureKey = 'tool_pickaxe';
      this.playSynthBeep(520, 'sawtooth', 0.06);
    } else if (toolId === 'scythe') {
      textureKey = 'tool_scythe';
      this.playSynthBeep(330, 'triangle', 0.1);
    } else if (toolId === 'fishing_rod') {
      textureKey = 'tool_fishing_rod';
      this.playSynthBeep(300, 'sine', 0.15);
    } else if (toolId.endsWith('_seeds')) {
      this.playSynthBeep(600, 'sine', 0.05);
      this.spawnPlantingParticles(this.player.x, this.player.y);
      return;
    } else {
      this.playSynthBeep(220, 'triangle', 0.1); // default hoe
    }

    const toolSprite = this.add.sprite(tx, ty, textureKey);
    toolSprite.setDepth(this.player.depth + 1);
    toolSprite.setAngle(startAngle);
    toolSprite.setOrigin(0.5, 0.9);

    if (toolId === 'water_can' || toolId === 'gold_watering_can') {
      this.tweens.add({
        targets: toolSprite,
        angle: dir === 'left' ? -35 : 35,
        duration: 250,
        yoyo: true,
        repeat: 0,
        onStart: () => {
          this.spawnWaterParticles(tx + (dir === 'left' ? -8 : 8), ty + 4);
        },
        onComplete: () => {
          toolSprite.destroy();
        }
      });
    } else {
      this.tweens.add({
        targets: toolSprite,
        angle: endAngle,
        duration: 150,
        yoyo: true,
        repeat: 0,
        onComplete: () => {
          toolSprite.destroy();
        }
      });
    }
  }

  private spawnWaterParticles(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      const drop = this.add.graphics();
      drop.fillStyle(0x4cc9f0, 0.85);
      drop.fillCircle(0, 0, 1.5 + Math.random() * 2);
      drop.setPosition(x, y);
      drop.setDepth(this.player.depth + 2);

      const vx = (Math.random() - 0.5) * 35;
      const vy = 15 + Math.random() * 35;

      this.tweens.add({
        targets: drop,
        x: x + vx,
        y: y + vy,
        alpha: 0,
        scaleX: 0.4,
        scaleY: 0.4,
        duration: 300 + Math.random() * 200,
        onComplete: () => drop.destroy()
      });
    }
  }

  private spawnPlantingParticles(x: number, y: number) {
    for (let i = 0; i < 10; i++) {
      const seed = this.add.graphics();
      const isGreen = Math.random() > 0.5;
      seed.fillStyle(isGreen ? 0x8bc34a : 0xad7f58, 0.95);
      seed.fillRect(-1, -1, 2, 2);
      seed.setPosition(x, y - 4);
      seed.setDepth(this.player.depth + 2);

      const vx = (Math.random() - 0.5) * 45;
      const vy = -5 - Math.random() * 25;

      this.tweens.add({
        targets: seed,
        x: x + vx,
        y: y + vy,
        alpha: 0,
        angle: Math.random() * 360,
        duration: 350 + Math.random() * 150,
        onComplete: () => seed.destroy()
      });
    }
  }

  private spawnHarvestParticles(x: number, y: number, colorHex: string) {
    const color = parseInt(colorHex.replace('#', '0x'), 16);
    for (let i = 0; i < 12; i++) {
      const p = this.add.graphics();
      p.fillStyle(color, 0.85);
      p.fillCircle(0, 0, 2 + Math.random() * 3);
      p.setPosition(x, y);
      p.setDepth(y + 10);

      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 50;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 20;

      this.tweens.add({
        targets: p,
        x: x + vx,
        y: y + vy,
        alpha: 0,
        scaleX: 0.3,
        scaleY: 0.3,
        duration: 450 + Math.random() * 300,
        onComplete: () => p.destroy()
      });
    }
  }

  private spawnFlyingCoins(sourceX: number, sourceY: number, amount: number) {
    const cam = this.cameras.main;
    const screenX = (sourceX - cam.scrollX) * cam.zoom;
    const screenY = (sourceY - cam.scrollY) * cam.zoom;
    const coinsToSpawn = Math.min(8, Math.max(3, Math.floor(amount / 5)));

    for (let i = 0; i < coinsToSpawn; i++) {
      this.time.delayedCall(i * 100, () => {
        const coin = this.add.graphics();
        coin.fillStyle(0xffc107, 1);
        coin.lineStyle(1.5, 0xd84315, 1);
        coin.fillCircle(0, 0, 5);
        coin.strokeCircle(0, 0, 5);
        coin.setPosition(screenX, screenY);
        coin.setScrollFactor(0);
        coin.setDepth(10000);

        const burstX = (Math.random() - 0.5) * 45;
        const burstY = (Math.random() - 0.5) * 45 - 20;

        this.tweens.add({
          targets: coin,
          x: screenX + burstX,
          y: screenY + burstY,
          duration: 300,
          ease: 'Cubic.easeOut',
          onComplete: () => {
            const hudX = window.innerWidth > 640 ? window.innerWidth - 300 : window.innerWidth - 80;
            const hudY = 30;

            this.tweens.add({
              targets: coin,
              x: hudX,
              y: hudY,
              scaleX: 0.6,
              scaleY: 0.6,
              duration: 600,
              ease: 'Quad.easeIn',
              onComplete: () => {
                coin.destroy();
                if (i === 0) {
                  this.showTextFeedback(this.player.x, this.player.y - 35, `+${amount}g`, '#ffeb3b');
                }
              }
            });
          }
        });
      });
    }
  }

  private spawnFlyingXP(sourceX: number, sourceY: number, amount: number) {
    const cam = this.cameras.main;
    const screenX = (sourceX - cam.scrollX) * cam.zoom;
    const screenY = (sourceY - cam.scrollY) * cam.zoom;
    const xpToSpawn = Math.min(8, Math.max(3, Math.floor(amount / 5)));

    for (let i = 0; i < xpToSpawn; i++) {
      this.time.delayedCall(i * 100, () => {
        const star = this.add.graphics();
        star.fillStyle(0x8bc34a, 1);
        star.lineStyle(1, 0xffffff, 0.8);
        
        star.beginPath();
        star.moveTo(0, -6);
        star.lineTo(2, -2);
        star.lineTo(6, 0);
        star.lineTo(2, 2);
        star.lineTo(0, 6);
        star.lineTo(-2, 2);
        star.lineTo(-6, 0);
        star.lineTo(-2, -2);
        star.closePath();
        star.fill();
        star.stroke();

        star.setPosition(screenX, screenY);
        star.setScrollFactor(0);
        star.setDepth(10000);

        const burstX = (Math.random() - 0.5) * 45;
        const burstY = (Math.random() - 0.5) * 45 - 20;

        this.tweens.add({
          targets: star,
          x: screenX + burstX,
          y: screenY + burstY,
          duration: 300,
          ease: 'Cubic.easeOut',
          onComplete: () => {
            const hudX = window.innerWidth > 640 ? 300 : 180;
            const hudY = 30;

            this.tweens.add({
              targets: star,
              x: hudX,
              y: hudY,
              scaleX: 0.5,
              scaleY: 0.5,
              duration: 600,
              ease: 'Quad.easeIn',
              onComplete: () => {
                star.destroy();
                if (i === 0) {
                  this.showTextFeedback(this.player.x, this.player.y - 45, `+${amount} XP`, '#8bc34a');
                }
              }
            });
          }
        });
      });
    }
  }

  // --- FISHING MINIGAME SYSTEM ---

  private startFishing(gx: number, gy: number) {
    if (this.gameState.energy <= 0) {
      this.showTextFeedback(this.player.x, this.player.y - 20, 'No Energy!', '#e63946');
      return;
    }

    this.isFishing = true;
    this.biteActive = false;
    this.targetWaterCoord = { x: gx, y: gy };
    this.gameState.energy = Math.max(0, this.gameState.energy - 3);

    const bx = gx * this.tileSize + 16;
    const by = gy * this.tileSize + 16;

    this.fishingBobber = this.add.sprite(bx, by - 4, 'tool_fishing_rod');
    this.fishingBobber.setScale(0.8);
    this.fishingBobber.setDepth(gy + 1);

    this.fishingBobber.setPosition(this.player.x, this.player.y - 12);
    
    this.tweens.add({
      targets: this.fishingBobber,
      x: bx,
      y: by - 4,
      duration: 500,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.showTextFeedback(bx, by - 16, 'Cast!', '#4cc9f0');
        
        this.tweens.add({
          targets: this.fishingBobber,
          y: by - 1,
          duration: 1000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });

        const delay = 1500 + Math.random() * 2000;
        this.fishingTimer = this.time.delayedCall(delay, () => {
          this.triggerBite(bx, by);
        });
      }
    });

    this.fishingLine = this.add.graphics();
    this.fishingLine.setDepth(this.player.depth - 1);
  }

  private updateFishingLine() {
    if (!this.isFishing || !this.fishingLine || !this.fishingBobber) return;
    this.fishingLine.clear();
    this.fishingLine.lineStyle(1.5, 0xffffff, 0.8);
    
    const startX = this.player.x + (this.player.anims.currentAnim?.key.includes('left') ? -6 : 6);
    const startY = this.player.y - 12;

    const endX = this.fishingBobber.x;
    const endY = this.fishingBobber.y;

    this.fishingLine.beginPath();
    this.fishingLine.moveTo(startX, startY);
    
    const segments = 12;
    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const px = startX + (endX - startX) * t;
      let py = startY + (endY - startY) * t;
      // Parabolic slack sag
      const droop = Math.sin(t * Math.PI) * 12;
      py += droop;
      this.fishingLine.lineTo(px, py);
    }
    
    this.fishingLine.stroke();
  }

  private triggerBite(bx: number, by: number) {
    if (!this.isFishing) return;
    this.biteActive = true;
    this.showTextFeedback(bx, by - 16, 'BITE!', '#ffeb3b', 18);
    this.playSynthBeep(880, 'sine', 0.05);

    this.tweens.killTweensOf(this.fishingBobber);
    this.tweens.add({
      targets: this.fishingBobber,
      x: bx + (Math.random() - 0.5) * 4,
      y: by + 2,
      duration: 80,
      yoyo: true,
      repeat: -1
    });

    for (let i = 0; i < 6; i++) {
      const drop = this.add.graphics();
      drop.fillStyle(0xffffff, 0.85);
      drop.fillCircle(0, 0, 2);
      drop.setPosition(bx, by);
      this.tweens.add({
        targets: drop,
        x: bx + (Math.random() - 0.5) * 35,
        y: by + (Math.random() - 0.5) * 15 - 10,
        alpha: 0,
        duration: 400,
        onComplete: () => drop.destroy()
      });
    }

    this.fishingTimer = this.time.delayedCall(1200, () => {
      if (this.biteActive) {
        this.showTextFeedback(this.player.x, this.player.y - 20, 'Got away...', '#ff5555');
        this.resetFishing();
      }
    });
  }

  private catchFish(gx: number, gy: number) {
    this.isFishing = false;

    // Caught fanfare notes
    this.playSynthBeep(520, 'sine', 0.1);
    this.time.delayedCall(100, () => this.playSynthBeep(659, 'sine', 0.1));
    this.time.delayedCall(200, () => this.playSynthBeep(880, 'sine', 0.25));

    const r = Math.random();
    let fishId = 'fish_trout';
    let fishName = 'Rainbow Trout';
    let fishColor = '#4895ef';
    let fishDesc = 'A colorful river trout.';
    let xpAward = 25;

    if (r > 0.85) {
      fishId = 'fish_carp';
      fishName = 'Golden Carp';
      fishColor = '#ffd166';
      fishDesc = 'An extremely rare shimmering golden carp.';
      xpAward = 60;
    } else if (r > 0.50) {
      fishId = 'fish_salmon';
      fishName = 'River Salmon';
      fishColor = '#ffcad4';
      fishDesc = 'A strong, fresh pink river salmon.';
      xpAward = 40;
    }

    const tx = gx * this.tileSize + 16;
    const ty = gy * this.tileSize + 16;

    this.addInventoryItem(fishId, fishName, 'crop', 1, fishColor, fishDesc);
    this.addXP(xpAward);

    this.spawnHarvestParticles(tx, ty, fishColor);
    this.spawnFlyingXP(tx, ty, xpAward);

    this.showTextFeedback(this.player.x, this.player.y - 35, `Caught: ${fishName}!`, '#ffd166', 16);

    this.resetFishing();
  }

  private resetFishing() {
    this.isFishing = false;
    this.biteActive = false;
    if (this.fishingTimer) {
      this.fishingTimer.destroy();
      this.fishingTimer = null;
    }
    if (this.fishingBobber) {
      this.tweens.killTweensOf(this.fishingBobber);
      this.fishingBobber.destroy();
      this.fishingBobber = null;
    }
    if (this.fishingLine) {
      this.fishingLine.destroy();
      this.fishingLine = null;
    }
    this.syncState();
  }

  private playSynthBeep(freq = 440, type: OscillatorType = 'sine', dur = 0.08) {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch (e) {}
  }

  // --- AMBIENT DAY/NIGHT LIGHTING SYSTEM ---

  private updateLighting() {
    const hour = this.gameState.hour;
    const minute = this.gameState.minute;

    // Smooth color interpolation & opacity
    let r = 255;
    let g = 255;
    let b = 255;
    let alpha = 0.0;

    if (hour >= 21 || hour < 4) {
      // Deep Night
      r = 30; g = 25; b = 85;
      alpha = 0.45;
    } else if (hour >= 4 && hour < 6) {
      // Dawn transition (indigo to warm pink/gold)
      const ratio = (hour - 4 + minute / 60) / 2;
      r = Phaser.Math.Linear(30, 230, ratio);
      g = Phaser.Math.Linear(25, 170, ratio);
      b = Phaser.Math.Linear(85, 130, ratio);
      alpha = Phaser.Math.Linear(0.45, 0.25, ratio);
    } else if (hour >= 6 && hour < 10) {
      // Golden morning (ambient gold settling into clear light)
      const ratio = (hour - 6 + minute / 60) / 4;
      r = Phaser.Math.Linear(230, 255, ratio);
      g = Phaser.Math.Linear(170, 255, ratio);
      b = Phaser.Math.Linear(130, 255, ratio);
      alpha = Phaser.Math.Linear(0.25, 0.0, ratio);
    } else if (hour >= 10 && hour < 17) {
      // Bright daylight
      r = 255; g = 255; b = 255;
      alpha = 0.0;
    } else if (hour >= 17 && hour < 19) {
      // Sunset transition (daylight to rich golden amber)
      const ratio = (hour - 17 + minute / 60) / 2;
      r = Phaser.Math.Linear(255, 230, ratio);
      g = Phaser.Math.Linear(255, 110, ratio);
      b = Phaser.Math.Linear(255, 70, ratio);
      alpha = Phaser.Math.Linear(0.0, 0.35, ratio);
    } else if (hour >= 19 && hour < 21) {
      // Twilight transition (amber to dark purple)
      const ratio = (hour - 19 + minute / 60) / 2;
      r = Phaser.Math.Linear(230, 30, ratio);
      g = Phaser.Math.Linear(110, 25, ratio);
      b = Phaser.Math.Linear(70, 85, ratio);
      alpha = Phaser.Math.Linear(0.35, 0.45, ratio);
    }

    // Adjust color and opacity further for cloudy/rainy/stormy weather
    const weather = this.gameState.weather;
    if (weather === 'Rain' || weather === 'Storm') {
      r = Math.floor(r * 0.7);
      g = Math.floor(g * 0.75);
      b = Math.floor(b * 0.85);
      alpha = Math.max(alpha, 0.3);
    } else if (weather === 'Cloudy') {
      r = Math.floor(r * 0.85);
      g = Math.floor(g * 0.85);
      b = Math.floor(b * 0.9);
      alpha = Math.max(alpha, 0.15);
    }

    const hexColor = (r << 16) + (g << 8) + b;
    
    // Draw the lighting layer overlay
    this.lightingOverlay.clear();
    if (alpha > 0) {
      this.lightingOverlay.fillStyle(hexColor, alpha);
      this.lightingOverlay.fillRect(0, 0, this.scale.width, this.scale.height);
      this.lightingOverlay.setBlendMode(Phaser.BlendModes.MULTIPLY);
    }
  }

  // --- WEATHER OVERLAY RENDERING SYSTEM ---

  private drawWeatherEffects() {
    this.weatherGraphics.clear();
    const weather = this.gameState.weather;
    if (!weather) return;

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    if (weather === 'Rain' || weather === 'Storm') {
      // Initialize rain particles if empty
      if (this.rainParticles.length === 0) {
        for (let i = 0; i < 60; i++) {
          this.rainParticles.push({
            x: Math.random() * screenW,
            y: Math.random() * screenH,
            speed: 12 + Math.random() * 8,
            len: 10 + Math.random() * 10
          });
        }
      }

      // Draw and move rain
      this.weatherGraphics.lineStyle(1.5, 0x74a2e6, 0.45);
      this.rainParticles.forEach(p => {
        this.weatherGraphics.beginPath();
        this.weatherGraphics.moveTo(p.x, p.y);
        this.weatherGraphics.lineTo(p.x - 2, p.y + p.len);
        this.weatherGraphics.strokePath();

        // Move diagonal down
        p.y += p.speed;
        p.x -= 1;

        if (p.y > screenH) {
          p.y = -10;
          p.x = Math.random() * screenW;
        }
      });

      // Storm lightning flashes
      if (weather === 'Storm' && Math.random() < 0.003) {
        // Play lightning flash!
        this.cameras.main.flash(150, 255, 255, 255);
        this.playSynthBeep(180, 'sawtooth', 0.4); // Rumble sound!
      }
    } else if (weather === 'Wind') {
      // Wind leaves / currents
      if (this.windParticles.length === 0) {
        for (let i = 0; i < 20; i++) {
          this.windParticles.push({
            x: Math.random() * screenW,
            y: Math.random() * screenH,
            speed: 2 + Math.random() * 3,
            size: 3 + Math.random() * 3
          });
        }
      }

      this.weatherGraphics.fillStyle(0xaacc88, 0.6); // Greenish leaf particles
      this.windParticles.forEach(p => {
        this.weatherGraphics.fillRect(p.x, p.y, p.size, p.size / 2);
        
        // Move horizontal right
        p.x += p.speed;
        p.y += Math.sin(p.x * 0.02) * 0.5;

        if (p.x > screenW) {
          p.x = -10;
          p.y = Math.random() * screenH;
        }
      });
    }
  }

  private lastGreenhouseLevel = -1;
  private lastShedLevel = -1;
  private lastWorkshopLevel = -1;
  private lastBakeryLevel = -1;
  private lastStorageLevel = -1;

  public updateBuildingsFromState() {
    if (!this.gameState || !this.gameState.buildings) return;

    const b = this.gameState.buildings;

    if (b.greenhouse.level !== this.lastGreenhouseLevel) {
      this.lastGreenhouseLevel = b.greenhouse.level;
      const sp = this.buildingSprites['greenhouse'];
      if (sp) {
        sp.setTexture(b.greenhouse.level > 0 ? 'bld_greenhouse_clean' : 'bld_greenhouse_ruined');
      }
    }

    if (b.shed.level !== this.lastShedLevel) {
      this.lastShedLevel = b.shed.level;
      const sp = this.buildingSprites['shed'];
      if (sp) {
        if (b.shed.level > 0) sp.clearTint();
        else sp.setTint(0x888888);
      }
    }

    if (b.workshop.level !== this.lastWorkshopLevel) {
      this.lastWorkshopLevel = b.workshop.level;
      const sp = this.buildingSprites['workshop'];
      if (sp) {
        if (b.workshop.level > 0) sp.clearTint();
        else sp.setTint(0x7c7c7c);
      }
    }

    if (b.bakery.level !== this.lastBakeryLevel) {
      this.lastBakeryLevel = b.bakery.level;
      const sp = this.buildingSprites['bakery'];
      if (sp) {
        if (b.bakery.level > 0) sp.clearTint();
        else sp.setTint(0x7c7c7c);
      }
    }

    if (b.storage.level !== this.lastStorageLevel) {
      this.lastStorageLevel = b.storage.level;
      const sp = this.buildingSprites['storage'];
      if (sp) {
        if (b.storage.level > 0) sp.clearTint();
        else sp.setTint(0x7c7c7c);
      }
    }
  }
}
