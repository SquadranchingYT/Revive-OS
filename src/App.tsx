import React, { useState, useEffect, useCallback } from 'react';
import { WindowItem, OSTheme } from './types/os';
import { GAMES_CATALOG, OS_THEMES, CLOAK_PRESETS } from './data/gamesList';
import { Desktop } from './components/desktop/Desktop';
import { Taskbar } from './components/desktop/Taskbar';
import { StartMenu } from './components/desktop/StartMenu';
import { WindowFrame } from './components/desktop/WindowFrame';
import { StealthCloak } from './components/stealth/StealthCloak';
import { GameContainer } from './components/games/GameContainer';
import { GameHubApp } from './components/apps/GameHubApp';
import { SettingsApp } from './components/apps/SettingsApp';
import { NotesApp } from './components/apps/NotesApp';
import { TerminalApp } from './components/apps/TerminalApp';
import { MusicPlayerApp } from './components/apps/MusicPlayerApp';
import { PaintApp } from './components/apps/PaintApp';
import { CalculatorApp } from './components/apps/CalculatorApp';
import { BrowserApp } from './components/apps/BrowserApp';
import { TaskManagerApp } from './components/apps/TaskManagerApp';
import { sounds } from './utils/soundEffects';

export default function App() {
  const [themeId, setThemeId] = useState(() => localStorage.getItem('revive_theme') || 'cyber_onyx');
  const [cloakId, setCloakId] = useState(() => localStorage.getItem('revive_cloak') || 'none');
  const [panicKey, setPanicKey] = useState(() => localStorage.getItem('revive_panic_key') || ']');
  const [isCloaked, setIsCloaked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [activeWindowId, setActiveWindowId] = useState<string | null>('win_gamehub');
  const [maxZ, setMaxZ] = useState(10);

  // Initial Open Window: Revive Game Hub
  const [windows, setWindows] = useState<WindowItem[]>([
    {
      id: 'win_gamehub',
      title: 'Revive Game Hub',
      icon: '🎮',
      type: 'app',
      appId: 'gamehub',
      isMinimized: false,
      isMaximized: false,
      zIndex: 10,
      x: 80,
      y: 50,
      width: Math.min(window.innerWidth - 120, 1020),
      height: Math.min(window.innerHeight - 130, 680)
    }
  ]);

  const currentTheme: OSTheme = OS_THEMES.find(t => t.id === themeId) || OS_THEMES[0];

  // Tab cloaking sync with document title & favicon
  useEffect(() => {
    const preset = CLOAK_PRESETS.find(p => p.id === cloakId) || CLOAK_PRESETS[0];
    document.title = isCloaked ? 'Untitled document - Google Docs' : preset.tabTitle;

    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = isCloaked ? 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico' : preset.favicon;
  }, [cloakId, isCloaked]);

  // Global Panic Shortcut listener
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === panicKey || (panicKey === 'Escape' && e.code === 'Escape')) {
        e.preventDefault();
        sounds.playClick();
        setIsCloaked(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [panicKey]);

  const bringToFront = useCallback((winId: string) => {
    setMaxZ(prev => {
      const nextZ = prev + 1;
      setWindows(wins =>
        wins.map(w => (w.id === winId ? { ...w, zIndex: nextZ, isMinimized: false } : w))
      );
      return nextZ;
    });
    setActiveWindowId(winId);
  }, []);

  const launchGame = (gameId: string) => {
    const existing = windows.find(w => w.gameId === gameId);
    if (existing) {
      bringToFront(existing.id);
      return;
    }

    const game = GAMES_CATALOG.find(g => g.id === gameId);
    if (!game) return;

    const newWinId = `win_game_${gameId}_${Date.now()}`;
    const nextZ = maxZ + 1;
    setMaxZ(nextZ);

    const winWidth = Math.min(window.innerWidth - 60, 840);
    const winHeight = Math.min(window.innerHeight - 110, 620);
    const randomOffset = (windows.length % 5) * 24;

    const newWindow: WindowItem = {
      id: newWinId,
      title: game.title,
      icon: '🕹️',
      type: 'game',
      gameId: game.id,
      isMinimized: false,
      isMaximized: false,
      zIndex: nextZ,
      x: Math.max(30, Math.floor((window.innerWidth - winWidth) / 2) + randomOffset),
      y: Math.max(30, Math.floor((window.innerHeight - winHeight) / 2) + randomOffset),
      width: winWidth,
      height: winHeight
    };

    setWindows(prev => [...prev, newWindow]);
    setActiveWindowId(newWinId);
  };

  const launchApp = (appId: string) => {
    const existing = windows.find(w => w.appId === appId);
    if (existing) {
      bringToFront(existing.id);
      return;
    }

    const appTitles: Record<string, { title: string; icon: string; width: number; height: number }> = {
      gamehub: { title: 'Revive Game Hub', icon: '🎮', width: 1000, height: 680 },
      settings: { title: 'Revive OS Control Panel', icon: '⚙️', width: 680, height: 560 },
      terminal: { title: 'Cyber Terminal', icon: '💻', width: 660, height: 460 },
      notes: { title: 'Cheatsheet Notes', icon: '📝', width: 560, height: 440 },
      music: { title: 'Synthesizer Music Player', icon: '🎵', width: 440, height: 380 },
      paint: { title: 'Paint Studio', icon: '🎨', width: 800, height: 560 },
      calculator: { title: 'Scientific Calculator', icon: '🔢', width: 420, height: 480 },
      browser: { title: 'Web Surfer', icon: '🌐', width: 880, height: 600 },
      taskmanager: { title: 'Task Manager', icon: '📊', width: 620, height: 450 }
    };

    const config = appTitles[appId] || { title: 'Revive App', icon: '📁', width: 640, height: 480 };
    const newWinId = `win_app_${appId}_${Date.now()}`;
    const nextZ = maxZ + 1;
    setMaxZ(nextZ);

    const winWidth = Math.min(window.innerWidth - 60, config.width);
    const winHeight = Math.min(window.innerHeight - 110, config.height);

    const newWindow: WindowItem = {
      id: newWinId,
      title: config.title,
      icon: config.icon,
      type: 'app',
      appId,
      isMinimized: false,
      isMaximized: false,
      zIndex: nextZ,
      x: Math.max(40, Math.floor((window.innerWidth - winWidth) / 2)),
      y: Math.max(40, Math.floor((window.innerHeight - winHeight) / 2)),
      width: winWidth,
      height: winHeight
    };

    setWindows(prev => [...prev, newWindow]);
    setActiveWindowId(newWinId);
  };

  const closeWindow = (winId: string) => {
    setWindows(prev => prev.filter(w => w.id !== winId));
    if (activeWindowId === winId) {
      const remaining = windows.filter(w => w.id !== winId);
      setActiveWindowId(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
    }
  };

  const minimizeWindow = (winId: string) => {
    setWindows(prev => prev.map(w => (w.id === winId ? { ...w, isMinimized: true } : w)));
    if (activeWindowId === winId) {
      setActiveWindowId(null);
    }
  };

  const toggleMaximizeWindow = (winId: string) => {
    setWindows(prev =>
      prev.map(w => (w.id === winId ? { ...w, isMaximized: !w.isMaximized } : w))
    );
  };

  const handleSelectWindowFromTaskbar = (winId: string) => {
    const win = windows.find(w => w.id === winId);
    if (!win) return;
    if (win.isMinimized) {
      bringToFront(winId);
    } else if (activeWindowId === winId) {
      minimizeWindow(winId);
    } else {
      bringToFront(winId);
    }
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sounds.setMuted(next);
  };

  const handleThemeChange = (id: string) => {
    setThemeId(id);
    localStorage.setItem('revive_theme', id);
  };

  const handleCloakChange = (id: string) => {
    setCloakId(id);
    localStorage.setItem('revive_cloak', id);
  };

  const handlePanicKeyChange = (key: string) => {
    setPanicKey(key);
    localStorage.setItem('revive_panic_key', key);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* Emergency Stealth Screen */}
      {isCloaked && (
        <StealthCloak onDeactivate={() => setIsCloaked(false)} />
      )}

      {/* Main Desktop Surface */}
      <Desktop
        onLaunchGame={launchGame}
        onLaunchApp={launchApp}
        theme={currentTheme}
        onClickDesktop={() => setIsStartOpen(false)}
      />

      {/* Windows Manager */}
      {windows.map(win => (
        <WindowFrame
          key={win.id}
          window={win}
          theme={currentTheme}
          isActive={activeWindowId === win.id}
          onFocus={() => bringToFront(win.id)}
          onClose={() => closeWindow(win.id)}
          onMinimize={() => minimizeWindow(win.id)}
          onToggleMaximize={() => toggleMaximizeWindow(win.id)}
        >
          {win.type === 'game' && win.gameId ? (
            <GameContainer gameId={win.gameId} />
          ) : win.appId === 'gamehub' ? (
            <GameHubApp onLaunchGame={launchGame} />
          ) : win.appId === 'settings' ? (
            <SettingsApp
              currentThemeId={themeId}
              onThemeChange={handleThemeChange}
              currentCloak={cloakId}
              onCloakChange={handleCloakChange}
              panicKey={panicKey}
              onPanicKeyChange={handlePanicKeyChange}
              isMuted={isMuted}
              onToggleMute={toggleMute}
            />
          ) : win.appId === 'notes' ? (
            <NotesApp />
          ) : win.appId === 'terminal' ? (
            <TerminalApp
              onLaunchGame={launchGame}
              onSetTheme={handleThemeChange}
              onCloak={() => setIsCloaked(true)}
            />
          ) : win.appId === 'music' ? (
            <MusicPlayerApp />
          ) : win.appId === 'paint' ? (
            <PaintApp />
          ) : win.appId === 'calculator' ? (
            <CalculatorApp />
          ) : win.appId === 'browser' ? (
            <BrowserApp />
          ) : win.appId === 'taskmanager' ? (
            <TaskManagerApp windows={windows} onCloseWindow={closeWindow} />
          ) : null}
        </WindowFrame>
      ))}

      {/* Start Menu Launcher */}
      <StartMenu
        isOpen={isStartOpen}
        onClose={() => setIsStartOpen(false)}
        onLaunchGame={launchGame}
        onLaunchApp={launchApp}
        onCloak={() => setIsCloaked(true)}
        theme={currentTheme}
      />

      {/* OS Taskbar Dock */}
      <Taskbar
        windows={windows}
        activeWindowId={activeWindowId}
        onSelectWindow={handleSelectWindowFromTaskbar}
        onCloseWindow={closeWindow}
        isStartOpen={isStartOpen}
        onToggleStart={() => setIsStartOpen(prev => !prev)}
        onCloak={() => setIsCloaked(true)}
        panicKey={panicKey}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        theme={currentTheme}
      />
    </div>
  );
}
