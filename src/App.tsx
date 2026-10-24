/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './game/engine';
import { GameMode, Inventory, Mission, Planet, UpgradeItem, PlanetaryWeather } from './types/game';
import { TitleScreen } from './components/TitleScreen';
import { GameHUD } from './components/GameHUD';
import { PauseMenu } from './components/PauseMenu';
import { UpgradeStation } from './components/UpgradeStation';
import { CodexModal } from './components/CodexModal';
import { VictoryModal } from './components/VictoryModal';
import { TouchControls } from './components/TouchControls';
import { soundManager } from './audio/soundManager';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // High-level Game UI State
  const [gameMode, setGameMode] = useState<GameMode>('TITLE');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // HUD State (buffered from engine loop)
  const [hudState, setHudState] = useState<{
    hull: number;
    maxHull: number;
    shield: number;
    maxShield: number;
    energy: number;
    maxEnergy: number;
    inventory: Inventory;
    activeMission: Mission | null;
    currentZone: string;
    prompt: string | null;
    radarTargets: { angle: number; dist: number; type: string; name: string }[];
    weather: PlanetaryWeather | null;
  }>({
    hull: 100,
    maxHull: 100,
    shield: 80,
    maxShield: 80,
    energy: 100,
    maxEnergy: 100,
    inventory: {
      stardust: 0,
      hyperCrystal: 0,
      darkMatter: 0,
      titanium: 0,
      alienArtifacts: 0,
    },
    activeMission: null,
    currentZone: 'Sektor Alpha (Sistem Aethel)',
    prompt: null,
    radarTargets: [],
    weather: null,
  });

  // Upgrades & Missions state references
  const [upgrades, setUpgrades] = useState<UpgradeItem[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [planets, setPlanets] = useState<Planet[]>([]);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Game Engine once
    const engine = new GameEngine(canvasRef.current);
    engineRef.current = engine;

    setUpgrades([...engine.upgrades]);
    setMissions([...engine.missions]);
    setPlanets([...engine.planets]);

    // Connect State Callbacks
    engine.onStateChange = (newMode) => {
      setGameMode(newMode);
      if (engine) {
        setUpgrades([...engine.upgrades]);
        setMissions([...engine.missions]);
        setPlanets([...engine.planets]);
      }
    };

    let lastHudSync = 0;
    engine.onHUDUpdate = (data) => {
      const now = performance.now();
      // Throttle React state HUD updates to ~12-15 fps to preserve 60fps canvas performance
      if (now - lastHudSync > 70) {
        lastHudSync = now;
        setHudState(data);
      }
    };

    engine.start();

    return () => {
      engine.isRunning = false;
    };
  }, []);

  const handleStartGame = () => {
    if (engineRef.current) {
      engineRef.current.startGame();
    }
  };

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.restartGame();
    }
  };

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handlePurchaseUpgrade = (upgradeId: string) => {
    if (engineRef.current) {
      const success = engineRef.current.purchaseUpgrade(upgradeId);
      if (success) {
        setUpgrades([...engineRef.current.upgrades]);
        setHudState((prev) => ({
          ...prev,
          inventory: { ...engineRef.current!.player.inventory },
        }));
      }
      return success;
    }
    return false;
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* 60 FPS Isolated Canvas Container */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pixel-art"
        tabIndex={0}
      />

      {/* Title Screen Overlay */}
      {gameMode === 'TITLE' && (
        <TitleScreen
          onStart={handleStartGame}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Active Game HUD (During Space or Planetary Surface exploration) */}
      {(gameMode === 'SPACE' || gameMode === 'PLANET_SURFACE') && (
        <>
          <GameHUD
            hull={hudState.hull}
            maxHull={hudState.maxHull}
            shield={hudState.shield}
            maxShield={hudState.maxShield}
            energy={hudState.energy}
            maxEnergy={hudState.maxEnergy}
            inventory={hudState.inventory}
            activeMission={hudState.activeMission}
            currentZone={hudState.currentZone}
            prompt={hudState.prompt}
            radarTargets={hudState.radarTargets}
            weather={hudState.weather}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onOpenCodex={() => engineRef.current?.setMode('CODEX')}
            onOpenUpgrades={() => engineRef.current?.setMode('UPGRADES')}
            onOpenPause={() => engineRef.current?.setMode('PAUSED')}
          />
          <TouchControls engine={engineRef.current} />
        </>
      )}

      {/* Starship Workshop / Upgrade Station Modal */}
      {gameMode === 'UPGRADES' && (
        <UpgradeStation
          upgrades={upgrades}
          inventory={hudState.inventory}
          onPurchase={handlePurchaseUpgrade}
          onClose={() =>
            engineRef.current?.setMode(
              engineRef.current.surfaceScene ? 'PLANET_SURFACE' : 'SPACE'
            )
          }
        />
      )}

      {/* Codex & Galaxy Star Map Modal */}
      {gameMode === 'CODEX' && (
        <CodexModal
          missions={missions}
          planets={planets}
          onClose={() =>
            engineRef.current?.setMode(
              engineRef.current.surfaceScene ? 'PLANET_SURFACE' : 'SPACE'
            )
          }
        />
      )}

      {/* Pause Menu Modal */}
      {gameMode === 'PAUSED' && (
        <PauseMenu
          onResume={() =>
            engineRef.current?.setMode(
              engineRef.current.surfaceScene ? 'PLANET_SURFACE' : 'SPACE'
            )
          }
          onRestart={handleRestart}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Victory Modal */}
      {gameMode === 'VICTORY' && (
        <VictoryModal
          isVictory={true}
          inventory={hudState.inventory}
          onRestart={handleRestart}
          onContinue={() => engineRef.current?.setMode('SPACE')}
        />
      )}

      {/* Game Over Modal */}
      {gameMode === 'GAME_OVER' && (
        <VictoryModal
          isVictory={false}
          inventory={hudState.inventory}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
