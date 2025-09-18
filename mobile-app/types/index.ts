// AudioVR Mobile App Types
export interface GameWorld {
  id: string;
  name: string;
  description: string;
  difficulty: number; // 1-5 stars
  estimatedDuration: number; // minutes
  backgroundImage: string;
  ambientSound: string;
  availableCases: number;
  isUnlocked: boolean;
}

export interface DetectiveCase {
  id: string;
  title: string;
  worldId: string;
  description: string;
  difficulty: number; // 1-5 stars
  estimatedDuration: number; // minutes
  currentChapter: number;
  totalChapters: number;
  backgroundImage: string;
  characters: Character[];
  evidence: Evidence[];
  progress: number; // 0-100
  isUnlocked: boolean;
  lastPlayedAt?: Date;
}

export interface Character {
  id: string;
  name: string;
  role: string;
  avatar: string;
  voiceActor: string;
  description: string;
  isAlive: boolean;
  suspicionLevel: number; // 0-100
}

export interface Evidence {
  id: string;
  name: string;
  description: string;
  type: 'physical' | 'testimony' | 'document' | 'photograph';
  foundAt: string;
  isKey: boolean;
  image?: string;
}

export interface VoiceCommand {
  pattern: string;
  intent: string;
  confidence: number;
  context: string[];
  examples: string[];
}

export interface AccessibilitySettings {
  voiceNavigationEnabled: boolean;
  screenReaderOptimized: boolean;
  highContrastMode: boolean;
  largeTextMode: boolean;
  reduceMotion: boolean;
  spatialAudioEnabled: boolean;
  hapticFeedbackEnabled: boolean;
  voiceCommandSensitivity: number; // 0-100
}

export interface UserProgress {
  totalCasesCompleted: number;
  totalPlayTime: number; // minutes
  currentStreak: number;
  achievements: Achievement[];
  favoriteWorlds: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress: number; // 0-100
  target: number;
}

export interface AudioFeedback {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  soundEffect?: string;
  spatialPosition?: '3d-position';
}

export interface GameState {
  currentWorld?: string;
  currentCase?: string;
  currentLocation?: string;
  activeCharacters: string[];
  availableEvidence: string[];
  gamePhase: 'menu' | 'exploration' | 'conversation' | 'deduction';
  playerProgress: number;
}