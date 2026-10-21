import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Volume2, Sparkles, Sliders } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface PadSound {
  id: number;
  name: string;
  key: string;
  color: string;
  freq: number;
  type: OscillatorType;
  duration: number;
}

const PADS: PadSound[] = [
  { id: 0, name: '808 Kick', key: '1', color: 'bg-rose-500', freq: 65, type: 'sine', duration: 0.2 },
  { id: 1, name: 'Cyber Snare', key: '2', color: 'bg-cyan-500', freq: 280, type: 'triangle', duration: 0.12 },
  { id: 2, name: 'Hi-Hat', key: '3', color: 'bg-amber-400', freq: 850, type: 'square', duration: 0.04 },
  { id: 3, name: 'Open Hat', key: '4', color: 'bg-amber-500', freq: 720, type: 'square', duration: 0.18 },
  { id: 4, name: 'Hand Clap', key: 'Q', color: 'bg-pink-500', freq: 420, type: 'triangle', duration: 0.09 },
  { id: 5, name: 'Sub Bass', key: 'W', color: 'bg-indigo-600', freq: 95, type: 'sawtooth', duration: 0.35 },
  { id: 6, name: 'Laser Zap', key: 'E', color: 'bg-emerald-500', freq: 950, type: 'sawtooth', duration: 0.14 },
  { id: 7, name: 'High Chime', key: 'R', color: 'bg-sky-400', freq: 1100, type: 'sine', duration: 0.25 },
  { id: 8, name: 'Electro Tom', key: 'A', color: 'bg-purple-500', freq: 160, type: 'sine', duration: 0.18 },
  { id: 9, name: 'Pulse Lead', key: 'S', color: 'bg-teal-400', freq: 440, type: 'square', duration: 0.2 },
  { id: 10, name: 'Glitch FX', key: 'D', color: 'bg-fuchsia-500', freq: 640, type: 'sawtooth', duration: 0.1 },
  { id: 11, name: 'Crash Cymbal', key: 'F', color: 'bg-yellow-400', freq: 900, type: 'square', duration: 0.4 }
];

export const BeatmakerApp: React.FC = () => {
  const [bpm, setBpm] = useState(120);
  const [isPlayingSeq, setIsPlayingSeq] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [activePad, setActivePad] = useState<number | null>(null);

  // 8-step sequencer matrix for 4 main instruments (Kick, Snare, Hat, Zap)
  const [sequence, setSequence] = useState<boolean[][]>([
    [true, false, false, false, true, false, false, false], // Kick (0)
    [false, false, true, false, false, false, true, false], // Snare (1)
    [true, true, true, true, true, true, true, true],       // Hat (2)
    [false, false, false, true, false, false, false, true]  // Zap (6)
  ]);

  const stepRef = useRef(0);

  const triggerPad = (id: number) => {
    const pad = PADS[id];
    sounds.playBlip(pad.freq, pad.type, pad.duration);
    setActivePad(id);
    setTimeout(() => setActivePad(null), 140);
  };

  const toggleStep = (trackIdx: number, stepIdx: number) => {
    sounds.playBlip(400, 'sine', 0.02);
    setSequence(prev => {
      const next = prev.map(r => [...r]);
      next[trackIdx][stepIdx] = !next[trackIdx][stepIdx];
      return next;
    });
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const found = PADS.find(p => p.key.toLowerCase() === e.key.toLowerCase());
      if (found) triggerPad(found.id);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    if (!isPlayingSeq) return;

    const intervalMs = (60 / bpm / 2) * 1000;
    const interval = setInterval(() => {
      const s = (stepRef.current + 1) % 8;
      stepRef.current = s;
      setCurrentStep(s);

      // Play active tracks for step s
      const instrumentMap = [0, 1, 2, 6];
      sequence.forEach((row, trackIdx) => {
        if (row[s]) {
          const pad = PADS[instrumentMap[trackIdx]];
          sounds.playBlip(pad.freq, pad.type, pad.duration);
        }
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isPlayingSeq, bpm, sequence]);

  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-y-auto p-4">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-slate-900 border border-slate-800 rounded-xl mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sounds.playClick();
              setIsPlayingSeq(p => !p);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
              isPlayingSeq ? 'bg-rose-500 text-white' : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
            }`}
          >
            {isPlayingSeq ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlayingSeq ? 'Stop Sequencer' : 'Play Beat Loop'}</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <span>TEMPO:</span>
            <input
              type="range"
              min="80"
              max="160"
              value={bpm}
              onChange={e => setBpm(Number(e.target.value))}
              className="accent-cyan-400 w-24 cursor-pointer"
            />
            <span className="text-cyan-400 font-bold tabular-nums">{bpm} BPM</span>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-mono hidden sm:block">
          Click pads or use keyboard (1-4, Q-R, A-F)
        </div>
      </div>

      {/* 4x3 Beatpad Trigger Matrix */}
      <div className="grid grid-cols-4 gap-2.5 mb-5 max-w-2xl mx-auto w-full">
        {PADS.map(pad => {
          const isActive = activePad === pad.id;

          return (
            <button
              key={pad.id}
              onClick={() => triggerPad(pad.id)}
              className={`h-20 sm:h-24 rounded-2xl border p-2 flex flex-col justify-between items-start transition-all duration-75 cursor-pointer active:scale-95 ${
                isActive
                  ? 'border-white bg-cyan-400 shadow-[0_0_25px_#22d3ee] scale-98 text-slate-950'
                  : 'border-slate-800 bg-slate-900/90 hover:border-slate-700 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-cyan-300 font-bold">
                  {pad.key}
                </span>
                <div className={`w-2.5 h-2.5 rounded-full ${pad.color}`} />
              </div>

              <div className="text-xs font-bold truncate max-w-full">{pad.name}</div>
            </button>
          );
        })}
      </div>

      {/* 8-Step Beat Sequencer */}
      <div className="max-w-2xl mx-auto w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
        <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">
          8-Step Rhythm Sequencer
        </div>

        <div className="space-y-2">
          {['808 Kick', 'Cyber Snare', 'Hi-Hat', 'Laser Zap'].map((name, trackIdx) => (
            <div key={name} className="flex items-center gap-2">
              <span className="w-24 text-xs font-mono text-slate-300 truncate">{name}</span>
              <div className="grid grid-cols-8 gap-1.5 flex-1">
                {sequence[trackIdx].map((isOn, stepIdx) => {
                  const isCurrent = isPlayingSeq && currentStep === stepIdx;

                  return (
                    <button
                      key={stepIdx}
                      onClick={() => toggleStep(trackIdx, stepIdx)}
                      className={`h-8 rounded-lg border transition-all cursor-pointer ${
                        isOn
                          ? isCurrent
                            ? 'bg-cyan-300 border-white shadow-[0_0_12px_#67e8f9]'
                            : 'bg-cyan-500 border-cyan-400 shadow-xs'
                          : isCurrent
                          ? 'bg-slate-700 border-slate-600'
                          : 'bg-slate-950 border-slate-800 hover:bg-slate-800'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
