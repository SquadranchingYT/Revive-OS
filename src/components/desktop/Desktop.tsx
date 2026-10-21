import React from 'react';
import {
  Gamepad2,
  Terminal,
  Settings,
  FileText,
  Music,
  Zap,
  Rocket,
  Grid,
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
  Blocks,
  Disc
} from 'lucide-react';
import { OSTheme } from '../../types/os';
import { sounds } from '../../utils/soundEffects';
import { wallpaperImg } from '../../data/gamesList';

interface DesktopProps {
  onLaunchGame: (gameId: string) => void;
  onLaunchApp: (appId: string) => void;
  theme: OSTheme;
  onClickDesktop: () => void;
}

export const Desktop: React.FC<DesktopProps> = ({
  onLaunchGame,
  onLaunchApp,
  theme,
  onClickDesktop
}) => {
  const desktopIcons = [
    {
      id: 'app_gamehub',
      title: 'Game Hub',
      type: 'app' as const,
      appId: 'gamehub',
      icon: <Gamepad2 className="w-6 h-6 text-cyan-400" />
    },
    {
      id: 'game_racer',
      title: 'Neon Racer',
      type: 'game' as const,
      gameId: 'neon_racer',
      icon: <Flame className="w-6 h-6 text-rose-400" />
    },
    {
      id: 'game_clicker',
      title: 'Core Clicker',
      type: 'game' as const,
      gameId: 'core_clicker',
      icon: <Atom className="w-6 h-6 text-cyan-300" />
    },
    {
      id: 'game_slope',
      title: 'Slope 3D',
      type: 'game' as const,
      gameId: 'slope',
      icon: <Zap className="w-6 h-6 text-amber-400" />
    },
    {
      id: 'game_space',
      title: 'Galactic Invaders',
      type: 'game' as const,
      gameId: 'space_defender',
      icon: <Rocket className="w-6 h-6 text-purple-400" />
    },
    {
      id: 'game_tetris',
      title: 'Revive Tetris',
      type: 'game' as const,
      gameId: 'tetris',
      icon: <Grid className="w-6 h-6 text-emerald-400" />
    },
    {
      id: 'app_browser',
      title: 'Web Surfer',
      type: 'app' as const,
      appId: 'browser',
      icon: <Compass className="w-6 h-6 text-sky-400" />
    },
    {
      id: 'app_paint',
      title: 'Paint Studio',
      type: 'app' as const,
      appId: 'paint',
      icon: <Paintbrush className="w-6 h-6 text-pink-400" />
    },
    {
      id: 'app_calc',
      title: 'Calculator',
      type: 'app' as const,
      appId: 'calculator',
      icon: <Calculator className="w-6 h-6 text-teal-400" />
    },
    {
      id: 'app_terminal',
      title: 'Terminal',
      type: 'app' as const,
      appId: 'terminal',
      icon: <Terminal className="w-6 h-6 text-emerald-400" />
    },
    {
      id: 'app_notes',
      title: 'Cheats & Notes',
      type: 'app' as const,
      appId: 'notes',
      icon: <FileText className="w-6 h-6 text-yellow-400" />
    },
    {
      id: 'app_tasks',
      title: 'Task Manager',
      type: 'app' as const,
      appId: 'taskmanager',
      icon: <Cpu className="w-6 h-6 text-indigo-400" />
    },
    {
      id: 'app_beatmaker',
      title: 'Beatpad 808',
      type: 'app' as const,
      appId: 'beatmaker',
      icon: <Sliders className="w-6 h-6 text-fuchsia-400" />
    },
    {
      id: 'app_files',
      title: 'File Explorer',
      type: 'app' as const,
      appId: 'files',
      icon: <Folder className="w-6 h-6 text-amber-400" />
    },
    {
      id: 'app_timer',
      title: 'Focus Timer',
      type: 'app' as const,
      appId: 'timer',
      icon: <Timer className="w-6 h-6 text-rose-400" />
    },
    {
      id: 'game_pinball',
      title: 'Cosmic Pinball',
      type: 'game' as const,
      gameId: 'neon_pinball',
      icon: <Disc className="w-6 h-6 text-cyan-300" />
    },
    {
      id: 'game_blockblast',
      title: 'Gem Blast',
      type: 'game' as const,
      gameId: 'block_blast',
      icon: <Blocks className="w-6 h-6 text-amber-300" />
    },
    {
      id: 'app_audiolab',
      title: 'Sound Lab',
      type: 'app' as const,
      appId: 'audiolab',
      icon: <Activity className="w-6 h-6 text-pink-400" />
    },
    {
      id: 'app_bench',
      title: 'CyberBench',
      type: 'app' as const,
      appId: 'systembench',
      icon: <Sparkles className="w-6 h-6 text-indigo-400" />
    },
    {
      id: 'app_settings',
      title: 'OS Settings',
      type: 'app' as const,
      appId: 'settings',
      icon: <Settings className="w-6 h-6 text-slate-300" />
    }
  ];

  return (
    <div
      onClick={onClickDesktop}
      className="relative w-full h-full overflow-hidden select-none bg-slate-950"
    >
      {/* High-res Wallpaper Background */}
      <img
        src={wallpaperImg}
        alt="Revive OS Wallpaper"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none filter brightness-90"
      />

      {/* Atmospheric Theme Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-60 pointer-events-none`} />

      {/* Desktop Brand Header */}
      <div className="absolute top-8 left-8 pointer-events-none select-none z-0">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white/90 drop-shadow-[0_2px_15px_rgba(0,0,0,0.8)]">
          REVIVE OS
        </h1>
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400/80 mt-1">
          <span>UNBLOCKED GAMING PLATFORM</span>
          <span aria-hidden="true">·</span>
          <span>STEALTH ENABLED</span>
        </div>
      </div>

      {/* Desktop Shortcuts Grid */}
      <div className="relative z-10 p-6 pt-24 grid grid-flow-col grid-rows-6 sm:grid-rows-5 gap-3 w-max">
        {desktopIcons.map(item => (
          <button
            key={item.id}
            onClick={e => {
              e.stopPropagation();
              sounds.playClick();
              if (item.type === 'game' && item.gameId) {
                onLaunchGame(item.gameId);
              } else if (item.type === 'app' && item.appId) {
                onLaunchApp(item.appId);
              }
            }}
            className="w-24 p-2 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center transition-all duration-150 hover:bg-white/10 hover:backdrop-blur-md hover:border hover:border-white/20 active:scale-95 group cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-700/60 shadow-lg group-hover:border-cyan-400/60 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all">
              {item.icon}
            </div>
            <span className="text-[11px] font-medium text-slate-100 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] truncate max-w-[80px]">
              {item.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
