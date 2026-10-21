import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, ShieldAlert } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface SlopeRunnerGameProps {
  onScoreUpdate?: (score: number) => void;
}

interface Obstacle {
  x: number; // -1 to 1 (lane coordinate)
  z: number; // distance
  width: number;
  height: number;
  type: 'block' | 'ramp' | 'hazard';
}

export const SlopeRunnerGame: React.FC<SlopeRunnerGameProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'GAMEOVER'>('MENU');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('revive_slope_high') || '0', 10);
  });
  const [speed, setSpeed] = useState(1);

  const stateRef = useRef({
    playerX: 0,
    playerY: 0,
    playerVelX: 0,
    speed: 18,
    distance: 0,
    obstacles: [] as Obstacle[],
    rollAngle: 0,
    keys: { left: false, right: false },
    animationId: 0,
    lastTime: 0
  });

  const startGame = () => {
    sounds.playClick();
    const st = stateRef.current;
    st.playerX = 0;
    st.playerVelX = 0;
    st.speed = 18;
    st.distance = 0;
    st.obstacles = [];
    st.rollAngle = 0;
    setScore(0);
    setGameState('PLAYING');

    // Seed initial obstacles
    for (let i = 1; i < 25; i++) {
      spawnObstacle(i * 120 + 200);
    }
  };

  const spawnObstacle = (z: number) => {
    const lane = (Math.random() - 0.5) * 1.8;
    stateRef.current.obstacles.push({
      x: lane,
      z: z,
      width: 0.45 + Math.random() * 0.35,
      height: 0.8,
      type: 'hazard'
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        stateRef.current.keys.left = true;
      }
      if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        stateRef.current.keys.right = true;
      }
      if (e.code === 'Space' && gameState !== 'PLAYING') {
        startGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        stateRef.current.keys.left = false;
      }
      if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        stateRef.current.keys.right = false;
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

    const gameLoop = (timestamp: number) => {
      const st = stateRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // Clear with dark void gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#030712');
      bgGrad.addColorStop(0.5, '#0b1329');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const fov = 340;
      const horizonY = height * 0.38;
      const centerX = width * 0.5;

      if (gameState === 'PLAYING') {
        // Player movement
        const accel = 0.09;
        if (st.keys.left) st.playerVelX -= accel;
        if (st.keys.right) st.playerVelX += accel;
        st.playerVelX *= 0.88; // friction
        st.playerX += st.playerVelX;

        // Fall off edge check
        if (Math.abs(st.playerX) > 1.35) {
          triggerGameOver();
          return;
        }

        // Advance distance & speed
        st.speed += 0.003;
        st.distance += st.speed;
        st.rollAngle += st.speed * 0.05;
        const currentScore = Math.floor(st.distance / 10);
        setScore(currentScore);
        setSpeed(Math.floor(st.speed));

        // Move obstacles
        for (let i = st.obstacles.length - 1; i >= 0; i--) {
          const obs = st.obstacles[i];
          obs.z -= st.speed;

          // Collision check near player (z between 20 and 80)
          if (obs.z > 20 && obs.z < 85) {
            const overlapX = Math.abs(st.playerX - obs.x);
            if (overlapX < (obs.width / 2 + 0.18)) {
              triggerGameOver();
              return;
            }
          }

          if (obs.z < 0) {
            st.obstacles.splice(i, 1);
            spawnObstacle(2000 + Math.random() * 300);
          }
        }
      }

      // Draw 3D Track Floor
      ctx.save();
      const trackWidthWorld = 2.7;
      const numLines = 16;
      for (let i = 0; i <= numLines; i++) {
        const laneX = -trackWidthWorld / 2 + (trackWidthWorld / numLines) * i;
        const zNear = 35;
        const zFar = 1600;

        const p1x = centerX + ((laneX - st.playerX) * fov) / (zNear * 0.02);
        const p1y = horizonY + fov / (zNear * 0.02);
        const p2x = centerX + ((laneX - st.playerX) * fov) / (zFar * 0.02);
        const p2y = horizonY + fov / (zFar * 0.02);

        ctx.strokeStyle = i === 0 || i === numLines ? '#06b6d4' : 'rgba(56, 189, 248, 0.15)';
        ctx.lineWidth = i === 0 || i === numLines ? 3 : 1;
        ctx.beginPath();
        ctx.moveTo(p1x, p1y);
        ctx.lineTo(p2x, p2y);
        ctx.stroke();
      }

      // Horizontal grid rungs moving
      const offsetZ = (st.distance % 80);
      for (let z = 40; z < 1500; z += 80) {
        const effZ = z - offsetZ;
        if (effZ <= 30) continue;
        const p1x = centerX + ((-trackWidthWorld / 2 - st.playerX) * fov) / (effZ * 0.02);
        const p1y = horizonY + fov / (effZ * 0.02);
        const p2x = centerX + ((trackWidthWorld / 2 - st.playerX) * fov) / (effZ * 0.02);
        const p2y = horizonY + fov / (effZ * 0.02);

        const alpha = Math.max(0, 1 - effZ / 1400);
        ctx.strokeStyle = `rgba(6, 182, 212, ${alpha * 0.4})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(p1x, p1y);
        ctx.lineTo(p2x, p2y);
        ctx.stroke();
      }
      ctx.restore();

      // Draw Obstacles sorted by z descending
      const sortedObstacles = [...st.obstacles].sort((a, b) => b.z - a.z);
      for (const obs of sortedObstacles) {
        if (obs.z < 25 || obs.z > 1600) continue;

        const scale = fov / (obs.z * 0.02);
        const screenX = centerX + ((obs.x - st.playerX) * fov) / (obs.z * 0.02);
        const screenY = horizonY + scale;
        const obsW = (obs.width * scale) / 2;
        const obsH = (obs.height * scale) / 1.5;

        // Glowing red hazard box
        ctx.save();
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = '#fecdd3';
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.roundRect(screenX - obsW / 2, screenY - obsH, obsW, obsH, 4);
        ctx.fill();
        ctx.stroke();

        // 3D Top face
        ctx.fillStyle = '#f87171';
        ctx.beginPath();
        ctx.moveTo(screenX - obsW / 2, screenY - obsH);
        ctx.lineTo(screenX, screenY - obsH - obsH * 0.25);
        ctx.lineTo(screenX + obsW / 2, screenY - obsH);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Draw Player Sphere (Bottom center)
      const playerScreenX = centerX;
      const playerScreenY = height - 90;
      const sphereRadius = 26;

      ctx.save();
      // Neon glow
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 24;

      // Ball gradient
      const sphereGrad = ctx.createRadialGradient(
        playerScreenX - 8,
        playerScreenY - 8,
        4,
        playerScreenX,
        playerScreenY,
        sphereRadius
      );
      sphereGrad.addColorStop(0, '#e0f2fe');
      sphereGrad.addColorStop(0.4, '#38bdf8');
      sphereGrad.addColorStop(1, '#0284c7');

      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(playerScreenX, playerScreenY, sphereRadius, 0, Math.PI * 2);
      ctx.fill();

      // Sphere wireframe rotation lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(
        playerScreenX,
        playerScreenY,
        sphereRadius,
        sphereRadius * Math.abs(Math.sin(st.rollAngle)),
        st.playerVelX * 2,
        0,
        Math.PI * 2
      );
      ctx.stroke();

      // Shadow on floor
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(playerScreenX, playerScreenY + sphereRadius - 2, sphereRadius * 0.9, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      animId = requestAnimationFrame(gameLoop);
    };

    const triggerGameOver = () => {
      sounds.playExplosion();
      sounds.playGameOver();
      const currentScore = Math.floor(stateRef.current.distance / 10);
      if (currentScore > highScore) {
        setHighScore(currentScore);
        localStorage.setItem('revive_slope_high', currentScore.toString());
      }
      setGameState('GAMEOVER');
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, highScore]);

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* HUD Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-6">
          <span className="text-sm font-bold tracking-wider text-cyan-400">SLOPE 3D // CYBER RUN</span>
          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span>DIST: <strong className="text-white text-sm tabular-nums">{score}m</strong></span>
            <span>·</span>
            <span>VELOCITY: <strong className="text-cyan-300 text-sm tabular-nums">{speed} u/s</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-amber-400">BEST: <strong className="text-white tabular-nums">{highScore}m</strong></span>
        </div>
      </div>

      {/* Main 3D Canvas */}
      <div className="relative flex-1 w-full h-full">
        <canvas
          ref={canvasRef}
          width={800}
          height={550}
          className="w-full h-full object-cover block"
        />

        {/* Title / Start Overlay */}
        {gameState === 'MENU' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <h2 className="text-4xl font-extrabold tracking-tight text-white mb-2 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]">
              SLOPE 3D: CYBER RUN
            </h2>
            <p className="text-slate-300 text-sm max-w-md mb-6 leading-relaxed">
              Navigate infinite cyber-space slopes. Tilt your sphere to avoid red laser blocks and prevent falling into the cosmic void.
            </p>

            <div className="flex items-center gap-4 mb-6 text-xs text-slate-400 font-mono bg-slate-900/90 border border-slate-700/80 px-4 py-2 rounded-lg">
              <span>Steer: <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-cyan-300">A</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-cyan-300">D</kbd> or <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-cyan-300">←</kbd> <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-cyan-300">→</kbd></span>
            </div>

            <button
              onClick={startGame}
              className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-lg transition-all shadow-[0_0_25px_rgba(6,182,212,0.5)] active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              Launch Descent
            </button>
          </div>
        )}

        {/* Game Over Modal */}
        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl mb-4">
              <ShieldAlert className="w-10 h-10 text-red-400" />
            </div>

            <h3 className="text-3xl font-extrabold text-white mb-1">RUN TERMINATED</h3>
            <p className="text-slate-400 text-sm mb-6">Sphere disintegrated in the quantum abyss</p>

            <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-6 text-left">
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
                <div className="text-xs text-slate-400">DISTANCE</div>
                <div className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">{score}m</div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
                <div className="text-xs text-slate-400">BEST RECORD</div>
                <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">{highScore}m</div>
              </div>
            </div>

            <button
              onClick={startGame}
              className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-lg transition-all shadow-[0_0_25px_rgba(6,182,212,0.5)] active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Touch / Click Controls for tablets / laptops */}
      <div className="flex md:hidden items-center justify-between p-3 bg-slate-900/90 border-t border-slate-800">
        <button
          onTouchStart={() => { stateRef.current.keys.left = true; }}
          onTouchEnd={() => { stateRef.current.keys.left = false; }}
          onMouseDown={() => { stateRef.current.keys.left = true; }}
          onMouseUp={() => { stateRef.current.keys.left = false; }}
          className="w-24 py-3 bg-slate-800 rounded-lg text-center font-bold text-cyan-400 active:bg-cyan-600 active:text-white"
        >
          ← LEFT
        </button>
        <button
          onTouchStart={() => { stateRef.current.keys.right = true; }}
          onTouchEnd={() => { stateRef.current.keys.right = false; }}
          onMouseDown={() => { stateRef.current.keys.right = true; }}
          onMouseUp={() => { stateRef.current.keys.right = false; }}
          className="w-24 py-3 bg-slate-800 rounded-lg text-center font-bold text-cyan-400 active:bg-cyan-600 active:text-white"
        >
          RIGHT →
        </button>
      </div>
    </div>
  );
};
