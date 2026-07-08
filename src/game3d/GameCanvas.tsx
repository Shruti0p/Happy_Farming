import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { World } from './World';
import { preloadModels } from './objects/ModelAssets';
import type { SavedGameState } from '../game/types';

interface GameCanvasProps {
  gameState: SavedGameState;
  onPlayerMove: (x: number, z: number) => void;
  activeTool?: string;
}

function LoadingFallback() {
  return null;
}

export function GameCanvas({ gameState, onPlayerMove, activeTool }: GameCanvasProps) {
  useEffect(() => { preloadModels(); }, []);

  return (
    <Canvas
      shadows
      gl={{
        antialias: true,
        toneMapping: 3,
        toneMappingExposure: 2.5,
      }}
      camera={{
        fov: 50,
        near: 0.1,
        far: 300,
        position: [50, 30, 50],
      }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={<LoadingFallback />}>
        <World gameState={gameState} onPlayerMove={onPlayerMove} activeTool={activeTool} />
      </Suspense>
    </Canvas>
  );
}
