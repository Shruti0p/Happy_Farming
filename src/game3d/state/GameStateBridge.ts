import { useEffect, useRef, useCallback } from 'react';
import type { SavedGameState } from '../../game/types';

export interface GameBridgeAPI {
  getState: () => SavedGameState;
  updateState: (fn: (state: SavedGameState) => void) => void;
  syncState: () => void;
}

let bridgeInstance: GameBridgeAPI | null = null;

export function setBridge(api: GameBridgeAPI) {
  bridgeInstance = api;
}

export function getBridge(): GameBridgeAPI | null {
  return bridgeInstance;
}

export function useGameBridge(gameState: SavedGameState, setGameState: (s: SavedGameState) => void) {
  const stateRef = useRef(gameState);
  stateRef.current = gameState;

  const updateState = useCallback((fn: (state: SavedGameState) => void) => {
    const next = { ...stateRef.current };
    fn(next);
    stateRef.current = next;
    setGameState(next);
  }, [setGameState]);

  const syncState = useCallback(() => {
    setGameState({ ...stateRef.current });
  }, [setGameState]);

  useEffect(() => {
    setBridge({
      getState: () => stateRef.current,
      updateState,
      syncState,
    });
    return () => setBridge(null);
  }, [updateState, syncState]);

  return { getState: () => stateRef.current, updateState, syncState };
}
