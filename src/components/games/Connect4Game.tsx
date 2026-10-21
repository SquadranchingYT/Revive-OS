import React, { useState } from 'react';
import { RotateCcw, User, Bot, Users } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

type Player = 1 | 2; // 1: Cyan (Player), 2: Rose (AI/P2)
type Board = (Player | null)[][];

const ROWS = 6;
const COLS = 7;

export const Connect4Game: React.FC = () => {
  const [board, setBoard] = useState<Board>(() =>
    Array.from({ length: ROWS }, () => Array(COLS).fill(null))
  );
  const [turn, setTurn] = useState<Player>(1);
  const [winner, setWinner] = useState<Player | 'DRAW' | null>(null);
  const [winningCells, setWinningCells] = useState<[number, number][]>([]);
  const [mode, setMode] = useState<'ai' | '2p'>('ai');
  const [score, setScore] = useState({ p1: 0, p2: 0 });

  const resetGame = () => {
    sounds.playClick();
    setBoard(Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
    setTurn(1);
    setWinner(null);
    setWinningCells([]);
  };

  const checkWin = (b: Board): { winner: Player; cells: [number, number][] } | null => {
    // Horizontal
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        const p = b[r][c];
        if (p && p === b[r][c + 1] && p === b[r][c + 2] && p === b[r][c + 3]) {
          return { winner: p, cells: [[r, c], [r, c + 1], [r, c + 2], [r, c + 3]] };
        }
      }
    }
    // Vertical
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 0; c < COLS; c++) {
        const p = b[r][c];
        if (p && p === b[r + 1][c] && p === b[r + 2][c] && p === b[r + 3][c]) {
          return { winner: p, cells: [[r, c], [r + 1, c], [r + 2, c], [r + 3, c]] };
        }
      }
    }
    // Diagonal Down-Right
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        const p = b[r][c];
        if (p && p === b[r + 1][c + 1] && p === b[r + 2][c + 2] && p === b[r + 3][c + 3]) {
          return { winner: p, cells: [[r, c], [r + 1, c + 1], [r + 2, c + 2], [r + 3, c + 3]] };
        }
      }
    }
    // Diagonal Up-Right
    for (let r = 3; r < ROWS; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        const p = b[r][c];
        if (p && p === b[r - 1][c + 1] && p === b[r - 2][c + 2] && p === b[r - 3][c + 3]) {
          return { winner: p, cells: [[r, c], [r - 1, c + 1], [r - 2, c + 2], [r - 3, c + 3]] };
        }
      }
    }
    return null;
  };

  const getLowestEmptyRow = (b: Board, col: number): number => {
    for (let r = ROWS - 1; r >= 0; r--) {
      if (b[r][col] === null) return r;
    }
    return -1;
  };

  const makeMove = (col: number) => {
    if (winner !== null) return;
    const row = getLowestEmptyRow(board, col);
    if (row === -1) return;

    sounds.playBlip(turn === 1 ? 520 : 420, 'triangle', 0.05);

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = turn;
    setBoard(newBoard);

    const winResult = checkWin(newBoard);
    if (winResult) {
      sounds.playScore();
      setWinner(winResult.winner);
      setWinningCells(winResult.cells);
      setScore(s =>
        winResult.winner === 1 ? { ...s, p1: s.p1 + 1 } : { ...s, p2: s.p2 + 1 }
      );
      return;
    }

    if (newBoard.every(r => r.every(c => c !== null))) {
      setWinner('DRAW');
      return;
    }

    if (mode === 'ai' && turn === 1) {
      setTurn(2);
      setTimeout(() => {
        // AI Turn
        let aiCol = -1;
        // Check if AI can win on next move
        for (let c = 0; c < COLS; c++) {
          const r = getLowestEmptyRow(newBoard, c);
          if (r !== -1) {
            newBoard[r][c] = 2;
            if (checkWin(newBoard)) {
              aiCol = c;
              newBoard[r][c] = null;
              break;
            }
            newBoard[r][c] = null;
          }
        }
        // Block player win
        if (aiCol === -1) {
          for (let c = 0; c < COLS; c++) {
            const r = getLowestEmptyRow(newBoard, c);
            if (r !== -1) {
              newBoard[r][c] = 1;
              if (checkWin(newBoard)) {
                aiCol = c;
                newBoard[r][c] = null;
                break;
              }
              newBoard[r][c] = null;
            }
          }
        }
        // Random center preference
        if (aiCol === -1) {
          const pref = [3, 2, 4, 1, 5, 0, 6].filter(c => getLowestEmptyRow(newBoard, c) !== -1);
          aiCol = pref[0];
        }

        if (aiCol !== undefined && aiCol !== -1) {
          const aiRow = getLowestEmptyRow(newBoard, aiCol);
          newBoard[aiRow][aiCol] = 2;
          sounds.playBlip(380, 'sine', 0.05);
          setBoard([...newBoard]);

          const aiWin = checkWin(newBoard);
          if (aiWin) {
            sounds.playGameOver();
            setWinner(2);
            setWinningCells(aiWin.cells);
            setScore(s => ({ ...s, p2: s.p2 + 1 }));
          } else if (newBoard.every(r => r.every(c => c !== null))) {
            setWinner('DRAW');
          }
        }
        setTurn(1);
      }, 350);
    } else {
      setTurn(turn === 1 ? 2 : 1);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none font-sans">
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm z-10">
        <span className="text-sm font-bold tracking-wider text-cyan-400">GRAVITY FOUR 1V1</span>
        <div className="flex items-center gap-6 text-xs font-mono">
          <span className="text-cyan-400">YOU: <strong className="text-white tabular-nums">{score.p1}</strong></span>
          <span className="text-slate-500">·</span>
          <span className="text-rose-400">{mode === 'ai' ? 'BOT' : 'P2'}: <strong className="text-white tabular-nums">{score.p2}</strong></span>
        </div>
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center p-4">
        {/* Controls row */}
        <div className="flex items-center justify-between w-full max-w-md mb-3 text-xs">
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800">
            <button
              onClick={() => { setMode('ai'); resetGame(); }}
              className={`px-3 py-1 rounded transition-colors ${mode === 'ai' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Vs Cyber AI
            </button>
            <button
              onClick={() => { setMode('2p'); resetGame(); }}
              className={`px-3 py-1 rounded transition-colors ${mode === '2p' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              2 Players Local
            </button>
          </div>

          <button
            onClick={resetGame}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Board
          </button>
        </div>

        {/* Connect 4 Matrix Board */}
        <div className="bg-slate-900 border-2 border-slate-700/80 rounded-2xl p-3 shadow-2xl">
          {/* Clickable Column Drop Indicators */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {Array.from({ length: COLS }).map((_, c) => (
              <button
                key={c}
                onClick={() => makeMove(c)}
                disabled={winner !== null || (mode === 'ai' && turn === 2)}
                className="h-7 rounded-lg bg-slate-800/60 hover:bg-cyan-500/20 text-cyan-400 text-xs font-mono font-bold flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30"
              >
                ↓
              </button>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            {board.map((row, r) =>
              row.map((val, c) => {
                const isWin = winningCells.some(([wr, wc]) => wr === r && wc === c);

                return (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => makeMove(c)}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-slate-800/80 bg-slate-900 flex items-center justify-center cursor-pointer transition-transform duration-200"
                  >
                    {val === 1 && (
                      <div
                        className={`w-4/5 h-4/5 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] ${
                          isWin ? 'animate-bounce shadow-[0_0_20px_#22d3ee]' : ''
                        }`}
                      />
                    )}
                    {val === 2 && (
                      <div
                        className={`w-4/5 h-4/5 rounded-full bg-rose-500 shadow-[0_0_12px_#f43f5e] ${
                          isWin ? 'animate-bounce shadow-[0_0_20px_#f43f5e]' : ''
                        }`}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Status text */}
        <div className="mt-4 text-xs font-mono text-slate-400 text-center">
          {winner === 1 ? (
            <span className="text-cyan-400 font-bold">CYAN PLAYER CONNECTED FOUR!</span>
          ) : winner === 2 ? (
            <span className="text-rose-400 font-bold">ROSE PLAYER CONNECTED FOUR!</span>
          ) : winner === 'DRAW' ? (
            <span className="text-amber-400 font-bold">GRID STALEMATE!</span>
          ) : (
            <span>Turn: {turn === 1 ? 'Cyan Player [Your Move]' : 'Rose Player [Thinking...]'}</span>
          )}
        </div>
      </div>
    </div>
  );
};
