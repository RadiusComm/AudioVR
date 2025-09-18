import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Colors, CommonStyles, Spacing, BorderRadius, Typography } from '../components/DesignSystem';
import { DetectiveCase, Character, Evidence, GameState } from '../types';

interface ActiveInvestigationScreenProps {
  case: DetectiveCase;
  currentLocation: string;
  activeCharacter?: Character;
  gameState: GameState;
  onVoiceCommand: (command: string) => void;
  onPauseGame: () => void;
  onGoBack: () => void;
  onShowInventory: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const ActiveInvestigationScreen: React.FC<ActiveInvestigationScreenProps> = ({
  case: caseData,
  currentLocation,
  activeCharacter,
  gameState,
  onVoiceCommand,
  onPauseGame,
  onGoBack,
  onShowInventory
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isConversationActive, setIsConversationActive] = useState(!!activeCharacter);
  const [currentObjective, setCurrentObjective] = useState("Question Holmes about the missing evidence");
  const [waveformData] = useState(Array.from({ length: 50 }, () => Math.random() * 100));
  
  // Animation refs
  const micPulseAnim = useRef(new Animated.Value(1)).current;
  const waveformAnims = useRef(
    waveformData.map(() => new Animated.Value(Math.random() * 0.5 + 0.2))
  ).current;

  // Start microphone pulse animation when listening
  useEffect(() => {
    if (isListening) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(micPulseAnim, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(micPulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    }
  }, [isListening]);

  // Waveform animation for active conversation
  useEffect(() => {
    if (isConversationActive && activeCharacter) {
      const waveAnimations = waveformAnims.map((anim) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: Math.random() * 0.8 + 0.2,
              duration: 600 + Math.random() * 400,
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: Math.random() * 0.3 + 0.1,
              duration: 600 + Math.random() * 400,
              useNativeDriver: false,
            }),
          ])
        )
      );
      
      Animated.stagger(50, waveAnimations).start();
      
      return () => {
        waveAnimations.forEach(anim => anim.stop());
      };
    }
  }, [isConversationActive, activeCharacter]);

  // Handle microphone button press
  const handleMicrophonePress = () => {
    setIsListening(!isListening);
    // Trigger voice recognition logic here
  };

  // Handle voice command processing
  const processVoiceCommand = (command: string) => {
    onVoiceCommand(command);
    setIsListening(false);
  };

  // Render waveform visualization
  const renderWaveform = () => (
    <View style={styles.waveformContainer}>
      {waveformData.map((_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.waveformBar,
            {
              height: waveformAnims[index].interpolate({
                inputRange: [0, 1],
                outputRange: [4, 60],
              }),
            },
          ]}
        />
      ))}
    </View>
  );

  // Render inventory items
  const renderInventoryItem = (item: Evidence, index: number) => (
    <TouchableOpacity
      key={item.id}
      style={styles.inventoryItem}
      onPress={() => onVoiceCommand(`use ${item.name}`)}
      accessibilityRole="button"
      accessibilityLabel={`Use ${item.name}`}
    >
      <View style={styles.inventoryIcon}>
        <Ionicons 
          name={
            item.type === 'physical' ? 'cube-outline' :
            item.type === 'document' ? 'document-text-outline' :
            item.type === 'photograph' ? 'image-outline' :
            'chatbubble-outline'
          } 
          size={20} 
          color={Colors.text.secondary} 
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={CommonStyles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Background gradient */}
      <LinearGradient
        colors={[Colors.backgroundGradientStart, Colors.backgroundGradientEnd]}
        style={CommonStyles.gradientBackground}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={CommonStyles.headerButton}
            onPress={onGoBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          
          <View style={styles.locationInfo}>
            <Text style={styles.locationText}>{currentLocation}</Text>
            <Text style={styles.timeText}>Chapter {caseData.currentChapter} • 15:30</Text>
          </View>
          
          <TouchableOpacity
            style={CommonStyles.headerButton}
            onPress={onPauseGame}
            accessibilityRole="button"
            accessibilityLabel="Pause game"
          >
            <Ionicons name="pause" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Main Investigation Area */}
        <View style={styles.investigationArea}>
          {/* Character Section */}
          {activeCharacter && (
            <View style={styles.characterSection}>
              <View style={styles.characterContainer}>
                <Image
                  source={{ uri: activeCharacter.avatar }}
                  style={styles.characterAvatar}
                  accessibilityLabel={`${activeCharacter.name} avatar`}
                />
                {isConversationActive && (
                  <View style={styles.speakingIndicator}>
                    <Animated.View style={[
                      styles.speakingPulse,
                      {
                        transform: [{
                          scale: micPulseAnim.interpolate({
                            inputRange: [1, 1.3],
                            outputRange: [1, 1.2],
                          })
                        }]
                      }
                    ]} />
                  </View>
                )}
              </View>
              <Text style={styles.characterName}>{activeCharacter.name}</Text>
              <Text style={styles.characterRole}>{activeCharacter.role}</Text>
            </View>
          )}

          {/* Waveform Visualization */}
          <View style={styles.waveformSection}>
            <Text style={styles.waveformLabel}>
              {isConversationActive ? "Conversation in progress..." : "Ready to listen"}
            </Text>
            {renderWaveform()}
            
            {/* Spatial Audio Indicators */}
            <View style={styles.spatialIndicators}>
              <View style={[styles.spatialDot, styles.spatialLeft]} />
              <View style={[styles.spatialDot, styles.spatialCenter, styles.spatialActive]} />
              <View style={[styles.spatialDot, styles.spatialRight]} />
            </View>
          </View>

          {/* Current Objective */}
          <View style={styles.objectiveSection}>
            <Text style={styles.objectiveLabel}>Current Objective</Text>
            <Text style={styles.objectiveText}>{currentObjective}</Text>
          </View>
        </View>

        {/* Controls Section */}
        <View style={styles.controlsSection}>
          {/* Conversation Controls */}
          <View style={styles.conversationControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => onVoiceCommand('skip')}
              accessibilityRole="button"
              accessibilityLabel="Skip current dialogue"
            >
              <Ionicons name="play-skip-forward" size={20} color={Colors.text.secondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => onVoiceCommand('pause')}
              accessibilityRole="button"
              accessibilityLabel="Pause conversation"
            >
              <Ionicons name="pause" size={20} color={Colors.text.secondary} />
            </TouchableOpacity>

            <Animated.View style={{ transform: [{ scale: micPulseAnim }] }}>
              <TouchableOpacity
                style={[
                  styles.microphoneButton,
                  isListening && styles.microphoneButtonActive
                ]}
                onPress={handleMicrophonePress}
                accessibilityRole="button"
                accessibilityLabel={isListening ? "Stop listening" : "Start voice command"}
                accessibilityState={{ pressed: isListening }}
              >
                <Ionicons 
                  name="mic" 
                  size={28} 
                  color={isListening ? Colors.status.error : Colors.text.primary} 
                />
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => onVoiceCommand('repeat')}
              accessibilityRole="button"
              accessibilityLabel="Repeat last dialogue"
            >
              <Ionicons name="refresh" size={20} color={Colors.text.secondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={onShowInventory}
              accessibilityRole="button"
              accessibilityLabel="Show inventory"
            >
              <Ionicons name="library-outline" size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Inventory Quick Access */}
          <View style={styles.inventorySection}>
            <Text style={styles.inventoryLabel}>Quick Inventory</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.inventoryScroll}
            >
              {caseData.evidence.slice(0, 6).map(renderInventoryItem)}
            </ScrollView>
          </View>

          {/* Accessibility Controls */}
          <View style={styles.accessibilityControls}>
            <TouchableOpacity
              style={styles.accessibilityButton}
              onPress={() => onVoiceCommand('describe scene')}
              accessibilityRole="button"
              accessibilityLabel="Describe current scene"
            >
              <Ionicons name="eye-outline" size={16} color={Colors.text.tertiary} />
              <Text style={styles.accessibilityText}>Describe Scene</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.accessibilityButton}
              onPress={() => onVoiceCommand('available actions')}
              accessibilityRole="button"
              accessibilityLabel="List available actions"
            >
              <Ionicons name="list-outline" size={16} color={Colors.text.tertiary} />
              <Text style={styles.accessibilityText}>Available Actions</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Voice Command Hints */}
        <View style={styles.voiceHintsContainer}>
          <Text style={styles.voiceHintTitle}>Voice Commands</Text>
          <Text style={styles.voiceHint}>Say your response or tap to type</Text>
          <Text style={styles.voiceHint}>"Examine the letter" • "Ask about the murder" • "Show evidence"</Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = {
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: Spacing.lg,
    paddingTop: 44, // Status bar height
    paddingBottom: Spacing.md,
    height: 88,
  },
  
  locationInfo: {
    alignItems: 'center' as const,
  },
  
  locationText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
  },
  
  timeText: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  
  investigationArea: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  
  characterSection: {
    alignItems: 'center' as const,
    marginBottom: Spacing.xl,
  },
  
  characterContainer: {
    position: 'relative' as const,
    marginBottom: Spacing.sm,
  },
  
  characterAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Colors.purple.primary,
  },
  
  speakingIndicator: {
    position: 'absolute' as const,
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
  },
  
  speakingPulse: {
    flex: 1,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: Colors.status.success,
  },
  
  characterName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
    textAlign: 'center' as const,
  },
  
  characterRole: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    textAlign: 'center' as const,
  },
  
  waveformSection: {
    alignItems: 'center' as const,
    marginBottom: Spacing.xl,
  },
  
  waveformLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
    textAlign: 'center' as const,
  },
  
  waveformContainer: {
    flexDirection: 'row' as const,
    alignItems: 'flex-end' as const,
    height: 60,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  
  waveformBar: {
    width: 3,
    backgroundColor: Colors.purple.primary,
    marginRight: 2,
    borderRadius: 1.5,
    minHeight: 4,
  },
  
  spatialIndicators: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  
  spatialDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surface.primary,
    marginHorizontal: 4,
  },
  
  spatialActive: {
    backgroundColor: Colors.purple.primary,
  },
  
  spatialLeft: {
    marginRight: 12,
  },
  
  spatialCenter: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  
  spatialRight: {
    marginLeft: 12,
  },
  
  objectiveSection: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  
  objectiveLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  
  objectiveText: {
    fontSize: Typography.sizes.base,
    color: Colors.text.primary,
    lineHeight: Typography.sizes.base * Typography.lineHeights.normal,
  },
  
  controlsSection: {
    backgroundColor: Colors.surface.secondary,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  
  conversationControls: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: Spacing.lg,
  },
  
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginHorizontal: Spacing.sm,
  },
  
  microphoneButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.purple.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginHorizontal: Spacing.md,
    ...CommonStyles.card.shadowColor && {
      shadowColor: Colors.purple.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
  },
  
  microphoneButtonActive: {
    backgroundColor: Colors.status.error,
  },
  
  inventorySection: {
    marginBottom: Spacing.lg,
  },
  
  inventoryLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  
  inventoryScroll: {
    flexDirection: 'row' as const,
  },
  
  inventoryItem: {
    marginRight: Spacing.sm,
  },
  
  inventoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  
  accessibilityControls: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    marginBottom: Spacing.sm,
  },
  
  accessibilityButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  
  accessibilityText: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.tertiary,
    marginLeft: 4,
  },
  
  voiceHintsContainer: {
    backgroundColor: Colors.surface.secondary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  
  voiceHintTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
    textAlign: 'center' as const,
  },
  
  voiceHint: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.tertiary,
    textAlign: 'center' as const,
    lineHeight: Typography.sizes.xs * Typography.lineHeights.relaxed,
  },
};