import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Target, Wind, Award, Crosshair } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface Arrow {
  x: number;
  y: number;
  vx: number;
  vy: number;
  inFlight: boolean;
  stuck: boolean;
  score: number;
}

export const CyberArcheryGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [arrowsLeft, setArrowsLeft] = useState(10);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('revive_archery_hi') || '78', 10);
  });
  const [wind, setWind] = useState(1.5);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawPower, setDrawPower] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [lastHitText, setLastHitText] = useState<string | null>(null);

  const state = useRef({
    bowX: 80,
    bowY: 250,
    aimAngle: 0,
    power: 0,
    isDrawing: false,
    wind: 1.2,
    arrows: [] as Arrow[],
    targetX: 520,
    targetY: 220,
    targetVy: 1.2,
    particles: [] as { x: number; y: number; vx: number; vy: number; color: string; life: number }[]
  });

  const startNewGame = () => {
    setArrowsLeft(10);
    setScore(0);
    setIsGameOver(false);
    setLastHitText(null);
    state.current.arrows = [];
    state.current.particles = [];
    const newWind = Number(((Math.random() - 0.5) * 5).toFixed(1));
    state.current.wind = newWind;
    setWind(newWind);
    sounds.playStart();
  };

  useEffect(() => {
    startNewGame();
  }, []);

  // Pointer aiming and shooting
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (arrowsLeft <= 0 || isGameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 600;
    const py = ((e.clientY - rect.top) / rect.height) * 400;

    const dx = px - state.current.bowX;
    const dy = py - state.current.bowY;
    state.current.aimAngle = Math.atan2(dy, dx);
    state.current.isDrawing = true;
    state.current.power = 0;
    setIsDrawing(true);
    setDrawPower(0);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!state.current.isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 600;
    const py = ((e.clientY - rect.top) / rect.height) * 400;

    const dx = px - state.current.bowX;
    const dy = py - state.current.bowY;
    state.current.aimAngle = Math.atan2(dy, dx);
  };

  const handlePointerUp = () => {
    if (!state.current.isDrawing) return;
    state.current.isDrawing = false;
    setIsDrawing(false);

    // Release arrow
    const p = Math.max(0.2, state.current.power);
    const speed = p * 18;
    const arrow: Arrow = {
      x: state.current.bowX,
      y: state.current.bowY,
      vx: Math.cos(state.current.aimAngle) * speed,
      vy: Math.sin(state.current.aimAngle) * speed,
      inFlight: true,
      stuck: false,
      score: 0
    };

    state.current.arrows.push(arrow);
    sounds.playClick();
    setArrowsLeft(al => al - 1);

    // Change wind
    const newWind = Number(((Math.random() - 0.5) * 6).toFixed(1));
    state.current.wind = newWind;
    setWind(newWind);
  };

  // Canvas render and physics loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      const s = state.current;

      // Draw power increase
      if (s.isDrawing && s.power < 1.0) {
        s.power = Math.min(1.0, s.power + 0.02);
        setDrawPower(Math.floor(s.power * 100));
      }

      // Target floating oscillation
      s.targetY += s.targetVy;
      if (s.targetY > 320 || s.targetY < 120) {
        s.targetVy = -s.targetVy;
      }

      // Arrows physics
      s.arrows.forEach(a => {
        if (a.inFlight) {
          a.vx += (s.wind * 0.015);
          a.vy += 0.22; // gravity
          a.x += a.vx;
          a.y += a.vy;

          // Check target collision
          if (a.x >= s.targetX - 10 && a.x <= s.targetX + 15) {
            const dy = Math.abs(a.y - s.targetY);
            if (dy <= 55) {
              a.inFlight = false;
              a.stuck = true;

              let pts = 2;
              let label = 'OUTER WHITE +2';
              let color = '#ffffff';

              if (dy <= 10) {
                pts = 10;
                label = 'PERFECT BULLSEYE +10!';
                color = '#eab308';
                sounds.playScore();
              } else if (dy <= 22) {
                pts = 8;
                label = 'RED RING +8';
                color = '#ef4444';
                sounds.playScore();
              } else if (dy <= 35) {
                pts = 6;
                label = 'BLUE RING +6';
                color = '#3b82f6';
                sounds.playClick();
              } else if (dy <= 45) {
                pts = 4;
                label = 'BLACK RING +4';
                color = '#475569';
                sounds.playClick();
              }

              a.score = pts;
              setScore(sc => {
                const ns = sc + pts;
                if (ns > highScore) {
                  setHighScore(ns);
                  localStorage.setItem('revive_archery_hi', ns.toString());
                }
                return ns;
              });

              setLastHitText(label);
              setTimeout(() => setLastHitText(null), 1200);

              // Sparks
              for (let i = 0; i < 15; i++) {
                s.particles.push({
                  x: a.x,
                  y: a.y,
                  vx: (Math.random() - 0.5) * 5,
                  vy: (Math.random() - 0.5) * 5,
                  color,
                  life: 18
                });
              }

              // Check if last arrow
              if (s.arrows.length >= 10 && !s.arrows.some(ar => ar.inFlight)) {
                setTimeout(() => setIsGameOver(true), 600);
              }
            }
          }

          // Ground / Missed collision
          if (a.y > 390 || a.x > 620) {
            a.inFlight = false;
            if (s.arrows.length >= 10 && !s.arrows.some(ar => ar.inFlight)) {
              setTimeout(() => setIsGameOver(true), 600);
            }
          }
        }
      });

      // Clear Canvas
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, 600, 400);

      // Cyber grass & sky grid
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      for (let x = 0; x < 600; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 400);
        ctx.stroke();
      }

      // Ground plane
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 370, 600, 30);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 370);
      ctx.lineTo(600, 370);
      ctx.stroke();

      // Draw Archery Target
      const tx = s.targetX;
      const ty = s.targetY;

      // Target Stand
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx - 15, 370);
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx + 15, 370);
      ctx.stroke();

      // Rings (Outer to Inner)
      const rings = [
        { r: 55, color: '#f8fafc', border: '#cbd5e1' }, // White
        { r: 45, color: '#1e293b', border: '#475569' }, // Black
        { r: 35, color: '#2563eb', border: '#60a5fa' }, // Blue
        { r: 22, color: '#dc2626', border: '#f87171' }, // Red
        { r: 10, color: '#eab308', border: '#fde047' }, // Yellow Bullseye
      ];

      rings.forEach(ring => {
        ctx.fillStyle = ring.color;
        ctx.strokeStyle = ring.border;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(tx, ty, 8, ring.r, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      // Draw Arrows
      s.arrows.forEach(a => {
        ctx.save();
        ctx.translate(a.x, a.y);
        const angle = a.inFlight ? Math.atan2(a.vy, a.vx) : 0;
        ctx.rotate(angle);

        // Arrow shaft
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-18, 0);
        ctx.lineTo(6, 0);
        ctx.stroke();

        // Arrow tip
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(6, -2);
        ctx.lineTo(10, 0);
        ctx.lineTo(6, 2);
        ctx.closePath();
        ctx.fill();

        // Arrow fletching
        ctx.fillStyle = '#ec4899';
        ctx.fillRect(-18, -3, 5, 2);
        ctx.fillRect(-18, 1, 5, 2);

        ctx.restore();
      });

      // Draw Bow & Archer
      ctx.save();
      ctx.translate(s.bowX, s.bowY);
      ctx.rotate(s.aimAngle);

      // Bow Arc
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(-8, 0, 28, -Math.PI / 2.3, Math.PI / 2.3);
      ctx.stroke();

      // Bow string
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      const pullOffset = s.isDrawing ? -s.power * 16 : 0;
      ctx.beginPath();
      ctx.moveTo(-8, -25);
      ctx.lineTo(-8 + pullOffset, 0);
      ctx.lineTo(-8, 25);
      ctx.stroke();

      // Arrow loaded on bow if drawing
      if (s.isDrawing) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-8 + pullOffset, 0);
        ctx.lineTo(16 + pullOffset, 0);
        ctx.stroke();
      }

      ctx.restore();

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
        ctx.arc(p.x, p.y, Math.max(1, p.life * 0.2), 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [arrowsLeft, highScore]);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/80 text-xs font-mono">
        <div className="flex items-center gap-4">
          <span className="font-bold text-cyan-400 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-cyan-400" /> NEON ARCHERY MASTER
          </span>
          <div className="flex items-center gap-1">
            <span className="text-slate-400">ARROWS:</span>
            <span className="text-white font-bold">{arrowsLeft}/10</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-400">WIND:</span>
            <span className={`font-bold ${wind >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {wind > 0 ? `+${wind} E` : `${wind} W`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <span className="text-slate-500 mr-1">SCORE:</span>
            <span className="text-white font-bold text-sm">{score}</span>
          </div>
          <div>
            <span className="text-slate-500 mr-1">RECORD:</span>
            <span className="text-amber-400 font-bold">{highScore}</span>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative flex-1 flex items-center justify-center p-2 bg-slate-950">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="rounded-xl border border-slate-800 shadow-2xl max-h-[80vh] w-full max-w-[600px] object-contain cursor-crosshair touch-none"
        />

        {/* Live Draw Tension Meter */}
        {isDrawing && (
          <div className="absolute top-6 left-8 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-cyan-500/50 backdrop-blur-md">
            <span className="text-[11px] font-mono text-cyan-400 font-bold">POWER:</span>
            <div className="w-28 h-2.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-rose-500 transition-all duration-75"
                style={{ width: `${drawPower}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-white">{drawPower}%</span>
          </div>
        )}

        {/* Hit Feedback Toast */}
        {lastHitText && (
          <div className="absolute top-6 px-4 py-1.5 rounded-full bg-amber-400 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-amber-400/40 animate-bounce">
            {lastHitText}
          </div>
        )}

        {/* Game Over Modal */}
        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <Award className="w-12 h-12 text-amber-400 mb-2 animate-bounce" />
            <h2 className="text-2xl font-black text-white">ROUND COMPLETE</h2>
            <p className="text-sm text-slate-300 mt-1">
              Final Score: <span className="text-cyan-400 font-mono font-bold text-lg">{score}</span> / 100
            </p>
            {score >= highScore && score > 0 && (
              <p className="text-xs text-amber-400 font-bold mt-1">NEW ARCHERY RECORD!</p>
            )}
            <button
              onClick={startNewGame}
              className="mt-5 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" /> PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Footer Instructions */}
      <div className="px-4 py-2 border-t border-slate-800 bg-slate-900/90 text-center text-[11px] text-slate-400">
        Click and hold to aim and draw bow power. Release to launch arrow into the swaying target!
      </div>
    </div>
  );
};
