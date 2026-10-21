import React, { useState } from 'react';
import { Search, Play, Star, Sparkles, Gamepad2 } from 'lucide-react';
import { GameItem } from '../../types/os';
import { GAMES_CATALOG, arcadeImg } from '../../data/gamesList';
import { sounds } from '../../utils/soundEffects';

import { safeStorage } from '../../utils/safeStorage';

interface GameHubAppProps {
  onLaunchGame: (gameId: string) => void;
}

export const GameHubApp: React.FC<GameHubAppProps> = ({ onLaunchGame }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const raw = safeStorage.getItem('revive_favorites', '["slope", "space_defender", "tetris"]');
      return JSON.parse(raw);
    } catch {
      return ['slope', 'space_defender', 'tetris'];
    }
  });

  const categories = ['All', 'Runner', 'Action', 'Arcade', 'Puzzle', 'Retro'];

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    sounds.playBlip(600, 'triangle', 0.04);
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      safeStorage.setItem('revive_favorites', JSON.stringify(next));
      return next;
    });
  };

  const filteredGames = GAMES_CATALOG.filter(game => {
    const matchCat = category === 'All' || game.category === category;
    const matchSearch =
      game.title.toLowerCase().includes(search.toLowerCase()) ||
      game.description.toLowerCase().includes(search.toLowerCase()) ||
      game.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const featuredGame = GAMES_CATALOG.find(g => g.id === 'slope') || GAMES_CATALOG[0];

  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col overflow-y-auto">
      {/* Hero Spotlight Banner */}
      <div className="relative w-full h-52 sm:h-64 border-b border-white/10 shrink-0 overflow-hidden group">
        <img
          src={arcadeImg}
          alt="Arcade Showcase"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-65 transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

        <div className="absolute inset-0 p-6 flex flex-col justify-end max-w-2xl">
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono mb-2">
            <span>FEATURED EXPEDITION</span>
            <span aria-hidden="true">·</span>
            <span>REVIVE OS EXCLUSIVE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            {featuredGame.title}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm line-clamp-2 mb-4 leading-relaxed">
            {featuredGame.description}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sounds.playClick();
                onLaunchGame(featuredGame.id);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Play Featured Game
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="sticky top-0 bg-slate-950/90 backdrop-blur-md border-b border-white/10 p-4 z-20 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto max-w-full">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                sounds.playBlip(440, 'sine', 0.02);
                setCategory(cat);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                category === cat
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search all games & genres..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Games Grid */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredGames.map(game => {
          const isFav = favorites.includes(game.id);

          return (
            <div
              key={game.id}
              onClick={() => {
                sounds.playClick();
                onLaunchGame(game.id);
              }}
              className="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800/90 hover:border-cyan-500/50 rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,0,0,0.5)] cursor-pointer flex flex-col"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                <img
                  src={game.image}
                  alt={game.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />

                {/* Favorite button */}
                <button
                  onClick={e => toggleFavorite(e, game.id)}
                  title="Favorite game"
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-950/70 border border-white/10 hover:bg-slate-900 text-slate-400 hover:text-amber-400 transition-colors"
                >
                  <Star className={`w-3.5 h-3.5 ${isFav ? 'text-amber-400 fill-amber-400' : ''}`} />
                </button>
              </div>

              {/* Game Info */}
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                  <span>{game.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>Revive Verified</span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors mb-1.5 line-clamp-1">
                  {game.title}
                </h3>

                <p className="text-slate-400 text-xs line-clamp-2 mb-3 leading-relaxed flex-1">
                  {game.description}
                </p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {game.tags.slice(0, 2).join(' · ')}
                  </span>
                  <span className="text-cyan-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Launch →
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
