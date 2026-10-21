import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Award } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface Pipe {
  x: number;
  topH: number;
  bottomH: number;
  passed: boolean;
}

export const FlappyCyberGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'GAMEOVER'>('MENU');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('revive_flappy_high') || '0', 10);
  });

  const stateRef = useRef({
    droneY: 200,
    droneVy: 0,
    pipes: [] as Pipe[],
    pipeSpeed: 3.2,
    gap: 130,
    pipeWidth: 50,
    frames: 0
  });

  const flap = () => {
    if (gameState === 'PLAYING') {
      sounds.playJump();
      stateRef.current.droneVy = -7.5;
    } else {
      startGame();
    }
  };

  const startGame = () => {
    sounds.playClick();
    const st = stateRef.current;
    st.droneY = 200;
    st.droneVy = -4;
    st.pipes = [];
    st.frames = 0;
    setScore(0);
    setGameState('PLAYING');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        flap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

      // Dark background with gradient
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#040714');
      bg.addColorStop(0.5, '#0a1026');
      bg.addColorStop(1, '#020617');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      if (gameState === 'PLAYING') {
        st.frames++;
        // Drone physics
        st.droneVy += 0.42; // Gravity
        st.droneY += st.droneVy;

        // Ground/ceiling hits
        if (st.droneY < 15 || st.droneY > h - 15) {
          triggerGameOver();
          return;
        }

        // Spawn pipes every 85 frames
        if (st.frames % 85 === 0) {
          const topH = 60 + Math.random() * (h - st.gap - 120);
          const bottomH = h - topH - st.gap;
          st.pipes.push({ x: w + 20, topH, bottomH, passed: false });
        }

        // Move pipes & collision
        const droneX = 70;
        const droneR = 14;

        for (let i = st.pipes.length - 1; i >= 0; i--) {
          const p = st.pipes[i];
          p.x -= st.pipeSpeed;

          // Check pass for score
          if (!p.passed && p.x + st.pipeWidth < droneX) {
            p.passed = true;
            sounds.playScore();
            setScore(s => s + 1);
          }

          // Check collisions with top & bottom pipes
          if (
            droneX + droneR > p.x &&
            droneX - droneR < p.x + st.pipeWidth
          ) {
            if (st.droneY - droneR < p.topH || st.droneY + droneR > h - p.bottomH) {
              triggerGameOver();
              return;
            }
          }

          if (p.x < -st.pipeWidth - 20) {
            st.pipes.splice(i, 1);
          }
        }
      }

      // Draw Neon Conduit Pipes
      for (const p of st.pipes) {
        ctx.save();
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 10;

        // Top Pipe
        ctx.fillRect(p.x, 0, st.pipeWidth, p.topH);
        ctx.strokeRect(p.x, 0, st.pipeWidth, p.topH);

        // Top Pipe cap
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(p.x - 3, p.topH - 12, st.pipeWidth + 6, 12);

        // Bottom Pipe
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(p.x, h - p.bottomH, st.pipeWidth, p.bottomH);
        ctx.strokeRect(p.x, h - p.bottomH, st.pipeWidth, p.bottomH);

        // Bottom Pipe cap
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(p.x - 3, h - p.bottomH, st.pipeWidth + 6, 12);
        ctx.restore();
      }

      // Draw Cyber Flight Drone
      const dx = 70;
      const dy = st.droneY;
      ctx.save();
      ctx.translate(dx, dy);
      ctx.rotate(Math.min(Math.PI / 4, Math.max(-Math.PI / 4, st.droneVy * 0.08)));

      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 12;

      // Drone body
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      // Mechanical wing
      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath();
      ctx.ellipse(-3, -7, 10, 4, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Eye sensor
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(8, -2, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      animId = requestAnimationFrame(gameLoop);
    };

    const triggerGameOver = () => {
      sounds.playGameOver();
      setScore(s => {
        if (s > highScore) {
          setHighScore(s);
          localStorage.setItem('revive_flappy_high', s.toString());
        }
        return s;
      });
      setGameState('GAMEOVER');
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, highScore]);

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none">
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm z-10">
        <span className="text-sm font-bold tracking-wider text-cyan-400">FLAPPY CYBER DRONE</span>
        <div className="flex items-center gap-6 text-xs font-mono">
          <span>PIPES CLEARED: <strong className="text-white text-sm tabular-nums">{score}</strong></span>
          <span className="text-amber-400">BEST: <strong className="text-white tabular-nums">{highScore}</strong></span>
        </div>
      </div>

      <div className="relative flex-1 flex items-center justify-center p-4">
        <canvas
          ref={canvasRef}
          width={400}
          height={500}
          onClick={flap}
          className="border border-slate-800 rounded-xl shadow-2xl block aspect-[400/500] max-w-full max-h-full cursor-pointer"
        />

        {gameState === 'MENU' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <h2 className="text-3xl font-extrabold text-white mb-2">FLAPPY CYBER DRONE</h2>
            <p className="text-xs text-slate-300 max-w-xs mb-6">
              Pulse vertical thrusters to weave through glowing energy conduits.
            </p>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              Launch Drone [SPACE]
            </button>
          </div>
        )}

        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
            <h3 className="text-3xl font-extrabold text-white mb-1">SYSTEM CRITICAL</h3>
            <p className="text-xs text-slate-400 mb-4">Total score: {score} conduits passed</p>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
