import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Undo2 } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

type Board = number[][];

export const Game2048: React.FC = () => {
  const [board, setBoard] = useState<Board>(() => getInitialBoard());
  const [prevBoard, setPrevBoard] = useState<Board | null>(null);
  const [score, setScore] = useState(0);
  const [prevScore, setPrevScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('revive_2048_high') || '0', 10);
  });

  function getInitialBoard(): Board {
    const b = Array.from({ length: 4 }, () => Array(4).fill(0));
    addRandomTile(b);
    addRandomTile(b);
    return b;
  }

  function addRandomTile(b: Board) {
    const empty: { r: number; c: number }[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (b[r][c] === 0) empty.push({ r, c });
      }
    }
    if (empty.length > 0) {
      const { r, c } = empty[Math.floor(Math.random() * empty.length)];
      b[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  const restart = () => {
    sounds.playClick();
    const newB = getInitialBoard();
    setBoard(newB);
    setPrevBoard(null);
    setScore(0);
    setGameOver(false);
    setWon(false);
  };

  const undo = () => {
    if (!prevBoard) return;
    sounds.playBlip(350, 'sine', 0.05);
    setBoard(prevBoard);
    setScore(prevScore);
    setPrevBoard(null);
    setGameOver(false);
  };

  const slideRow = (row: number[]): { newRow: number[]; pts: number } => {
    let filtered = row.filter(x => x !== 0);
    let pts = 0;
    for (let i = 0; i < filtered.length - 1; i++) {
      if (filtered[i] === filtered[i + 1]) {
        filtered[i] *= 2;
        pts += filtered[i];
        filtered[i + 1] = 0;
      }
    }
    filtered = filtered.filter(x => x !== 0);
    while (filtered.length < 4) {
      filtered.push(0);
    }
    return { newRow: filtered, pts };
  };

  const moveLeft = (b: Board): { newBoard: Board; pts: number; changed: boolean } => {
    let totalPts = 0;
    let changed = false;
    const newBoard = b.map(row => {
      const { newRow, pts } = slideRow(row);
      totalPts += pts;
      if (newRow.some((val, idx) => val !== row[idx])) changed = true;
      return newRow;
    });
    return { newBoard, pts: totalPts, changed };
  };

  const rotateClockwise = (matrix: Board): Board => {
    return matrix[0].map((_, index) => matrix.map(row => row[index]).reverse());
  };

  const move = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    if (gameOver) return;
    let b = board.map(r => [...r]);
    let rotations = 0;

    if (direction === 'up') {
      b = rotateClockwise(rotateClockwise(rotateClockwise(b)));
      rotations = 1;
    } else if (direction === 'right') {
      b = rotateClockwise(rotateClockwise(b));
      rotations = 2;
    } else if (direction === 'down') {
      b = rotateClockwise(b);
      rotations = 3;
    }

    const { newBoard, pts, changed } = moveLeft(b);
    if (!changed) return;

    let finalBoard = newBoard;
    for (let i = 0; i < (4 - rotations) % 4; i++) {
      finalBoard = rotateClockwise(finalBoard);
    }

    setPrevBoard(board);
    setPrevScore(score);

    addRandomTile(finalBoard);
    setBoard(finalBoard);
    const updatedScore = score + pts;
    setScore(updatedScore);

    if (pts > 0) {
      sounds.playScore();
    } else {
      sounds.playBlip(280, 'sine', 0.02);
    }

    if (updatedScore > highScore) {
      setHighScore(updatedScore);
      localStorage.setItem('revive_2048_high', updatedScore.toString());
    }

    // Check for 2048 tile
    if (finalBoard.some(r => r.some(c => c >= 2048))) {
      setWon(true);
    }

    // Check Game Over
    let canMove = false;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (finalBoard[r][c] === 0) canMove = true;
        if (c < 3 && finalBoard[r][c] === finalBoard[r][c + 1]) canMove = true;
        if (r < 3 && finalBoard[r][c] === finalBoard[r + 1][c]) canMove = true;
      }
    }
    if (!canMove) {
      sounds.playGameOver();
      setGameOver(true);
    }
  }, [board, gameOver, score, highScore]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) { e.preventDefault(); move('up'); }
      if (['ArrowDown', 'KeyS'].includes(e.code)) { e.preventDefault(); move('down'); }
      if (['ArrowLeft', 'KeyA'].includes(e.code)) { e.preventDefault(); move('left'); }
      if (['ArrowRight', 'KeyD'].includes(e.code)) { e.preventDefault(); move('right'); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [move]);

  const getTileColor = (val: number) => {
    switch (val) {
      case 2: return 'bg-slate-800 text-slate-200 border-slate-700';
      case 4: return 'bg-slate-700 text-slate-100 border-slate-600';
      case 8: return 'bg-cyan-900/80 text-cyan-200 border-cyan-700/60 shadow-[0_0_8px_rgba(6,182,212,0.3)]';
      case 16: return 'bg-cyan-700 text-white border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]';
      case 32: return 'bg-teal-600 text-white border-teal-400 shadow-[0_0_12px_rgba(20,184,166,0.5)]';
      case 64: return 'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.5)]';
      case 128: return 'bg-amber-600 text-white border-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.5)] text-xl';
      case 256: return 'bg-orange-600 text-white border-orange-400 shadow-[0_0_18px_rgba(249,115,22,0.6)] text-xl';
      case 512: return 'bg-rose-600 text-white border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.6)] text-xl';
      case 1024: return 'bg-purple-600 text-white border-purple-400 shadow-[0_0_22px_rgba(168,85,247,0.7)] text-lg';
      case 2048: return 'bg-yellow-500 text-slate-950 font-black border-yellow-300 shadow-[0_0_28px_rgba(234,179,8,0.8)] text-lg';
      default: return 'bg-indigo-600 text-white font-black text-base shadow-[0_0_30px_rgba(99,102,241,0.9)]';
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none">
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm z-10">
        <span className="text-sm font-bold tracking-wider text-cyan-400">2048 NEON FUSION</span>
        <div className="flex items-center gap-6 text-xs font-mono">
          <span>SCORE: <strong className="text-white tabular-nums">{score}</strong></span>
          <span className="text-amber-400">BEST: <strong className="text-white tabular-nums">{highScore}</strong></span>
        </div>
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center p-4">
        {/* Actions bar */}
        <div className="flex items-center justify-between w-full max-w-[340px] mb-3">
          <button
            onClick={undo}
            disabled={!prevBoard}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs rounded-lg transition-colors cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" />
            Undo
          </button>
          <button
            onClick={restart}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restart
          </button>
        </div>

        {/* 4x4 Grid Container */}
        <div className="relative bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3 shadow-2xl w-full max-w-[340px] aspect-square grid grid-cols-4 grid-rows-4 gap-2.5">
          {board.map((row, r) =>
            row.map((val, c) => (
              <div
                key={`${r}-${c}`}
                className={`w-full h-full rounded-xl flex items-center justify-center font-bold text-2xl font-mono border transition-all duration-150 ${
                  val === 0 ? 'bg-slate-950/60 border-slate-800/60' : getTileColor(val)
                }`}
              >
                {val !== 0 ? val : ''}
              </div>
            ))
          )}

          {gameOver && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-4 text-center z-20 animate-fade-in">
              <h3 className="text-2xl font-extrabold text-white mb-1">NO MORE MOVES</h3>
              <p className="text-xs text-slate-400 mb-4">Total score: {score} pts</p>
              <button
                onClick={restart}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        <p className="text-slate-500 text-[11px] font-mono mt-3">Use arrow keys or WASD to slide tiles</p>
      </div>
    </div>
  );
};
