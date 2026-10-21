export interface GameItem {
  id: string;
  title: string;
  description: string;
  category: 'Action' | 'Arcade' | 'Runner' | 'Puzzle' | 'Retro';
  image: string;
  controls: string;
  tags: string[];
  isFeatured?: boolean;
}

export type CloakType = 'none' | 'classroom' | 'docs' | 'khan' | 'desmos';

export interface WindowItem {
  id: string;
  title: string;
  icon: string;
  type: 'game' | 'app';
  gameId?: string;
  appId?: string;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OSTheme {
  id: string;
  name: string;
  bgGradient: string;
  accent: string;
  accentHover: string;
  border: string;
  glass: string;
  windowHeader: string;
  glow: string;
}
