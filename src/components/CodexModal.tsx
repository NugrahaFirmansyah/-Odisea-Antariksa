/**
 * Codex and Galaxy Star Map modal for Kosmos.
 * Catalogs missions, celestial bodies, and discovered alien lore.
 */

import React, { useState } from 'react';
import { Mission, Planet } from '../types/game';
import { soundManager } from '../audio/soundManager';
import { BookOpen, Globe, CheckCircle2, Circle, X, Sparkles } from 'lucide-react';

interface CodexModalProps {
  missions: Mission[];
  planets: Planet[];
  onClose: () => void;
}

export const CodexModal: React.FC<CodexModalProps> = ({ missions, planets, onClose }) => {
  const [activeTab, setActiveTab] = useState<'missions' | 'planets'>('missions');

  return (
    <div className="absolute inset-0 bg-slate-950/85 flex items-center justify-center p-4 z-30 select-none">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100 font-pixel tracking-wide">
              CODEX EKSPEDISI BINTANG & ATLAS
            </h2>
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

        {/* Tab Selector */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-800 bg-slate-950/30">
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('missions');
            }}
            className={`px-4 py-2 text-xs font-mono font-medium border-b-2 transition-colors ${
              activeTab === 'missions'
                ? 'border-cyan-400 text-cyan-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Log Misi Ekspedisi ({missions.filter((m) => m.completed).length}/{missions.length})
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('planets');
            }}
            className={`px-4 py-2 text-xs font-mono font-medium border-b-2 transition-colors ${
              activeTab === 'planets'
                ? 'border-cyan-400 text-cyan-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Atlas Planet & Dunia ({planets.filter((p) => p.visited).length}/{planets.length})
          </button>
        </div>

        {/* Content Container */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'missions' && (
            <div className="space-y-3">
              {missions.map((m) => {
                const isLocked = !m.unlocked;
                return (
                  <div
                    key={m.id}
                    className={`p-4 rounded-lg border transition-all ${
                      m.completed
                        ? 'bg-slate-950/40 border-emerald-900/60'
                        : isLocked
                        ? 'bg-slate-950/20 border-slate-800/50 opacity-60'
                        : 'bg-slate-950/80 border-cyan-900/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        {m.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-slate-100">{m.title}</h3>
                            {m.completed && (
                              <span className="text-[10px] font-mono text-emerald-400">SELESAI</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 mt-1">{m.objective}</p>
                          <p className="text-[11px] text-slate-400 italic mt-1.5 leading-relaxed">
                            "{m.loreText}"
                          </p>
                        </div>
                      </div>

                      {/* Reward */}
                      <div className="text-right shrink-0 text-xs font-mono text-cyan-300">
                        <div>+{m.rewardStardust} Stardust</div>
                        {m.rewardCrystal > 0 && <div className="text-purple-300">+{m.rewardCrystal} Crystal</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'planets' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {planets.map((planet) => (
                <div
                  key={planet.id}
                  className="p-4 bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{ backgroundColor: planet.primaryColor }}
                        />
                        <h3 className="text-sm font-bold text-slate-100">{planet.name}</h3>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {planet.visited ? 'STATUS: DIJELAJAHI' : 'STATUS: TERDETEKSI'}
                      </span>
                    </div>

                    <div className="text-xs text-cyan-400 font-mono mb-2">{planet.indonesianSubtitle}</div>
                    <p className="text-xs text-slate-300 leading-relaxed mb-3">{planet.description}</p>
                  </div>

                  <div>
                    <div className="text-[11px] font-mono text-slate-400 border-t border-slate-800 pt-2">
                      Sumber Daya: {planet.resourcesAvailable.join(' · ')}
                    </div>
                    <div className="text-[11px] font-mono text-amber-300/90 mt-1">
                      Sistem Cuaca: {
                        planet.type === 'cryo'
                          ? 'Badai Salju Ionik (Traksi Licin & Kabut Beku)'
                          : planet.type === 'volcanic'
                          ? 'Hujan Piroklastik Magma (Bara Api & Impak Vulkanik)'
                          : planet.type === 'ancient'
                          ? 'Hujan Meteor Kristal Kuno & Badai Partikel'
                          : planet.type === 'gas_giant'
                          ? 'Badai Radiasi Ion Raksasa Gas'
                          : 'Badai Spora Elektrik & Angin Lateral Kuat'
                      }
                    </div>
                    {planet.landable && (
                      <div className="text-[11px] text-emerald-400 font-mono mt-1">
                        ✓ Mendukung Eksplorasi Rover Permukaan
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded transition-colors"
          >
            Tutup Codex
          </button>
        </div>
      </div>
    </div>
  );
};
