import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Brain, Award } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

const PADS = [
  { id: 0, color: 'bg-cyan-500', activeColor: 'bg-cyan-300 shadow-[0_0_35px_#67e8f9]', freq: 330, name: 'CYAN' },
  { id: 1, color: 'bg-rose-500', activeColor: 'bg-rose-300 shadow-[0_0_35px_#fda4af]', freq: 440, name: 'ROSE' },
  { id: 2, color: 'bg-amber-500', activeColor: 'bg-amber-300 shadow-[0_0_35px_#fde68a]', freq: 550, name: 'AMBER' },
  { id: 3, color: 'bg-emerald-500', activeColor: 'bg-emerald-300 shadow-[0_0_35px_#a7f3d0]', freq: 660, name: 'EMERALD' }
];

export const MemoryMatrixGame: React.FC = () => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userStep, setUserStep] = useState(0);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [isPlayingSeq, setIsPlayingSeq] = useState(false);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAMEOVER'>('IDLE');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('revive_memory_high') || '0', 10);
  });

  const flashPad = (id: number) => {
    setActivePad(id);
    sounds.playBlip(PADS[id].freq, 'triangle', 0.22);
    setTimeout(() => {
      setActivePad(null);
    }, 280);
  };

  const playSequence = (seq: number[]) => {
    setIsPlayingSeq(true);
    setUserStep(0);
    seq.forEach((padId, index) => {
      setTimeout(() => {
        flashPad(padId);
        if (index === seq.length - 1) {
          setTimeout(() => setIsPlayingSeq(false), 300);
        }
      }, (index + 1) * 450);
    });
  };

  const nextRound = (currentSeq: number[]) => {
    const nextPad = Math.floor(Math.random() * 4);
    const newSeq = [...currentSeq, nextPad];
    setSequence(newSeq);
    setScore(newSeq.length - 1);
    playSequence(newSeq);
  };

  const startGame = () => {
    sounds.playClick();
    setGameState('PLAYING');
    setScore(0);
    const startPad = Math.floor(Math.random() * 4);
    const initialSeq = [startPad];
    setSequence(initialSeq);
    playSequence(initialSeq);
  };

  const handlePadClick = (id: number) => {
    if (gameState !== 'PLAYING' || isPlayingSeq) return;

    flashPad(id);

    if (sequence[userStep] === id) {
      const nextStep = userStep + 1;
      setUserStep(nextStep);

      // Finished round sequence successfully
      if (nextStep === sequence.length) {
        sounds.playScore();
        const currentRoundScore = sequence.length;
        if (currentRoundScore > highScore) {
          setHighScore(currentRoundScore);
          localStorage.setItem('revive_memory_high', currentRoundScore.toString());
        }
        setTimeout(() => {
          nextRound(sequence);
        }, 600);
      }
    } else {
      // Wrong pad clicked
      sounds.playGameOver();
      setGameState('GAMEOVER');
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none font-sans">
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm z-10">
        <span className="text-sm font-bold tracking-wider text-cyan-400">CYBER MEMORY MATRIX</span>
        <div className="flex items-center gap-6 text-xs font-mono">
          <span>SEQUENCE: <strong className="text-white text-sm tabular-nums">{score}</strong></span>
          <span className="text-amber-400">BEST: <strong className="text-white tabular-nums">{highScore}</strong></span>
        </div>
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center p-4">
        {/* 2x2 Matrix circular layout */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 grid grid-cols-2 grid-rows-2 gap-3 p-4 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl">
          {PADS.map(pad => {
            const isActive = activePad === pad.id;

            return (
              <button
                key={pad.id}
                onClick={() => handlePadClick(pad.id)}
                disabled={isPlayingSeq || gameState !== 'PLAYING'}
                className={`w-full h-full rounded-2xl border border-white/10 transition-all duration-150 cursor-pointer active:scale-95 ${
                  isActive ? pad.activeColor : pad.color + ' opacity-75 hover:opacity-100'
                }`}
              />
            );
          })}

          {/* Center Hub Display */}
          <div className="absolute inset-0 m-auto w-24 h-24 rounded-full bg-slate-950 border border-slate-700/80 shadow-2xl flex flex-col items-center justify-center pointer-events-none">
            <Brain className="w-5 h-5 text-cyan-400 mb-0.5" />
            <span className="text-base font-extrabold font-mono text-white tabular-nums">{score}</span>
            <span className="text-[9px] text-slate-400 font-mono uppercase">
              {isPlayingSeq ? 'LISTENING' : gameState === 'PLAYING' ? 'YOUR TURN' : 'STANDBY'}
            </span>
          </div>
        </div>

        {/* Start / Try Again Overlays */}
        {gameState === 'IDLE' && (
          <div className="mt-6 flex flex-col items-center">
            <p className="text-xs text-slate-400 mb-3 text-center max-w-xs">
              Watch and listen to the cyber matrix sequence, then repeat it back in order.
            </p>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              Begin Memory Test
            </button>
          </div>
        )}

        {gameState === 'GAMEOVER' && (
          <div className="mt-6 flex flex-col items-center animate-fade-in">
            <span className="text-sm font-bold text-rose-400 mb-1">SEQUENCE BREACHED</span>
            <p className="text-xs text-slate-400 mb-3">Streak ended at {score} rounds</p>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Test
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
