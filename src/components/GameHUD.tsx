/**
 * Perimeter HUD for Kosmos Space Adventure.
 * Low-occlusion perimeter status clusters with tabular integer counters.
 */

import React from 'react';
import { Inventory, Mission, PlanetaryWeather } from '../types/game';
import { Volume2, VolumeX, Compass, Shield, Crosshair, Zap, BookOpen, Wrench, Menu, Wind, CloudRain, Flame, AlertTriangle } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface GameHUDProps {
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
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenCodex: () => void;
  onOpenUpgrades: () => void;
  onOpenPause: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  hull,
  maxHull,
  shield,
  maxShield,
  energy,
  maxEnergy,
  inventory,
  activeMission,
  currentZone,
  prompt,
  radarTargets,
  weather,
  isMuted,
  onToggleMute,
  onOpenCodex,
  onOpenUpgrades,
  onOpenPause,
}) => {
  // Nearest waypoint calculation
  const nearestTarget = radarTargets.length > 0 ? radarTargets.reduce((prev, curr) => (prev.dist < curr.dist ? prev : curr)) : null;

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 flex flex-col justify-between p-4 sm:p-6">
      {/* --- TOP BAR: Ship Status & Cargo Minerals --- */}
      <div className="w-full flex justify-between items-start gap-4">
        {/* Top-Left: Ship Vital Meters */}
        <div className="pointer-events-auto flex flex-col gap-1.5 p-3 bg-slate-950/80 border border-slate-800 rounded min-w-[200px] sm:min-w-[240px]">
          {/* Hull Armor */}
          <div className="flex items-center justify-between text-xs font-mono tabular-nums text-slate-300">
            <span className="flex items-center gap-1.5 text-rose-400">
              <Crosshair className="w-3.5 h-3.5" />
              <span>HULL</span>
            </span>
            <span>
              {hull} / {maxHull}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded overflow-hidden">
            <div
              className="h-full bg-rose-500 transition-all duration-150"
              style={{ width: `${Math.max(0, (hull / maxHull) * 100)}%` }}
            />
          </div>

          {/* Shield Generator */}
          <div className="flex items-center justify-between text-xs font-mono tabular-nums text-slate-300">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Shield className="w-3.5 h-3.5" />
              <span>SHIELD</span>
            </span>
            <span>
              {shield} / {maxShield}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded overflow-hidden">
            <div
              className="h-full bg-cyan-400 transition-all duration-150"
              style={{ width: `${Math.max(0, (shield / maxShield) * 100)}%` }}
            />
          </div>

          {/* Energy / Booster */}
          <div className="flex items-center justify-between text-xs font-mono tabular-nums text-slate-300">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Zap className="w-3.5 h-3.5" />
              <span>ENERGY</span>
            </span>
            <span>
              {energy} / {maxEnergy}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded overflow-hidden">
            <div
              className="h-full bg-amber-400 transition-all duration-150"
              style={{ width: `${Math.max(0, (energy / maxEnergy) * 100)}%` }}
            />
          </div>
        </div>

        {/* Top-Center: Current Zone, Weather Telemetry & Radar Compass */}
        <div className="hidden md:flex flex-col items-center gap-1">
          <div className="text-xs font-mono tracking-wider text-cyan-400 bg-slate-950/80 px-3 py-1 border border-slate-800 rounded">
            {currentZone}
          </div>

          {/* Dynamic Planetary Weather Telemetry */}
          {weather && (
            <div className="flex items-center gap-2 text-[11px] font-mono bg-slate-950/80 px-2.5 py-1 border border-slate-800 rounded">
              {weather.type === 'METEOR_SHOWER' && <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />}
              {weather.type === 'PYRO_RAIN' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
              {weather.type === 'DUST_STORM' && <Wind className="w-3.5 h-3.5 text-amber-400" />}
              {weather.type === 'ION_BLIZZARD' && <CloudRain className="w-3.5 h-3.5 text-sky-400" />}
              {weather.type === 'CLEAR' && <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />}

              <span className={weather.hazardLevel === 'BAHAYA' ? 'text-rose-400 font-bold' : weather.hazardLevel === 'WASPADA' ? 'text-amber-400' : 'text-emerald-400'}>
                {weather.name}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">
                Angin: {Math.abs(Math.round(weather.windForce * 1.8))} km/j {weather.windForce > 5 ? '→' : weather.windForce < -5 ? '←' : '·'}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-cyan-300">
                Pandang: {Math.round(weather.visibility * 100)}%
              </span>
            </div>
          )}

          {nearestTarget && !weather && (
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-slate-950/60 px-2 py-0.5 border border-slate-800/80 rounded">
              <Compass
                className="w-3.5 h-3.5 text-cyan-400"
                style={{ transform: `rotate(${nearestTarget.angle * (180 / Math.PI) + 90}deg)` }}
              />
              <span>{nearestTarget.name}</span>
              <span className="text-cyan-300 tabular-nums">· {Math.round(nearestTarget.dist)} lu</span>
            </div>
          )}
        </div>

        {/* Top-Right: Inventory & Audio / Settings Toggles */}
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          {/* Mineral Storage */}
          <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded flex items-center gap-3 text-xs font-mono tabular-nums">
            {/* Stardust */}
            <div className="flex items-center gap-1 text-cyan-300" title="Debu Bintang (Stardust)">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>{inventory.stardust}</span>
            </div>

            {/* Hyper-Crystal */}
            <div className="flex items-center gap-1 text-purple-300" title="Hyper-Crystal">
              <div className="w-2 h-2 rotate-45 bg-purple-400" />
              <span>{inventory.hyperCrystal}</span>
            </div>

            {/* Titanium */}
            <div className="flex items-center gap-1 text-amber-300" title="Titanium">
              <div className="w-2 h-2 bg-amber-400" />
              <span>{inventory.titanium}</span>
            </div>

            {/* Relics */}
            {inventory.alienArtifacts > 0 && (
              <div className="flex items-center gap-1 text-emerald-300" title="Relik Peradaban Kuno">
                <div className="w-2 h-2 rounded-sm bg-emerald-400" />
                <span>{inventory.alienArtifacts}</span>
              </div>
            )}
          </div>

          {/* Quick HUD Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenCodex();
              }}
              className="p-1.5 bg-slate-950/80 border border-slate-800 hover:border-cyan-400 text-slate-300 hover:text-white rounded transition-colors"
              title="Codex Galaksi & Misi (M)"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onOpenUpgrades();
              }}
              className="p-1.5 bg-slate-950/80 border border-slate-800 hover:border-cyan-400 text-slate-300 hover:text-white rounded transition-colors"
              title="Dok Bengkel Kapal"
            >
              <Wrench className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onToggleMute();
              }}
              className="p-1.5 bg-slate-950/80 border border-slate-800 hover:border-cyan-400 text-slate-300 hover:text-white rounded transition-colors"
              title={isMuted ? 'Aktifkan Suara' : 'Bisukan Suara'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onOpenPause();
              }}
              className="p-1.5 bg-slate-950/80 border border-slate-800 hover:border-cyan-400 text-slate-300 hover:text-white rounded transition-colors"
              title="Menu Jeda (Esc)"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* --- CENTER / INTERACTION PROMPT --- */}
      {prompt && (
        <div className="mx-auto my-auto pointer-events-auto transform animate-bounce">
          <div className="px-5 py-2.5 bg-slate-950/90 border-2 border-cyan-400 text-cyan-300 font-pixel text-xs sm:text-sm tracking-wide rounded shadow-[0_0_20px_rgba(6,182,212,0.5)]">
            {prompt}
          </div>
        </div>
      )}

      {/* --- BOTTOM BAR: Active Objective & Controls --- */}
      <div className="w-full flex justify-between items-end gap-4 mt-auto">
        {/* Bottom-Left: Mission Objective Widget */}
        {activeMission ? (
          <div className="pointer-events-auto p-3 bg-slate-950/85 border border-slate-800 rounded max-w-sm">
            <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest mb-0.5">
              MISI AKTIF
            </div>
            <div className="text-xs font-semibold text-slate-200 mb-1">
              {activeMission.title}
            </div>
            <div className="text-[11px] text-slate-400 leading-snug mb-1.5">
              {activeMission.objective}
            </div>
            {activeMission.targetCount > 1 && (
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-slate-800 rounded overflow-hidden">
                  <div
                    className="h-full bg-cyan-400"
                    style={{ width: `${(activeMission.currentCount / activeMission.targetCount) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono tabular-nums text-cyan-300">
                  {activeMission.currentCount}/{activeMission.targetCount}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="pointer-events-auto p-2 bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 font-mono rounded">
            Seluruh misi sektor selesai! Jelajahi planet dan gerbang warp.
          </div>
        )}

        {/* Bottom-Right: Short Control Reminder */}
        <div className="hidden lg:block text-right text-[11px] font-mono text-slate-500 bg-slate-950/60 px-3 py-1.5 border border-slate-900 rounded">
          WASD Kemudi · Spasi Tembak · Shift Boost · E Interaksi
        </div>
      </div>
    </div>
  );
};
