import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StatusBar,
  Alert,
  AccessibilityInfo,
  AppState,
  AppStateStatus,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

// Services
import AudioVRVoiceService from './services/VoiceService';
import AudioAssetManager from './services/AudioAssetManager';

// Screens
import { CaseDetailScreen } from './screens/CaseDetailScreen';
import { WorldSelectionScreen } from './screens/WorldSelectionScreen';
import { ActiveInvestigationScreen } from './screens/ActiveInvestigationScreen';

// Types
import { 
  DetectiveCase, 
  GameWorld, 
  Character, 
  GameState, 
  AccessibilitySettings,
  VoiceCommand 
} from './types';

// Design System
import { Colors } from './components/DesignSystem';

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

// Sample data for demo
const sampleWorlds: GameWorld[] = [
  {
    id: 'victorian-london',
    name: 'Victorian London',
    description: 'Explore the foggy streets of 1890s London, where gaslight flickers and mysteries lurk in every shadow.',
    difficulty: 4,
    estimatedDuration: 45,
    backgroundImage: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800&h=600&fit=crop',
    ambientSound: 'victorian-ambient.mp3',
    availableCases: 5,
    isUnlocked: true,
  },
  {
    id: 'modern-tokyo',
    name: 'Modern Tokyo',
    description: 'Navigate the neon-lit streets of contemporary Tokyo, where technology meets traditional mystery.',
    difficulty: 3,
    estimatedDuration: 35,
    backgroundImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop',
    ambientSound: 'tokyo-ambient.mp3',
    availableCases: 4,
    isUnlocked: true,
  },
  {
    id: 'space-station',
    name: 'Space Station Omega',
    description: 'Investigate mysteries aboard a futuristic space station, where every room holds deadly secrets.',
    difficulty: 5,
    estimatedDuration: 60,
    backgroundImage: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&h=600&fit=crop',
    ambientSound: 'space-ambient.mp3',
    availableCases: 3,
    isUnlocked: false,
  },
];

const sampleCase: DetectiveCase = {
  id: 'whitechapel-mystery',
  title: 'The Whitechapel Mystery',
  worldId: 'victorian-london',
  description: 'A gruesome murder has shaken the foggy streets of Whitechapel. As detective inspector, you must uncover the truth behind this heinous crime before the killer strikes again.',
  difficulty: 4,
  estimatedDuration: 45,
  currentChapter: 2,
  totalChapters: 5,
  backgroundImage: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800&h=600&fit=crop',
  characters: [
    {
      id: 'sherlock-holmes',
      name: 'Sherlock Holmes',
      role: 'Consulting Detective',
      avatar: 'https://via.placeholder.com/120x120/6c5ce7/FFFFFF?text=SH',
      voiceActor: 'Benedict Cumberbatch',
      description: 'The world\'s only consulting detective',
      isAlive: true,
      suspicionLevel: 0,
    },
    {
      id: 'inspector-lestrade',
      name: 'Inspector Lestrade',
      role: 'Scotland Yard Inspector',
      avatar: 'https://via.placeholder.com/120x120/e17055/FFFFFF?text=IL',
      voiceActor: 'Rupert Graves',
      description: 'A dedicated but often frustrated police inspector',
      isAlive: true,
      suspicionLevel: 10,
    },
    {
      id: 'mary-kelly',
      name: 'Mary Kelly',
      role: 'Local Resident',
      avatar: 'https://via.placeholder.com/120x120/00b894/FFFFFF?text=MK',
      voiceActor: 'Keira Knightley',
      description: 'A witness to strange events in the neighborhood',
      isAlive: true,
      suspicionLevel: 30,
    },
  ],
  evidence: [
    {
      id: 'bloody-knife',
      name: 'Bloody Knife',
      description: 'A sharp knife found at the scene, covered in blood',
      type: 'physical',
      foundAt: 'Crime Scene',
      isKey: true,
    },
    {
      id: 'witness-testimony',
      name: 'Witness Testimony',
      description: 'A statement from Mary Kelly about suspicious activities',
      type: 'testimony',
      foundAt: 'Interview Room',
      isKey: false,
    },
    {
      id: 'threatening-letter',
      name: 'Threatening Letter',
      description: 'An anonymous letter threatening the victim',
      type: 'document',
      foundAt: 'Victim\'s Home',
      isKey: true,
    },
  ],
  progress: 40,
  isUnlocked: true,
  lastPlayedAt: new Date(),
};

export default function App() {
  // Core app state
  const [isAppReady, setIsAppReady] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'world-selection' | 'case-detail' | 'active-investigation'>('world-selection');
  
  // Services
  const [voiceService] = useState(() => new AudioVRVoiceService());
  const [audioManager] = useState(() => new AudioAssetManager());
  
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    currentWorld: undefined,
    currentCase: undefined,
    currentLocation: 'Baker Street - Holmes\' Study',
    activeCharacters: ['sherlock-holmes'],
    availableEvidence: ['bloody-knife', 'witness-testimony'],
    gamePhase: 'menu',
    playerProgress: 0,
  });
  
  // Voice and audio state
  const [isRecording, setIsRecording] = useState(false);
  const [conversationActive, setConversationActive] = useState(false);
  const [currentObjective, setCurrentObjective] = useState('Question Holmes about the missing evidence');
  const [audioWaveform, setAudioWaveform] = useState<number[]>([]);
  
  // Accessibility settings
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>({
    voiceNavigationEnabled: true,
    screenReaderOptimized: false,
    highContrastMode: false,
    largeTextMode: false,
    reduceMotion: false,
    spatialAudioEnabled: true,
    hapticFeedbackEnabled: true,
    voiceCommandSensitivity: 80,
  });

  // Initialize app
  useEffect(() => {
    async function prepare() {
      try {
        // Load custom fonts if any
        // await Font.loadAsync({
        //   'CustomFont': require('./assets/fonts/CustomFont.ttf'),
        // });

        // Initialize services
        await voiceService.initialize();
        await audioManager.initialize();

        // Set up voice service callbacks
        voiceService.setEventCallbacks({
          onVoiceResult: handleVoiceResult,
          onCommandRecognized: handleVoiceCommand,
          onError: handleVoiceError,
          onListeningStateChange: setIsRecording,
        });

        // Set up audio manager callbacks
        audioManager.setEventCallbacks({
          onAssetLoaded: handleAudioLoaded,
          onAssetError: handleAudioError,
          onDownloadProgress: handleDownloadProgress,
        });

        // Update voice service with initial settings
        voiceService.updateAccessibilitySettings(accessibilitySettings);
        voiceService.updateGameState(gameState);

        // Check screen reader status
        const screenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
        if (screenReaderEnabled) {
          setAccessibilitySettings(prev => ({
            ...prev,
            screenReaderOptimized: true,
          }));
        }

        // Listen for app state changes
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
          if (nextAppState === 'background') {
            voiceService.stopListening().catch(console.error);
          }
        };

        const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

        setIsAppReady(true);

        return () => {
          appStateSubscription?.remove();
        };
      } catch (error) {
        console.error('Failed to initialize app:', error);
        Alert.alert('Initialization Error', 'Failed to initialize AudioVR. Please restart the app.');
      }
    }

    prepare();

    return () => {
      // Cleanup on unmount
      voiceService.cleanup().catch(console.error);
      audioManager.cleanup().catch(console.error);
    };
  }, []);

  // Hide splash screen when ready
  useEffect(() => {
    if (isAppReady) {
      SplashScreen.hideAsync();
    }
  }, [isAppReady]);

  // Voice recognition handlers
  const handleVoiceResult = useCallback((result: any) => {
    console.log('Voice result:', result.text);
    // Update waveform visualization
    setAudioWaveform(Array(20).fill(0).map(() => Math.random()));
  }, []);

  const handleVoiceCommand = useCallback((commandResult: any) => {
    console.log('Voice command recognized:', commandResult);
    
    const { command, parameters, confidence } = commandResult;
    
    if (confidence < 0.7) {
      // Low confidence - ask for clarification
      AccessibilityInfo.announceForAccessibility(
        `I'm not sure I understood. Did you mean to ${command.intent}? Please try again.`
      );
      return;
    }

    // Execute command based on intent
    executeVoiceCommand(command.intent, parameters);
  }, []);

  const handleVoiceError = useCallback((error: string) => {
    console.error('Voice error:', error);
    setIsRecording(false);
    
    AccessibilityInfo.announceForAccessibility(
      'Voice recognition encountered an error. Please try again.'
    );
  }, []);

  // Audio asset handlers
  const handleAudioLoaded = useCallback((assetId: string) => {
    console.log('Audio asset loaded:', assetId);
  }, []);

  const handleAudioError = useCallback((assetId: string, error: string) => {
    console.error('Audio asset error:', assetId, error);
  }, []);

  const handleDownloadProgress = useCallback((assetId: string, progress: number) => {
    console.log(`Download progress for ${assetId}: ${(progress * 100).toFixed(1)}%`);
  }, []);

  // Execute voice commands
  const executeVoiceCommand = (intent: string, parameters: Record<string, string>) => {
    switch (intent) {
      case 'navigate':
        if (parameters.location) {
          setGameState(prev => ({
            ...prev,
            currentLocation: parameters.location,
          }));
          AccessibilityInfo.announceForAccessibility(`Moving to ${parameters.location}`);
        }
        break;

      case 'examine':
        if (parameters.object) {
          AccessibilityInfo.announceForAccessibility(`Examining ${parameters.object}`);
          // Trigger examination logic
        }
        break;

      case 'question':
        if (parameters.character) {
          setConversationActive(true);
          AccessibilityInfo.announceForAccessibility(`Questioning ${parameters.character}`);
        }
        break;

      case 'help':
        AccessibilityInfo.announceForAccessibility(
          'Available commands: examine objects, question characters, move to locations, or say help for more options.'
        );
        break;

      case 'pause':
        // Pause game logic
        AccessibilityInfo.announceForAccessibility('Game paused');
        break;

      case 'volume_up':
      case 'volume_down':
        const direction = intent === 'volume_up' ? 1 : -1;
        const audioType = parameters.audio_type || 'master';
        // Adjust volume logic
        AccessibilityInfo.announceForAccessibility(
          `${direction > 0 ? 'Increased' : 'Decreased'} ${audioType} volume`
        );
        break;

      default:
        console.log('Unhandled voice command:', intent, parameters);
    }
  };

  // Navigation handlers
  const handleBackNavigation = () => {
    switch (currentScreen) {
      case 'case-detail':
        setCurrentScreen('world-selection');
        break;
      case 'active-investigation':
        setCurrentScreen('case-detail');
        break;
      default:
        // Handle app exit or main menu
        break;
    }
  };

  const handleSelectWorld = (world: GameWorld) => {
    setGameState(prev => ({ ...prev, currentWorld: world.id }));
    setCurrentScreen('case-detail');
  };

  const handleContinueInvestigation = () => {
    setGameState(prev => ({ ...prev, gamePhase: 'exploration' }));
    setCurrentScreen('active-investigation');
  };

  const handleMicrophonePress = async () => {
    try {
      if (isRecording) {
        await voiceService.stopListening();
      } else {
        await voiceService.startListening();
      }
    } catch (error) {
      console.error('Microphone error:', error);
      handleVoiceError(error instanceof Error ? error.message : 'Microphone error');
    }
  };

  const handleVoiceCommand = (command: string) => {
    // Process text-based voice command
    console.log('Processing voice command:', command);
  };

  const handleSettings = () => {
    // Open settings modal/screen
    console.log('Opening settings');
  };

  if (!isAppReady) {
    return null; // Splash screen is still showing
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      <NavigationContainer>
        <View style={{ flex: 1, backgroundColor: Colors.background }}>
          {currentScreen === 'world-selection' && (
            <WorldSelectionScreen
              worlds={sampleWorlds}
              onBack={handleBackNavigation}
              onSettings={handleSettings}
              onSelectWorld={handleSelectWorld}
              onPreviewWorld={(world) => console.log('Preview world:', world.name)}
              onVoiceCommand={handleVoiceCommand}
            />
          )}

          {currentScreen === 'case-detail' && (
            <CaseDetailScreen
              case={sampleCase}
              onBack={handleBackNavigation}
              onSettings={handleSettings}
              onContinueInvestigation={handleContinueInvestigation}
              onVoiceCommand={handleVoiceCommand}
            />
          )}

          {currentScreen === 'active-investigation' && (
            <ActiveInvestigationScreen
              case={sampleCase}
              gameState={gameState}
              currentCharacter={sampleCase.characters[0]}
              onBack={handleBackNavigation}
              onPause={() => console.log('Pause investigation')}
              onVoiceInput={(input) => console.log('Voice input:', input)}
              onMicrophonePress={handleMicrophonePress}
              onSkip={() => console.log('Skip dialogue')}
              onInventory={() => console.log('Open inventory')}
              isRecording={isRecording}
              conversationActive={conversationActive}
              currentObjective={currentObjective}
              audioWaveform={audioWaveform}
            />
          )}
        </View>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}