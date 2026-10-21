import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, RotateCcw, Zap } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

const GRID_SIZE = 22;

export const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<{ x: number; y: number }[]>([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ]);
  const [food, setFood] = useState<{ x: number; y: number; type: 'normal' | 'super' }>({ x: 15, y: 10, type: 'normal' });
  const [dir, setDir] = useState<{ x: number; y: number }>({ x: 1, y: 0 });
  const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'GAMEOVER'>('MENU');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('revive_snake_high') || '0', 10);
  });
  const [speed, setSpeed] = useState(110);

  const nextDirRef = useRef<{ x: number; y: number }>({ x: 1, y: 0 });

  const spawnFood = useCallback((currentSnake: { x: number; y: number }[]) => {
    let nx: number, ny: number;
    let collision = true;
    while (collision) {
      nx = Math.floor(Math.random() * GRID_SIZE);
      ny = Math.floor(Math.random() * GRID_SIZE);
      collision = currentSnake.some(s => s.x === nx && s.y === ny);
    }
    const isSuper = Math.random() < 0.25;
    setFood({ x: nx!, y: ny!, type: isSuper ? 'super' : 'normal' });
  }, []);

  const startGame = () => {
    sounds.playClick();
    const initialSnake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    setSnake(initialSnake);
    setDir({ x: 1, y: 0 });
    nextDirRef.current = { x: 1, y: 0 };
    setScore(0);
    setSpeed(110);
    spawnFood(initialSnake);
    setGameState('PLAYING');
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const { x, y } = dir;
      if ((e.code === 'ArrowUp' || e.code === 'KeyW') && y === 0) {
        nextDirRef.current = { x: 0, y: -1 };
      } else if ((e.code === 'ArrowDown' || e.code === 'KeyS') && y === 0) {
        nextDirRef.current = { x: 0, y: 1 };
      } else if ((e.code === 'ArrowLeft' || e.code === 'KeyA') && x === 0) {
        nextDirRef.current = { x: -1, y: 0 };
      } else if ((e.code === 'ArrowRight' || e.code === 'KeyD') && x === 0) {
        nextDirRef.current = { x: 1, y: 0 };
      } else if (e.code === 'Space' && gameState !== 'PLAYING') {
        startGame();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dir, gameState]);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const timer = setInterval(() => {
      setDir(nextDirRef.current);
      setSnake(prev => {
        const head = {
          x: prev[0].x + nextDirRef.current.x,
          y: prev[0].y + nextDirRef.current.y
        };

        // Wall hit
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          triggerGameOver();
          return prev;
        }

        // Self hit
        if (prev.some(seg => seg.x === head.x && seg.y === head.y)) {
          triggerGameOver();
          return prev;
        }

        const newSnake = [head, ...prev];

        // Food hit
        if (head.x === food.x && head.y === food.y) {
          sounds.playBlip(food.type === 'super' ? 880 : 580, 'triangle', 0.08);
          const pts = food.type === 'super' ? 30 : 10;
          setScore(s => s + pts);
          setSpeed(sp => Math.max(65, sp - 1.5));
          spawnFood(newSnake);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, speed);

    const triggerGameOver = () => {
      sounds.playGameOver();
      setGameState('GAMEOVER');
      setScore(s => {
        if (s > highScore) {
          setHighScore(s);
          localStorage.setItem('revive_snake_high', s.toString());
        }
        return s;
      });
    };

    return () => clearInterval(timer);
  }, [gameState, food, speed, highScore, spawnFood]);

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none">
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm z-10">
        <span className="text-sm font-bold tracking-wider text-cyan-400">SNAKE REVIVE</span>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span>SCORE: <strong className="text-white tabular-nums">{score}</strong></span>
          <span>·</span>
          <span>LENGTH: <strong className="text-cyan-300 tabular-nums">{snake.length}</strong></span>
          <span>·</span>
          <span className="text-amber-400">BEST: <strong className="text-white tabular-nums">{highScore}</strong></span>
        </div>
      </div>

      <div className="relative flex-1 flex items-center justify-center p-4">
        {/* Game Grid Board */}
        <div
          className="relative bg-slate-900/90 border border-slate-700/80 rounded-xl overflow-hidden shadow-2xl"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            width: 'min(90vw, 460px)',
            height: 'min(90vw, 460px)'
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            const isHead = snake[0].x === x && snake[0].y === y;
            const isBody = snake.slice(1).some(s => s.x === x && s.y === y);
            const isFood = food.x === x && food.y === y;

            return (
              <div
                key={i}
                className="w-full h-full flex items-center justify-center border border-white/[0.02]"
              >
                {isHead && (
                  <div className="w-[82%] h-[82%] bg-cyan-400 rounded-sm shadow-[0_0_12px_#22d3ee]" />
                )}
                {isBody && (
                  <div className="w-[75%] h-[75%] bg-cyan-600/90 rounded-sm" />
                )}
                {isFood && (
                  <div
                    className={`w-[78%] h-[78%] rounded-full ${
                      food.type === 'super'
                        ? 'bg-amber-400 shadow-[0_0_14px_#fbbf24] animate-pulse'
                        : 'bg-rose-500 shadow-[0_0_10px_#f43f5e]'
                    }`}
                  />
                )}
              </div>
            );
          })}

          {gameState === 'MENU' && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
              <h2 className="text-2xl font-extrabold text-white mb-2">SNAKE REVIVE</h2>
              <p className="text-xs text-slate-300 max-w-xs mb-6">
                Guide the cyber serpent, consume glow nodes, and steer clear of boundaries.
              </p>
              <button
                onClick={startGame}
                className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                Start Game
              </button>
            </div>
          )}

          {gameState === 'GAMEOVER' && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
              <h3 className="text-2xl font-extrabold text-white mb-1">COLLISION DETECTED</h3>
              <p className="text-xs text-slate-400 mb-4">Final score: {score} points</p>
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
      </div>
    </div>
  );
};
