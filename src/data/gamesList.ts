import { GameItem, OSTheme } from '../types/os';

import slopeImg from '../assets/images/slope_runner_cover_1792544995973.jpg';
import spaceImg from '../assets/images/cyber_space_shooter_1792544996935.jpg';
import arcadeImg from '../assets/images/retro_arcade_showcase_1792544996645.jpg';
import wallpaperImg from '../assets/images/revive_os_wallpaper_1792544995104.jpg';
import racerImg from '../assets/images/neon_drift_racer_1792545631785.jpg';
import clickerImg from '../assets/images/cyber_core_clicker_1792545633000.jpg';
import flappyImg from '../assets/images/flappy_cyber_1792545632319.jpg';
import pacImg from '../assets/images/cyber_pac_maze_1792546156919.jpg';
import turretImg from '../assets/images/cyber_turret_defense_1792546156910.jpg';
import crosserImg from '../assets/images/cyber_crosser_road_1792546157610.jpg';
import pinballImg from '../assets/images/neon_pinball_cover_1792546462973.jpg';
import blockBlastImg from '../assets/images/block_blast_cover_1792546462969.jpg';

export { wallpaperImg, arcadeImg, clickerImg, pacImg, turretImg, crosserImg, pinballImg, blockBlastImg };

export const GAMES_CATALOG: GameItem[] = [
  {
    id: 'slope',
    title: 'Slope 3D: Cyber Run',
    description: 'High-speed 3D tunnel runner. Dodge red obstacles, accelerate down gravity slopes, and set world-class distance records.',
    category: 'Runner',
    image: slopeImg,
    controls: 'A/D or Left/Right Arrow to steer. Avoid obstacles and falling off.',
    tags: ['3D', 'Reflex', 'Endless', 'Speed'],
    isFeatured: true
  },
  {
    id: 'space_defender',
    title: 'Galactic Invaders',
    description: 'Classic arcade outer space shooter. Blast wave formations of alien invaders, collect plasma upgrades, and defeat bosses.',
    category: 'Action',
    image: spaceImg,
    controls: 'Arrow keys or A/D to move, Spacebar to shoot plasma bursts.',
    tags: ['Retro', 'Shooter', 'Sci-Fi', 'Boss'],
    isFeatured: true
  },
  {
    id: 'tetris',
    title: 'Revive Tetromino',
    description: 'Authentic block-falling puzzle. Features SRS rotations, ghost piece projection, hold piece slot, hard drops, and back-to-back tetrises.',
    category: 'Puzzle',
    image: arcadeImg,
    controls: 'Arrow Left/Right to move, Up to rotate, Down to soft drop, Space for hard drop, C to hold piece.',
    tags: ['Puzzle', 'Classic', 'Strategy'],
    isFeatured: true
  },
  {
    id: 'cyber_snake',
    title: 'Snake Revive',
    description: 'Sleek neon grid snake with particle trails, speed bonuses, energy orbs, and multiplier combos.',
    category: 'Arcade',
    image: slopeImg,
    controls: 'WASD or Arrow keys to steer direction. Avoid walls and yourself.',
    tags: ['Arcade', 'Fast', 'Casual'],
    isFeatured: false
  },
  {
    id: 'breakout',
    title: 'Neon Breakout',
    description: 'High energy brick destruction with paddle physics, multiball powerups, lasers, and escalating stages.',
    category: 'Arcade',
    image: arcadeImg,
    controls: 'Mouse or Left/Right Arrow keys to glide paddle. Bounce ball into bricks.',
    tags: ['Retro', 'Physics', 'Powerups'],
    isFeatured: false
  },
  {
    id: 'game_2048',
    title: '2048 Neon Fusion',
    description: 'Silky smooth number-merging puzzle. Slide matching tiles together to reach 2048 and beyond with unlimited undo.',
    category: 'Puzzle',
    image: wallpaperImg,
    controls: 'Arrow keys or swipe to slide tiles. Matching numbers merge.',
    tags: ['Puzzle', 'Numbers', 'Addictive'],
    isFeatured: false
  },
  {
    id: 'dino_runner',
    title: 'Cyber Dino Jump',
    description: 'Jump over cyber-cacti, duck under robotic pterodactyls, and survive the accelerating day and night cycle.',
    category: 'Runner',
    image: slopeImg,
    controls: 'Spacebar or Up Arrow to jump, Down Arrow to duck.',
    tags: ['Classic', 'Offline', 'Runner'],
    isFeatured: false
  },
  {
    id: 'neon_pong',
    title: 'Neon Pong 1v1',
    description: 'Fast retro table tennis. Compete against an adaptive AI bot or challenge a friend in 2-player local keyboard mode.',
    category: 'Retro',
    image: arcadeImg,
    controls: 'Player 1: W/S. Player 2 (Local): Up/Down arrows. Curve ball with paddle motion.',
    tags: ['Retro', '2-Player', 'Versus'],
    isFeatured: false
  },
  {
    id: 'neon_racer',
    title: 'Neon Drift Racer',
    description: 'High-speed cyberpunk highway racer. Steer through dense traffic, trigger nitro boost bursts, and dodge reckless highway cruisers.',
    category: 'Action',
    image: racerImg,
    controls: 'A/D or Left/Right Arrow to switch lanes, Spacebar or Shift to ignite nitro turbo.',
    tags: ['Car', 'Speed', 'Drift', 'Highway'],
    isFeatured: true
  },
  {
    id: 'core_clicker',
    title: 'Cyber Core Clicker',
    description: 'Deep incremental sci-fi idle game. Harvest quantum energy from the reactor, deploy autonomous mining drones, and construct fusion Dyson rings.',
    category: 'Arcade',
    image: clickerImg,
    controls: 'Click the Core to harvest Joules. Purchase automated reactors and upgrades.',
    tags: ['Idle', 'Clicker', 'Upgrade', 'Persistent'],
    isFeatured: true
  },
  {
    id: 'flappy_cyber',
    title: 'Flappy Cyber Drone',
    description: 'Maneuver an agile flight drone through vertical energy conduits. Master precision timing, gravity drops, and distance thresholds.',
    category: 'Runner',
    image: flappyImg,
    controls: 'Spacebar, Up Arrow, or Click to pulse vertical thrusters.',
    tags: ['Reflex', 'Flying', 'Score', 'Hard'],
    isFeatured: true
  },
  {
    id: 'asteroids',
    title: 'Vector Asteroids 360',
    description: 'Defend deep space in a 360-degree inertia physics vessel. Rotate, fire photon blasters, and disintegrate space rocks into fine dust.',
    category: 'Action',
    image: spaceImg,
    controls: 'Left/Right to rotate, Up to thrust forward, Space to fire blasters.',
    tags: ['Retro', 'Physics', 'Vector', '360'],
    isFeatured: false
  },
  {
    id: 'connect4',
    title: 'Gravity Four 1v1',
    description: 'Strategic vertical chip connection game. Connect 4 glowing tokens vertically, horizontally, or diagonally vs an intelligent Bot or friend.',
    category: 'Puzzle',
    image: arcadeImg,
    controls: 'Click any column header to drop your glowing token.',
    tags: ['Strategy', 'Turn-Based', 'Bot', '2-Player'],
    isFeatured: false
  },
  {
    id: 'memory_matrix',
    title: 'Cyber Memory Matrix',
    description: 'High-frequency pattern and auditory memory test. Memorize the glowing cyber-matrix sequence and repeat it at ramping speeds.',
    category: 'Puzzle',
    image: wallpaperImg,
    controls: 'Click the glowing matrix pads matching the computer sequence.',
    tags: ['Brain', 'Memory', 'Audio', 'Puzzle'],
    isFeatured: false
  },
  {
    id: 'minesweeper',
    title: 'Minesweeper OS',
    description: 'The definitive deduction game. Clear the minefield with Beginner (9x9), Intermediate (16x16), or Master (30x16) modes.',
    category: 'Puzzle',
    image: wallpaperImg,
    controls: 'Left Click to reveal, Right Click or Long Press to place a warning flag.',
    tags: ['Classic', 'Logic', 'Strategy'],
    isFeatured: false
  },
  {
    id: 'wordle',
    title: 'Cyber Wordle',
    description: 'Guess the hidden 5-letter word in 6 attempts with color feedback clues. Unlimited practice mode with full keyboard.',
    category: 'Puzzle',
    image: arcadeImg,
    controls: 'Type 5-letter words with keyboard or on-screen keys. Press Enter to submit.',
    tags: ['Word', 'Brain', 'Daily'],
    isFeatured: false
  },
  {
    id: 'pac_maze',
    title: 'Cyber Pac Maze',
    description: 'Neon blue labyrinth runner. Consume energy pellets, avoid chromatic cyber ghosts, and snatch power pellets to turn the hunt around.',
    category: 'Retro',
    image: pacImg,
    controls: 'WASD or Arrow keys to steer Pac through the maze junctions.',
    tags: ['Arcade', 'Maze', 'Retro', 'Classic'],
    isFeatured: true
  },
  {
    id: 'tower_defense',
    title: 'Cyber Turret Defense',
    description: 'Tactical sci-fi pathway defense. Position and upgrade Pulse Lasers, Plasma Cannons, and Cryo Freezers to stop robotic creep waves.',
    category: 'Action',
    image: turretImg,
    controls: 'Click to place defense turrets on grid pads. Click turrets to upgrade or sell.',
    tags: ['Strategy', 'Tower Defense', 'Tactics', 'Waves'],
    isFeatured: true
  },
  {
    id: 'cyber_crosser',
    title: 'Cyber Crosser 3D',
    description: 'High-octane isometric crossing runner. Hop across multi-lane autonomous highways, avoid hover trains, and cross plasma streams.',
    category: 'Runner',
    image: crosserImg,
    controls: 'Arrow keys or WASD to leap forward, back, left, or right.',
    tags: ['Reflex', 'Crossy', 'Isometric', 'Score'],
    isFeatured: true
  },
  {
    id: 'sudoku',
    title: 'Cyber Sudoku OS',
    description: 'The premier mathematical grid deduction puzzle. Fill the 9x9 matrix with numbers 1 through 9 with pencil notes and real-time validation.',
    category: 'Puzzle',
    image: wallpaperImg,
    controls: 'Click any cell, then select a number from 1 to 9. Toggle Pencil mode for notes.',
    tags: ['Puzzle', 'Logic', 'Brain', 'Numbers'],
    isFeatured: false
  },
  {
    id: 'dunk_hoop',
    title: 'Neon Dunk Hoop',
    description: 'Flapping arcade basketball challenge. Tap your thrusters with precise trajectory to dunk balls through suspended cyber hoops.',
    category: 'Arcade',
    image: arcadeImg,
    controls: 'Click or Spacebar to flap the basketball into the moving hoops.',
    tags: ['Arcade', 'Physics', 'Sports', 'Combo'],
    isFeatured: false
  },
  {
    id: 'tictactoe',
    title: 'Tic-Tac-Toe AI Bot',
    description: 'Clean neon grid battle vs an unbeatable Minimax bot or play in casual 2-player mode.',
    category: 'Retro',
    image: wallpaperImg,
    controls: 'Click any tile on your turn to place X. Bot places O.',
    tags: ['Casual', 'Bot', 'Quick'],
    isFeatured: false
  },
  {
    id: 'neon_pinball',
    title: 'Cosmic Pinball FX',
    description: 'High-speed neon space arcade pinball. Fire flippers, rack up bumper combos, hit warp vortex multipliers, and avoid draining the silver ball.',
    category: 'Arcade',
    image: pinballImg,
    controls: 'A/D or Left/Right Arrow for flippers. Spacebar or Arrow Down for plunger pull.',
    tags: ['Arcade', 'Pinball', 'Physics', 'Retro'],
    isFeatured: true
  },
  {
    id: 'block_blast',
    title: 'Galactic Gem Blast',
    description: 'Sensational neon polyomino block puzzle. Place gem shapes onto the 8x8 matrix, clear full rows & columns, and trigger combo particle blasts.',
    category: 'Puzzle',
    image: blockBlastImg,
    controls: 'Select a shape from the bottom tray, then click grid cells to place.',
    tags: ['Puzzle', 'Block Blast', 'Addictive', 'Brain'],
    isFeatured: true
  },
  {
    id: 'lunar_lander',
    title: 'Gravity Lunar Lander',
    description: 'Master orbital mechanics and lunar thruster physics. Manage fuel, counteract gravity, and gently touch down on high-multiplier landing zones.',
    category: 'Action',
    image: spaceImg,
    controls: 'W, Up Arrow, or Spacebar for main thruster. A/D or Left/Right Arrow to rotate RCS.',
    tags: ['Physics', 'Space', 'Simulator', 'Retro'],
    isFeatured: false
  },
  {
    id: 'cyber_archery',
    title: 'Neon Archery Master',
    description: 'Precision target shooting. Draw bow tension, gauge crosswind vectors, and land bullseyes on floating holographic target rings.',
    category: 'Arcade',
    image: arcadeImg,
    controls: 'Click and drag mouse/pointer to aim and draw power. Release to shoot arrow.',
    tags: ['Skill', 'Target', 'Physics', 'Score'],
    isFeatured: false
  }
];

export const OS_THEMES: OSTheme[] = [
  {
    id: 'cyber_onyx',
    name: 'Cyber Onyx (Default)',
    bgGradient: 'from-slate-950 via-slate-900 to-indigo-950/60',
    accent: 'bg-cyan-500 text-slate-950',
    accentHover: 'hover:bg-cyan-400',
    border: 'border-cyan-500/30',
    glass: 'bg-slate-900/85 backdrop-blur-md border border-slate-700/60 shadow-2xl',
    windowHeader: 'bg-slate-900/95 border-b border-slate-800',
    glow: 'rgba(6, 182, 212, 0.25)'
  },
  {
    id: 'emerald_matrix',
    name: 'Emerald Matrix',
    bgGradient: 'from-zinc-950 via-emerald-950/40 to-black',
    accent: 'bg-emerald-500 text-zinc-950',
    accentHover: 'hover:bg-emerald-400',
    border: 'border-emerald-500/30',
    glass: 'bg-zinc-900/85 backdrop-blur-md border border-emerald-900/50 shadow-2xl',
    windowHeader: 'bg-zinc-900/95 border-b border-emerald-950',
    glow: 'rgba(16, 185, 129, 0.25)'
  },
  {
    id: 'synth_sunset',
    name: 'Synthwave Sunset',
    bgGradient: 'from-slate-950 via-fuchsia-950/40 to-purple-950/50',
    accent: 'bg-fuchsia-500 text-slate-950',
    accentHover: 'hover:bg-fuchsia-400',
    border: 'border-fuchsia-500/30',
    glass: 'bg-slate-900/85 backdrop-blur-md border border-fuchsia-900/40 shadow-2xl',
    windowHeader: 'bg-slate-900/95 border-b border-fuchsia-950',
    glow: 'rgba(217, 70, 239, 0.25)'
  },
  {
    id: 'crimson_void',
    name: 'Crimson Void',
    bgGradient: 'from-neutral-950 via-rose-950/30 to-black',
    accent: 'bg-rose-500 text-neutral-950',
    accentHover: 'hover:bg-rose-400',
    border: 'border-rose-500/30',
    glass: 'bg-neutral-900/85 backdrop-blur-md border border-rose-950/60 shadow-2xl',
    windowHeader: 'bg-neutral-900/95 border-b border-rose-950',
    glow: 'rgba(244, 63, 94, 0.25)'
  },
  {
    id: 'ice_glaze',
    name: 'Polar Glaze',
    bgGradient: 'from-sky-950 via-slate-900 to-slate-950',
    accent: 'bg-sky-400 text-slate-950',
    accentHover: 'hover:bg-sky-300',
    border: 'border-sky-400/30',
    glass: 'bg-slate-900/80 backdrop-blur-md border border-sky-900/40 shadow-2xl',
    windowHeader: 'bg-slate-900/95 border-b border-sky-950',
    glow: 'rgba(56, 189, 248, 0.25)'
  }
];

export const CLOAK_PRESETS = [
  {
    id: 'none',
    title: 'Default (Revive OS)',
    tabTitle: 'Revive OS · Unblocked Games',
    favicon: '/favicon.ico'
  },
  {
    id: 'classroom',
    title: 'Google Classroom',
    tabTitle: 'Classes · Google Classroom',
    favicon: 'https://ssl.gstatic.com/classroom/favicon.png'
  },
  {
    id: 'docs',
    title: 'Google Docs',
    tabTitle: 'Untitled document - Google Docs',
    favicon: 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico'
  },
  {
    id: 'khan',
    title: 'Khan Academy',
    tabTitle: 'Dashboard | Khan Academy',
    favicon: 'https://www.khanacademy.org/favicon.ico'
  },
  {
    id: 'desmos',
    title: 'Desmos Graphing Calculator',
    tabTitle: 'Desmos | Graphing Calculator',
    favicon: 'https://www.desmos.com/favicon.ico'
  }
];
