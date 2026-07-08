import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { World } from './World';
import { preloadModels } from './objects/ModelAssets';
import { LoadingScreen } from './ui/LoadingScreen';
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
    <>
      <LoadingScreen />
      <Canvas
        shadows
        gl={{
          antialias: true,
          toneMapping: 3,
          toneMappingExposure: 1.0,
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
    </>
  );
}
