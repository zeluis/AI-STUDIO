import React, { useState, useEffect, useMemo } from 'react';
import {
  ChatMessage,
  ChatSession,
  ModelOption,
  Persona,
  SystemPreferences,
  HardwareSettings,
  SystemTelemetry,
  TerminalExecution,
  ImageAttachment,
  ThemeName,
  WallpaperName,
} from './types';
import {
  DEFAULT_MODELS,
  DEFAULT_PERSONAS,
  DEFAULT_PREFERENCES,
  DEFAULT_HARDWARE,
  INITIAL_TELEMETRY,
} from './data/defaults';
import { WALLPAPER_LIST, getDynamicWallpaperForHour } from './data/wallpapers';
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
import { MaterialIcon } from './components/MaterialIcon';

export default function App() {
  // 1. Preferences with APFS LocalStorage Persistence
  const [preferences, setPreferences] = useState<SystemPreferences>(() => {
    const saved = localStorage.getItem('highsierra_preferences');
    if (saved) {
      try {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_PREFERENCES;
      }
    }
    return DEFAULT_PREFERENCES;
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
  const [selectedModel, setSelectedModel] = useState<ModelOption>(() => {
    return DEFAULT_MODELS[0];
  });

  // Ensure selected model points to valid updated model
  useEffect(() => {
    if (selectedModel && selectedModel.id.includes('3.6')) {
      const updated = DEFAULT_MODELS.find((m) => m.id === 'gemini-3.7-flash') || DEFAULT_MODELS[0];
      setSelectedModel(updated);
    }
  }, [selectedModel]);

  const [temperature, setTemperature] = useState<number>(0.7);
  const [topP, setTopP] = useState<number>(0.9);

  // 2. Multi-Session APFS Chat Management
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('highsierra_chat_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    // Create initial welcome session
    const initialSession: ChatSession = {
      id: `sess_${Date.now()}`,
      title: 'High Sierra Welcome Session',
      createdAt: new Date().toLocaleDateString(),
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: [],
      personaId: DEFAULT_PERSONAS[0].id,
      modelId: DEFAULT_MODELS[0].id,
      temperature: 0.7,
      topP: 0.9,
    };
    return [initialSession];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return sessions[0]?.id || `sess_${Date.now()}`;
  });

  const activeSession = useMemo(() => {
    return sessions.find((s) => s.id === activeSessionId) || sessions[0];
  }, [sessions, activeSessionId]);

  const messages = activeSession?.messages || [];

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

  // Desktop Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  // Startup chime
  useEffect(() => {
    if (preferences.soundEffects) {
      playChime('startup', true);
    }
  }, []);

  // Sync to APFS Storage
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
    localStorage.setItem('highsierra_chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Sync theme to root class for Tailwind dark mode
  useEffect(() => {
    if (preferences.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [preferences.theme]);

  // Handle Model Selection
  const handleSelectModel = (model: ModelOption) => {
    setSelectedModel(model);
    playChime('click', preferences.soundEffects);
  };

  // Session Management Handlers
  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    playChime('click', preferences.soundEffects);
  };

  const handleNewSession = () => {
    const newSess: ChatSession = {
      id: `sess_${Date.now()}`,
      title: `Conversation ${sessions.length + 1}`,
      createdAt: new Date().toLocaleDateString(),
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: [],
      personaId: selectedPersona.id,
      modelId: selectedModel.id,
      temperature,
      topP,
    };
    setSessions((prev) => [newSess, ...prev]);
    setActiveSessionId(newSess.id);
    playChime('send', preferences.soundEffects);
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (filtered.length === 0) {
        const fresh: ChatSession = {
          id: `sess_${Date.now()}`,
          title: 'New Conversation',
          createdAt: new Date().toLocaleDateString(),
          updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          messages: [],
          personaId: selectedPersona.id,
          modelId: selectedModel.id,
          temperature,
          topP,
        };
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (activeSessionId === id) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
    playChime('trash', preferences.soundEffects);
  };

  const handleClearAllSessions = () => {
    const fresh: ChatSession = {
      id: `sess_${Date.now()}`,
      title: 'New Conversation',
      createdAt: new Date().toLocaleDateString(),
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: [],
      personaId: selectedPersona.id,
      modelId: selectedModel.id,
      temperature,
      topP,
    };
    setSessions([fresh]);
    setActiveSessionId(fresh.id);
    playChime('trash', preferences.soundEffects);
  };

  const updateActiveSessionMessages = (updater: (prevMessages: ChatMessage[]) => ChatMessage[], sessionTitle?: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          const updatedMessages = updater(s.messages);
          return {
            ...s,
            messages: updatedMessages,
            title: sessionTitle || s.title,
            updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
        }
        return s;
      })
    );
  };

  // Send Message Handler
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

    const currentMessages = activeSession?.messages || [];
    const newMessages = [...currentMessages, userMsg];

    // Auto generate session title from first prompt if needed
    let newTitle: string | undefined = undefined;
    if (currentMessages.length === 0 && text.trim()) {
      newTitle = text.slice(0, 30) + (text.length > 30 ? '...' : '');
    }

    updateActiveSessionMessages(() => newMessages, newTitle);
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

      updateActiveSessionMessages((prev) => [...prev, assistantMsg]);
      playChime('receive', preferences.soundEffects);

      // Update telemetry token speed and total processed
      setTelemetry((prev) => ({
        ...prev,
        tokensPerSec: data.speedTokPerSec || 38,
        totalTokensProcessed: prev.totalTokensProcessed + (data.tokensUsed || 100),
      }));

      // Speak text if auto-TTS or speech is active
      if (preferences.speechEnabled && preferences.autoTtS) {
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

      updateActiveSessionMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Speech Synthesis Output (TTS)
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (!preferences.speechEnabled) return;

    window.speechSynthesis.cancel();

    // Clean markdown stars/headers for spoken clarity
    const cleanText = text.replace(/[*#`_~]/g, '').slice(0, 350);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = preferences.speechRate || 1.0;
    utterance.pitch = preferences.speechPitch || 1.0;

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

  // Export Session to JSON or TXT
  const handleExportSession = (format: 'json' | 'txt' = 'json') => {
    if (format === 'txt') {
      const lines = [
        `=============================================================`,
        `HighSierra AI Studio Conversation Session`,
        `Title: ${activeSession?.title || 'Session'}`,
        `Export Date: ${new Date().toLocaleString()}`,
        `Model: ${selectedModel.name}`,
        `Persona: ${selectedPersona.name}`,
        `=============================================================\n`,
      ];
      messages.forEach((m) => {
        lines.push(`[${m.timestamp}] ${m.role.toUpperCase()} (${m.model}):`);
        lines.push(m.content);
        lines.push('\n-------------------------------------------------------------\n');
      });

      const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `HighSierra_Chat_${Date.now()}.txt`;
      anchor.click();
      URL.revokeObjectURL(url);
    } else {
      const dataStr =
        'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeSession, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `HighSierra_Session_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }
  };

  // Import Session File
  const handleImportSession = (file?: File) => {
    if (!file) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,.txt';
      input.onchange = (e: any) => {
        const selected = e.target.files?.[0];
        if (selected) handleImportSession(selected);
      };
      input.click();
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (parsed && Array.isArray(parsed.messages)) {
            const importedSession: ChatSession = {
              ...parsed,
              id: `sess_imported_${Date.now()}`,
              title: parsed.title ? `Imported: ${parsed.title}` : `Imported ${file.name}`,
              updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setSessions((prev) => [importedSession, ...prev]);
            setActiveSessionId(importedSession.id);
            playChime('receive', preferences.soundEffects);
            return;
          } else if (Array.isArray(parsed)) {
            // Legacy message array
            const importedSession: ChatSession = {
              id: `sess_imported_${Date.now()}`,
              title: `Imported History (${file.name})`,
              createdAt: new Date().toLocaleDateString(),
              updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              messages: parsed,
              personaId: selectedPersona.id,
              modelId: selectedModel.id,
              temperature,
              topP,
            };
            setSessions((prev) => [importedSession, ...prev]);
            setActiveSessionId(importedSession.id);
            playChime('receive', preferences.soundEffects);
            return;
          }
        } else {
          // Parse .txt
          const userMsg: ChatMessage = {
            id: `msg_imported_${Date.now()}`,
            role: 'assistant',
            content: `📄 **Imported Transcript (${file.name})**\n\n` + text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            model: selectedModel.name,
          };
          const importedSession: ChatSession = {
            id: `sess_txt_${Date.now()}`,
            title: `Text: ${file.name}`,
            createdAt: new Date().toLocaleDateString(),
            updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            messages: [userMsg],
            personaId: selectedPersona.id,
            modelId: selectedModel.id,
            temperature,
            topP,
          };
          setSessions((prev) => [importedSession, ...prev]);
          setActiveSessionId(importedSession.id);
          playChime('receive', preferences.soundEffects);
        }
      } catch (err) {
        console.error('Failed to import session:', err);
        playChime('error', preferences.soundEffects);
      }
    };
    reader.readAsText(file);
  };

  // Get Wallpaper Background Image / Style
  const wallpaperStyle = useMemo(() => {
    const w = preferences.wallpaper;

    if (w === 'custom' && preferences.customWallpaperUrl) {
      return {
        backgroundImage: `url(${preferences.customWallpaperUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#0F172A',
      };
    }

    if (w === 'dynamic') {
      const hour = new Date().getHours();
      const dyn = getDynamicWallpaperForHour(hour);
      return {
        backgroundImage: `url(${dyn.imageSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#0F172A',
      };
    }

    const item = WALLPAPER_LIST.find((wp) => wp.id === w);
    if (item && item.imageSrc) {
      return {
        backgroundImage: `url(${item.imageSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#0F172A',
      };
    }

    if (item && item.gradientFallback) {
      return {
        background: item.gradientFallback,
      };
    }

    return { background: 'linear-gradient(135deg, #0284C7 0%, #1D4ED8 50%, #0F172A 100%)' };
  }, [preferences.wallpaper, preferences.customWallpaperUrl]);

  // Desktop Right-Click Context Menu Handler
  const handleContextMenu = (e: React.MouseEvent) => {
    // Only open on desktop background (not inside child buttons or inputs)
    if ((e.target as HTMLElement).id === 'mac-desktop-container' || (e.target as HTMLElement).id === 'mac-window-frame') {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY });
      playChime('click', preferences.soundEffects);
    }
  };

  useEffect(() => {
    const handleCloseMenu = () => setContextMenu(null);
    window.addEventListener('click', handleCloseMenu);
    return () => window.removeEventListener('click', handleCloseMenu);
  }, []);

  return (
    <div
      id="mac-desktop-container"
      onContextMenu={handleContextMenu}
      style={wallpaperStyle}
      className="h-screen w-screen flex flex-col overflow-hidden font-sans select-none relative"
    >
      {/* Optional Wallpaper Blur & Dimming Overlay */}
      {(preferences.wallpaperBlur > 0 || preferences.wallpaperDim > 0) && (
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-300"
          style={{
            backdropFilter: preferences.wallpaperBlur > 0 ? `blur(${preferences.wallpaperBlur}px)` : undefined,
            backgroundColor: preferences.wallpaperDim > 0 ? `rgba(0,0,0, ${preferences.wallpaperDim / 100})` : undefined,
          }}
        />
      )}

      {/* Top Apple Menu Bar */}
      <MenuBar
        telemetry={telemetry}
        preferences={preferences}
        onUpdatePreferences={(updated) => setPreferences((p) => ({ ...p, ...updated }))}
        selectedModel={selectedModel}
        models={models}
        onSelectModel={handleSelectModel}
        onOpenAboutMac={() => setShowAboutMac(true)}
        onOpenSysPrefs={() => setShowSysPrefs(true)}
        onOpenActivityMonitor={() => setShowActivityMonitor(true)}
        onOpenLocalHub={() => setActiveTab('local')}
        onOpenPersonaStudio={() => setShowPersonaStudio(true)}
        onNewSession={handleNewSession}
        onClearSession={() => handleDeleteSession(activeSessionId)}
        onExportSession={handleExportSession}
        onImportSession={handleImportSession}
        onToggleInspector={() => setShowInspector(!showInspector)}
        onToggleTerminal={() => setShowTerminal(!showTerminal)}
        onToggleSound={() => setPreferences((p) => ({ ...p, soundEffects: !p.soundEffects }))}
        onToggleSpeech={() => {
          setPreferences((p) => {
            const next = !p.speechEnabled;
            if (!next) stopSpeaking();
            return { ...p, speechEnabled: next };
          });
        }}
        onTriggerSiri={() => {
          handleSendMessage('Hello Siri AI! Provide a quick system and telemetry check of macOS High Sierra AI Studio.');
        }}
        onOpenInstaller={() => setShowInstaller(true)}
      />

      {/* Main High Sierra Desktop Window */}
      <main id="mac-window-frame" className="flex-1 p-2 sm:p-3 flex flex-col overflow-hidden relative z-10">
        <div className="flex-1 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-2xl rounded-lg shadow-2xl border border-white/40 dark:border-neutral-700 flex flex-col overflow-hidden max-w-7xl w-full mx-auto">
          {/* Window Chrome Titlebar */}
          <WindowChrome
            preferences={preferences}
            onUpdateTheme={(theme: ThemeName) => setPreferences((p) => ({ ...p, theme }))}
            selectedModel={selectedModel}
            selectedPersona={selectedPersona}
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            showInspector={showInspector}
            onToggleInspector={() => setShowInspector(!showInspector)}
            showTerminal={showTerminal}
            onToggleTerminal={() => setShowTerminal(!showTerminal)}
            onNewSession={handleNewSession}
            onOpenSysPrefs={() => setShowSysPrefs(true)}
          />

          {/* Window Body & Views */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Main Active Tab View */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {activeTab === 'chat' && (
                <ChatWorkspace
                  sessions={sessions}
                  activeSessionId={activeSessionId}
                  onSelectSession={handleSelectSession}
                  onNewSession={handleNewSession}
                  onDeleteSession={handleDeleteSession}
                  onClearAllSessions={handleClearAllSessions}
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  selectedModel={selectedModel}
                  selectedPersona={selectedPersona}
                  onRunInTerminal={handleRunCommand}
                  onSpeakText={speakText}
                  isSpeaking={isSpeaking}
                  onStopSpeaking={stopSpeaking}
                  speechEnabled={preferences.speechEnabled}
                  onToggleSpeech={() =>
                    setPreferences((p) => {
                      const next = !p.speechEnabled;
                      if (!next) stopSpeaking();
                      return { ...p, speechEnabled: next };
                    })
                  }
                  onExportSession={handleExportSession}
                  onImportSession={handleImportSession}
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

              {/* Bottom HighSierra Terminal Drawer */}
              {showTerminal && (
                <TerminalShellDrawer
                  executions={terminalExecutions}
                  onRunCommand={handleRunCommand}
                  onClearTerminal={() => setTerminalExecutions([])}
                  onClose={() => setShowTerminal(false)}
                />
              )}
            </div>

            {/* Right Inspector Drawer */}
            {showInspector && (
              <InspectorDrawer
                temperature={temperature}
                onTemperatureChange={setTemperature}
                topP={topP}
                onTopPChange={setTopP}
                selectedModel={selectedModel}
                selectedPersona={selectedPersona}
                onClose={() => setShowInspector(false)}
                onExportSession={handleExportSession}
                onDeleteSession={() => handleDeleteSession(activeSessionId)}
                onClearAllSessions={handleClearAllSessions}
              />
            )}
          </div>
        </div>
      </main>

      {/* Desktop Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white/95 dark:bg-neutral-800/95 text-gray-800 dark:text-gray-100 rounded-md shadow-2xl border border-gray-300 dark:border-neutral-700 py-1 backdrop-blur-xl text-xs w-52 select-none"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              handleNewSession();
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between"
          >
            <span>New AI Conversation</span>
            <span className="text-[10px] font-mono opacity-60">⌘N</span>
          </button>
          <button
            onClick={() => {
              setShowTerminal(true);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between"
          >
            <span>Open Terminal Shell</span>
            <span className="text-[10px] font-mono opacity-60">⌘T</span>
          </button>
          <div className="my-1 border-t border-gray-200 dark:border-neutral-700" />
          <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Quick Desktop Picture
          </div>
          <button
            onClick={() => {
              setPreferences((p) => ({ ...p, wallpaper: 'highsierra' }));
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1 hover:bg-blue-600 hover:text-white flex items-center justify-between text-[11px]"
          >
            <span>macOS High Sierra Lake</span>
            {preferences.wallpaper === 'highsierra' && <MaterialIcon name="check" size={12} />}
          </button>
          <button
            onClick={() => {
              setPreferences((p) => ({ ...p, wallpaper: 'sunset' }));
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1 hover:bg-blue-600 hover:text-white flex items-center justify-between text-[11px]"
          >
            <span>High Sierra Sunset Glow</span>
            {preferences.wallpaper === 'sunset' && <MaterialIcon name="check" size={12} />}
          </button>
          <button
            onClick={() => {
              setPreferences((p) => ({ ...p, wallpaper: 'granite' }));
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1 hover:bg-blue-600 hover:text-white flex items-center justify-between text-[11px]"
          >
            <span>Yosemite El Capitan</span>
            {preferences.wallpaper === 'granite' && <MaterialIcon name="check" size={12} />}
          </button>
          <button
            onClick={() => {
              setPreferences((p) => ({ ...p, wallpaper: 'dynamic' }));
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1 hover:bg-blue-600 hover:text-white flex items-center justify-between text-[11px] font-semibold text-blue-600 dark:text-blue-400"
          >
            <span>Dynamic Time-of-Day (24h)</span>
            {preferences.wallpaper === 'dynamic' && <MaterialIcon name="check" size={12} />}
          </button>
          <div className="my-1 border-t border-gray-200 dark:border-neutral-700" />
          <button
            onClick={() => {
              setShowSysPrefs(true);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center space-x-1.5"
          >
            <MaterialIcon name="wallpaper" size={14} />
            <span>Desktop Pictures & Preferences...</span>
          </button>
          <button
            onClick={() => {
              setShowSysPrefs(true);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center space-x-1.5"
          >
            <MaterialIcon name="palette" size={14} />
            <span>Change Appearance Theme...</span>
          </button>
          <div className="my-1 border-t border-gray-200 dark:border-neutral-700" />
          <button
            onClick={() => {
              setShowAboutMac(true);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white"
          >
            About macOS High Sierra AI...
          </button>
        </div>
      )}

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
