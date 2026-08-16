import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'motion/react';
import { MaterialIcon } from './MaterialIcon';
import { ChatMessage, ImageAttachment, ModelOption, Persona, ChatSession } from '../types';

interface ChatWorkspaceProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onClearAllSessions: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string, imageAttachment?: ImageAttachment) => void;
  isLoading: boolean;
  selectedModel: ModelOption;
  selectedPersona: Persona;
  onRunInTerminal: (code: string) => void;
  onSpeakText: (text: string) => void;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
  speechEnabled: boolean;
  onToggleSpeech: () => void;
  onExportSession: (format: 'json' | 'txt') => void;
  onImportSession: (file: File) => void;
}

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onClearAllSessions,
  messages,
  onSendMessage,
  isLoading,
  selectedModel,
  selectedPersona,
  onRunInTerminal,
  onSpeakText,
  isSpeaking,
  onStopSpeaking,
  speechEnabled,
  onToggleSpeech,
  onExportSession,
  onImportSession,
}) => {
  const [inputText, setInputText] = useState('');
  const [imageAttachment, setImageAttachment] = useState<ImageAttachment | undefined>(undefined);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Web Speech API Dictation Setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputText((prev) => {
            const separator = prev && !prev.endsWith(' ') ? ' ' : '';
            return prev + separator + transcript;
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission denied. Enable mic in browser settings.');
        } else if (event.error !== 'no-speech') {
          setSpeechError(`Dictation: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const toggleListening = () => {
    setSpeechError(null);
    if (!recognitionRef.current) {
      setSpeechError('Web Speech API is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err: any) {
        console.warn('Recognition start error:', err);
        setIsListening(false);
      }
    }
  };

  // Calculate live token estimation
  const tokenStats = useMemo(() => {
    // Standard rule of thumb: ~4 characters per token for English text & code
    const promptTokens = Math.ceil(inputText.length / 4);
    const imageTokens = imageAttachment ? 258 : 0;
    const inputTotal = promptTokens + imageTokens;

    // Calculate conversation history tokens
    const historyTokens = messages.reduce((acc, m) => {
      return acc + (m.tokensUsed || Math.ceil(m.content.length / 4));
    }, 0);

    const totalContextUsed = historyTokens + inputTotal;

    // Determine max context length number
    let maxContextNum = 1000000;
    if (selectedModel.contextLength.includes('1M')) maxContextNum = 1000000;
    else if (selectedModel.contextLength.includes('2M')) maxContextNum = 2000000;
    else if (selectedModel.contextLength.includes('32k')) maxContextNum = 32768;
    else if (selectedModel.contextLength.includes('16k')) maxContextNum = 16384;
    else if (selectedModel.contextLength.includes('8k')) maxContextNum = 8192;
    else if (selectedModel.contextLength.includes('4k')) maxContextNum = 4096;

    const percentContext = Math.min(100, ((totalContextUsed / maxContextNum) * 100)).toFixed(1);

    return {
      promptTokens,
      imageTokens,
      inputTotal,
      historyTokens,
      totalContextUsed,
      maxContextNum,
      percentContext,
    };
  }, [inputText, imageAttachment, messages, selectedModel]);

  // Greeting based on time of day
  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning, Engineer';
    if (hour >= 12 && hour < 17) return 'Good afternoon, Architect';
    if (hour >= 17 && hour < 22) return 'Good evening, Developer';
    return 'Welcome to High Sierra Night Lab';
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !imageAttachment) || isLoading) return;
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    }
    onSendMessage(inputText.trim(), imageAttachment);
    setInputText('');
    setImageAttachment(undefined);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageAttachment({
          name: file.name,
          type: file.type,
          dataUrl: event.target.result as string,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCopyCode = (codeText: string, index: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden font-sans select-text">
      {/* Hidden Session Import Input */}
      <input
        type="file"
        ref={importInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImportSession(file);
        }}
        accept=".json,.txt"
        className="hidden"
      />

      {/* Left Sidebar: Conversations & Sessions Manager */}
      <AnimatePresence>
        {showSidebar && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full sidebar-bg flex flex-col justify-between border-r border-gray-300 dark:border-neutral-700 select-none overflow-hidden shrink-0 z-10 text-xs"
          >
            {/* Sidebar Top: New Chat & Actions */}
            <div className="p-3 border-b border-gray-300 dark:border-neutral-750 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                  <MaterialIcon name="forum" size={14} className="text-blue-500 mr-1" />
                  <span>Conversations</span>
                </span>
                <span className="text-[10px] bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded-full font-mono">
                  {sessions.length}
                </span>
              </div>

              <button
                onClick={onNewSession}
                className="w-full btn-macos py-1.5 px-3 flex items-center justify-center space-x-1.5 text-xs font-semibold text-gray-800 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer shadow-xs"
                title="Create New Conversation Session (⌘N)"
              >
                <MaterialIcon name="add" size={16} className="text-blue-600 dark:text-blue-400" />
                <span>New Conversation</span>
              </button>
            </div>

            {/* Sidebar Session List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {sessions.length === 0 ? (
                <div className="text-center p-4 text-gray-400 text-xs">
                  <MaterialIcon name="chat_bubble_outline" size={24} className="opacity-40 mb-1" />
                  <p>No saved conversations.</p>
                </div>
              ) : (
                sessions.map((sess) => {
                  const isActive = sess.id === activeSessionId;
                  const isConfirmingDelete = sessionToDelete === sess.id;

                  return (
                    <div
                      key={sess.id}
                      className={`group relative flex items-center justify-between p-2 rounded-md transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs font-medium'
                          : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'
                      }`}
                      onClick={() => onSelectSession(sess.id)}
                    >
                      <div className="flex items-center space-x-2 min-w-0 pr-2">
                        <MaterialIcon
                          name={isActive ? 'chat' : 'chat_bubble'}
                          size={14}
                          className={isActive ? 'text-white' : 'text-gray-400'}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium leading-snug">
                            {sess.title || 'Untitled Session'}
                          </p>
                          <p className={`text-[10px] font-mono truncate ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>
                            {sess.messages.length} msgs • {sess.updatedAt || 'Just now'}
                          </p>
                        </div>
                      </div>

                      {/* Delete Session Button with Confirmation */}
                      <div className="flex items-center shrink-0">
                        {isConfirmingDelete ? (
                          <div
                            className="flex items-center space-x-1 bg-red-600 text-white p-1 rounded-xs shadow-md animate-scale-in"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => {
                                onDeleteSession(sess.id);
                                setSessionToDelete(null);
                              }}
                              className="px-1.5 py-0.5 bg-red-700 hover:bg-red-800 rounded-xs text-[10px] font-bold"
                              title="Confirm Delete"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setSessionToDelete(null)}
                              className="px-1 text-[10px] hover:text-red-200"
                              title="Cancel"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSessionToDelete(sess.id);
                            }}
                            className={`p-1 rounded-xs opacity-0 group-hover:opacity-100 transition-opacity ${
                              isActive
                                ? 'hover:bg-blue-700 text-white'
                                : 'hover:bg-red-100 text-gray-400 hover:text-red-600 dark:hover:bg-red-950/40'
                            }`}
                            title="Delete this session"
                          >
                            <MaterialIcon name="delete" size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Sidebar Footer: Speech Voice Toggle & Storage Tools */}
            <div className="p-2.5 bg-black/5 dark:bg-black/20 border-t border-gray-300 dark:border-neutral-700 space-y-2">
              {/* Speech Voice Global Switch */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center space-x-1.5 text-[11px] text-gray-700 dark:text-gray-300">
                  <MaterialIcon
                    name={speechEnabled ? 'volume_up' : 'volume_off'}
                    size={15}
                    className={speechEnabled ? 'text-emerald-500' : 'text-gray-400'}
                  />
                  <span>Voice Speech</span>
                </div>
                <button
                  onClick={onToggleSpeech}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                    speechEnabled
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-gray-300 dark:bg-neutral-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {speechEnabled ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Import / Export / Clear Session Toolbar */}
              <div className="grid grid-cols-3 gap-1 pt-1">
                <button
                  onClick={() => onExportSession('json')}
                  className="btn-macos py-1 flex items-center justify-center space-x-1 text-[10px] text-gray-700 dark:text-gray-300"
                  title="Export active session to .json"
                >
                  <MaterialIcon name="download" size={12} />
                  <span>Export</span>
                </button>

                <button
                  onClick={() => importInputRef.current?.click()}
                  className="btn-macos py-1 flex items-center justify-center space-x-1 text-[10px] text-gray-700 dark:text-gray-300"
                  title="Import .json or .txt conversation"
                >
                  <MaterialIcon name="upload" size={12} />
                  <span>Import</span>
                </button>

                <button
                  onClick={onClearAllSessions}
                  className="btn-macos py-1 flex items-center justify-center space-x-1 text-[10px] text-red-600 hover:text-red-700"
                  title="Clear all conversation histories"
                >
                  <MaterialIcon name="delete_sweep" size={12} />
                  <span>Clear</span>
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col h-full bg-white/85 dark:bg-neutral-900/85 backdrop-blur-xs overflow-hidden">
        {/* Workspace Top Toolbar */}
        <div className="px-3 py-2 border-b border-gray-200 dark:border-neutral-800 bg-gray-50/70 dark:bg-neutral-850/70 flex items-center justify-between text-xs select-none">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-1 rounded-xs hover:bg-black/10 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 cursor-pointer"
              title={showSidebar ? 'Hide Conversations Sidebar' : 'Show Conversations Sidebar'}
            >
              <MaterialIcon name={showSidebar ? 'menu_open' : 'menu'} size={18} />
            </button>

            <span className="font-bold text-gray-800 dark:text-white flex items-center space-x-1.5">
              <span>{selectedPersona.avatar}</span>
              <span>{selectedPersona.name}</span>
            </span>

            <span className="text-[10px] text-gray-400">•</span>

            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-mono flex items-center space-x-1">
              <MaterialIcon name="neurology" size={14} />
              <span>{selectedModel.name}</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Live Speaking Indicator */}
            {isSpeaking && (
              <button
                onClick={onStopSpeaking}
                className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-200 text-[10px] font-bold flex items-center space-x-1 animate-pulse"
                title="Stop Speech Audio Output"
              >
                <MaterialIcon name="volume_up" size={12} />
                <span>Speaking... (Click to Stop)</span>
              </button>
            )}

            {/* Quick Export format buttons */}
            <button
              onClick={() => onExportSession('txt')}
              className="px-2 py-0.5 btn-macos text-[10px] text-gray-600 dark:text-gray-300 flex items-center space-x-1"
              title="Save transcript as readable .txt file"
            >
              <MaterialIcon name="description" size={12} />
              <span>Export .TXT</span>
            </button>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            /* Modern & Engaging Opening Page / Welcome View */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="h-full flex flex-col items-center justify-center text-center p-6 space-y-5 max-w-2xl mx-auto my-auto"
            >
              {/* Persona Avatar Badge */}
              <motion.div
                initial={{ scale: 0.8, rotate: -5 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-sky-400 via-blue-600 to-indigo-700 text-white flex items-center justify-center text-4xl shadow-xl border border-white/30"
              >
                {selectedPersona.avatar}
              </motion.div>

              <div className="space-y-1.5">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {timeGreeting}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                  HighSierra AI Studio is ready. Running dual-engine inference with{' '}
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedModel.name}</span>{' '}
                  and the{' '}
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedPersona.name}</span>{' '}
                  profile.
                </p>
              </div>

              {/* Capability Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-medium text-gray-600 dark:text-gray-300">
                <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 flex items-center space-x-1 shadow-2xs">
                  <MaterialIcon name="cloud_sync" size={13} />
                  <span>Gemini 3.6 Flash</span>
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center space-x-1 shadow-2xs">
                  <MaterialIcon name="memory" size={13} />
                  <span>Metal 2 GPU Quantization</span>
                </span>
                <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 flex items-center space-x-1 shadow-2xs">
                  <MaterialIcon name="mic" size={13} />
                  <span>Web Speech Dictation</span>
                </span>
                <span className="px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 flex items-center space-x-1 shadow-2xs">
                  <MaterialIcon name="lock" size={13} />
                  <span>APFS Local Persistence</span>
                </span>
              </div>

              {/* Starter Prompt Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left pt-2">
                <button
                  onClick={() => onSendMessage('Explain macOS 10.13 High Sierra APFS architecture and Metal 2 graphics pipeline.')}
                  className="p-3.5 rounded-lg bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-neutral-750 transition-all text-left group shadow-xs cursor-pointer"
                >
                  <div className="flex items-center space-x-1.5 text-blue-600 dark:text-blue-400 font-bold text-xs mb-1">
                    <MaterialIcon name="computer" size={16} />
                    <span>Mac Architecture Deep Dive</span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                    Compare APFS 64-bit inodes, crash protection, and Metal 2 shader acceleration.
                  </p>
                </button>

                <button
                  onClick={() => onSendMessage('Write a bash shell script to automate APFS snapshots and user backup archives.')}
                  className="p-3.5 rounded-lg bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-neutral-750 transition-all text-left group shadow-xs cursor-pointer"
                >
                  <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs mb-1">
                    <MaterialIcon name="terminal" size={16} />
                    <span>APFS Shell Automation</span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                    Generate production bash scripts with tmutil snapshot management.
                  </p>
                </button>

                <button
                  onClick={() => onSendMessage('How do I optimize local GGUF models with Metal 2 GPU layer offloading on macOS High Sierra?')}
                  className="p-3.5 rounded-lg bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-neutral-750 transition-all text-left group shadow-xs cursor-pointer"
                >
                  <div className="flex items-center space-x-1.5 text-purple-600 dark:text-purple-400 font-bold text-xs mb-1">
                    <MaterialIcon name="speed" size={16} />
                    <span>Metal 2 GPU Tuning</span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                    Calibrate VRAM allocation and thread counts for maximum tokens/sec.
                  </p>
                </button>

                <button
                  onClick={() => onSendMessage('Help me write a full-stack TypeScript Express backend with Google GenAI streaming.')}
                  className="p-3.5 rounded-lg bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-neutral-750 transition-all text-left group shadow-xs cursor-pointer"
                >
                  <div className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-400 font-bold text-xs mb-1">
                    <MaterialIcon name="code" size={16} />
                    <span>Full-Stack Engineering</span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                    Build secure server-side AI proxies with clean API route structures.
                  </p>
                </button>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 14, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className={`flex flex-col space-y-1 ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  {/* Message Header Badge */}
                  <div className="flex items-center space-x-1.5 text-[10px] text-gray-400 font-mono px-1">
                    {msg.role === 'user' ? (
                      <>
                        <span>You</span>
                        <MaterialIcon name="person" size={12} className="text-blue-500" />
                      </>
                    ) : (
                      <>
                        <MaterialIcon name="smart_toy" size={12} className="text-emerald-500" />
                        <span className="font-bold text-gray-700 dark:text-gray-300">{msg.model}</span>
                        {msg.speedTokPerSec && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            • {msg.speedTokPerSec} tok/s
                          </span>
                        )}
                      </>
                    )}
                    <span>• {msg.timestamp}</span>
                  </div>

                  {/* Message Bubble Container */}
                  <div
                    className={`max-w-2xl rounded-lg p-3.5 shadow-2xs text-xs leading-relaxed transition-all ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white rounded-br-xs'
                        : 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 border border-gray-200 dark:border-neutral-700 rounded-bl-xs'
                    }`}
                  >
                    {/* Attached Vision Image */}
                    {msg.imageAttachment && (
                      <div className="mb-2.5 rounded-md overflow-hidden border border-black/10">
                        <img
                          src={msg.imageAttachment.dataUrl}
                          alt={msg.imageAttachment.name}
                          className="max-h-64 w-auto rounded-md object-contain"
                        />
                      </div>
                    )}

                    {/* Reasoning Block if available */}
                    {msg.reasoning && (
                      <details className="mb-2.5 p-2 bg-black/5 dark:bg-black/30 rounded-xs border border-black/10 text-[11px]">
                        <summary className="font-bold text-amber-600 dark:text-amber-400 cursor-pointer flex items-center space-x-1">
                          <MaterialIcon name="psychology" size={14} />
                          <span>Deep Reasoning Chain-of-Thought</span>
                        </summary>
                        <div className="mt-1.5 font-mono text-[10px] text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                          {msg.reasoning}
                        </div>
                      </details>
                    )}

                    {/* Markdown Text Body */}
                    <div className="markdown-body">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            const codeString = String(children).replace(/\n$/, '');

                            if (!inline && match) {
                              return (
                                <div className="my-2.5 rounded-md overflow-hidden border border-neutral-700 bg-neutral-900 text-gray-100 font-mono text-[11px]">
                                  <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-800 border-b border-neutral-700 text-[10px]">
                                    <span className="font-bold text-emerald-400 flex items-center space-x-1">
                                      <MaterialIcon name="code" size={12} className="text-emerald-400 mr-1" />
                                      <span>{match[1]}</span>
                                    </span>
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() => onRunInTerminal(codeString)}
                                        className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xs font-semibold flex items-center space-x-1 cursor-pointer"
                                        title="Run code snippet in HighSierra Terminal Shell"
                                      >
                                        <MaterialIcon name="terminal" size={12} />
                                        <span>Run in Shell</span>
                                      </button>
                                      <button
                                        onClick={() => handleCopyCode(codeString, idx)}
                                        className="px-2 py-0.5 bg-neutral-700 hover:bg-neutral-600 text-gray-200 rounded-xs flex items-center space-x-1 cursor-pointer"
                                      >
                                        <MaterialIcon
                                          name={copiedIndex === idx ? 'check' : 'content_copy'}
                                          size={12}
                                          className={copiedIndex === idx ? 'text-emerald-400' : ''}
                                        />
                                        <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                                      </button>
                                    </div>
                                  </div>
                                  <pre className="p-3 overflow-x-auto text-[11px] leading-relaxed">
                                    <code>{children}</code>
                                  </pre>
                                </div>
                              );
                            }
                            return (
                              <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded-xs font-mono text-[11px]" {...props}>
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>

                    {/* Assistant Message Actions & Token Metrics */}
                    {msg.role === 'assistant' && (
                      <div className="mt-2.5 pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[10px] text-gray-400">
                        <button
                          onClick={() => onSpeakText(msg.content)}
                          className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center space-x-1 cursor-pointer"
                          title="Read message response aloud via Speech Synthesis"
                        >
                          <MaterialIcon name="volume_up" size={13} />
                          <span>Read Aloud</span>
                        </button>

                        <div className="flex items-center space-x-2 font-mono">
                          {msg.tokensUsed && (
                            <span>{msg.tokensUsed} tokens</span>
                          )}
                          <button
                            onClick={() => navigator.clipboard.writeText(msg.content)}
                            className="hover:text-gray-600 dark:hover:text-gray-200"
                            title="Copy message text"
                          >
                            <MaterialIcon name="content_copy" size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 text-xs text-gray-500 font-mono p-2"
            >
              <MaterialIcon name="autorenew" size={16} className="text-blue-500 animate-spin" />
              <span>High Sierra AI Engine synthesizing response...</span>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area & Live Token Meter */}
        <div className="p-3 bg-gray-100 dark:bg-neutral-800 border-t border-gray-200 dark:border-neutral-700">
          {/* Speech Error Banner if any */}
          {speechError && (
            <div className="mb-2 p-1.5 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs rounded-md border border-red-200 flex items-center justify-between">
              <span>{speechError}</span>
              <button onClick={() => setSpeechError(null)} className="font-bold">✕</button>
            </div>
          )}

          {/* Attached Image Preview */}
          {imageAttachment && (
            <div className="mb-2 flex items-center space-x-2 p-1.5 bg-blue-50 dark:bg-neutral-700 rounded-md border border-blue-200 dark:border-neutral-600 w-fit text-xs">
              <MaterialIcon name="image" size={16} className="text-blue-600" />
              <span className="font-medium max-w-xs truncate">{imageAttachment.name}</span>
              <button
                onClick={() => setImageAttachment(undefined)}
                className="text-gray-400 hover:text-red-600 cursor-pointer"
              >
                <MaterialIcon name="close" size={14} />
              </button>
            </div>
          )}

          {/* Prompt Form */}
          <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
            <div className="flex items-start space-x-2">
              {/* Vision File Upload Button */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 btn-macos text-gray-700 dark:text-gray-300 cursor-pointer"
                title="Attach Vision Image"
              >
                <MaterialIcon name="attach_file" size={18} />
              </button>

              {/* Web Speech Dictation Microphone Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2 rounded-md border transition-all cursor-pointer ${
                  isListening
                    ? 'bg-red-500 text-white border-red-600 ring-2 ring-red-400 animate-pulse shadow-md'
                    : 'btn-macos text-gray-700 dark:text-gray-300'
                }`}
                title={isListening ? 'Stop Speech Dictation' : 'Dictate with Web Speech API'}
              >
                <MaterialIcon name={isListening ? 'mic' : 'mic_none'} size={18} />
              </button>

              {/* Main Prompt Textarea */}
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder={
                  isListening
                    ? 'Listening to microphone... Speak clearly...'
                    : `Ask ${selectedPersona.name} using ${selectedModel.name}... (Press Enter to Send)`
                }
                style={{ height: '96px' }}
                className={`flex-1 p-3 input-inset rounded-md text-xs font-sans text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  isListening ? 'border-red-400 ring-1 ring-red-400' : ''
                }`}
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={(!inputText.trim() && !imageAttachment) || isLoading}
                className="px-4 py-3 btn-macos-primary flex flex-col items-center justify-center space-y-1 text-xs font-bold disabled:opacity-50 cursor-pointer h-[96px]"
              >
                <MaterialIcon name="send" size={18} />
                <span>Send</span>
              </button>
            </div>

            {/* Live Token Usage Counter Bar */}
            <div className="flex flex-wrap items-center justify-between px-1 text-[10px] font-mono text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1">
                  <MaterialIcon name="token" size={13} className="text-blue-500" />
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    ~{tokenStats.inputTotal} input tokens
                  </span>
                  {tokenStats.imageTokens > 0 && (
                    <span className="text-[9px] text-blue-600">
                      (+{tokenStats.imageTokens} vision)
                    </span>
                  )}
                </span>

                <span>•</span>

                <span>
                  Context Window: <strong className="text-gray-700 dark:text-gray-300">{tokenStats.totalContextUsed.toLocaleString()}</strong> / {selectedModel.contextLength}
                </span>

                <span className="text-[9px] bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-sm font-semibold">
                  {tokenStats.percentContext}% used
                </span>
              </div>

              <div className="flex items-center space-x-2 text-[10px]">
                {isListening && (
                  <span className="text-red-600 dark:text-red-400 font-bold flex items-center space-x-1 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span>Microphone Active</span>
                  </span>
                )}
                <span>Shift+Enter for newline</span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
