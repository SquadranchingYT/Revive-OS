import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Heart, Shield, Zap } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface Bullet {
  x: number;
  y: number;
  vy: number;
  isEnemy: boolean;
  color: string;
}

interface Enemy {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 1 | 2 | 3;
  alive: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export const SpaceDefenderGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'GAMEOVER' | 'VICTORY'>('MENU');
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('revive_space_high') || '0', 10);
  });

  const stateRef = useRef({
    playerX: 300,
    playerY: 450,
    playerVx: 0,
    tripleShot: 0,
    bullets: [] as Bullet[],
    enemies: [] as Enemy[],
    enemyDir: 1,
    enemyStepDown: false,
    enemySpeed: 1,
    particles: [] as Particle[],
    keys: { left: false, right: false, shoot: false },
    lastShootTime: 0
  });

  const initWave = (waveNum: number) => {
    const enemies: Enemy[] = [];
    const rows = 4;
    const cols = 8;
    const startX = 60;
    const startY = 70;
    const spacingX = 55;
    const spacingY = 40;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        enemies.push({
          x: startX + c * spacingX,
          y: startY + r * spacingY,
          width: 32,
          height: 22,
          type: r === 0 ? 1 : r < 2 ? 2 : 3,
          alive: true
        });
      }
    }
    stateRef.current.enemies = enemies;
    stateRef.current.enemyDir = 1;
    stateRef.current.enemySpeed = 1 + waveNum * 0.35;
    stateRef.current.bullets = [];
  };

  const startGame = () => {
    sounds.playClick();
    setScore(0);
    setWave(1);
    setLives(3);
    stateRef.current.playerX = 300;
    stateRef.current.tripleShot = 0;
    initWave(1);
    setGameState('PLAYING');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') stateRef.current.keys.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') stateRef.current.keys.right = true;
      if (e.code === 'Space') {
        stateRef.current.keys.shoot = true;
        if (gameState !== 'PLAYING') startGame();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') stateRef.current.keys.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') stateRef.current.keys.right = false;
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
      const width = canvas.width;
      const height = canvas.height;

      // Deep space background
      ctx.fillStyle = '#050814';
      ctx.fillRect(0, 0, width, height);

      // Starfield twinkle
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 40; i++) {
        const sx = (i * 97) % width;
        const sy = (i * 133 + (Date.now() * 0.05)) % height;
        ctx.fillRect(sx, sy, (i % 3) + 1, (i % 3) + 1);
      }

      if (gameState === 'PLAYING') {
        // Player move
        if (st.keys.left) st.playerVx = -6;
        else if (st.keys.right) st.playerVx = 6;
        else st.playerVx *= 0.8;
        st.playerX = Math.max(25, Math.min(width - 25, st.playerX + st.playerVx));

        // Player shooting
        const now = Date.now();
        if (st.keys.shoot && now - st.lastShootTime > 240) {
          sounds.playLaser();
          st.lastShootTime = now;
          if (st.tripleShot > 0) {
            st.bullets.push({ x: st.playerX - 12, y: height - 60, vy: -9, isEnemy: false, color: '#38bdf8' });
            st.bullets.push({ x: st.playerX, y: height - 65, vy: -9, isEnemy: false, color: '#06b6d4' });
            st.bullets.push({ x: st.playerX + 12, y: height - 60, vy: -9, isEnemy: false, color: '#38bdf8' });
            st.tripleShot--;
          } else {
            st.bullets.push({ x: st.playerX, y: height - 65, vy: -9, isEnemy: false, color: '#06b6d4' });
          }
        }

        // Enemy movement
        let hitEdge = false;
        const aliveEnemies = st.enemies.filter(e => e.alive);

        if (aliveEnemies.length === 0) {
          // Wave cleared!
          sounds.playScore();
          const nextWave = wave + 1;
          setWave(nextWave);
          st.tripleShot += 20;
          initWave(nextWave);
          return;
        }

        for (const e of aliveEnemies) {
          if ((st.enemyDir === 1 && e.x + e.width >= width - 15) || (st.enemyDir === -1 && e.x <= 15)) {
            hitEdge = true;
          }
        }

        if (hitEdge) {
          st.enemyDir = -st.enemyDir;
          for (const e of aliveEnemies) {
            e.y += 18;
            if (e.y >= height - 100) {
              // Enemies reached base
              triggerGameOver();
              return;
            }
          }
        } else {
          for (const e of aliveEnemies) {
            e.x += st.enemyDir * st.enemySpeed;
          }
        }

        // Enemy shooting
        if (Math.random() < 0.035 && aliveEnemies.length > 0) {
          const shooter = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
          st.bullets.push({
            x: shooter.x + shooter.width / 2,
            y: shooter.y + shooter.height,
            vy: 4 + wave * 0.4,
            isEnemy: true,
            color: '#f43f5e'
          });
        }

        // Bullets update & collisions
        for (let i = st.bullets.length - 1; i >= 0; i--) {
          const b = st.bullets[i];
          b.y += b.vy;

          if (b.y < -10 || b.y > height + 10) {
            st.bullets.splice(i, 1);
            continue;
          }

          if (!b.isEnemy) {
            // Player bullet hits enemy
            for (const enemy of aliveEnemies) {
              if (
                b.x >= enemy.x &&
                b.x <= enemy.x + enemy.width &&
                b.y >= enemy.y &&
                b.y <= enemy.y + enemy.height
              ) {
                enemy.alive = false;
                st.bullets.splice(i, 1);
                sounds.playExplosion();
                createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#38bdf8');
                const pts = enemy.type === 1 ? 30 : enemy.type === 2 ? 20 : 10;
                setScore(s => s + pts);
                break;
              }
            }
          } else {
            // Enemy bullet hits player
            if (Math.abs(b.x - st.playerX) < 18 && b.y >= height - 60 && b.y <= height - 30) {
              st.bullets.splice(i, 1);
              sounds.playGameOver();
              createParticles(st.playerX, height - 45, '#f43f5e');
              setLives(l => {
                if (l <= 1) {
                  triggerGameOver();
                  return 0;
                }
                return l - 1;
              });
            }
          }
        }

        // Particles update
        for (let i = st.particles.length - 1; i >= 0; i--) {
          const p = st.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.04;
          if (p.life <= 0) st.particles.splice(i, 1);
        }
      }

      // Draw Enemies
      for (const enemy of st.enemies) {
        if (!enemy.alive) continue;
        ctx.fillStyle = enemy.type === 1 ? '#a855f7' : enemy.type === 2 ? '#06b6d4' : '#10b981';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 8;

        // Custom alien sprite shape
        ctx.beginPath();
        ctx.roundRect(enemy.x, enemy.y, enemy.width, enemy.height, 4);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(enemy.x + 6, enemy.y + 6, 4, 4);
        ctx.fillRect(enemy.x + enemy.width - 10, enemy.y + 6, 4, 4);
      }

      // Draw Bullets
      for (const b of st.bullets) {
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.roundRect(b.x - 2, b.y, 4, 12, 2);
        ctx.fill();
      }

      // Draw Particles
      for (const p of st.particles) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(p.x, p.y, 3, 3);
        ctx.globalAlpha = 1.0;
      }

      // Draw Player Fighter Ship
      const px = st.playerX;
      const py = height - 50;
      ctx.save();
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 14;

      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.moveTo(px, py - 20);
      ctx.lineTo(px - 18, py + 12);
      ctx.lineTo(px - 6, py + 6);
      ctx.lineTo(px + 6, py + 6);
      ctx.lineTo(px + 18, py + 12);
      ctx.closePath();
      ctx.fill();

      // Cockpit glow
      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath();
      ctx.arc(px, py - 4, 4, 0, Math.PI * 2);
      ctx.fill();

      // Engine flame
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(px - 4, py + 6);
      ctx.lineTo(px, py + 15 + Math.random() * 5);
      ctx.lineTo(px + 4, py + 6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      animId = requestAnimationFrame(gameLoop);
    };

    const createParticles = (x: number, y: number, color: string) => {
      for (let i = 0; i < 14; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = 1 + Math.random() * 3.5;
        stateRef.current.particles.push({
          x,
          y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          life: 1.0,
          color
        });
      }
    };

    const triggerGameOver = () => {
      sounds.playGameOver();
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('revive_space_high', score.toString());
      }
      setGameState('GAMEOVER');
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, score, wave, highScore]);

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Top HUD */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-6">
          <span className="text-sm font-bold tracking-wider text-cyan-400">GALACTIC INVADERS</span>
          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span>SCORE: <strong className="text-white text-sm tabular-nums">{score}</strong></span>
            <span>·</span>
            <span>WAVE: <strong className="text-cyan-300 text-sm tabular-nums">{wave}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 ${i < lives ? 'text-rose-500 fill-rose-500' : 'text-slate-700'}`}
              />
            ))}
          </div>
          <span className="text-xs font-mono text-amber-400">BEST: <strong className="text-white tabular-nums">{highScore}</strong></span>
        </div>
      </div>

      {/* Game Canvas */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={640}
          height={500}
          className="max-w-full max-h-full aspect-[640/500] border border-slate-800 rounded-lg shadow-2xl block"
        />

        {gameState === 'MENU' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <h2 className="text-4xl font-extrabold tracking-tight text-white mb-2 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]">
              GALACTIC INVADERS
            </h2>
            <p className="text-slate-300 text-sm max-w-md mb-6 leading-relaxed">
              Defend the perimeter against encroaching alien fleets. Destroy invaders, dodge plasma bombardment, and set high-score records.
            </p>

            <div className="flex items-center gap-4 mb-6 text-xs text-slate-400 font-mono bg-slate-900/90 border border-slate-700/80 px-4 py-2 rounded-lg">
              <span>Move: <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-cyan-300">←</kbd> <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-cyan-300">→</kbd></span>
              <span>·</span>
              <span>Fire: <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-cyan-300">Space</kbd></span>
            </div>

            <button
              onClick={startGame}
              className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-lg transition-all shadow-[0_0_25px_rgba(6,182,212,0.5)] active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              Engage Fleet
            </button>
          </div>
        )}

        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
            <h3 className="text-3xl font-extrabold text-white mb-1">MOTHERSHIP BREACHED</h3>
            <p className="text-slate-400 text-sm mb-6">Fighter squad defenses collapsed at Wave {wave}</p>

            <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-6 text-left">
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
                <div className="text-xs text-slate-400">FINAL SCORE</div>
                <div className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">{score}</div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
                <div className="text-xs text-slate-400">HIGH SCORE</div>
                <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">{highScore}</div>
              </div>
            </div>

            <button
              onClick={startGame}
              className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-lg transition-all shadow-[0_0_25px_rgba(6,182,212,0.5)] active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Re-engage Fleet
            </button>
          </div>
        )}
      </div>

      {/* On-screen controls for mobile/tablet */}
      <div className="flex md:hidden items-center justify-between p-3 bg-slate-900/90 border-t border-slate-800">
        <div className="flex gap-2">
          <button
            onTouchStart={() => { stateRef.current.keys.left = true; }}
            onTouchEnd={() => { stateRef.current.keys.left = false; }}
            className="w-16 py-2.5 bg-slate-800 rounded-lg text-cyan-400 font-bold active:bg-cyan-600 active:text-white"
          >
            ←
          </button>
          <button
            onTouchStart={() => { stateRef.current.keys.right = true; }}
            onTouchEnd={() => { stateRef.current.keys.right = false; }}
            className="w-16 py-2.5 bg-slate-800 rounded-lg text-cyan-400 font-bold active:bg-cyan-600 active:text-white"
          >
            →
          </button>
        </div>

        <button
          onTouchStart={() => { stateRef.current.keys.shoot = true; }}
          onTouchEnd={() => { stateRef.current.keys.shoot = false; }}
          className="px-6 py-2.5 bg-cyan-500 text-slate-950 font-bold rounded-lg active:bg-cyan-400"
        >
          FIRE
        </button>
      </div>
    </div>
  );
};
