import React, { useState, useEffect, useRef } from 'react';
import { MaterialIcon } from './MaterialIcon';
import { ModelOption, Persona, SystemPreferences, SystemTelemetry, WallpaperName } from '../types';
import { playChime } from '../lib/sound';

interface SiriFloatingOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: ModelOption;
  selectedPersona: Persona;
  telemetry: SystemTelemetry;
  preferences: SystemPreferences;
  onUpdatePreferences: (updated: Partial<SystemPreferences>) => void;
  onInsertToChat: (prompt: string, response: string) => void;
  onSpeakText: (text: string) => void;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
}

interface SiriExchange {
  id: string;
  query: string;
  response: string;
  timestamp: string;
  model: string;
  isGenerating?: boolean;
}

export const SiriFloatingOverlay: React.FC<SiriFloatingOverlayProps> = ({
  isOpen,
  onClose,
  selectedModel,
  selectedPersona,
  telemetry,
  preferences,
  onUpdatePreferences,
  onInsertToChat,
  onSpeakText,
  isSpeaking,
  onStopSpeaking,
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [history, setHistory] = useState<SiriExchange[]>([
    {
      id: 'init_siri',
      query: 'Hello Siri',
      response: `What can I help you with today? I'm connected to ${selectedModel.name} on macOS High Sierra. You can ask me system status questions, switch wallpapers, or test AI reasoning.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model: selectedModel.name,
    },
  ]);

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, isOpen, isLoading]);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setQuery(transcript);
          setIsListening(false);
          handleAskSiri(transcript);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  if (!isOpen) return null;

  const toggleListening = () => {
    if (!recognitionRef.current) {
      // Dictation simulated fallback if Web Speech API isn't permitted in iframe
      if (!isListening) {
        setIsListening(true);
        playChime('click', preferences.soundEffects);
        setTimeout(() => {
          const samplePrompts = [
            'Check current VRAM and GPU inference speed.',
            'Switch wallpaper to Dynamic Time-of-Day mode.',
            'Give me a tip on macOS High Sierra AI acceleration.',
          ];
          const randomPrompt = samplePrompts[Math.floor(Math.random() * samplePrompts.length)];
          setQuery(randomPrompt);
          setIsListening(false);
          handleAskSiri(randomPrompt);
        }, 1800);
      } else {
        setIsListening(false);
      }
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        setIsListening(true);
        playChime('click', preferences.soundEffects);
        recognitionRef.current.start();
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleAskSiri = async (textToAsk?: string) => {
    const promptText = (textToAsk ?? query).trim();
    if (!promptText || isLoading) return;

    setQuery('');
    playChime('send', preferences.soundEffects);

    // Quick Command Interceptors
    const lower = promptText.toLowerCase();

    // 1. Dynamic Wallpaper Switch command
    if (lower.includes('dynamic wallpaper') || lower.includes('switch to dynamic')) {
      onUpdatePreferences({ wallpaper: 'dynamic' });
      const resp = `Done! Switched desktop wallpaper to Dynamic Time-of-Day auto-shifting mode.`;
      const item: SiriExchange = {
        id: `siri_${Date.now()}`,
        query: promptText,
        response: resp,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: 'macOS High Sierra System',
      };
      setHistory((prev) => [...prev, item]);
      if (preferences.speechEnabled) onSpeakText(resp);
      playChime('receive', preferences.soundEffects);
      return;
    }

    // 2. Lake/Sunset Wallpaper Switch
    if (lower.includes('lake wallpaper') || lower.includes('high sierra lake')) {
      onUpdatePreferences({ wallpaper: 'highsierra' });
      const resp = `Desktop background updated to macOS High Sierra Lake Tenaya.`;
      const item: SiriExchange = {
        id: `siri_${Date.now()}`,
        query: promptText,
        response: resp,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: 'macOS High Sierra System',
      };
      setHistory((prev) => [...prev, item]);
      if (preferences.speechEnabled) onSpeakText(resp);
      playChime('receive', preferences.soundEffects);
      return;
    }

    if (lower.includes('sunset wallpaper')) {
      onUpdatePreferences({ wallpaper: 'sunset' });
      const resp = `Desktop background updated to High Sierra Sunset Glow.`;
      const item: SiriExchange = {
        id: `siri_${Date.now()}`,
        query: promptText,
        response: resp,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: 'macOS High Sierra System',
      };
      setHistory((prev) => [...prev, item]);
      if (preferences.speechEnabled) onSpeakText(resp);
      playChime('receive', preferences.soundEffects);
      return;
    }

    // 3. System Status / Telemetry Check command
    if (
      lower.includes('system status') ||
      lower.includes('telemetry') ||
      lower.includes('vram') ||
      lower.includes('specs')
    ) {
      const resp = `macOS 10.13.6 High Sierra status is optimal. Hardware Metal 2 GPU has allocated ${telemetry.vramUsedGB} GB of ${telemetry.vramTotalGB} GB VRAM. Active inference speed is ${telemetry.tokensPerSec} tokens/sec, and APFS Storage is utilizing ${telemetry.apfsUsedGB} GB of ${telemetry.apfsTotalGB} GB.`;
      const item: SiriExchange = {
        id: `siri_${Date.now()}`,
        query: promptText,
        response: resp,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: 'High Sierra Telemetry Engine',
      };
      setHistory((prev) => [...prev, item]);
      if (preferences.speechEnabled) onSpeakText(resp);
      playChime('receive', preferences.soundEffects);
      return;
    }

    // Standard AI Generation
    setIsLoading(true);
    const newExchangeId = `siri_${Date.now()}`;
    const exchangePlaceholder: SiriExchange = {
      id: newExchangeId,
      query: promptText,
      response: '...',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model: selectedModel.name,
      isGenerating: true,
    };
    setHistory((prev) => [...prev, exchangePlaceholder]);

    try {
      if (selectedModel.isLocal) {
        // Local simulation / server
        await new Promise((r) => setTimeout(r, 650));
        const localResp = `[${selectedModel.name} Metal 2 response]: For "${promptText}", macOS High Sierra runs local GGUF models directly on your hardware with 0ms cloud latency and complete offline privacy.`;
        setHistory((prev) =>
          prev.map((item) =>
            item.id === newExchangeId
              ? { ...item, response: localResp, isGenerating: false }
              : item
          )
        );
        if (preferences.speechEnabled) onSpeakText(localResp);
        playChime('receive', preferences.soundEffects);
      } else {
        // Call backend server
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: promptText,
            model: selectedModel.id,
            systemPrompt:
              'You are Siri, an intelligent, helpful, concise Apple assistant on macOS High Sierra. Provide sharp, accurate, conversational responses without unnecessary fluff.',
            temperature: 0.7,
            topP: 0.9,
          }),
        });

        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }

        const reply = data.text || 'I could not retrieve an answer at this moment.';
        setHistory((prev) =>
          prev.map((item) =>
            item.id === newExchangeId ? { ...item, response: reply, isGenerating: false } : item
          )
        );
        if (preferences.speechEnabled) onSpeakText(reply);
        playChime('receive', preferences.soundEffects);
      }
    } catch (err: any) {
      const errMsg = err?.message || 'Error processing request with Siri.';
      setHistory((prev) =>
        prev.map((item) =>
          item.id === newExchangeId
            ? { ...item, response: `⚠️ ${errMsg}`, isGenerating: false }
            : item
        )
      );
      playChime('error', preferences.soundEffects);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickCommand = (cmd: string) => {
    handleAskSiri(cmd);
  };

  const handleSelectWallpaperDirect = (wpId: WallpaperName) => {
    onUpdatePreferences({ wallpaper: wpId });
    playChime('click', preferences.soundEffects);
  };

  return (
    <div
      id="siri-floating-overlay-card"
      className="fixed top-8 right-3 z-50 w-[380px] sm:w-[420px] max-w-[calc(100vw-24px)] rounded-2xl shadow-2xl backdrop-blur-2xl border border-white/40 dark:border-white/15 bg-white/92 dark:bg-neutral-900/92 overflow-hidden flex flex-col transition-all duration-200 animate-in fade-in slide-in-from-top-2 select-none"
      style={{
        boxShadow:
          '0 20px 45px -10px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2) inset',
      }}
    >
      {/* Siri Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-black/10 dark:border-white/10 bg-gradient-to-r from-purple-500/10 via-sky-500/10 to-pink-500/10">
        <div className="flex items-center space-x-2">
          {/* Animated Glowing Siri Orb Icon */}
          <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-tr from-rose-500 via-purple-500 to-sky-400 p-[1px] shadow-sm animate-pulse">
            <div className="w-full h-full rounded-full bg-neutral-900/80 flex items-center justify-center">
              <MaterialIcon name="auto_awesome" size={13} className="text-sky-300" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-900 dark:text-white leading-tight">
              Siri AI Assistant
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono leading-none">
              macOS High Sierra • {selectedModel.name.split(' ')[0]}
            </span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-1.5">
          {/* Voice Output Indicator / Mute Toggle */}
          <button
            onClick={() => onUpdatePreferences({ speechEnabled: !preferences.speechEnabled })}
            className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center space-x-1 cursor-pointer transition-colors ${
              preferences.speechEnabled
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-black/5 dark:bg-white/10 text-gray-500 border border-transparent'
            }`}
            title={preferences.speechEnabled ? 'Voice output active' : 'Voice output muted'}
          >
            <MaterialIcon
              name={preferences.speechEnabled ? 'record_voice_over' : 'voice_over_off'}
              size={11}
            />
            <span>{preferences.speechEnabled ? 'Voice' : 'Muted'}</span>
          </button>

          {/* Close Siri Overlay Button */}
          <button
            onClick={() => {
              playChime('click', preferences.soundEffects);
              if (isSpeaking) onStopSpeaking();
              onClose();
            }}
            className="w-5 h-5 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer transition-colors"
            title="Close Siri (Esc)"
          >
            <MaterialIcon name="close" size={13} />
          </button>
        </div>
      </div>

      {/* Dynamic Animated Siri Waveform Bar */}
      <div className="relative h-10 w-full bg-gradient-to-b from-neutral-900/10 to-transparent flex items-center justify-center overflow-hidden border-b border-black/5 dark:border-white/5">
        <div className="flex items-center space-x-1.5 h-full py-2">
          {[40, 75, 100, 60, 90, 45, 80, 55, 30].map((h, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-300 ${
                isLoading || isListening || isSpeaking
                  ? 'bg-gradient-to-t from-pink-500 via-purple-500 to-sky-400 animate-pulse'
                  : 'bg-sky-400/40 dark:bg-sky-400/30'
              }`}
              style={{
                height:
                  isLoading || isListening || isSpeaking
                    ? `${Math.max(20, Math.sin(Date.now() / 200 + i) * 100)}%`
                    : `${h * 0.28}%`,
                animationDelay: `${i * 90}ms`,
              }}
            />
          ))}
        </div>
        <div className="absolute right-3 text-[10px] text-gray-400 dark:text-gray-500 font-mono">
          {isListening
            ? 'Listening...'
            : isLoading
            ? 'Thinking...'
            : isSpeaking
            ? 'Speaking...'
            : 'Ready'}
        </div>
      </div>

      {/* Siri Conversation Feed */}
      <div className="p-3 overflow-y-auto max-h-[260px] min-h-[140px] space-y-2.5 text-xs">
        {history.map((exchange) => (
          <div key={exchange.id} className="space-y-1.5 animate-in fade-in duration-200">
            {/* User Request Bubble */}
            <div className="flex justify-end">
              <div className="bg-blue-600 text-white rounded-2xl rounded-tr-xs px-3 py-1.5 max-w-[85%] shadow-xs leading-relaxed">
                {exchange.query}
              </div>
            </div>

            {/* Siri Response Card */}
            <div className="flex items-start space-x-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-pink-500 to-sky-400 p-[1px] shrink-0 mt-0.5 shadow-2xs">
                <div className="w-full h-full rounded-full bg-white dark:bg-neutral-900 flex items-center justify-center">
                  <MaterialIcon name="auto_awesome" size={11} className="text-purple-500" />
                </div>
              </div>
              <div className="flex-1 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl rounded-tl-xs p-2.5 text-gray-800 dark:text-gray-200 leading-relaxed shadow-xs">
                {exchange.isGenerating ? (
                  <div className="flex items-center space-x-1.5 py-1 text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" />
                    <span
                      className="w-2 h-2 rounded-full bg-sky-500 animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-pink-500 animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                    <span className="text-[11px] ml-1">Siri is synthesizing answer...</span>
                  </div>
                ) : (
                  <div>
                    <p className="whitespace-pre-wrap">{exchange.response}</p>
                    <div className="mt-2 pt-1.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[10px] text-gray-400">
                      <span className="font-mono">{exchange.model}</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onSpeakText(exchange.response)}
                          className="hover:text-blue-500 flex items-center space-x-0.5 cursor-pointer"
                          title="Read aloud"
                        >
                          <MaterialIcon name="volume_up" size={11} />
                          <span>Speak</span>
                        </button>
                        <button
                          onClick={() => onInsertToChat(exchange.query, exchange.response)}
                          className="hover:text-blue-500 flex items-center space-x-0.5 cursor-pointer text-blue-600 dark:text-blue-400 font-medium"
                          title="Send to main chat workspace"
                        >
                          <MaterialIcon name="add_to_photos" size={11} />
                          <span>Add to Chat</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Suggestion Pills */}
      <div className="px-3 py-1.5 border-t border-black/5 dark:border-white/5 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => handleQuickCommand('Check current system and VRAM telemetry status.')}
          className="shrink-0 px-2 py-0.5 rounded-full text-[10px] bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-gray-700 dark:text-gray-300 flex items-center space-x-1 cursor-pointer transition-colors border border-black/5 dark:border-white/10"
        >
          <MaterialIcon name="speed" size={11} className="text-emerald-500" />
          <span>System Status</span>
        </button>

        <button
          onClick={() => handleQuickCommand('Switch wallpaper to Dynamic Time-of-Day mode.')}
          className="shrink-0 px-2 py-0.5 rounded-full text-[10px] bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-gray-700 dark:text-gray-300 flex items-center space-x-1 cursor-pointer transition-colors border border-black/5 dark:border-white/10"
        >
          <MaterialIcon name="wallpaper" size={11} className="text-sky-500" />
          <span>Dynamic Wallpaper</span>
        </button>

        <button
          onClick={() =>
            handleQuickCommand('Give me a helpful macOS High Sierra pro tip for AI modeling.')
          }
          className="shrink-0 px-2 py-0.5 rounded-full text-[10px] bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-gray-700 dark:text-gray-300 flex items-center space-x-1 cursor-pointer transition-colors border border-black/5 dark:border-white/10"
        >
          <MaterialIcon name="lightbulb" size={11} className="text-amber-500" />
          <span>Mac AI Tip</span>
        </button>
      </div>

      {/* Bottom Interactive Siri Input Bar */}
      <div className="p-2.5 bg-black/5 dark:bg-white/5 border-t border-black/10 dark:border-white/10 flex items-center space-x-1.5">
        <div className="relative flex-1 flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAskSiri();
              }
            }}
            placeholder={isListening ? 'Listening to your voice...' : 'Ask Siri anything or type a command...'}
            disabled={isLoading}
            className="w-full pl-3 pr-8 py-1.5 text-xs bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-full border border-gray-300 dark:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder-gray-400 dark:placeholder-gray-500 shadow-inner"
          />
          {/* Dictation / Microphone Trigger */}
          <button
            onClick={toggleListening}
            className={`absolute right-1.5 p-1 rounded-full cursor-pointer transition-colors ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse'
                : 'text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'
            }`}
            title={isListening ? 'Stop listening' : 'Voice Dictation'}
          >
            <MaterialIcon name={isListening ? 'mic' : 'mic_none'} size={14} />
          </button>
        </div>

        {/* Send Button */}
        <button
          onClick={() => handleAskSiri()}
          disabled={!query.trim() || isLoading}
          className="p-1.5 rounded-full bg-gradient-to-r from-purple-600 to-sky-600 hover:from-purple-500 hover:to-sky-500 text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs transition-transform active:scale-95"
          title="Send to Siri"
        >
          <MaterialIcon name="arrow_upward" size={14} />
        </button>
      </div>
    </div>
  );
};
