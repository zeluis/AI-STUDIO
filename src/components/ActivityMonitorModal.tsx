import React, { useState, useEffect } from 'react';
import { X, Activity, Cpu, HardDrive, Zap, Play, Square, RefreshCw } from 'lucide-react';
import { SystemTelemetry } from '../types';

interface ActivityMonitorModalProps {
  telemetry: SystemTelemetry;
  onClose: () => void;
}

export const ActivityMonitorModal: React.FC<ActivityMonitorModalProps> = ({
  telemetry,
  onClose,
}) => {
  const [history, setHistory] = useState<{ cpu: number; vram: number; tokens: number }[]>([]);

  useEffect(() => {
    // Generate real-time telemetry graph history points
    const interval = setInterval(() => {
      setHistory((prev) => {
        const nextCpu = Math.max(8, Math.min(95, telemetry.cpuUsagePercent + (Math.random() * 12 - 6)));
        const nextVram = Math.max(3.2, Math.min(15.8, telemetry.vramUsedGB + (Math.random() * 0.4 - 0.2)));
        const nextTokens = telemetry.tokensPerSec > 0 ? telemetry.tokensPerSec : Math.round(15 + Math.random() * 25);
        const newHistory = [...prev, { cpu: nextCpu, vram: nextVram, tokens: nextTokens }];
        return newHistory.slice(-30);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [telemetry]);

  // Construct SVG path string for telemetry graph
  const getSvgPath = (key: 'cpu' | 'vram' | 'tokens', maxVal: number) => {
    if (history.length < 2) return '';
    const points = history.map((pt, i) => {
      const x = (i / 29) * 400;
      const val = pt[key];
      const y = 100 - (val / maxVal) * 90;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return `M ${points.join(' L ')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-3xl bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 rounded-lg shadow-2xl border border-gray-300 dark:border-neutral-700 overflow-hidden font-sans">
        {/* Title Bar */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-gradient-to-b from-gray-200 to-gray-300 dark:from-neutral-700 dark:to-neutral-800 border-b border-gray-300 dark:border-neutral-700">
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 border border-red-600 flex items-center justify-center text-[8px] font-bold text-red-950"
            >
              ✕
            </button>
            <span className="text-xs font-semibold">Activity Monitor — Metal 2 & Compute Telemetry</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5">
          {/* Top Live Gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white dark:bg-neutral-750 p-3 rounded-md border border-gray-300 dark:border-neutral-700 flex items-center space-x-3">
              <div className="p-2.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">CPU Load</span>
                <p className="text-xl font-bold font-mono">{telemetry.cpuUsagePercent}%</p>
                <span className="text-[10px] text-gray-500">8 Threads Active</span>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-750 p-3 rounded-md border border-gray-300 dark:border-neutral-700 flex items-center space-x-3">
              <div className="p-2.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">Metal 2 VRAM</span>
                <p className="text-xl font-bold font-mono">
                  {telemetry.vramUsedGB.toFixed(1)} <span className="text-xs font-normal">/ {telemetry.vramTotalGB} GB</span>
                </p>
                <span className="text-[10px] text-blue-600 dark:text-blue-400">Radeon Pro 560</span>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-750 p-3 rounded-md border border-gray-300 dark:border-neutral-700 flex items-center space-x-3">
              <div className="p-2.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">Inference Throughput</span>
                <p className="text-xl font-bold font-mono">
                  {telemetry.tokensPerSec > 0 ? telemetry.tokensPerSec : 38}{' '}
                  <span className="text-xs font-normal">tok/s</span>
                </p>
                <span className="text-[10px] text-gray-500">Total: {telemetry.totalTokensProcessed.toLocaleString()} tok</span>
              </div>
            </div>
          </div>

          {/* Real-time Telemetry SVG Graph */}
          <div className="bg-neutral-900 text-green-400 p-4 rounded-md border border-neutral-950 shadow-inner">
            <div className="flex justify-between items-center mb-2 text-xs font-mono">
              <span className="flex items-center space-x-1.5 font-bold text-white">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Live High Sierra Compute Monitor (30s)</span>
              </span>
              <div className="flex items-center space-x-3 text-[10px]">
                <span className="text-emerald-400">━ CPU Load</span>
                <span className="text-sky-400">━ VRAM (GB)</span>
                <span className="text-amber-400">━ Token Speed</span>
              </div>
            </div>

            <div className="relative h-28 w-full bg-black/60 rounded-xs border border-neutral-800 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                {/* Grid lines */}
                <line x1="0" y1="25" x2="400" y2="25" stroke="#333" strokeDasharray="2,2" />
                <line x1="0" y1="50" x2="400" y2="50" stroke="#333" strokeDasharray="2,2" />
                <line x1="0" y1="75" x2="400" y2="75" stroke="#333" strokeDasharray="2,2" />

                {/* CPU Path */}
                <path d={getSvgPath('cpu', 100)} fill="none" stroke="#10b981" strokeWidth="2" />
                {/* VRAM Path */}
                <path d={getSvgPath('vram', 16)} fill="none" stroke="#38bdf8" strokeWidth="2" />
                {/* Tokens Path */}
                <path d={getSvgPath('tokens', 60)} fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="4,2" />
              </svg>
            </div>
          </div>

          {/* Active Process List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              High Sierra Active System Processes
            </h4>
            <div className="bg-white dark:bg-neutral-750 border border-gray-300 dark:border-neutral-700 rounded-md overflow-hidden text-xs">
              <table className="w-full text-left font-mono">
                <thead className="bg-gray-100 dark:bg-neutral-700 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-neutral-600 text-[11px]">
                  <tr>
                    <th className="p-2">Process Name</th>
                    <th className="p-2">PID</th>
                    <th className="p-2">% CPU</th>
                    <th className="p-2">Memory (MB)</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                  {telemetry.activeProcesses.map((p) => (
                    <tr key={p.pid} className="hover:bg-blue-50/50 dark:hover:bg-neutral-700/50">
                      <td className="p-2 font-bold font-sans flex items-center space-x-1.5">
                        <Play className="w-3 h-3 text-emerald-500 fill-current" />
                        <span>{p.name}</span>
                      </td>
                      <td className="p-2 text-gray-500">{p.pid}</td>
                      <td className="p-2 font-bold text-emerald-600 dark:text-emerald-400">{p.cpuPercent}%</td>
                      <td className="p-2">{p.memoryMB} MB</td>
                      <td className="p-2">
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-between items-center px-4 py-2.5 bg-gray-200 dark:bg-neutral-750 border-t border-gray-300 dark:border-neutral-700 text-xs">
          <span className="text-gray-500 font-mono">Metal 2 Pipeline: Radeon Pro 560 + Intel HD 630</span>
          <button
            onClick={onClose}
            className="px-4 py-1 bg-gradient-to-b from-blue-500 to-blue-600 text-white rounded-sm text-xs font-semibold shadow-2xs hover:from-blue-600 hover:to-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
