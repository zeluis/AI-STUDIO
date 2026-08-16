import React from 'react';
import { MaterialIcon } from './MaterialIcon';
import { ModelOption, Persona } from '../types';

interface InspectorDrawerProps {
  temperature: number;
  onTemperatureChange: (val: number) => void;
  topP: number;
  onTopPChange: (val: number) => void;
  selectedModel: ModelOption;
  selectedPersona: Persona;
  onClose: () => void;
  onExportSession?: (format: 'json' | 'txt') => void;
  onDeleteSession?: () => void;
  onClearAllSessions?: () => void;
}

export const InspectorDrawer: React.FC<InspectorDrawerProps> = ({
  temperature,
  onTemperatureChange,
  topP,
  onTopPChange,
  selectedModel,
  selectedPersona,
  onClose,
  onExportSession,
  onDeleteSession,
  onClearAllSessions,
}) => {
  return (
    <div className="w-80 bg-white/95 dark:bg-neutral-850/95 backdrop-blur-md border-l border-gray-300 dark:border-neutral-700 p-4 space-y-4 text-xs select-none shadow-xl flex flex-col h-full overflow-y-auto font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-700 pb-2">
        <div className="flex items-center space-x-1.5 font-bold text-gray-800 dark:text-white">
          <MaterialIcon name="tune" size={16} className="text-blue-500" />
          <span>Model Parameter Inspector</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
        >
          <MaterialIcon name="close" size={16} />
        </button>
      </div>

      {/* Temperature Slider */}
      <div className="space-y-1.5 bg-gray-50 dark:bg-neutral-800 p-3 rounded-md border border-gray-200 dark:border-neutral-700">
        <div className="flex justify-between font-medium">
          <span className="flex items-center space-x-1">
            <MaterialIcon name="thermostat" size={14} className="text-amber-500" />
            <span>Temperature</span>
          </span>
          <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{temperature.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="2"
          step="0.05"
          value={temperature}
          onChange={(e) => onTemperatureChange(Number(e.target.value))}
          className="w-full accent-amber-500 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-gray-400 font-mono">
          <span>0.0 (Precise)</span>
          <span>1.0 (Balanced)</span>
          <span>2.0 (Creative)</span>
        </div>
      </div>

      {/* Top-P Slider */}
      <div className="space-y-1.5 bg-gray-50 dark:bg-neutral-800 p-3 rounded-md border border-gray-200 dark:border-neutral-700">
        <div className="flex justify-between font-medium">
          <span className="flex items-center space-x-1">
            <MaterialIcon name="bolt" size={14} className="text-emerald-500" />
            <span>Top-P Sampling</span>
          </span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{topP.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={topP}
          onChange={(e) => onTopPChange(Number(e.target.value))}
          className="w-full accent-emerald-500 cursor-pointer"
        />
        <p className="text-[10px] text-gray-400">Nucleus cumulative probability cutoff.</p>
      </div>

      {/* Active Model Summary Card */}
      <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-md border border-blue-200 dark:border-blue-800 space-y-1.5">
        <span className="text-[10px] font-bold tracking-wider uppercase text-blue-600 dark:text-blue-400 flex items-center space-x-1">
          <MaterialIcon name="memory" size={12} />
          <span>Active Engine</span>
        </span>
        <h4 className="font-bold text-xs">{selectedModel.name}</h4>
        <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-tight">{selectedModel.description}</p>
        <div className="pt-1 flex justify-between font-mono text-[10px] text-gray-500">
          <span>Provider: {selectedModel.provider.toUpperCase()}</span>
          <span>Context: {selectedModel.contextLength}</span>
        </div>
      </div>

      {/* Active Persona System Instruction */}
      <div className="p-3 bg-gray-50 dark:bg-neutral-800 rounded-md border border-gray-200 dark:border-neutral-700 space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400 flex items-center space-x-1">
            <MaterialIcon name="psychology" size={12} />
            <span>Active Persona</span>
          </span>
          <span className="font-bold text-blue-600 dark:text-blue-400">{selectedPersona.avatar} {selectedPersona.name}</span>
        </div>
        <p className="text-[11px] font-mono bg-white dark:bg-neutral-900 p-2 rounded-xs border text-gray-700 dark:text-gray-300 max-h-28 overflow-y-auto leading-relaxed">
          {selectedPersona.systemPrompt}
        </p>
      </div>

      {/* Conversation Session Actions */}
      <div className="p-3 bg-gray-50 dark:bg-neutral-800 rounded-md border border-gray-200 dark:border-neutral-700 space-y-2">
        <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400 flex items-center space-x-1">
          <MaterialIcon name="folder" size={12} />
          <span>Session Storage</span>
        </span>

        {onExportSession && (
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onExportSession('json')}
              className="btn-macos py-1 px-2 text-[10px] flex items-center justify-center space-x-1"
            >
              <MaterialIcon name="download" size={12} />
              <span>Export .JSON</span>
            </button>
            <button
              onClick={() => onExportSession('txt')}
              className="btn-macos py-1 px-2 text-[10px] flex items-center justify-center space-x-1"
            >
              <MaterialIcon name="description" size={12} />
              <span>Export .TXT</span>
            </button>
          </div>
        )}

        {onDeleteSession && (
          <button
            onClick={onDeleteSession}
            className="w-full btn-macos py-1 px-2 text-[10px] text-red-600 hover:text-red-700 flex items-center justify-center space-x-1"
          >
            <MaterialIcon name="delete" size={12} />
            <span>Delete Current Conversation</span>
          </button>
        )}

        {onClearAllSessions && (
          <button
            onClick={onClearAllSessions}
            className="w-full btn-macos py-1 px-2 text-[10px] text-gray-600 dark:text-gray-400 hover:text-red-600 flex items-center justify-center space-x-1"
          >
            <MaterialIcon name="delete_sweep" size={12} />
            <span>Clear All Saved History</span>
          </button>
        )}
      </div>
    </div>
  );
};
