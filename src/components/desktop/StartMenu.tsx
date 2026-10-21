import React, { useState } from 'react';
import {
  Gamepad2,
  Settings,
  Terminal,
  FileText,
  Music,
  Shield,
  Search,
  Paintbrush,
  Calculator,
  Compass,
  Cpu,
  Flame,
  Atom,
  Sliders,
  Folder,
  Timer,
  Activity,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { GAMES_CATALOG } from '../../data/gamesList';
import { OSTheme } from '../../types/os';
import { sounds } from '../../utils/soundEffects';

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchGame: (gameId: string) => void;
  onLaunchApp: (appId: string) => void;
  onCloak: () => void;
  onReboot?: () => void;
  theme: OSTheme;
}

export const StartMenu: React.FC<StartMenuProps> = ({
  isOpen,
  onClose,
  onLaunchGame,
  onLaunchApp,
  onCloak,
  onReboot,
  theme
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const coreApps = [
    { id: 'gamehub', name: 'Revive Game Hub', icon: <Gamepad2 className="w-4 h-4 text-cyan-400" />, desc: `Explore all ${GAMES_CATALOG.length} games` },
    { id: 'beatmaker', name: 'Beatpad 808', icon: <Sliders className="w-4 h-4 text-fuchsia-400" />, desc: 'Drum pad & 8-step sequencer' },
    { id: 'audiolab', name: 'Sound Lab', icon: <Activity className="w-4 h-4 text-pink-400" />, desc: 'Cyber synth & voice modulator' },
    { id: 'systembench', name: 'CyberBench', icon: <Sparkles className="w-4 h-4 text-indigo-400" />, desc: 'Hardware monitor & stress test' },
    { id: 'files', name: 'File Explorer', icon: <Folder className="w-4 h-4 text-amber-400" />, desc: 'System files & documents' },
    { id: 'timer', name: 'Focus Timer', icon: <Timer className="w-4 h-4 text-rose-400" />, desc: 'Stopwatch & Pomodoro' },
    { id: 'browser', name: 'Web Surfer', icon: <Compass className="w-4 h-4 text-sky-400" />, desc: 'Encyclopedia & math viewer' },
    { id: 'paint', name: 'Paint Studio', icon: <Paintbrush className="w-4 h-4 text-pink-400" />, desc: 'Neon drawing & PNG export' },
    { id: 'calculator', name: 'Calculator', icon: <Calculator className="w-4 h-4 text-teal-400" />, desc: 'Scientific math & history' },
    { id: 'taskmanager', name: 'Task Manager', icon: <Cpu className="w-4 h-4 text-indigo-400" />, desc: 'CPU, RAM & process control' },
    { id: 'terminal', name: 'Cyber Terminal', icon: <Terminal className="w-4 h-4 text-purple-400" />, desc: 'OS commands & cheats' },
    { id: 'notes', name: 'Notes & Cheats', icon: <FileText className="w-4 h-4 text-yellow-400" />, desc: 'Game codes & tips' },
    { id: 'music', name: 'Synthesizer', icon: <Music className="w-4 h-4 text-rose-400" />, desc: 'Procedural chiptune player' },
    { id: 'settings', name: 'Control Panel', icon: <Settings className="w-4 h-4 text-slate-300" />, desc: 'Themes, cloaks & hotkeys' }
  ];

  const searchResults = query.trim()
    ? GAMES_CATALOG.filter(g =>
        g.title.toLowerCase().includes(query.toLowerCase()) ||
        g.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div
      onClick={e => e.stopPropagation()}
      className={`fixed bottom-14 left-3 w-80 sm:w-96 rounded-2xl border border-slate-700/80 p-4 shadow-2xl backdrop-blur-xl z-[9999] flex flex-col max-h-[550px] ${theme.glass} animate-in fade-in slide-in-from-bottom-2 duration-150`}
    >
      {/* Top Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search games, apps, settings..."
          className="w-full bg-slate-950/70 border border-slate-700/80 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 outline-none"
          autoFocus
        />
      </div>

      {/* Query Search Results */}
      {query.trim() ? (
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 mb-2">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider px-2 py-1">
            Search Results ({searchResults.length})
          </div>
          {searchResults.map(game => (
            <button
              key={game.id}
              onClick={() => {
                sounds.playClick();
                onLaunchGame(game.id);
                onClose();
              }}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/80 text-left transition-colors cursor-pointer group"
            >
              <div>
                <div className="text-xs font-semibold text-white group-hover:text-cyan-400">{game.title}</div>
                <div className="text-[11px] text-slate-400">{game.category}</div>
              </div>
              <span className="text-[11px] text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">Launch</span>
            </button>
          ))}
          {searchResults.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-500">No games found for "{query}"</div>
          )}
        </div>
      ) : (
        /* Pinned Section */
        <div className="flex-1 overflow-y-auto pr-1 mb-2 space-y-3">
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider px-2 py-1 mb-1">
              Revive OS Applications
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {coreApps.map(app => (
                <button
                  key={app.id}
                  onClick={() => {
                    sounds.playClick();
                    onLaunchApp(app.id);
                    onClose();
                  }}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-800/80 text-left transition-colors cursor-pointer group border border-transparent hover:border-slate-700/60"
                >
                  <div className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800 group-hover:border-cyan-500/50">
                    {app.icon}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-medium text-white group-hover:text-cyan-400 truncate">
                      {app.name}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Pick Games */}
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider px-2 py-1 mb-1">
              Featured Games
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {GAMES_CATALOG.slice(0, 4).map(g => (
                <button
                  key={g.id}
                  onClick={() => {
                    sounds.playClick();
                    onLaunchGame(g.id);
                    onClose();
                  }}
                  className="p-2 rounded-lg bg-slate-950/50 hover:bg-slate-800/70 border border-slate-800/80 text-left transition-colors cursor-pointer"
                >
                  <div className="text-xs font-medium text-slate-200 truncate">{g.title}</div>
                  <div className="text-[10px] text-slate-500">{g.category}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer Bottom Strip */}
      <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 font-bold text-[9px]">
            R
          </div>
          <span className="text-xs font-semibold text-slate-300">Revive OS v2.4</span>
        </div>

        <div className="flex items-center gap-2">
          {onReboot && (
            <button
              onClick={() => {
                sounds.playClick();
                onClose();
                onReboot();
              }}
              title="Reboot Revive OS (4s Load Sequence)"
              className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Restart</span>
            </button>
          )}

          <button
            onClick={() => {
              sounds.playClick();
              onCloak();
              onClose();
            }}
            title="Instant stealth cloak"
            className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Panic Cloak</span>
          </button>
        </div>
      </div>
    </div>
  );
};
