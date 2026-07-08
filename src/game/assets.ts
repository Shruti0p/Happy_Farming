import Phaser from 'phaser';

/**
 * Procedurally generates high-quality textures for the 2D Farming Simulation Game.
 * This guarantees flawless, offline-first asset loading without CORS or broken URLs.
 * It produces a beautiful, modern, crisp, vibrant pixel/vector aesthetic.
 */
export function generateProceduralTextures(scene: Phaser.Scene) {
  const textures = scene.textures;

  // --- HELPER TO CREATE CANVAS TEXTURE ---
  const createTexture = (
    key: string,
    width: number,
    height: number,
    drawFn: (ctx: CanvasRenderingContext2D) => void
  ) => {
    if (textures.exists(key)) return;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      drawFn(ctx);
    }
    textures.addCanvas(key, canvas);
  };

  // Helper to add spritesheet frames to an existing canvas texture
  const addFrames = (key: string, frameWidth: number, frameHeight: number) => {
    const ct = textures.get(key) as Phaser.Textures.CanvasTexture;
    if (!ct) return;
    const cols = Math.floor(ct.width / frameWidth);
    const rows = Math.floor(ct.height / frameHeight);
    let frameIndex = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        ct.add(frameIndex, 0, c * frameWidth, r * frameHeight, frameWidth, frameHeight);
        frameIndex++;
      }
    }
  };

  // --- 1. TILES (32x32) ---

  // Grass Tile
  createTexture('tile_grass', 32, 32, (ctx) => {
    ctx.fillStyle = '#6ab845'; // Soft vibrant green
    ctx.fillRect(0, 0, 32, 32);

    // Subtle grass blades / variations
    ctx.fillStyle = '#5ba439';
    // Draw tiny grass blade clusters
    const drawBlades = (x: number, y: number) => {
      ctx.fillRect(x, y, 2, 4);
      ctx.fillRect(x - 1, y + 1, 1, 3);
      ctx.fillRect(x + 2, y + 2, 1, 2);
    };
    drawBlades(4, 6);
    drawBlades(20, 4);
    drawBlades(12, 18);
    drawBlades(26, 22);
    drawBlades(6, 26);

    ctx.fillStyle = '#77c651'; // Highlights
    ctx.fillRect(5, 5, 2, 1);
    ctx.fillRect(21, 3, 2, 1);
    ctx.fillRect(13, 17, 2, 1);
  });

  // Dirt Tile
  createTexture('tile_dirt', 32, 32, (ctx) => {
    ctx.fillStyle = '#ad7f58'; // Rich earth brown
    ctx.fillRect(0, 0, 32, 32);

    // Grain texture
    ctx.fillStyle = '#946640';
    ctx.fillRect(3, 4, 2, 2);
    ctx.fillRect(15, 8, 3, 1);
    ctx.fillRect(8, 16, 2, 2);
    ctx.fillRect(24, 12, 1, 3);
    ctx.fillRect(18, 22, 3, 1);
    ctx.fillRect(5, 26, 2, 2);
    ctx.fillRect(26, 25, 2, 2);

    // Light specks
    ctx.fillStyle = '#bd8f68';
    ctx.fillRect(6, 2, 1, 1);
    ctx.fillRect(20, 7, 2, 1);
    ctx.fillRect(11, 20, 1, 1);
    ctx.fillRect(25, 18, 1, 1);
  });

  // Plowed Land - Dry (Farm Land)
  createTexture('tile_plowed_dry', 32, 32, (ctx) => {
    ctx.fillStyle = '#7a4f30'; // Dark tilled soil
    ctx.fillRect(0, 0, 32, 32);

    // Soil ridges / furrows
    ctx.fillStyle = '#5c3920';
    ctx.fillRect(0, 4, 32, 3);
    ctx.fillRect(0, 12, 32, 3);
    ctx.fillRect(0, 20, 32, 3);
    ctx.fillRect(0, 28, 32, 3);

    // Texture dots
    ctx.fillStyle = '#422714';
    ctx.fillRect(5, 10, 2, 2);
    ctx.fillRect(18, 18, 2, 2);
    ctx.fillRect(26, 6, 2, 2);
    ctx.fillRect(10, 26, 2, 2);
  });

  // Plowed Land - Wet (Watered Farm Land)
  createTexture('tile_plowed_wet', 32, 32, (ctx) => {
    ctx.fillStyle = '#4b2f1c'; // Very dark moist tilled soil
    ctx.fillRect(0, 0, 32, 32);

    // Moist furrows
    ctx.fillStyle = '#321e10';
    ctx.fillRect(0, 4, 32, 3);
    ctx.fillRect(0, 12, 32, 3);
    ctx.fillRect(0, 20, 32, 3);
    ctx.fillRect(0, 28, 32, 3);

    // Darker dots
    ctx.fillStyle = '#1f1209';
    ctx.fillRect(5, 10, 2, 2);
    ctx.fillRect(18, 18, 2, 2);
    ctx.fillRect(26, 6, 2, 2);

    // Shiny specular highlights
    ctx.fillStyle = '#6a4730';
    ctx.fillRect(8, 2, 2, 1);
    ctx.fillRect(22, 10, 3, 1);
    ctx.fillRect(12, 18, 2, 1);
    ctx.fillRect(4, 26, 3, 1);
  });

  // Animated Water Spritesheet (32x96 total - 3 frames of 32x32)
  createTexture('tile_water', 32, 96, (ctx) => {
    const frames = 3;
    const colors = ['#3a81cf', '#3075c2', '#2768b5']; // Shading bases
    const rippleColors = ['#5ea3f2', '#7fbcfc', '#4d93e8'];

    for (let f = 0; f < frames; f++) {
      const yOffset = f * 32;

      // Base water
      ctx.fillStyle = colors[0];
      ctx.fillRect(0, yOffset, 32, 32);

      // Deep shading lines
      ctx.fillStyle = colors[2];
      ctx.fillRect(0, yOffset + 14, 32, 2);
      ctx.fillRect(0, yOffset + 30, 32, 2);

      // Waves ripple - Frame animation variations
      ctx.fillStyle = rippleColors[0];
      if (f === 0) {
        ctx.fillRect(4, yOffset + 6, 8, 2);
        ctx.fillRect(18, yOffset + 8, 10, 2);
        ctx.fillRect(2, yOffset + 20, 12, 2);
        ctx.fillRect(20, yOffset + 24, 8, 2);
      } else if (f === 1) {
        ctx.fillRect(6, yOffset + 7, 8, 2);
        ctx.fillRect(16, yOffset + 9, 10, 2);
        ctx.fillRect(4, yOffset + 21, 12, 2);
        ctx.fillRect(18, yOffset + 23, 8, 2);
      } else {
        ctx.fillRect(5, yOffset + 5, 8, 2);
        ctx.fillRect(20, yOffset + 7, 10, 2);
        ctx.fillRect(3, yOffset + 19, 12, 2);
        ctx.fillRect(22, yOffset + 25, 8, 2);
      }

      // Shine specks
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.4;
      if (f === 0) {
        ctx.fillRect(10, yOffset + 6, 2, 1);
        ctx.fillRect(22, yOffset + 24, 2, 1);
      } else if (f === 1) {
        ctx.fillRect(12, yOffset + 7, 2, 1);
        ctx.fillRect(20, yOffset + 23, 2, 1);
      } else {
        ctx.fillRect(8, yOffset + 5, 2, 1);
        ctx.fillRect(24, yOffset + 25, 2, 1);
      }
      ctx.globalAlpha = 1.0;
    }
  });
  addFrames('tile_water', 32, 32);

  // Wooden Bridge (32x32)
  createTexture('tile_bridge', 32, 32, (ctx) => {
    ctx.fillStyle = '#8f5c35'; // Bridge wood base
    ctx.fillRect(0, 0, 32, 32);

    // Horizontal Planks
    ctx.fillStyle = '#5c381c';
    ctx.fillRect(0, 0, 32, 2);
    ctx.fillRect(0, 7, 32, 2);
    ctx.fillRect(0, 15, 32, 2);
    ctx.fillRect(0, 23, 32, 2);
    ctx.fillRect(0, 30, 32, 2);

    // Vertical ropes / guard rails on edges
    ctx.fillStyle = '#d1a473';
    ctx.fillRect(0, 0, 4, 32);
    ctx.fillRect(28, 0, 4, 32);

    // Rope details
    ctx.fillStyle = '#3d230f';
    for (let i = 2; i < 32; i += 6) {
      ctx.fillRect(0, i, 4, 2);
      ctx.fillRect(28, i, 4, 2);
    }
  });

  // Fence Tile (32x32)
  createTexture('fence_wood', 32, 32, (ctx) => {
    // Transparent background
    ctx.clearRect(0, 0, 32, 32);

    // Shadows
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(4, 26, 24, 4);

    // Left post
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(4, 6, 6, 22);
    ctx.fillStyle = '#a06d3b';
    ctx.fillRect(5, 6, 2, 22); // highlight
    ctx.fillStyle = '#6a401a';
    ctx.fillRect(4, 26, 6, 2); // bottom border

    // Right post
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(22, 6, 6, 22);
    ctx.fillStyle = '#a06d3b';
    ctx.fillRect(23, 6, 2, 22); // highlight
    ctx.fillStyle = '#6a401a';
    ctx.fillRect(22, 26, 6, 2); // bottom border

    // Horizontal rails
    ctx.fillStyle = '#7a4e23';
    ctx.fillRect(4, 10, 24, 4);
    ctx.fillRect(4, 20, 24, 4);

    ctx.fillStyle = '#905d2c';
    ctx.fillRect(10, 10, 12, 1); // rails highlight
    ctx.fillRect(10, 20, 12, 1);
  });

  // Path Tile (32x32)
  createTexture('tile_path', 32, 32, (ctx) => {
    ctx.fillStyle = '#d9b382'; // Light sandy/stone path
    ctx.fillRect(0, 0, 32, 32);

    // Stepping stones
    ctx.fillStyle = '#bfa17c';
    const drawStone = (x: number, y: number, w: number, h: number) => {
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#e5cca8';
      ctx.fillRect(x + 1, y, w - 2, 1); // stone highlight
      ctx.fillStyle = '#bfa17c';
    };

    drawStone(3, 4, 10, 8);
    drawStone(16, 2, 12, 10);
    drawStone(2, 16, 12, 12);
    drawStone(18, 15, 11, 11);
    drawStone(10, 24, 12, 6);
  });


  // --- 2. NATURE & ENVIRONMENTAL OBJECTS ---

  // Tree (64x64) - Shadow + Trunk + Layers of leafy circles
  createTexture('obj_tree', 64, 64, (ctx) => {
    ctx.clearRect(0, 0, 64, 64);

    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(32, 56, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wood Trunk
    ctx.fillStyle = '#5c3a21';
    ctx.fillRect(28, 32, 8, 24);
    // Trunk detail
    ctx.fillStyle = '#3c2412';
    ctx.fillRect(28, 40, 2, 16);
    ctx.fillRect(34, 35, 2, 15);

    // Green Foliage Layers (Rich puffy vector layers)
    const drawFoliage = (x: number, y: number, r: number, color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    // Layer 1 - Dark Background Green
    drawFoliage(32, 22, 20, '#2d6a4f');
    drawFoliage(22, 26, 16, '#2d6a4f');
    drawFoliage(42, 26, 16, '#2d6a4f');

    // Layer 2 - Medium Vibrant Green
    drawFoliage(32, 18, 17, '#40916c');
    drawFoliage(24, 22, 13, '#40916c');
    drawFoliage(40, 22, 13, '#40916c');
    drawFoliage(32, 28, 14, '#40916c');

    // Layer 3 - Light Highlight Green
    drawFoliage(30, 14, 13, '#52b788');
    drawFoliage(24, 18, 9, '#52b788');
    drawFoliage(38, 18, 9, '#52b788');

    // Layer 4 - Extra bright sun highlights
    ctx.fillStyle = '#74c69d';
    ctx.beginPath();
    ctx.arc(28, 12, 6, 0, Math.PI * 2);
    ctx.arc(36, 14, 5, 0, Math.PI * 2);
    ctx.fill();

    // Cute red apples
    ctx.fillStyle = '#e63946';
    const drawApple = (ax: number, ay: number) => {
      ctx.beginPath();
      ctx.arc(ax, ay, 2.5, 0, Math.PI * 2);
      ctx.fill();
    };
    drawApple(24, 22);
    drawApple(42, 25);
    drawApple(30, 16);
    drawApple(36, 28);
    drawApple(18, 28);
  });

  // Rock (32x32)
  createTexture('obj_rock', 32, 32, (ctx) => {
    ctx.clearRect(0, 0, 32, 32);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(16, 26, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rock base
    ctx.fillStyle = '#7a828a';
    ctx.beginPath();
    ctx.moveTo(6, 24);
    ctx.lineTo(26, 24);
    ctx.lineTo(28, 18);
    ctx.lineTo(22, 10);
    ctx.lineTo(12, 8);
    ctx.lineTo(4, 16);
    ctx.closePath();
    ctx.fill();

    // Rock Shading (Dark side)
    ctx.fillStyle = '#5c636a';
    ctx.beginPath();
    ctx.moveTo(16, 8);
    ctx.lineTo(22, 10);
    ctx.lineTo(28, 18);
    ctx.lineTo(26, 24);
    ctx.lineTo(18, 24);
    ctx.closePath();
    ctx.fill();

    // Highlights (Sunlit side)
    ctx.fillStyle = '#9ca4ad';
    ctx.beginPath();
    ctx.moveTo(6, 24);
    ctx.lineTo(12, 24);
    ctx.lineTo(10, 16);
    ctx.lineTo(4, 16);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(12, 8);
    ctx.lineTo(16, 8);
    ctx.lineTo(14, 15);
    ctx.lineTo(10, 16);
    ctx.closePath();
    ctx.fill();

    // Cracks
    ctx.strokeStyle = '#343a40';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(15, 12);
    ctx.lineTo(13, 18);
    ctx.lineTo(16, 22);
    ctx.stroke();
  });

  // Bush (32x32)
  createTexture('obj_bush', 32, 32, (ctx) => {
    ctx.clearRect(0, 0, 32, 32);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(16, 26, 10, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Leaf spheres
    const drawLeaf = (cx: number, cy: number, r: number, col: string) => {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    };

    drawLeaf(16, 16, 10, '#38b000');
    drawLeaf(10, 18, 8, '#38b000');
    drawLeaf(22, 18, 8, '#38b000');
    drawLeaf(16, 12, 8, '#70e000'); // Top highlight

    // Berries
    ctx.fillStyle = '#f72585';
    ctx.fillRect(8, 15, 2, 2);
    ctx.fillRect(18, 11, 2, 2);
    ctx.fillRect(22, 16, 2, 2);
    ctx.fillRect(14, 20, 2, 2);
  });

  // Flower (16x16)
  createTexture('obj_flower', 16, 16, (ctx) => {
    ctx.clearRect(0, 0, 16, 16);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(5, 13, 6, 2);

    // Stem
    ctx.fillStyle = '#38b000';
    ctx.fillRect(7, 8, 2, 6);

    // Petals (Colorful star)
    ctx.fillStyle = '#f15bb5';
    ctx.fillRect(5, 5, 6, 2);
    ctx.fillRect(7, 3, 2, 6);

    // Center
    ctx.fillStyle = '#fee440';
    ctx.fillRect(7, 5, 2, 2);
  });


  // --- 3. CROPS & GROWING TILES (32x32) ---
  // We'll pre-draw different growing stages for generic crops, and color-tune them dynamically in code,
  // or build specific sheets. Let's create a 4-stage sheet for Crops (32 width, 128 height - 4 stages of 32x32)
  const createCropSheet = (id: string, ripeColor: string) => {
    createTexture(`crop_${id}`, 32, 128, (ctx) => {
      ctx.clearRect(0, 0, 32, 128);

      // --- STAGE 0: Seedling (0-32px) ---
      // Tiny green sprout in dirt
      ctx.fillStyle = '#7a5135'; // Dirt mount
      ctx.fillRect(10, 26, 12, 3);
      ctx.fillStyle = '#4cc9f0'; // Little leaf
      ctx.fillStyle = '#4ea832';
      ctx.fillRect(15, 22, 2, 5);
      ctx.fillRect(13, 23, 2, 1);
      ctx.fillRect(17, 21, 2, 1);

      // --- STAGE 1: Sprout (32-64px) ---
      const y1 = 32;
      ctx.fillStyle = '#7a5135'; // Dirt mount
      ctx.fillRect(8, y1 + 25, 16, 4);
      ctx.fillStyle = '#4ea832';
      ctx.fillRect(15, y1 + 14, 2, 12); // main stem
      ctx.fillRect(11, y1 + 18, 4, 2); // side stem
      ctx.fillRect(17, y1 + 16, 4, 2); // side stem
      ctx.fillStyle = '#70e000'; // light leaves
      ctx.fillRect(9, y1 + 16, 2, 2);
      ctx.fillRect(21, y1 + 14, 2, 2);
      ctx.fillRect(14, y1 + 12, 4, 2);

      // --- STAGE 2: Growing Bush (64-96px) ---
      const y2 = 64;
      ctx.fillStyle = '#7a5135';
      ctx.fillRect(6, y2 + 25, 20, 4);
      ctx.fillStyle = '#38b000';
      // Main leafy bush shape
      ctx.beginPath();
      ctx.arc(16, y2 + 18, 6, 0, Math.PI * 2);
      ctx.arc(11, y2 + 20, 5, 0, Math.PI * 2);
      ctx.arc(21, y2 + 20, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#70e000'; // Top highlights
      ctx.beginPath();
      ctx.arc(16, y2 + 15, 4, 0, Math.PI * 2);
      ctx.fill();

      // --- STAGE 3: Ripe Plant (96-128px) ---
      const y3 = 96;
      ctx.fillStyle = '#7a5135';
      ctx.fillRect(6, y3 + 25, 20, 4);
      ctx.fillStyle = '#38b000';
      ctx.beginPath();
      ctx.arc(16, y3 + 16, 7, 0, Math.PI * 2);
      ctx.arc(10, y3 + 18, 6, 0, Math.PI * 2);
      ctx.arc(22, y3 + 18, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#70e000';
      ctx.beginPath();
      ctx.arc(16, y3 + 13, 5, 0, Math.PI * 2);
      ctx.fill();

      // Add actual Ripe Fruits/Veggies based on crop type
      ctx.fillStyle = ripeColor;
      if (id === 'wheat') {
        // Wheat heads growing high
        ctx.fillStyle = '#f3c041';
        ctx.fillRect(12, y3 + 4, 2, 10);
        ctx.fillRect(18, y3 + 2, 2, 12);
        ctx.fillRect(15, y3 + 7, 2, 9);
        // little yellow grains
        ctx.fillStyle = '#fff099';
        ctx.fillRect(11, y3 + 3, 2, 2);
        ctx.fillRect(19, y3 + 1, 2, 2);
        ctx.fillRect(14, y3 + 5, 2, 2);
      } else if (id === 'tomato') {
        // Red juicy round tomatoes
        ctx.fillStyle = '#e63946';
        ctx.beginPath();
        ctx.arc(12, y3 + 16, 3, 0, Math.PI * 2);
        ctx.arc(20, y3 + 14, 3.5, 0, Math.PI * 2);
        ctx.arc(16, y3 + 21, 3, 0, Math.PI * 2);
        ctx.fill();
        // Little white shine
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(21, y3 + 12, 1, 1);
        ctx.fillRect(13, y3 + 14, 1, 1);
      } else if (id === 'carrot') {
        // Orange carrot tops peaking out of soil
        ctx.fillStyle = '#f77f00';
        ctx.fillRect(10, y3 + 21, 4, 5);
        ctx.fillRect(18, y3 + 22, 4, 4);
        ctx.fillStyle = '#fcbf49'; // highlight orange
        ctx.fillRect(11, y3 + 21, 1, 4);
      } else if (id === 'strawberry') {
        // Bright pinkish red strawberries hanging low
        ctx.fillStyle = '#ff006e';
        // Heartish berry shapes
        const drawBerry = (bx: number, by: number) => {
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(bx - 3, by - 2);
          ctx.lineTo(bx + 3, by - 2);
          ctx.closePath();
          ctx.fill();
        };
        drawBerry(11, y3 + 22);
        drawBerry(21, y3 + 20);
        drawBerry(16, y3 + 18);
      } else if (id === 'corn') {
        // Yellow ears of corn with green husks
        ctx.fillStyle = '#ffee32';
        ctx.fillRect(9, y3 + 10, 4, 8);
        ctx.fillRect(19, y3 + 12, 4, 7);
        ctx.fillStyle = '#38b000'; // Husks
        ctx.fillRect(8, y3 + 14, 2, 5);
        ctx.fillRect(12, y3 + 13, 1, 5);
        ctx.fillRect(18, y3 + 15, 2, 4);
      }
    });
    addFrames(`crop_${id}`, 32, 32);
  };

  createCropSheet('wheat', '#f3c041');
  createCropSheet('tomato', '#e63946');
  createCropSheet('carrot', '#f77f00');
  createCropSheet('strawberry', '#ff006e');
  createCropSheet('corn', '#ffee32');


  // --- 4. BUILDINGS ---

  // Player House (96x96) - Cozy farm cottage
  createTexture('bld_house', 96, 96, (ctx) => {
    ctx.clearRect(0, 0, 96, 96);

    // Ground Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(48, 80, 40, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wooden walls (base)
    ctx.fillStyle = '#dfb58e';
    ctx.fillRect(16, 44, 64, 34);

    // Wooden wall borders / beams
    ctx.fillStyle = '#ad7f58';
    ctx.fillRect(16, 44, 4, 34);
    ctx.fillRect(76, 44, 4, 34);
    ctx.fillRect(16, 75, 64, 3);
    ctx.fillRect(44, 44, 4, 34); // Center stud

    // Cozy Red Roof (Pitched)
    ctx.fillStyle = '#c1121f';
    ctx.beginPath();
    ctx.moveTo(8, 46);
    ctx.lineTo(48, 12);
    ctx.lineTo(88, 46);
    ctx.closePath();
    ctx.fill();

    // Roof Shading (Left side lit, right side dark)
    ctx.fillStyle = '#780000';
    ctx.beginPath();
    ctx.moveTo(48, 12);
    ctx.lineTo(88, 46);
    ctx.lineTo(48, 46);
    ctx.closePath();
    ctx.fill();

    // Roof Trim / Facade
    ctx.strokeStyle = '#fdf0d5';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(6, 47);
    ctx.lineTo(48, 11);
    ctx.lineTo(90, 47);
    ctx.stroke();

    // Stone Chimney
    ctx.fillStyle = '#6c757d';
    ctx.fillRect(66, 18, 10, 20);
    ctx.fillStyle = '#495057';
    ctx.fillRect(66, 18, 10, 3); // top border
    ctx.fillStyle = '#adb5bd';
    ctx.fillRect(66, 21, 3, 10); // highlight

    // Cozy Wooden Door
    ctx.fillStyle = '#5c381c';
    ctx.fillRect(28, 54, 12, 24);
    ctx.fillStyle = '#ffd166'; // Golden door handle
    ctx.fillRect(37, 65, 2, 2);

    // Glowing Windows
    const drawWindow = (wx: number, wy: number) => {
      // Window frame
      ctx.fillStyle = '#5c381c';
      ctx.fillRect(wx, wy, 16, 14);
      // Glow pane
      ctx.fillStyle = '#ffea00';
      ctx.fillRect(wx + 2, wy + 2, 12, 10);
      // Window cross bars
      ctx.fillStyle = '#5c381c';
      ctx.fillRect(wx + 7, wy + 2, 2, 10);
      ctx.fillRect(wx + 2, wy + 6, 12, 2);
    };

    drawWindow(54, 52);
  });

  // Red Barn (128x96)
  createTexture('bld_barn', 128, 96, (ctx) => {
    ctx.clearRect(0, 0, 128, 96);

    // Ground Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(64, 82, 54, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Red Barn Walls
    ctx.fillStyle = '#a61e1e';
    ctx.fillRect(16, 36, 96, 44);

    // Red wall paneling (vertical stripes)
    ctx.fillStyle = '#7e1010';
    for (let x = 24; x < 112; x += 12) {
      ctx.fillRect(x, 36, 2, 44);
    }

    // White Barn Trim (Corners & Edges)
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(16, 36, 4, 44);
    ctx.fillRect(108, 36, 4, 44);
    ctx.fillRect(16, 36, 96, 3); // top wall rim

    // Roof (Gambrel Roof - Classic Barn shape)
    ctx.fillStyle = '#495057'; // Slate roof
    ctx.beginPath();
    ctx.moveTo(10, 38);
    ctx.lineTo(24, 18);
    ctx.lineTo(64, 10);
    ctx.lineTo(104, 18);
    ctx.lineTo(118, 38);
    ctx.lineTo(64, 38);
    ctx.closePath();
    ctx.fill();

    // Shaded side roof
    ctx.fillStyle = '#212529';
    ctx.beginPath();
    ctx.moveTo(64, 10);
    ctx.lineTo(104, 18);
    ctx.lineTo(118, 38);
    ctx.lineTo(64, 38);
    ctx.closePath();
    ctx.fill();

    // White trim on roof line
    ctx.strokeStyle = '#f8f9fa';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(8, 39);
    ctx.lineTo(24, 17);
    ctx.lineTo(64, 9);
    ctx.lineTo(104, 17);
    ctx.lineTo(120, 39);
    ctx.stroke();

    // Massive White Sliding Barn Doors
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(48, 52, 32, 28);

    // Wood frame of doors
    ctx.fillStyle = '#bdc3c7';
    ctx.fillRect(48, 52, 2, 28);
    ctx.fillRect(78, 52, 2, 28);
    ctx.fillRect(48, 52, 32, 2);
    ctx.fillRect(48, 78, 32, 2);
    ctx.fillRect(63, 52, 2, 28); // split line

    // X bracing on sliding doors
    ctx.strokeStyle = '#c1121f';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    // Left door X
    ctx.moveTo(50, 54);
    ctx.lineTo(62, 76);
    ctx.moveTo(62, 54);
    ctx.lineTo(50, 76);
    // Right door X
    ctx.moveTo(65, 54);
    ctx.lineTo(77, 76);
    ctx.moveTo(77, 54);
    ctx.lineTo(65, 76);
    ctx.stroke();

    // Hayloft Window Above Door
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(58, 24, 12, 10);
    ctx.fillStyle = '#212529'; // dark interior
    ctx.fillRect(60, 26, 8, 8);
    // Yellow Hay Peeking Out
    ctx.fillStyle = '#ffc300';
    ctx.fillRect(60, 30, 8, 4);
  });

  // Windmill Base (96x128) - Classic tall wooden tower
  createTexture('bld_windmill_base', 96, 128, (ctx) => {
    ctx.clearRect(0, 0, 96, 128);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(48, 114, 30, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tapered Wooden Tower
    ctx.fillStyle = '#8b6b4f';
    ctx.beginPath();
    ctx.moveTo(34, 24);
    ctx.lineTo(62, 24);
    ctx.lineTo(72, 112);
    ctx.lineTo(24, 112);
    ctx.closePath();
    ctx.fill();

    // Tower shading
    ctx.fillStyle = '#6a4e35';
    ctx.beginPath();
    ctx.moveTo(48, 24);
    ctx.lineTo(62, 24);
    ctx.lineTo(72, 112);
    ctx.lineTo(48, 112);
    ctx.closePath();
    ctx.fill();

    // Horizontal bracing and beams
    ctx.strokeStyle = '#4e3520';
    ctx.lineWidth = 2;
    for (let y = 38; y < 112; y += 18) {
      ctx.beginPath();
      ctx.moveTo(24 + (y / 112) * 10, y);
      ctx.lineTo(72 - (y / 112) * 10, y);
      ctx.stroke();
    }

    // Tower Cap / Dome
    ctx.fillStyle = '#3a5a40';
    ctx.beginPath();
    ctx.arc(48, 24, 14, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#1b4332'; // Shadow cap
    ctx.beginPath();
    ctx.arc(48, 24, 14, Math.PI * 1.5, 0, false);
    ctx.closePath();
    ctx.fill();

    // Gear hub (center of blades)
    ctx.fillStyle = '#6c757d';
    ctx.beginPath();
    ctx.arc(48, 24, 5, 0, Math.PI * 2);
    ctx.fill();

    // Tiny entrance door at base
    ctx.fillStyle = '#3d2511';
    ctx.fillRect(42, 92, 12, 20);
  });

  // Windmill Blades (96x96) - Separate spinning asset!
  createTexture('bld_windmill_blades', 96, 96, (ctx) => {
    ctx.clearRect(0, 0, 96, 96);

    const cx = 48;
    const cy = 48;

    // Metal Center Ring
    ctx.fillStyle = '#495057';
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();

    // 4 Sails / Blades
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 3;

    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      // Main structural rod
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + cos * 42, cy + sin * 42);
      ctx.stroke();

      // Canvas lattice sail
      ctx.fillStyle = '#f8f9fa';
      ctx.strokeStyle = '#adb5bd';
      ctx.lineWidth = 1;

      ctx.beginPath();
      // Side sail off the rod
      const rx1 = cx + cos * 10 + Math.cos(angle + 0.15) * 4;
      const ry1 = cy + sin * 10 + Math.sin(angle + 0.15) * 4;
      const rx2 = cx + cos * 40 + Math.cos(angle + 0.12) * 12;
      const ry2 = cy + sin * 40 + Math.sin(angle + 0.12) * 12;
      const rx3 = cx + cos * 40;
      const ry3 = cy + sin * 40;
      const rx4 = cx + cos * 10;
      const ry4 = cy + sin * 10;

      ctx.moveTo(rx1, ry1);
      ctx.lineTo(rx2, ry2);
      ctx.lineTo(rx3, ry3);
      ctx.lineTo(rx4, ry4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  });


  // --- 5. ANIMALS (32x32) ---

  // Chicken
  createTexture('anim_chicken', 32, 32, (ctx) => {
    ctx.clearRect(0, 0, 32, 32);
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(16, 26, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // White body
    ctx.fillStyle = '#f8f9fa';
    ctx.beginPath();
    ctx.arc(14, 18, 7, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(21, 13, 5, 0, Math.PI * 2);
    ctx.fill();

    // Red comb
    ctx.fillStyle = '#e63946';
    ctx.fillRect(19, 6, 3, 3);
    ctx.fillRect(21, 8, 2, 2);

    // Beak
    ctx.fillStyle = '#fcbf49';
    ctx.beginPath();
    ctx.moveTo(25, 12);
    ctx.lineTo(29, 14);
    ctx.lineTo(25, 15);
    ctx.closePath();
    ctx.fill();

    // Eye
    ctx.fillStyle = '#212529';
    ctx.fillRect(22, 11, 2, 2);

    // Tail feathers
    ctx.fillStyle = '#e9ecef';
    ctx.beginPath();
    ctx.moveTo(8, 15);
    ctx.lineTo(4, 11);
    ctx.lineTo(8, 21);
    ctx.closePath();
    ctx.fill();

    // Legs
    ctx.strokeStyle = '#fcbf49';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(12, 24);
    ctx.lineTo(12, 27);
    ctx.moveTo(16, 24);
    ctx.lineTo(16, 27);
    ctx.stroke();
  });

  // Cow
  createTexture('anim_cow', 48, 48, (ctx) => {
    ctx.clearRect(0, 0, 48, 48);
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(24, 40, 18, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // White Body Base
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(8, 16, 24, 18);

    // Black spots
    ctx.fillStyle = '#212529';
    ctx.fillRect(10, 16, 6, 8);
    ctx.fillRect(20, 24, 8, 6);
    ctx.fillRect(24, 16, 5, 5);

    // Head
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(28, 10, 12, 12);
    ctx.fillStyle = '#212529';
    ctx.fillRect(32, 10, 8, 4); // Head spot
    // Muzzle (pink)
    ctx.fillStyle = '#ffcad4';
    ctx.fillRect(34, 15, 6, 7);
    // Nostrils
    ctx.fillStyle = '#f08080';
    ctx.fillRect(35, 18, 1, 1);
    ctx.fillRect(38, 18, 1, 1);

    // Horns
    ctx.fillStyle = '#fdf0d5';
    ctx.fillRect(30, 6, 2, 4);
    ctx.fillRect(38, 6, 2, 4);

    // Ears
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(26, 12, 3, 2);
    ctx.fillRect(40, 12, 3, 2);

    // Eye
    ctx.fillStyle = '#212529';
    ctx.fillRect(32, 12, 2, 2);

    // Legs
    ctx.fillStyle = '#e9ecef';
    ctx.fillRect(10, 32, 3, 8);
    ctx.fillRect(16, 32, 3, 8);
    ctx.fillRect(22, 32, 3, 8);
    ctx.fillRect(28, 32, 3, 8);
    // Hooves
    ctx.fillStyle = '#495057';
    ctx.fillRect(10, 38, 3, 2);
    ctx.fillRect(16, 38, 3, 2);
    ctx.fillRect(22, 38, 3, 2);
    ctx.fillRect(28, 38, 3, 2);
  });

  // Sheep
  createTexture('anim_sheep', 36, 36, (ctx) => {
    ctx.clearRect(0, 0, 36, 36);
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(18, 30, 12, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Puffy wool body
    ctx.fillStyle = '#f8f9fa';
    const drawPuff = (x: number, y: number, r: number) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };
    drawPuff(18, 18, 8);
    drawPuff(12, 16, 7);
    drawPuff(24, 16, 7);
    drawPuff(18, 12, 7);
    drawPuff(14, 21, 7);
    drawPuff(22, 21, 7);

    // Head (cute black/dark face like Shaun the Sheep)
    ctx.fillStyle = '#343a40';
    ctx.beginPath();
    ctx.arc(27, 16, 4.5, 0, Math.PI * 2);
    ctx.fill();
    // Ears
    ctx.fillRect(25, 18, 2, 4);

    // Woolly cap on head
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(27, 13, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Eye (little white spec)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(28, 15, 1, 1);

    // Legs
    ctx.strokeStyle = '#343a40';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(12, 24);
    ctx.lineTo(12, 30);
    ctx.moveTo(16, 24);
    ctx.lineTo(16, 30);
    ctx.moveTo(20, 24);
    ctx.lineTo(20, 30);
    ctx.moveTo(24, 24);
    ctx.lineTo(24, 30);
    ctx.stroke();
  });

  // Pig (36x36) - Cute pink pig
  createTexture('anim_pig', 36, 36, (ctx) => {
    ctx.clearRect(0, 0, 36, 36);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(18, 30, 11, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#ffb3c1';
    ctx.fillRect(8, 14, 20, 13);
    // Darker spots
    ctx.fillStyle = '#ff85a1';
    ctx.fillRect(10, 14, 4, 3);
    ctx.fillRect(18, 20, 5, 4);

    // Head
    ctx.fillStyle = '#ffb3c1';
    ctx.fillRect(22, 10, 10, 10);
    
    // Snout
    ctx.fillStyle = '#ff85a1';
    ctx.fillRect(28, 14, 6, 5);
    ctx.fillStyle = '#c9184a'; // nostrils
    ctx.fillRect(30, 15, 1, 1);
    ctx.fillRect(33, 15, 1, 1);

    // Ears
    ctx.fillStyle = '#ff85a1';
    ctx.fillRect(24, 8, 3, 3);

    // Eyes
    ctx.fillStyle = '#212529';
    ctx.fillRect(26, 12, 1.5, 1.5);

    // Legs
    ctx.fillStyle = '#ff85a1';
    ctx.fillRect(10, 27, 2.5, 4);
    ctx.fillRect(15, 27, 2.5, 4);
    ctx.fillRect(20, 27, 2.5, 4);
    ctx.fillRect(25, 27, 2.5, 4);

    // Curly tail (little pink curl)
    ctx.strokeStyle = '#ff85a1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(6, 17, 3, 0, Math.PI * 1.5);
    ctx.stroke();
  });

  // Duck (32x32) - Yellow duck
  createTexture('anim_duck', 32, 32, (ctx) => {
    ctx.clearRect(0, 0, 32, 32);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath();
    ctx.ellipse(16, 26, 8, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#ffee32';
    ctx.beginPath();
    ctx.arc(13, 18, 6.5, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(20, 13, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#f77f00';
    ctx.beginPath();
    ctx.moveTo(23, 11);
    ctx.lineTo(28, 13);
    ctx.lineTo(23, 14);
    ctx.closePath();
    ctx.fill();

    // Eye
    ctx.fillStyle = '#212529';
    ctx.fillRect(20, 11, 1.5, 1.5);

    // Wing
    ctx.fillStyle = '#ffda00';
    ctx.fillRect(9, 16, 5, 3);

    // Feet
    ctx.strokeStyle = '#f77f00';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(11, 24);
    ctx.lineTo(11, 27);
    ctx.moveTo(15, 24);
    ctx.lineTo(15, 27);
    ctx.stroke();
  });

  // Goat (36x36) - Light grey goat with horns and beard
  createTexture('anim_goat', 36, 36, (ctx) => {
    ctx.clearRect(0, 0, 36, 36);
    ctx.fillStyle = 'rgba(0,0,0,0.13)';
    ctx.beginPath();
    ctx.ellipse(18, 30, 11, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#e9ecef';
    ctx.fillRect(8, 14, 18, 12);

    // Head
    ctx.fillStyle = '#e9ecef';
    ctx.fillRect(20, 9, 8, 8);
    // Beard
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(20, 17, 3, 4);

    // Horns
    ctx.fillStyle = '#adb5bd';
    ctx.fillRect(22, 5, 2, 4);
    ctx.fillRect(25, 5, 2, 4);

    // Eyes
    ctx.fillStyle = '#495057';
    ctx.fillRect(25, 11, 1.5, 1.5);

    // Legs
    ctx.fillStyle = '#ced4da';
    ctx.fillRect(10, 26, 2, 5);
    ctx.fillRect(14, 26, 2, 5);
    ctx.fillRect(19, 26, 2, 5);
    ctx.fillRect(23, 26, 2, 5);
  });

  // Horse (48x48) - Majestic chestnut horse
  createTexture('anim_horse', 48, 48, (ctx) => {
    ctx.clearRect(0, 0, 48, 48);
    ctx.fillStyle = 'rgba(0,0,0,0.16)';
    ctx.beginPath();
    ctx.ellipse(24, 42, 16, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#9c6644';
    ctx.fillRect(10, 18, 24, 16);

    // Neck & Head
    ctx.fillStyle = '#9c6644';
    ctx.beginPath();
    ctx.moveTo(28, 18);
    ctx.lineTo(36, 8);
    ctx.lineTo(42, 12);
    ctx.lineTo(34, 24);
    ctx.closePath();
    ctx.fill();

    ctx.fillRect(36, 8, 10, 7); // muzzle
    // Mane (Dark hair)
    ctx.fillStyle = '#4f301e';
    ctx.fillRect(26, 12, 4, 12);
    ctx.fillRect(30, 8, 4, 6);

    // White Blaze
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(40, 9, 2, 4);

    // Eye
    ctx.fillStyle = '#111111';
    ctx.fillRect(38, 9, 1.5, 1.5);

    // Legs
    ctx.fillStyle = '#7f5539';
    ctx.fillRect(12, 34, 2.5, 8);
    ctx.fillRect(18, 34, 2.5, 8);
    ctx.fillRect(24, 34, 2.5, 8);
    ctx.fillRect(30, 34, 2.5, 8);
    // White socks on feet
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(12, 40, 2.5, 2);
    ctx.fillRect(24, 40, 2.5, 2);
    // Hooves
    ctx.fillStyle = '#212529';
    ctx.fillRect(12, 41, 2.5, 1);
    ctx.fillRect(18, 41, 2.5, 1);
    ctx.fillRect(24, 41, 2.5, 1);
    ctx.fillRect(30, 41, 2.5, 1);

    // Tail
    ctx.fillStyle = '#4f301e';
    ctx.fillRect(6, 20, 4, 12);
  });

  // Rabbit (32x32) - Small white bunny
  createTexture('anim_rabbit', 32, 32, (ctx) => {
    ctx.clearRect(0, 0, 32, 32);
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.ellipse(16, 26, 6, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#f8f9fa';
    ctx.beginPath();
    ctx.arc(13, 20, 6, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(19, 16, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Long Ears
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(17, 7, 2, 6);
    ctx.fillRect(20, 7, 2, 6);
    ctx.fillStyle = '#ffcad4'; // pink ears inside
    ctx.fillRect(17.5, 8, 1, 4);
    ctx.fillRect(20.5, 8, 1, 4);

    // Eye (pink spec)
    ctx.fillStyle = '#e63946';
    ctx.fillRect(20, 15, 1, 1);

    // Cotton Tail
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(7, 21, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Dog (32x32) - Happy golden retriever
  createTexture('anim_dog', 32, 32, (ctx) => {
    ctx.clearRect(0, 0, 32, 32);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath();
    ctx.ellipse(16, 26, 8, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#e09f67';
    ctx.fillRect(9, 15, 12, 9);

    // Head
    ctx.fillStyle = '#e09f67';
    ctx.fillRect(17, 10, 8, 8);
    // Snout
    ctx.fillStyle = '#c68a4c';
    ctx.fillRect(23, 13, 4, 5);
    ctx.fillStyle = '#111111'; // nose
    ctx.fillRect(26, 13, 1.5, 1.5);

    // Floppy Ears
    ctx.fillStyle = '#b07545';
    ctx.fillRect(16, 11, 2, 6);

    // Eye
    ctx.fillStyle = '#212529';
    ctx.fillRect(20, 12, 1.5, 1.5);

    // Tail
    ctx.strokeStyle = '#e09f67';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(9, 16);
    ctx.lineTo(5, 12);
    ctx.stroke();

    // Legs
    ctx.fillStyle = '#c68a4c';
    ctx.fillRect(10, 24, 2, 3);
    ctx.fillRect(14, 24, 2, 3);
    ctx.fillRect(18, 24, 2, 3);
  });

  // Cat (32x32) - Sleek ginger cat
  createTexture('anim_cat', 32, 32, (ctx) => {
    ctx.clearRect(0, 0, 32, 32);
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.ellipse(16, 26, 7, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#f4a261';
    ctx.fillRect(9, 16, 11, 8);
    // Stripes
    ctx.fillStyle = '#e76f51';
    ctx.fillRect(11, 16, 1, 3);
    ctx.fillRect(15, 16, 1, 3);

    // Head
    ctx.fillStyle = '#f4a261';
    ctx.fillRect(16, 12, 7, 7);
    
    // Ears (Pointy)
    ctx.fillStyle = '#e76f51';
    ctx.beginPath();
    ctx.moveTo(17, 12);
    ctx.lineTo(19, 8);
    ctx.lineTo(20, 12);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(20, 12);
    ctx.lineTo(22, 8);
    ctx.lineTo(23, 12);
    ctx.closePath();
    ctx.fill();

    // Eye (Green eye)
    ctx.fillStyle = '#2a9d8f';
    ctx.fillRect(20, 14, 1, 1.5);

    // Curled Tail
    ctx.strokeStyle = '#f4a261';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(9, 18);
    ctx.quadraticCurveTo(5, 18, 5, 13);
    ctx.quadraticCurveTo(5, 10, 7, 11);
    ctx.stroke();

    // Legs
    ctx.fillStyle = '#e76f51';
    ctx.fillRect(10, 24, 1.5, 3);
    ctx.fillRect(13, 24, 1.5, 3);
    ctx.fillRect(17, 24, 1.5, 3);
  });


  // --- EXTRA BUILDINGS & UPGRADES ---

  // Chicken Coop (96x96)
  createTexture('bld_coop', 96, 96, (ctx) => {
    ctx.clearRect(0, 0, 96, 96);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(48, 80, 42, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cozy wooden chicken house
    ctx.fillStyle = '#cb997e';
    ctx.fillRect(20, 40, 56, 36);

    // Vertical slats
    ctx.fillStyle = '#a5a58d';
    for (let x = 24; x < 76; x += 10) {
      ctx.fillRect(x, 40, 1.5, 36);
    }

    // Stilts / Legs (Coops are off the ground)
    ctx.fillStyle = '#6b705c';
    ctx.fillRect(24, 76, 4, 8);
    ctx.fillRect(68, 76, 4, 8);

    // Roof (Green/Teal shingles)
    ctx.fillStyle = '#457b9d';
    ctx.beginPath();
    ctx.moveTo(14, 42);
    ctx.lineTo(48, 20);
    ctx.lineTo(82, 42);
    ctx.closePath();
    ctx.fill();

    // Ladder/Ramp for chickens
    ctx.fillStyle = '#ddbea9';
    ctx.fillRect(40, 60, 16, 24);
    ctx.fillStyle = '#6b705c'; // steps
    ctx.fillRect(40, 65, 16, 2);
    ctx.fillRect(40, 71, 16, 2);
    ctx.fillRect(40, 77, 16, 2);

    // Small slide door
    ctx.fillStyle = '#3f4238';
    ctx.fillRect(42, 46, 12, 14);
  });

  // Cow Shed (96x96)
  createTexture('bld_shed', 96, 96, (ctx) => {
    ctx.clearRect(0, 0, 96, 96);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(48, 80, 44, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Open Shed structure
    ctx.fillStyle = '#6b705c'; // Dark wood pillars
    ctx.fillRect(20, 44, 6, 34);
    ctx.fillRect(70, 44, 6, 34);
    ctx.fillRect(45, 44, 6, 34);

    // Back wall
    ctx.fillStyle = '#a5a58d';
    ctx.fillRect(26, 44, 44, 30);

    // Feed trough
    ctx.fillStyle = '#ffe8d6';
    ctx.fillRect(26, 68, 44, 10);
    ctx.fillStyle = '#ffb703'; // Yellow hay feed inside
    ctx.fillRect(28, 70, 40, 4);

    // Gable Roof
    ctx.fillStyle = '#b7094c';
    ctx.beginPath();
    ctx.moveTo(14, 46);
    ctx.lineTo(48, 22);
    ctx.lineTo(82, 46);
    ctx.closePath();
    ctx.fill();
  });

  // Silo Storage (64x128)
  createTexture('bld_storage', 64, 128, (ctx) => {
    ctx.clearRect(0, 0, 64, 128);
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath();
    ctx.ellipse(32, 114, 24, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Brick Cylindrical Tower
    ctx.fillStyle = '#d62828';
    ctx.fillRect(16, 36, 32, 78);

    // Brick patterns
    ctx.fillStyle = '#9b2226';
    for (let y = 44; y < 114; y += 14) {
      ctx.fillRect(16, y, 32, 2);
    }

    // Dome Metal Top
    ctx.fillStyle = '#adb5bd';
    ctx.beginPath();
    ctx.arc(32, 36, 16, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();

    // Spout
    ctx.fillStyle = '#495057';
    ctx.fillRect(30, 104, 14, 4);
  });

  // Crafting Workshop (96x96)
  createTexture('bld_workshop', 96, 96, (ctx) => {
    ctx.clearRect(0, 0, 96, 96);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(48, 82, 42, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Blue cottage walls
    ctx.fillStyle = '#2a9d8f';
    ctx.fillRect(18, 42, 60, 36);

    // Beams
    ctx.fillStyle = '#264653';
    ctx.fillRect(18, 42, 4, 36);
    ctx.fillRect(74, 42, 4, 36);

    // Metal Roof
    ctx.fillStyle = '#e76f51';
    ctx.beginPath();
    ctx.moveTo(10, 44);
    ctx.lineTo(48, 18);
    ctx.lineTo(86, 44);
    ctx.closePath();
    ctx.fill();

    // Work Bench Outside details
    ctx.fillStyle = '#e9c46a';
    ctx.fillRect(24, 64, 16, 14); // table
    ctx.fillStyle = '#264653'; // vice/tools
    ctx.fillRect(26, 60, 4, 4);

    // Yellow Signboard (Gear logo)
    ctx.fillStyle = '#e9c46a';
    ctx.fillRect(42, 28, 12, 12);
    ctx.fillStyle = '#264653';
    ctx.fillRect(46, 32, 4, 4);
  });

  // Farm Bakery (96x96)
  createTexture('bld_bakery', 96, 96, (ctx) => {
    ctx.clearRect(0, 0, 96, 96);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(48, 82, 44, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Warm plaster walls
    ctx.fillStyle = '#faedcd';
    ctx.fillRect(18, 42, 60, 36);

    // Red striped awning
    ctx.fillStyle = '#e63946';
    ctx.fillRect(22, 46, 52, 8);
    ctx.fillStyle = '#ffffff';
    for (let x = 26; x < 74; x += 8) {
      ctx.fillRect(x, 46, 4, 8);
    }

    // Roof
    ctx.fillStyle = '#d4a373';
    ctx.beginPath();
    ctx.moveTo(12, 44);
    ctx.lineTo(48, 16);
    ctx.lineTo(84, 44);
    ctx.closePath();
    ctx.fill();

    // Door
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(42, 56, 12, 22);

    // Display window (glow yellow bread)
    ctx.fillStyle = '#1d3557';
    ctx.fillRect(22, 56, 16, 14);
    ctx.fillStyle = '#ffb703'; // bread glow
    ctx.fillRect(24, 60, 12, 6);
  });

  // Greenhouse (128x96) - Ruined vs Clean Glass
  const drawGreenhouse = (key: string, ruined: boolean) => {
    createTexture(key, 128, 96, (ctx) => {
      ctx.clearRect(0, 0, 128, 96);
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(64, 84, 52, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glass Dome/Arch Structure
      ctx.strokeStyle = ruined ? '#5d5f50' : '#457b9d';
      ctx.lineWidth = 4;
      ctx.fillStyle = ruined ? 'rgba(80, 85, 70, 0.45)' : 'rgba(168, 218, 220, 0.35)';
      
      // Draw rounded arch Greenhouse
      ctx.beginPath();
      ctx.arc(64, 78, 44, Math.PI, 0, false);
      ctx.lineTo(108, 78);
      ctx.lineTo(20, 78);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Grid Glass Lines
      ctx.strokeStyle = ruined ? '#3d3e33' : '#a8dadc';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      // vertical ribs
      ctx.moveTo(35, 78);
      ctx.quadraticCurveTo(35, 45, 64, 34);
      ctx.moveTo(93, 78);
      ctx.quadraticCurveTo(93, 45, 64, 34);
      ctx.moveTo(48, 78);
      ctx.quadraticCurveTo(48, 38, 64, 34);
      ctx.moveTo(80, 78);
      ctx.quadraticCurveTo(80, 38, 64, 34);
      
      // horizontal rib
      ctx.moveTo(25, 56);
      ctx.lineTo(103, 56);
      ctx.stroke();

      // Door
      ctx.fillStyle = ruined ? '#5d5f50' : '#457b9d';
      ctx.fillRect(54, 54, 20, 24);
      ctx.fillStyle = ruined ? 'rgba(50,50,50,0.8)' : 'rgba(230,240,255,0.7)';
      ctx.fillRect(56, 56, 16, 22);

      if (ruined) {
        // Cracks and dirty moss
        ctx.fillStyle = '#4f772d'; // Moss overgrown
        ctx.fillRect(20, 68, 12, 10);
        ctx.fillRect(96, 70, 12, 8);
        ctx.fillRect(52, 38, 8, 4);

        // Cobweb line / Cracks
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(40, 50);
        ctx.lineTo(46, 44);
        ctx.lineTo(42, 40);
        ctx.stroke();
      } else {
        // Sparkling stars (clean glass!)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(36, 42, 3, 3);
        ctx.fillRect(84, 46, 3, 3);
      }
    });
  };

  drawGreenhouse('bld_greenhouse_ruined', true);
  drawGreenhouse('bld_greenhouse_clean', false);


  // --- 6. PLAYER SPRITESHEET (128x192 total - 4 directions of 4 frames of 32x48) ---
  createTexture('player_spritesheet', 128, 192, (ctx) => {
    ctx.clearRect(0, 0, 128, 192);

    const fw = 32;
    const fh = 48;

    // Rows:
    // 0: Face Down (South)
    // 1: Face Up (North)
    // 2: Face Left (West)
    // 3: Face Right (East)
    //
    // Columns:
    // 0: Walk Cycle Frame 1 (Left leg forward)
    // 1: Idle (Both feet down)
    // 2: Walk Cycle Frame 2 (Right leg forward)
    // 3: Idle / Stand

    const skinColor = '#ffd0b0';
    const hairColor = '#804000'; // rich brown
    const overallColor = '#2e5b82'; // blue denim overalls
    const shirtColor = '#e63946'; // red shirt
    const shoeColor = '#4a3020';

    for (let row = 0; row < 4; row++) {
      const yOffset = row * fh;

      for (let col = 0; col < 4; col++) {
        const xOffset = col * fw;

        // Shadow under player
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath();
        ctx.ellipse(xOffset + 16, yOffset + 43, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Leg movement offsets
        let leftLegY = 0;
        let rightLegY = 0;
        let bodyBob = 0;
        let armSwing = 0;

        if (col === 0) {
          leftLegY = -3;
          bodyBob = 1;
          armSwing = 3;
        } else if (col === 2) {
          rightLegY = -3;
          bodyBob = 1;
          armSwing = -3;
        }

        // --- DRAW HEAD & HAIR (shared for all directions with perspective shifts) ---
        const hx = xOffset + 16;
        const hy = yOffset + 15 + bodyBob;

        // Head circle
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.arc(hx, hy, 7, 0, Math.PI * 2);
        ctx.fill();

        // Eyes and Hair based on direction
        ctx.fillStyle = hairColor;

        if (row === 0) {
          // DOWN
          // Hair top and bangs
          ctx.beginPath();
          ctx.arc(hx, hy - 3, 7.5, Math.PI, 0, false);
          ctx.fill();
          ctx.fillRect(hx - 7, hy - 4, 14, 5);
          // Sideburns
          ctx.fillRect(hx - 7.5, hy - 1, 2, 4);
          ctx.fillRect(hx + 5.5, hy - 1, 2, 4);
          // Bangs fringe
          ctx.fillRect(hx - 4, hy - 1, 3, 2);
          ctx.fillRect(hx + 1, hy - 1, 3, 2);

          // Eyes
          ctx.fillStyle = '#111111';
          ctx.fillRect(hx - 3, hy + 1, 1.5, 2);
          ctx.fillRect(hx + 1.5, hy + 1, 1.5, 2);

          // Rosy Cheeks
          ctx.fillStyle = '#ff9ebb';
          ctx.fillRect(hx - 5, hy + 3, 2, 1);
          ctx.fillRect(hx + 3, hy + 3, 2, 1);
        } else if (row === 1) {
          // UP (Back of head)
          ctx.beginPath();
          ctx.arc(hx, hy - 1, 7.5, 0, Math.PI * 2);
          ctx.fill();
          // Hair completely covering face
          ctx.fillRect(hx - 7, hy - 2, 14, 10);
        } else if (row === 2) {
          // LEFT
          ctx.beginPath();
          ctx.arc(hx, hy - 3, 7.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(hx - 7, hy - 2, 11, 8); // Hair back/top

          // Skin cheek on left
          ctx.fillStyle = skinColor;
          ctx.fillRect(hx - 6, hy, 4, 5);

          // Single eye
          ctx.fillStyle = '#111111';
          ctx.fillRect(hx - 4, hy + 1, 1.5, 2);

          ctx.fillStyle = '#ff9ebb';
          ctx.fillRect(hx - 5, hy + 3, 2, 1);
        } else if (row === 3) {
          // RIGHT
          ctx.beginPath();
          ctx.arc(hx, hy - 3, 7.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(hx - 4, hy - 2, 11, 8); // Hair back/top

          // Skin cheek on right
          ctx.fillStyle = skinColor;
          ctx.fillRect(hx + 2, hy, 4, 5);

          // Single eye
          ctx.fillStyle = '#111111';
          ctx.fillRect(hx + 2.5, hy + 1, 1.5, 2);

          ctx.fillStyle = '#ff9ebb';
          ctx.fillRect(hx + 3, hy + 3, 2, 1);
        }

        // --- DRAW BODY & ARMS ---
        const bx = xOffset + 10;
        const by = yOffset + 22 + bodyBob;

        // Shirt (Red base)
        ctx.fillStyle = shirtColor;
        ctx.fillRect(bx, by, 12, 12);

        // Denim Overalls over shirt
        ctx.fillStyle = overallColor;
        ctx.fillRect(bx + 1, by + 4, 10, 8); // pants connection
        ctx.fillRect(bx + 2, by + 1, 2, 4); // left suspender
        ctx.fillRect(bx + 8, by + 1, 2, 4); // right suspender
        ctx.fillRect(bx + 3, by + 2, 6, 4); // chest flap

        // Pocket yellow highlight
        ctx.fillStyle = '#ffd166';
        ctx.fillRect(bx + 5, by + 4, 2, 1.5);

        // Arms swinging based on walk cycle and direction
        ctx.fillStyle = shirtColor;
        if (row === 0 || row === 1) {
          // Down or Up: arms on sides swinging oppositely
          ctx.fillRect(bx - 2, by + 1 + armSwing, 2, 6); // left arm
          ctx.fillStyle = skinColor;
          ctx.fillRect(bx - 2, by + 7 + armSwing, 2, 2.5); // left hand

          ctx.fillStyle = shirtColor;
          ctx.fillRect(bx + 12, by + 1 - armSwing, 2, 6); // right arm
          ctx.fillStyle = skinColor;
          ctx.fillRect(bx + 12, by + 7 - armSwing, 2, 2.5); // right hand
        } else if (row === 2) {
          // Left: only left arm visible, swings
          ctx.fillRect(bx + 4 + armSwing / 2, by + 1, 2.5, 6);
          ctx.fillStyle = skinColor;
          ctx.fillRect(bx + 4 + armSwing / 2, by + 7, 2.5, 2.5);
        } else if (row === 3) {
          // Right: only right arm visible, swings
          ctx.fillRect(bx + 5.5 - armSwing / 2, by + 1, 2.5, 6);
          ctx.fillStyle = skinColor;
          ctx.fillRect(bx + 5.5 - armSwing / 2, by + 7, 2.5, 2.5);
        }

        // --- DRAW LEGS & FEET ---
        const lx = xOffset + 11;
        const ly = yOffset + 34;

        ctx.fillStyle = overallColor;
        // Left Leg
        ctx.fillRect(lx, ly + leftLegY, 4, 7);
        ctx.fillStyle = shoeColor;
        ctx.fillRect(lx - 0.5, ly + 6 + leftLegY, 4.5, 2.5);

        ctx.fillStyle = overallColor;
        // Right Leg
        ctx.fillRect(lx + 6, ly + rightLegY, 4, 7);
        ctx.fillStyle = shoeColor;
        ctx.fillRect(lx + 6, ly + 6 + rightLegY, 4.5, 2.5);
      }
    }
  });
  addFrames('player_spritesheet', 32, 48);

  // --- 7. TOOL TEXTURES (16x16 or 24x24) ---

  // Hoe Tool Texture
  createTexture('tool_hoe', 16, 16, (ctx) => {
    ctx.clearRect(0, 0, 16, 16);
    // Wooden Handle (diagonal)
    ctx.strokeStyle = '#8b5a2b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(2, 14);
    ctx.lineTo(11, 5);
    ctx.stroke();
    // Iron Blade
    ctx.fillStyle = '#adb5bd';
    ctx.fillRect(10, 2, 4, 3);
    ctx.fillStyle = '#6c757d';
    ctx.fillRect(12, 4, 3, 2);
  });

  // Watering Can Tool Texture
  createTexture('tool_water_can', 16, 16, (ctx) => {
    ctx.clearRect(0, 0, 16, 16);
    // Can body
    ctx.fillStyle = '#4cc9f0';
    ctx.fillRect(4, 5, 7, 7);
    ctx.fillStyle = '#4895ef'; // shadow
    ctx.fillRect(8, 5, 3, 7);
    // Handle
    ctx.strokeStyle = '#4361ee';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(4, 8, 3, Math.PI * 0.5, Math.PI * 1.5);
    ctx.stroke();
    // Spout
    ctx.strokeStyle = '#4cc9f0';
    ctx.beginPath();
    ctx.moveTo(11, 7);
    ctx.lineTo(14, 4);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.fillRect(13, 3, 2, 2);
  });

  // Axe Tool Texture
  createTexture('tool_axe', 16, 16, (ctx) => {
    ctx.clearRect(0, 0, 16, 16);
    // Handle
    ctx.strokeStyle = '#8b5a2b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(2, 14);
    ctx.lineTo(10, 6);
    ctx.stroke();
    // Axe head
    ctx.fillStyle = '#ced4da';
    ctx.beginPath();
    ctx.moveTo(9, 2);
    ctx.lineTo(14, 1);
    ctx.lineTo(13, 7);
    ctx.lineTo(8, 5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#6c757d';
    ctx.fillRect(9, 3, 2, 2);
  });

  // Pickaxe Tool Texture
  createTexture('tool_pickaxe', 16, 16, (ctx) => {
    ctx.clearRect(0, 0, 16, 16);
    // Handle
    ctx.strokeStyle = '#8b5a2b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(2, 14);
    ctx.lineTo(10, 6);
    ctx.stroke();
    // Curved pickaxe double head
    ctx.strokeStyle = '#adb5bd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(6, 6, 6, Math.PI * 1.6, Math.PI * 0.1);
    ctx.stroke();
  });

  // Scythe Tool Texture
  createTexture('tool_scythe', 24, 24, (ctx) => {
    ctx.clearRect(0, 0, 24, 24);
    // Long handle
    ctx.strokeStyle = '#8b5a2b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(3, 21);
    ctx.lineTo(15, 6);
    ctx.stroke();
    // Large curved blade
    ctx.fillStyle = '#ced4da';
    ctx.beginPath();
    ctx.moveTo(14, 5);
    ctx.quadraticCurveTo(19, 1, 23, 3);
    ctx.quadraticCurveTo(18, 5, 13, 7);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(14, 5);
    ctx.lineTo(23, 3);
    ctx.stroke();
  });

  // Fishing Rod Tool Texture
  createTexture('tool_fishing_rod', 24, 24, (ctx) => {
    ctx.clearRect(0, 0, 24, 24);
    // Long bamboo pole
    ctx.strokeStyle = '#fcbf49';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(3, 21);
    ctx.lineTo(19, 5);
    ctx.stroke();
    // Handle wrap
    ctx.fillStyle = '#6a401a';
    ctx.fillRect(3, 19, 3, 3);
    // Line hanging from tip
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(19, 5);
    ctx.lineTo(19, 15);
    ctx.stroke();
    // Tiny bobber
    ctx.fillStyle = '#e63946';
    ctx.fillRect(18, 15, 3, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(18, 17, 3, 1);
  });

  // --- 8. DECORATION STRUCTURES (32x32) ---

  // Scarecrow
  createTexture('obj_scarecrow', 32, 32, (ctx) => {
    ctx.clearRect(0, 0, 32, 32);
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(16, 29, 6, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    // Wood post
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(15, 10, 2, 20); // vertical
    ctx.fillRect(8, 14, 16, 2);  // horizontal arms
    // Straw body / shirt
    ctx.fillStyle = '#fcbf49'; // yellow straw
    ctx.fillRect(11, 13, 10, 10);
    ctx.fillStyle = '#f77f00'; // orange patch
    ctx.fillRect(13, 15, 3, 3);
    // Pumpkin Head
    ctx.fillStyle = '#f77f00';
    ctx.beginPath();
    ctx.arc(16, 8, 4.5, 0, Math.PI * 2);
    ctx.fill();
    // Face details
    ctx.fillStyle = '#212529';
    ctx.fillRect(14, 7, 1, 1);
    ctx.fillRect(17, 7, 1, 1);
    ctx.fillRect(15, 9, 2, 1);
    // Hat (brown floppy hat)
    ctx.fillStyle = '#5c3a21';
    ctx.fillRect(10, 5, 12, 1.5); // brim
    ctx.fillRect(13, 2, 6, 3);   // crown
  });

  // Garden Lantern
  createTexture('obj_lantern', 32, 32, (ctx) => {
    ctx.clearRect(0, 0, 32, 32);
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(16, 29, 5, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Post
    ctx.fillStyle = '#495057'; // dark iron post
    ctx.fillRect(15, 12, 2, 17);
    // Lantern hanger
    ctx.fillRect(15, 10, 5, 2);
    // Glass lantern body
    ctx.fillStyle = '#212529';
    ctx.fillRect(18, 11, 5, 6);
    // Glow core
    ctx.fillStyle = '#ffea00';
    ctx.fillRect(19, 12, 3, 4);
    // Roof
    ctx.fillStyle = '#495057';
    ctx.beginPath();
    ctx.moveTo(17, 11);
    ctx.lineTo(24, 11);
    ctx.lineTo(21, 9);
    ctx.closePath();
    ctx.fill();
  });
}
