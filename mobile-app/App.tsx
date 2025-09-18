import React, { useState, useEffect } from 'react';
import { StatusBar, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import { CaseDetailScreen } from './screens/CaseDetailScreen';
import { WorldSelectionScreen } from './screens/WorldSelectionScreen';
import { ActiveInvestigationScreen } from './screens/ActiveInvestigationScreen';

// Services
import { AudioVRVoiceService, createVoiceService, defaultVoiceConfig } from './services/VoiceService';

// Types
import { GameWorld, DetectiveCase, Character, Evidence, GameState, AccessibilitySettings } from './types';

// Mock data for demonstration
const mockWorlds: GameWorld[] = [
  {
    id: 'victorian-london',
    name: 'Victorian London',
    description: 'Step into the fog-shrouded streets of 1890s London, where gaslight flickers through the mist and danger lurks in every shadow.',
    difficulty: 4,
    estimatedDuration: 45,
    backgroundImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
    ambientSound: 'victorian-london-ambient.mp3',
    availableCases: 8,
    isUnlocked: true,
  },
  {
    id: 'modern-tokyo',
    name: 'Modern Tokyo',
    description: 'Navigate the neon-lit streets of contemporary Tokyo, where traditional mystery meets cutting-edge technology.',
    difficulty: 3,
    estimatedDuration: 35,
    backgroundImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    ambientSound: 'tokyo-night-ambient.mp3',
    availableCases: 6,
    isUnlocked: true,
  },
  {
    id: 'space-station-omega',
    name: 'Space Station Omega',
    description: 'Solve mysteries in the depths of space aboard a research station where isolation breeds paranoia and secrets.',
    difficulty: 5,
    estimatedDuration: 60,
    backgroundImage: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800',
    ambientSound: 'space-station-ambient.mp3',
    availableCases: 4,
    isUnlocked: false,
  },
];

const mockCase: DetectiveCase = {
  id: 'whitechapel-mystery',
  title: 'The Whitechapel Mystery',
  worldId: 'victorian-london',
  description: 'A series of brutal murders has terrorized the East End. As Inspector Frederick Abberline, you must navigate the treacherous streets of Whitechapel to catch the killer before they strike again. Use your wit, intuition, and the latest forensic techniques of the era.',
  difficulty: 4,
  estimatedDuration: 45,
  currentChapter: 2,
  totalChapters: 5,
  backgroundImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
  characters: [
    {
      id: 'sherlock-holmes',
      name: 'Sherlock Holmes',
      role: 'Consulting Detective',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      voiceActor: 'Benedict Cumberbatch',
      description: 'The world\'s greatest consulting detective',
      isAlive: true,
      suspicionLevel: 0,
    },
    {
      id: 'dr-watson',
      name: 'Dr. John Watson',
      role: 'Medical Examiner',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
      voiceActor: 'Martin Freeman',
      description: 'Holmes\' trusted companion and medical expert',
      isAlive: true,
      suspicionLevel: 0,
    },
  ],
  evidence: [
    {
      id: 'bloody-knife',
      name: 'Bloody Knife',
      description: 'A sharp kitchen knife with dried blood',
      type: 'physical',
      foundAt: 'Crime Scene',
      isKey: true,
    },
    {
      id: 'witness-testimony',
      name: 'Witness Testimony',
      description: 'Statement from a local shopkeeper',
      type: 'testimony',
      foundAt: 'Dorset Street',
      isKey: false,
    },
  ],
  progress: 40,
  isUnlocked: true,
  lastPlayedAt: new Date(),
};

type RootStackParamList = {
  WorldSelection: undefined;
  CaseDetail: { case: DetectiveCase };
  ActiveInvestigation: { case: DetectiveCase };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  // Voice service state
  const [voiceService, setVoiceService] = useState<AudioVRVoiceService | null>(null);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  
  // Game state
  const [currentWorld, setCurrentWorld] = useState<GameWorld | null>(null);
  const [currentCase, setCurrentCase] = useState<DetectiveCase | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    currentWorld: undefined,
    currentCase: undefined,
    currentLocation: undefined,
    activeCharacters: [],
    availableEvidence: [],
    gamePhase: 'menu',
    playerProgress: 0,
  });

  // Accessibility settings
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>({
    voiceNavigationEnabled: true,
    screenReaderOptimized: true,
    highContrastMode: false,
    largeTextMode: false,
    reduceMotion: false,
    spatialAudioEnabled: true,
    hapticFeedbackEnabled: true,
    voiceCommandSensitivity: 70,
  });

  // Initialize voice service
  useEffect(() => {
    if (isVoiceEnabled) {
      const config = {
        ...defaultVoiceConfig,
        accessibilitySettings,
      };
      
      const service = createVoiceService(config);
      setVoiceService(service);
      
      // Start wake word detection
      service.startWakeWordDetection().catch(error => {
        console.error('Failed to start wake word detection:', error);
        Alert.alert(
          'Voice Recognition Error',
          'Unable to start voice recognition. Please check microphone permissions.',
          [{ text: 'OK' }]
        );
      });

      return () => {
        service.cleanup();
      };
    }
  }, [isVoiceEnabled, accessibilitySettings]);

  // Update voice service context when game state changes
  useEffect(() => {
    if (voiceService) {
      voiceService.updateContext(gameState);
    }
  }, [voiceService, gameState]);

  // Handle voice commands
  const handleVoiceCommand = async (command: string) => {
    console.log('Voice command received:', command);
    
    // Process command based on current screen/context
    const lowerCommand = command.toLowerCase();
    
    // Navigation commands
    if (lowerCommand.includes('back') || lowerCommand.includes('go back')) {
      // Handle navigation back
      return;
    }
    
    // Game-specific commands would be handled here
    // This is a simplified example
    Alert.alert('Voice Command', `Processed: "${command}"`);
  };

  // Screen navigation handlers
  const handleSelectWorld = (world: GameWorld) => {
    setCurrentWorld(world);
    setGameState(prev => ({
      ...prev,
      currentWorld: world.id,
      gamePhase: 'exploration',
    }));
  };

  const handleStartCase = (caseData: DetectiveCase) => {
    setCurrentCase(caseData);
    setGameState(prev => ({
      ...prev,
      currentCase: caseData.id,
      currentLocation: 'Baker Street - Holmes\' Study',
      activeCharacters: caseData.characters.map(c => c.id),
      availableEvidence: caseData.evidence.map(e => e.id),
      gamePhase: 'conversation',
    }));
  };

  const handlePauseGame = () => {
    setGameState(prev => ({
      ...prev,
      gamePhase: 'menu',
    }));
  };

  const handleShowInventory = () => {
    // Show inventory modal or screen
    console.log('Show inventory');
  };

  const handleSettings = () => {
    // Show settings modal
    console.log('Show settings');
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#1a1a2e' },
          }}
          initialRouteName="WorldSelection"
        >
          <Stack.Screen name="WorldSelection">
            {(props) => (
              <WorldSelectionScreen
                {...props}
                worlds={mockWorlds}
                onSelectWorld={(world) => {
                  handleSelectWorld(world);
                  props.navigation.navigate('CaseDetail', { case: mockCase });
                }}
                onGoBack={() => props.navigation.goBack()}
                onSettings={handleSettings}
              />
            )}
          </Stack.Screen>
          
          <Stack.Screen name="CaseDetail">
            {(props) => (
              <CaseDetailScreen
                {...props}
                case={props.route.params.case}
                onStartCase={() => {
                  handleStartCase(props.route.params.case);
                  props.navigation.navigate('ActiveInvestigation', { case: props.route.params.case });
                }}
                onGoBack={() => props.navigation.goBack()}
                onSettings={handleSettings}
              />
            )}
          </Stack.Screen>
          
          <Stack.Screen name="ActiveInvestigation">
            {(props) => (
              <ActiveInvestigationScreen
                {...props}
                case={props.route.params.case}
                currentLocation={gameState.currentLocation || 'Baker Street - Holmes\' Study'}
                activeCharacter={props.route.params.case.characters[0]}
                gameState={gameState}
                onVoiceCommand={handleVoiceCommand}
                onPauseGame={handlePauseGame}
                onGoBack={() => props.navigation.goBack()}
                onShowInventory={handleShowInventory}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}