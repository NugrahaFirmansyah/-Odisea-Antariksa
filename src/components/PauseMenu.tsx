/**
 * Pause Menu Modal for Kosmos Space Adventure.
 */

import React from 'react';
import { Volume2, VolumeX, Play, RotateCcw } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestart,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 bg-slate-950/85 flex items-center justify-center p-4 z-30 select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-lg p-6 shadow-2xl flex flex-col items-center text-center">
        <h2 className="text-lg font-bold text-slate-100 font-pixel tracking-wider mb-1">
          EKSPEDISI DIHENTIKAN SEMENTARA
        </h2>
        <p className="text-xs text-slate-400 mb-6 font-mono">
          SEKTOR ALPHA // STATUS SISTEM STABIL
        </p>

        {/* Action Buttons */}
        <div className="w-full space-y-3 mb-6">
          <button
            onClick={() => {
              soundManager.playClick();
              onResume();
            }}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-pixel text-xs tracking-wider rounded transition-colors flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>LANJUTKAN EKSPEDISI [ESC]</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onToggleMute();
            }}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded transition-colors flex items-center justify-center gap-2 border border-slate-700"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            <span>{isMuted ? 'AKTIFKAN SUARA' : 'BISUKAN SUARA'}</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Mulai ulang ekspedisi dari awal? Semua kemajuan kargo saat ini akan direset.')) {
                soundManager.playClick();
                onRestart();
              }
            }}
            className="w-full py-2.5 bg-slate-800 hover:bg-rose-950/60 hover:text-rose-200 text-slate-400 text-xs font-mono rounded transition-colors flex items-center justify-center gap-2 border border-slate-700"
          >
            <RotateCcw className="w-4 h-4" />
            <span>MULAI ULANG EKSPEDISI</span>
          </button>
        </div>

        {/* Controls Quick Reference */}
        <div className="w-full text-left p-3.5 bg-slate-950/70 border border-slate-800 rounded text-xs font-mono text-slate-400 space-y-1">
          <div className="text-[10px] text-cyan-400 font-bold mb-1 tracking-wider uppercase">
            PANDUAN KONTROL WAHANA
          </div>
          <div><span className="text-slate-200">W / Panah Atas:</span> Pendorong Maju</div>
          <div><span className="text-slate-200">A / D:</span> Kemudi Rotasi Haluan</div>
          <div><span className="text-slate-200">S:</span> Pendorong Mundur / Rem</div>
          <div><span className="text-slate-200">Spasi:</span> Tembak Plasma / Laser Tambang</div>
          <div><span className="text-slate-200">Shift:</span> Hyper-Boost Cepat</div>
          <div><span className="text-slate-200">E:</span> Interaksi Dok / Pendaratan Planet</div>
          <div><span className="text-slate-200">M / Tab:</span> Buka Codex & Atlas Bintang</div>
        </div>
      </div>
    </div>
  );
};
