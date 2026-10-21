import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Users, User } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export const NeonPongGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'GAMEOVER'>('MENU');
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [mode, setMode] = useState<'ai' | '2p'>('ai');

  const stateRef = useRef({
    p1Y: 180,
    p2Y: 180,
    paddleH: 70,
    paddleW: 10,
    ball: { x: 300, y: 200, vx: 5, vy: 3, radius: 6 },
    keys: { w: false, s: false, up: false, down: false },
    mode: 'ai' as 'ai' | '2p'
  });

  const startGame = (chosenMode: 'ai' | '2p' = mode) => {
    sounds.playClick();
    setMode(chosenMode);
    stateRef.current.mode = chosenMode;
    setP1Score(0);
    setP2Score(0);
    setWinner(null);
    resetBall(1);
    setGameState('PLAYING');
  };

  const resetBall = (direction: number) => {
    stateRef.current.ball = {
      x: 300,
      y: 200,
      vx: 4.5 * direction,
      vy: (Math.random() - 0.5) * 6,
      radius: 6
    };
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyW') stateRef.current.keys.w = true;
      if (e.code === 'KeyS') stateRef.current.keys.s = true;
      if (e.code === 'ArrowUp') stateRef.current.keys.up = true;
      if (e.code === 'ArrowDown') stateRef.current.keys.down = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyW') stateRef.current.keys.w = false;
      if (e.code === 'KeyS') stateRef.current.keys.s = false;
      if (e.code === 'ArrowUp') stateRef.current.keys.up = false;
      if (e.code === 'ArrowDown') stateRef.current.keys.down = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

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
      ctx.fillStyle = '#060a16';
      ctx.fillRect(0, 0, w, h);

      // Center court dashed line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.stroke();
      ctx.setLineDash([]);

      if (gameState === 'PLAYING') {
        // Player 1 movement (W/S)
        if (st.keys.w) st.p1Y = Math.max(0, st.p1Y - 6.5);
        if (st.keys.s) st.p1Y = Math.min(h - st.paddleH, st.p1Y + 6.5);

        // Player 2 / AI movement
        if (st.mode === '2p') {
          if (st.keys.up) st.p2Y = Math.max(0, st.p2Y - 6.5);
          if (st.keys.down) st.p2Y = Math.min(h - st.paddleH, st.p2Y + 6.5);
        } else {
          // AI tracking
          const targetY = st.ball.y - st.paddleH / 2;
          const aiSpeed = 4.8;
          if (st.p2Y < targetY - 4) st.p2Y += Math.min(aiSpeed, targetY - st.p2Y);
          else if (st.p2Y > targetY + 4) st.p2Y -= Math.min(aiSpeed, st.p2Y - targetY);
          st.p2Y = Math.max(0, Math.min(h - st.paddleH, st.p2Y));
        }

        // Ball movement
        st.ball.x += st.ball.vx;
        st.ball.y += st.ball.vy;

        // Top/Bottom bounce
        if (st.ball.y - st.ball.radius <= 0 || st.ball.y + st.ball.radius >= h) {
          st.ball.vy = -st.ball.vy;
          sounds.playBlip(320, 'sine', 0.03);
        }

        // Paddle 1 collision (Left)
        const p1X = 25;
        if (
          st.ball.x - st.ball.radius <= p1X + st.paddleW &&
          st.ball.x + st.ball.radius >= p1X &&
          st.ball.y >= st.p1Y &&
          st.ball.y <= st.p1Y + st.paddleH
        ) {
          sounds.playBlip(540, 'triangle', 0.04);
          st.ball.vx = Math.abs(st.ball.vx) * 1.05; // speed up slightly
          const hit = (st.ball.y - (st.p1Y + st.paddleH / 2)) / (st.paddleH / 2);
          st.ball.vy = hit * 6;
        }

        // Paddle 2 collision (Right)
        const p2X = w - 25 - st.paddleW;
        if (
          st.ball.x + st.ball.radius >= p2X &&
          st.ball.x - st.ball.radius <= p2X + st.paddleW &&
          st.ball.y >= st.p2Y &&
          st.ball.y <= st.p2Y + st.paddleH
        ) {
          sounds.playBlip(540, 'triangle', 0.04);
          st.ball.vx = -Math.abs(st.ball.vx) * 1.05;
          const hit = (st.ball.y - (st.p2Y + st.paddleH / 2)) / (st.paddleH / 2);
          st.ball.vy = hit * 6;
        }

        // Score check
        if (st.ball.x < 0) {
          // P2 scores
          sounds.playScore();
          setP2Score(s => {
            const next = s + 1;
            if (next >= 7) {
              setWinner(st.mode === 'ai' ? 'CYBER AI BOT' : 'PLAYER 2');
              setGameState('GAMEOVER');
            } else {
              resetBall(1);
            }
            return next;
          });
        } else if (st.ball.x > w) {
          // P1 scores
          sounds.playScore();
          setP1Score(s => {
            const next = s + 1;
            if (next >= 7) {
              setWinner('PLAYER 1');
              setGameState('GAMEOVER');
            } else {
              resetBall(-1);
            }
            return next;
          });
        }
      }

      // Draw Paddle 1 (Cyan)
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(25, st.p1Y, st.paddleW, st.paddleH, 4);
      ctx.fill();

      // Draw Paddle 2 (Rose/Purple)
      ctx.fillStyle = '#a855f7';
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(w - 25 - st.paddleW, st.p2Y, st.paddleW, st.paddleH, 4);
      ctx.fill();

      // Draw Ball
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(st.ball.x, st.ball.y, st.ball.radius, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameState]);

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none">
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm z-10">
        <span className="text-sm font-bold tracking-wider text-cyan-400">NEON PONG 1V1</span>
        <div className="flex items-center gap-8 text-base font-mono">
          <span className="text-cyan-400 font-bold">P1: <strong className="text-white text-lg tabular-nums">{p1Score}</strong></span>
          <span className="text-slate-600">FIRST TO 7</span>
          <span className="text-purple-400 font-bold">{mode === 'ai' ? 'BOT' : 'P2'}: <strong className="text-white text-lg tabular-nums">{p2Score}</strong></span>
        </div>
      </div>

      <div className="relative flex-1 flex items-center justify-center p-4">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="border border-slate-800 rounded-xl shadow-2xl block aspect-[600/400] max-w-full max-h-full"
        />

        {gameState === 'MENU' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <h2 className="text-3xl font-extrabold text-white mb-2">NEON PONG 1V1</h2>
            <p className="text-xs text-slate-300 max-w-xs mb-6">Choose your game mode and rally to 7 points.</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => startGame('ai')}
                className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer"
              >
                <User className="w-4 h-4" />
                Vs Cyber AI
              </button>
              <button
                onClick={() => startGame('2p')}
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg transition-all shadow-[0_0_20px_rgba(168,85,247,0.5)] cursor-pointer"
              >
                <Users className="w-4 h-4" />
                2 Players (Local)
              </button>
            </div>
            <p className="text-slate-500 text-[11px] font-mono mt-4">P1: W/S · P2: Up/Down arrows</p>
          </div>
        )}

        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
            <h3 className="text-3xl font-extrabold text-white mb-1">{winner} WINS!</h3>
            <p className="text-xs text-slate-400 mb-6">Final: {p1Score} - {p2Score}</p>
            <button
              onClick={() => startGame(mode)}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Rematch
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
