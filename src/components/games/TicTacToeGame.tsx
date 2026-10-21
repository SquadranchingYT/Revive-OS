import React, { useState } from 'react';
import { RotateCcw, Bot, User } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

type Board = (string | null)[];

export const TicTacToeGame: React.FC = () => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [wins, setWins] = useState({ x: 0, o: 0, ties: 0 });
  const [difficulty, setDifficulty] = useState<'impossible' | 'casual'>('impossible');

  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  const calculateWinner = (squares: Board): { winner: string; line: number[] } | null => {
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a]!, line: lines[i] };
      }
    }
    return null;
  };

  const winInfo = calculateWinner(board);
  const isDraw = !winInfo && board.every(square => square !== null);

  const minimax = (tempBoard: Board, depth: number, isMaximizing: boolean): number => {
    const res = calculateWinner(tempBoard);
    if (res?.winner === 'O') return 10 - depth;
    if (res?.winner === 'X') return depth - 10;
    if (tempBoard.every(sq => sq !== null)) return 0;

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!tempBoard[i]) {
          tempBoard[i] = 'O';
          const evalScore = minimax(tempBoard, depth + 1, false);
          tempBoard[i] = null;
          maxEval = Math.max(maxEval, evalScore);
        }
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!tempBoard[i]) {
          tempBoard[i] = 'X';
          const evalScore = minimax(tempBoard, depth + 1, true);
          tempBoard[i] = null;
          minEval = Math.min(minEval, evalScore);
        }
      }
      return minEval;
    }
  };

  const getBestMove = (currentBoard: Board): number => {
    if (difficulty === 'casual' && Math.random() < 0.45) {
      const empty = currentBoard.map((v, idx) => v === null ? idx : null).filter(v => v !== null) as number[];
      return empty[Math.floor(Math.random() * empty.length)];
    }

    let bestScore = -Infinity;
    let move = -1;
    for (let i = 0; i < 9; i++) {
      if (!currentBoard[i]) {
        currentBoard[i] = 'O';
        const score = minimax(currentBoard, 0, false);
        currentBoard[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  };

  const handleClick = (index: number) => {
    if (board[index] || winInfo || isDraw) return;

    sounds.playBlip(520, 'triangle', 0.04);
    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);

    const winCheck = calculateWinner(newBoard);
    if (winCheck?.winner === 'X') {
      sounds.playScore();
      setWins(w => ({ ...w, x: w.x + 1 }));
      return;
    }

    if (newBoard.every(sq => sq !== null)) {
      sounds.playBlip(300, 'sine', 0.08);
      setWins(w => ({ ...w, ties: w.ties + 1 }));
      return;
    }

    // AI Move
    setIsXNext(false);
    setTimeout(() => {
      const botMove = getBestMove(newBoard);
      if (botMove !== -1) {
        newBoard[botMove] = 'O';
        sounds.playBlip(400, 'sine', 0.04);
        setBoard([...newBoard]);

        const botWin = calculateWinner(newBoard);
        if (botWin?.winner === 'O') {
          sounds.playGameOver();
          setWins(w => ({ ...w, o: w.o + 1 }));
        } else if (newBoard.every(sq => sq !== null)) {
          setWins(w => ({ ...w, ties: w.ties + 1 }));
        }
      }
      setIsXNext(true);
    }, 280);
  };

  const resetGame = () => {
    sounds.playClick();
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none">
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm z-10">
        <span className="text-sm font-bold tracking-wider text-cyan-400">TIC-TAC-TOE AI</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDifficulty('impossible')}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${difficulty === 'impossible' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Unbeatable Bot
          </button>
          <button
            onClick={() => setDifficulty('casual')}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${difficulty === 'casual' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Casual Bot
          </button>
        </div>
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center p-4">
        {/* Score Board */}
        <div className="flex items-center justify-between w-full max-w-[280px] bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 mb-4 font-mono text-xs">
          <span className="text-cyan-400 font-bold">YOU (X): <strong className="text-white text-sm tabular-nums">{wins.x}</strong></span>
          <span className="text-slate-500">TIES: <strong className="text-white text-sm tabular-nums">{wins.ties}</strong></span>
          <span className="text-rose-400 font-bold">BOT (O): <strong className="text-white text-sm tabular-nums">{wins.o}</strong></span>
        </div>

        {/* 3x3 Grid */}
        <div className="relative w-full max-w-[280px] aspect-square grid grid-cols-3 grid-rows-3 gap-2.5 p-3 bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-2xl">
          {board.map((val, idx) => {
            const isWinningSquare = winInfo?.line.includes(idx);
            return (
              <button
                key={idx}
                onClick={() => handleClick(idx)}
                disabled={!isXNext || !!val || !!winInfo}
                className={`w-full h-full rounded-xl flex items-center justify-center text-3xl font-extrabold font-mono border transition-all cursor-pointer ${
                  isWinningSquare
                    ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60'
                }`}
              >
                {val === 'X' && (
                  <span className="text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">X</span>
                )}
                {val === 'O' && (
                  <span className="text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]">O</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Status Text & Restart */}
        <div className="mt-4 flex flex-col items-center gap-2">
          <span className="text-xs font-mono text-slate-400">
            {winInfo
              ? winInfo.winner === 'X' ? 'VICTORY ACHIEVED!' : 'BOT PREVAILED!'
              : isDraw
              ? 'GRID STALEMATE!'
              : isXNext
              ? 'Your Turn [X]'
              : 'Bot Computing...'}
          </span>

          <button
            onClick={resetGame}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer mt-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Grid
          </button>
        </div>
      </div>
    </div>
  );
};
