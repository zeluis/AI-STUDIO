import React from 'react';
import { X, Volume2, HardDrive, Monitor, Check } from 'lucide-react';
import { SystemPreferences, ThemeName, WallpaperName } from '../types';

interface SystemPreferencesModalProps {
  preferences: SystemPreferences;
  onUpdatePreferences: (updated: Partial<SystemPreferences>) => void;
  onClose: () => void;
}

export const SystemPreferencesModal: React.FC<SystemPreferencesModalProps> = ({
  preferences,
  onUpdatePreferences,
  onClose,
}) => {
  const wallpapers: { id: WallpaperName; title: string; color: string }[] = [
    { id: 'highsierra', title: 'High Sierra Lake', color: 'from-sky-600 via-blue-700 to-indigo-900' },
    { id: 'sunset', title: 'Sierra Sunset', color: 'from-amber-500 via-rose-600 to-purple-900' },
    { id: 'snow', title: 'Alpine Snow', color: 'from-slate-300 via-sky-200 to-blue-400' },
    { id: 'granite', title: 'Yosemite Granite', color: 'from-stone-600 via-zinc-700 to-slate-900' },
    { id: 'space', title: 'Deep Space Dark', color: 'from-indigo-950 via-slate-900 to-black' },
  ];

  const themes: { id: ThemeName; title: string; desc: string }[] = [
    { id: 'aqua', title: 'Aqua Silver (High Sierra Original)', desc: 'Authentic 10.13 brushed aqua texture with metallic buttons' },
    { id: 'dark', title: 'Dark Sierra', desc: 'Sleek dark mode interface for low light environments' },
    { id: 'brushed', title: 'Brushed Aluminum', desc: 'Classic metallic hardware styling' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 rounded-lg shadow-2xl border border-gray-300 dark:border-neutral-700 overflow-hidden font-sans">
        {/* Title Bar */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-gradient-to-b from-gray-200 to-gray-300 dark:from-neutral-700 dark:to-neutral-800 border-b border-gray-300 dark:border-neutral-700">
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 border border-red-600 flex items-center justify-center text-[8px] font-bold text-red-950"
            >
              ✕
            </button>
            <span className="text-xs font-semibold">System Preferences</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preferences Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Themes & Appearance */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center space-x-1.5">
              <Monitor className="w-4 h-4 text-blue-500" />
              <span>Appearance & Aqua Theme</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onUpdatePreferences({ theme: t.id })}
                  className={`p-3 rounded-md border text-left transition-all relative ${
                    preferences.theme === t.id
                      ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/50 shadow-xs'
                      : 'border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-750 hover:border-gray-400'
                  }`}
                >
                  {preferences.theme === t.id && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                  <h4 className="font-bold text-xs mb-1">{t.title}</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Desktop Wallpapers */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
              Desktop Wallpapers
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {wallpapers.map((w) => (
                <button
                  key={w.id}
                  onClick={() => onUpdatePreferences({ wallpaper: w.id })}
                  className={`flex flex-col items-center group ${
                    preferences.wallpaper === w.id ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div
                    className={`w-full h-16 rounded-md bg-gradient-to-br ${w.color} border-2 transition-all ${
                      preferences.wallpaper === w.id
                        ? 'border-blue-600 ring-2 ring-blue-400 scale-105 shadow-md'
                        : 'border-gray-300 dark:border-neutral-700 opacity-80 group-hover:opacity-100'
                    }`}
                  />
                  <span className="text-[11px] mt-1.5 text-center truncate w-full">{w.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Sound & Audio */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center space-x-1.5">
              <Volume2 className="w-4 h-4 text-emerald-500" />
              <span>Sound & Speech Synthesis</span>
            </h3>
            <div className="bg-white dark:bg-neutral-750 p-4 rounded-md border border-gray-300 dark:border-neutral-700 space-y-3 text-xs">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.soundEffects}
                  onChange={(e) => onUpdatePreferences({ soundEffects: e.target.checked })}
                  className="rounded-xs text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium">Enable macOS High Sierra Audio Chimes (Web Audio API)</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.autoTtS}
                  onChange={(e) => onUpdatePreferences({ autoTtS: e.target.checked })}
                  className="rounded-xs text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium">Automatically Speak Assistant Responses (Text-to-Speech)</span>
              </label>
            </div>
          </div>

          {/* Section 4: Local Server & Simulation */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center space-x-1.5">
              <HardDrive className="w-4 h-4 text-purple-500" />
              <span>Local Model Server (Ollama / LM Studio)</span>
            </h3>
            <div className="bg-white dark:bg-neutral-750 p-4 rounded-md border border-gray-300 dark:border-neutral-700 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Local Server Endpoint URL
                  </label>
                  <input
                    type="text"
                    value={preferences.localServerUrl}
                    onChange={(e) => onUpdatePreferences({ localServerUrl: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-xs border border-gray-300 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-800 text-xs font-mono"
                    placeholder="http://localhost:11434"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Server Type
                  </label>
                  <select
                    value={preferences.localServerType}
                    onChange={(e) => onUpdatePreferences({ localServerType: e.target.value as 'ollama' | 'lmstudio' })}
                    className="w-full px-2.5 py-1.5 rounded-xs border border-gray-300 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-800 text-xs font-sans"
                  >
                    <option value="ollama">Ollama (localhost:11434)</option>
                    <option value="lmstudio">LM Studio (localhost:1234)</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center space-x-2 cursor-pointer pt-2 border-t border-gray-200 dark:border-neutral-700">
                <input
                  type="checkbox"
                  checked={preferences.simulationMode}
                  onChange={(e) => onUpdatePreferences({ simulationMode: e.target.value === 'true' || e.target.checked })}
                  className="rounded-xs text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="font-bold text-blue-600 dark:text-blue-400">Offline Metal 2 Fallback Simulation</span>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Allows testing local model responses with Metal 2 hardware offloading even if no local server is listening on localhost.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end px-4 py-2 bg-gray-200 dark:bg-neutral-750 border-t border-gray-300 dark:border-neutral-700">
          <button
            onClick={onClose}
            className="px-4 py-1 bg-gradient-to-b from-blue-500 to-blue-600 text-white rounded-sm text-xs font-semibold shadow-2xs hover:from-blue-600 hover:to-blue-700"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
