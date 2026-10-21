import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface Lane {
  y: number;
  type: 'grass' | 'road' | 'river';
  speed: number;
  items: { x: number; width: number; color: string }[];
}

export const CyberCrosserGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'GAMEOVER'>('MENU');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('revive_crosser_high') || '0', 10);
  });

  const stateRef = useRef({
    playerX: 5, // Grid columns (0 to 10)
    playerRow: 0, // 0 = start
    maxRow: 0,
    lanes: [] as Lane[],
    keys: { up: false, down: false, left: false, right: false }
  });

  const initLanes = () => {
    const lanes: Lane[] = [];
    for (let r = 0; r < 50; r++) {
      if (r === 0 || r === 1 || r % 6 === 0) {
        // Safe lane
        lanes.push({ y: r, type: 'grass', speed: 0, items: [] });
      } else if (r % 6 === 4 || r % 6 === 5) {
        // River with log platforms
        const spd = (Math.random() < 0.5 ? 1 : -1) * (1.5 + Math.random() * 1.5);
        lanes.push({
          y: r,
          type: 'river',
          speed: spd,
          items: [
            { x: 50, width: 80, color: '#3b82f6' },
            { x: 240, width: 90, color: '#3b82f6' }
          ]
        });
      } else {
        // Cyber Road with speed cars
        const spd = (Math.random() < 0.5 ? 1 : -1) * (2.5 + Math.random() * 2);
        lanes.push({
          y: r,
          type: 'road',
          speed: spd,
          items: [
            { x: 40, width: 48, color: '#f43f5e' },
            { x: 220, width: 48, color: '#a855f7' }
          ]
        });
      }
    }
    stateRef.current.lanes = lanes;
  };

  const startGame = () => {
    sounds.playClick();
    const st = stateRef.current;
    st.playerX = 5;
    st.playerRow = 0;
    st.maxRow = 0;
    initLanes();
    setScore(0);
    setGameState('PLAYING');
  };

  const hop = (dx: number, dy: number) => {
    if (gameState !== 'PLAYING') return;
    sounds.playJump();
    const st = stateRef.current;
    st.playerX = Math.max(0, Math.min(10, st.playerX + dx));
    st.playerRow = Math.max(0, st.playerRow + dy);
    if (st.playerRow > st.maxRow) {
      st.maxRow = st.playerRow;
      setScore(st.maxRow);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) { e.preventDefault(); hop(0, 1); }
      if (['ArrowDown', 'KeyS'].includes(e.code)) { e.preventDefault(); hop(0, -1); }
      if (['ArrowLeft', 'KeyA'].includes(e.code)) { e.preventDefault(); hop(-1, 0); }
      if (['ArrowRight', 'KeyD'].includes(e.code)) { e.preventDefault(); hop(1, 0); }
      if (e.code === 'Space' && gameState !== 'PLAYING') startGame();
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
      const cellW = w / 11;
      const laneH = 40;

      // Dark background
      ctx.fillStyle = '#060a16';
      ctx.fillRect(0, 0, w, h);

      const cameraY = st.playerRow * laneH - h / 2 + 60;

      // Update lane items
      if (gameState === 'PLAYING') {
        for (const lane of st.lanes) {
          if (lane.type === 'road' || lane.type === 'river') {
            for (const item of lane.items) {
              item.x += lane.speed;
              if (item.x < -item.width - 20) item.x = w + 20;
              if (item.x > w + 20) item.x = -item.width - 20;
            }
          }
        }

        // Check collisions for current player row
        const currentLane = st.lanes[st.playerRow];
        if (currentLane) {
          const px = st.playerX * cellW + cellW / 2;

          if (currentLane.type === 'road') {
            for (const car of currentLane.items) {
              if (px > car.x && px < car.x + car.width) {
                triggerGameOver();
                return;
              }
            }
          } else if (currentLane.type === 'river') {
            // Must be on log
            const onLog = currentLane.items.some(log => px > log.x && px < log.x + log.width);
            if (!onLog) {
              triggerGameOver();
              return;
            } else {
              // Drift with log
              st.playerX += currentLane.speed / cellW;
              if (st.playerX < 0 || st.playerX > 10) {
                triggerGameOver();
                return;
              }
            }
          }
        }
      }

      // Draw Lanes
      ctx.save();
      ctx.translate(0, cameraY);

      for (const lane of st.lanes) {
        const screenY = h - lane.y * laneH - laneH;
        if (screenY + cameraY < -laneH || screenY + cameraY > h + laneH) continue;

        // Lane floor
        ctx.fillStyle =
          lane.type === 'grass' ? '#0f172a' : lane.type === 'road' ? '#1e293b' : '#0369a1';
        ctx.fillRect(0, screenY, w, laneH);

        // Lane dividers
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.moveTo(0, screenY);
        ctx.lineTo(w, screenY);
        ctx.stroke();

        // Draw Lane Items (Cars / Logs)
        for (const item of lane.items) {
          ctx.fillStyle = item.color;
          ctx.shadowColor = item.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.roundRect(item.x, screenY + 6, item.width, laneH - 12, 6);
          ctx.fill();
        }
      }

      // Draw Player Hopper
      const px = st.playerX * cellW + cellW / 2;
      const py = h - st.playerRow * laneH - laneH / 2;

      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(px, py, 12, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px - 5, py - 6, 3, 3);
      ctx.fillRect(px + 2, py - 6, 3, 3);

      ctx.restore();

      animId = requestAnimationFrame(gameLoop);
    };

    const triggerGameOver = () => {
      sounds.playGameOver();
      const finalScore = stateRef.current.maxRow;
      if (finalScore > highScore) {
        setHighScore(finalScore);
        localStorage.setItem('revive_crosser_high', finalScore.toString());
      }
      setGameState('GAMEOVER');
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, highScore]);

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none font-sans">
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm z-10">
        <span className="text-sm font-bold tracking-wider text-cyan-400">CYBER CROSSER 3D</span>
        <div className="flex items-center gap-6 text-xs font-mono">
          <span>DISTANCE: <strong className="text-white text-sm tabular-nums">{score}</strong></span>
          <span className="text-amber-400">BEST: <strong className="text-white tabular-nums">{highScore}</strong></span>
        </div>
      </div>

      <div className="relative flex-1 flex items-center justify-center p-4">
        <canvas
          ref={canvasRef}
          width={440}
          height={500}
          className="border border-slate-800 rounded-xl shadow-2xl block aspect-[440/500] max-w-full max-h-full"
        />

        {gameState === 'MENU' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <h2 className="text-3xl font-extrabold text-white mb-2">CYBER CROSSER</h2>
            <p className="text-xs text-slate-300 max-w-xs mb-6">
              Hop across neon vehicle highways and float on plasma logs. Don't get squished!
            </p>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              Hop Forward [SPACE]
            </button>
          </div>
        )}

        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
            <h3 className="text-3xl font-extrabold text-white mb-1">IMPACT DETECTED</h3>
            <p className="text-xs text-slate-400 mb-4">You crossed {score} lanes</p>
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

      {/* Touch buttons for tablet */}
      <div className="flex sm:hidden items-center justify-center gap-3 p-3 bg-slate-900 border-t border-slate-800">
        <button onClick={() => hop(-1, 0)} className="px-4 py-2 bg-slate-800 rounded-lg text-cyan-400 font-bold">←</button>
        <button onClick={() => hop(0, 1)} className="px-6 py-2 bg-cyan-500 text-slate-950 font-bold rounded-lg">↑ HOP</button>
        <button onClick={() => hop(1, 0)} className="px-4 py-2 bg-slate-800 rounded-lg text-cyan-400 font-bold">→</button>
      </div>
    </div>
  );
};
