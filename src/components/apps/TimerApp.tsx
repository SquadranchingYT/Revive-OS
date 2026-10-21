import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flag, Timer, Clock } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export const TimerApp: React.FC = () => {
  const [tab, setTab] = useState<'stopwatch' | 'pomodoro'>('stopwatch');

  // Stopwatch state
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isSwRunning, setIsSwRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

  // Pomodoro state (25 min focus = 1500 sec)
  const [pomoTime, setPomoTime] = useState(25 * 60);
  const [isPomoRunning, setIsPomoRunning] = useState(false);
  const [pomoMode, setPomoMode] = useState<'focus' | 'break'>('focus');

  // Stopwatch effect
  useEffect(() => {
    let interval: number;
    if (isSwRunning) {
      interval = window.setInterval(() => {
        setStopwatchTime(prev => prev + 10);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [isSwRunning]);

  // Pomodoro effect
  useEffect(() => {
    let interval: number;
    if (isPomoRunning) {
      interval = window.setInterval(() => {
        setPomoTime(prev => {
          if (prev <= 1) {
            sounds.playScore();
            if (pomoMode === 'focus') {
              setPomoMode('break');
              return 5 * 60; // 5 min break
            } else {
              setPomoMode('focus');
              return 25 * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPomoRunning, pomoMode]);

  const formatMs = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centis = Math.floor((ms % 1000) / 10);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centis).padStart(2, '0')}`;
  };

  const formatSec = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleLap = () => {
    sounds.playBlip(550, 'sine', 0.03);
    setLaps(prev => [stopwatchTime, ...prev]);
  };

  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-hidden p-4">
      {/* Tab Switcher */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <button
          onClick={() => {
            sounds.playClick();
            setTab('stopwatch');
          }}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            tab === 'stopwatch' ? 'bg-cyan-500 text-slate-950 shadow-xs' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Timer className="w-3.5 h-3.5" />
          <span>Stopwatch</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setTab('pomodoro');
          }}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            tab === 'pomodoro' ? 'bg-cyan-500 text-slate-950 shadow-xs' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pomodoro Study</span>
        </button>
      </div>

      {tab === 'stopwatch' ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Big Time Display */}
          <div className="text-4xl sm:text-5xl font-extrabold font-mono text-cyan-400 tracking-wider tabular-nums mb-6 drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]">
            {formatMs(stopwatchTime)}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => {
                sounds.playClick();
                setIsSwRunning(r => !r);
              }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-xs transition-transform active:scale-95 cursor-pointer ${
                isSwRunning ? 'bg-rose-500 text-white' : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
              }`}
            >
              {isSwRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isSwRunning ? 'Stop' : 'Start'}</span>
            </button>

            {isSwRunning && (
              <button
                onClick={handleLap}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs rounded-full font-semibold transition-colors cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Lap</span>
              </button>
            )}

            {!isSwRunning && stopwatchTime > 0 && (
              <button
                onClick={() => {
                  sounds.playBlip(320, 'sine', 0.02);
                  setStopwatchTime(0);
                  setLaps([]);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs rounded-full font-semibold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Laps List */}
          {laps.length > 0 && (
            <div className="w-full max-w-xs max-h-36 overflow-y-auto space-y-1 pr-1 border-t border-slate-800 pt-3">
              {laps.map((lapMs, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Lap {laps.length - idx}</span>
                  <span className="text-white tabular-nums">{formatMs(lapMs)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Pomodoro Timer View */
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
            {pomoMode === 'focus' ? 'FOCUS SESSION' : 'SHORT BREAK'}
          </div>

          <div className="text-5xl sm:text-6xl font-extrabold font-mono text-white tracking-wider tabular-nums mb-6 drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            {formatSec(pomoTime)}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sounds.playClick();
                setIsPomoRunning(r => !r);
              }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-xs transition-transform active:scale-95 cursor-pointer ${
                isPomoRunning ? 'bg-rose-500 text-white' : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
              }`}
            >
              {isPomoRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPomoRunning ? 'Pause' : 'Start Focus'}</span>
            </button>

            <button
              onClick={() => {
                sounds.playBlip(320, 'sine', 0.02);
                setIsPomoRunning(false);
                setPomoTime(pomoMode === 'focus' ? 25 * 60 : 5 * 60);
              }}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
