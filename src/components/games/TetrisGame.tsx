import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, RotateCcw, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, RefreshCw } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 26;

const SHAPES = {
  I: { shape: [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]], color: '#06b6d4' },
  J: { shape: [[1,0,0], [1,1,1], [0,0,0]], color: '#3b82f6' },
  L: { shape: [[0,0,1], [1,1,1], [0,0,0]], color: '#f97316' },
  O: { shape: [[1,1], [1,1]], color: '#eab308' },
  S: { shape: [[0,1,1], [1,1,0], [0,0,0]], color: '#22c55e' },
  T: { shape: [[0,1,0], [1,1,1], [0,0,0]], color: '#a855f7' },
  Z: { shape: [[1,1,0], [0,1,1], [0,0,0]], color: '#ef4444' }
};

type ShapeKey = keyof typeof SHAPES;
const SHAPE_KEYS: ShapeKey[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

export const TetrisGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const nextCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const holdCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'GAMEOVER'>('MENU');
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('revive_tetris_high') || '0', 10);
  });

  const stateRef = useRef({
    board: Array.from({ length: ROWS }, () => Array(COLS).fill(0)),
    currentPiece: null as { key: ShapeKey; shape: number[][]; x: number; y: number; color: string } | null,
    nextPieceKey: 'T' as ShapeKey,
    holdPieceKey: null as ShapeKey | null,
    canHold: true,
    dropCounter: 0,
    dropInterval: 750,
    lastTime: 0,
    score: 0,
    lines: 0,
    level: 1
  });

  const randomShapeKey = (): ShapeKey => {
    return SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)];
  };

  const createPiece = (key: ShapeKey) => {
    const s = SHAPES[key];
    return {
      key,
      shape: s.shape.map(row => [...row]),
      x: Math.floor(COLS / 2) - Math.floor(s.shape[0].length / 2),
      y: 0,
      color: s.color
    };
  };

  const collide = (board: number[][], piece: { shape: number[][]; x: number; y: number }) => {
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c] !== 0) {
          const newX = piece.x + c;
          const newY = piece.y + r;
          if (newX < 0 || newX >= COLS || newY >= ROWS) return true;
          if (newY >= 0 && board[newY][newX] !== 0) return true;
        }
      }
    }
    return false;
  };

  const rotate = (matrix: number[][]) => {
    const N = matrix.length;
    const result: number[][] = [];
    for (let r = 0; r < N; r++) {
      result.push([]);
      for (let c = 0; c < N; c++) {
        result[r][c] = matrix[N - 1 - c][r];
      }
    }
    return result;
  };

  const drop = useCallback(() => {
    const st = stateRef.current;
    if (!st.currentPiece) return;

    st.currentPiece.y++;
    if (collide(st.board, st.currentPiece)) {
      st.currentPiece.y--;
      mergePiece();
      clearLines();
      spawnNext();
    }
    st.dropCounter = 0;
  }, []);

  const hardDrop = () => {
    const st = stateRef.current;
    if (!st.currentPiece) return;
    sounds.playBlip(700, 'square', 0.05);

    while (!collide(st.board, st.currentPiece)) {
      st.currentPiece.y++;
      st.score += 2;
    }
    st.currentPiece.y--;
    mergePiece();
    clearLines();
    spawnNext();
    setScore(st.score);
  };

  const move = (dir: number) => {
    const st = stateRef.current;
    if (!st.currentPiece) return;
    st.currentPiece.x += dir;
    if (collide(st.board, st.currentPiece)) {
      st.currentPiece.x -= dir;
    } else {
      sounds.playBlip(320, 'sine', 0.03);
    }
  };

  const rotatePiece = () => {
    const st = stateRef.current;
    if (!st.currentPiece) return;
    const origShape = st.currentPiece.shape;
    const rotated = rotate(origShape);
    st.currentPiece.shape = rotated;

    // Basic wall kick
    let offset = 1;
    while (collide(st.board, st.currentPiece)) {
      st.currentPiece.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (Math.abs(offset) > st.currentPiece.shape[0].length) {
        st.currentPiece.shape = origShape;
        return;
      }
    }
    sounds.playBlip(440, 'triangle', 0.04);
  };

  const holdPiece = () => {
    const st = stateRef.current;
    if (!st.canHold || !st.currentPiece) return;
    sounds.playBlip(550, 'sine', 0.05);

    const currentKey = st.currentPiece.key;
    if (!st.holdPieceKey) {
      st.holdPieceKey = currentKey;
      st.currentPiece = createPiece(st.nextPieceKey);
      st.nextPieceKey = randomShapeKey();
    } else {
      const temp = st.holdPieceKey;
      st.holdPieceKey = currentKey;
      st.currentPiece = createPiece(temp);
    }
    st.canHold = false;
    drawSubCanvas(holdCanvasRef.current, st.holdPieceKey);
    drawSubCanvas(nextCanvasRef.current, st.nextPieceKey);
  };

  const mergePiece = () => {
    const st = stateRef.current;
    if (!st.currentPiece) return;
    for (let r = 0; r < st.currentPiece.shape.length; r++) {
      for (let c = 0; c < st.currentPiece.shape[r].length; c++) {
        if (st.currentPiece.shape[r][c] !== 0) {
          const by = st.currentPiece.y + r;
          const bx = st.currentPiece.x + c;
          if (by >= 0 && by < ROWS && bx >= 0 && bx < COLS) {
            st.board[by][bx] = st.currentPiece.color as unknown as number;
          }
        }
      }
    }
  };

  const clearLines = () => {
    const st = stateRef.current;
    let cleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (st.board[r].every(val => val !== 0)) {
        st.board.splice(r, 1);
        st.board.unshift(Array(COLS).fill(0));
        cleared++;
        r++; // Check same row again
      }
    }

    if (cleared > 0) {
      sounds.playScore();
      st.lines += cleared;
      const pts = cleared === 1 ? 100 : cleared === 2 ? 300 : cleared === 3 ? 500 : 800;
      st.score += pts * st.level;
      st.level = Math.floor(st.lines / 10) + 1;
      st.dropInterval = Math.max(120, 750 - (st.level - 1) * 60);

      setScore(st.score);
      setLines(st.lines);
      setLevel(st.level);
    }
  };

  const spawnNext = () => {
    const st = stateRef.current;
    st.currentPiece = createPiece(st.nextPieceKey);
    st.nextPieceKey = randomShapeKey();
    st.canHold = true;

    drawSubCanvas(nextCanvasRef.current, st.nextPieceKey);

    if (collide(st.board, st.currentPiece)) {
      // Game Over
      sounds.playGameOver();
      if (st.score > highScore) {
        setHighScore(st.score);
        localStorage.setItem('revive_tetris_high', st.score.toString());
      }
      setGameState('GAMEOVER');
    }
  };

  const drawSubCanvas = (canvas: HTMLCanvasElement | null, key: ShapeKey | null) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!key) return;

    const shapeData = SHAPES[key];
    const s = shapeData.shape;
    const sz = 16;
    const offsetX = (canvas.width - s[0].length * sz) / 2;
    const offsetY = (canvas.height - s.length * sz) / 2;

    ctx.fillStyle = shapeData.color;
    ctx.shadowColor = shapeData.color;
    ctx.shadowBlur = 6;
    for (let r = 0; r < s.length; r++) {
      for (let c = 0; c < s[r].length; c++) {
        if (s[r][c] !== 0) {
          ctx.beginPath();
          ctx.roundRect(offsetX + c * sz, offsetY + r * sz, sz - 2, sz - 2, 2);
          ctx.fill();
        }
      }
    }
  };

  const startGame = () => {
    sounds.playClick();
    const st = stateRef.current;
    st.board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    st.score = 0;
    st.lines = 0;
    st.level = 1;
    st.dropInterval = 750;
    st.holdPieceKey = null;
    st.nextPieceKey = randomShapeKey();
    st.currentPiece = createPiece(randomShapeKey());
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameState('PLAYING');

    drawSubCanvas(nextCanvasRef.current, st.nextPieceKey);
    drawSubCanvas(holdCanvasRef.current, null);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameState !== 'PLAYING') return;
      if (e.code === 'ArrowLeft') move(-1);
      if (e.code === 'ArrowRight') move(1);
      if (e.code === 'ArrowDown') drop();
      if (e.code === 'ArrowUp') rotatePiece();
      if (e.code === 'Space') {
        e.preventDefault();
        hardDrop();
      }
      if (e.code === 'KeyC') holdPiece();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState, drop]);

  // Main game tick
  useEffect(() => {
    let animId: number;

    const render = (time: number) => {
      const st = stateRef.current;
      const deltaTime = time - st.lastTime;
      st.lastTime = time;

      if (gameState === 'PLAYING') {
        st.dropCounter += deltaTime;
        if (st.dropCounter > st.dropInterval) {
          drop();
        }
      }

      // Draw main canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#090d16';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Grid background lines
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
          ctx.lineWidth = 1;
          for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
              ctx.strokeRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
          }

          // Draw settled blocks
          for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
              const val = st.board[r][c];
              if (val !== 0) {
                ctx.fillStyle = val as unknown as string;
                ctx.shadowColor = val as unknown as string;
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.roundRect(c * BLOCK_SIZE + 1, r * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2, 4);
                ctx.fill();
              }
            }
          }

          // Draw Ghost piece
          if (st.currentPiece && gameState === 'PLAYING') {
            const ghost = {
              ...st.currentPiece,
              y: st.currentPiece.y
            };
            while (!collide(st.board, ghost)) {
              ghost.y++;
            }
            ghost.y--;

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.lineWidth = 1.5;
            for (let r = 0; r < ghost.shape.length; r++) {
              for (let c = 0; c < ghost.shape[r].length; c++) {
                if (ghost.shape[r][c] !== 0) {
                  ctx.strokeRect(
                    (ghost.x + c) * BLOCK_SIZE + 2,
                    (ghost.y + r) * BLOCK_SIZE + 2,
                    BLOCK_SIZE - 4,
                    BLOCK_SIZE - 4
                  );
                }
              }
            }

            // Draw current active piece
            ctx.fillStyle = st.currentPiece.color;
            ctx.shadowColor = st.currentPiece.color;
            ctx.shadowBlur = 10;
            for (let r = 0; r < st.currentPiece.shape.length; r++) {
              for (let c = 0; c < st.currentPiece.shape[r].length; c++) {
                if (st.currentPiece.shape[r][c] !== 0) {
                  ctx.beginPath();
                  ctx.roundRect(
                    (st.currentPiece.x + c) * BLOCK_SIZE + 1,
                    (st.currentPiece.y + r) * BLOCK_SIZE + 1,
                    BLOCK_SIZE - 2,
                    BLOCK_SIZE - 2,
                    4
                  );
                  ctx.fill();
                }
              }
            }
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [gameState, drop]);

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Top HUD */}
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm z-10">
        <span className="text-sm font-bold tracking-wider text-cyan-400">REVIVE TETROMINO</span>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span>SCORE: <strong className="text-white tabular-nums">{score}</strong></span>
          <span>·</span>
          <span>LINES: <strong className="text-cyan-300 tabular-nums">{lines}</strong></span>
          <span>·</span>
          <span>LEVEL: <strong className="text-purple-300 tabular-nums">{level}</strong></span>
          <span>·</span>
          <span className="text-amber-400">BEST: <strong className="text-white tabular-nums">{highScore}</strong></span>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative flex-1 flex items-center justify-center gap-6 p-4">
        {/* Left Panel: Hold */}
        <div className="hidden sm:flex flex-col items-center gap-4 w-28">
          <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-center">
            <span className="text-xs text-slate-400 font-mono block mb-2">HOLD [C]</span>
            <canvas ref={holdCanvasRef} width={80} height={60} className="mx-auto block" />
          </div>

          <div className="text-[11px] text-slate-500 font-mono text-left leading-relaxed">
            <p>↑ Rotate</p>
            <p>← → Move</p>
            <p>↓ Soft Drop</p>
            <p>Space: Hard Drop</p>
          </div>
        </div>

        {/* Center: Main Game Board */}
        <div className="relative border border-slate-700/80 rounded-xl overflow-hidden shadow-2xl bg-black">
          <canvas
            ref={canvasRef}
            width={COLS * BLOCK_SIZE}
            height={ROWS * BLOCK_SIZE}
            className="block"
          />

          {gameState === 'MENU' && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
              <h2 className="text-2xl font-extrabold text-white mb-2">REVIVE TETRIS</h2>
              <p className="text-xs text-slate-400 max-w-xs mb-6">Standard SRS rotations, ghost piece, drop scoring, and levels.</p>
              <button
                onClick={startGame}
                className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                Play Game
              </button>
            </div>
          )}

          {gameState === 'GAMEOVER' && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
              <h3 className="text-xl font-extrabold text-white mb-1">GAME OVER</h3>
              <p className="text-xs text-slate-400 mb-4">Board reached maximum height</p>
              <div className="text-2xl font-bold font-mono text-cyan-400 mb-6 tabular-nums">{score} pts</div>
              <button
                onClick={startGame}
                className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Play Again
              </button>
            </div>
          )}
        </div>

        {/* Right Panel: Next Piece */}
        <div className="hidden sm:flex flex-col items-center gap-4 w-28">
          <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-center">
            <span className="text-xs text-slate-400 font-mono block mb-2">NEXT</span>
            <canvas ref={nextCanvasRef} width={80} height={60} className="mx-auto block" />
          </div>
        </div>
      </div>

      {/* Mobile Controls Bar */}
      <div className="flex sm:hidden items-center justify-between p-2 bg-slate-900 border-t border-slate-800">
        <button onClick={() => move(-1)} className="p-3 bg-slate-800 rounded-lg text-cyan-400 active:bg-cyan-600 active:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button onClick={rotatePiece} className="p-3 bg-slate-800 rounded-lg text-cyan-400 active:bg-cyan-600 active:text-white">
          <RotateCcw className="w-5 h-5" />
        </button>
        <button onClick={hardDrop} className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg active:bg-cyan-400">
          DROP
        </button>
        <button onClick={() => drop()} className="p-3 bg-slate-800 rounded-lg text-cyan-400 active:bg-cyan-600 active:text-white">
          <ArrowDown className="w-5 h-5" />
        </button>
        <button onClick={() => move(1)} className="p-3 bg-slate-800 rounded-lg text-cyan-400 active:bg-cyan-600 active:text-white">
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
