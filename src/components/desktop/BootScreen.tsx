import React, { useEffect, useState, useRef } from 'react';
import { Terminal, Cpu, Shield, Gamepad2, Sparkles, CheckCircle2, FastForward } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface BootScreenProps {
  durationMs?: number; // Default 4000ms (4 seconds)
  onComplete: () => void;
}

interface BootStep {
  timeMs: number;
  label: string;
  sub: string;
  icon: 'cpu' | 'fs' | 'games' | 'security' | 'desktop' | 'ready';
}

const BOOT_STEPS: BootStep[] = [
  { timeMs: 400, label: 'Kernel Initialization', sub: 'Revive Microkernel v4.8 mounted (x86_64 WebASM)', icon: 'cpu' },
  { timeMs: 1200, label: 'Virtual Storage & VFS', sub: 'Allocating encrypted local state & sandbox cache', icon: 'fs' },
  { timeMs: 2000, label: 'Arcade Engine Subsystem', sub: 'Preloading 26+ game cores, WebGL shaders & audio bank', icon: 'games' },
  { timeMs: 2900, label: 'Stealth Cloak Daemon', sub: 'Arming panic hotkeys & tab spoofing hooks', icon: 'security' },
  { timeMs: 3600, label: 'Desktop Compositor', sub: 'Initializing Window Manager & Revive Taskbar dock', icon: 'desktop' },
  { timeMs: 4000, label: 'System Ready', sub: 'All subsystems verified · Starting Revive OS', icon: 'ready' }
];

export const BootScreen: React.FC<BootScreenProps> = ({
  durationMs = 4000,
  onComplete
}) => {
  const [progress, setProgress] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const hasFinishedRef = useRef(false);

  // Play startup sound on completion
  const finishBoot = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    setProgress(100);
    setElapsedMs(durationMs);
    sounds.playStart();
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 400);
  };

  useEffect(() => {
    startTimeRef.current = performance.now();

    const loop = (now: number) => {
      if (!startTimeRef.current) return;
      const elapsed = now - startTimeRef.current;
      setElapsedMs(Math.min(elapsed, durationMs));

      const rawPct = (elapsed / durationMs) * 100;
      const currentPct = Math.min(100, Math.floor(rawPct));
      setProgress(currentPct);

      // Determine active steps
      const stepIdx = BOOT_STEPS.findIndex(s => elapsed < s.timeMs);
      const newIndex = stepIdx === -1 ? BOOT_STEPS.length : stepIdx;
      setActiveStepIndex(prev => {
        if (newIndex > prev && newIndex < BOOT_STEPS.length) {
          sounds.playBlip(300 + newIndex * 120, 'sine', 0.03);
        }
        return newIndex;
      });

      if (elapsed >= durationMs) {
        finishBoot();
      } else {
        animFrameRef.current = requestAnimationFrame(loop);
      }
    };

    animFrameRef.current = requestAnimationFrame(loop);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape') {
        finishBoot();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [durationMs]);

  const currentSeconds = (elapsedMs / 1000).toFixed(2);
  const totalSeconds = (durationMs / 1000).toFixed(1);

  return (
    <div
      onClick={finishBoot}
      className={`fixed inset-0 z-[100000] bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-6 sm:p-10 select-none overflow-hidden transition-opacity duration-300 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 35%, rgba(6, 182, 212, 0.12) 0%, transparent 60%),
          radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.08) 0%, transparent 50%),
          linear-gradient(to bottom, #020617, #030712)
        `
      }}
    >
      {/* Background Cyber Grid */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Top Header Information */}
      <div className="w-full max-w-4xl flex items-center justify-between text-xs font-mono text-slate-400 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-cyan-400 font-bold tracking-widest uppercase">REVIVE BOOTLOADER v4.8</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span>TIME: <span className="text-cyan-300 font-bold">{currentSeconds}s</span> / {totalSeconds}s</span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline">MEM: 16384 MB OK</span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="text-emerald-400 font-semibold">26+ GAMES READY</span>
        </div>
      </div>

      {/* Center OS Brand & Circular Spinner */}
      <div className="flex flex-col items-center justify-center my-auto relative z-10 w-full max-w-lg">
        {/* Glowing Logo HUD */}
        <div className="relative mb-6">
          {/* Pulsing Outer Rings */}
          <div className="absolute -inset-4 rounded-full border border-cyan-500/20 animate-spin" style={{ animationDuration: '8s' }} />
          <div className="absolute -inset-7 rounded-full border border-dashed border-violet-500/25 animate-spin" style={{ animationDuration: '14s', animationDirection: 'reverse' }} />

          {/* Central Logo Badge */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-cyan-950 via-slate-900 to-violet-950 border-2 border-cyan-400/60 shadow-[0_0_35px_rgba(6,182,212,0.35)] flex flex-col items-center justify-center">
            <span className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-cyan-300 via-sky-200 to-violet-300 bg-clip-text text-transparent tracking-tighter">
              R
            </span>
            <span className="text-[9px] font-mono font-bold tracking-widest text-cyan-400/80 -mt-1 uppercase">
              REVIVE
            </span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1 text-center">
          REVIVE <span className="text-cyan-400">OS</span>
        </h1>
        <p className="text-xs text-slate-400 tracking-wider font-mono uppercase mb-6 text-center">
          Next-Generation Unblocked Gaming System
        </p>

        {/* 4-Second Progress Bar with Glowing Head */}
        <div className="w-full bg-slate-900/90 border border-slate-700/80 rounded-full h-4 p-0.5 overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] mb-3 relative">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-violet-500 rounded-full transition-all duration-75 relative shadow-[0_0_12px_rgba(6,182,212,0.6)]"
            style={{ width: `${progress}%` }}
          >
            {/* Bright leading tip */}
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full shadow-[0_0_8px_#ffffff]" />
          </div>
        </div>

        {/* Counter & Speed Label */}
        <div className="w-full flex items-center justify-between text-xs font-mono mb-6">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Loading System ({currentSeconds}s / {totalSeconds}s)</span>
          </span>
          <span className="text-cyan-300 font-bold text-sm tracking-wider">
            {progress}%
          </span>
        </div>

        {/* Live Boot Step Log Terminal */}
        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 backdrop-blur-md font-mono text-xs shadow-xl">
          <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>BOOT INITIALIZATION LOG</span>
          </div>

          <div className="space-y-1.5 text-left max-h-36 overflow-hidden">
            {BOOT_STEPS.map((step, idx) => {
              const isPast = elapsedMs >= step.timeMs;
              const isCurrent = idx === activeStepIndex;

              return (
                <div
                  key={step.label}
                  className={`flex items-start gap-2 text-[11px] transition-colors ${
                    isPast
                      ? 'text-slate-300'
                      : isCurrent
                      ? 'text-cyan-300 font-semibold'
                      : 'text-slate-600'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isPast ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : isCurrent ? (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-slate-700 ml-0.5" />
                    )}
                  </div>
                  <div className="truncate">
                    <span className="font-semibold">{step.label}: </span>
                    <span className="text-slate-400">{step.sub}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Instructions & Skip Action */}
      <div className="w-full max-w-4xl flex items-center justify-between text-xs text-slate-500 relative z-10 pt-4">
        <div className="text-[11px]">
          Target Boot Duration: <span className="text-slate-300 font-mono font-medium">4.0 seconds</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            finishBoot();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all cursor-pointer text-xs group"
          title="Skip 4-second boot animation"
        >
          <span>Skip to Desktop</span>
          <FastForward className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
