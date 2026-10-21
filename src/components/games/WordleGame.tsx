import React, { useState, useEffect } from 'react';
import { RotateCcw, Award } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

const WORDS = [
  'CYBER', 'PIXEL', 'GHOST', 'LASER', 'POWER', 'SPACE', 'RADAR', 'BLAST',
  'QUEST', 'TITAN', 'STORM', 'SHOCK', 'FLASH', 'ROBOT', 'LOGIC', 'FORCE',
  'BLAZE', 'PULSE', 'ORBIT', 'ARMOR', 'VIRUS', 'DELTA', 'NEXUS', 'VORTX',
  'STEEL', 'SHINE', 'DRIVE', 'NINJA', 'ALPHA', 'BEAST', 'CLONE', 'ETHER'
];

export const WordleGame: React.FC = () => {
  const [targetWord, setTargetWord] = useState(() => WORDS[Math.floor(Math.random() * WORDS.length)]);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameStatus, setGameStatus] = useState<'PLAYING' | 'WON' | 'LOST'>('PLAYING');

  const restart = () => {
    sounds.playClick();
    const newWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setTargetWord(newWord);
    setGuesses([]);
    setCurrentGuess('');
    setGameStatus('PLAYING');
  };

  const submitGuess = () => {
    if (currentGuess.length !== 5 || gameStatus !== 'PLAYING') return;

    sounds.playBlip(520, 'sine', 0.05);
    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);

    if (currentGuess === targetWord) {
      sounds.playScore();
      setGameStatus('WON');
    } else if (newGuesses.length >= 6) {
      sounds.playGameOver();
      setGameStatus('LOST');
    }
    setCurrentGuess('');
  };

  const handleKeyPress = (letter: string) => {
    if (gameStatus !== 'PLAYING') return;
    if (letter === 'ENTER') {
      submitGuess();
    } else if (letter === 'BACK' || letter === 'BACKSPACE') {
      sounds.playBlip(260, 'sine', 0.02);
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (currentGuess.length < 5 && /^[A-Z]$/.test(letter)) {
      sounds.playBlip(380, 'sine', 0.02);
      setCurrentGuess(prev => prev + letter);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter') handleKeyPress('ENTER');
      else if (e.code === 'Backspace') handleKeyPress('BACK');
      else if (/^[a-zA-Z]$/.test(e.key)) handleKeyPress(e.key.toUpperCase());
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const getLetterStatus = (letter: string, index: number, word: string) => {
    if (targetWord[index] === letter) return 'correct';
    if (targetWord.includes(letter)) return 'present';
    return 'absent';
  };

  const getKeyStatus = (key: string) => {
    let status = 'default';
    for (const guess of guesses) {
      for (let i = 0; i < 5; i++) {
        if (guess[i] === key) {
          if (targetWord[i] === key) return 'correct';
          if (targetWord.includes(key)) status = 'present';
          else if (status !== 'present') status = 'absent';
        }
      }
    }
    return status;
  };

  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
  ];

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none">
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm z-10">
        <span className="text-sm font-bold tracking-wider text-cyan-400">CYBER WORDLE</span>
        <button
          onClick={restart}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          New Word
        </button>
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto">
        {/* 6 Attempt Rows */}
        <div className="grid grid-rows-6 gap-1.5 mb-5">
          {Array.from({ length: 6 }).map((_, r) => {
            const isCurrentRow = r === guesses.length;
            const guess = guesses[r] || (isCurrentRow ? currentGuess : '');

            return (
              <div key={r} className="grid grid-cols-5 gap-1.5">
                {Array.from({ length: 5 }).map((_, c) => {
                  const letter = guess[c] || '';
                  const status = guesses[r] ? getLetterStatus(letter, c, guesses[r]) : 'empty';

                  return (
                    <div
                      key={c}
                      className={`w-11 h-11 sm:w-12 sm:h-12 border-2 rounded-lg flex items-center justify-center font-mono font-bold text-lg sm:text-xl transition-all ${
                        status === 'correct'
                          ? 'bg-emerald-600 border-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                          : status === 'present'
                          ? 'bg-amber-600 border-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                          : status === 'absent'
                          ? 'bg-slate-800 border-slate-700 text-slate-400'
                          : letter
                          ? 'border-cyan-500/80 text-white bg-slate-900'
                          : 'border-slate-800 bg-slate-950/70 text-slate-600'
                      }`}
                    >
                      {letter}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Win/Lose Message */}
        {gameStatus !== 'PLAYING' && (
          <div className="mb-4 text-center animate-fade-in">
            <span className="text-sm font-bold text-white block">
              {gameStatus === 'WON' ? 'BRILLIANT DECRYPTION!' : `ACCESS DENIED · Word was: ${targetWord}`}
            </span>
          </div>
        )}

        {/* On-screen keyboard */}
        <div className="flex flex-col gap-1.5 items-center w-full max-w-sm">
          {keyboardRows.map((row, rIdx) => (
            <div key={rIdx} className="flex gap-1 justify-center w-full">
              {row.map(k => {
                const status = getKeyStatus(k);
                const isWide = k === 'ENTER' || k === 'BACK';
                return (
                  <button
                    key={k}
                    onClick={() => handleKeyPress(k)}
                    className={`h-10 text-xs font-mono font-bold rounded px-1.5 sm:px-2 flex items-center justify-center transition-colors cursor-pointer ${
                      isWide ? 'px-3 sm:px-4 bg-slate-800 text-cyan-400' : ''
                    } ${
                      status === 'correct'
                        ? 'bg-emerald-600 text-white'
                        : status === 'present'
                        ? 'bg-amber-600 text-white'
                        : status === 'absent'
                        ? 'bg-slate-800/50 text-slate-600'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    {k}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
