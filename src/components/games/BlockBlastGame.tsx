import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Award, Sparkles, Zap } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

type Grid = (string | null)[][];

interface PieceShape {
  id: number;
  matrix: number[][];
  color: string;
  glow: string;
}

const SHAPE_TEMPLATES: { matrix: number[][]; color: string; glow: string }[] = [
  { matrix: [[1]], color: '#f43f5e', glow: 'rgba(244, 63, 94, 0.7)' },
  { matrix: [[1, 1]], color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.7)' },
  { matrix: [[1], [1]], color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.7)' },
  { matrix: [[1, 1, 1]], color: '#a855f7', glow: 'rgba(168, 85, 247, 0.7)' },
  { matrix: [[1], [1], [1]], color: '#a855f7', glow: 'rgba(168, 85, 247, 0.7)' },
  { matrix: [[1, 1, 1, 1]], color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.7)' },
  { matrix: [[1], [1], [1], [1]], color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.7)' },
  { matrix: [[1, 1], [1, 1]], color: '#eab308', glow: 'rgba(234, 179, 8, 0.7)' },
  { matrix: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], color: '#f97316', glow: 'rgba(249, 115, 22, 0.7)' },
  { matrix: [[1, 0], [1, 1]], color: '#10b981', glow: 'rgba(16, 185, 129, 0.7)' },
  { matrix: [[0, 1], [1, 1]], color: '#10b981', glow: 'rgba(16, 185, 129, 0.7)' },
  { matrix: [[1, 1, 1], [0, 1, 0]], color: '#ec4899', glow: 'rgba(236, 72, 153, 0.7)' },
  { matrix: [[1, 1, 1], [1, 0, 0]], color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.7)' },
  { matrix: [[1, 1, 1], [0, 0, 1]], color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.7)' },
];

export const BlockBlastGame: React.FC = () => {
  const [grid, setGrid] = useState<Grid>(() =>
    Array(8).fill(null).map(() => Array(8).fill(null))
  );
  const [currentPieces, setCurrentPieces] = useState<(PieceShape | null)[]>([]);
  const [selectedPieceIndex, setSelectedPieceIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('revive_blockblast_hi') || '8400', 10);
  });
  const [streak, setStreak] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [comboToast, setComboToast] = useState<string | null>(null);

  const generatePieces = (): PieceShape[] => {
    return Array.from({ length: 3 }).map((_, i) => {
      const template = SHAPE_TEMPLATES[Math.floor(Math.random() * SHAPE_TEMPLATES.length)];
      return {
        id: Date.now() + i + Math.random(),
        matrix: template.matrix,
        color: template.color,
        glow: template.glow
      };
    });
  };

  const startNewGame = () => {
    setGrid(Array(8).fill(null).map(() => Array(8).fill(null)));
    const initial = generatePieces();
    setCurrentPieces(initial);
    setSelectedPieceIndex(0);
    setScore(0);
    setStreak(0);
    setIsGameOver(false);
    sounds.playStart();
  };

  useEffect(() => {
    startNewGame();
  }, []);

  const canPlacePiece = (matrix: number[][], r: number, c: number, testGrid = grid): boolean => {
    for (let pr = 0; pr < matrix.length; pr++) {
      for (let pc = 0; pc < matrix[pr].length; pc++) {
        if (matrix[pr][pc]) {
          const tr = r + pr;
          const tc = c + pc;
          if (tr < 0 || tr >= 8 || tc < 0 || tc >= 8) return false;
          if (testGrid[tr][tc] !== null) return false;
        }
      }
    }
    return true;
  };

  const checkHasMoves = (pieces: (PieceShape | null)[], currentGrid: Grid) => {
    const active = pieces.filter(Boolean) as PieceShape[];
    if (active.length === 0) return true;

    for (const piece of active) {
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (canPlacePiece(piece.matrix, r, c, currentGrid)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const handleCellClick = (r: number, c: number) => {
    if (selectedPieceIndex === null || !currentPieces[selectedPieceIndex]) return;
    const piece = currentPieces[selectedPieceIndex]!;

    if (!canPlacePiece(piece.matrix, r, c)) {
      sounds.playClick();
      return;
    }

    // Place the piece
    const newGrid = grid.map(row => [...row]);
    let blockCount = 0;
    for (let pr = 0; pr < piece.matrix.length; pr++) {
      for (let pc = 0; pc < piece.matrix[pr].length; pc++) {
        if (piece.matrix[pr][pc]) {
          newGrid[r + pr][c + pc] = piece.color;
          blockCount++;
        }
      }
    }

    sounds.playClick();

    // Check for completed rows & columns
    const fullRows: number[] = [];
    const fullCols: number[] = [];

    for (let rowIdx = 0; rowIdx < 8; rowIdx++) {
      if (newGrid[rowIdx].every(cell => cell !== null)) {
        fullRows.push(rowIdx);
      }
    }

    for (let colIdx = 0; colIdx < 8; colIdx++) {
      let isColFull = true;
      for (let rowIdx = 0; rowIdx < 8; rowIdx++) {
        if (newGrid[rowIdx][colIdx] === null) {
          isColFull = false;
          break;
        }
      }
      if (isColFull) fullCols.push(colIdx);
    }

    // Clear completed lines
    const clearedGrid = newGrid.map((row, rowIdx) =>
      row.map((cell, colIdx) => {
        if (fullRows.includes(rowIdx) || fullCols.includes(colIdx)) {
          return null;
        }
        return cell;
      })
    );

    const totalLines = fullRows.length + fullCols.length;
    let earnedPoints = blockCount * 10;

    if (totalLines > 0) {
      const lineMultiplier = totalLines * totalLines;
      const streakBonus = streak * 100;
      earnedPoints += totalLines * 120 * lineMultiplier + streakBonus;
      setStreak(s => s + 1);
      sounds.playScore();

      if (totalLines > 1) {
        setComboToast(`${totalLines}X LINE BLAST! +${earnedPoints}`);
        setTimeout(() => setComboToast(null), 1400);
      }
    } else {
      setStreak(0);
    }

    const nextScore = score + earnedPoints;
    setScore(nextScore);
    if (nextScore > highScore) {
      setHighScore(nextScore);
      localStorage.setItem('revive_blockblast_hi', nextScore.toString());
    }

    // Remove used piece
    const nextPieces = [...currentPieces];
    nextPieces[selectedPieceIndex] = null;

    // If all 3 used, refresh pieces
    let finalPieces = nextPieces;
    if (nextPieces.every(p => p === null)) {
      finalPieces = generatePieces();
    }

    setGrid(clearedGrid);
    setCurrentPieces(finalPieces);

    // Auto-select next available piece
    const nextAvail = finalPieces.findIndex(p => p !== null);
    setSelectedPieceIndex(nextAvail !== -1 ? nextAvail : null);

    // Check game over
    if (!checkHasMoves(finalPieces, clearedGrid)) {
      sounds.playGameOver();
      setIsGameOver(true);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/80">
        <div className="flex items-center gap-3">
          <span className="font-bold text-amber-400 font-mono tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4 fill-amber-400" /> GALACTIC GEM BLAST
          </span>
          {streak > 1 && (
            <span className="px-2 py-0.5 rounded text-[11px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
              {streak}X STREAK
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-500 mr-1">SCORE:</span>
            <span className="text-white font-bold text-sm">{score.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-500 mr-1">RECORD:</span>
            <span className="text-amber-400 font-bold">{highScore.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Main Play Area */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-3 bg-gradient-to-b from-slate-950 to-slate-900 overflow-y-auto">
        {comboToast && (
          <div className="absolute top-4 px-4 py-1.5 rounded-full bg-cyan-400 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-cyan-400/40 animate-bounce z-20">
            {comboToast}
          </div>
        )}

        {/* 8x8 Grid */}
        <div className="grid grid-cols-8 gap-1.5 p-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-md max-w-[360px] w-full aspect-square">
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className={`w-full h-full rounded-md transition-all duration-150 flex items-center justify-center border ${
                  cell
                    ? 'border-white/40 shadow-inner'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-800/40'
                }`}
                style={{
                  backgroundColor: cell || undefined,
                  boxShadow: cell ? `0 0 10px ${cell}80` : undefined
                }}
              />
            ))
          )}
        </div>

        {/* Piece Selection Tray */}
        <div className="mt-4 flex items-center justify-center gap-4 w-full max-w-[380px]">
          {currentPieces.map((piece, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (piece) {
                  setSelectedPieceIndex(idx);
                  sounds.playClick();
                }
              }}
              className={`flex-1 h-20 rounded-xl flex items-center justify-center p-2 cursor-pointer transition-all ${
                !piece
                  ? 'bg-slate-900/30 border border-dashed border-slate-800 pointer-events-none'
                  : selectedPieceIndex === idx
                  ? 'bg-slate-800/90 border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-105'
                  : 'bg-slate-900/70 border border-slate-700 hover:border-slate-500'
              }`}
            >
              {piece && (
                <div
                  className="grid gap-1"
                  style={{
                    gridTemplateColumns: `repeat(${piece.matrix[0].length}, minmax(0, 1fr))`
                  }}
                >
                  {piece.matrix.map((row, pr) =>
                    row.map((val, pc) => (
                      <div
                        key={`${pr}-${pc}`}
                        className={`w-3.5 h-3.5 rounded-sm ${
                          val ? '' : 'opacity-0'
                        }`}
                        style={{
                          backgroundColor: val ? piece.color : 'transparent',
                          boxShadow: val ? `0 0 6px ${piece.glow}` : 'none'
                        }}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Game Over Screen */}
        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30">
            <Award className="w-14 h-14 text-rose-500 mb-2 animate-bounce" />
            <h2 className="text-2xl font-black text-white tracking-wide">NO MORE MOVES</h2>
            <p className="text-sm text-slate-300 mt-1">
              Final Score: <span className="text-amber-400 font-mono font-bold text-lg">{score.toLocaleString()}</span>
            </p>
            {score >= highScore && score > 0 && (
              <p className="text-xs text-cyan-400 font-bold mt-1">NEW PERSONAL RECORD!</p>
            )}
            <button
              onClick={startNewGame}
              className="mt-5 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" /> PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Footer Instructions */}
      <div className="px-4 py-2 border-t border-slate-800 bg-slate-900/90 text-center text-[11px] text-slate-400">
        Select a polyomino shape and place it on the grid. Fill complete rows and columns to trigger gem explosions!
      </div>
    </div>
  );
};
