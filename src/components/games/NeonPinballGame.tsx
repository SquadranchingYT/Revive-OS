import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, RotateCcw, Volume2, ShieldAlert, Award } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface Bumper {
  x: number;
  y: number;
  radius: number;
  score: number;
  color: string;
  glowColor: string;
  lit: number;
}

interface Flipper {
  x: number;
  y: number;
  length: number;
  baseAngle: number;
  currentAngle: number;
  targetAngle: number;
  active: boolean;
  isLeft: boolean;
}

export const NeonPinballGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('revive_pinball_hi') || '15400', 10);
  });
  const [ballsLeft, setBallsLeft] = useState(3);
  const [multiplier, setMultiplier] = useState(1);
  const [comboMessage, setComboMessage] = useState<string | null>(null);

  const gameState = useRef({
    ball: { x: 380, y: 520, vx: 0, vy: 0, radius: 7 } as Ball,
    inPlunger: true,
    plungerPull: 0,
    isPullingPlunger: false,
    leftFlipper: {
      x: 130,
      y: 540,
      length: 62,
      baseAngle: 0.45,
      currentAngle: 0.45,
      targetAngle: 0.45,
      active: false,
      isLeft: true
    } as Flipper,
    rightFlipper: {
      x: 270,
      y: 540,
      length: 62,
      baseAngle: Math.PI - 0.45,
      currentAngle: Math.PI - 0.45,
      targetAngle: Math.PI - 0.45,
      active: false,
      isLeft: false
    } as Flipper,
    bumpers: [
      { x: 200, y: 150, radius: 26, score: 250, color: '#06b6d4', glowColor: 'rgba(6, 182, 212, 0.8)', lit: 0 },
      { x: 130, y: 220, radius: 22, score: 150, color: '#ec4899', glowColor: 'rgba(236, 72, 153, 0.8)', lit: 0 },
      { x: 270, y: 220, radius: 22, score: 150, color: '#ec4899', glowColor: 'rgba(236, 72, 153, 0.8)', lit: 0 },
      { x: 200, y: 310, radius: 20, score: 300, color: '#f59e0b', glowColor: 'rgba(245, 158, 11, 0.8)', lit: 0 },
    ] as Bumper[],
    particles: [] as { x: number; y: number; vx: number; vy: number; color: string; life: number }[],
    targets: [
      { x: 60, y: 140, hit: false },
      { x: 60, y: 180, hit: false },
      { x: 60, y: 220, hit: false },
      { x: 340, y: 140, hit: false },
      { x: 340, y: 180, hit: false },
      { x: 340, y: 220, hit: false },
    ],
    gravity: 0.18,
    friction: 0.994
  });

  const showCombo = (msg: string) => {
    setComboMessage(msg);
    setTimeout(() => setComboMessage(null), 1200);
  };

  const resetBall = () => {
    const s = gameState.current;
    s.ball.x = 380;
    s.ball.y = 510;
    s.ball.vx = 0;
    s.ball.vy = 0;
    s.inPlunger = true;
    s.plungerPull = 0;
  };

  const launchGame = () => {
    setScore(0);
    setBallsLeft(3);
    setMultiplier(1);
    setIsGameOver(false);
    setIsPlaying(true);
    resetBall();
    sounds.playStart();
  };

  const firePlunger = () => {
    const s = gameState.current;
    if (s.inPlunger) {
      s.ball.vy = -12 - Math.random() * 2;
      s.ball.vx = -1;
      s.inPlunger = false;
      s.plungerPull = 0;
      sounds.playScore();
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        gameState.current.leftFlipper.active = true;
        sounds.playClick();
      }
      if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        gameState.current.rightFlipper.active = true;
        sounds.playClick();
      }
      if (e.code === 'Space' || e.code === 'ArrowDown') {
        e.preventDefault();
        if (gameState.current.inPlunger) {
          firePlunger();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        gameState.current.leftFlipper.active = false;
      }
      if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        gameState.current.rightFlipper.active = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main Canvas animation loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      const s = gameState.current;
      const b = s.ball;

      // Update flippers
      const upAngleLeft = -0.45;
      const downAngleLeft = 0.45;
      s.leftFlipper.targetAngle = s.leftFlipper.active ? upAngleLeft : downAngleLeft;
      s.leftFlipper.currentAngle += (s.leftFlipper.targetAngle - s.leftFlipper.currentAngle) * 0.35;

      const upAngleRight = Math.PI - (-0.45);
      const downAngleRight = Math.PI - 0.45;
      s.rightFlipper.targetAngle = s.rightFlipper.active ? upAngleRight : downAngleRight;
      s.rightFlipper.currentAngle += (s.rightFlipper.targetAngle - s.rightFlipper.currentAngle) * 0.35;

      if (isPlaying && !isGameOver) {
        if (!s.inPlunger) {
          b.vy += s.gravity;
          b.vx *= s.friction;
          b.vy *= s.friction;

          b.x += b.vx;
          b.y += b.vy;

          // Side wall collisions
          if (b.x < 35 + b.radius) {
            b.x = 35 + b.radius;
            b.vx = -b.vx * 0.8;
            sounds.playClick();
          }
          // Plunger lane wall
          if (b.x > 365 - b.radius && b.y > 180) {
            b.x = 365 - b.radius;
            b.vx = -b.vx * 0.8;
          }
          if (b.x > 395 - b.radius) {
            b.x = 395 - b.radius;
            b.vx = -b.vx * 0.8;
          }

          // Top arch collision
          if (b.y < 35 + b.radius) {
            b.y = 35 + b.radius;
            b.vy = -b.vy * 0.8;
            // Guide gently into playfield
            b.vx -= 1.5;
            sounds.playClick();
          }

          // Bumpers collision
          s.bumpers.forEach(bm => {
            const dx = b.x - bm.x;
            const dy = b.y - bm.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < b.radius + bm.radius) {
              const nx = dx / dist;
              const ny = dy / dist;
              const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
              const bounceSpeed = Math.max(speed, 6.5) * 1.25;
              b.vx = nx * bounceSpeed;
              b.vy = ny * bounceSpeed;
              bm.lit = 10;

              // Spark particles
              for (let i = 0; i < 8; i++) {
                s.particles.push({
                  x: bm.x + nx * bm.radius,
                  y: bm.y + ny * bm.radius,
                  vx: (Math.random() - 0.5) * 4 + nx * 2,
                  vy: (Math.random() - 0.5) * 4 + ny * 2,
                  color: bm.color,
                  life: 18
                });
              }

              const pts = bm.score * multiplier;
              setScore(sc => {
                const ns = sc + pts;
                if (ns > highScore) {
                  setHighScore(ns);
                  localStorage.setItem('revive_pinball_hi', ns.toString());
                }
                return ns;
              });
              sounds.playScore();
            }
          });

          // Side targets
          s.targets.forEach(tg => {
            if (!tg.hit && Math.abs(b.x - tg.x) < 12 && Math.abs(b.y - tg.y) < 16) {
              tg.hit = true;
              b.vx = -b.vx * 1.1;
              sounds.playClick();
              setScore(sc => sc + 350 * multiplier);

              // Check if all hit
              if (s.targets.every(t => t.hit)) {
                setMultiplier(m => m + 1);
                showCombo('WARP DRIVE MULTIPLIER x' + (multiplier + 1));
                s.targets.forEach(t => (t.hit = false));
              }
            }
          });

          // Flipper collision detection
          const checkFlipper = (f: Flipper) => {
            const tipX = f.x + Math.cos(f.currentAngle) * f.length;
            const tipY = f.y + Math.sin(f.currentAngle) * f.length;

            const dx = tipX - f.x;
            const dy = tipY - f.y;
            const lenSq = dx * dx + dy * dy;

            const t = Math.max(0, Math.min(1, ((b.x - f.x) * dx + (b.y - f.y) * dy) / lenSq));
            const projX = f.x + t * dx;
            const projY = f.y + t * dy;

            const distSq = (b.x - projX) * (b.x - projX) + (b.y - projY) * (b.y - projY);
            if (distSq < (b.radius + 6) * (b.radius + 6)) {
              // Collision with flipper!
              const angle = f.currentAngle - Math.PI / 2;
              const fSpeed = f.active ? 14 : 4;
              b.vx = Math.cos(angle) * fSpeed + (f.isLeft ? 2 : -2);
              b.vy = Math.sin(angle) * fSpeed - 4;
              b.y = projY - b.radius - 2;
              sounds.playClick();

              // Little particles
              for (let i = 0; i < 4; i++) {
                s.particles.push({
                  x: projX,
                  y: projY,
                  vx: (Math.random() - 0.5) * 3,
                  vy: -Math.random() * 4,
                  color: '#38bdf8',
                  life: 12
                });
              }
            }
          };

          checkFlipper(s.leftFlipper);
          checkFlipper(s.rightFlipper);

          // Slingshots (triangular bounce blocks above flippers)
          // Left slingshot
          if (b.x > 60 && b.x < 110 && b.y > 440 && b.y < 500) {
            b.vx = 6;
            b.vy = -6;
            sounds.playScore();
          }
          // Right slingshot
          if (b.x > 290 && b.x < 340 && b.y > 440 && b.y < 500) {
            b.vx = -6;
            b.vy = -6;
            sounds.playScore();
          }

          // Ball drain detection (fell below flippers)
          if (b.y > 610) {
            sounds.playGameOver();
            if (ballsLeft > 1) {
              setBallsLeft(bl => bl - 1);
              resetBall();
            } else {
              setBallsLeft(0);
              setIsGameOver(true);
            }
          }
        }
      }

      // Draw everything
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, 420, 600);

      // Cyber grid background pattern
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 420; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 600);
        ctx.stroke();
      }
      for (let y = 0; y < 600; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(420, y);
        ctx.stroke();
      }

      // Playfield outer borders
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;

      // Outer arch
      ctx.beginPath();
      ctx.moveTo(35, 600);
      ctx.lineTo(35, 120);
      ctx.arc(200, 120, 165, Math.PI, 0);
      ctx.lineTo(365, 600);
      ctx.stroke();

      // Plunger chute line
      ctx.beginPath();
      ctx.moveTo(365, 180);
      ctx.lineTo(365, 600);
      ctx.lineTo(395, 600);
      ctx.lineTo(395, 120);
      ctx.stroke();

      // Inlane / Outlane wire guides
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 4;
      // Left guides
      ctx.beginPath();
      ctx.moveTo(85, 450);
      ctx.lineTo(130, 540);
      ctx.stroke();
      // Right guides
      ctx.beginPath();
      ctx.moveTo(315, 450);
      ctx.lineTo(270, 540);
      ctx.stroke();

      // Center galaxy nebula vortex
      const grad = ctx.createRadialGradient(200, 240, 5, 200, 240, 90);
      grad.addColorStop(0, 'rgba(168, 85, 247, 0.35)');
      grad.addColorStop(0.6, 'rgba(59, 130, 246, 0.15)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(200, 240, 90, 0, Math.PI * 2);
      ctx.fill();

      // Targets
      s.targets.forEach(tg => {
        ctx.fillStyle = tg.hit ? '#334155' : '#e11d48';
        ctx.shadowColor = tg.hit ? 'transparent' : '#f43f5e';
        ctx.shadowBlur = tg.hit ? 0 : 8;
        ctx.fillRect(tg.x - 4, tg.y - 10, 8, 20);
      });

      // Bumpers
      s.bumpers.forEach(bm => {
        if (bm.lit > 0) bm.lit--;
        ctx.shadowColor = bm.glowColor;
        ctx.shadowBlur = bm.lit > 0 ? 25 : 12;

        ctx.fillStyle = bm.lit > 0 ? '#ffffff' : bm.color;
        ctx.beginPath();
        ctx.arc(bm.x, bm.y, bm.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner ring
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(bm.x, bm.y, bm.radius * 0.55, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Flippers
      const drawFlipper = (f: Flipper) => {
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.currentAngle);

        ctx.shadowColor = f.active ? '#38bdf8' : '#0284c7';
        ctx.shadowBlur = f.active ? 15 : 6;
        ctx.fillStyle = f.active ? '#38bdf8' : '#0ea5e9';

        ctx.beginPath();
        ctx.roundRect(0, -6, f.length, 12, [6, 3, 3, 6]);
        ctx.fill();

        // Pivot cap
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      };

      drawFlipper(s.leftFlipper);
      drawFlipper(s.rightFlipper);

      // Particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) {
          s.particles.splice(i, 1);
          continue;
        }
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.life * 0.2), 0, Math.PI * 2);
        ctx.fill();
      }

      // Ball
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 10;
      const bGrad = ctx.createRadialGradient(b.x - 2, b.y - 2, 1, b.x, b.y, b.radius);
      bGrad.addColorStop(0, '#ffffff');
      bGrad.addColorStop(0.7, '#cbd5e1');
      bGrad.addColorStop(1, '#475569');
      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();

      // Plunger spring graphic
      if (s.inPlunger) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(380, 540);
        ctx.lineTo(380, 580);
        ctx.stroke();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isGameOver, multiplier, highScore, ballsLeft]);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/80">
        <div className="flex items-center gap-3">
          <span className="font-bold text-cyan-400 font-mono tracking-wider">COSMIC PINBALL FX</span>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <span>BALLS:</span>
            {Array.from({ length: 3 }).map((_, i) => (
              <span
                key={i}
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  i < ballsLeft ? 'bg-cyan-400 shadow-[0_0_8px_#38bdf8]' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
          {multiplier > 1 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse">
              {multiplier}X WARP
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-500 mr-1">SCORE:</span>
            <span className="text-white font-bold text-sm">{score.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-500 mr-1">BEST:</span>
            <span className="text-amber-400 font-bold">{highScore.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Main Game Stage */}
      <div className="relative flex-1 flex items-center justify-center p-2 bg-gradient-to-b from-slate-950 to-slate-900">
        <canvas
          ref={canvasRef}
          width={420}
          height={600}
          className="rounded-xl border border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.25)] max-h-[82vh] object-contain"
        />

        {/* Combo Toast Banner */}
        {comboMessage && (
          <div className="absolute top-10 px-4 py-1.5 rounded-lg bg-amber-500/90 text-slate-950 font-black text-sm tracking-wide shadow-xl animate-bounce">
            {comboMessage}
          </div>
        )}

        {/* Start / Game Over Overlay */}
        {(!isPlaying || isGameOver) && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            {isGameOver ? (
              <>
                <Award className="w-12 h-12 text-rose-500 mb-2 animate-bounce" />
                <h2 className="text-2xl font-black text-white tracking-wide">GAME OVER</h2>
                <p className="text-sm text-slate-300 mt-1">
                  Final Score: <span className="text-cyan-400 font-mono font-bold">{score.toLocaleString()}</span>
                </p>
                {score >= highScore && score > 0 && (
                  <p className="text-xs text-amber-400 font-bold mt-1">NEW HIGH RECORD!</p>
                )}
                <button
                  onClick={launchGame}
                  className="mt-5 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" /> PLAY AGAIN
                </button>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 mb-3 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                  <Play className="w-7 h-7 fill-current ml-0.5" />
                </div>
                <h2 className="text-2xl font-black tracking-wide text-white">COSMIC PINBALL FX</h2>
                <p className="text-xs text-slate-400 max-w-xs mt-2">
                  Launch the silver ball into hyperspace, trigger luminous bumper cascades, and rack up cosmic score multipliers!
                </p>
                <button
                  onClick={launchGame}
                  className="mt-5 px-7 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" /> LAUNCH BALL
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer Controls Help & Touch buttons */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-slate-800 bg-slate-900/90 text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono">A / ←</kbd> Left Flipper</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono">D / →</kbd> Right Flipper</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 font-mono">Space</kbd> Plunger</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Quick On-Screen Touch Controls */}
          <button
            onPointerDown={() => {
              gameState.current.leftFlipper.active = true;
              sounds.playClick();
            }}
            onPointerUp={() => (gameState.current.leftFlipper.active = false)}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 text-white font-bold"
          >
            FLIP L
          </button>
          <button
            onClick={firePlunger}
            className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 active:bg-amber-400 text-slate-950 font-bold"
          >
            PULL
          </button>
          <button
            onPointerDown={() => {
              gameState.current.rightFlipper.active = true;
              sounds.playClick();
            }}
            onPointerUp={() => (gameState.current.rightFlipper.active = false)}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 text-white font-bold"
          >
            FLIP R
          </button>
        </div>
      </div>
    </div>
  );
};
