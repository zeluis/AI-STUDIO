import React, { useState } from 'react';
import { Terminal, Play, Trash2, X, Copy, Check } from 'lucide-react';
import { TerminalExecution } from '../types';

interface TerminalShellDrawerProps {
  executions: TerminalExecution[];
  onRunCommand: (command: string) => void;
  onClearTerminal: () => void;
  onClose: () => void;
}

export const TerminalShellDrawer: React.FC<TerminalShellDrawerProps> = ({
  executions,
  onRunCommand,
  onClearTerminal,
  onClose,
}) => {
  const [inputCommand, setInputCommand] = useState('echo "High Sierra Terminal Ready"; uname -a');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCommand.trim()) return;
    onRunCommand(inputCommand.trim());
    setInputCommand('');
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="bg-neutral-950 text-green-400 font-mono text-xs rounded-t-lg shadow-2xl border-t border-x border-neutral-800 flex flex-col h-72 animate-slide-up select-text">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-900 border-b border-neutral-800 text-gray-300 select-none">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5">
            <button
              onClick={onClose}
              className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-[8px] text-black font-bold"
            >
              ✕
            </button>
            <button className="w-3 h-3 rounded-full bg-amber-400" />
            <button className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>
          <span className="text-[11px] font-semibold flex items-center space-x-1.5 ml-2">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>macOS HighSierra Terminal — bash — 80x24</span>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onClearTerminal}
            className="p-1 text-gray-400 hover:text-white rounded-xs hover:bg-neutral-800"
            title="Clear Terminal Buffer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Terminal Output Log */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 font-mono">
        <div className="text-gray-500 text-[11px]">
          Last login: Wed Aug 12 08:19:07 on ttys001<br />
          HighSierra AI Core Version 10.13.6 (Build 17G66)<br />
          Type any bash, python, or javascript command below to evaluate.
        </div>

        {executions.map((exe) => (
          <div key={exe.id} className="space-y-1">
            <div className="flex items-center justify-between text-sky-400">
              <span className="font-bold">user@HighSierra-MacBookPro ~ % {exe.command}</span>
              <button
                onClick={() => handleCopy(exe.output, exe.id)}
                className="text-neutral-500 hover:text-gray-300 text-[10px] flex items-center space-x-1"
              >
                {copiedId === exe.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedId === exe.id ? 'Copied' : 'Copy Output'}</span>
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-emerald-300/90 bg-black/40 p-2 rounded-xs border border-neutral-900 leading-relaxed text-[11px]">
              {exe.output}
            </pre>
          </div>
        ))}
      </div>

      {/* Command Input Form */}
      <form onSubmit={handleSubmit} className="p-2 bg-neutral-900 border-t border-neutral-800 flex items-center space-x-2">
        <span className="text-emerald-400 font-bold">user@HighSierra ~ %</span>
        <input
          type="text"
          value={inputCommand}
          onChange={(e) => setInputCommand(e.target.value)}
          placeholder="e.g. node -v, echo $PATH, python3 -c 'print(42)'"
          className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none placeholder-neutral-600"
        />
        <button
          type="submit"
          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xs text-xs flex items-center space-x-1"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>Exec</span>
        </button>
      </form>
    </div>
  );
};
