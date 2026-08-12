import React from 'react';
import { SlidersHorizontal, Terminal, HardDrive, Cpu, Plus, Sparkles, MessageSquare, Layers } from 'lucide-react';
import { ModelOption, SystemPreferences, Persona } from '../types';

interface WindowChromeProps {
  preferences: SystemPreferences;
  selectedModel: ModelOption;
  selectedPersona: Persona;
  activeTab: 'chat' | 'local' | 'personas' | 'telemetry';
  onChangeTab: (tab: 'chat' | 'local' | 'personas' | 'telemetry') => void;
  showInspector: boolean;
  onToggleInspector: () => void;
  showTerminal: boolean;
  onToggleTerminal: () => void;
  onNewSession: () => void;
  onOpenSysPrefs: () => void;
}

export const WindowChrome: React.FC<WindowChromeProps> = ({
  preferences,
  selectedModel,
  selectedPersona,
  activeTab,
  onChangeTab,
  showInspector,
  onToggleInspector,
  showTerminal,
  onToggleTerminal,
  onNewSession,
  onOpenSysPrefs,
}) => {
  const isAqua = preferences.theme === 'aqua';
  const isDark = preferences.theme === 'dark';

  return (
    <div
      id="mac-window-chrome"
      className={`select-none flex flex-wrap items-center justify-between px-3 py-2 border-b shadow-xs transition-colors duration-200 ${
        isDark
          ? 'bg-gradient-to-b from-neutral-800 to-neutral-900 border-neutral-700 text-neutral-100'
          : isAqua
          ? 'bg-gradient-to-b from-gray-200 via-gray-100 to-gray-300 border-gray-400/90 text-gray-900'
          : 'bg-gradient-to-b from-stone-200 via-stone-100 to-stone-300 border-stone-400 text-stone-900' // Brushed Metal
      }`}
    >
      {/* Left: Traffic Lights & Title */}
      <div className="flex items-center space-x-3">
        {/* Authentic Traffic Lights */}
        <div className="flex items-center space-x-2 group">
          <button
            onClick={() => window.location.reload()}
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 border border-red-600/60 shadow-xs flex items-center justify-center text-[8px] font-bold text-red-950 opacity-90 group-hover:opacity-100"
            title="Close / Reload App"
          >
            <span className="opacity-0 group-hover:opacity-100">✕</span>
          </button>
          <button
            className="w-3 h-3 rounded-full bg-amber-400 hover:bg-amber-500 border border-amber-600/60 shadow-xs flex items-center justify-center text-[8px] font-bold text-amber-950 opacity-90 group-hover:opacity-100"
            title="Minimize Window"
          >
            <span className="opacity-0 group-hover:opacity-100">−</span>
          </button>
          <button
            onClick={onOpenSysPrefs}
            className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-600 border border-emerald-600/60 shadow-xs flex items-center justify-center text-[8px] font-bold text-emerald-950 opacity-90 group-hover:opacity-100"
            title="Expand / System Preferences"
          >
            <span className="opacity-0 group-hover:opacity-100">+</span>
          </button>
        </div>

        {/* Window Title & Active Persona Badge */}
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-xs tracking-tight">HighSierra AI Studio</span>
          <span className="text-[10px] bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-full flex items-center space-x-1 font-mono">
            <span>{selectedPersona.avatar}</span>
            <span>{selectedPersona.name}</span>
          </span>
        </div>
      </div>

      {/* Center: High Sierra Segmented Navigation Tabs */}
      <div className="flex items-center my-1 sm:my-0">
        <div className="flex rounded-md p-0.5 bg-black/10 dark:bg-black/30 border border-black/10 dark:border-white/10 text-xs font-medium shadow-inner">
          <button
            onClick={() => onChangeTab('chat')}
            className={`px-3 py-1 rounded-xs flex items-center space-x-1.5 transition-all ${
              activeTab === 'chat'
                ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-300 shadow-xs font-semibold'
                : 'hover:text-blue-600 dark:hover:text-blue-300 opacity-80'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>AI Workspace</span>
          </button>

          <button
            onClick={() => onChangeTab('local')}
            className={`px-3 py-1 rounded-xs flex items-center space-x-1.5 transition-all ${
              activeTab === 'local'
                ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-300 shadow-xs font-semibold'
                : 'hover:text-blue-600 dark:hover:text-blue-300 opacity-80'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Local Hub</span>
            {selectedModel.isLocal && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => onChangeTab('personas')}
            className={`px-3 py-1 rounded-xs flex items-center space-x-1.5 transition-all ${
              activeTab === 'personas'
                ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-300 shadow-xs font-semibold'
                : 'hover:text-blue-600 dark:hover:text-blue-300 opacity-80'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Persona Studio</span>
          </button>

          <button
            onClick={() => onChangeTab('telemetry')}
            className={`px-3 py-1 rounded-xs flex items-center space-x-1.5 transition-all ${
              activeTab === 'telemetry'
                ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-300 shadow-xs font-semibold'
                : 'hover:text-blue-600 dark:hover:text-blue-300 opacity-80'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Telemetry</span>
          </button>
        </div>
      </div>

      {/* Right: Action Buttons & Active Model Badge */}
      <div className="flex items-center space-x-2">
        {/* Model Indicator Badge */}
        <div
          className={`px-2 py-0.5 rounded-sm border text-[11px] font-mono flex items-center space-x-1 ${
            selectedModel.isLocal
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800'
              : 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800'
          }`}
          title={selectedModel.description}
        >
          <Layers className="w-3 h-3" />
          <span className="font-semibold">{selectedModel.name}</span>
        </div>

        {/* New Session Button */}
        <button
          onClick={onNewSession}
          className="p-1 rounded-md bg-white/60 dark:bg-neutral-700/60 border border-black/10 dark:border-white/10 hover:bg-white dark:hover:bg-neutral-700 transition-colors shadow-2xs"
          title="New AI Chat Session (⌘N)"
        >
          <Plus className="w-3.5 h-3.5 text-gray-700 dark:text-gray-200" />
        </button>

        {/* Toggle Inspector */}
        <button
          onClick={onToggleInspector}
          className={`p-1.5 rounded-md border transition-colors shadow-2xs ${
            showInspector
              ? 'bg-blue-600 text-white border-blue-700'
              : 'bg-white/60 dark:bg-neutral-700/60 border-black/10 dark:border-white/10 hover:bg-white dark:hover:bg-neutral-700'
          }`}
          title="Toggle Model Parameter Inspector"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>

        {/* Toggle Terminal */}
        <button
          onClick={onToggleTerminal}
          className={`p-1.5 rounded-md border transition-colors shadow-2xs ${
            showTerminal
              ? 'bg-neutral-900 text-green-400 border-neutral-950'
              : 'bg-white/60 dark:bg-neutral-700/60 border-black/10 dark:border-white/10 hover:bg-white dark:hover:bg-neutral-700'
          }`}
          title="Toggle HighSierra Terminal Shell"
        >
          <Terminal className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
