import React, { useState, useEffect } from 'react';
import { Flag, Bomb, Smile, Frown, Award, RotateCcw } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

type Cell = {
  r: number;
  c: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  count: number;
};

export const MinesweeperGame: React.FC = () => {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium'>('easy');
  const [rows, setRows] = useState(9);
  const [cols, setCols] = useState(9);
  const [minesCount, setMinesCount] = useState(10);
  const [board, setBoard] = useState<Cell[][]>([]);
  const [gameState, setGameState] = useState<'PLAYING' | 'WON' | 'LOST'>('PLAYING');
  const [timer, setTimer] = useState(0);
  const [flagsUsed, setFlagsUsed] = useState(0);
  const [firstClick, setFirstClick] = useState(true);

  const initBoard = (rCount = 9, cCount = 9) => {
    const b: Cell[][] = [];
    for (let r = 0; r < rCount; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < cCount; c++) {
        row.push({ r, c, isMine: false, isRevealed: false, isFlagged: false, count: 0 });
      }
      b.push(row);
    }
    setBoard(b);
    setGameState('PLAYING');
    setTimer(0);
    setFlagsUsed(0);
    setFirstClick(true);
  };

  useEffect(() => {
    const r = difficulty === 'easy' ? 9 : 14;
    const c = difficulty === 'easy' ? 9 : 14;
    const m = difficulty === 'easy' ? 10 : 28;
    setRows(r);
    setCols(c);
    setMinesCount(m);
    initBoard(r, c);
  }, [difficulty]);

  useEffect(() => {
    if (gameState !== 'PLAYING' || firstClick) return;
    const interval = setInterval(() => {
      setTimer(t => Math.min(999, t + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState, firstClick]);

  const placeMines = (startR: number, startC: number, currentBoard: Cell[][]) => {
    let placed = 0;
    while (placed < minesCount) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);
      // Safe first click zone
      if (Math.abs(r - startR) <= 1 && Math.abs(c - startC) <= 1) continue;
      if (!currentBoard[r][c].isMine) {
        currentBoard[r][c].isMine = true;
        placed++;
      }
    }

    // Calculate neighboring mine counts
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (currentBoard[r][c].isMine) continue;
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && currentBoard[nr][nc].isMine) {
              count++;
            }
          }
        }
        currentBoard[r][c].count = count;
      }
    }
  };

  const revealCell = (r: number, c: number) => {
    if (gameState !== 'PLAYING') return;
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    const target = newBoard[r][c];
    if (target.isRevealed || target.isFlagged) return;

    if (firstClick) {
      placeMines(r, c, newBoard);
      setFirstClick(false);
    }

    if (target.isMine) {
      sounds.playGameOver();
      // Reveal all mines
      for (let row of newBoard) {
        for (let cell of row) {
          if (cell.isMine) cell.isRevealed = true;
        }
      }
      setBoard(newBoard);
      setGameState('LOST');
      return;
    }

    sounds.playBlip(420, 'sine', 0.03);

    // Flood fill
    const queue: [number, number][] = [[r, c]];
    target.isRevealed = true;

    while (queue.length > 0) {
      const [cr, cc] = queue.shift()!;
      if (newBoard[cr][cc].count === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = cr + dr;
            const nc = cc + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
              const neighbor = newBoard[nr][nc];
              if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.isMine) {
                neighbor.isRevealed = true;
                if (neighbor.count === 0) {
                  queue.push([nr, nc]);
                }
              }
            }
          }
        }
      }
    }

    // Check Victory condition: all non-mines revealed
    let unrevealedSafe = 0;
    for (let row of newBoard) {
      for (let cell of row) {
        if (!cell.isMine && !cell.isRevealed) {
          unrevealedSafe++;
        }
      }
    }

    setBoard(newBoard);

    if (unrevealedSafe === 0) {
      sounds.playScore();
      setGameState('WON');
    }
  };

  const toggleFlag = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameState !== 'PLAYING') return;
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    const target = newBoard[r][c];
    if (target.isRevealed) return;

    sounds.playBlip(620, 'triangle', 0.04);
    target.isFlagged = !target.isFlagged;
    setFlagsUsed(f => target.isFlagged ? f + 1 : f - 1);
    setBoard(newBoard);
  };

  const getNumberColor = (cnt: number) => {
    switch (cnt) {
      case 1: return 'text-sky-400';
      case 2: return 'text-emerald-400';
      case 3: return 'text-rose-400';
      case 4: return 'text-purple-400';
      case 5: return 'text-amber-400';
      case 6: return 'text-teal-300';
      default: return 'text-white';
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Top HUD */}
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm z-10">
        <span className="text-sm font-bold tracking-wider text-cyan-400">MINESWEEPER OS</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDifficulty('easy')}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${difficulty === 'easy' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Easy (9x9)
          </button>
          <button
            onClick={() => setDifficulty('medium')}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${difficulty === 'medium' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Medium (14x14)
          </button>
        </div>
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center p-4">
        {/* Status header */}
        <div className="flex items-center justify-between w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-t-xl px-4 py-2.5">
          <div className="text-rose-400 font-mono font-bold text-sm flex items-center gap-1.5 tabular-nums">
            <Bomb className="w-4 h-4" />
            {Math.max(0, minesCount - flagsUsed)}
          </div>

          <button
            onClick={() => initBoard(rows, cols)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-amber-400 transition-transform active:scale-90 cursor-pointer"
          >
            {gameState === 'WON' ? (
              <Award className="w-5 h-5 text-emerald-400" />
            ) : gameState === 'LOST' ? (
              <Frown className="w-5 h-5 text-rose-400" />
            ) : (
              <Smile className="w-5 h-5" />
            )}
          </button>

          <div className="text-cyan-400 font-mono font-bold text-sm tabular-nums">
            {timer.toString().padStart(3, '0')}s
          </div>
        </div>

        {/* The Grid */}
        <div
          className="bg-slate-900 border-x border-b border-slate-700/80 rounded-b-xl p-2 shadow-2xl grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`
          }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => revealCell(r, c)}
                onContextMenu={e => toggleFlag(e, r, c)}
                className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs font-mono font-bold rounded transition-colors select-none ${
                  cell.isRevealed
                    ? cell.isMine
                      ? 'bg-rose-900/80 text-rose-300 border border-rose-700'
                      : 'bg-slate-950/70 text-white border border-slate-800/80'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700/60 shadow-sm active:bg-slate-600'
                }`}
              >
                {cell.isRevealed ? (
                  cell.isMine ? (
                    <Bomb className="w-4 h-4 text-rose-400" />
                  ) : cell.count > 0 ? (
                    <span className={getNumberColor(cell.count)}>{cell.count}</span>
                  ) : null
                ) : cell.isFlagged ? (
                  <Flag className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                ) : null}
              </button>
            ))
          )}
        </div>

        <p className="text-slate-500 text-[11px] font-mono mt-3">Left Click: Reveal · Right Click / Long Press: Flag</p>
      </div>
    </div>
  );
};
