import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Heart } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface Asteroid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  size: 'large' | 'medium' | 'small';
  vertices: { angle: number; dist: number }[];
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

export const AsteroidsGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'GAMEOVER'>('MENU');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('revive_asteroids_high') || '0', 10);
  });

  const stateRef = useRef({
    shipX: 300,
    shipY: 250,
    shipVx: 0,
    shipVy: 0,
    shipAngle: -Math.PI / 2,
    bullets: [] as Bullet[],
    asteroids: [] as Asteroid[],
    keys: { left: false, right: false, thrust: false, shoot: false },
    lastShootTime: 0
  });

  const createAsteroid = (x: number, y: number, size: 'large' | 'medium' | 'small'): Asteroid => {
    const radius = size === 'large' ? 36 : size === 'medium' ? 22 : 12;
    const speed = size === 'large' ? 1.2 : size === 'medium' ? 2 : 2.8;
    const moveAngle = Math.random() * Math.PI * 2;
    const numVerts = 8 + Math.floor(Math.random() * 4);
    const vertices = [];
    for (let i = 0; i < numVerts; i++) {
      const angle = (i / numVerts) * Math.PI * 2;
      const dist = radius * (0.8 + Math.random() * 0.4);
      vertices.push({ angle, dist });
    }
    return {
      x,
      y,
      vx: Math.cos(moveAngle) * speed,
      vy: Math.sin(moveAngle) * speed,
      radius,
      size,
      vertices
    };
  };

  const initAsteroids = () => {
    const list: Asteroid[] = [];
    for (let i = 0; i < 5; i++) {
      let x = Math.random() * 600;
      let y = Math.random() * 500;
      // Keep away from center spawn
      if (Math.abs(x - 300) < 80) x += 120;
      if (Math.abs(y - 250) < 80) y += 120;
      list.push(createAsteroid(x, y, 'large'));
    }
    stateRef.current.asteroids = list;
  };

  const startGame = () => {
    sounds.playClick();
    const st = stateRef.current;
    st.shipX = 300;
    st.shipY = 250;
    st.shipVx = 0;
    st.shipVy = 0;
    st.shipAngle = -Math.PI / 2;
    st.bullets = [];
    setScore(0);
    setLives(3);
    initAsteroids();
    setGameState('PLAYING');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') stateRef.current.keys.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') stateRef.current.keys.right = true;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') stateRef.current.keys.thrust = true;
      if (e.code === 'Space') {
        e.preventDefault();
        stateRef.current.keys.shoot = true;
        if (gameState !== 'PLAYING') startGame();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') stateRef.current.keys.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') stateRef.current.keys.right = false;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') stateRef.current.keys.thrust = false;
      if (e.code === 'Space') stateRef.current.keys.shoot = false;
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

      // Dark void
      ctx.fillStyle = '#040714';
      ctx.fillRect(0, 0, w, h);

      if (gameState === 'PLAYING') {
        // Ship rotation
        if (st.keys.left) st.shipAngle -= 0.08;
        if (st.keys.right) st.shipAngle += 0.08;

        // Thrust
        if (st.keys.thrust) {
          st.shipVx += Math.cos(st.shipAngle) * 0.16;
          st.shipVy += Math.sin(st.shipAngle) * 0.16;
        }

        // Friction
        st.shipVx *= 0.985;
        st.shipVy *= 0.985;
        st.shipX += st.shipVx;
        st.shipY += st.shipVy;

        // Screen wrap
        if (st.shipX < 0) st.shipX = w;
        if (st.shipX > w) st.shipX = 0;
        if (st.shipY < 0) st.shipY = h;
        if (st.shipY > h) st.shipY = 0;

        // Shoot
        const now = Date.now();
        if (st.keys.shoot && now - st.lastShootTime > 200) {
          sounds.playLaser();
          st.lastShootTime = now;
          st.bullets.push({
            x: st.shipX + Math.cos(st.shipAngle) * 16,
            y: st.shipY + Math.sin(st.shipAngle) * 16,
            vx: Math.cos(st.shipAngle) * 8 + st.shipVx * 0.4,
            vy: Math.sin(st.shipAngle) * 8 + st.shipVy * 0.4,
            life: 55
          });
        }

        // Bullets update
        for (let i = st.bullets.length - 1; i >= 0; i--) {
          const b = st.bullets[i];
          b.x += b.vx;
          b.y += b.vy;
          b.life--;

          if (b.x < 0) b.x = w;
          if (b.x > w) b.x = 0;
          if (b.y < 0) b.y = h;
          if (b.y > h) b.y = 0;

          if (b.life <= 0) {
            st.bullets.splice(i, 1);
            continue;
          }

          // Bullet hits Asteroid
          for (let j = st.asteroids.length - 1; j >= 0; j--) {
            const ast = st.asteroids[j];
            const dist = Math.hypot(b.x - ast.x, b.y - ast.y);
            if (dist < ast.radius) {
              sounds.playExplosion();
              st.bullets.splice(i, 1);

              // Split asteroid
              if (ast.size === 'large') {
                st.asteroids.push(createAsteroid(ast.x, ast.y, 'medium'));
                st.asteroids.push(createAsteroid(ast.x, ast.y, 'medium'));
                setScore(s => s + 20);
              } else if (ast.size === 'medium') {
                st.asteroids.push(createAsteroid(ast.x, ast.y, 'small'));
                st.asteroids.push(createAsteroid(ast.x, ast.y, 'small'));
                setScore(s => s + 50);
              } else {
                setScore(s => s + 100);
              }
              st.asteroids.splice(j, 1);
              break;
            }
          }
        }

        // Asteroids update & ship collision
        for (const ast of st.asteroids) {
          ast.x += ast.vx;
          ast.y += ast.vy;

          if (ast.x < -ast.radius) ast.x = w + ast.radius;
          if (ast.x > w + ast.radius) ast.x = -ast.radius;
          if (ast.y < -ast.radius) ast.y = h + ast.radius;
          if (ast.y > h + ast.radius) ast.y = -ast.radius;

          // Ship collision
          const distToShip = Math.hypot(st.shipX - ast.x, st.shipY - ast.y);
          if (distToShip < ast.radius + 10) {
            sounds.playGameOver();
            setLives(l => {
              if (l <= 1) {
                triggerGameOver();
                return 0;
              }
              st.shipX = 300;
              st.shipY = 250;
              st.shipVx = 0;
              st.shipVy = 0;
              return l - 1;
            });
          }
        }

        // Respawn wave if all asteroids cleared
        if (st.asteroids.length === 0) {
          sounds.playScore();
          initAsteroids();
        }
      }

      // Draw Asteroids
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 6;
      for (const ast of st.asteroids) {
        ctx.beginPath();
        for (let i = 0; i < ast.vertices.length; i++) {
          const v = ast.vertices[i];
          const vx = ast.x + Math.cos(v.angle) * v.dist;
          const vy = ast.y + Math.sin(v.angle) * v.dist;
          if (i === 0) ctx.moveTo(vx, vy);
          else ctx.lineTo(vx, vy);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // Draw Bullets
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 8;
      for (const b of st.bullets) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Vector Ship
      ctx.save();
      ctx.translate(st.shipX, st.shipY);
      ctx.rotate(st.shipAngle);

      ctx.strokeStyle = '#22d3ee';
      ctx.fillStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.moveTo(16, 0);
      ctx.lineTo(-12, -10);
      ctx.lineTo(-7, 0);
      ctx.lineTo(-12, 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Thrust flame
      if (st.keys.thrust) {
        ctx.strokeStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(-8, -4);
        ctx.lineTo(-18 - Math.random() * 8, 0);
        ctx.lineTo(-8, 4);
        ctx.stroke();
      }
      ctx.restore();

      animId = requestAnimationFrame(gameLoop);
    };

    const triggerGameOver = () => {
      setScore(s => {
        if (s > highScore) {
          setHighScore(s);
          localStorage.setItem('revive_asteroids_high', s.toString());
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
        <span className="text-sm font-bold tracking-wider text-cyan-400">VECTOR ASTEROIDS 360</span>
        <div className="flex items-center gap-6 text-xs font-mono">
          <span>SCORE: <strong className="text-white text-sm tabular-nums">{score}</strong></span>
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
          height={500}
          className="border border-slate-800 rounded-xl shadow-2xl block aspect-[600/500] max-w-full max-h-full"
        />

        {gameState === 'MENU' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <h2 className="text-3xl font-extrabold text-white mb-2">VECTOR ASTEROIDS</h2>
            <p className="text-xs text-slate-300 max-w-xs mb-6">
              Rotate, thrust forward, and blast cosmic asteroid clusters with 360° inertia navigation.
            </p>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              Launch Vessel
            </button>
          </div>
        )}

        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
            <h3 className="text-3xl font-extrabold text-white mb-1">SHIP DESTROYED</h3>
            <p className="text-xs text-slate-400 mb-4">Total score: {score} points</p>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Relaunch Vessel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
