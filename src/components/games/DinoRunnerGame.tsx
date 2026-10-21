import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'cactus' | 'bird';
}

export const DinoRunnerGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'GAMEOVER'>('MENU');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('revive_dino_high') || '0', 10);
  });

  const stateRef = useRef({
    dinoY: 0,
    dinoVy: 0,
    isJumping: false,
    isDucking: false,
    speed: 6.5,
    distance: 0,
    obstacles: [] as Obstacle[],
    groundOffset: 0
  });

  const startGame = () => {
    sounds.playClick();
    const st = stateRef.current;
    st.dinoY = 0;
    st.dinoVy = 0;
    st.isJumping = false;
    st.isDucking = false;
    st.speed = 6.5;
    st.distance = 0;
    st.obstacles = [{ x: 500, y: 0, width: 20, height: 40, type: 'cactus' }];
    setScore(0);
    setGameState('PLAYING');
  };

  const jump = () => {
    const st = stateRef.current;
    if (!st.isJumping && gameState === 'PLAYING') {
      st.dinoVy = -13.5;
      st.isJumping = true;
      sounds.playJump();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        if (gameState !== 'PLAYING') startGame();
        else jump();
      }
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        stateRef.current.isDucking = true;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        stateRef.current.isDucking = false;
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
      const groundY = h - 60;

      // Clear Canvas
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, w, h);

      // Starfield / Grid lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(w, groundY);
      ctx.stroke();

      if (gameState === 'PLAYING') {
        // Dino gravity physics
        st.dinoY += st.dinoVy;
        st.dinoVy += 0.72; // Gravity
        if (st.dinoY >= 0) {
          st.dinoY = 0;
          st.dinoVy = 0;
          st.isJumping = false;
        }

        // Distance & Speed
        st.distance += 1;
        st.speed += 0.001;
        st.groundOffset = (st.groundOffset + st.speed) % 20;

        const currentScore = Math.floor(st.distance / 5);
        setScore(currentScore);
        if (currentScore > 0 && currentScore % 100 === 0) {
          sounds.playBlip(980, 'sine', 0.1);
        }

        // Move obstacles
        for (let i = st.obstacles.length - 1; i >= 0; i--) {
          const obs = st.obstacles[i];
          obs.x -= st.speed;

          // Dino hit box
          const dinoW = st.isDucking ? 46 : 30;
          const dinoH = st.isDucking ? 22 : 42;
          const dinoBoxY = groundY - dinoH + st.dinoY;
          const dinoBoxX = 50;

          const obsBoxY = obs.type === 'bird' ? groundY - obs.height - obs.y : groundY - obs.height;

          // Collision detection
          if (
            dinoBoxX < obs.x + obs.width &&
            dinoBoxX + dinoW > obs.x &&
            dinoBoxY < obsBoxY + obs.height &&
            dinoBoxY + dinoH > obsBoxY
          ) {
            triggerGameOver();
            return;
          }

          if (obs.x < -50) {
            st.obstacles.splice(i, 1);
          }
        }

        // Spawn new obstacles
        const lastObs = st.obstacles[st.obstacles.length - 1];
        if (!lastObs || lastObs.x < w - 240 - Math.random() * 200) {
          const isBird = Math.random() < 0.35 && st.distance > 300;
          if (isBird) {
            st.obstacles.push({
              x: w + 40,
              y: Math.random() < 0.5 ? 25 : 55, // low or high bird
              width: 34,
              height: 20,
              type: 'bird'
            });
          } else {
            st.obstacles.push({
              x: w + 40,
              y: 0,
              width: 22 + Math.random() * 15,
              height: 38 + Math.random() * 16,
              type: 'cactus'
            });
          }
        }
      }

      // Draw Ground Grid Pattern
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
      for (let x = -st.groundOffset; x < w; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, groundY);
        ctx.lineTo(x - 10, groundY + 15);
        ctx.stroke();
      }

      // Draw Obstacles
      for (const obs of st.obstacles) {
        if (obs.type === 'cactus') {
          ctx.fillStyle = '#10b981';
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.roundRect(obs.x, groundY - obs.height, obs.width, obs.height, 4);
          ctx.fill();
        } else {
          // Cyber Pterodactyl Bird
          ctx.fillStyle = '#f43f5e';
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 8;
          const by = groundY - obs.height - obs.y;
          ctx.beginPath();
          ctx.roundRect(obs.x, by, obs.width, obs.height, 3);
          ctx.fill();
        }
      }

      // Draw Cyber Dino
      const dinoW = st.isDucking ? 46 : 30;
      const dinoH = st.isDucking ? 22 : 42;
      const dx = 50;
      const dy = groundY - dinoH + st.dinoY;

      ctx.save();
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(dx, dy, dinoW, dinoH, 5);
      ctx.fill();

      // Eye
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(dx + (st.isDucking ? 34 : 18), dy + 6, 4, 4);
      ctx.restore();

      animId = requestAnimationFrame(gameLoop);
    };

    const triggerGameOver = () => {
      sounds.playGameOver();
      const finalScore = Math.floor(stateRef.current.distance / 5);
      if (finalScore > highScore) {
        setHighScore(finalScore);
        localStorage.setItem('revive_dino_high', finalScore.toString());
      }
      setGameState('GAMEOVER');
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, highScore]);

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none">
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm z-10">
        <span className="text-sm font-bold tracking-wider text-cyan-400">CYBER DINO JUMP</span>
        <div className="flex items-center gap-6 text-xs font-mono">
          <span>SCORE: <strong className="text-white tabular-nums">{score}</strong></span>
          <span className="text-amber-400">BEST: <strong className="text-white tabular-nums">{highScore}</strong></span>
        </div>
      </div>

      <div className="relative flex-1 flex items-center justify-center p-4">
        <canvas
          ref={canvasRef}
          width={640}
          height={320}
          onClick={jump}
          className="border border-slate-800 rounded-xl shadow-2xl block aspect-[640/320] max-w-full max-h-full cursor-pointer"
        />

        {gameState === 'MENU' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <h2 className="text-3xl font-extrabold text-white mb-2">CYBER DINO JUMP</h2>
            <p className="text-xs text-slate-300 max-w-xs mb-6">Jump over cacti and duck under robotic drones.</p>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              Start Running
            </button>
          </div>
        )}

        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
            <h3 className="text-3xl font-extrabold text-white mb-1">IMPACT DETECTED</h3>
            <p className="text-xs text-slate-400 mb-4">Distance reached: {score} meters</p>
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

      {/* Touch buttons */}
      <div className="flex md:hidden items-center justify-around p-3 bg-slate-900 border-t border-slate-800">
        <button
          onTouchStart={jump}
          onClick={jump}
          className="px-8 py-3 bg-cyan-500 text-slate-950 font-bold rounded-lg active:bg-cyan-400"
        >
          JUMP [SPACE]
        </button>
        <button
          onTouchStart={() => { stateRef.current.isDucking = true; }}
          onTouchEnd={() => { stateRef.current.isDucking = false; }}
          className="px-8 py-3 bg-slate-800 text-cyan-400 font-bold rounded-lg active:bg-slate-700"
        >
          DUCK [↓]
        </button>
      </div>
    </div>
  );
};
