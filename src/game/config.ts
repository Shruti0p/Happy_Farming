import Phaser from 'phaser';
import { GameScene } from './GameScene';

export const getPhaserConfig = (containerId: string): Phaser.Types.Core.GameConfig => {
  return {
    type: Phaser.AUTO,
    width: '100%',
    height: '100%',
    parent: containerId,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    pixelArt: true, // Guarantees crisp, gorgeous sharp pixels
    roundPixels: true,
    scene: [GameScene],
  };
};
