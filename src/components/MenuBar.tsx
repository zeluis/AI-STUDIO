import React, { useState, useEffect } from 'react';
import { MaterialIcon } from './MaterialIcon';
import { SystemTelemetry, SystemPreferences, ModelOption, ThemeName, WallpaperName } from '../types';
import { WALLPAPER_LIST, getDynamicWallpaperForHour } from '../data/wallpapers';
import { playChime } from '../lib/sound';

interface MenuBarProps {
  telemetry: SystemTelemetry;
  preferences: SystemPreferences;
  onUpdatePreferences: (updated: Partial<SystemPreferences>) => void;
  selectedModel: ModelOption;
  models: ModelOption[];
  onSelectModel: (model: ModelOption) => void;
  onOpenAboutMac: () => void;
  onOpenSysPrefs: () => void;
  onOpenActivityMonitor: () => void;
  onOpenLocalHub: () => void;
  onOpenPersonaStudio: () => void;
  onNewSession: () => void;
  onClearSession: () => void;
  onExportSession: (format: 'json' | 'txt') => void;
  onImportSession: () => void;
  onToggleInspector: () => void;
  onToggleTerminal: () => void;
  onToggleSound: () => void;
  onToggleSpeech: () => void;
  onTriggerSiri: () => void;
  onOpenInstaller: () => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  telemetry,
  preferences,
  onUpdatePreferences,
  selectedModel,
  models,
  onSelectModel,
  onOpenAboutMac,
  onOpenSysPrefs,
  onOpenActivityMonitor,
  onOpenLocalHub,
  onOpenPersonaStudio,
  onNewSession,
  onClearSession,
  onExportSession,
  onImportSession,
  onToggleInspector,
  onToggleTerminal,
  onToggleSound,
  onToggleSpeech,
  onTriggerSiri,
  onOpenInstaller,
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [timeString, setTimeString] = useState<string>('');
  const [currentHour, setCurrentHour] = useState<number>(new Date().getHours());

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentHour(now.getHours());
      const timeStr = now.toLocaleTimeString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
      setTimeString(timeStr);
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleDropdown = (e: React.MouseEvent, menuName: string) => {
    e.stopPropagation();
    playChime('click', preferences.soundEffects);
    setActiveDropdown(activeDropdown === menuName ? null : menuName);
  };

  const handleSelectWallpaper = (wId: WallpaperName) => {
    onUpdatePreferences({ wallpaper: wId });
    playChime('click', preferences.soundEffects);
    setActiveDropdown(null);
  };

  const isDarkTheme = preferences.theme === 'dark';
  const activeWallpaperItem = WALLPAPER_LIST.find((w) => w.id === preferences.wallpaper) || WALLPAPER_LIST[0];
  const dynamicInfo = getDynamicWallpaperForHour(currentHour);

  return (
    <header
      id="mac-top-menu-bar"
      className={`relative z-50 select-none flex items-center justify-between px-2 h-6 text-xs font-medium border-b shadow-xs transition-colors duration-200 ${
        isDarkTheme
          ? 'bg-neutral-900/90 text-neutral-200 border-neutral-800 backdrop-blur-md'
          : 'bg-gradient-to-b from-gray-100 to-gray-200/95 text-gray-900 border-gray-300/80 backdrop-blur-md'
      }`}
    >
      {/* Left Menu Items */}
      <nav id="mac-menu-nav" className="flex items-center space-x-1">
        {/* Apple Menu */}
        <div className="relative">
          <button
            id="apple-menu-btn"
            onClick={(e) => toggleDropdown(e, 'apple')}
            className={`px-2 py-0.5 rounded-sm flex items-center cursor-pointer ${
              activeDropdown === 'apple' ? 'bg-blue-600 text-white' : 'hover:bg-black/10 dark:hover:bg-white/10'
            }`}
            title="Apple Menu"
          >
            <span className="text-sm leading-none font-sans"></span>
          </button>

          {activeDropdown === 'apple' && (
            <div className="absolute left-0 top-full mt-0.5 w-64 bg-white/95 dark:bg-neutral-800/95 text-gray-800 dark:text-gray-100 rounded-b-md shadow-2xl border border-gray-300 dark:border-neutral-700 py-1 backdrop-blur-xl z-50 text-xs animate-fade-in">
              <button
                onClick={() => {
                  onOpenAboutMac();
                  setActiveDropdown(null);
                }}
                className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
              >
                <span>About HighSierra AI Studio...</span>
                <span className="text-[10px] opacity-60">10.13.6</span>
              </button>
              <button
                onClick={() => {
                  onOpenInstaller();
                  setActiveDropdown(null);
                }}
                className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between text-blue-600 dark:text-blue-400 font-semibold cursor-pointer"
              >
                <span>Install as Native App...</span>
                <span className="text-[10px] bg-blue-100 dark:bg-blue-900 px-1 rounded-sm">.command</span>
              </button>
              <div className="my-1 border-t border-gray-200 dark:border-neutral-700" />
              <button
                onClick={() => {
                  onOpenSysPrefs();
                  setActiveDropdown(null);
                }}
                className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
              >
                <span>System Preferences...</span>
                <span className="text-[10px] font-mono">⌘,</span>
              </button>
              <button
                onClick={() => {
                  onOpenActivityMonitor();
                  setActiveDropdown(null);
                }}
                className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
              >
                <span>Activity Monitor...</span>
                <span className="text-[10px] font-mono">⌘⌥M</span>
              </button>
              <div className="my-1 border-t border-gray-200 dark:border-neutral-700" />
              <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Quick Wallpapers
              </div>
              <button
                onClick={() => handleSelectWallpaper('highsierra')}
                className="w-full text-left px-4 py-1 hover:bg-blue-600 hover:text-white flex items-center justify-between text-[11px] cursor-pointer"
              >
                <span>macOS High Sierra Lake</span>
                {preferences.wallpaper === 'highsierra' && <MaterialIcon name="check" size={12} />}
              </button>
              <button
                onClick={() => handleSelectWallpaper('sunset')}
                className="w-full text-left px-4 py-1 hover:bg-blue-600 hover:text-white flex items-center justify-between text-[11px] cursor-pointer"
              >
                <span>High Sierra Sunset Glow</span>
                {preferences.wallpaper === 'sunset' && <MaterialIcon name="check" size={12} />}
              </button>
              <button
                onClick={() => handleSelectWallpaper('dynamic')}
                className="w-full text-left px-4 py-1 hover:bg-blue-600 hover:text-white flex items-center justify-between text-[11px] cursor-pointer font-semibold text-blue-600 dark:text-blue-400"
              >
                <span>Dynamic Time-of-Day Mode</span>
                {preferences.wallpaper === 'dynamic' && <MaterialIcon name="check" size={12} />}
              </button>
              <div className="my-1 border-t border-gray-200 dark:border-neutral-700" />
              <button
                onClick={() => {
                  window.location.reload();
                  setActiveDropdown(null);
                }}
                className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer"
              >
                Restart HighSierra Workspace...
              </button>
            </div>
          )}
        </div>

        {/* App Title */}
        <span className="font-bold px-1.5 text-xs text-gray-900 dark:text-white">HighSierra AI</span>

        {/* File Menu */}
        <div className="relative">
          <button
            onClick={(e) => toggleDropdown(e, 'file')}
            className={`px-2 py-0.5 rounded-sm cursor-pointer ${
              activeDropdown === 'file' ? 'bg-blue-600 text-white' : 'hover:bg-black/10 dark:hover:bg-white/10'
            }`}
          >
            File
          </button>

          {activeDropdown === 'file' && (
            <div className="absolute left-0 top-full mt-0.5 w-56 bg-white/95 dark:bg-neutral-800/95 text-gray-800 dark:text-gray-100 rounded-b-md shadow-2xl border border-gray-300 dark:border-neutral-700 py-1 backdrop-blur-xl z-50 text-xs animate-fade-in">
              <button
                onClick={() => {
                  onNewSession();
                  setActiveDropdown(null);
                }}
                className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between cursor-pointer"
              >
                <span>New Conversation</span>
                <span className="text-[10px] font-mono opacity-60">⌘N</span>
              </button>
              <button
                onClick={() => {
                  onExportSession('json');
                  setActiveDropdown(null);
                }}
                className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between cursor-pointer"
              >
                <span>Export Session as JSON...</span>
                <span className="text-[10px] font-mono opacity-60">⌘E</span>
              </button>
              <button
                onClick={() => {
                  onExportSession('txt');
                  setActiveDropdown(null);
                }}
                className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between cursor-pointer"
              >
                <span>Export Session as TXT...</span>
              </button>
              <button
                onClick={() => {
                  onImportSession();
                  setActiveDropdown(null);
                }}
                className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between cursor-pointer"
              >
                <span>Import Session File...</span>
                <span className="text-[10px] font-mono opacity-60">⌘O</span>
              </button>
              <div className="my-1 border-t border-gray-200 dark:border-neutral-700" />
              <button
                onClick={() => {
                  onClearSession();
                  setActiveDropdown(null);
                }}
                className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white text-red-600 dark:text-red-400 cursor-pointer"
              >
                Clear Conversation History
              </button>
            </div>
          )}
        </div>

        {/* Model Menu */}
        <div className="relative">
          <button
            onClick={(e) => toggleDropdown(e, 'model')}
            className={`px-2 py-0.5 rounded-sm cursor-pointer ${
              activeDropdown === 'model' ? 'bg-blue-600 text-white' : 'hover:bg-black/10 dark:hover:bg-white/10'
            }`}
          >
            Model
          </button>

          {activeDropdown === 'model' && (
            <div className="absolute left-0 top-full mt-0.5 w-72 bg-white/95 dark:bg-neutral-800/95 text-gray-800 dark:text-gray-100 rounded-b-md shadow-2xl border border-gray-300 dark:border-neutral-700 py-1 backdrop-blur-xl z-50 text-xs animate-fade-in">
              <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Cloud Google Gemini
              </div>
              {models
                .filter((m) => !m.isLocal)
                .map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSelectModel(m);
                      setActiveDropdown(null);
                    }}
                    className={`w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer ${
                      selectedModel.id === m.id ? 'font-bold text-blue-600 dark:text-blue-400' : ''
                    }`}
                  >
                    <span>{m.name}</span>
                    {selectedModel.id === m.id && <MaterialIcon name="check" size={14} />}
                  </button>
                ))}

              <div className="my-1 border-t border-gray-200 dark:border-neutral-700" />
              <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Local GGUF & Metal 2
              </div>
              {models
                .filter((m) => m.isLocal)
                .map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSelectModel(m);
                      setActiveDropdown(null);
                    }}
                    className={`w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer ${
                      selectedModel.id === m.id ? 'font-bold text-emerald-600 dark:text-emerald-400' : ''
                    }`}
                  >
                    <span>{m.name}</span>
                    {selectedModel.id === m.id && <MaterialIcon name="check" size={14} />}
                  </button>
                ))}

              <div className="my-1 border-t border-gray-200 dark:border-neutral-700" />
              <button
                onClick={() => {
                  onOpenLocalHub();
                  setActiveDropdown(null);
                }}
                className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white flex items-center space-x-1 font-semibold cursor-pointer"
              >
                <MaterialIcon name="dns" size={14} className="text-emerald-500 mr-1" />
                <span>Configure Local Hub...</span>
              </button>
            </div>
          )}
        </div>

        {/* Wallpaper Menu (Dedicated Top Menu Bar Switcher) */}
        <div className="relative">
          <button
            onClick={(e) => toggleDropdown(e, 'wallpaper')}
            className={`px-2 py-0.5 rounded-sm cursor-pointer flex items-center space-x-1 ${
              activeDropdown === 'wallpaper' ? 'bg-blue-600 text-white' : 'hover:bg-black/10 dark:hover:bg-white/10'
            }`}
          >
            <span>Wallpaper</span>
          </button>

          {activeDropdown === 'wallpaper' && (
            <div className="absolute left-0 top-full mt-0.5 w-80 bg-white/95 dark:bg-neutral-850/95 text-gray-800 dark:text-gray-100 rounded-b-md shadow-2xl border border-gray-300 dark:border-neutral-700 py-1.5 backdrop-blur-xl z-50 text-xs animate-fade-in">
              <div className="px-3 py-1 flex items-center justify-between border-b border-gray-200 dark:border-neutral-700 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  macOS High Sierra Desktop Pictures
                </span>
                <button
                  onClick={() => {
                    onOpenSysPrefs();
                    setActiveDropdown(null);
                  }}
                  className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Preferences...
                </button>
              </div>

              {/* Nature & Landscapes */}
              <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                California Landscapes & Nature
              </div>
              {WALLPAPER_LIST.filter((w) => w.category === 'nature').map((w) => (
                <button
                  key={w.id}
                  onClick={() => handleSelectWallpaper(w.id)}
                  className={`w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer ${
                    preferences.wallpaper === w.id ? 'font-bold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30' : ''
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate pr-2">
                    {w.imageSrc ? (
                      <img src={w.imageSrc} alt="" className="w-6 h-4 rounded-xs object-cover border border-black/20 shrink-0" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="w-6 h-4 rounded-xs border shrink-0" style={{ background: w.gradientFallback }} />
                    )}
                    <span className="truncate">{w.name}</span>
                  </div>
                  {preferences.wallpaper === w.id && <MaterialIcon name="check" size={14} className="shrink-0" />}
                </button>
              ))}

              {/* Dynamic Time-of-Day */}
              <div className="my-1 border-t border-gray-200 dark:border-neutral-700" />
              <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Dynamic 24-Hour Shifts
              </div>
              {WALLPAPER_LIST.filter((w) => w.category === 'dynamic').map((w) => (
                <button
                  key={w.id}
                  onClick={() => handleSelectWallpaper(w.id)}
                  className={`w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer ${
                    preferences.wallpaper === w.id ? 'font-bold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30' : ''
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate pr-2">
                    <img src={dynamicInfo.imageSrc} alt="" className="w-6 h-4 rounded-xs object-cover border border-black/20 shrink-0" referrerPolicy="no-referrer" />
                    <div className="truncate">
                      <div className="truncate">{w.name}</div>
                      <div className="text-[9px] text-gray-400 truncate">Current: {dynamicInfo.periodName}</div>
                    </div>
                  </div>
                  {preferences.wallpaper === w.id && <MaterialIcon name="check" size={14} className="shrink-0" />}
                </button>
              ))}

              {/* Classic Apple Textures */}
              <div className="my-1 border-t border-gray-200 dark:border-neutral-700" />
              <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Classic Apple Textures
              </div>
              {WALLPAPER_LIST.filter((w) => w.category === 'texture').map((w) => (
                <button
                  key={w.id}
                  onClick={() => handleSelectWallpaper(w.id)}
                  className={`w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer ${
                    preferences.wallpaper === w.id ? 'font-bold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30' : ''
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate pr-2">
                    <span className="w-6 h-4 rounded-xs border shrink-0" style={{ background: w.gradientFallback }} />
                    <span className="truncate">{w.name}</span>
                  </div>
                  {preferences.wallpaper === w.id && <MaterialIcon name="check" size={14} className="shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Menu */}
        <div className="relative">
          <button
            onClick={(e) => toggleDropdown(e, 'view')}
            className={`px-2 py-0.5 rounded-sm cursor-pointer ${
              activeDropdown === 'view' ? 'bg-blue-600 text-white' : 'hover:bg-black/10 dark:hover:bg-white/10'
            }`}
          >
            View
          </button>

          {activeDropdown === 'view' && (
            <div className="absolute left-0 top-full mt-0.5 w-64 bg-white/95 dark:bg-neutral-800/95 text-gray-800 dark:text-gray-100 rounded-b-md shadow-2xl border border-gray-300 dark:border-neutral-700 py-1 backdrop-blur-xl z-50 text-xs animate-fade-in">
              <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Desktop Appearance Theme
              </div>
              <button
                onClick={() => {
                  onUpdatePreferences({ theme: 'native' });
                  setActiveDropdown(null);
                }}
                className={`w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer ${
                  preferences.theme === 'native' ? 'font-bold text-blue-600' : ''
                }`}
              >
                <span>macOS 10.13 Native High Sierra</span>
                {preferences.theme === 'native' && <MaterialIcon name="check" size={14} />}
              </button>
              <button
                onClick={() => {
                  onUpdatePreferences({ theme: 'aqua' });
                  setActiveDropdown(null);
                }}
                className={`w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer ${
                  preferences.theme === 'aqua' ? 'font-bold text-blue-600' : ''
                }`}
              >
                <span>Aqua Silver Glass</span>
                {preferences.theme === 'aqua' && <MaterialIcon name="check" size={14} />}
              </button>
              <button
                onClick={() => {
                  onUpdatePreferences({ theme: 'brushed' });
                  setActiveDropdown(null);
                }}
                className={`w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer ${
                  preferences.theme === 'brushed' ? 'font-bold text-blue-600' : ''
                }`}
              >
                <span>Brushed Aluminum</span>
                {preferences.theme === 'brushed' && <MaterialIcon name="check" size={14} />}
              </button>
              <button
                onClick={() => {
                  onUpdatePreferences({ theme: 'dark' });
                  setActiveDropdown(null);
                }}
                className={`w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer ${
                  preferences.theme === 'dark' ? 'font-bold text-blue-600' : ''
                }`}
              >
                <span>Dark Sierra Style</span>
                {preferences.theme === 'dark' && <MaterialIcon name="check" size={14} />}
              </button>

              <div className="my-1 border-t border-gray-200 dark:border-neutral-700" />
              <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Desktop Background
              </div>
              <button
                onClick={() => handleSelectWallpaper('highsierra')}
                className="w-full text-left px-4 py-1 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
              >
                <span>High Sierra Hero Lake</span>
                {preferences.wallpaper === 'highsierra' && <MaterialIcon name="check" size={12} />}
              </button>
              <button
                onClick={() => handleSelectWallpaper('sunset')}
                className="w-full text-left px-4 py-1 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
              >
                <span>Sunset & Alpine Glow</span>
                {preferences.wallpaper === 'sunset' && <MaterialIcon name="check" size={12} />}
              </button>
              <button
                onClick={() => handleSelectWallpaper('granite')}
                className="w-full text-left px-4 py-1 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
              >
                <span>Yosemite El Capitan</span>
                {preferences.wallpaper === 'granite' && <MaterialIcon name="check" size={12} />}
              </button>
              <button
                onClick={() => handleSelectWallpaper('dynamic')}
                className="w-full text-left px-4 py-1 hover:bg-blue-600 hover:text-white flex items-center justify-between font-semibold text-blue-600 dark:text-blue-400 cursor-pointer"
              >
                <span>Dynamic Auto-Shift (24h)</span>
                {preferences.wallpaper === 'dynamic' && <MaterialIcon name="check" size={12} />}
              </button>

              <div className="my-1 border-t border-gray-200 dark:border-neutral-700" />
              <button
                onClick={() => {
                  onToggleInspector();
                  setActiveDropdown(null);
                }}
                className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between cursor-pointer"
              >
                <span>Toggle Model Inspector</span>
                <span className="text-[10px] font-mono opacity-60">⌘I</span>
              </button>
              <button
                onClick={() => {
                  onToggleTerminal();
                  setActiveDropdown(null);
                }}
                className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between cursor-pointer"
              >
                <span>Toggle HighSierra Shell</span>
                <span className="text-[10px] font-mono opacity-60">⌘T</span>
              </button>
            </div>
          )}
        </div>

        {/* Personas Menu */}
        <div className="relative">
          <button
            onClick={(e) => toggleDropdown(e, 'personas')}
            className={`px-2 py-0.5 rounded-sm cursor-pointer ${
              activeDropdown === 'personas' ? 'bg-blue-600 text-white' : 'hover:bg-black/10 dark:hover:bg-white/10'
            }`}
          >
            Persona
          </button>

          {activeDropdown === 'personas' && (
            <div className="absolute left-0 top-full mt-0.5 w-56 bg-white/95 dark:bg-neutral-800/95 text-gray-800 dark:text-gray-100 rounded-b-md shadow-2xl border border-gray-300 dark:border-neutral-700 py-1 backdrop-blur-xl z-50 text-xs animate-fade-in">
              <button
                onClick={() => {
                  onOpenPersonaStudio();
                  setActiveDropdown(null);
                }}
                className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white flex items-center space-x-1 font-semibold cursor-pointer"
              >
                <MaterialIcon name="psychology" size={14} className="text-purple-500 mr-1" />
                <span>Open Persona Studio...</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Right Telemetry, Modern Pill Triggers (Wallpaper, Voice, Siri) & Status */}
      <div className="flex items-center space-x-1.5 text-[11px] font-mono">
        {/* VRAM Live Usage Gauge */}
        <div
          className="hidden xl:flex items-center space-x-1 px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          onClick={onOpenActivityMonitor}
          title="Hardware VRAM Allocation (Metal 2 GPU)"
        >
          <MaterialIcon name="memory" size={12} className="text-blue-500" />
          <span className="text-[10px] font-medium">{telemetry.vramUsedGB}GB VRAM</span>
        </div>

        {/* Token Processing Speed */}
        <div
          className="hidden 2xl:flex items-center space-x-1 px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-emerald-600 dark:text-emerald-400 font-bold"
          title="Active Token Inference Speed"
        >
          <MaterialIcon name="speed" size={12} />
          <span className="text-[10px]">{telemetry.tokensPerSec} tok/s</span>
        </div>

        {/* Modern CSS Pill Group: Wallpaper & Voice Triggers (Positioned Close Together) */}
        <div className="flex items-center space-x-1 bg-black/5 dark:bg-white/5 p-0.5 rounded-full border border-black/10 dark:border-white/10 shadow-2xs">
          {/* Quick Wallpaper Switcher Pill */}
          <div className="relative">
            <button
              onClick={(e) => toggleDropdown(e, 'quick_wallpaper')}
              className={`flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full font-sans transition-all duration-150 cursor-pointer ${
                activeDropdown === 'quick_wallpaper'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white/80 dark:bg-neutral-800/80 hover:bg-white dark:hover:bg-neutral-700 text-gray-800 dark:text-gray-200 border border-black/5 dark:border-white/10'
              }`}
              title={`Active Wallpaper: ${activeWallpaperItem.name} (Click to switch desktop picture)`}
            >
              <MaterialIcon
                name="wallpaper"
                size={13}
                className={activeDropdown === 'quick_wallpaper' ? 'text-white' : 'text-sky-500'}
              />
              <span className="hidden sm:inline text-[10px] font-medium truncate max-w-[95px]">
                {preferences.wallpaper === 'dynamic'
                  ? `Dynamic: ${dynamicInfo.periodName.split(' ')[0]}`
                  : activeWallpaperItem.tag || 'Wallpaper'}
              </span>
              <MaterialIcon
                name="expand_more"
                size={11}
                className={activeDropdown === 'quick_wallpaper' ? 'text-white' : 'text-gray-400'}
              />
            </button>

            {activeDropdown === 'quick_wallpaper' && (
              <div className="absolute right-0 top-full mt-1.5 w-72 bg-white/95 dark:bg-neutral-850/95 text-gray-800 dark:text-gray-100 rounded-xl shadow-2xl border border-gray-300 dark:border-neutral-700 p-2.5 backdrop-blur-xl z-50 text-xs animate-fade-in">
                <div className="flex justify-between items-center pb-1.5 border-b border-gray-200 dark:border-neutral-700 mb-1.5">
                  <span className="font-bold text-[11px]">Desktop Pictures</span>
                  <button
                    onClick={() => {
                      onOpenSysPrefs();
                      setActiveDropdown(null);
                    }}
                    className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Preferences...
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {WALLPAPER_LIST.slice(0, 6).map((w) => {
                    const isCurrent = preferences.wallpaper === w.id;
                    return (
                      <button
                        key={w.id}
                        onClick={() => handleSelectWallpaper(w.id)}
                        className={`p-1 rounded-lg border text-left flex flex-col items-start cursor-pointer transition-all ${
                          isCurrent
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 font-bold text-blue-600 dark:text-blue-400'
                            : 'border-gray-200 dark:border-neutral-700 hover:border-blue-400'
                        }`}
                      >
                        <div className="w-full h-10 rounded-xs overflow-hidden mb-1 relative border border-black/10">
                          {w.imageSrc ? (
                            <img
                              src={w.imageSrc}
                              alt=""
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full" style={{ background: w.gradientFallback }} />
                          )}
                          {isCurrent && (
                            <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xs">
                              <MaterialIcon name="check" size={10} />
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] truncate w-full">{w.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Modern Voice / Speech Synthesis Trigger Pill */}
          <button
            onClick={onToggleSpeech}
            className={`flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full font-sans transition-all duration-150 cursor-pointer ${
              preferences.speechEnabled
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
                : 'bg-white/80 dark:bg-neutral-800/80 hover:bg-white dark:hover:bg-neutral-700 text-gray-500 border border-black/5 dark:border-white/10'
            }`}
            title={
              preferences.speechEnabled
                ? 'Speech Voice Synthesis is ON (Click to Mute Voice)'
                : 'Speech Voice Synthesis is OFF (Click to Enable Voice)'
            }
          >
            <MaterialIcon
              name={preferences.speechEnabled ? 'record_voice_over' : 'voice_over_off'}
              size={13}
              className={preferences.speechEnabled ? 'text-emerald-500 animate-pulse' : 'text-gray-400'}
            />
            <span className="hidden sm:inline text-[10px] font-medium">
              {preferences.speechEnabled ? 'Voice' : 'Mute'}
            </span>
          </button>
        </div>

        {/* Floating Siri AI Overlay Trigger Pill / Button */}
        <button
          id="siri-floating-trigger-btn"
          onClick={onTriggerSiri}
          className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 hover:from-purple-500 hover:to-sky-400 text-white shadow-xs hover:shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer font-sans"
          title="Open Floating Siri AI Assistant (Click or ⌥Space)"
        >
          <MaterialIcon name="auto_awesome" size={12} className="text-sky-200 animate-spin-slow" />
          <span className="text-[10px] font-bold tracking-tight">Siri</span>
        </button>

        {/* Chime Sound FX Toggle */}
        <button
          onClick={onToggleSound}
          className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 cursor-pointer transition-colors"
          title={preferences.soundEffects ? 'Sound FX Enabled (Click to Mute)' : 'Sound FX Muted'}
        >
          <MaterialIcon name={preferences.soundEffects ? 'volume_up' : 'volume_off'} size={13} />
        </button>

        {/* Wi-Fi Icon */}
        <span title="Wi-Fi: Connected to High Sierra AI Studio" className="px-0.5">
          <MaterialIcon name="wifi" size={13} className="text-gray-700 dark:text-gray-300" />
        </span>

        {/* Clock */}
        <span className="font-sans font-medium text-gray-800 dark:text-gray-200 pl-0.5 pr-1">{timeString}</span>
      </div>
    </header>
  );
};
