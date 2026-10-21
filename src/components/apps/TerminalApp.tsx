import React, { useState, useRef, useEffect } from 'react';
import { Terminal, CornerDownLeft } from 'lucide-react';
import { GAMES_CATALOG } from '../../data/gamesList';
import { sounds } from '../../utils/soundEffects';
import { safeStorage } from '../../utils/safeStorage';

interface TerminalAppProps {
  onLaunchGame: (gameId: string) => void;
  onSetTheme: (themeId: string) => void;
  onCloak: () => void;
}

interface CommandLog {
  id: number;
  text: string;
  type: 'input' | 'output' | 'error' | 'success';
}

export const TerminalApp: React.FC<TerminalAppProps> = ({ onLaunchGame, onSetTheme, onCloak }) => {
  const [logs, setLogs] = useState<CommandLog[]>([
    { id: 1, text: 'Revive OS Kernel v2.4 (x86_64-unblocked)', type: 'output' },
    { id: 2, text: 'Type "help" to see available terminal directives.', type: 'output' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.trim();
    if (!cmd) return;

    sounds.playBlip(540, 'triangle', 0.03);
    const newLogs: CommandLog[] = [...logs, { id: Date.now(), text: `revive@os:~$ ${cmd}`, type: 'input' }];
    const parts = cmd.split(' ');
    const mainCmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ').toLowerCase();

    switch (mainCmd) {
      case 'help':
        newLogs.push({
          id: Date.now() + 1,
          text: `COMMANDS DIRECTORY:
  list / games         - List all playable unblocked games
  play <game_id>       - Launch a game directly (e.g. "play slope")
  theme <theme_id>     - Change theme (cyber_onyx, emerald_matrix, synth_sunset, crimson_void, ice_glaze)
  cloak                - Activate emergency stealth cloak
  scores               - View your stored game high scores
  clear                - Clear terminal logs
  about                - Display Revive OS specifications`,
          type: 'output'
        });
        break;

      case 'list':
      case 'games':
        const gameList = GAMES_CATALOG.map(g => `  • ${g.id.padEnd(16)} - ${g.title} (${g.category})`).join('\n');
        newLogs.push({ id: Date.now() + 1, text: `AVAILABLE GAMES:\n${gameList}`, type: 'output' });
        break;

      case 'play':
        if (!arg) {
          newLogs.push({ id: Date.now() + 1, text: 'Error: Specify game id. Example: play slope', type: 'error' });
        } else {
          const found = GAMES_CATALOG.find(g => g.id === arg || g.title.toLowerCase().includes(arg));
          if (found) {
            newLogs.push({ id: Date.now() + 1, text: `Launching ${found.title}...`, type: 'success' });
            onLaunchGame(found.id);
          } else {
            newLogs.push({ id: Date.now() + 1, text: `Game "${arg}" not found. Type "games" for catalog.`, type: 'error' });
          }
        }
        break;

      case 'theme':
        if (!arg) {
          newLogs.push({ id: Date.now() + 1, text: 'Error: Provide theme (cyber_onyx, emerald_matrix, synth_sunset, crimson_void, ice_glaze)', type: 'error' });
        } else {
          onSetTheme(arg);
          newLogs.push({ id: Date.now() + 1, text: `Theme updated to "${arg}".`, type: 'success' });
        }
        break;

      case 'cloak':
      case 'panic':
        newLogs.push({ id: Date.now() + 1, text: 'Activating emergency disguise cloak...', type: 'output' });
        setTimeout(onCloak, 200);
        break;

      case 'scores':
        const sSlope = safeStorage.getItem('revive_slope_high', '0');
        const sSpace = safeStorage.getItem('revive_space_high', '0');
        const sTetris = safeStorage.getItem('revive_tetris_high', '0');
        const sSnake = safeStorage.getItem('revive_snake_high', '0');
        const sBreak = safeStorage.getItem('revive_breakout_high', '0');
        const s2048 = safeStorage.getItem('revive_2048_high', '0');
        newLogs.push({
          id: Date.now() + 1,
          text: `LOCAL HIGH SCORES:
  Slope 3D:        ${sSlope}m
  Galactic Space:  ${sSpace} pts
  Tetris:          ${sTetris} pts
  Snake Revive:    ${sSnake} pts
  Breakout:        ${sBreak} pts
  2048 Neon:       ${s2048} pts`,
          type: 'output'
        });
        break;

      case 'clear':
        setLogs([]);
        setInputVal('');
        return;

      case 'about':
        newLogs.push({
          id: Date.now() + 1,
          text: `Revive OS Gaming Shell · Built for zero-lag desktop play · Web Audio DSP Engine Active`,
          type: 'output'
        });
        break;

      default:
        newLogs.push({
          id: Date.now() + 1,
          text: `Unknown command: "${cmd}". Type "help" for a list of directives.`,
          type: 'error'
        });
        break;
    }

    setLogs(newLogs);
    setInputVal('');
  };

  return (
    <div className="w-full h-full bg-slate-950 text-cyan-400 p-4 font-mono text-xs flex flex-col overflow-hidden select-text">
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-2">
        {logs.map(log => (
          <div
            key={log.id}
            className={`whitespace-pre-wrap leading-relaxed ${
              log.type === 'input'
                ? 'text-white font-bold'
                : log.type === 'error'
                ? 'text-rose-400'
                : log.type === 'success'
                ? 'text-emerald-400 font-semibold'
                : 'text-cyan-400/90'
            }`}
          >
            {log.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleCommand} className="flex items-center gap-2 pt-3 border-t border-cyan-900/40">
        <span className="text-cyan-500 font-bold">revive@os:~$</span>
        <input
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          placeholder="type help or command..."
          className="flex-1 bg-transparent text-white outline-none border-none font-mono text-xs"
          autoFocus
        />
        <button type="submit" className="text-cyan-500 hover:text-cyan-300 p-1 cursor-pointer">
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
