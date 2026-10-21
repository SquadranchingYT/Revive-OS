import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Heart } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

// 1 = Wall, 2 = Dot, 3 = Power Pellet, 0 = Empty
const INITIAL_MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,3,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,3,1],
  [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
  [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,2,1],
  [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
  [1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1],
  [0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0],
  [1,1,1,1,2,1,0,1,1,0,1,1,0,1,2,1,1,1,1],
  [0,0,0,0,2,0,0,1,0,0,0,1,0,0,2,0,0,0,0],
  [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
  [0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0],
  [1,1,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
  [1,3,2,1,2,2,2,2,2,0,2,2,2,2,2,1,2,3,1],
  [1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,1],
  [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

interface Ghost {
  x: number;
  y: number;
  color: string;
  dir: { x: number; y: number };
}

export const PacMazeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'GAMEOVER' | 'VICTORY'>('MENU');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('revive_pac_high') || '0', 10);
  });

  const stateRef = useRef({
    grid: INITIAL_MAP.map(r => [...r]),
    pacX: 9,
    pacY: 14,
    pacDir: { x: 0, y: 0 },
    nextDir: { x: 0, y: 0 },
    mouthAngle: 0.2,
    mouthDir: 1,
    ghosts: [
      { x: 9, y: 8, color: '#f43f5e', dir: { x: 1, y: 0 } },
      { x: 8, y: 8, color: '#ec4899', dir: { x: -1, y: 0 } },
      { x: 10, y: 8, color: '#06b6d4', dir: { x: 0, y: 1 } },
      { x: 9, y: 9, color: '#f59e0b', dir: { x: 0, y: -1 } }
    ] as Ghost[],
    frightenedTimer: 0,
    tick: 0
  });

  const startGame = () => {
    sounds.playClick();
    const st = stateRef.current;
    st.grid = INITIAL_MAP.map(r => [...r]);
    st.pacX = 9;
    st.pacY = 14;
    st.pacDir = { x: -1, y: 0 };
    st.nextDir = { x: -1, y: 0 };
    st.frightenedTimer = 0;
    st.ghosts = [
      { x: 9, y: 8, color: '#f43f5e', dir: { x: 1, y: 0 } },
      { x: 8, y: 8, color: '#ec4899', dir: { x: -1, y: 0 } },
      { x: 10, y: 8, color: '#06b6d4', dir: { x: 0, y: 1 } },
      { x: 9, y: 9, color: '#f59e0b', dir: { x: 0, y: -1 } }
    ];
    setScore(0);
    setLives(3);
    setGameState('PLAYING');
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) stateRef.current.nextDir = { x: -1, y: 0 };
      if (['ArrowRight', 'KeyD'].includes(e.code)) stateRef.current.nextDir = { x: 1, y: 0 };
      if (['ArrowUp', 'KeyW'].includes(e.code)) stateRef.current.nextDir = { x: 0, y: -1 };
      if (['ArrowDown', 'KeyS'].includes(e.code)) stateRef.current.nextDir = { x: 0, y: 1 };
      if (e.code === 'Space' && gameState !== 'PLAYING') startGame();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const gameLoop = () => {
      const st = stateRef.current;
      const w = canvas.width;
      const h = canvas.height;
      const cellSize = w / 19;

      ctx.fillStyle = '#050814';
      ctx.fillRect(0, 0, w, h);

      if (gameState === 'PLAYING') {
        st.tick++;

        // Pac-Man step every 8 ticks
        if (st.tick % 8 === 0) {
          // Check if nextDir can be taken
          const nextX = (st.pacX + st.nextDir.x + 19) % 19;
          const nextY = st.pacY + st.nextDir.y;
          if (st.grid[nextY] && st.grid[nextY][nextX] !== 1) {
            st.pacDir = { ...st.nextDir };
          }

          const moveX = (st.pacX + st.pacDir.x + 19) % 19;
          const moveY = st.pacY + st.pacDir.y;
          if (st.grid[moveY] && st.grid[moveY][moveX] !== 1) {
            st.pacX = moveX;
            st.pacY = moveY;
          }

          // Eat dot
          const cellVal = st.grid[st.pacY][st.pacX];
          if (cellVal === 2) {
            st.grid[st.pacY][st.pacX] = 0;
            sounds.playBlip(620, 'sine', 0.02);
            setScore(s => s + 10);
          } else if (cellVal === 3) {
            // Power pellet
            st.grid[st.pacY][st.pacX] = 0;
            sounds.playScore();
            st.frightenedTimer = 65;
            setScore(s => s + 50);
          }

          // Check all dots eaten (Victory)
          const remainingDots = st.grid.some(row => row.some(c => c === 2 || c === 3));
          if (!remainingDots) {
            sounds.playScore();
            setGameState('VICTORY');
          }
        }

        // Frightened timer countdown
        if (st.frightenedTimer > 0) st.frightenedTimer--;

        // Ghosts movement every 10 ticks
        if (st.tick % 10 === 0) {
          for (const g of st.ghosts) {
            const possibleDirs = [
              { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }
            ].filter(d => {
              // Don't reverse immediately unless trapped
              if (d.x === -g.dir.x && d.y === -g.dir.y) return false;
              const nx = (g.x + d.x + 19) % 19;
              const ny = g.y + d.y;
              return st.grid[ny] && st.grid[ny][nx] !== 1;
            });

            if (possibleDirs.length > 0) {
              g.dir = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
            } else {
              g.dir = { x: -g.dir.x, y: -g.dir.y };
            }

            g.x = (g.x + g.dir.x + 19) % 19;
            g.y = g.y + g.dir.y;
          }
        }

        // Collision check
        for (const g of st.ghosts) {
          if (Math.hypot(g.x - st.pacX, g.y - st.pacY) < 0.8) {
            if (st.frightenedTimer > 0) {
              // Eat ghost
              sounds.playScore();
              setScore(s => s + 200);
              g.x = 9;
              g.y = 8;
            } else {
              // Pac caught
              sounds.playGameOver();
              setLives(l => {
                if (l <= 1) {
                  triggerGameOver();
                  return 0;
                }
                st.pacX = 9;
                st.pacY = 14;
                return l - 1;
              });
              break;
            }
          }
        }

        // Mouth animation
        st.mouthAngle += 0.05 * st.mouthDir;
        if (st.mouthAngle > 0.45 || st.mouthAngle < 0.05) st.mouthDir = -st.mouthDir;
      }

      // Draw Maze Walls and Pellets
      for (let r = 0; r < st.grid.length; r++) {
        for (let c = 0; c < st.grid[r].length; c++) {
          const val = st.grid[r][c];
          const cx = c * cellSize;
          const cy = r * cellSize;

          if (val === 1) {
            // Neon Wall
            ctx.fillStyle = '#0f172a';
            ctx.strokeStyle = '#06b6d4';
            ctx.lineWidth = 1.5;
            ctx.shadowColor = '#06b6d4';
            ctx.shadowBlur = 4;
            ctx.strokeRect(cx + 1, cy + 1, cellSize - 2, cellSize - 2);
          } else if (val === 2) {
            // Energy Pellet
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(cx + cellSize / 2, cy + cellSize / 2, 2.5, 0, Math.PI * 2);
            ctx.fill();
          } else if (val === 3) {
            // Power Pellet
            ctx.fillStyle = '#38bdf8';
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(cx + cellSize / 2, cy + cellSize / 2, 5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Draw Pac-Man
      const pacPixelX = st.pacX * cellSize + cellSize / 2;
      const pacPixelY = st.pacY * cellSize + cellSize / 2;
      let rot = 0;
      if (st.pacDir.x === 1) rot = 0;
      if (st.pacDir.x === -1) rot = Math.PI;
      if (st.pacDir.y === 1) rot = Math.PI / 2;
      if (st.pacDir.y === -1) rot = -Math.PI / 2;

      ctx.save();
      ctx.translate(pacPixelX, pacPixelY);
      ctx.rotate(rot);
      ctx.fillStyle = '#eab308';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, cellSize * 0.44, st.mouthAngle, Math.PI * 2 - st.mouthAngle);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Draw Ghosts
      for (const g of st.ghosts) {
        const gx = g.x * cellSize + cellSize / 2;
        const gy = g.y * cellSize + cellSize / 2;
        const isFrightened = st.frightenedTimer > 0;

        ctx.save();
        ctx.fillStyle = isFrightened ? '#3b82f6' : g.color;
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 8;

        ctx.beginPath();
        ctx.arc(gx, gy - 2, cellSize * 0.4, Math.PI, 0, false);
        ctx.lineTo(gx + cellSize * 0.4, gy + cellSize * 0.4);
        ctx.lineTo(gx - cellSize * 0.4, gy + cellSize * 0.4);
        ctx.closePath();
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(gx - 4, gy - 4, 3, 4);
        ctx.fillRect(gx + 2, gy - 4, 3, 4);
        ctx.restore();
      }

      animId = requestAnimationFrame(gameLoop);
    };

    const triggerGameOver = () => {
      setScore(s => {
        if (s > highScore) {
          setHighScore(s);
          localStorage.setItem('revive_pac_high', s.toString());
        }
        return s;
      });
      setGameState('GAMEOVER');
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, highScore]);

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none font-sans">
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm z-10">
        <span className="text-sm font-bold tracking-wider text-cyan-400">CYBER PAC MAZE</span>
        <div className="flex items-center gap-6 text-xs font-mono">
          <span>SCORE: <strong className="text-white text-sm tabular-nums">{score}</strong></span>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart key={i} className={`w-3.5 h-3.5 ${i < lives ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
            ))}
          </div>
          <span className="text-amber-400">BEST: <strong className="text-white tabular-nums">{highScore}</strong></span>
        </div>
      </div>

      <div className="relative flex-1 flex items-center justify-center p-4">
        <canvas
          ref={canvasRef}
          width={456}
          height={480}
          className="border border-slate-800 rounded-xl shadow-2xl block aspect-[456/480] max-w-full max-h-full"
        />

        {gameState === 'MENU' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <h2 className="text-3xl font-extrabold text-white mb-2">CYBER PAC MAZE</h2>
            <p className="text-xs text-slate-300 max-w-xs mb-6">
              Chomp energy pellets across the cyber maze. Grab glowing power pellets to turn ghosts into prey!
            </p>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              Enter Labyrinth
            </button>
          </div>
        )}

        {(gameState === 'GAMEOVER' || gameState === 'VICTORY') && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
            <h3 className="text-3xl font-extrabold text-white mb-1">
              {gameState === 'VICTORY' ? 'MAZE CLEARED!' : 'CAUGHT BY GHOSTS'}
            </h3>
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
  );
};
