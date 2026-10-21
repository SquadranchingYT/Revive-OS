import React, { useState, useEffect } from 'react';
import { Cpu, Activity, XCircle, HardDrive, CheckCircle2 } from 'lucide-react';
import { WindowItem } from '../../types/os';
import { sounds } from '../../utils/soundEffects';

interface TaskManagerAppProps {
  windows: WindowItem[];
  onCloseWindow: (winId: string) => void;
}

export const TaskManagerApp: React.FC<TaskManagerAppProps> = ({ windows, onCloseWindow }) => {
  const [cpuUsage, setCpuUsage] = useState(14);
  const [ramUsage, setRamUsage] = useState(28);

  useEffect(() => {
    const timer = setInterval(() => {
      // Natural simulated fluctuation based on number of active windows
      const baseCpu = Math.min(85, 8 + windows.length * 7 + (Math.random() * 8 - 4));
      const baseRam = Math.min(90, 22 + windows.length * 6 + (Math.random() * 4 - 2));
      setCpuUsage(Math.floor(baseCpu));
      setRamUsage(Math.floor(baseRam));
    }, 1500);
    return () => clearInterval(timer);
  }, [windows.length]);

  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      {/* Top telemetry meters */}
      <div className="grid grid-cols-2 gap-4 p-4 border-b border-slate-800 bg-slate-900/80">
        {/* CPU */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>CPU Core Activity</span>
            </span>
            <span className="font-mono font-bold text-cyan-300 tabular-nums">{cpuUsage}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-400 transition-all duration-500 shadow-[0_0_8px_#38bdf8]"
              style={{ width: `${cpuUsage}%` }}
            />
          </div>
        </div>

        {/* RAM */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-400">
              <HardDrive className="w-4 h-4 text-purple-400" />
              <span>System Memory</span>
            </span>
            <span className="font-mono font-bold text-purple-300 tabular-nums">{ramUsage}% (1.8 GB)</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-500 shadow-[0_0_8px_#c084fc]"
              style={{ width: `${ramUsage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Process Table Header */}
      <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
        <span className="w-1/2">RUNNING PROCESS</span>
        <span className="w-20 text-right">PID</span>
        <span className="w-20 text-right">CPU</span>
        <span className="w-24 text-right">ACTION</span>
      </div>

      {/* Process Rows */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {windows.map((win, idx) => (
          <div
            key={win.id}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 text-xs transition-colors"
          >
            <div className="w-1/2 flex items-center gap-2 overflow-hidden">
              <span>{win.icon}</span>
              <span className="font-medium text-white truncate">{win.title}</span>
            </div>

            <span className="w-20 text-right font-mono text-slate-400 tabular-nums">{1042 + idx * 8}</span>
            <span className="w-20 text-right font-mono text-cyan-400 tabular-nums">
              {(3.2 + (idx % 3) * 2.1).toFixed(1)}%
            </span>

            <div className="w-24 text-right">
              <button
                onClick={() => {
                  sounds.playBlip(300, 'sine', 0.04);
                  onCloseWindow(win.id);
                }}
                className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 rounded text-[11px] font-medium transition-colors cursor-pointer"
              >
                End Task
              </button>
            </div>
          </div>
        ))}

        {windows.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-500">No active window processes</div>
        )}
      </div>
    </div>
  );
};
