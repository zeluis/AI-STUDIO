export type Role = 'user' | 'assistant' | 'system';

export interface ImageAttachment {
  name: string;
  type: string;
  dataUrl: string; // Base64 data URL
}

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: string;
  model: string;
  imageAttachment?: ImageAttachment;
  reasoning?: string;
  tokensUsed?: number;
  speedTokPerSec?: number;
  isLocal?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  personaId: string;
  modelId: string;
  temperature: number;
  topP: number;
}

export type ProviderType = 'gemini' | 'ollama' | 'lmstudio';

export interface ModelOption {
  id: string;
  name: string;
  provider: ProviderType;
  description: string;
  contextLength: string;
  isLocal: boolean;
  recommendedVramGB?: number;
}

export interface Persona {
  id: string;
  name: string;
  avatar: string; // Emoji or icon name
  category: string;
  description: string;
  systemPrompt: string;
  defaultTemp: number;
  defaultTopP: number;
  isBuiltIn?: boolean;
}

export type ThemeName = 'aqua' | 'dark' | 'brushed';
export type WallpaperName = 'highsierra' | 'sunset' | 'snow' | 'granite' | 'space';

export interface SystemPreferences {
  theme: ThemeName;
  wallpaper: WallpaperName;
  soundEffects: boolean;
  autoTtS: boolean;
  selectedVoice: string;
  localServerUrl: string; // e.g. http://localhost:11434
  localServerType: 'ollama' | 'lmstudio';
  simulationMode: boolean; // allow instant mock local responses if no server is running
  nodeCompatibility: string;
  chromeCompatibility: string;
}

export interface HardwareSettings {
  vramOffloadPercent: number; // 0 to 100%
  cpuThreads: number; // 1 to 16
  metal2Accelerated: boolean;
  apfsStorageLimitGB: number;
}

export interface SystemTelemetry {
  vramUsedGB: number;
  vramTotalGB: number;
  cpuUsagePercent: number;
  tokensPerSec: number;
  activeProcesses: {
    pid: number;
    name: string;
    cpuPercent: number;
    memoryMB: number;
    status: string;
  }[];
  totalTokensProcessed: number;
  apfsUsedGB: number;
  apfsTotalGB: number;
  metal2Status: string;
}

export interface TerminalExecution {
  id: string;
  command: string;
  language: string;
  code: string;
  output: string;
  exitCode: number;
  timestamp: string;
}
