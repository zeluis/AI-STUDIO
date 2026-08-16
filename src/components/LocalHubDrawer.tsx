import React, { useState } from 'react';
import { MaterialIcon } from './MaterialIcon';
import { ModelOption, HardwareSettings, SystemPreferences } from '../types';

interface LocalHubDrawerProps {
  localModels: ModelOption[];
  selectedModel: ModelOption;
  onSelectModel: (model: ModelOption) => void;
  hardware: HardwareSettings;
  onUpdateHardware: (updated: Partial<HardwareSettings>) => void;
  preferences: SystemPreferences;
  onUpdatePreferences: (updated: Partial<SystemPreferences>) => void;
  onClose: () => void;
}

export const LocalHubDrawer: React.FC<LocalHubDrawerProps> = ({
  localModels,
  selectedModel,
  onSelectModel,
  hardware,
  onUpdateHardware,
  preferences,
  onUpdatePreferences,
  onClose,
}) => {
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus('idle');

    try {
      const resp = await fetch('/api/local-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'ping test',
          model: selectedModel.id,
          localServerUrl: preferences.localServerUrl,
          simulationMode: preferences.simulationMode,
        }),
      });

      const data = await resp.json();
      if (resp.ok) {
        setConnectionStatus('success');
        if (data.isRealLocalServer) {
          setStatusMessage(`Successfully connected to local server at ${preferences.localServerUrl}! Model ${data.model} responded in ${data.speedTokPerSec} tok/s.`);
        } else {
          setStatusMessage(`Metal 2 Offline Simulation Engine Active! Ready for offline inference at ~${data.speedTokPerSec} tok/s.`);
        }
      } else {
        setConnectionStatus('failed');
        setStatusMessage(data.error || 'Connection failed.');
      }
    } catch (err: any) {
      setConnectionStatus('failed');
      setStatusMessage(err.message || 'Failed to reach local endpoint.');
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 rounded-lg shadow-xl border border-gray-300 dark:border-neutral-700 p-5 space-y-6 select-none font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-700 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-md">
            <MaterialIcon name="dns" size={20} />
          </div>
          <div>
            <h2 className="font-bold text-sm">Ollama & LM Studio Local Model Hub</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Run quantized GGUF LLMs locally on macOS High Sierra via Metal 2 GPU
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="btn-macos px-3 py-1 text-xs font-semibold cursor-pointer"
        >
          Close Drawer
        </button>
      </div>

      {/* Grid: Server Config & Connection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Box: Endpoint Configuration */}
        <div className="bg-gray-50 dark:bg-neutral-750 p-4 rounded-md border border-gray-200 dark:border-neutral-700 space-y-3 text-xs">
          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center space-x-1.5">
            <MaterialIcon name="lan" size={16} className="text-emerald-500" />
            <span>Local Endpoint Configuration</span>
          </h3>

          <div>
            <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">Server Type</label>
            <select
              value={preferences.localServerType}
              onChange={(e) => onUpdatePreferences({ localServerType: e.target.value as 'ollama' | 'lmstudio' })}
              className="w-full p-2 rounded-xs border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-xs"
            >
              <option value="ollama">Ollama Server (http://localhost:11434)</option>
              <option value="lmstudio">LM Studio OpenAI API Server (http://localhost:1234)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">Local URL</label>
            <input
              type="text"
              value={preferences.localServerUrl}
              onChange={(e) => onUpdatePreferences({ localServerUrl: e.target.value })}
              className="w-full p-2 rounded-xs border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 font-mono text-xs"
              placeholder="http://localhost:11434"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="btn-macos-primary px-3 py-1.5 text-xs font-semibold flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
            >
              <MaterialIcon
                name={testingConnection ? 'autorenew' : 'bolt'}
                size={14}
                className={testingConnection ? 'animate-spin' : ''}
              />
              <span>Test Connection</span>
            </button>

            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.simulationMode}
                onChange={(e) => onUpdatePreferences({ simulationMode: e.target.checked })}
                className="rounded-xs text-emerald-600"
              />
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">Metal 2 Offline Simulation</span>
            </label>
          </div>

          {/* Connection Test Output */}
          {connectionStatus !== 'idle' && (
            <div
              className={`p-2.5 rounded-md border text-xs flex items-start space-x-2 ${
                connectionStatus === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200'
                  : 'bg-red-50 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-200'
              }`}
            >
              <MaterialIcon
                name={connectionStatus === 'success' ? 'check_circle' : 'error'}
                size={16}
                className={connectionStatus === 'success' ? 'text-emerald-600 shrink-0 mt-0.5' : 'text-red-600 shrink-0 mt-0.5'}
              />
              <span className="leading-tight">{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Right Box: Metal 2 Hardware Sliders */}
        <div className="bg-gray-50 dark:bg-neutral-750 p-4 rounded-md border border-gray-200 dark:border-neutral-700 space-y-4 text-xs">
          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center space-x-1.5">
            <MaterialIcon name="tune" size={16} className="text-blue-500" />
            <span>Metal 2 Hardware Tuning Sliders</span>
          </h3>

          {/* Slider 1: VRAM Offloading */}
          <div>
            <div className="flex justify-between font-medium mb-1">
              <span>Metal 2 VRAM Offload ({hardware.vramOffloadPercent}%)</span>
              <span className="font-mono text-blue-600 dark:text-blue-400">
                {((hardware.vramOffloadPercent / 100) * 16).toFixed(1)} GB / 16 GB VRAM
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={hardware.vramOffloadPercent}
              onChange={(e) => onUpdateHardware({ vramOffloadPercent: Number(e.target.value) })}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
              Offloads model tensor weights directly to High Sierra Metal 2 GPU VRAM.
            </p>
          </div>

          {/* Slider 2: CPU Threads */}
          <div>
            <div className="flex justify-between font-medium mb-1">
              <span>CPU Compute Threads ({hardware.cpuThreads})</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">{hardware.cpuThreads} Threads</span>
            </div>
            <input
              type="range"
              min="1"
              max="16"
              step="1"
              value={hardware.cpuThreads}
              onChange={(e) => onUpdateHardware({ cpuThreads: Number(e.target.value) })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
              Intel Core i7 hyper-threaded compute allocation for prompt evaluation.
            </p>
          </div>
        </div>
      </div>

      {/* Local Models List */}
      <div>
        <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
          Available GGUF Local Quantized Models
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {localModels.map((m) => (
            <button
              key={m.id}
              onClick={() => onSelectModel(m)}
              className={`p-3 rounded-md border text-left transition-all relative cursor-pointer ${
                selectedModel.id === m.id
                  ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/50 ring-2 ring-emerald-400/40 shadow-xs'
                  : 'border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-750 hover:border-gray-300'
              }`}
            >
              {selectedModel.id === m.id && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                  <MaterialIcon name="check" size={12} />
                </div>
              )}
              <h4 className="font-bold text-xs pr-4 mb-0.5">{m.name}</h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2 leading-tight">{m.description}</p>
              <div className="flex justify-between items-center text-[10px] font-mono text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-neutral-700 pt-1.5">
                <span>Context: {m.contextLength}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">~{m.recommendedVramGB} GB VRAM</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
