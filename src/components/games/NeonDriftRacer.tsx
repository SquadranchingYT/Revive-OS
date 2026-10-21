import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Zap, Flame } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface TrafficCar {
  x: number;
  y: number;
  speed: number;
  color: string;
}

interface NitroItem {
  x: number;
  y: number;
}

export const NeonDriftRacer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'GAMEOVER'>('MENU');
  const [score, setScore] = useState(0);
  const [nitro, setNitro] = useState(100);
  const [isBoosting, setIsBoosting] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('revive_racer_high') || '0', 10);
  });

  const stateRef = useRef({
    playerX: 200,
    playerVx: 0,
    laneOffset: 0,
    baseSpeed: 7,
    currentSpeed: 7,
    nitro: 100,
    isBoosting: false,
    distance: 0,
    traffic: [] as TrafficCar[],
    nitros: [] as NitroItem[],
    keys: { left: false, right: false, boost: false }
  });

  const startGame = () => {
    sounds.playClick();
    const st = stateRef.current;
    st.playerX = 200;
    st.playerVx = 0;
    st.baseSpeed = 7;
    st.currentSpeed = 7;
    st.nitro = 100;
    st.isBoosting = false;
    st.distance = 0;
    st.traffic = [];
    st.nitros = [];
    setScore(0);
    setNitro(100);
    setIsBoosting(false);
    setGameState('PLAYING');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') stateRef.current.keys.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') stateRef.current.keys.right = true;
      if (e.code === 'Space' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        stateRef.current.keys.boost = true;
      }
      if (e.code === 'Space' && gameState !== 'PLAYING') {
        startGame();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') stateRef.current.keys.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') stateRef.current.keys.right = false;
      if (e.code === 'Space' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        stateRef.current.keys.boost = false;
      }
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
      const roadLeft = 60;
      const roadRight = w - 60;
      const roadW = roadRight - roadLeft;

      // Dark asphalt
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, w, h);

      // Road boundaries
      ctx.fillStyle = '#0b1120';
      ctx.fillRect(roadLeft, 0, roadW, h);

      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(roadLeft, 0);
      ctx.lineTo(roadLeft, h);
      ctx.moveTo(roadRight, 0);
      ctx.lineTo(roadRight, h);
      ctx.stroke();

      if (gameState === 'PLAYING') {
        // Boost state
        const wantsBoost = st.keys.boost && st.nitro > 0;
        if (wantsBoost) {
          st.currentSpeed = st.baseSpeed * 1.8;
          st.nitro = Math.max(0, st.nitro - 0.4);
          st.isBoosting = true;
        } else {
          st.currentSpeed = st.baseSpeed;
          st.isBoosting = false;
          st.nitro = Math.min(100, st.nitro + 0.08); // gradual recharge
        }
        setNitro(Math.floor(st.nitro));
        setIsBoosting(st.isBoosting);

        // Player steer
        if (st.keys.left) st.playerVx = -6;
        else if (st.keys.right) st.playerVx = 6;
        else st.playerVx *= 0.82;

        st.playerX += st.playerVx;
        st.playerX = Math.max(roadLeft + 25, Math.min(roadRight - 25, st.playerX));

        // Advance distance & road lanes
        st.laneOffset = (st.laneOffset + st.currentSpeed) % 40;
        st.distance += Math.floor(st.currentSpeed / 2);
        st.baseSpeed += 0.001; // subtle difficulty progression
        setScore(st.distance);

        // Spawn traffic
        if (Math.random() < 0.035 && st.traffic.length < 5) {
          const lanes = [roadLeft + 45, roadLeft + 115, roadLeft + 185, roadLeft + 255];
          const lx = lanes[Math.floor(Math.random() * lanes.length)];
          const colors = ['#f43f5e', '#a855f7', '#fb923c', '#64748b'];
          st.traffic.push({
            x: lx,
            y: -70,
            speed: 2 + Math.random() * 2.5,
            color: colors[Math.floor(Math.random() * colors.length)]
          });
        }

        // Spawn nitro canisters
        if (Math.random() < 0.012 && st.nitros.length < 2) {
          const lanes = [roadLeft + 45, roadLeft + 115, roadLeft + 185, roadLeft + 255];
          st.nitros.push({
            x: lanes[Math.floor(Math.random() * lanes.length)],
            y: -40
          });
        }

        // Update traffic & check collision
        for (let i = st.traffic.length - 1; i >= 0; i--) {
          const c = st.traffic[i];
          c.y += (st.currentSpeed - c.speed);

          // Collision check with player (car size ~ 32x55)
          const px = st.playerX;
          const py = h - 90;
          if (
            Math.abs(c.x - px) < 32 &&
            c.y + 55 > py &&
            c.y < py + 55
          ) {
            triggerCrash();
            return;
          }

          if (c.y > h + 80) st.traffic.splice(i, 1);
        }

        // Update nitros & collection
        for (let i = st.nitros.length - 1; i >= 0; i--) {
          const n = st.nitros[i];
          n.y += st.currentSpeed;

          if (Math.abs(n.x - st.playerX) < 28 && Math.abs(n.y - (h - 90)) < 35) {
            sounds.playScore();
            st.nitro = Math.min(100, st.nitro + 35);
            st.nitros.splice(i, 1);
          } else if (n.y > h + 50) {
            st.nitros.splice(i, 1);
          }
        }
      }

      // Draw dashed lane markings
      const laneCount = 3;
      for (let l = 1; l <= laneCount; l++) {
        const lx = roadLeft + (roadW / 4) * l;
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.setLineDash([20, 20]);
        ctx.lineDashOffset = -st.laneOffset;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(lx, 0);
        ctx.lineTo(lx, h);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Draw Nitros
      for (const n of st.nitros) {
        ctx.fillStyle = '#10b981';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(n.x - 2, n.y - 4, 4, 8);
      }

      // Draw Traffic Cars
      for (const c of st.traffic) {
        ctx.save();
        ctx.fillStyle = c.color;
        ctx.shadowColor = c.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(c.x - 16, c.y, 32, 55, 6);
        ctx.fill();

        // Windshield
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(c.x - 12, c.y + 14, 24, 12);

        // Headlights
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(c.x - 14, c.y + 50, 6, 4);
        ctx.fillRect(c.x + 8, c.y + 50, 6, 4);
        ctx.restore();
      }

      // Draw Player Cyber Sports Car
      const px = st.playerX;
      const py = h - 90;

      ctx.save();
      // Nitro exhaust fire trails
      if (st.isBoosting) {
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.moveTo(px - 10, py + 55);
        ctx.lineTo(px - 6, py + 75 + Math.random() * 15);
        ctx.lineTo(px - 2, py + 55);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(px + 2, py + 55);
        ctx.lineTo(px + 6, py + 75 + Math.random() * 15);
        ctx.lineTo(px + 10, py + 55);
        ctx.fill();
      }

      // Player car chassis
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.roundRect(px - 17, py, 34, 58, 7);
      ctx.fill();

      // Roof / Cockpit
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.roundRect(px - 12, py + 14, 24, 26, 4);
      ctx.fill();

      // Taillights
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(px - 15, py + 53, 7, 4);
      ctx.fillRect(px + 8, py + 53, 7, 4);
      ctx.restore();

      animId = requestAnimationFrame(gameLoop);
    };

    const triggerCrash = () => {
      sounds.playExplosion();
      sounds.playGameOver();
      const finalScore = stateRef.current.distance;
      if (finalScore > highScore) {
        setHighScore(finalScore);
        localStorage.setItem('revive_racer_high', finalScore.toString());
      }
      setGameState('GAMEOVER');
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, highScore]);

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none">
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm z-10">
        <span className="text-sm font-bold tracking-wider text-cyan-400">NEON DRIFT RACER</span>
        <div className="flex items-center gap-6 text-xs font-mono">
          <span>DIST: <strong className="text-white tabular-nums">{score}m</strong></span>
          <div className="flex items-center gap-2">
            <Flame className={`w-3.5 h-3.5 ${isBoosting ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
            <div className="w-20 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
              <div
                className={`h-full transition-all ${isBoosting ? 'bg-cyan-400 shadow-[0_0_8px_#38bdf8]' : 'bg-emerald-500'}`}
                style={{ width: `${nitro}%` }}
              />
            </div>
          </div>
          <span className="text-amber-400">BEST: <strong className="text-white tabular-nums">{highScore}m</strong></span>
        </div>
      </div>

      <div className="relative flex-1 flex items-center justify-center p-4">
        <canvas
          ref={canvasRef}
          width={420}
          height={520}
          className="border border-slate-800 rounded-xl shadow-2xl block aspect-[420/520] max-w-full max-h-full"
        />

        {gameState === 'MENU' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <h2 className="text-3xl font-extrabold text-white mb-2">NEON DRIFT RACER</h2>
            <p className="text-xs text-slate-300 max-w-xs mb-4">
              Weave through four lanes of midnight traffic. Collect green nitro canisters and trigger warp speed.
            </p>
            <div className="text-[11px] font-mono text-slate-400 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg mb-6">
              Steer: ← → / A D · Turbo: Spacebar / Shift
            </div>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              Hit the Highway
            </button>
          </div>
        )}

        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
            <h3 className="text-3xl font-extrabold text-white mb-1">VEHICLE TOTALED</h3>
            <p className="text-xs text-slate-400 mb-4">Highway distance: {score}m</p>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Drive Again
            </button>
          </div>
        )}
      </div>

      {/* Mobile controls */}
      <div className="flex md:hidden items-center justify-between p-3 bg-slate-900 border-t border-slate-800">
        <div className="flex gap-2">
          <button
            onTouchStart={() => { stateRef.current.keys.left = true; }}
            onTouchEnd={() => { stateRef.current.keys.left = false; }}
            className="w-16 py-3 bg-slate-800 rounded-lg text-cyan-400 font-bold active:bg-cyan-600 active:text-white"
          >
            ←
          </button>
          <button
            onTouchStart={() => { stateRef.current.keys.right = true; }}
            onTouchEnd={() => { stateRef.current.keys.right = false; }}
            className="w-16 py-3 bg-slate-800 rounded-lg text-cyan-400 font-bold active:bg-cyan-600 active:text-white"
          >
            →
          </button>
        </div>
        <button
          onTouchStart={() => { stateRef.current.keys.boost = true; }}
          onTouchEnd={() => { stateRef.current.keys.boost = false; }}
          className="px-6 py-3 bg-cyan-500 text-slate-950 font-bold rounded-lg active:bg-cyan-400"
        >
          NITRO [SPACE]
        </button>
      </div>
    </div>
  );
};
