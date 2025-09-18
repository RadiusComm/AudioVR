import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Colors, CommonStyles, Spacing, BorderRadius, Typography } from '../components/DesignSystem';
import { DetectiveCase, Character } from '../types';

interface CaseDetailScreenProps {
  case: DetectiveCase;
  onStartCase: () => void;
  onGoBack: () => void;
  onSettings: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const CaseDetailScreen: React.FC<CaseDetailScreenProps> = ({
  case: caseData,
  onStartCase,
  onGoBack,
  onSettings
}) => {
  const [isListening, setIsListening] = useState(false);

  // Voice command handlers
  const handleVoiceCommand = (command: string) => {
    switch (command.toLowerCase()) {
      case 'play':
      case 'start':
      case 'continue investigation':
        onStartCase();
        break;
      case 'review':
      case 'case notes':
        // Handle case notes review
        break;
      case 'back':
      case 'go back':
        onGoBack();
        break;
    }
  };

  // Render difficulty stars
  const renderDifficultyStars = (difficulty: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= difficulty ? 'star' : 'star-outline'}
            size={16}
            color={star <= difficulty ? Colors.button.success : Colors.text.tertiary}
            style={{ marginRight: 2 }}
          />
        ))}
      </View>
    );
  };

  // Render character avatar with play button
  const renderMainCharacter = (character: Character) => (
    <View style={styles.characterContainer}>
      <Image
        source={{ uri: character.avatar }}
        style={styles.characterAvatar}
        accessibilityLabel={`${character.name}, ${character.role}`}
      />
      <TouchableOpacity
        style={styles.playButton}
        onPress={onStartCase}
        accessibilityRole="button"
        accessibilityLabel="Start case investigation"
      >
        <Ionicons name="play" size={16} color={Colors.text.primary} />
      </TouchableOpacity>
    </View>
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
        <View style={CommonStyles.header}>
          <TouchableOpacity
            style={CommonStyles.headerButton}
            onPress={onGoBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={CommonStyles.headerButton}
            onPress={onSettings}
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <Ionicons name="settings-outline" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          accessibilityRole="scrollbar"
        >
          {/* Background Image with Title Overlay */}
          <View style={styles.heroSection}>
            <Image
              source={{ uri: caseData.backgroundImage }}
              style={styles.backgroundImage}
              accessibilityLabel={`${caseData.title} case background`}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.imageOverlay}
            />
            
            {/* Case Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.caseTitle} accessibilityRole="header">
                {caseData.title}
              </Text>
            </View>

            {/* Case Stats Row */}
            <View style={styles.statsRow}>
              {/* Difficulty */}
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>
                  {caseData.difficulty}/5 stars
                </Text>
                {renderDifficultyStars(caseData.difficulty)}
              </View>

              {/* Duration */}
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>
                  {caseData.estimatedDuration} min
                </Text>
                <Text style={styles.statSubtext}>Case length</Text>
              </View>

              {/* Main Character with Play Button */}
              {caseData.characters.length > 0 && renderMainCharacter(caseData.characters[0])}
            </View>
          </View>

          {/* Content Section */}
          <View style={styles.contentSection}>
            {/* Case Difficulty Description */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Case Difficulty</Text>
              <Text style={styles.descriptionText} accessibilityRole="text">
                {caseData.description}
              </Text>
            </View>

            {/* Principal Characters */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Principal Cast</Text>
              {caseData.characters.slice(0, 3).map((character, index) => (
                <View key={character.id} style={styles.characterRow}>
                  <Text style={styles.characterName}>{character.name}</Text>
                  <Text style={styles.voiceActor}>voiced by {character.voiceActor}</Text>
                </View>
              ))}
            </View>

            {/* Progress Indicator */}
            <View style={styles.sectionContainer}>
              <Text style={styles.progressText}>
                Chapter {caseData.currentChapter} of {caseData.totalChapters}
              </Text>
              <View style={CommonStyles.progressIndicator}>
                <View 
                  style={[
                    CommonStyles.progressFill, 
                    { width: `${(caseData.currentChapter / caseData.totalChapters) * 100}%` }
                  ]} 
                />
              </View>
            </View>

            {/* Primary Action Button */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onStartCase}
              accessibilityRole="button"
              accessibilityLabel="Continue investigation"
            >
              <View style={styles.buttonContent}>
                <Ionicons name="play" size={24} color={Colors.text.primary} />
                <Text style={styles.primaryButtonText}>Continue Investigation</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.text.primary} />
              </View>
            </TouchableOpacity>

            {/* Voice Command Buttons */}
            <View style={styles.voiceCommandsSection}>
              <TouchableOpacity
                style={styles.voiceCommandButton}
                onPress={() => handleVoiceCommand('play')}
                accessibilityRole="button"
                accessibilityLabel="Voice command: Say Play to start"
              >
                <View style={styles.voiceCommandContent}>
                  <Ionicons name="mic" size={20} color={Colors.text.secondary} />
                  <Text style={styles.voiceCommandText}>Say 'Play' to start</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.text.tertiary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.voiceCommandButton}
                onPress={() => handleVoiceCommand('review')}
                accessibilityRole="button"
                accessibilityLabel="Voice command: Say Review for case notes"
              >
                <View style={styles.voiceCommandContent}>
                  <Ionicons name="mic" size={20} color={Colors.text.secondary} />
                  <Text style={styles.voiceCommandText}>Say 'Review' for case notes</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.text.tertiary} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = {
  scrollContainer: {
    flex: 1,
  },
  
  heroSection: {
    height: screenHeight * 0.5,
    position: 'relative' as const,
  },
  
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover' as const,
  },
  
  imageOverlay: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  
  titleContainer: {
    position: 'absolute' as const,
    bottom: 120,
    left: Spacing.lg,
    right: Spacing.lg,
  },
  
  caseTitle: {
    fontSize: Typography.sizes['5xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    lineHeight: Typography.sizes['5xl'] * 1.1,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  
  statsRow: {
    position: 'absolute' as const,
    bottom: 40,
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  
  statItem: {
    alignItems: 'center' as const,
  },
  
  statLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  
  statSubtext: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.tertiary,
  },
  
  starsContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  
  characterContainer: {
    position: 'relative' as const,
  },
  
  characterAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: Colors.text.primary,
  },
  
  playButton: {
    position: 'absolute' as const,
    bottom: -5,
    right: -5,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.purple.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 2,
    borderColor: Colors.text.primary,
  },
  
  contentSection: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
    marginTop: -20,
  },
  
  sectionContainer: {
    marginBottom: Spacing.xl,
  },
  
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  
  descriptionText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.normal,
    color: Colors.text.secondary,
    lineHeight: Typography.sizes.base * Typography.lineHeights.relaxed,
  },
  
  characterRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: Spacing.xs,
  },
  
  characterName: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.text.primary,
  },
  
  voiceActor: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.tertiary,
  },
  
  progressText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  
  primaryButton: {
    backgroundColor: Colors.purple.primary,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    ...CommonStyles.card.shadowColor && {
      shadowColor: Colors.purple.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
  },
  
  buttonContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  
  primaryButtonText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
  },
  
  voiceCommandsSection: {
    marginTop: Spacing.md,
  },
  
  voiceCommandButton: {
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.medium,
  },
  
  voiceCommandContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  
  voiceCommandText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text.secondary,
    marginLeft: Spacing.sm,
  },
};