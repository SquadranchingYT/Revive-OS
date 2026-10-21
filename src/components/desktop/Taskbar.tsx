import React, { useState, useEffect } from 'react';
import {
  Shield,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  X,
  Wifi,
  Sparkles
} from 'lucide-react';
import { WindowItem, OSTheme } from '../../types/os';
import { sounds } from '../../utils/soundEffects';

interface TaskbarProps {
  windows: WindowItem[];
  activeWindowId: string | null;
  onSelectWindow: (id: string) => void;
  onCloseWindow: (id: string) => void;
  isStartOpen: boolean;
  onToggleStart: () => void;
  onCloak: () => void;
  panicKey: string;
  isMuted: boolean;
  onToggleMute: () => void;
  theme: OSTheme;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  windows,
  activeWindowId,
  onSelectWindow,
  onCloseWindow,
  isStartOpen,
  onToggleStart,
  onCloak,
  panicKey,
  isMuted,
  onToggleMute,
  theme
}) => {
  const [time, setTime] = useState(() => formatTime(new Date()));
  const [isFullscreen, setIsFullscreen] = useState(false);

  function formatTime(d: Date) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(formatTime(new Date()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    sounds.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      onClick={e => e.stopPropagation()}
      className={`fixed bottom-0 left-0 right-0 h-12 border-t border-white/10 z-[9998] flex items-center justify-between px-3 ${theme.windowHeader} backdrop-blur-xl shadow-2xl select-none`}
    >
      {/* Left: Start Button & Open Windows */}
      <div className="flex items-center gap-2 overflow-x-auto max-w-[70vw] pr-2">
        {/* Revive OS Start Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onToggleStart();
          }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
            isStartOpen
              ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.6)]'
              : 'bg-slate-800/90 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30'
          }`}
        >
          <div className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 font-black flex items-center justify-center text-[10px]">
            R
          </div>
          <span className="tracking-wide">REVIVE</span>
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1 shrink-0" />

        {/* Running Windows Tabs */}
        {windows.map(win => {
          const isActive = activeWindowId === win.id && !win.isMinimized;

          return (
            <div
              key={win.id}
              onClick={() => {
                sounds.playClick();
                onSelectWindow(win.id);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all cursor-pointer shrink-0 max-w-[160px] group ${
                isActive
                  ? 'bg-slate-800 border-cyan-400/60 text-white shadow-xs'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-sm">{win.icon}</span>
              <span className="truncate font-medium">{win.title}</span>

              <button
                onClick={e => {
                  e.stopPropagation();
                  onCloseWindow(win.id);
                }}
                className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5 rounded transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Right: System Tray & Panic Button */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Panic Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onCloak();
          }}
          title={`Instant Stealth Cloak (${panicKey})`}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
        >
          <Shield className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden sm:inline">PANIC</span>
          <kbd className="hidden sm:inline text-[10px] bg-rose-950 px-1 py-0.5 rounded border border-rose-700/60 font-mono text-rose-200">
            {panicKey}
          </kbd>
        </button>

        {/* Audio Mute Toggle */}
        <button
          onClick={() => {
            sounds.playClick();
            onToggleMute();
          }}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          title="Toggle Fullscreen"
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Clock */}
        <div className="px-2 py-1 text-xs font-mono font-medium text-slate-300 bg-slate-900/80 rounded-md border border-slate-800">
          {time}
        </div>
      </div>
    </div>
  );
};
