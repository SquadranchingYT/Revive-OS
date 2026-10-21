import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Shield, Zap, DollarSign, Crosshair } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface Turret {
  x: number;
  y: number;
  type: 'laser' | 'plasma' | 'cryo';
  range: number;
  damage: number;
  fireCooldown: number;
  lastFired: number;
  level: number;
}

interface Creep {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  pathIndex: number;
  color: string;
}

interface Projectile {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  damage: number;
  color: string;
  isCryo: boolean;
}

const PATH: [number, number][] = [
  [0, 100], [180, 100], [180, 260], [360, 260], [360, 120], [520, 120], [520, 380], [600, 380]
];

export const TowerDefenseGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'GAMEOVER'>('MENU');
  const [credits, setCredits] = useState(250);
  const [coreHp, setCoreHp] = useState(20);
  const [wave, setWave] = useState(1);
  const [selectedTurretType, setSelectedTurretType] = useState<'laser' | 'plasma' | 'cryo'>('laser');

  const stateRef = useRef({
    turrets: [] as Turret[],
    creeps: [] as Creep[],
    projectiles: [] as Projectile[],
    wave: 1,
    credits: 250,
    coreHp: 20,
    creepsToSpawn: 12,
    spawnTimer: 0
  });

  const TURRET_SPECS = {
    laser: { name: 'Pulse Laser', cost: 100, range: 110, damage: 15, cd: 250, color: '#06b6d4' },
    plasma: { name: 'Plasma Cannon', cost: 180, range: 140, damage: 45, cd: 750, color: '#f59e0b' },
    cryo: { name: 'Cryo Freezer', cost: 130, range: 90, damage: 8, cd: 400, color: '#38bdf8' }
  };

  const startGame = () => {
    sounds.playClick();
    const st = stateRef.current;
    st.turrets = [];
    st.creeps = [];
    st.projectiles = [];
    st.wave = 1;
    st.credits = 250;
    st.coreHp = 20;
    st.creepsToSpawn = 10;
    st.spawnTimer = 0;
    setCredits(250);
    setCoreHp(20);
    setWave(1);
    setGameState('PLAYING');
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState !== 'PLAYING' || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Check distance to path (cannot place on path)
    for (let i = 0; i < PATH.length - 1; i++) {
      const [p1x, p1y] = PATH[i];
      const [p2x, p2y] = PATH[i + 1];
      // simplified line dist check
      const minX = Math.min(p1x, p2x) - 22;
      const maxX = Math.max(p1x, p2x) + 22;
      const minY = Math.min(p1y, p2y) - 22;
      const maxY = Math.max(p1y, p2y) + 22;
      if (clickX >= minX && clickX <= maxX && clickY >= minY && clickY <= maxY) {
        sounds.playBlip(250, 'sine', 0.05);
        return; // on path
      }
    }

    // Check if space occupied
    const occupied = stateRef.current.turrets.some(t => Math.hypot(t.x - clickX, t.y - clickY) < 32);
    if (occupied) return;

    const spec = TURRET_SPECS[selectedTurretType];
    if (stateRef.current.credits < spec.cost) {
      sounds.playBlip(220, 'sine', 0.08);
      return;
    }

    sounds.playBlip(580, 'triangle', 0.06);
    stateRef.current.credits -= spec.cost;
    setCredits(stateRef.current.credits);

    stateRef.current.turrets.push({
      x: clickX,
      y: clickY,
      type: selectedTurretType,
      range: spec.range,
      damage: spec.damage,
      fireCooldown: spec.cd,
      lastFired: 0,
      level: 1
    });
  };

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

      // Draw Pathway
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 36;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(PATH[0][0], PATH[0][1]);
      for (let i = 1; i < PATH.length; i++) ctx.lineTo(PATH[i][0], PATH[i][1]);
      ctx.stroke();

      // Pathway center neon guide
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (gameState === 'PLAYING') {
        st.spawnTimer++;

        // Spawn creeps
        if (st.spawnTimer % 45 === 0 && st.creepsToSpawn > 0) {
          st.creepsToSpawn--;
          const baseHp = 50 + st.wave * 25;
          st.creeps.push({
            x: PATH[0][0],
            y: PATH[0][1],
            hp: baseHp,
            maxHp: baseHp,
            speed: 1.4 + st.wave * 0.08,
            pathIndex: 0,
            color: '#f43f5e'
          });
        }

        // Wave progression
        if (st.creepsToSpawn === 0 && st.creeps.length === 0) {
          sounds.playScore();
          st.wave++;
          st.creepsToSpawn = 10 + st.wave * 3;
          st.credits += 80 + st.wave * 20;
          setWave(st.wave);
          setCredits(st.credits);
        }

        // Update creeps
        for (let i = st.creeps.length - 1; i >= 0; i--) {
          const c = st.creeps[i];
          const targetPoint = PATH[c.pathIndex + 1];

          if (!targetPoint) {
            // Reached core
            sounds.playGameOver();
            st.coreHp -= 2;
            setCoreHp(st.coreHp);
            st.creeps.splice(i, 1);
            if (st.coreHp <= 0) {
              setGameState('GAMEOVER');
            }
            continue;
          }

          const dx = targetPoint[0] - c.x;
          const dy = targetPoint[1] - c.y;
          const dist = Math.hypot(dx, dy);

          if (dist < c.speed) {
            c.pathIndex++;
          } else {
            c.x += (dx / dist) * c.speed;
            c.y += (dy / dist) * c.speed;
          }
        }

        // Turret targeting & shooting
        const now = Date.now();
        for (const t of st.turrets) {
          if (now - t.lastFired > t.fireCooldown) {
            // Find closest creep in range
            let closestCreep: Creep | null = null;
            let closestDist = Infinity;

            for (const c of st.creeps) {
              const d = Math.hypot(c.x - t.x, c.y - t.y);
              if (d <= t.range && d < closestDist) {
                closestDist = d;
                closestCreep = c;
              }
            }

            if (closestCreep) {
              t.lastFired = now;
              sounds.playLaser();
              st.projectiles.push({
                x: t.x,
                y: t.y,
                targetX: closestCreep.x,
                targetY: closestCreep.y,
                speed: 8,
                damage: t.damage,
                color: TURRET_SPECS[t.type].color,
                isCryo: t.type === 'cryo'
              });
            }
          }
        }

        // Update Projectiles
        for (let i = st.projectiles.length - 1; i >= 0; i--) {
          const p = st.projectiles[i];
          const dx = p.targetX - p.x;
          const dy = p.targetY - p.y;
          const dist = Math.hypot(dx, dy);

          if (dist < p.speed) {
            // Hit!
            st.projectiles.splice(i, 1);
            // Damage nearby creeps
            for (let j = st.creeps.length - 1; j >= 0; j--) {
              const c = st.creeps[j];
              if (Math.hypot(c.x - p.targetX, c.y - p.targetY) < 24) {
                c.hp -= p.damage;
                if (p.isCryo) c.speed = Math.max(0.6, c.speed * 0.7);

                if (c.hp <= 0) {
                  sounds.playBlip(720, 'triangle', 0.04);
                  st.credits += 15;
                  setCredits(st.credits);
                  st.creeps.splice(j, 1);
                }
              }
            }
          } else {
            p.x += (dx / dist) * p.speed;
            p.y += (dy / dist) * p.speed;
          }
        }
      }

      // Draw Turrets
      for (const t of st.turrets) {
        ctx.save();
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = TURRET_SPECS[t.type].color;
        ctx.lineWidth = 2;
        ctx.shadowColor = TURRET_SPECS[t.type].color;
        ctx.shadowBlur = 8;

        ctx.beginPath();
        ctx.arc(t.x, t.y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = TURRET_SPECS[t.type].color;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw Creeps
      for (const c of st.creeps) {
        ctx.save();
        ctx.fillStyle = c.color;
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 10, 0, Math.PI * 2);
        ctx.fill();

        // Health bar
        const barW = 20;
        const hpPercent = Math.max(0, c.hp / c.maxHp);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(c.x - barW / 2, c.y - 16, barW, 4);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(c.x - barW / 2, c.y - 16, barW * hpPercent, 4);
        ctx.restore();
      }

      // Draw Projectiles
      for (const p of st.projectiles) {
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Command Core (Destination)
      const last = PATH[PATH.length - 1];
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(last[0], last[1], 18, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, selectedTurretType]);

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none font-sans">
      {/* Top HUD */}
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm z-10">
        <span className="text-sm font-bold tracking-wider text-cyan-400">CYBER TURRET DEFENSE</span>
        <div className="flex items-center gap-6 text-xs font-mono">
          <span className="text-amber-400">CREDITS: <strong className="text-white text-sm tabular-nums">${credits}</strong></span>
          <span className="text-cyan-400">WAVE: <strong className="text-white text-sm tabular-nums">{wave}</strong></span>
          <span className="text-rose-400">CORE INTEGRITY: <strong className="text-white text-sm tabular-nums">{coreHp}/20</strong></span>
        </div>
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center p-3">
        <canvas
          ref={canvasRef}
          width={600}
          height={420}
          onClick={handleCanvasClick}
          className="border border-slate-800 rounded-xl shadow-2xl block aspect-[600/420] max-w-full max-h-full cursor-crosshair bg-slate-950"
        />

        {/* Turret Selection Store bar */}
        <div className="mt-3 flex items-center gap-3">
          {(['laser', 'plasma', 'cryo'] as const).map(type => {
            const spec = TURRET_SPECS[type];
            const active = selectedTurretType === type;
            return (
              <button
                key={type}
                onClick={() => {
                  sounds.playBlip(500, 'sine', 0.02);
                  setSelectedTurretType(type);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                  active
                    ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: spec.color }} />
                <span>{spec.name}</span>
                <span className="font-mono text-amber-400">${spec.cost}</span>
              </button>
            );
          })}
        </div>

        {gameState === 'MENU' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <h2 className="text-3xl font-extrabold text-white mb-2">CYBER TURRET DEFENSE</h2>
            <p className="text-xs text-slate-300 max-w-xs mb-6">
              Place pulse lasers and plasma cannons off the road to annihilate invading creep waves.
            </p>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              Deploy Defenses
            </button>
          </div>
        )}

        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
            <h3 className="text-3xl font-extrabold text-white mb-1">COMMAND CORE COMPROMISED</h3>
            <p className="text-xs text-slate-400 mb-4">Surviving waves: {wave - 1}</p>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Rebuild Defenses
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
