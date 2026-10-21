import React, { useState, useEffect } from 'react';
import { RotateCcw, Edit3, Eraser, Lightbulb, CheckCircle2 } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

const INITIAL_BOARD = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9]
];

const SOLUTION = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9]
];

export const SudokuGame: React.FC = () => {
  const [board, setBoard] = useState(() => INITIAL_BOARD.map(r => [...r]));
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>([0, 2]);
  const [timer, setTimer] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [notesMode, setNotesMode] = useState(false);
  const [notes, setNotes] = useState<Record<string, number[]>>({});

  useEffect(() => {
    if (isWon) return;
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isWon]);

  const selectNum = (num: number) => {
    if (!selectedCell || isWon) return;
    const [r, c] = selectedCell;
    if (INITIAL_BOARD[r][c] !== 0) return; // Cannot edit initial clues

    sounds.playBlip(440 + num * 30, 'triangle', 0.04);

    if (notesMode) {
      const key = `${r}-${c}`;
      setNotes(prev => {
        const cur = prev[key] || [];
        const next = cur.includes(num) ? cur.filter(x => x !== num) : [...cur, num];
        return { ...prev, [key]: next };
      });
      return;
    }

    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = num;
    setBoard(newBoard);

    // Check completion
    const isComplete = newBoard.every((row, ri) =>
      row.every((val, ci) => val === SOLUTION[ri][ci])
    );
    if (isComplete) {
      sounds.playScore();
      setIsWon(true);
    }
  };

  const erase = () => {
    if (!selectedCell || isWon) return;
    const [r, c] = selectedCell;
    if (INITIAL_BOARD[r][c] !== 0) return;

    sounds.playBlip(300, 'sine', 0.02);
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = 0;
    setBoard(newBoard);
  };

  const giveHint = () => {
    if (!selectedCell || isWon) return;
    const [r, c] = selectedCell;
    if (INITIAL_BOARD[r][c] !== 0) return;

    sounds.playScore();
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = SOLUTION[r][c];
    setBoard(newBoard);
  };

  const restart = () => {
    sounds.playClick();
    setBoard(INITIAL_BOARD.map(r => [...r]));
    setNotes({});
    setTimer(0);
    setIsWon(false);
  };

  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      {/* Top HUD */}
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm z-10">
        <span className="text-sm font-bold tracking-wider text-cyan-400">CYBER SUDOKU OS</span>
        <div className="flex items-center gap-6 text-xs font-mono">
          <span className="text-slate-400">TIME: <strong className="text-white tabular-nums">{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</strong></span>
          <button
            onClick={restart}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Sudoku 9x9 Grid */}
        <div className="bg-slate-900 border-2 border-slate-700/80 rounded-2xl p-2.5 shadow-2xl">
          <div className="grid grid-cols-9 grid-rows-9 gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            {board.map((row, r) =>
              row.map((val, c) => {
                const isInitial = INITIAL_BOARD[r][c] !== 0;
                const isSelected = selectedCell && selectedCell[0] === r && selectedCell[1] === c;
                const isError = val !== 0 && val !== SOLUTION[r][c];
                const borderRight = (c + 1) % 3 === 0 && c !== 8 ? 'border-r-2 border-r-slate-700' : '';
                const borderBottom = (r + 1) % 3 === 0 && r !== 8 ? 'border-b-2 border-b-slate-700' : '';

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => {
                      sounds.playBlip(380, 'sine', 0.02);
                      setSelectedCell([r, c]);
                    }}
                    className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-mono text-sm sm:text-base font-bold rounded transition-colors cursor-pointer ${borderRight} ${borderBottom} ${
                      isSelected
                        ? 'bg-cyan-500/25 text-cyan-300 ring-2 ring-cyan-400'
                        : isInitial
                        ? 'bg-slate-900 text-white'
                        : isError
                        ? 'bg-rose-950/60 text-rose-400'
                        : val !== 0
                        ? 'bg-slate-850 text-cyan-400'
                        : 'bg-slate-900/60 text-slate-500 hover:bg-slate-800'
                    }`}
                  >
                    {val !== 0 ? val : (
                      <span className="text-[9px] text-slate-500">
                        {notes[`${r}-${c}`]?.join('') || ''}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Number Keypad & Utilities */}
        <div className="mt-4 flex flex-col items-center gap-3">
          {/* 1-9 buttons */}
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
              <button
                key={n}
                onClick={() => selectNum(n)}
                className="w-8 h-9 sm:w-9 sm:h-10 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-cyan-400 font-mono font-bold text-sm transition-transform active:scale-95 cursor-pointer"
              >
                {n}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={() => setNotesMode(m => !m)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                notesMode ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400' : 'bg-slate-900 text-slate-300 border-slate-700'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Notes Mode</span>
            </button>
            <button
              onClick={erase}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-rose-400 rounded-lg transition-colors cursor-pointer"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Erase</span>
            </button>
            <button
              onClick={giveHint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-400 rounded-lg transition-colors cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Hint</span>
            </button>
          </div>
        </div>

        {isWon && (
          <div className="mt-3 text-emerald-400 font-bold text-sm flex items-center gap-1.5 animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>SUDOKU MASTERED! Time: {Math.floor(timer / 60)}m {timer % 60}s</span>
          </div>
        )}
      </div>
    </div>
  );
};
