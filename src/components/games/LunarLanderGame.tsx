import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Fuel, Shield, Award, Gauge } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface TerrainPoint {
  x: number;
  y: number;
}

interface LandingPad {
  x1: number;
  x2: number;
  y: number;
  multiplier: number;
}

export const LunarLanderGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameStateStatus, setGameStateStatus] = useState<'playing' | 'landed' | 'crashed'>('playing');
  const [score, setScore] = useState(0);
  const [fuel, setFuel] = useState(1000);
  const [horizontalSpeed, setHorizontalSpeed] = useState(0);
  const [verticalSpeed, setVerticalSpeed] = useState(0);
  const [altitude, setAltitude] = useState(0);

  const state = useRef({
    x: 100,
    y: 60,
    vx: 1.0,
    vy: 0,
    angle: 0,
    fuel: 1000,
    thrusting: false,
    rotatingLeft: false,
    rotatingRight: false,
    terrain: [] as TerrainPoint[],
    pads: [] as LandingPad[],
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string }[]
  });

  const generateTerrain = () => {
    const points: TerrainPoint[] = [];
    const pads: LandingPad[] = [];
    const width = 600;
    const height = 400;

    let currX = 0;
    let currY = 320 + Math.random() * 40;
    points.push({ x: 0, y: currY });

    // Insert 2 landing pads
    const pad1X = 140 + Math.random() * 80;
    const pad2X = 360 + Math.random() * 80;

    while (currX < width) {
      // Check if near pad 1
      if (Math.abs(currX - pad1X) < 30) {
        const padY = 330;
        points.push({ x: pad1X, y: padY });
        points.push({ x: pad1X + 60, y: padY });
        pads.push({ x1: pad1X, x2: pad1X + 60, y: padY, multiplier: 3 });
        currX = pad1X + 65;
        currY = padY;
        continue;
      }
      // Check if near pad 2
      if (Math.abs(currX - pad2X) < 30) {
        const padY = 340;
        points.push({ x: pad2X, y: padY });
        points.push({ x: pad2X + 80, y: padY });
        pads.push({ x1: pad2X, x2: pad2X + 80, y: padY, multiplier: 2 });
        currX = pad2X + 85;
        currY = padY;
        continue;
      }

      currX += 25 + Math.random() * 30;
      currY = 240 + Math.sin(currX * 0.02) * 50 + Math.random() * 40;
      points.push({ x: Math.min(currX, width), y: currY });
    }

    state.current.terrain = points;
    state.current.pads = pads;
  };

  const startRound = (retainScore = false) => {
    if (!retainScore) setScore(0);
    const s = state.current;
    s.x = 80 + Math.random() * 100;
    s.y = 50;
    s.vx = 0.8 + Math.random() * 0.5;
    s.vy = 0;
    s.angle = 0;
    s.fuel = 1000;
    s.particles = [];
    setFuel(1000);
    generateTerrain();
    setGameStateStatus('playing');
    setIsPlaying(true);
    sounds.playStart();
  };

  useEffect(() => {
    startRound();
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
        e.preventDefault();
        state.current.thrusting = true;
      }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        state.current.rotatingLeft = true;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        state.current.rotatingRight = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
        state.current.thrusting = false;
      }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        state.current.rotatingLeft = false;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        state.current.rotatingRight = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main game loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gravity = 0.024;
    const thrustPower = 0.055;
    const rotationSpeed = 0.04;

    const loop = () => {
      const s = state.current;

      if (isPlaying && gameStateStatus === 'playing') {
        // Rotation
        if (s.rotatingLeft) s.angle -= rotationSpeed;
        if (s.rotatingRight) s.angle += rotationSpeed;

        // Thrust
        if (s.thrusting && s.fuel > 0) {
          s.vx += Math.sin(s.angle) * thrustPower;
          s.vy -= Math.cos(s.angle) * thrustPower;
          s.fuel = Math.max(0, s.fuel - 1.5);
          setFuel(Math.floor(s.fuel));

          // Thrust exhaust flame particles
          const exhaustX = s.x - Math.sin(s.angle) * 12;
          const exhaustY = s.y + Math.cos(s.angle) * 12;
          for (let i = 0; i < 3; i++) {
            s.particles.push({
              x: exhaustX + (Math.random() - 0.5) * 4,
              y: exhaustY + (Math.random() - 0.5) * 4,
              vx: -Math.sin(s.angle) * (2 + Math.random() * 2) + (Math.random() - 0.5),
              vy: Math.cos(s.angle) * (2 + Math.random() * 2) + (Math.random() - 0.5),
              life: 14,
              color: Math.random() > 0.4 ? '#f59e0b' : '#ef4444'
            });
          }
        }

        s.vy += gravity;
        s.x += s.vx;
        s.y += s.vy;

        setHorizontalSpeed(Math.abs(s.vx * 10));
        setVerticalSpeed(Math.abs(s.vy * 10));
        setAltitude(Math.max(0, Math.floor(400 - s.y)));

        // Screen boundary wrap or clamp
        if (s.x < 10) {
          s.x = 10;
          s.vx = -s.vx * 0.5;
        }
        if (s.x > 590) {
          s.x = 590;
          s.vx = -s.vx * 0.5;
        }

        // Collision detection with landing pads and terrain
        let padContact: LandingPad | null = null;
        for (const pad of s.pads) {
          if (s.x >= pad.x1 && s.x <= pad.x2 && s.y + 12 >= pad.y) {
            padContact = pad;
            break;
          }
        }

        if (padContact) {
          // Check landing safety tolerances
          const speedSafe = Math.abs(s.vx) < 0.6 && Math.abs(s.vy) < 1.2;
          const angleSafe = Math.abs(s.angle) < 0.25;

          if (speedSafe && angleSafe) {
            // Touchdown success!
            sounds.playScore();
            const earned = Math.floor(padContact.multiplier * 500 + s.fuel * 0.5);
            setScore(sc => sc + earned);
            setGameStateStatus('landed');
          } else {
            // Crash landing on pad
            sounds.playGameOver();
            setGameStateStatus('crashed');
            triggerExplosion(s.x, s.y);
          }
        } else {
          // Check collision with rough terrain
          for (let i = 0; i < s.terrain.length - 1; i++) {
            const p1 = s.terrain[i];
            const p2 = s.terrain[i + 1];
            if (s.x >= p1.x && s.x <= p2.x) {
              const t = (s.x - p1.x) / (p2.x - p1.x);
              const groundY = p1.y + t * (p2.y - p1.y);
              if (s.y + 12 >= groundY) {
                // Crash into crater!
                sounds.playGameOver();
                setGameStateStatus('crashed');
                triggerExplosion(s.x, s.y);
                break;
              }
            }
          }
        }
      }

      // Render
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, 600, 400);

      // Starfield
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 35; i++) {
        const sx = ((i * 73) % 600);
        const sy = ((i * 47) % 250);
        ctx.fillRect(sx, sy, 1, 1);
      }

      // Draw Lunar Terrain
      if (s.terrain.length > 0) {
        ctx.beginPath();
        ctx.moveTo(0, 400);
        ctx.lineTo(s.terrain[0].x, s.terrain[0].y);
        for (let i = 1; i < s.terrain.length; i++) {
          ctx.lineTo(s.terrain[i].x, s.terrain[i].y);
        }
        ctx.lineTo(600, 400);
        ctx.closePath();
        ctx.fillStyle = '#0f172a';
        ctx.fill();

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Landing pads
        s.pads.forEach(pad => {
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 4;
          ctx.shadowColor = '#22c55e';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.moveTo(pad.x1, pad.y);
          ctx.lineTo(pad.x2, pad.y);
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Pad text multiplier
          ctx.fillStyle = '#22c55e';
          ctx.font = '10px monospace';
          ctx.fillText(`${pad.multiplier}X ZONE`, pad.x1 + 8, pad.y + 16);
        });
      }

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
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.life * 0.25), 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Lander
      if (gameStateStatus !== 'crashed') {
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);

        // Lander cabin
        ctx.fillStyle = '#e2e8f0';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-8, -10, 16, 12, 3);
        ctx.fill();
        ctx.stroke();

        // Glass visor
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.arc(0, -4, 3, 0, Math.PI * 2);
        ctx.fill();

        // Legs & footpads
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-6, 2);
        ctx.lineTo(-12, 12);
        ctx.moveTo(6, 2);
        ctx.lineTo(12, 12);
        ctx.stroke();

        // Footpad dots
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(-14, 11, 4, 2);
        ctx.fillRect(10, 11, 4, 2);

        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    const triggerExplosion = (x: number, y: number) => {
      for (let i = 0; i < 30; i++) {
        state.current.particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          life: 25,
          color: Math.random() > 0.5 ? '#f43f5e' : '#f59e0b'
        });
      }
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, gameStateStatus]);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none overflow-hidden">
      {/* Top Telemetry Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/80 text-xs font-mono">
        <div className="flex items-center gap-4">
          <span className="font-bold text-cyan-400">GRAVITY LANDER</span>
          <div className="flex items-center gap-1.5">
            <Fuel className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">FUEL:</span>
            <span className={`font-bold ${fuel < 200 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`}>
              {fuel}
            </span>
          </div>
          <div>
            <span className="text-slate-400">H-SPD: </span>
            <span className={horizontalSpeed > 6 ? 'text-rose-400' : 'text-emerald-400'}>
              {horizontalSpeed.toFixed(1)}
            </span>
          </div>
          <div>
            <span className="text-slate-400">V-SPD: </span>
            <span className={verticalSpeed > 12 ? 'text-rose-400' : 'text-emerald-400'}>
              {verticalSpeed.toFixed(1)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <span className="text-slate-500 mr-1">SCORE:</span>
            <span className="text-white font-bold">{score.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="relative flex-1 flex items-center justify-center p-2 bg-slate-950">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="rounded-xl border border-slate-800 shadow-2xl max-h-[80vh] w-full max-w-[600px] object-contain"
        />

        {/* Modal Overlay for Landed / Crashed */}
        {gameStateStatus !== 'playing' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            {gameStateStatus === 'landed' ? (
              <>
                <Award className="w-12 h-12 text-emerald-400 mb-2 animate-bounce" />
                <h2 className="text-2xl font-black text-white">EAGLE HAS LANDED!</h2>
                <p className="text-sm text-slate-300 mt-1">
                  Perfect touchdown on target pad! Fuel preserved bonus added.
                </p>
                <button
                  onClick={() => startRound(true)}
                  className="mt-5 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" /> NEXT SECTOR
                </button>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-black text-rose-500 tracking-wide">HULL BREACH - CRASHED</h2>
                <p className="text-xs text-slate-400 mt-2 max-w-xs">
                  Descent speed or tilt exceeded safety thresholds upon contact with the terrain.
                </p>
                <button
                  onClick={() => startRound(false)}
                  className="mt-5 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" /> RETRY MISSION
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer Controls Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-slate-800 bg-slate-900/90 text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 font-mono">W / ↑ / Space</kbd> Main Thruster</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono">A / D / ← / →</kbd> Rotate RCS</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onPointerDown={() => (state.current.rotatingLeft = true)}
            onPointerUp={() => (state.current.rotatingLeft = false)}
            className="px-2.5 py-1 rounded bg-slate-800 active:bg-cyan-600 text-white font-bold"
          >
            ←
          </button>
          <button
            onPointerDown={() => (state.current.thrusting = true)}
            onPointerUp={() => (state.current.thrusting = false)}
            className="px-3 py-1 rounded bg-amber-600 active:bg-amber-400 text-slate-950 font-bold"
          >
            THRUST
          </button>
          <button
            onPointerDown={() => (state.current.rotatingRight = true)}
            onPointerUp={() => (state.current.rotatingRight = false)}
            className="px-2.5 py-1 rounded bg-slate-800 active:bg-cyan-600 text-white font-bold"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};
