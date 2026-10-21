import React, { useState, useEffect } from 'react';
import { Play, Pause, Disc3, Volume2, Sparkles } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export const MusicPlayerApp: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(() => sounds.isAmbientPlaying());

  const toggle = () => {
    sounds.playClick();
    const active = sounds.toggleAmbientMusic(playing => {
      setIsPlaying(playing);
    });
    setIsPlaying(active);
  };

  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 select-none font-sans">
      <div className="relative mb-6">
        <div className={`w-28 h-28 rounded-full border-4 border-cyan-500/30 flex items-center justify-center bg-slate-900 shadow-[0_0_30px_rgba(6,182,212,0.3)] ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }}>
          <Disc3 className="w-14 h-14 text-cyan-400" />
        </div>
        {isPlaying && (
          <div className="absolute -top-1 -right-1 p-1 bg-cyan-500 rounded-full text-slate-950">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      <h3 className="text-base font-bold text-white mb-1">Revive Synthwave Arpeggio</h3>
      <p className="text-xs text-slate-400 font-mono mb-6">Procedural Web Audio Synthesizer</p>

      {/* Visualizer bars */}
      <div className="flex items-center gap-1.5 h-12 mb-6">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 rounded-full bg-cyan-400 transition-all ${
              isPlaying ? 'animate-pulse' : 'h-2 opacity-30'
            }`}
            style={{
              height: isPlaying ? `${Math.sin(i * 0.7) * 20 + 26}px` : '6px',
              animationDelay: `${i * 0.08}s`
            }}
          />
        ))}
      </div>

      <button
        onClick={toggle}
        className="flex items-center gap-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-full shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-transform active:scale-95 cursor-pointer"
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
        <span>{isPlaying ? 'Pause Synthesizer' : 'Play Background Music'}</span>
      </button>
    </div>
  );
};
