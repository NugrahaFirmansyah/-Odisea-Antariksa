/**
 * Starship Upgrade Workshop Modal for Kosmos.
 * Allows enhancing Hull, Shields, Weapons, Engines, and Mining systems.
 */

import React from 'react';
import { Inventory, UpgradeItem } from '../types/game';
import { soundManager } from '../audio/soundManager';
import { Shield, Zap, Crosshair, Wrench, ArrowUpRight, X } from 'lucide-react';

interface UpgradeStationProps {
  upgrades: UpgradeItem[];
  inventory: Inventory;
  onPurchase: (upgradeId: string) => boolean;
  onClose: () => void;
}

export const UpgradeStation: React.FC<UpgradeStationProps> = ({
  upgrades,
  inventory,
  onPurchase,
  onClose,
}) => {
  const getCategoryIcon = (category: UpgradeItem['category']) => {
    switch (category) {
      case 'weapons':
        return <Crosshair className="w-4 h-4 text-rose-400" />;
      case 'defense':
        return <Shield className="w-4 h-4 text-cyan-400" />;
      case 'engine':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'mining':
        return <Wrench className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-950/85 flex items-center justify-center p-4 z-30 select-none">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div>
            <h2 className="text-base font-bold text-slate-100 font-pixel tracking-wide flex items-center gap-2">
              <Wrench className="w-5 h-5 text-cyan-400" />
              <span>BENGKEL PENINGKATAN WAHANA ANTARIKSA</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-normal">
              Tingkatkan modul persenjataan, pelindung lambung, dan pendorong fusi menggunakan sumber daya hasil tambang.
            </p>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Resources Strip */}
        <div className="px-6 py-2.5 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between text-xs font-mono tabular-nums">
          <span className="text-slate-400">Kapasitas Kargo Saat Ini:</span>
          <div className="flex items-center gap-4">
            <span className="text-cyan-300">Debu Bintang: {inventory.stardust}</span>
            <span className="text-amber-300">Titanium: {inventory.titanium}</span>
            <span className="text-purple-300">Hyper-Crystal: {inventory.hyperCrystal}</span>
          </div>
        </div>

        {/* Upgrade Cards List */}
        <div className="p-6 space-y-3 overflow-y-auto flex-1">
          {upgrades.map((upg) => {
            const isMax = upg.level >= upg.maxLevel;
            const canAfford =
              inventory.stardust >= upg.costStardust &&
              inventory.titanium >= upg.costTitanium &&
              inventory.hyperCrystal >= upg.costCrystal;

            return (
              <div
                key={upg.id}
                className="p-4 bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded mt-0.5">
                    {getCategoryIcon(upg.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-200">{upg.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-800 text-cyan-300 rounded">
                        MK {upg.level} / {upg.maxLevel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{upg.description}</p>
                    <div className="text-[11px] font-mono text-cyan-400 mt-1">{upg.statBonusText}</div>
                  </div>
                </div>

                {/* Upgrade Button & Cost */}
                <div className="flex flex-col items-end gap-1.5 w-full sm:w-auto">
                  {!isMax ? (
                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-300">
                      <span>Biaya:</span>
                      {upg.costStardust > 0 && (
                        <span className={inventory.stardust >= upg.costStardust ? 'text-cyan-400' : 'text-rose-400'}>
                          {upg.costStardust} Stardust
                        </span>
                      )}
                      {upg.costTitanium > 0 && (
                        <span className={inventory.titanium >= upg.costTitanium ? 'text-amber-400' : 'text-rose-400'}>
                          {upg.costTitanium} Ti
                        </span>
                      )}
                      {upg.costCrystal > 0 && (
                        <span className={inventory.hyperCrystal >= upg.costCrystal ? 'text-purple-400' : 'text-rose-400'}>
                          {upg.costCrystal} Crystal
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs font-mono text-emerald-400">LEVEL MAKSIMAL</span>
                  )}

                  {!isMax && (
                    <button
                      onClick={() => {
                        const success = onPurchase(upg.id);
                        if (!success) {
                          soundManager.playShieldHit();
                        }
                      }}
                      disabled={!canAfford}
                      className={`w-full sm:w-auto px-4 py-1.5 text-xs font-mono font-semibold rounded flex items-center justify-center gap-1.5 transition-colors ${
                        canAfford
                          ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      <span>Tingkatkan</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded transition-colors"
          >
            Kembali Ke Kemudi Wahana
          </button>
        </div>
      </div>
    </div>
  );
};
