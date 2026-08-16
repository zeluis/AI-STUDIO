import React, { useState, useEffect } from 'react';
import { Apple, Wifi, Volume2, VolumeX, Sparkles, Cpu, HardDrive } from 'lucide-react';
import { SystemTelemetry, SystemPreferences, ModelOption } from '../types';
import { playChime } from '../lib/sound';

interface MenuBarProps {
  telemetry: SystemTelemetry;
  preferences: SystemPreferences;
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
  onExportSession: () => void;
  onImportSession: () => void;
  onToggleInspector: () => void;
  onToggleTerminal: () => void;
  onToggleSound: () => void;
  onTriggerSiri: () => void;
  onOpenInstaller: () => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  telemetry,
  preferences,
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
  onTriggerSiri,
  onOpenInstaller,
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
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

  const isDarkTheme = preferences.theme === 'dark';

  return (
    <header
      id="mac-top-menu-bar"
      className={`relative z-50 select-none flex items-center justify-between px-2 h-6 text-xs font-medium border-b shadow-xs transition-colors duration-200 ${
        isDarkTheme
          ? 'bg-neutral-900/90 text-neutral-200 border-neutral-800 backdrop-blur-md'
          : 'bg-linear-to-b from-gray-100 to-gray-200/95 text-gray-900 border-gray-300/80 backdrop-blur-md'
      }`}
    >
      {/* Left Menu Items */}
      <nav id="mac-menu-nav" className="flex items-center space-x-1">
        {/* Apple Icon */}
        <div className="relative">
          <button
            id="apple-menu-btn"
            onClick={(e) => toggleDropdown(e, 'apple')}
            className={`px-2 py-0.5 rounded-sm flex items-center cursor-default ${
              activeDropdown === 'apple' ? 'bg-blue-600 text-white' : 'hover:bg-black/10 dark:hover:bg-white/10'
            }`}
            title="Apple Menu"
          >
            <Apple className="w-3.5 h-3.5 fill-current" />
          </button>

          {activeDropdown === 'apple' && (
            <div className="absolute left-0 top-full mt-0.5 w-60 bg-white/95 dark:bg-neutral-800/95 text-gray-800 dark:text-gray-100 rounded-b-md shadow-2xl border border-gray-300 dark:border-neutral-700 py-1 backdrop-blur-xl z-50 text-xs">
              <button
                onClick={() => {
                  onOpenAboutMac();
                  setActiveDropdown(null);
                }}
                className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between"
              >
                <span>About HighSierra AI Studio...</span>
                <span className="text-[10px] opacity-60">10.13.6</span>
              </button>
              <button
                onClick={() => {
                  onOpenInstaller();
                  setActiveDropdown(null);
                }}
                className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between text-blue-600 dark:text-blue-400 font-semibold"
              >
                <span>Install as Native App...</span>
                <span className="text-[10px] bg-blue-100 dark:bg-blue-900 px-1 rounded-sm">.pkg</span>
              </button>
              <div className="my-1 border-t border-gray-200 dark:border-neutral-700" />
              <button
                onClick={() => {
                  onOpenSysPrefs();
                  setActiveDropdown(null);
                }}
                className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white"
              >
                System Preferences...
              </button>
              <button
                onClick={() => {
                  onOpenActivityMonitor();
                  setActiveDropdown(null);
                }}
                className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between"
              >
                <span>Activity Monitor</span>
                <span className="text-[10px] font-mono opacity-60">Metal 2</span>
              </button>
              <button
                onClick={() => {
                  onOpenLocalHub();
                  setActiveDropdown(null);
                }}
                className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between"
              >
                <span>Local Model Hub (Ollama / LM Studio)</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-1 rounded-sm">Hub</span>
              </button>
              <button
                onClick={() => {
                  onOpenPersonaStudio();
                  setActiveDropdown(null);
                }}
                className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white"
              >
                System Persona Studio...
              </button>
              <div className="my-1 border-t border-gray-200 dark:border-neutral-700" />
              <button
                onClick={() => {
                  onClearSession();
                  setActiveDropdown(null);
                }}
                className="w-full text-left px-4 py-1.5 hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400"
              >
                Clear Active Chat Session
              </button>
            </div>
          )}
        </div>

        {/* App Title */}
        <span className="font-bold px-2 py-0.5">HighSierra AI</span>

        {/* File Menu */}
        <div className="relative">
          <button
            onClick={(e) => toggleDropdown(e, 'file')}
            className={`px-2 py-0.5 rounded-sm cursor-default ${
              activeDropdown === 'file' ? 'bg-blue-600 text-white' : 'hover:bg-black/10 dark:hover:bg-white/10'
            }`}
          >
            File
          </button>

          {activeDropdown === 'file' && (
            <div className="absolute left-0 top-full mt-0.5 w-56 bg-white/95 dark:bg-neutral-800/95 text-gray-800 dark:text-gray-100 rounded-b-md shadow-2xl border border-gray-300 dark:border-neutral-700 py-1 backdrop-blur-xl z-50 text-xs">
              <button
                onClick={() => {
                  onNewSession();
                  setActiveDropdown(null);
                }}
                className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between"
              >
                <span>New AI Chat Session</span>
                <span className="text-[10px] opacity-60">⌘N</span>
              </button>
              <button
                onClick={() => {
                  onExportSession();
                  setActiveDropdown(null);
                }}
                className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between"
              >
                <span>Export Session to APFS JSON...</span>
                <span className="text-[10px] opacity-60">⌘E</span>
              </button>
              <button
                onClick={() => {
                  onImportSession();
                  setActiveDropdown(null);
                }}
                className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between"
              >
                <span>Import Chat JSON...</span>
                <span className="text-[10px] opacity-60">⌘I</span>
              </button>
            </div>
          )}
        </div>

        {/* Model Menu */}
        <div className="relative">
          <button
            onClick={(e) => toggleDropdown(e, 'models')}
            className={`px-2 py-0.5 rounded-sm cursor-default ${
              activeDropdown === 'models' ? 'bg-blue-600 text-white' : 'hover:bg-black/10 dark:hover:bg-white/10'
            }`}
          >
            Model
          </button>

          {activeDropdown === 'models' && (
            <div className="absolute left-0 top-full mt-0.5 w-64 bg-white/95 dark:bg-neutral-800/95 text-gray-800 dark:text-gray-100 rounded-b-md shadow-2xl border border-gray-300 dark:border-neutral-700 py-1 backdrop-blur-xl z-50 text-xs">
              <div className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-gray-400">
                Cloud Models (Gemini Engine)
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
                    className={`w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between ${
                      selectedModel.id === m.id ? 'font-bold bg-blue-50 dark:bg-neutral-700/60' : ''
                    }`}
                  >
                    <span>{m.name}</span>
                    {selectedModel.id === m.id && <span className="text-blue-600 dark:text-blue-400">✓</span>}
                  </button>
                ))}

              <div className="my-1 border-t border-gray-200 dark:border-neutral-700" />
              <div className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-gray-400 flex justify-between items-center">
                <span>Local Models (Ollama / LM Studio)</span>
                <span className="text-[9px] text-green-600 dark:text-green-400">Metal 2</span>
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
                    className={`w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between ${
                      selectedModel.id === m.id ? 'font-bold bg-blue-50 dark:bg-neutral-700/60' : ''
                    }`}
                  >
                    <span className="truncate pr-2">{m.name}</span>
                    {selectedModel.id === m.id && <span className="text-blue-600 dark:text-blue-400">✓</span>}
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* View Menu */}
        <div className="relative">
          <button
            onClick={(e) => toggleDropdown(e, 'view')}
            className={`px-2 py-0.5 rounded-sm cursor-default ${
              activeDropdown === 'view' ? 'bg-blue-600 text-white' : 'hover:bg-black/10 dark:hover:bg-white/10'
            }`}
          >
            View
          </button>

          {activeDropdown === 'view' && (
            <div className="absolute left-0 top-full mt-0.5 w-56 bg-white/95 dark:bg-neutral-800/95 text-gray-800 dark:text-gray-100 rounded-b-md shadow-2xl border border-gray-300 dark:border-neutral-700 py-1 backdrop-blur-xl z-50 text-xs">
              <button
                onClick={() => {
                  onToggleInspector();
                  setActiveDropdown(null);
                }}
                className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white"
              >
                Toggle Model Parameters Inspector
              </button>
              <button
                onClick={() => {
                  onToggleTerminal();
                  setActiveDropdown(null);
                }}
                className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white"
              >
                Toggle HighSierra Terminal Shell
              </button>
              <div className="my-1 border-t border-gray-200 dark:border-neutral-700" />
              <button
                onClick={() => {
                  onOpenSysPrefs();
                  setActiveDropdown(null);
                }}
                className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white"
              >
                Change Wallpaper & Aqua Theme...
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Right Menu Status Items */}
      <div id="mac-menu-status" className="flex items-center space-x-2 text-[11px] font-mono">
        {/* VRAM Indicator */}
        <button
          onClick={onOpenActivityMonitor}
          className="hidden sm:flex items-center space-x-1 px-1.5 py-0.5 rounded-sm hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
          title="Metal 2 VRAM Allocation"
        >
          <HardDrive className="w-3 h-3 text-blue-500" />
          <span>{telemetry.vramUsedGB.toFixed(1)}GB</span>
        </button>

        {/* CPU Load Indicator */}
        <button
          onClick={onOpenActivityMonitor}
          className="hidden md:flex items-center space-x-1 px-1.5 py-0.5 rounded-sm hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
          title="CPU Usage %"
        >
          <Cpu className="w-3 h-3 text-emerald-500" />
          <span>{telemetry.cpuUsagePercent}%</span>
        </button>

        {/* Wi-Fi Icon */}
        <Wifi className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          className="p-1 rounded-sm hover:bg-black/10 dark:hover:bg-white/10"
          title={preferences.soundEffects ? 'Mute Chimes' : 'Enable Chimes'}
        >
          {preferences.soundEffects ? (
            <Volume2 className="w-3.5 h-3.5 text-gray-800 dark:text-gray-200" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-gray-400" />
          )}
        </button>

        {/* Clock */}
        <span className="px-1 text-gray-800 dark:text-gray-200 font-sans font-medium">{timeString}</span>

        {/* Siri Trigger Button */}
        <button
          id="siri-ai-trigger"
          onClick={() => {
            playChime('siri', preferences.soundEffects);
            onTriggerSiri();
          }}
          className="flex items-center justify-center w-5 h-5 rounded-full bg-linear-to-tr from-sky-400 via-indigo-500 to-fuchsia-500 hover:scale-105 active:scale-95 transition-transform shadow-xs"
          title="Trigger Siri AI Voice / Quick Prompt"
        >
          <Sparkles className="w-3 h-3 text-white animate-pulse" />
        </button>
      </div>
    </header>
  );
};
