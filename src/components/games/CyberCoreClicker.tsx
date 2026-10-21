import React, { useState, useEffect } from 'react';
import { Sparkles, Cpu, Zap, Activity, ShieldCheck, Database, Atom, Award } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';
import { clickerImg } from '../../data/gamesList';

interface Building {
  id: string;
  name: string;
  baseCost: number;
  cost: number;
  eps: number; // energy per second
  count: number;
  icon: string;
}

export const CyberCoreClicker: React.FC = () => {
  const [energy, setEnergy] = useState(() => {
    return parseFloat(localStorage.getItem('revive_clicker_energy') || '0');
  });
  const [clickPower, setClickPower] = useState(() => {
    return parseFloat(localStorage.getItem('revive_clicker_power') || '1');
  });
  const [totalClicks, setTotalClicks] = useState(0);
  const [floatingTexts, setFloatingTexts] = useState<{ id: number; x: number; y: number; text: string }[]>([]);

  const [buildings, setBuildings] = useState<Building[]>(() => {
    const saved = localStorage.getItem('revive_clicker_buildings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [
      { id: 'drone', name: 'Micro Harvester', baseCost: 15, cost: 15, eps: 1, count: 0, icon: '🛰️' },
      { id: 'quantum_rig', name: 'Quantum Mining Rig', baseCost: 100, cost: 100, eps: 8, count: 0, icon: '⚡' },
      { id: 'fusion_server', name: 'Fusion Server Cluster', baseCost: 1100, cost: 1100, eps: 50, count: 0, icon: '💻' },
      { id: 'subatomic', name: 'Subatomic Collider', baseCost: 12000, cost: 12000, eps: 320, count: 0, icon: '⚛️' },
      { id: 'dyson_ring', name: 'Dyson Orbital Ring', baseCost: 130000, cost: 130000, eps: 2100, count: 0, icon: '🪐' }
    ];
  });

  const eps = buildings.reduce((acc, b) => acc + b.count * b.eps, 0);

  // Core energy generation tick (10 times per second for smooth visual counter)
  useEffect(() => {
    const interval = setInterval(() => {
      if (eps > 0) {
        setEnergy(prev => {
          const next = prev + eps / 10;
          return next;
        });
      }
    }, 100);
    return () => clearInterval(interval);
  }, [eps]);

  // Periodic autosave
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem('revive_clicker_energy', energy.toString());
      localStorage.setItem('revive_clicker_power', clickPower.toString());
      localStorage.setItem('revive_clicker_buildings', JSON.stringify(buildings));
    }, 3000);
    return () => clearInterval(interval);
  }, [energy, clickPower, buildings]);

  const handleCoreClick = (e: React.MouseEvent<HTMLDivElement>) => {
    sounds.playBlip(550, 'triangle', 0.04);
    setEnergy(prev => prev + clickPower);
    setTotalClicks(prev => prev + 1);

    // Floating text feedback
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now() + Math.random();
    setFloatingTexts(prev => [...prev, { id, x, y, text: `+${clickPower} J` }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(item => item.id !== id));
    }, 700);
  };

  const buyBuilding = (id: string) => {
    const b = buildings.find(item => item.id === id);
    if (!b || energy < b.cost) return;

    sounds.playBlip(720, 'sine', 0.06);
    setEnergy(prev => prev - b.cost);
    setBuildings(prev =>
      prev.map(item => {
        if (item.id === id) {
          const nextCount = item.count + 1;
          const nextCost = Math.floor(item.baseCost * Math.pow(1.15, nextCount));
          return { ...item, count: nextCount, cost: nextCost };
        }
        return item;
      })
    );
  };

  const upgradeClickPower = () => {
    const cost = Math.floor(50 * Math.pow(1.6, clickPower));
    if (energy < cost) return;

    sounds.playScore();
    setEnergy(prev => prev - cost);
    setClickPower(prev => prev + 1);
  };

  const clickUpgradeCost = Math.floor(50 * Math.pow(1.6, clickPower));

  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col md:flex-row overflow-hidden select-none font-sans">
      {/* Left Column: Quantum Reactor Core */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-slate-800 bg-gradient-to-b from-slate-900/60 to-slate-950/80">
        <div className="text-center mb-6">
          <div className="text-xs font-mono text-cyan-400 tracking-wider uppercase mb-1">Quantum Energy Output</div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tabular-nums drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]">
            {Math.floor(energy).toLocaleString()} <span className="text-xl text-cyan-300 font-sans">Joules</span>
          </div>
          <div className="text-xs text-slate-400 font-mono mt-1">
            Production: <strong className="text-emerald-400">+{eps.toLocaleString()} J/s</strong> · Tap: <strong className="text-cyan-400">+{clickPower} J</strong>
          </div>
        </div>

        {/* Reactor Core Orb */}
        <div
          onClick={handleCoreClick}
          className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full cursor-pointer transition-transform active:scale-95 group"
        >
          {/* Animated Glow Rings */}
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/40 animate-ping opacity-25" style={{ animationDuration: '3s' }} />
          <div className="absolute -inset-2 rounded-full border border-cyan-400/30 animate-spin opacity-50" style={{ animationDuration: '12s' }} />

          {/* Core sphere art */}
          <div className="w-full h-full rounded-full overflow-hidden border-2 border-cyan-400/80 shadow-[0_0_40px_rgba(6,182,212,0.6)] relative">
            <img
              src={clickerImg}
              alt="Quantum Reactor Core"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-cyan-500/10 mix-blend-screen pointer-events-none" />
          </div>

          {/* Floating energy text */}
          {floatingTexts.map(f => (
            <div
              key={f.id}
              style={{ left: f.x, top: f.y }}
              className="absolute pointer-events-none text-sm font-bold font-mono text-cyan-300 drop-shadow-[0_0_8px_#22d3ee] animate-out fade-out slide-out-to-top duration-700"
            >
              {f.text}
            </div>
          ))}
        </div>

        {/* Click Power Upgrade Button */}
        <div className="mt-8">
          <button
            onClick={upgradeClickPower}
            disabled={energy < clickUpgradeCost}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 hover:border-cyan-400 disabled:opacity-40 rounded-xl text-xs font-semibold text-slate-200 transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Overclock Core (+1/tap)</span>
            <span className="text-amber-400 font-mono">[{clickUpgradeCost.toLocaleString()} J]</span>
          </button>
        </div>
      </div>

      {/* Right Column: Automated Facilities Store */}
      <div className="w-full md:w-80 lg:w-96 p-4 flex flex-col bg-slate-950 overflow-y-auto">
        <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 px-1">
          Automated Power Infrastructure
        </div>

        <div className="space-y-2 flex-1">
          {buildings.map(b => {
            const canAfford = energy >= b.cost;

            return (
              <button
                key={b.id}
                onClick={() => buyBuilding(b.id)}
                disabled={!canAfford}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  canAfford
                    ? 'bg-slate-900/90 border-slate-800 hover:border-cyan-500/60 hover:bg-slate-800/80 shadow-xs'
                    : 'bg-slate-950 border-slate-900 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{b.icon}</div>
                  <div>
                    <div className="text-xs font-bold text-white">{b.name}</div>
                    <div className="text-[11px] text-emerald-400 font-mono">+{b.eps} J/sec</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold font-mono text-cyan-300 tabular-nums">
                    {b.cost.toLocaleString()} J
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">Owned: {b.count}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
