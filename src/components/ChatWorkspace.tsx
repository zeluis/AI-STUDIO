import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  Volume2,
  VolumeX,
  Terminal,
  Copy,
  Check,
  Sparkles,
  Bot,
  User,
  Zap,
  RefreshCw,
  X,
  Brain,
} from 'lucide-react';
import { ChatMessage, ImageAttachment, ModelOption, Persona } from '../types';

interface ChatWorkspaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, imageAttachment?: ImageAttachment) => void;
  isLoading: boolean;
  selectedModel: ModelOption;
  selectedPersona: Persona;
  onRunInTerminal: (code: string) => void;
  onSpeakText: (text: string) => void;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
}

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
  selectedModel,
  selectedPersona,
  onRunInTerminal,
  onSpeakText,
  isSpeaking,
  onStopSpeaking,
}) => {
  const [inputText, setInputText] = useState('');
  const [imageAttachment, setImageAttachment] = useState<ImageAttachment | undefined>(undefined);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !imageAttachment) || isLoading) return;
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
    <div className="flex-1 flex flex-col h-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xs select-text overflow-hidden font-sans">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          /* Welcome Banner */
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-lg mx-auto my-auto animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-400 via-blue-600 to-indigo-700 text-white flex items-center justify-center text-3xl shadow-lg border border-white/20">
              {selectedPersona.avatar}
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Welcome to HighSierra AI Studio
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Active Engine: <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedModel.name}</span> | Persona: <span className="font-semibold">{selectedPersona.name}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left text-xs pt-2">
              <button
                onClick={() => onSendMessage('Explain macOS 10.13 APFS filesystem and Metal 2 graphics pipeline.')}
                className="p-3 rounded-md bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-neutral-750 transition-colors"
              >
                <span className="font-bold text-blue-600 dark:text-blue-400 block mb-0.5">💻 Mac Technical Genius</span>
                <span className="text-[11px] text-gray-500">Explain APFS filesystem & Metal 2 specs.</span>
              </button>

              <button
                onClick={() => onSendMessage('Write a bash script to back up user files to APFS volume.')}
                className="p-3 rounded-md bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-neutral-750 transition-colors"
              >
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">⚡ Shell Script Wizard</span>
                <span className="text-[11px] text-gray-500">Write bash backup script for APFS.</span>
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={msg.id}
              className={`flex flex-col space-y-1 ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              {/* Message Header Badge */}
              <div className="flex items-center space-x-1.5 text-[10px] text-gray-400 font-mono">
                {msg.role === 'user' ? (
                  <>
                    <span>You</span>
                    <User className="w-3 h-3 text-blue-500" />
                  </>
                ) : (
                  <>
                    <Bot className="w-3 h-3 text-emerald-500" />
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
                className={`max-w-2xl rounded-lg p-3 shadow-2xs text-xs leading-relaxed transition-all ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-xs'
                    : 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 border border-gray-200 dark:border-neutral-700 rounded-bl-xs'
                }`}
              >
                {/* Image Attachment inside Message */}
                {msg.imageAttachment && (
                  <div className="mb-2.5 rounded-md overflow-hidden border border-black/10">
                    <img
                      src={msg.imageAttachment.dataUrl}
                      alt={msg.imageAttachment.name}
                      className="max-h-60 w-auto rounded-md object-contain"
                    />
                  </div>
                )}

                {/* Reasoning Block if available */}
                {msg.reasoning && (
                  <details className="mb-2 p-2 bg-black/5 dark:bg-black/30 rounded-xs border border-black/10 text-[11px]">
                    <summary className="font-bold text-amber-600 dark:text-amber-400 cursor-pointer flex items-center space-x-1">
                      <Brain className="w-3.5 h-3.5" />
                      <span>Deep Reasoning Chain-of-Thought</span>
                    </summary>
                    <div className="mt-1 font-mono text-[10px] text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
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
                            <div className="my-2 rounded-md overflow-hidden border border-neutral-700 bg-neutral-900 text-gray-100 font-mono text-[11px]">
                              {/* Code Block Header */}
                              <div className="flex items-center justify-between px-3 py-1 bg-neutral-800 border-b border-neutral-700 text-[10px]">
                                <span className="font-bold text-emerald-400">{match[1]}</span>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => onRunInTerminal(codeString)}
                                    className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xs font-semibold flex items-center space-x-1"
                                    title="Run code snippet in HighSierra Terminal Shell"
                                  >
                                    <Terminal className="w-3 h-3" />
                                    <span>Run in Shell</span>
                                  </button>
                                  <button
                                    onClick={() => handleCopyCode(codeString, idx)}
                                    className="px-2 py-0.5 bg-neutral-700 hover:bg-neutral-600 text-gray-200 rounded-xs flex items-center space-x-1"
                                  >
                                    {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
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

                {/* Assistant Message Actions */}
                {msg.role === 'assistant' && (
                  <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[10px] text-gray-400">
                    <button
                      onClick={() => onSpeakText(msg.content)}
                      className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center space-x-1"
                      title="Speak Message Response"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Read Aloud</span>
                    </button>

                    {msg.tokensUsed && (
                      <span className="font-mono">{msg.tokensUsed} tokens</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex items-center space-x-2 text-xs text-gray-500 font-mono p-2">
            <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
            <span>High Sierra AI Engine synthesizing response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Toolbar Area */}
      <div className="p-3 bg-gray-100 dark:bg-neutral-800 border-t border-gray-200 dark:border-neutral-700">
        {/* Attached Image Preview */}
        {imageAttachment && (
          <div className="mb-2 flex items-center space-x-2 p-1.5 bg-blue-50 dark:bg-neutral-700 rounded-md border border-blue-200 dark:border-neutral-600 w-fit text-xs">
            <ImageIcon className="w-4 h-4 text-blue-600" />
            <span className="font-medium max-w-xs truncate">{imageAttachment.name}</span>
            <button
              onClick={() => setImageAttachment(undefined)}
              className="text-gray-400 hover:text-red-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          {/* File Upload Button */}
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
            className="p-2 rounded-md bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 shadow-2xs"
            title="Upload Vision Image Attachment"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Main Input Text Box */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask ${selectedPersona.name} using ${selectedModel.name}...`}
            className="flex-1 p-2 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 rounded-md text-xs font-sans text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={(!inputText.trim() && !imageAttachment) || isLoading}
            className="px-4 py-2 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-md text-xs font-bold shadow-xs flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
