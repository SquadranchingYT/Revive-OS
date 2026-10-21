import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface Hoop {
  x: number;
  y: number;
  radius: number;
  passed: boolean;
}

export const DunkHoopGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'GAMEOVER'>('MENU');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('revive_dunk_high') || '0', 10);
  });

  const stateRef = useRef({
    ballX: 120,
    ballY: 200,
    ballVy: 0,
    hoops: [] as Hoop[],
    speed: 2.8
  });

  const flap = () => {
    if (gameState === 'PLAYING') {
      sounds.playJump();
      stateRef.current.ballVy = -7.2;
    } else {
      startGame();
    }
  };

  const startGame = () => {
    sounds.playClick();
    const st = stateRef.current;
    st.ballX = 120;
    st.ballY = 200;
    st.ballVy = -4;
    st.speed = 2.8;
    st.hoops = [
      { x: 300, y: 220, radius: 28, passed: false },
      { x: 500, y: 160, radius: 28, passed: false }
    ];
    setScore(0);
    setGameState('PLAYING');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
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

      // Dark basketball arena
      ctx.fillStyle = '#060a16';
      ctx.fillRect(0, 0, w, h);

      if (gameState === 'PLAYING') {
        // Ball gravity
        st.ballVy += 0.38;
        st.ballY += st.ballVy;

        // Ground/ceiling hits
        if (st.ballY > h - 20 || st.ballY < 15) {
          triggerGameOver();
          return;
        }

        // Hoops update
        for (let i = st.hoops.length - 1; i >= 0; i--) {
          const hoop = st.hoops[i];
          hoop.x -= st.speed;

          // Check if ball passes through hoop
          if (!hoop.passed) {
            const dx = st.ballX - hoop.x;
            const dy = st.ballY - hoop.y;
            const dist = Math.hypot(dx, dy);

            // Ball goes through hoop net
            if (dist < hoop.radius + 6 && st.ballVy > 0) {
              hoop.passed = true;
              sounds.playScore();
              setScore(s => s + 1);
            }
          }

          if (hoop.x < -60) {
            st.hoops.splice(i, 1);
            // Spawn next hoop
            const lastX = st.hoops[st.hoops.length - 1]?.x || w;
            st.hoops.push({
              x: lastX + 220 + Math.random() * 60,
              y: 120 + Math.random() * (h - 240),
              radius: 28,
              passed: false
            });
          }
        }
      }

      // Draw Hoops
      for (const hoop of st.hoops) {
        ctx.save();
        ctx.strokeStyle = hoop.passed ? '#10b981' : '#f97316';
        ctx.lineWidth = 3;
        ctx.shadowColor = hoop.passed ? '#10b981' : '#f97316';
        ctx.shadowBlur = 10;

        // Rim ring
        ctx.beginPath();
        ctx.ellipse(hoop.x, hoop.y, hoop.radius, 10, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Net lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(hoop.x - hoop.radius, hoop.y);
        ctx.lineTo(hoop.x - 12, hoop.y + 26);
        ctx.lineTo(hoop.x + 12, hoop.y + 26);
        ctx.lineTo(hoop.x + hoop.radius, hoop.y);
        ctx.stroke();
        ctx.restore();
      }

      // Draw Neon Basketball
      const bx = st.ballX;
      const by = st.ballY;
      const r = 16;

      ctx.save();
      ctx.fillStyle = '#ea580c';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(bx, by, r, 0, Math.PI * 2);
      ctx.fill();

      // Ball ribs
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(bx, by, r, 0, Math.PI * 2);
      ctx.moveTo(bx - r, by);
      ctx.lineTo(bx + r, by);
      ctx.stroke();
      ctx.restore();

      animId = requestAnimationFrame(gameLoop);
    };

    const triggerGameOver = () => {
      sounds.playGameOver();
      setScore(s => {
        if (s > highScore) {
          setHighScore(s);
          localStorage.setItem('revive_dunk_high', s.toString());
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
        <span className="text-sm font-bold tracking-wider text-cyan-400">NEON DUNK HOOP</span>
        <div className="flex items-center gap-6 text-xs font-mono">
          <span>DUNKS: <strong className="text-white text-sm tabular-nums">{score}</strong></span>
          <span className="text-amber-400">BEST: <strong className="text-white tabular-nums">{highScore}</strong></span>
        </div>
      </div>

      <div className="relative flex-1 flex items-center justify-center p-4">
        <canvas
          ref={canvasRef}
          width={480}
          height={400}
          onClick={flap}
          className="border border-slate-800 rounded-xl shadow-2xl block aspect-[480/400] max-w-full max-h-full cursor-pointer"
        />

        {gameState === 'MENU' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <h2 className="text-3xl font-extrabold text-white mb-2">NEON DUNK HOOP</h2>
            <p className="text-xs text-slate-300 max-w-xs mb-6">
              Flap the neon basketball through cyber hoops without touching the rims or floor.
            </p>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              Tip-Off [SPACE]
            </button>
          </div>
        )}

        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
            <h3 className="text-3xl font-extrabold text-white mb-1">AIRBALL / MISSED</h3>
            <p className="text-xs text-slate-400 mb-4">Final score: {score} dunks</p>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Dunk Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
