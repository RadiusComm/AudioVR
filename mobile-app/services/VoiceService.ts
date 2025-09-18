import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { VoiceCommand, GameState, AccessibilitySettings } from '../types';

export interface VoiceRecognitionResult {
  text: string;
  confidence: number;
  alternatives: string[];
}

export interface VoiceServiceConfig {
  wakeWords: string[];
  confidenceThreshold: number;
  language: string;
  enableOfflineMode: boolean;
  accessibilitySettings: AccessibilitySettings;
}

export class AudioVRVoiceService {
  private isListening: boolean = false;
  private isWakeWordActive: boolean = true;
  private currentContext: GameState | null = null;
  private config: VoiceServiceConfig;
  private audioRecording: Audio.Recording | null = null;
  
  // Voice command patterns by context
  private commandPatterns: Record<string, VoiceCommand[]> = {
    'menu': [
      { pattern: 'start game', intent: 'start_game', confidence: 0.9, context: ['menu'], examples: ['start game', 'begin game'] },
      { pattern: 'settings', intent: 'open_settings', confidence: 0.9, context: ['menu'], examples: ['settings', 'open settings'] },
      { pattern: 'help', intent: 'show_help', confidence: 0.9, context: ['menu'], examples: ['help', 'show help'] },
    ],
    'world_selection': [
      { pattern: 'select {world}', intent: 'select_world', confidence: 0.8, context: ['world_selection'], examples: ['select Victorian London', 'choose Modern Tokyo'] },
      { pattern: 'filter by {difficulty}', intent: 'filter_worlds', confidence: 0.8, context: ['world_selection'], examples: ['filter by easy', 'show hard worlds'] },
      { pattern: 'go back', intent: 'navigation_back', confidence: 0.9, context: ['world_selection'], examples: ['go back', 'return'] },
    ],
    'case_detail': [
      { pattern: 'start case', intent: 'start_case', confidence: 0.9, context: ['case_detail'], examples: ['start case', 'begin investigation'] },
      { pattern: 'play', intent: 'start_case', confidence: 0.9, context: ['case_detail'], examples: ['play', 'continue'] },
      { pattern: 'review case notes', intent: 'show_case_notes', confidence: 0.8, context: ['case_detail'], examples: ['review case notes', 'show notes'] },
    ],
    'active_investigation': [
      { pattern: 'examine {object}', intent: 'examine_object', confidence: 0.8, context: ['active_investigation'], examples: ['examine the letter', 'look at the weapon'] },
      { pattern: 'ask {character} about {topic}', intent: 'question_character', confidence: 0.7, context: ['active_investigation'], examples: ['ask Holmes about the murder', 'question the butler about the key'] },
      { pattern: 'use {item}', intent: 'use_item', confidence: 0.8, context: ['active_investigation'], examples: ['use magnifying glass', 'show evidence'] },
      { pattern: 'move to {location}', intent: 'move_location', confidence: 0.8, context: ['active_investigation'], examples: ['go to the library', 'enter the study'] },
      { pattern: 'describe scene', intent: 'describe_scene', confidence: 0.9, context: ['active_investigation'], examples: ['describe scene', 'what can I see'] },
      { pattern: 'pause game', intent: 'pause_game', confidence: 0.9, context: ['active_investigation'], examples: ['pause game', 'pause'] },
    ],
    'universal': [
      { pattern: 'repeat', intent: 'repeat_last', confidence: 0.9, context: ['universal'], examples: ['repeat', 'say that again'] },
      { pattern: 'help', intent: 'show_help', confidence: 0.9, context: ['universal'], examples: ['help', 'what can I do'] },
      { pattern: 'volume up', intent: 'volume_up', confidence: 0.9, context: ['universal'], examples: ['volume up', 'louder'] },
      { pattern: 'volume down', intent: 'volume_down', confidence: 0.9, context: ['universal'], examples: ['volume down', 'quieter'] },
    ]
  };

  constructor(config: VoiceServiceConfig) {
    this.config = config;
    this.setupAudioSession();
  }

  // Initialize audio session for voice recognition
  private async setupAudioSession(): Promise<void> {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Failed to setup audio session:', error);
    }
  }

  // Start wake word detection
  public async startWakeWordDetection(): Promise<void> {
    this.isWakeWordActive = true;
    // In a real implementation, this would start the wake word detection engine
    // For now, we'll simulate it with a simple listener
    console.log('Wake word detection started');
  }

  // Stop wake word detection
  public async stopWakeWordDetection(): Promise<void> {
    this.isWakeWordActive = false;
    console.log('Wake word detection stopped');
  }

  // Start listening for voice commands
  public async startListening(): Promise<void> {
    if (this.isListening) return;

    try {
      this.isListening = true;
      
      // Start audio recording
      this.audioRecording = new Audio.Recording();
      await this.audioRecording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      });

      await this.audioRecording.startAsync();
      
      // Set timeout for automatic stop
      setTimeout(() => {
        if (this.isListening) {
          this.stopListening();
        }
      }, 10000); // 10 second timeout

    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      this.isListening = false;
      throw error;
    }
  }

  // Stop listening and process voice command
  public async stopListening(): Promise<VoiceRecognitionResult | null> {
    if (!this.isListening || !this.audioRecording) return null;

    try {
      this.isListening = false;
      await this.audioRecording.stopAndUnloadAsync();
      
      // In a real implementation, this would send the audio to a speech recognition service
      // For now, we'll simulate it with mock data
      const mockResult: VoiceRecognitionResult = {
        text: "examine the letter", // This would come from the speech recognition service
        confidence: 0.85,
        alternatives: ["examine the ladder", "examine the ledger"]
      };

      const processedCommand = await this.processVoiceCommand(mockResult);
      this.audioRecording = null;
      
      return mockResult;
    } catch (error) {
      console.error('Failed to stop voice recognition:', error);
      this.audioRecording = null;
      return null;
    }
  }

  // Process recognized voice command
  private async processVoiceCommand(result: VoiceRecognitionResult): Promise<VoiceCommand | null> {
    if (result.confidence < this.config.confidenceThreshold) {
      return null;
    }

    const command = this.matchCommand(result.text);
    if (command) {
      await this.executeCommand(command, result.text);
      return command;
    }

    return null;
  }

  // Match voice text to command patterns
  private matchCommand(text: string): VoiceCommand | null {
    const lowerText = text.toLowerCase().trim();
    const currentContextKey = this.getCurrentContextKey();
    
    // First, try context-specific commands
    const contextCommands = this.commandPatterns[currentContextKey] || [];
    for (const command of contextCommands) {
      if (this.matchPattern(lowerText, command.pattern)) {
        return command;
      }
    }
    
    // Then try universal commands
    const universalCommands = this.commandPatterns['universal'] || [];
    for (const command of universalCommands) {
      if (this.matchPattern(lowerText, command.pattern)) {
        return command;
      }
    }
    
    return null;
  }

  // Simple pattern matching (in a real implementation, this would be more sophisticated)
  private matchPattern(text: string, pattern: string): boolean {
    // Remove variables from pattern for simple matching
    const simplifiedPattern = pattern
      .replace(/\{[^}]+\}/g, '.*')
      .replace(/\s+/g, '\\s+');
    
    const regex = new RegExp(simplifiedPattern, 'i');
    return regex.test(text);
  }

  // Get current context key for command matching
  private getCurrentContextKey(): string {
    if (!this.currentContext) return 'menu';
    
    switch (this.currentContext.gamePhase) {
      case 'menu': return 'menu';
      case 'exploration': return 'world_selection';
      case 'conversation': return 'active_investigation';
      case 'deduction': return 'active_investigation';
      default: return 'menu';
    }
  }

  // Execute matched command
  private async executeCommand(command: VoiceCommand, originalText: string): Promise<void> {
    console.log(`Executing command: ${command.intent} from text: "${originalText}"`);
    
    // Provide audio feedback
    await this.provideAudioFeedback(command.intent);
    
    // Emit event or call callback for command execution
    // This would be handled by the main app logic
  }

  // Provide audio feedback for commands
  private async provideAudioFeedback(intent: string): Promise<void> {
    const feedbackMessages: Record<string, string> = {
      'examine_object': 'Examining object',
      'question_character': 'Asking question',
      'move_location': 'Moving to location',
      'start_case': 'Starting case',
      'pause_game': 'Game paused',
      'show_help': 'Here are the available commands',
      'navigation_back': 'Going back',
    };

    const message = feedbackMessages[intent] || 'Command received';
    
    if (this.config.accessibilitySettings.voiceNavigationEnabled) {
      await Speech.speak(message, {
        language: this.config.language,
        pitch: 1.0,
        rate: 1.0,
      });
    }
  }

  // Update current game context for better command matching
  public updateContext(gameState: GameState): void {
    this.currentContext = gameState;
  }

  // Get available commands for current context
  public getAvailableCommands(): VoiceCommand[] {
    const contextKey = this.getCurrentContextKey();
    const contextCommands = this.commandPatterns[contextKey] || [];
    const universalCommands = this.commandPatterns['universal'] || [];
    
    return [...contextCommands, ...universalCommands];
  }

  // Get command suggestions based on failed recognition
  public getCommandSuggestions(failedText: string): string[] {
    const availableCommands = this.getAvailableCommands();
    
    // In a real implementation, this would use fuzzy matching or similarity scoring
    return availableCommands
      .slice(0, 3)
      .map(cmd => cmd.examples[0] || cmd.pattern);
  }

  // Check if currently listening
  public get listening(): boolean {
    return this.isListening;
  }

  // Cleanup resources
  public async cleanup(): Promise<void> {
    if (this.isListening) {
      await this.stopListening();
    }
    await this.stopWakeWordDetection();
  }
}

// Factory function to create voice service
export const createVoiceService = (config: VoiceServiceConfig): AudioVRVoiceService => {
  return new AudioVRVoiceService(config);
};

// Default configuration
export const defaultVoiceConfig: VoiceServiceConfig = {
  wakeWords: ['Hey AudioVR', 'Listen AudioVR', 'AudioVR Command'],
  confidenceThreshold: 0.7,
  language: 'en-US',
  enableOfflineMode: true,
  accessibilitySettings: {
    voiceNavigationEnabled: true,
    screenReaderOptimized: true,
    highContrastMode: false,
    largeTextMode: false,
    reduceMotion: false,
    spatialAudioEnabled: true,
    hapticFeedbackEnabled: true,
    voiceCommandSensitivity: 70,
  },
};