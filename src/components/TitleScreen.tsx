/**
 * Title Screen for Kosmos: Odisea Antariksa.
 * Features bespoke inline SVG title lockup, live world backdrop, and instant keyboard start.
 */

import React, { useEffect } from 'react';
import { soundManager } from '../audio/soundManager';

interface TitleScreenProps {
  onStart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart, isMuted, onToggleMute }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        onStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStart]);

  return (
    <div className="absolute inset-0 flex flex-col justify-between items-center p-8 z-20 pointer-events-auto select-none">
      {/* Top Bar Status */}
      <div className="w-full flex justify-between items-center text-xs text-slate-400 font-pixel">
        <span className="tracking-widest text-cyan-400">SEKTOR ALPHA // SISTEM AETHEL</span>
        <button
          onClick={onToggleMute}
          className="px-3 py-1 bg-slate-900/80 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white rounded transition-colors"
        >
          {isMuted ? 'SUARA: NONAKTIF' : 'SUARA: AKTIF'}
        </button>
      </div>

      {/* Hero Centerpiece & Bespoke Title Lockup */}
      <div className="flex flex-col items-center text-center max-w-2xl my-auto">
        {/* Bespoke Pixel Art Inline SVG Title Lockup */}
        <div className="mb-6 transform hover:scale-105 transition-transform duration-300">
          <svg
            className="w-80 sm:w-96 md:w-[480px] h-auto"
            viewBox="0 0 500 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Wing Emblems Left and Right */}
            <path
              d="M30 60 L80 30 L70 60 L100 65 L40 85 Z"
              fill="#0284c7"
              stroke="#38bdf8"
              strokeWidth="2"
            />
            <path
              d="M470 60 L420 30 L430 60 L400 65 L460 85 Z"
              fill="#0284c7"
              stroke="#38bdf8"
              strokeWidth="2"
            />

            {/* Glowing Backdrop Grid */}
            <rect x="90" y="20" width="320" height="80" rx="4" fill="#030712" fillOpacity="0.85" stroke="#1e293b" strokeWidth="2" />
            <line x1="90" y1="60" x2="410" y2="60" stroke="#0ea5e9" strokeOpacity="0.3" strokeDasharray="4 4" />

            {/* KOSMOS Main Pixel Text */}
            <text
              x="250"
              y="68"
              textAnchor="middle"
              fontFamily="'Space Mono', monospace"
              fontSize="48"
              fontWeight="900"
              letterSpacing="12"
              fill="#f8fafc"
              stroke="#030712"
              strokeWidth="4"
              paintOrder="stroke"
            >
              KOSMOS
            </text>

            <text
              x="250"
              y="68"
              textAnchor="middle"
              fontFamily="'Space Mono', monospace"
              fontSize="48"
              fontWeight="900"
              letterSpacing="12"
              fill="url(#titleGradient)"
            >
              KOSMOS
            </text>

            {/* Subtitle */}
            <text
              x="250"
              y="88"
              textAnchor="middle"
              fontFamily="'Space Mono', monospace"
              fontSize="11"
              fontWeight="700"
              letterSpacing="4"
              fill="#38bdf8"
            >
              ODISEA PIKSEL ANTARIKSA
            </text>

            <defs>
              <linearGradient id="titleGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#bae6fd" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <p className="text-sm md:text-base text-slate-300 font-normal max-w-lg mb-8 leading-relaxed">
          Kendalikan wahana penjelajah antariksa melintasi sabuk asteroid kristal, temukan peradaban kuno di planet misterius, dan hadapi ancaman Titan Kehampaan.
        </p>

        {/* Primary Start CTA */}
        <button
          onClick={() => {
            soundManager.playClick();
            onStart();
          }}
          className="group relative px-8 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm tracking-wider font-pixel rounded-none border-2 border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.45)] transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <span className="flex items-center gap-3">
            <span>[SPASI] MULAI PETUALANGAN</span>
            <span className="text-xs opacity-75 group-hover:translate-x-1 transition-transform">▶</span>
          </span>
        </button>
      </div>

      {/* Flat Control Hints Footer */}
      <div className="w-full text-center">
        <div className="text-xs text-slate-400 font-pixel tracking-wide py-2 px-4 bg-slate-950/70 border border-slate-800 rounded inline-block">
          WASD Kemudi · Spasi Tembak / Tambang · Shift Boost · E Interaksi / Mendarat · M Codex & Misi · Esc Menu
        </div>
      </div>
    </div>
  );
};
