import React, { useState, useEffect } from 'react';
import {
  ChatMessage,
  ModelOption,
  Persona,
  SystemPreferences,
  HardwareSettings,
  SystemTelemetry,
  TerminalExecution,
  ImageAttachment,
} from './types';
import {
  DEFAULT_MODELS,
  DEFAULT_PERSONAS,
  DEFAULT_PREFERENCES,
  DEFAULT_HARDWARE,
  INITIAL_TELEMETRY,
} from './data/defaults';
import { playChime } from './lib/sound';
import { MenuBar } from './components/MenuBar';
import { WindowChrome } from './components/WindowChrome';
import { ChatWorkspace } from './components/ChatWorkspace';
import { LocalHubDrawer } from './components/LocalHubDrawer';
import { PersonaStudioModal } from './components/PersonaStudioModal';
import { ActivityMonitorModal } from './components/ActivityMonitorModal';
import { AboutMacModal } from './components/AboutMacModal';
import { SystemPreferencesModal } from './components/SystemPreferencesModal';
import { InspectorDrawer } from './components/InspectorDrawer';
import { TerminalShellDrawer } from './components/TerminalShellDrawer';
import { InstallerModal } from './components/InstallerModal';

export default function App() {
  // Application State with APFS Storage Local Persistence
  const [preferences, setPreferences] = useState<SystemPreferences>(() => {
    const saved = localStorage.getItem('highsierra_preferences');
    return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
  });

  const [hardware, setHardware] = useState<HardwareSettings>(() => {
    const saved = localStorage.getItem('highsierra_hardware');
    return saved ? JSON.parse(saved) : DEFAULT_HARDWARE;
  });

  const [personas, setPersonas] = useState<Persona[]>(() => {
    const saved = localStorage.getItem('highsierra_personas');
    return saved ? JSON.parse(saved) : DEFAULT_PERSONAS;
  });

  const [selectedPersona, setSelectedPersona] = useState<Persona>(personas[0]);

  const [models] = useState<ModelOption[]>(DEFAULT_MODELS);
  const [selectedModel, setSelectedModel] = useState<ModelOption>(DEFAULT_MODELS[0]);

  const [temperature, setTemperature] = useState<number>(0.7);
  const [topP, setTopP] = useState<number>(0.9);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('highsierra_chat_messages');
    return saved ? JSON.parse(saved) : [];
  });

  const [telemetry, setTelemetry] = useState<SystemTelemetry>(INITIAL_TELEMETRY);
  const [terminalExecutions, setTerminalExecutions] = useState<TerminalExecution[]>([]);

  // Navigation & Modal Toggles
  const [activeTab, setActiveTab] = useState<'chat' | 'local' | 'personas' | 'telemetry'>('chat');
  const [showInspector, setShowInspector] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showAboutMac, setShowAboutMac] = useState(false);
  const [showSysPrefs, setShowSysPrefs] = useState(false);
  const [showActivityMonitor, setShowActivityMonitor] = useState(false);
  const [showPersonaStudio, setShowPersonaStudio] = useState(false);
  const [showInstaller, setShowInstaller] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Play startup chime on boot once
  useEffect(() => {
    if (preferences.soundEffects) {
      playChime('startup', true);
    }
  }, []);

  // Sync APFS Persistence to LocalStorage
  useEffect(() => {
    localStorage.setItem('highsierra_preferences', JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem('highsierra_hardware', JSON.stringify(hardware));
  }, [hardware]);

  useEffect(() => {
    localStorage.setItem('highsierra_personas', JSON.stringify(personas));
  }, [personas]);

  useEffect(() => {
    localStorage.setItem('highsierra_chat_messages', JSON.stringify(messages));
  }, [messages]);

  // Update temperature & topP when selected persona changes
  useEffect(() => {
    setTemperature(selectedPersona.defaultTemp);
    setTopP(selectedPersona.defaultTopP);
  }, [selectedPersona]);

  // Handle Model Selection
  const handleSelectModel = (model: ModelOption) => {
    setSelectedModel(model);
    playChime('click', preferences.soundEffects);
  };

  // Handle Send Message
  const handleSendMessage = async (text: string, imageAttachment?: ImageAttachment) => {
    if (!text.trim() && !imageAttachment) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model: selectedModel.name,
      imageAttachment,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);
    playChime('send', preferences.soundEffects);

    try {
      const endpoint = selectedModel.isLocal ? '/api/local-chat' : '/api/chat';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          messages: newMessages.slice(-8), // Keep recent history
          model: selectedModel.id,
          systemPrompt: selectedPersona.systemPrompt,
          temperature,
          topP,
          imageAttachment,
          localServerUrl: preferences.localServerUrl,
          simulationMode: preferences.simulationMode,
          vramOffloadPercent: hardware.vramOffloadPercent,
          cpuThreads: hardware.cpuThreads,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response from AI engine.');
      }

      const assistantMsg: ChatMessage = {
        id: `msg_asst_${Date.now()}`,
        role: 'assistant',
        content: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: selectedModel.name,
        tokensUsed: data.tokensUsed,
        speedTokPerSec: data.speedTokPerSec,
        isLocal: selectedModel.isLocal,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      playChime('receive', preferences.soundEffects);

      // Update telemetry token speed and total processed
      setTelemetry((prev) => ({
        ...prev,
        tokensPerSec: data.speedTokPerSec || 38,
        totalTokensProcessed: prev.totalTokensProcessed + (data.tokensUsed || 100),
      }));

      // Speak text if auto-TTS is enabled
      if (preferences.autoTtS) {
        speakText(data.text);
      }
    } catch (err: any) {
      console.error('Chat execution error:', err);
      playChime('error', preferences.soundEffects);

      const errorMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **HighSierra System Error**: ${err.message || 'Unable to connect to AI server.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: selectedModel.name,
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Speech Synthesis Output (TTS)
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    // Clean markdown stars/headers for spoken clarity
    const cleanText = text.replace(/[*#`_~]/g, '').slice(0, 300);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Terminal Command Execution
  const handleRunCommand = (command: string) => {
    let output = '';
    const cmd = command.trim();

    if (cmd.startsWith('node') || cmd.startsWith('js')) {
      output = `[HighSierra Node.js 16.20.2 Engine]\nOutput: Executed JS runtime evaluation successfully.\nResult: { status: 200, system: "macOS 10.13.6" }`;
    } else if (cmd.startsWith('python')) {
      output = `[Python 3.8.10 Runtime]\nOutput: Executed script on Intel Core i7.\nResult: Process finished with exit code 0`;
    } else if (cmd.includes('uname')) {
      output = `Darwin HighSierra-MacBookPro.local 17.7.0 Darwin Kernel Version 17.7.0: root:xnu-4570.76.4~1/RELEASE_X86_64 x86_64`;
    } else if (cmd.includes('sw_vers')) {
      output = `ProductName:\tMac OS X\nProductVersion:\t10.13.6\nBuildVersion:\t17G66`;
    } else {
      output = `[HighSierra Terminal Execution]\nCommand '${cmd}' completed.\nExit Code: 0`;
    }

    const execution: TerminalExecution = {
      id: `exe_${Date.now()}`,
      command: cmd,
      language: 'shell',
      code: cmd,
      output,
      exitCode: 0,
      timestamp: new Date().toLocaleTimeString(),
    };

    setTerminalExecutions((prev) => [...prev, execution]);
    setShowTerminal(true);
  };

  // Session Export & Import
  const handleExportSession = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(messages, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `HighSierra_Chat_Session_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportSession = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            setMessages(parsed);
            playChime('receive', preferences.soundEffects);
          }
        } catch (_err) {
          playChime('error', preferences.soundEffects);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClearSession = () => {
    setMessages([]);
    playChime('trash', preferences.soundEffects);
  };

  // Get Wallpaper Background Gradient CSS class
  const getWallpaperStyle = () => {
    switch (preferences.wallpaper) {
      case 'sunset':
        return 'bg-gradient-to-br from-amber-500 via-rose-600 to-purple-950';
      case 'snow':
        return 'bg-gradient-to-br from-slate-300 via-sky-200 to-blue-500';
      case 'granite':
        return 'bg-gradient-to-br from-stone-700 via-zinc-800 to-slate-950';
      case 'space':
        return 'bg-gradient-to-br from-indigo-950 via-slate-900 to-black';
      case 'highsierra':
      default:
        return 'bg-gradient-to-br from-sky-600 via-blue-800 to-indigo-950';
    }
  };

  return (
    <div
      id="mac-desktop-container"
      className={`h-screen w-screen flex flex-col overflow-hidden font-sans select-none transition-colors duration-500 ${getWallpaperStyle()}`}
    >
      {/* Top Apple Menu Bar */}
      <MenuBar
        telemetry={telemetry}
        preferences={preferences}
        selectedModel={selectedModel}
        models={models}
        onSelectModel={handleSelectModel}
        onOpenAboutMac={() => setShowAboutMac(true)}
        onOpenSysPrefs={() => setShowSysPrefs(true)}
        onOpenActivityMonitor={() => setShowActivityMonitor(true)}
        onOpenLocalHub={() => setActiveTab('local')}
        onOpenPersonaStudio={() => setShowPersonaStudio(true)}
        onNewSession={handleClearSession}
        onClearSession={handleClearSession}
        onExportSession={handleExportSession}
        onImportSession={handleImportSession}
        onToggleInspector={() => setShowInspector(!showInspector)}
        onToggleTerminal={() => setShowTerminal(!showTerminal)}
        onToggleSound={() => setPreferences((p) => ({ ...p, soundEffects: !p.soundEffects }))}
        onTriggerSiri={() => {
          handleSendMessage('Hello Siri AI! Provide a quick status check of macOS High Sierra AI Studio.');
        }}
        onOpenInstaller={() => setShowInstaller(true)}
      />

      {/* Main High Sierra Desktop Window */}
      <main id="mac-window-frame" className="flex-1 p-2 sm:p-4 flex flex-col overflow-hidden">
        <div className="flex-1 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl rounded-lg shadow-2xl border border-white/30 dark:border-neutral-700 flex flex-col overflow-hidden max-w-7xl w-full mx-auto">
          {/* Window Chrome Titlebar */}
          <WindowChrome
            preferences={preferences}
            selectedModel={selectedModel}
            selectedPersona={selectedPersona}
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            showInspector={showInspector}
            onToggleInspector={() => setShowInspector(!showInspector)}
            showTerminal={showTerminal}
            onToggleTerminal={() => setShowTerminal(!showTerminal)}
            onNewSession={handleClearSession}
            onOpenSysPrefs={() => setShowSysPrefs(true)}
          />

          {/* Window Body & Views */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Main Active Tab View */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {activeTab === 'chat' && (
                <ChatWorkspace
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  selectedModel={selectedModel}
                  selectedPersona={selectedPersona}
                  onRunInTerminal={handleRunCommand}
                  onSpeakText={speakText}
                  isSpeaking={isSpeaking}
                  onStopSpeaking={stopSpeaking}
                />
              )}

              {activeTab === 'local' && (
                <div className="p-4 overflow-y-auto flex-1">
                  <LocalHubDrawer
                    localModels={models.filter((m) => m.isLocal)}
                    selectedModel={selectedModel}
                    onSelectModel={handleSelectModel}
                    hardware={hardware}
                    onUpdateHardware={(updated) => setHardware((h) => ({ ...h, ...updated }))}
                    preferences={preferences}
                    onUpdatePreferences={(updated) => setPreferences((p) => ({ ...p, ...updated }))}
                    onClose={() => setActiveTab('chat')}
                  />
                </div>
              )}

              {activeTab === 'personas' && (
                <div className="p-4 overflow-y-auto flex-1">
                  <PersonaStudioModal
                    personas={personas}
                    selectedPersona={selectedPersona}
                    onSelectPersona={setSelectedPersona}
                    onSavePersona={(p) => {
                      setPersonas((prev) => {
                        const exists = prev.some((item) => item.id === p.id);
                        return exists ? prev.map((item) => (item.id === p.id ? p : item)) : [...prev, p];
                      });
                    }}
                    onDeletePersona={(id) => {
                      setPersonas((prev) => prev.filter((p) => p.id !== id));
                      if (selectedPersona.id === id) {
                        setSelectedPersona(personas[0]);
                      }
                    }}
                    onClose={() => setActiveTab('chat')}
                  />
                </div>
              )}

              {activeTab === 'telemetry' && (
                <div className="p-4 overflow-y-auto flex-1">
                  <ActivityMonitorModal
                    telemetry={telemetry}
                    onClose={() => setActiveTab('chat')}
                  />
                </div>
              )}

              {/* Bottom HighSierra Terminal Drawer if toggled */}
              {showTerminal && (
                <TerminalShellDrawer
                  executions={terminalExecutions}
                  onRunCommand={handleRunCommand}
                  onClearTerminal={() => setTerminalExecutions([])}
                  onClose={() => setShowTerminal(false)}
                />
              )}
            </div>

            {/* Right Inspector Drawer if toggled */}
            {showInspector && (
              <InspectorDrawer
                temperature={temperature}
                onTemperatureChange={setTemperature}
                topP={topP}
                onTopPChange={setTopP}
                selectedModel={selectedModel}
                selectedPersona={selectedPersona}
                onClose={() => setShowInspector(false)}
              />
            )}
          </div>
        </div>
      </main>

      {/* Global Modals */}
      {showAboutMac && (
        <AboutMacModal
          telemetry={telemetry}
          preferences={preferences}
          onClose={() => setShowAboutMac(false)}
          onOpenSysPrefs={() => {
            setShowAboutMac(false);
            setShowSysPrefs(true);
          }}
        />
      )}

      {showSysPrefs && (
        <SystemPreferencesModal
          preferences={preferences}
          onUpdatePreferences={(updated) => setPreferences((p) => ({ ...p, ...updated }))}
          onClose={() => setShowSysPrefs(false)}
        />
      )}

      {showActivityMonitor && (
        <ActivityMonitorModal
          telemetry={telemetry}
          onClose={() => setShowActivityMonitor(false)}
        />
      )}

      {showPersonaStudio && (
        <PersonaStudioModal
          personas={personas}
          selectedPersona={selectedPersona}
          onSelectPersona={setSelectedPersona}
          onSavePersona={(p) => {
            setPersonas((prev) => {
              const exists = prev.some((item) => item.id === p.id);
              return exists ? prev.map((item) => (item.id === p.id ? p : item)) : [...prev, p];
            });
          }}
          onDeletePersona={(id) => {
            setPersonas((prev) => prev.filter((p) => p.id !== id));
            if (selectedPersona.id === id) {
              setSelectedPersona(personas[0]);
            }
          }}
          onClose={() => setShowPersonaStudio(false)}
        />
      )}

      {showInstaller && (
        <InstallerModal
          onClose={() => setShowInstaller(false)}
          soundEnabled={preferences.soundEffects}
        />
      )}
    </div>
  );
}
