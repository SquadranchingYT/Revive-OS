import React, { useState, useEffect } from 'react';
import { Save, FileText, Check } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';
import { safeStorage } from '../../utils/safeStorage';

export const NotesApp: React.FC = () => {
  const [note, setNote] = useState(() => {
    return safeStorage.getItem(
      'revive_notes',
      `REVIVE OS · SCRATCHPAD & GAME CHEATS\n======================================\n- Slope 3D: Stay centered; small taps are better than holding keys down.\n- Space Defender: Triple plasma blaster unlocks on Wave 2.\n- Tetris: Press 'C' to stash the straight 4-bar piece for a 4-line Tetris.\n- Panic Key: Press ']' whenever you need instant cover!`
    );
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    sounds.playBlip(620, 'sine', 0.05);
    safeStorage.setItem('revive_notes', note);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col font-mono">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/90 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span>cheatsheet.txt</span>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded text-xs font-bold transition-all cursor-pointer"
        >
          {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          {saved ? 'Saved!' : 'Save'}
        </button>
      </div>

      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        className="flex-1 w-full p-4 bg-transparent resize-none outline-none text-xs sm:text-sm text-cyan-100/90 leading-relaxed font-mono selection:bg-cyan-500/30"
        placeholder="Type cheat codes, passwords, notes..."
      />
    </div>
  );
};
