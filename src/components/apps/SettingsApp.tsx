import React from 'react';
import { Palette, Shield, Volume2, VolumeX, Keyboard, Check, Globe } from 'lucide-react';
import { OS_THEMES, CLOAK_PRESETS } from '../../data/gamesList';
import { sounds } from '../../utils/soundEffects';

interface SettingsAppProps {
  currentThemeId: string;
  onThemeChange: (themeId: string) => void;
  currentCloak: string;
  onCloakChange: (cloakId: string) => void;
  panicKey: string;
  onPanicKeyChange: (key: string) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const SettingsApp: React.FC<SettingsAppProps> = ({
  currentThemeId,
  onThemeChange,
  currentCloak,
  onCloakChange,
  panicKey,
  onPanicKeyChange,
  isMuted,
  onToggleMute
}) => {
  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 p-6 overflow-y-auto font-sans">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Revive OS Control Panel</h2>
          <p className="text-xs text-slate-400">Configure appearance, stealth cloaks, shortcuts, and audio.</p>
        </div>

        {/* Section 1: Themes */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Desktop Visual Theme</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {OS_THEMES.map(th => {
              const active = th.id === currentThemeId;
              return (
                <button
                  key={th.id}
                  onClick={() => {
                    sounds.playClick();
                    onThemeChange(th.id);
                  }}
                  className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    active
                      ? 'border-cyan-400 bg-cyan-950/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : 'border-slate-800 bg-slate-900/90 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: th.glow.replace('0.25', '1') }}
                    />
                    <span className="text-xs font-medium text-slate-200">{th.name}</span>
                  </div>
                  {active && <Check className="w-4 h-4 text-cyan-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Tab Cloaking */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Browser Tab Cloaker</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Disguises the browser tab title and favicon to appear as everyday school software.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CLOAK_PRESETS.map(preset => {
              const active = preset.id === currentCloak;
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    sounds.playClick();
                    onCloakChange(preset.id);
                  }}
                  className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    active
                      ? 'border-cyan-400 bg-cyan-950/20'
                      : 'border-slate-800 bg-slate-900/90 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-medium text-white">{preset.title}</div>
                    <div className="text-[11px] text-slate-500 font-mono truncate max-w-[200px]">{preset.tabTitle}</div>
                  </div>
                  {active && <Check className="w-4 h-4 text-cyan-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Panic Key & Stealth */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Emergency Panic Hotkey</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Pressing this key instantly cloaks the entire screen into a Google Classroom / Google Docs decoy report.
          </p>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-300">Active Panic Key:</span>
            {[']', 'Escape', '`', '~'].map(k => (
              <button
                key={k}
                onClick={() => {
                  sounds.playBlip(500, 'sine', 0.03);
                  onPanicKeyChange(k);
                }}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                  panicKey === k
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                {k === 'Escape' ? 'ESC' : k}
              </button>
            ))}
          </div>
        </div>

        {/* Section 4: Sound Settings */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-rose-400" />
            ) : (
              <Volume2 className="w-5 h-5 text-cyan-400" />
            )}
            <div>
              <div className="text-xs font-semibold text-white">Audio Synthesizer</div>
              <div className="text-[11px] text-slate-400">Web Audio API sound effects and chiptunes</div>
            </div>
          </div>

          <button
            onClick={() => {
              onToggleMute();
              sounds.playClick();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              isMuted ? 'bg-slate-800 text-slate-400' : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
            }`}
          >
            {isMuted ? 'Muted' : 'Sound Enabled'}
          </button>
        </div>
      </div>
    </div>
  );
};
