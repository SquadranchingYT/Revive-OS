import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Volume2, Mic, Activity, Sliders, Sparkles, Radio } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export const AudioLabApp: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [waveType, setWaveType] = useState<OscillatorType>('sawtooth');
  const [frequency, setFrequency] = useState(440);
  const [duration, setDuration] = useState(0.4);
  const [modRate, setModRate] = useState(15);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const presets = [
    { name: 'Cyber Warp', type: 'sawtooth' as OscillatorType, freq: 120, dur: 0.6, mod: 25 },
    { name: 'Laser Cannon', type: 'sawtooth' as OscillatorType, freq: 880, dur: 0.25, mod: 50 },
    { name: 'Sub Reactor', type: 'sine' as OscillatorType, freq: 65, dur: 0.8, mod: 4 },
    { name: '8-Bit Jump', type: 'square' as OscillatorType, freq: 350, dur: 0.2, mod: 30 },
    { name: 'Alien Comms', type: 'triangle' as OscillatorType, freq: 620, dur: 0.5, mod: 40 },
    { name: 'Glitch Spark', type: 'square' as OscillatorType, freq: 1200, dur: 0.1, mod: 70 },
  ];

  const playSynthesizedTone = (type = waveType, freq = frequency, dur = duration, mod = modRate) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      // Frequency slide/pitch modulation
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq * (mod / 20)), ctx.currentTime + dur);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + dur);

      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), dur * 1000);
    } catch {
      sounds.playScore();
    }
  };

  // Oscilloscope Visualizer loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const loop = () => {
      phase += isPlaying ? 0.25 : 0.04;
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, 480, 160);

      // Oscilloscope grid lines
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      for (let x = 0; x < 480; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 160);
        ctx.stroke();
      }
      for (let y = 0; y < 160; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(480, y);
        ctx.stroke();
      }

      // Draw Waveform
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isPlaying ? '#38bdf8' : '#0284c7';
      ctx.shadowColor = isPlaying ? '#38bdf8' : '#0284c7';
      ctx.shadowBlur = isPlaying ? 12 : 4;

      ctx.beginPath();
      const amp = isPlaying ? 45 : 12;
      for (let x = 0; x < 480; x++) {
        let y = 80;
        const t = (x / 480) * 8 + phase;

        if (waveType === 'sine') {
          y += Math.sin(t) * amp;
        } else if (waveType === 'square') {
          y += (Math.sin(t) >= 0 ? 1 : -1) * amp * 0.8;
        } else if (waveType === 'sawtooth') {
          y += ((t % 1) * 2 - 1) * amp;
        } else {
          // Triangle
          y += (Math.abs((t % 1) * 4 - 2) - 1) * amp;
        }

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, waveType]);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none overflow-y-auto p-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h2 className="font-bold text-white text-base">REVIVE SOUND LAB & MODULATOR</h2>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
          WEB AUDIO ENGINE
        </span>
      </div>

      {/* Visualizer Oscilloscope Screen */}
      <div className="mt-4 flex flex-col items-center">
        <canvas
          ref={canvasRef}
          width={480}
          height={160}
          className="rounded-xl border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] w-full max-w-[480px] bg-slate-950"
        />
      </div>

      {/* Waveform Selector */}
      <div className="mt-5 grid grid-cols-4 gap-2 max-w-[480px] mx-auto w-full">
        {(['sine', 'square', 'sawtooth', 'triangle'] as OscillatorType[]).map(type => (
          <button
            key={type}
            onClick={() => {
              setWaveType(type);
              sounds.playClick();
            }}
            className={`py-2 px-1 rounded-lg text-xs font-mono font-bold capitalize transition-all border ${
              waveType === type
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/30'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Synthesis Controls */}
      <div className="mt-5 space-y-3 max-w-[480px] mx-auto w-full bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex justify-between text-xs font-mono mb-1 text-slate-300">
            <span>FREQUENCY</span>
            <span className="text-cyan-400">{frequency} Hz</span>
          </div>
          <input
            type="range"
            min="50"
            max="1600"
            step="10"
            value={frequency}
            onChange={e => setFrequency(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-mono mb-1 text-slate-300">
            <span>MODULATION / PITCH SWEEP</span>
            <span className="text-cyan-400">{modRate}%</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={modRate}
            onChange={e => setModRate(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-mono mb-1 text-slate-300">
            <span>DECAY DURATION</span>
            <span className="text-cyan-400">{duration.toFixed(2)}s</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="1.5"
            step="0.05"
            value={duration}
            onChange={e => setDuration(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        <button
          onClick={() => playSynthesizedTone()}
          className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 cursor-pointer active:scale-95 transition-all mt-2"
        >
          <Play className="w-4 h-4 fill-current" /> FIRE SYNTH TONE
        </button>
      </div>

      {/* Cyber Sound Presets */}
      <div className="mt-5 max-w-[480px] mx-auto w-full">
        <h3 className="text-xs font-mono text-slate-400 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> INSTANT FX PRESETS
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {presets.map(p => (
            <button
              key={p.name}
              onClick={() => {
                setWaveType(p.type);
                setFrequency(p.freq);
                setDuration(p.dur);
                setModRate(p.mod);
                playSynthesizedTone(p.type, p.freq, p.dur, p.mod);
              }}
              className="px-2 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 active:bg-cyan-950 border border-slate-800 text-slate-200 text-xs font-medium text-center truncate cursor-pointer transition-all"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
