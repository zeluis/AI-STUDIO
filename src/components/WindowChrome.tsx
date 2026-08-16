import React, { useState, useRef, useEffect } from 'react';
import { MaterialIcon } from './MaterialIcon';
import { ModelOption, SystemPreferences, Persona, ThemeName } from '../types';

interface WindowChromeProps {
  preferences: SystemPreferences;
  onUpdateTheme: (theme: ThemeName) => void;
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
  onUpdateTheme,
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
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getChromeClass = () => {
    switch (preferences.theme) {
      case 'native':
        return 'chrome-native text-gray-900';
      case 'aqua':
        return 'chrome-aqua text-blue-950';
      case 'dark':
        return 'chrome-dark text-neutral-100';
      case 'brushed':
      default:
        return 'chrome-brushed text-stone-900';
    }
  };

  const getThemeDisplayName = () => {
    switch (preferences.theme) {
      case 'native':
        return 'macOS 10.13 Native';
      case 'aqua':
        return 'Aqua Silver';
      case 'dark':
        return 'Dark Sierra';
      case 'brushed':
        return 'Brushed Aluminum';
    }
  };

  return (
    <div
      id="mac-window-chrome"
      className={`select-none flex flex-wrap items-center justify-between px-3 py-2 border-b transition-colors duration-200 ${getChromeClass()}`}
    >
      {/* Left: Authentic High Sierra Traffic Lights & Title */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 group">
          <button
            onClick={() => window.location.reload()}
            className="w-3 h-3 rounded-full traffic-light-red shadow-xs flex items-center justify-center text-[8px] font-bold text-red-950 opacity-90 group-hover:opacity-100 cursor-pointer"
            title="Close / Reload High Sierra AI Studio"
          >
            <span className="opacity-0 group-hover:opacity-100">✕</span>
          </button>
          <button
            className="w-3 h-3 rounded-full traffic-light-yellow shadow-xs flex items-center justify-center text-[8px] font-bold text-amber-950 opacity-90 group-hover:opacity-100 cursor-pointer"
            title="Minimize Window"
          >
            <span className="opacity-0 group-hover:opacity-100">−</span>
          </button>
          <button
            onClick={onOpenSysPrefs}
            className="w-3 h-3 rounded-full traffic-light-green shadow-xs flex items-center justify-center text-[8px] font-bold text-emerald-950 opacity-90 group-hover:opacity-100 cursor-pointer"
            title="Expand / System Preferences"
          >
            <span className="opacity-0 group-hover:opacity-100">+</span>
          </button>
        </div>

        {/* Window Title & Persona Badge */}
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
        <div className="flex rounded-md p-0.5 bg-black/10 dark:bg-black/40 border border-black/10 dark:border-white/10 text-xs font-medium shadow-inner">
          <button
            onClick={() => onChangeTab('chat')}
            className={`px-3 py-1 rounded-xs flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-300 shadow-xs font-semibold'
                : 'hover:text-blue-600 dark:hover:text-blue-300 opacity-80'
            }`}
          >
            <MaterialIcon name="chat" size={14} />
            <span>AI Workspace</span>
          </button>

          <button
            onClick={() => onChangeTab('local')}
            className={`px-3 py-1 rounded-xs flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'local'
                ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-300 shadow-xs font-semibold'
                : 'hover:text-blue-600 dark:hover:text-blue-300 opacity-80'
            }`}
          >
            <MaterialIcon name="dns" size={14} />
            <span>Local Hub</span>
            {selectedModel.isLocal && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => onChangeTab('personas')}
            className={`px-3 py-1 rounded-xs flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'personas'
                ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-300 shadow-xs font-semibold'
                : 'hover:text-blue-600 dark:hover:text-blue-300 opacity-80'
            }`}
          >
            <MaterialIcon name="psychology" size={14} />
            <span>Persona Studio</span>
          </button>

          <button
            onClick={() => onChangeTab('telemetry')}
            className={`px-3 py-1 rounded-xs flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'telemetry'
                ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-300 shadow-xs font-semibold'
                : 'hover:text-blue-600 dark:hover:text-blue-300 opacity-80'
            }`}
          >
            <MaterialIcon name="monitoring" size={14} />
            <span>Telemetry</span>
          </button>
        </div>
      </div>

      {/* Right: Theme Switcher, Model Badge & Inspector / Terminal Buttons */}
      <div className="flex items-center space-x-2">
        {/* Style / Theme Dropdown Trigger */}
        <div className="relative" ref={themeMenuRef}>
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="px-2 py-0.5 rounded-sm border border-black/15 dark:border-white/15 bg-white/50 dark:bg-neutral-800/50 hover:bg-white/80 dark:hover:bg-neutral-700 text-[11px] font-medium flex items-center space-x-1 shadow-2xs cursor-pointer"
            title="Change Desktop Appearance Style"
          >
            <MaterialIcon name="palette" size={12} className="text-purple-600 dark:text-purple-400" />
            <span>{getThemeDisplayName()}</span>
            <MaterialIcon name="expand_more" size={12} />
          </button>

          {showThemeMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-neutral-800 rounded-md shadow-xl border border-gray-300 dark:border-neutral-700 py-1 z-30 text-xs">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Desktop Appearance
              </div>
              <button
                onClick={() => {
                  onUpdateTheme('native');
                  setShowThemeMenu(false);
                }}
                className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-500 hover:text-white ${
                  preferences.theme === 'native' ? 'font-bold text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                <span>macOS 10.13 Native</span>
                {preferences.theme === 'native' && <MaterialIcon name="check" size={12} />}
              </button>
              <button
                onClick={() => {
                  onUpdateTheme('aqua');
                  setShowThemeMenu(false);
                }}
                className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-500 hover:text-white ${
                  preferences.theme === 'aqua' ? 'font-bold text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                <span>Aqua Silver Glass</span>
                {preferences.theme === 'aqua' && <MaterialIcon name="check" size={12} />}
              </button>
              <button
                onClick={() => {
                  onUpdateTheme('brushed');
                  setShowThemeMenu(false);
                }}
                className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-500 hover:text-white ${
                  preferences.theme === 'brushed' ? 'font-bold text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                <span>Brushed Aluminum</span>
                {preferences.theme === 'brushed' && <MaterialIcon name="check" size={12} />}
              </button>
              <button
                onClick={() => {
                  onUpdateTheme('dark');
                  setShowThemeMenu(false);
                }}
                className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-500 hover:text-white ${
                  preferences.theme === 'dark' ? 'font-bold text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                <span>Dark Sierra</span>
                {preferences.theme === 'dark' && <MaterialIcon name="check" size={12} />}
              </button>
            </div>
          )}
        </div>

        {/* Model Indicator Badge */}
        <div
          className={`px-2 py-0.5 rounded-sm border text-[11px] font-mono flex items-center space-x-1 ${
            selectedModel.isLocal
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800'
              : 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800'
          }`}
          title={selectedModel.description}
        >
          <MaterialIcon name="layers" size={12} />
          <span className="font-semibold">{selectedModel.name}</span>
        </div>

        {/* New Session Button */}
        <button
          onClick={onNewSession}
          className="p-1 rounded-md btn-macos text-gray-700 dark:text-gray-200 cursor-pointer shadow-2xs"
          title="New AI Chat Session (⌘N)"
        >
          <MaterialIcon name="add" size={14} />
        </button>

        {/* Toggle Inspector */}
        <button
          onClick={onToggleInspector}
          className={`p-1 rounded-md border transition-colors shadow-2xs cursor-pointer ${
            showInspector
              ? 'bg-blue-600 text-white border-blue-700'
              : 'btn-macos text-gray-700 dark:text-gray-200'
          }`}
          title="Toggle Model Parameter Inspector"
        >
          <MaterialIcon name="tune" size={14} />
        </button>

        {/* Toggle Terminal */}
        <button
          onClick={onToggleTerminal}
          className={`p-1 rounded-md border transition-colors shadow-2xs cursor-pointer ${
            showTerminal
              ? 'bg-neutral-900 text-green-400 border-neutral-950'
              : 'btn-macos text-gray-700 dark:text-gray-200'
          }`}
          title="Toggle HighSierra Terminal Shell"
        >
          <MaterialIcon name="terminal" size={14} />
        </button>
      </div>
    </div>
  );
};
