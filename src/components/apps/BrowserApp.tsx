import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Globe, Search, BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface WebPage {
  title: string;
  url: string;
  content: React.ReactNode;
}

export const BrowserApp: React.FC = () => {
  const [currentUrl, setCurrentUrl] = useState('https://revive.os/wiki/arcade');
  const [activeTab, setActiveTab] = useState<'wiki' | 'desmos' | 'news'>('wiki');
  const [wikiQuery, setWikiQuery] = useState('');

  const articles: Record<string, { title: string; body: string; cat: string }> = {
    arcade: {
      title: 'Golden Age of Arcade Video Games',
      cat: 'Gaming History',
      body: 'The golden age of arcade video games was the era of rapid growth, technological innovation, and widespread cultural popularity from the late 1970s to early 1980s. Seminal titles such as Space Invaders (1978), Asteroids (1979), Pac-Man (1980), and Donkey Kong (1981) introduced high score records, vector displays, and recognizable characters to mainstream global entertainment.'
    },
    tetris: {
      title: 'Tetris & The Super Rotation System',
      cat: 'Puzzle Mechanics',
      body: 'Tetris was created by Soviet software engineer Alexey Pajitnov in June 1984. The Super Rotation System (SRS) determines how tetrominoes rotate when obstructed by existing blocks or wall boundaries through predefined wall kick tests, allowing advanced techniques like T-Spins and back-to-back Tetrises.'
    },
    cyberpunk: {
      title: 'Cyberpunk Aesthetic & High-Tech Low-Life',
      cat: 'Subgenre & Culture',
      body: 'Cyberpunk explores dystopian futures featuring advanced science, computing, cybernetics, and synthetic intelligence juxtaposed against social breakdown. Hallmarks include neon signage reflecting in wet asphalt, dark terminal interfaces, and high-frequency synthwave soundtracks.'
    }
  };

  const currentArticle = articles[wikiQuery.toLowerCase()] || articles.arcade;

  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden select-none">
      {/* Top Browser Bar */}
      <div className="bg-slate-900 border-b border-slate-800 p-2 flex flex-col gap-2">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 px-1">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('wiki');
              setCurrentUrl('https://revive.os/wiki/arcade');
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'wiki'
                ? 'bg-slate-950 text-cyan-400 border-t border-x border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Encyclopedia Wiki</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('desmos');
              setCurrentUrl('https://desmos.unblocked.os/graph');
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'desmos'
                ? 'bg-slate-950 text-cyan-400 border-t border-x border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Math Sandbox</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('news');
              setCurrentUrl('https://revive.os/patchnotes');
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'news'
                ? 'bg-slate-950 text-cyan-400 border-t border-x border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Revive Patch Notes</span>
          </button>
        </div>

        {/* Address Navigation Bar */}
        <div className="flex items-center gap-2 px-1">
          <div className="flex items-center gap-1 text-slate-400">
            <button className="p-1 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button className="p-1 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer">
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => sounds.playBlip(500, 'sine', 0.03)}
              className="p-1 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <input
              type="text"
              value={currentUrl}
              onChange={e => setCurrentUrl(e.target.value)}
              className="w-full bg-transparent text-slate-200 outline-none font-mono text-xs"
            />
          </div>
        </div>
      </div>

      {/* Web Content Render Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-950 select-text">
        {activeTab === 'wiki' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Search within Wiki */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={wikiQuery}
                  onChange={e => setWikiQuery(e.target.value)}
                  placeholder="Search encyclopedia: arcade, tetris, cyberpunk..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>
            </div>

            <article className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
              <div className="text-xs text-cyan-400 font-mono uppercase mb-1">{currentArticle.cat}</div>
              <h1 className="text-2xl font-bold text-white mb-4">{currentArticle.title}</h1>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">{currentArticle.body}</p>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>Revive OS Offline Archive</span>
                <span>Verified Clean</span>
              </div>
            </article>
          </div>
        )}

        {activeTab === 'desmos' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-lg font-bold text-white">Mathematical Function Grapher</h2>
            <div className="h-64 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center relative overflow-hidden">
              {/* Coordinate axis */}
              <div className="absolute inset-x-0 top-1/2 h-px bg-slate-700" />
              <div className="absolute inset-y-0 left-1/2 w-px bg-slate-700" />
              <svg className="w-full h-full text-cyan-400" viewBox="0 0 600 250">
                <path
                  d="M 0,125 Q 75,0 150,125 T 300,125 T 450,125 T 600,125"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                />
              </svg>
            </div>
            <p className="text-xs text-slate-400 font-mono">f(x) = sin(x) · e^(-0.05x)</p>
          </div>
        )}

        {activeTab === 'news' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-xl font-bold text-white">Revive OS Changelog & Patch Notes</h2>
            <div className="space-y-3">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
                <div className="text-xs font-mono text-cyan-400 mb-1">REVIVE OS v2.4 (TODAY)</div>
                <h3 className="text-sm font-bold text-white mb-2">Massive Games & Utility Suite Expansion</h3>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>Added Neon Drift Racer with nitro boost and traffic dodging.</li>
                  <li>Added Cyber Core Clicker with automated harvesters and idle persistence.</li>
                  <li>Added Flappy Cyber Drone with gravity flight physics.</li>
                  <li>Added Vector Asteroids 360 with ship inertia and asteroid splitting.</li>
                  <li>Added Gravity Four 1v1 Connect 4 with bot AI.</li>
                  <li>Added Revive Paint studio with neon glow brushes and PNG export.</li>
                  <li>Added Scientific Calculator and Task Manager app.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
