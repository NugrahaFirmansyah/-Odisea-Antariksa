/**
 * Touch Controls overlay for mobile and tablet players.
 */

import React from 'react';
import { GameEngine } from '../game/engine';
import { ArrowUp, ArrowLeft, ArrowRight, ArrowDown, Zap, Crosshair, Hand } from 'lucide-react';

interface TouchControlsProps {
  engine: GameEngine | null;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ engine }) => {
  if (!engine) return null;

  const handleTouchStart = (key: string) => {
    if (!engine) return;
    engine.keysHeld[key] = true;
    engine.keysJustPressed[key] = true;
    if (key === 'KeyE' && engine.interactionAction) {
      engine.interactionAction();
    }
  };

  const handleTouchEnd = (key: string) => {
    if (!engine) return;
    engine.keysHeld[key] = false;
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex justify-between items-end p-4 md:hidden select-none">
      {/* Directional D-Pad (Left) */}
      <div className="pointer-events-auto grid grid-cols-3 gap-1.5 w-36 h-36">
        <div />
        <button
          onTouchStart={() => handleTouchStart('KeyW')}
          onTouchEnd={() => handleTouchEnd('KeyW')}
          onMouseDown={() => handleTouchStart('KeyW')}
          onMouseUp={() => handleTouchEnd('KeyW')}
          className="bg-slate-900/80 active:bg-cyan-500/40 border border-slate-700 active:border-cyan-400 rounded-lg flex items-center justify-center text-slate-200"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
        <div />

        <button
          onTouchStart={() => handleTouchStart('KeyA')}
          onTouchEnd={() => handleTouchEnd('KeyA')}
          onMouseDown={() => handleTouchStart('KeyA')}
          onMouseUp={() => handleTouchEnd('KeyA')}
          className="bg-slate-900/80 active:bg-cyan-500/40 border border-slate-700 active:border-cyan-400 rounded-lg flex items-center justify-center text-slate-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          onTouchStart={() => handleTouchStart('KeyS')}
          onTouchEnd={() => handleTouchEnd('KeyS')}
          onMouseDown={() => handleTouchStart('KeyS')}
          onMouseUp={() => handleTouchEnd('KeyS')}
          className="bg-slate-900/80 active:bg-cyan-500/40 border border-slate-700 active:border-cyan-400 rounded-lg flex items-center justify-center text-slate-200"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
        <button
          onTouchStart={() => handleTouchStart('KeyD')}
          onTouchEnd={() => handleTouchEnd('KeyD')}
          onMouseDown={() => handleTouchStart('KeyD')}
          onMouseUp={() => handleTouchEnd('KeyD')}
          className="bg-slate-900/80 active:bg-cyan-500/40 border border-slate-700 active:border-cyan-400 rounded-lg flex items-center justify-center text-slate-200"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Action Buttons (Right) */}
      <div className="pointer-events-auto flex flex-col items-end gap-2">
        {/* Interact / Land button (if prompt is active) */}
        {engine.interactionPrompt && (
          <button
            onTouchStart={() => handleTouchStart('KeyE')}
            onTouchEnd={() => handleTouchEnd('KeyE')}
            onMouseDown={() => handleTouchStart('KeyE')}
            onMouseUp={() => handleTouchEnd('KeyE')}
            className="w-14 h-14 bg-cyan-500 text-slate-950 font-bold border-2 border-cyan-300 rounded-full flex flex-col items-center justify-center text-[10px] shadow-[0_0_15px_rgba(6,182,212,0.6)]"
          >
            <Hand className="w-5 h-5" />
            <span>AKSI</span>
          </button>
        )}

        <div className="flex items-center gap-2">
          {/* Boost */}
          <button
            onTouchStart={() => handleTouchStart('ShiftLeft')}
            onTouchEnd={() => handleTouchEnd('ShiftLeft')}
            onMouseDown={() => handleTouchStart('ShiftLeft')}
            onMouseUp={() => handleTouchEnd('ShiftLeft')}
            className="w-12 h-12 bg-amber-500/80 active:bg-amber-400 text-slate-950 rounded-full flex items-center justify-center shadow-lg"
          >
            <Zap className="w-5 h-5" />
          </button>

          {/* Fire / Mine */}
          <button
            onTouchStart={() => handleTouchStart('Space')}
            onTouchEnd={() => handleTouchEnd('Space')}
            onMouseDown={() => handleTouchStart('Space')}
            onMouseUp={() => handleTouchEnd('Space')}
            className="w-16 h-16 bg-rose-600 active:bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-rose-400"
          >
            <Crosshair className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  );
};
