import React, { useState, useEffect } from 'react';
import { Cpu, Zap, Activity, HardDrive, CheckCircle2, RotateCcw, Award } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';
import { safeStorage } from '../../utils/safeStorage';

export const SystemBenchApp: React.FC = () => {
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [testPhase, setTestPhase] = useState('Idle');
  const [benchScore, setBenchScore] = useState<number | null>(() => {
    const saved = safeStorage.getItem('revive_bench_score');
    return saved ? parseInt(saved, 10) : 12480;
  });

  const [coreLoads, setCoreLoads] = useState<number[]>([18, 24, 12, 35, 15, 20, 28, 10]);

  // Simulate real-time CPU core fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setCoreLoads(prev =>
        prev.map(load => {
          if (isBenchmarking) {
            return Math.min(100, Math.floor(85 + Math.random() * 15));
          }
          const delta = (Math.random() - 0.5) * 16;
          return Math.max(5, Math.min(65, Math.floor(load + delta)));
        })
      );
    }, 400);

    return () => clearInterval(interval);
  }, [isBenchmarking]);

  const runBenchmark = () => {
    setIsBenchmarking(true);
    setProgress(0);
    setTestPhase('Initializing Multi-Core Stress Test...');
    sounds.playStart();

    let p = 0;
    const interval = setInterval(() => {
      p += 4;
      setProgress(Math.min(100, p));

      if (p === 20) {
        setTestPhase('Phase 1: Float64 Matrix Arithmetic...');
      } else if (p === 50) {
        setTestPhase('Phase 2: Canvas WebGL Particle Physics...');
      } else if (p === 80) {
        setTestPhase('Phase 3: Cryptographic Hash Stress...');
      } else if (p >= 100) {
        clearInterval(interval);
        setIsBenchmarking(false);
        const finalScore = Math.floor(13500 + Math.random() * 1800);
        setBenchScore(finalScore);
        safeStorage.setItem('revive_bench_score', finalScore.toString());
        setTestPhase('Benchmark Complete');
        sounds.playScore();
      }
    }, 150);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none overflow-y-auto p-4">
      {/* App Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-400" />
          <h2 className="font-bold text-white text-base">CYBERBENCH HARDWARE MONITOR</h2>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          REVIVE OS v2.4 KERNEL
        </span>
      </div>

      {/* Benchmark Summary Card */}
      <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 shadow-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-mono text-slate-400">BENCHMARK RATING</span>
          <div className="text-3xl font-black font-mono text-white tracking-tight flex items-center gap-2">
            {benchScore ? benchScore.toLocaleString() : '---'}
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              ULTRA TIER
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Certified for 120 FPS high-refresh gaming on Revive OS
          </p>
        </div>

        <button
          onClick={runBenchmark}
          disabled={isBenchmarking}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs font-mono tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
            isBenchmarking
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-indigo-500 hover:bg-indigo-400 active:scale-95 text-white shadow-indigo-500/30'
          }`}
        >
          {isBenchmarking ? (
            <>
              <Activity className="w-4 h-4 animate-spin text-indigo-400" /> RUNNING...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" /> TEST HARDWARE
            </>
          )}
        </button>
      </div>

      {/* Live Benchmark Progress Bar */}
      {isBenchmarking && (
        <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800">
          <div className="flex justify-between text-xs font-mono mb-1.5">
            <span className="text-cyan-400">{testPhase}</span>
            <span className="text-white font-bold">{progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Multi-Core CPU Load Visualizer */}
      <div className="mt-5">
        <h3 className="text-xs font-mono text-slate-400 mb-2 flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" /> LOGICAL PROCESSOR CORES (8 THREADS)
        </h3>
        <div className="grid grid-cols-4 gap-2.5">
          {coreLoads.map((load, idx) => (
            <div key={idx} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                <span>CORE {idx}</span>
                <span className={load > 80 ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                  {load}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    load > 80 ? 'bg-rose-500' : load > 50 ? 'bg-amber-400' : 'bg-cyan-400'
                  }`}
                  style={{ width: `${load}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hardware Telemetry Specs */}
      <div className="mt-5">
        <h3 className="text-xs font-mono text-slate-400 mb-2 flex items-center gap-1.5">
          <HardDrive className="w-3.5 h-3.5 text-indigo-400" /> SYSTEM ARCHITECTURE
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
            <span className="text-slate-400">Platform:</span>
            <span className="text-slate-200">Revive OS x86_64</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
            <span className="text-slate-400">Graphics Engine:</span>
            <span className="text-cyan-400">WebGL 2.0 Direct</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
            <span className="text-slate-400">Display Sync:</span>
            <span className="text-emerald-400">60-144 Hz Adaptive</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
            <span className="text-slate-400">Audio Pipeline:</span>
            <span className="text-amber-400">48 kHz Synth Core</span>
          </div>
        </div>
      </div>
    </div>
  );
};
