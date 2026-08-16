import React, { useRef, useState, useEffect } from 'react';
import { MaterialIcon } from './MaterialIcon';
import { SystemPreferences, ThemeName, WallpaperName } from '../types';
import { WALLPAPER_LIST, getDynamicWallpaperForHour } from '../data/wallpapers';

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
  const wallpaperInputRef = useRef<HTMLInputElement>(null);
  const [currentHour, setCurrentHour] = useState<number>(new Date().getHours());
  const [customUrlInput, setCustomUrlInput] = useState(preferences.customWallpaperUrl || '');

  useEffect(() => {
    const updateHour = () => setCurrentHour(new Date().getHours());
    const interval = setInterval(updateHour, 30000);
    return () => clearInterval(interval);
  }, []);

  const dynamicInfo = getDynamicWallpaperForHour(currentHour);

  const themes: { id: ThemeName; title: string; desc: string; preview: string }[] = [
    {
      id: 'native',
      title: 'macOS 10.13 Native High Sierra',
      desc: 'Translucent frosted silver chrome, graphite borders, and specular light',
      preview: 'bg-gradient-to-b from-gray-100 to-gray-300 text-gray-900 border-gray-400',
    },
    {
      id: 'aqua',
      title: 'Aqua Silver Glass',
      desc: 'Authentic 10.13 Aqua liquid styling with sapphire highlights',
      preview: 'bg-gradient-to-b from-blue-100 to-sky-200 text-blue-950 border-blue-400',
    },
    {
      id: 'brushed',
      title: 'Brushed Aluminum',
      desc: 'Classic horizontal metallic grain with chamfered bevels',
      preview: 'bg-gradient-to-b from-zinc-200 to-zinc-400 text-zinc-900 border-zinc-500',
    },
    {
      id: 'dark',
      title: 'Dark Sierra',
      desc: 'Charcoal graphite interface designed for low-light coding sessions',
      preview: 'bg-gradient-to-b from-neutral-800 to-neutral-950 text-neutral-100 border-neutral-700',
    },
  ];

  const handleCustomWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onUpdatePreferences({
          wallpaper: 'custom',
          customWallpaperUrl: event.target.result as string,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrlInput.trim()) {
      onUpdatePreferences({
        wallpaper: 'custom',
        customWallpaperUrl: customUrlInput.trim(),
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in select-none">
      <div className="w-full max-w-3xl bg-gray-100 dark:bg-neutral-850 text-gray-900 dark:text-neutral-100 rounded-lg shadow-2xl border border-gray-300 dark:border-neutral-700 overflow-hidden font-sans">
        {/* Title Bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-b from-gray-200 to-gray-300 dark:from-neutral-700 dark:to-neutral-800 border-b border-gray-300 dark:border-neutral-700 select-none">
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 border border-red-600 flex items-center justify-center text-[8px] font-bold text-red-950 cursor-pointer"
            >
              ✕
            </button>
            <span className="text-xs font-semibold flex items-center space-x-1">
              <MaterialIcon name="settings" size={14} className="text-gray-600 dark:text-gray-300" />
              <span>System Preferences — macOS 10.13.6 Desktop Pictures & Display</span>
            </span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer">
            <MaterialIcon name="close" size={16} />
          </button>
        </div>

        {/* Preferences Content Tabs / Sections */}
        <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* Section 1: Themes & Appearance */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center space-x-1.5">
              <MaterialIcon name="palette" size={16} className="text-blue-500" />
              <span>Appearance & Desktop Style</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {themes.map((t) => {
                const isSelected = preferences.theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => onUpdatePreferences({ theme: t.id })}
                    className={`p-3.5 rounded-lg border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 shadow-xs ring-2 ring-blue-400/50'
                        : 'border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-gray-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="font-bold text-xs text-gray-900 dark:text-white">{t.title}</h4>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <MaterialIcon name="check" size={12} />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight mb-2.5">
                        {t.desc}
                      </p>
                    </div>
                    <div className={`h-4 rounded-sm border ${t.preview} shadow-2xs`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Desktop Wallpapers & California Nature Pictures */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center space-x-1.5">
                <MaterialIcon name="wallpaper" size={16} className="text-purple-500" />
                <span>Native Apple High Sierra Nature & California Desktop Pictures</span>
              </h3>

              <input
                type="file"
                ref={wallpaperInputRef}
                onChange={handleCustomWallpaperUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => wallpaperInputRef.current?.click()}
                className="btn-macos px-2.5 py-1 text-xs flex items-center space-x-1 cursor-pointer"
              >
                <MaterialIcon name="add_photo_alternate" size={14} />
                <span>Upload Local File...</span>
              </button>
            </div>

            {/* Grid of Wallpapers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {WALLPAPER_LIST.map((w) => {
                const isSelected = preferences.wallpaper === w.id;
                const isDynamic = w.id === 'dynamic';

                return (
                  <button
                    key={w.id}
                    onClick={() => onUpdatePreferences({ wallpaper: w.id })}
                    className={`flex flex-col items-start p-2 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 shadow-md ring-2 ring-blue-400/50'
                        : 'border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-blue-400'
                    }`}
                  >
                    {/* Thumbnail Image Container */}
                    <div className="w-full h-24 rounded-md overflow-hidden border border-black/10 dark:border-white/10 mb-2 relative shadow-2xs group">
                      {isDynamic ? (
                        <>
                          <img
                            src={dynamicInfo.imageSrc}
                            alt="Dynamic time wallpaper"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-1.5 left-1.5 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded-full font-mono flex items-center space-x-1 shadow-sm backdrop-blur-xs">
                            <MaterialIcon name="schedule" size={10} className="text-amber-300" />
                            <span>{dynamicInfo.periodName.split(' ')[0]}</span>
                          </div>
                        </>
                      ) : w.imageSrc ? (
                        <img
                          src={w.imageSrc}
                          alt={w.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full" style={{ background: w.gradientFallback }} />
                      )}

                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg ring-2 ring-white">
                          <MaterialIcon name="check" size={14} />
                        </div>
                      )}

                      {w.tag && !isDynamic && (
                        <span className="absolute bottom-1.5 right-1.5 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-sm font-semibold backdrop-blur-xs">
                          {w.tag}
                        </span>
                      )}
                    </div>

                    <div className="w-full">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs truncate text-gray-900 dark:text-white">
                          {w.name}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5 leading-tight">
                        {w.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom URL Input Bar */}
            <form onSubmit={handleApplyCustomUrl} className="mt-3 flex items-center space-x-2">
              <input
                type="text"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="Or paste any custom image URL (https://...)"
                className="flex-1 px-3 py-1.5 text-xs rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-blue-500"
              />
              <button
                type="submit"
                className="btn-macos px-3 py-1.5 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <MaterialIcon name="link" size={14} />
                <span>Apply URL</span>
              </button>
            </form>

            {/* Wallpaper Blur & Dimming Controls */}
            <div className="mt-4 p-3.5 bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="flex items-center space-x-1">
                      <MaterialIcon name="blur_on" size={14} className="text-blue-500" />
                      <span>Desktop Blur Radius</span>
                    </span>
                    <span className="font-mono text-blue-600 font-bold">{preferences.wallpaperBlur || 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={preferences.wallpaperBlur || 0}
                    onChange={(e) => onUpdatePreferences({ wallpaperBlur: Number(e.target.value) })}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="flex items-center space-x-1">
                      <MaterialIcon name="brightness_medium" size={14} className="text-amber-500" />
                      <span>Desktop Dimming (Darkness)</span>
                    </span>
                    <span className="font-mono text-amber-600 font-bold">{preferences.wallpaperDim || 0}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="5"
                    value={preferences.wallpaperDim || 0}
                    onChange={(e) => onUpdatePreferences({ wallpaperDim: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Sound & Speech Synthesis */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center space-x-1.5">
              <MaterialIcon name="record_voice_over" size={16} className="text-emerald-500" />
              <span>Sound & Speech Synthesis</span>
            </h3>
            <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-gray-300 dark:border-neutral-700 space-y-3 text-xs">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.soundEffects}
                  onChange={(e) => onUpdatePreferences({ soundEffects: e.target.checked })}
                  className="rounded-xs text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="font-medium">Enable macOS High Sierra Audio Chimes (Web Audio API)</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.autoTtS}
                  onChange={(e) => onUpdatePreferences({ autoTtS: e.target.checked })}
                  className="rounded-xs text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="font-medium">Automatically Speak Assistant Responses (Text-to-Speech)</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-200 dark:border-neutral-700">
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Speech Rate ({preferences.speechRate || 1.0}x)
                  </label>
                  <input
                    type="range"
                    min="0.75"
                    max="1.5"
                    step="0.05"
                    value={preferences.speechRate || 1.0}
                    onChange={(e) => onUpdatePreferences({ speechRate: Number(e.target.value) })}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Speech Pitch ({preferences.speechPitch || 1.0})
                  </label>
                  <input
                    type="range"
                    min="0.8"
                    max="1.2"
                    step="0.05"
                    value={preferences.speechPitch || 1.0}
                    onChange={(e) => onUpdatePreferences({ speechPitch: Number(e.target.value) })}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Local Model Server */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center space-x-1.5">
              <MaterialIcon name="dns" size={16} className="text-purple-500" />
              <span>Local Model Server (Ollama / LM Studio)</span>
            </h3>
            <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-gray-300 dark:border-neutral-700 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Local Server Endpoint URL
                  </label>
                  <input
                    type="text"
                    value={preferences.localServerUrl}
                    onChange={(e) => onUpdatePreferences({ localServerUrl: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-xs border border-gray-300 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-750 text-xs font-mono"
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
                    className="w-full px-2.5 py-1.5 rounded-xs border border-gray-300 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-750 text-xs font-sans cursor-pointer"
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
                  onChange={(e) => onUpdatePreferences({ simulationMode: e.target.checked })}
                  className="rounded-xs text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-blue-600 dark:text-blue-400">Offline Metal 2 Fallback Simulation</span>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Allows testing local model responses with Metal 2 hardware offloading simulation even if no local server is active on localhost.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end px-4 py-2.5 bg-gray-200 dark:bg-neutral-800 border-t border-gray-300 dark:border-neutral-700">
          <button
            onClick={onClose}
            className="btn-macos-primary px-5 py-1.5 text-xs font-semibold shadow-xs cursor-pointer"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
