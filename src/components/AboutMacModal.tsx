import React, { useState } from 'react';
import { MaterialIcon } from './MaterialIcon';
import { SystemTelemetry, SystemPreferences } from '../types';

interface AboutMacModalProps {
  telemetry: SystemTelemetry;
  preferences: SystemPreferences;
  onClose: () => void;
  onOpenSysPrefs: () => void;
}

export const AboutMacModal: React.FC<AboutMacModalProps> = ({
  telemetry,
  preferences,
  onClose,
  onOpenSysPrefs,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'displays' | 'storage' | 'support'>('overview');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 rounded-lg shadow-2xl border border-gray-300 dark:border-neutral-700 overflow-hidden font-sans">
        {/* Header Title Bar */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-gradient-to-b from-gray-200 to-gray-300 dark:from-neutral-700 dark:to-neutral-800 border-b border-gray-300 dark:border-neutral-700 select-none">
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 border border-red-600 flex items-center justify-center text-[8px] font-bold text-red-950 cursor-pointer"
            >
              ✕
            </button>
            <span className="text-xs font-semibold">About This Mac</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
          >
            <MaterialIcon name="close" size={16} />
          </button>
        </div>

        {/* High Sierra Segmented Top Tabs */}
        <div className="flex justify-center border-b border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-850 px-4 py-2 select-none">
          <div className="flex rounded-md p-0.5 bg-gray-200 dark:bg-neutral-700 text-xs font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1 rounded-xs transition-colors cursor-pointer ${
                activeTab === 'overview' ? 'bg-white dark:bg-neutral-600 font-bold shadow-xs' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('displays')}
              className={`px-3 py-1 rounded-xs transition-colors cursor-pointer ${
                activeTab === 'displays' ? 'bg-white dark:bg-neutral-600 font-bold shadow-xs' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Metal 2 Displays
            </button>
            <button
              onClick={() => setActiveTab('storage')}
              className={`px-3 py-1 rounded-xs transition-colors cursor-pointer ${
                activeTab === 'storage' ? 'bg-white dark:bg-neutral-600 font-bold shadow-xs' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              APFS Storage
            </button>
            <button
              onClick={() => setActiveTab('support')}
              className={`px-3 py-1 rounded-xs transition-colors cursor-pointer ${
                activeTab === 'support' ? 'bg-white dark:bg-neutral-600 font-bold shadow-xs' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Support
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              {/* Big Apple Logo Graphic */}
              <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-b from-sky-400/20 via-blue-500/10 to-indigo-600/20 rounded-2xl border border-blue-300/40 dark:border-blue-700/40 shadow-inner">
                <span className="text-6xl text-gray-800 dark:text-gray-100 select-none"></span>
                <span className="text-[10px] font-bold tracking-widest text-blue-700 dark:text-blue-300 uppercase mt-2">
                  High Sierra
                </span>
              </div>

              {/* Specs List */}
              <div className="flex-1 space-y-1.5 text-xs">
                <h1 className="text-xl font-light tracking-tight text-gray-900 dark:text-white">
                  macOS <span className="font-semibold">High Sierra</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Version 10.13.6</p>

                <div className="pt-2 border-t border-gray-200 dark:border-neutral-700 space-y-1.5 font-sans">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">MacBook Pro:</span>
                    <span className="font-semibold">15-inch, 2017 (HighSierra AI Edition)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Processor:</span>
                    <span>3.1 GHz Quad-Core Intel Core i7</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Memory:</span>
                    <span>16 GB 2133 MHz LPDDR3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Graphics:</span>
                    <span>Radeon Pro 560 4 GB / Intel HD Graphics 630</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Node.js Runtime:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{preferences.nodeCompatibility}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Browser Core:</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{preferences.chromeCompatibility}</span>
                  </div>
                </div>

                <div className="pt-3 flex space-x-2">
                  <button
                    onClick={onOpenSysPrefs}
                    className="btn-macos px-3 py-1 text-xs font-medium cursor-pointer"
                  >
                    System Preferences...
                  </button>
                  <button
                    onClick={() => onOpenSysPrefs()}
                    className="btn-macos px-3 py-1 text-xs font-medium cursor-pointer"
                  >
                    Wallpaper & Theme...
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'displays' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-neutral-750 rounded-md border border-blue-200 dark:border-neutral-700">
                <MaterialIcon name="memory" size={32} className="text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="font-bold text-sm">Built-in Retina Display & Metal 2 Acceleration</h3>
                  <p className="text-gray-600 dark:text-gray-300">15.4-inch (2880 x 1800) High Sierra Display</p>
                </div>
              </div>

              <div className="space-y-2 font-mono bg-black/5 dark:bg-black/30 p-3 rounded-md border text-[11px]">
                <div className="flex justify-between">
                  <span>Graphics Metal API:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Metal 2 (Feature Set macOS GPU Family 1 v3)</span>
                </div>
                <div className="flex justify-between">
                  <span>VRAM Offloading Capacity:</span>
                  <span>{telemetry.vramTotalGB} GB GDDR5</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Metal 2 Shaders:</span>
                  <span>1024 Cores</span>
                </div>
                <div className="flex justify-between">
                  <span>WebGPU / Canvas Pipeline:</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">Hardware Accelerated (Chrome 115+)</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'storage' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center space-x-3 p-3 bg-emerald-50 dark:bg-neutral-750 rounded-md border border-emerald-200 dark:border-neutral-700">
                <MaterialIcon name="hard_drive" size={32} className="text-emerald-600 dark:text-emerald-400" />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-sm">Macintosh HD (APFS Volume)</h3>
                    <span className="font-mono text-xs">{telemetry.apfsUsedGB.toFixed(1)} GB used of {telemetry.apfsTotalGB} GB</span>
                  </div>
                  {/* Storage Bar */}
                  <div className="w-full h-3 bg-gray-200 dark:bg-neutral-700 rounded-full overflow-hidden flex">
                    <div className="bg-blue-500 h-full" style={{ width: '40%' }} title="System" />
                    <div className="bg-emerald-500 h-full" style={{ width: '25%' }} title="AI Persona Vault" />
                    <div className="bg-amber-500 h-full" style={{ width: '15%' }} title="Chat History" />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                    <span>■ System (100 GB)</span>
                    <span>■ AI Personas (62 GB)</span>
                    <span>■ APFS Vault (38 GB)</span>
                    <span>Free ({telemetry.apfsTotalGB - telemetry.apfsUsedGB} GB)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="space-y-3 text-xs">
              <h3 className="font-bold text-sm flex items-center space-x-1.5">
                <MaterialIcon name="verified_user" size={16} className="text-blue-600" />
                <span>HighSierra AI Studio Architecture Compatibility</span>
              </h3>
              <ul className="space-y-2 font-sans text-gray-700 dark:text-gray-300">
                <li className="flex items-center space-x-2">
                  <MaterialIcon name="check_circle" size={16} className="text-emerald-500" />
                  <span>Strictly verified for Node.js 16.20.2 & npm 8.19.4 execution.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <MaterialIcon name="check_circle" size={16} className="text-emerald-500" />
                  <span>Optimized for Google Chrome 115 and above.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <MaterialIcon name="check_circle" size={16} className="text-emerald-500" />
                  <span>APFS local client persistence for offline chat storage.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <MaterialIcon name="check_circle" size={16} className="text-emerald-500" />
                  <span>Direct connection to Ollama & LM Studio local inference servers.</span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end px-4 py-2 bg-gray-200 dark:bg-neutral-750 border-t border-gray-300 dark:border-neutral-700">
          <button
            onClick={onClose}
            className="btn-macos-primary px-4 py-1 text-xs font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
