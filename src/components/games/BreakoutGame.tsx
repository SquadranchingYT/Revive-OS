import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Heart } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  hits: number;
  alive: boolean;
}

export const BreakoutGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'GAMEOVER' | 'VICTORY'>('MENU');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('revive_breakout_high') || '0', 10);
  });

  const stateRef = useRef({
    paddleX: 250,
    paddleW: 90,
    paddleH: 12,
    balls: [{ x: 300, y: 380, vx: 4, vy: -4, radius: 6 }],
    bricks: [] as Brick[],
    keys: { left: false, right: false }
  });

  const initBricks = () => {
    const rows = 5;
    const cols = 8;
    const brickW = 60;
    const brickH = 18;
    const pad = 8;
    const offsetTop = 45;
    const offsetLeft = 46;
    const colors = ['#f43f5e', '#fb923c', '#eab308', '#22c55e', '#06b6d4'];

    const bricks: Brick[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        bricks.push({
          x: offsetLeft + c * (brickW + pad),
          y: offsetTop + r * (brickH + pad),
          width: brickW,
          height: brickH,
          color: colors[r],
          hits: r === 0 ? 2 : 1,
          alive: true
        });
      }
    }
    stateRef.current.bricks = bricks;
  };

  const startGame = () => {
    sounds.playClick();
    setScore(0);
    setLives(3);
    stateRef.current.paddleX = 250;
    stateRef.current.paddleW = 90;
    stateRef.current.balls = [{ x: 300, y: 380, vx: 3.5, vy: -4, radius: 6 }];
    initBricks();
    setGameState('PLAYING');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') stateRef.current.keys.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') stateRef.current.keys.right = true;
      if (e.code === 'Space' && gameState !== 'PLAYING') startGame();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') stateRef.current.keys.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') stateRef.current.keys.right = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
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

      // Dark background
      ctx.fillStyle = '#080d1a';
      ctx.fillRect(0, 0, w, h);

      if (gameState === 'PLAYING') {
        // Paddle movement
        if (st.keys.left) st.paddleX = Math.max(10, st.paddleX - 6);
        if (st.keys.right) st.paddleX = Math.min(w - st.paddleW - 10, st.paddleX + 6);

        // Balls update
        for (let i = st.balls.length - 1; i >= 0; i--) {
          const b = st.balls[i];
          b.x += b.vx;
          b.y += b.vy;

          // Wall bounces
          if (b.x - b.radius <= 0) {
            b.x = b.radius;
            b.vx = -b.vx;
            sounds.playBlip(320, 'sine', 0.02);
          }
          if (b.x + b.radius >= w) {
            b.x = w - b.radius;
            b.vx = -b.vx;
            sounds.playBlip(320, 'sine', 0.02);
          }
          if (b.y - b.radius <= 0) {
            b.y = b.radius;
            b.vy = -b.vy;
            sounds.playBlip(320, 'sine', 0.02);
          }

          // Paddle bounce
          const paddleY = h - 35;
          if (
            b.y + b.radius >= paddleY &&
            b.y - b.radius <= paddleY + st.paddleH &&
            b.x >= st.paddleX &&
            b.x <= st.paddleX + st.paddleW
          ) {
            sounds.playBlip(480, 'triangle', 0.04);
            b.vy = -Math.abs(b.vy);
            const hitOffset = (b.x - (st.paddleX + st.paddleW / 2)) / (st.paddleW / 2);
            b.vx = hitOffset * 5.5;
          }

          // Brick collisions
          for (const brick of st.bricks) {
            if (!brick.alive) continue;
            if (
              b.x + b.radius >= brick.x &&
              b.x - b.radius <= brick.x + brick.width &&
              b.y + b.radius >= brick.y &&
              b.y - b.radius <= brick.y + brick.height
            ) {
              b.vy = -b.vy;
              brick.hits--;
              sounds.playBlip(600, 'square', 0.05);
              if (brick.hits <= 0) {
                brick.alive = false;
                setScore(s => s + 20);
              }
              break;
            }
          }

          // Ball drops below
          if (b.y > h + 10) {
            st.balls.splice(i, 1);
            if (st.balls.length === 0) {
              sounds.playGameOver();
              setLives(l => {
                if (l <= 1) {
                  triggerGameOver();
                  return 0;
                } else {
                  // Respawn ball
                  st.balls.push({ x: st.paddleX + st.paddleW / 2, y: 380, vx: 3.5, vy: -4, radius: 6 });
                  return l - 1;
                }
              });
            }
          }
        }

        // Check Victory
        if (st.bricks.every(b => !b.alive)) {
          sounds.playScore();
          setGameState('VICTORY');
        }
      }

      // Draw Bricks
      for (const brick of st.bricks) {
        if (!brick.alive) continue;
        ctx.fillStyle = brick.color;
        ctx.shadowColor = brick.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 4);
        ctx.fill();

        if (brick.hits > 1) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Draw Paddle
      const py = h - 35;
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.roundRect(st.paddleX, py, st.paddleW, st.paddleH, 6);
      ctx.fill();

      // Draw Balls
      for (const b of st.balls) {
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(gameLoop);
    };

    const triggerGameOver = () => {
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('revive_breakout_high', score.toString());
      }
      setGameState('GAMEOVER');
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, score, highScore]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState !== 'PLAYING' || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const scale = canvasRef.current.width / rect.width;
    stateRef.current.paddleX = Math.max(
      10,
      Math.min(canvasRef.current.width - stateRef.current.paddleW - 10, clientX * scale - stateRef.current.paddleW / 2)
    );
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none">
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm z-10">
        <span className="text-sm font-bold tracking-wider text-cyan-400">NEON BREAKOUT</span>
        <div className="flex items-center gap-6 text-xs font-mono">
          <span>SCORE: <strong className="text-white tabular-nums">{score}</strong></span>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart key={i} className={`w-3.5 h-3.5 ${i < lives ? 'text-rose-500 fill-rose-500' : 'text-slate-700'}`} />
            ))}
          </div>
          <span className="text-amber-400">BEST: <strong className="text-white tabular-nums">{highScore}</strong></span>
        </div>
      </div>

      <div className="relative flex-1 flex items-center justify-center p-4">
        <canvas
          ref={canvasRef}
          width={600}
          height={480}
          onMouseMove={handleMouseMove}
          className="border border-slate-800 rounded-xl shadow-2xl block aspect-[600/480] max-w-full max-h-full cursor-crosshair"
        />

        {gameState === 'MENU' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <h2 className="text-3xl font-extrabold text-white mb-2">NEON BREAKOUT</h2>
            <p className="text-xs text-slate-300 max-w-xs mb-6">Demolish neon brick barriers with the particle pulse ball.</p>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              Launch Ball
            </button>
          </div>
        )}

        {(gameState === 'GAMEOVER' || gameState === 'VICTORY') && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
            <h3 className="text-3xl font-extrabold text-white mb-1">
              {gameState === 'VICTORY' ? 'SECTOR CLEARED!' : 'OUT OF BALLS'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">Total score: {score} points</p>
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
