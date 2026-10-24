/**
 * Victory and Game Over summary modal for Kosmos.
 */

import React from 'react';
import { Inventory } from '../types/game';
import { soundManager } from '../audio/soundManager';
import { Trophy, Skull, RotateCcw, Compass } from 'lucide-react';

interface VictoryModalProps {
  isVictory: boolean;
  inventory: Inventory;
  onRestart: () => void;
  onContinue?: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isVictory,
  inventory,
  onRestart,
  onContinue,
}) => {
  return (
    <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center p-4 z-40 select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-lg p-6 shadow-2xl flex flex-col items-center text-center">
        {/* Icon & Title */}
        {isVictory ? (
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-3 shadow-[0_0_25px_rgba(6,182,212,0.4)]">
              <Trophy className="w-7 h-7" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 font-pixel tracking-wider mb-1">
              KEMENANGAN EKSPEDISI BINTANG!
            </h2>
            <p className="text-xs text-cyan-400 font-mono mb-4">
              GERBANG WARP SINGULARITAS TELAH TERBUKA
            </p>
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm mb-6">
              Titan Kehampaan telah ditaklukkan dan stabilitas sektor Alpha berhasil dipulihkan. Catatan kartografi dan sampel geologi dari planet alien kini tersimpan aman di pusat data galaksi.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-3 shadow-[0_0_25px_rgba(244,63,94,0.4)]">
              <Skull className="w-7 h-7" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 font-pixel tracking-wider mb-1">
              SINYAL WAHANA TERPUTUS
            </h2>
            <p className="text-xs text-rose-400 font-mono mb-4">
              INTEGRITAS LAMBUNG KAPAL HANCUR
            </p>
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm mb-6">
              Kapal penjelajahmu mengalami kerusakan fatal akibat benturan asteroid atau tembakan musuh. Sinyal penyelamatan darurat telah diaktifkan untuk memulai peluncuran baru.
            </p>
          </div>
        )}

        {/* Cargo Summary Stats */}
        <div className="w-full p-4 bg-slate-950/70 border border-slate-800 rounded-lg mb-6 text-xs font-mono tabular-nums">
          <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-3">
            LOG HASIL EKSPLORASI
          </div>
          <div className="grid grid-cols-2 gap-2 text-left">
            <div className="flex justify-between border-b border-slate-900 pb-1">
              <span className="text-slate-400">Debu Bintang:</span>
              <span className="text-cyan-400 font-bold">{inventory.stardust}</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1">
              <span className="text-slate-400">Hyper-Crystal:</span>
              <span className="text-purple-400 font-bold">{inventory.hyperCrystal}</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1">
              <span className="text-slate-400">Titanium:</span>
              <span className="text-amber-400 font-bold">{inventory.titanium}</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1">
              <span className="text-slate-400">Relik Purba:</span>
              <span className="text-emerald-400 font-bold">{inventory.alienArtifacts}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-2.5">
          {isVictory && onContinue && (
            <button
              onClick={() => {
                soundManager.playClick();
                onContinue();
              }}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-pixel text-xs tracking-wider rounded transition-colors flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>LANJUTKAN JELAJAH BEBAS</span>
            </button>
          )}

          <button
            onClick={() => {
              soundManager.playClick();
              onRestart();
            }}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-pixel text-xs tracking-wider rounded transition-colors flex items-center justify-center gap-2 border border-slate-700"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isVictory ? 'MULAI EKSPEDISI BARU' : 'LUNCURKAN WAHANA BARU'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
