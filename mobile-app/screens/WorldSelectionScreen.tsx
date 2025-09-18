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
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Colors, CommonStyles, Spacing, BorderRadius, Typography } from '../components/DesignSystem';
import { GameWorld } from '../types';

interface WorldSelectionScreenProps {
  worlds: GameWorld[];
  onSelectWorld: (world: GameWorld) => void;
  onGoBack: () => void;
  onSettings: () => void;
}

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth - (Spacing.lg * 2);

export const WorldSelectionScreen: React.FC<WorldSelectionScreenProps> = ({
  worlds,
  onSelectWorld,
  onGoBack,
  onSettings
}) => {
  const [isListening, setIsListening] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  // Voice command handlers
  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    // Check for world selection commands
    const worldCommands = [
      { patterns: ['victorian', 'london', 'victorian london'], world: worlds.find(w => w.name.toLowerCase().includes('victorian')) },
      { patterns: ['tokyo', 'modern tokyo', 'japan'], world: worlds.find(w => w.name.toLowerCase().includes('tokyo')) },
      { patterns: ['space', 'omega', 'station', 'space station'], world: worlds.find(w => w.name.toLowerCase().includes('space')) },
    ];

    for (const { patterns, world } of worldCommands) {
      if (patterns.some(pattern => lowerCommand.includes(pattern)) && world) {
        onSelectWorld(world);
        return;
      }
    }

    // Filter commands
    if (lowerCommand.includes('easy') || lowerCommand.includes('beginner')) {
      setSelectedFilter('easy');
    } else if (lowerCommand.includes('medium') || lowerCommand.includes('intermediate')) {
      setSelectedFilter('medium');
    } else if (lowerCommand.includes('hard') || lowerCommand.includes('difficult')) {
      setSelectedFilter('hard');
    } else if (lowerCommand.includes('all') || lowerCommand.includes('show all')) {
      setSelectedFilter('all');
    } else if (lowerCommand.includes('back') || lowerCommand.includes('go back')) {
      onGoBack();
    }
  };

  // Filter worlds based on selected filter
  const filteredWorlds = worlds.filter(world => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'easy') return world.difficulty <= 2;
    if (selectedFilter === 'medium') return world.difficulty >= 3 && world.difficulty <= 3;
    if (selectedFilter === 'hard') return world.difficulty >= 4;
    return true;
  });

  // Render difficulty stars
  const renderDifficultyStars = (difficulty: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= difficulty ? 'star' : 'star-outline'}
            size={14}
            color={star <= difficulty ? Colors.button.success : Colors.text.tertiary}
            style={{ marginRight: 1 }}
          />
        ))}
      </View>
    );
  };

  // Render filter chip
  const renderFilterChip = (filter: typeof selectedFilter, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        selectedFilter === filter && styles.filterChipActive
      ]}
      onPress={() => setSelectedFilter(filter)}
      accessibilityRole="button"
      accessibilityLabel={`Filter by ${label}`}
      accessibilityState={{ selected: selectedFilter === filter }}
    >
      <Text style={[
        styles.filterChipText,
        selectedFilter === filter && styles.filterChipTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // Render world card
  const renderWorldCard = ({ item: world }: { item: GameWorld }) => (
    <TouchableOpacity
      style={[styles.worldCard, !world.isUnlocked && styles.worldCardLocked]}
      onPress={() => world.isUnlocked && onSelectWorld(world)}
      accessibilityRole="button"
      accessibilityLabel={`${world.name} world, ${world.difficulty} stars difficulty, ${world.estimatedDuration} minutes, ${world.availableCases} cases available`}
      accessibilityState={{ disabled: !world.isUnlocked }}
    >
      <View style={styles.worldImageContainer}>
        <Image
          source={{ uri: world.backgroundImage }}
          style={styles.worldImage}
          accessibilityLabel={`${world.name} world background`}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.worldImageOverlay}
        />
        
        {!world.isUnlocked && (
          <View style={styles.lockedOverlay}>
            <Ionicons name="lock-closed" size={32} color={Colors.text.primary} />
          </View>
        )}
      </View>

      <View style={styles.worldContent}>
        <View style={styles.worldHeader}>
          <Text style={styles.worldName} numberOfLines={2}>
            {world.name}
          </Text>
          {renderDifficultyStars(world.difficulty)}
        </View>

        <Text style={styles.worldDescription} numberOfLines={3}>
          {world.description}
        </Text>

        <View style={styles.worldStats}>
          <View style={styles.statBadge}>
            <Ionicons name="time-outline" size={14} color={Colors.text.secondary} />
            <Text style={styles.statText}>{world.estimatedDuration}min</Text>
          </View>

          <View style={styles.statBadge}>
            <Ionicons name="library-outline" size={14} color={Colors.text.secondary} />
            <Text style={styles.statText}>{world.availableCases} cases</Text>
          </View>

          <View style={styles.statBadge}>
            <Text style={styles.difficultyText}>
              {world.difficulty <= 2 ? 'Easy' : world.difficulty === 3 ? 'Medium' : 'Hard'}
            </Text>
          </View>
        </View>

        {world.isUnlocked && (
          <View style={styles.playButton}>
            <Ionicons name="play" size={16} color={Colors.text.primary} />
          </View>
        )}
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
        <View style={CommonStyles.header}>
          <TouchableOpacity
            style={CommonStyles.headerButton}
            onPress={onGoBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Choose Your World</Text>
          
          <TouchableOpacity
            style={CommonStyles.headerButton}
            onPress={onSettings}
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <Ionicons name="settings-outline" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Filter Section */}
        <View style={styles.filterSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
            accessibilityRole="tablist"
          >
            {renderFilterChip('all', 'All Worlds')}
            {renderFilterChip('easy', 'Beginner')}
            {renderFilterChip('medium', 'Intermediate')}
            {renderFilterChip('hard', 'Expert')}
          </ScrollView>
        </View>

        {/* Worlds List */}
        <FlatList
          data={filteredWorlds}
          renderItem={renderWorldCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.worldsList}
          accessibilityRole="list"
        />

        {/* Voice Command Hints */}
        <View style={styles.voiceHintsContainer}>
          <View style={styles.voiceHint}>
            <Ionicons name="mic" size={16} color={Colors.text.tertiary} />
            <Text style={styles.voiceHintText}>Say "Victorian London" to select a world</Text>
          </View>
          <View style={styles.voiceHint}>
            <Ionicons name="mic" size={16} color={Colors.text.tertiary} />
            <Text style={styles.voiceHintText}>Say "Show easy worlds" to filter</Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = {
  headerTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
  },
  
  filterSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  
  filterContainer: {
    paddingRight: Spacing.lg,
  },
  
  filterChip: {
    backgroundColor: Colors.surface.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  
  filterChipActive: {
    backgroundColor: Colors.purple.primary,
    borderColor: Colors.purple.primary,
  },
  
  filterChipText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text.secondary,
  },
  
  filterChipTextActive: {
    color: Colors.text.primary,
  },
  
  worldsList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },
  
  worldCard: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    overflow: 'hidden' as const,
    ...CommonStyles.card.shadowColor && {
      shadowColor: Colors.background,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
  },
  
  worldCardLocked: {
    opacity: 0.6,
  },
  
  worldImageContainer: {
    height: 180,
    position: 'relative' as const,
  },
  
  worldImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover' as const,
  },
  
  worldImageOverlay: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  
  lockedOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  
  worldContent: {
    padding: Spacing.lg,
    position: 'relative' as const,
  },
  
  worldHeader: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    justifyContent: 'space-between' as const,
    marginBottom: Spacing.sm,
  },
  
  worldName: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  
  starsContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  
  worldDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.sizes.sm * Typography.lineHeights.relaxed,
    marginBottom: Spacing.md,
  },
  
  worldStats: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flexWrap: 'wrap' as const,
  },
  
  statBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.surface.secondary,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  
  statText: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  
  difficultyText: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.secondary,
  },
  
  playButton: {
    position: 'absolute' as const,
    top: Spacing.md,
    right: Spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.purple.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    ...CommonStyles.card.shadowColor && {
      shadowColor: Colors.purple.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 4,
      elevation: 4,
    },
  },
  
  voiceHintsContainer: {
    backgroundColor: Colors.surface.secondary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  
  voiceHint: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: Spacing.xs,
  },
  
  voiceHintText: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.tertiary,
    marginLeft: Spacing.sm,
  },
};