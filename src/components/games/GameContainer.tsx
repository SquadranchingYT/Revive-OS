import React from 'react';
import { SlopeRunnerGame } from './SlopeRunnerGame';
import { SpaceDefenderGame } from './SpaceDefenderGame';
import { TetrisGame } from './TetrisGame';
import { SnakeGame } from './SnakeGame';
import { BreakoutGame } from './BreakoutGame';
import { Game2048 } from './Game2048';
import { DinoRunnerGame } from './DinoRunnerGame';
import { NeonPongGame } from './NeonPongGame';
import { MinesweeperGame } from './MinesweeperGame';
import { WordleGame } from './WordleGame';
import { TicTacToeGame } from './TicTacToeGame';
import { NeonDriftRacer } from './NeonDriftRacer';
import { CyberCoreClicker } from './CyberCoreClicker';
import { FlappyCyberGame } from './FlappyCyberGame';
import { AsteroidsGame } from './AsteroidsGame';
import { Connect4Game } from './Connect4Game';
import { MemoryMatrixGame } from './MemoryMatrixGame';

interface GameContainerProps {
  gameId: string;
}

export const GameContainer: React.FC<GameContainerProps> = ({ gameId }) => {
  switch (gameId) {
    case 'slope':
      return <SlopeRunnerGame />;
    case 'space_defender':
      return <SpaceDefenderGame />;
    case 'tetris':
      return <TetrisGame />;
    case 'cyber_snake':
      return <SnakeGame />;
    case 'breakout':
      return <BreakoutGame />;
    case 'game_2048':
      return <Game2048 />;
    case 'dino_runner':
      return <DinoRunnerGame />;
    case 'neon_pong':
      return <NeonPongGame />;
    case 'minesweeper':
      return <MinesweeperGame />;
    case 'wordle':
      return <WordleGame />;
    case 'tictactoe':
      return <TicTacToeGame />;
    case 'neon_racer':
      return <NeonDriftRacer />;
    case 'core_clicker':
      return <CyberCoreClicker />;
    case 'flappy_cyber':
      return <FlappyCyberGame />;
    case 'asteroids':
      return <AsteroidsGame />;
    case 'connect4':
      return <Connect4Game />;
    case 'memory_matrix':
      return <MemoryMatrixGame />;
    default:
      return <SlopeRunnerGame />;
  }
};
