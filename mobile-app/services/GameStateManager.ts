import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState, DetectiveCase, UserProgress, Achievement } from '../types';

export interface SavedGameState {
  gameState: GameState;
  caseProgress: Record<string, number>; // caseId -> progress percentage
  unlockedWorlds: string[];
  unlockedCases: string[];
  userProgress: UserProgress;
  lastSaved: Date;
  version: string;
}

export interface GameAction {
  type: 'NAVIGATE' | 'EXAMINE' | 'QUESTION' | 'USE_ITEM' | 'COMPLETE_OBJECTIVE' | 'UNLOCK_CONTENT';
  payload: any;
  timestamp: Date;
}

export class GameStateManager {
  private static readonly STORAGE_KEY = 'audiovr_game_state';
  private static readonly VERSION = '1.0.0';
  
  private currentState: SavedGameState;
  private listeners: Set<(state: SavedGameState) => void> = new Set();
  private actionHistory: GameAction[] = [];
  
  // Event callbacks
  private onStateChange?: (state: SavedGameState) => void;
  private onAchievementUnlocked?: (achievement: Achievement) => void;
  private onContentUnlocked?: (type: 'world' | 'case', id: string) => void;

  constructor() {
    this.currentState = this.createInitialState();
  }

  // Initialize game state manager
  async initialize(): Promise<void> {
    try {
      const savedState = await this.loadGameState();
      if (savedState) {
        this.currentState = savedState;
        console.log('Game state loaded successfully');
      } else {
        console.log('No saved game state found, using initial state');
      }
    } catch (error) {
      console.error('Failed to initialize GameStateManager:', error);
      // Use initial state on error
      this.currentState = this.createInitialState();
    }
  }

  // Set event callbacks
  setEventCallbacks({
    onStateChange,
    onAchievementUnlocked,
    onContentUnlocked,
  }: {
    onStateChange?: (state: SavedGameState) => void;
    onAchievementUnlocked?: (achievement: Achievement) => void;
    onContentUnlocked?: (type: 'world' | 'case', id: string) => void;
  }): void {
    this.onStateChange = onStateChange;
    this.onAchievementUnlocked = onAchievementUnlocked;
    this.onContentUnlocked = onContentUnlocked;
  }

  // Create initial game state
  private createInitialState(): SavedGameState {
    return {
      gameState: {
        currentWorld: undefined,
        currentCase: undefined,
        currentLocation: undefined,
        activeCharacters: [],
        availableEvidence: [],
        gamePhase: 'menu',
        playerProgress: 0,
      },
      caseProgress: {},
      unlockedWorlds: ['victorian-london'], // Starting world
      unlockedCases: [],
      userProgress: {
        totalCasesCompleted: 0,
        totalPlayTime: 0,
        currentStreak: 0,
        achievements: [],
        favoriteWorlds: [],
        difficulty: 'medium',
      },
      lastSaved: new Date(),
      version: GameStateManager.VERSION,
    };
  }

  // Load game state from storage
  private async loadGameState(): Promise<SavedGameState | null> {
    try {
      const savedData = await AsyncStorage.getItem(GameStateManager.STORAGE_KEY);
      if (!savedData) {
        return null;
      }

      const parsedData = JSON.parse(savedData);
      
      // Validate version compatibility
      if (parsedData.version !== GameStateManager.VERSION) {
        console.warn('Game state version mismatch, migrating...');
        return this.migrateGameState(parsedData);
      }

      // Convert date strings back to Date objects
      parsedData.lastSaved = new Date(parsedData.lastSaved);
      parsedData.userProgress.achievements.forEach((achievement: Achievement) => {
        if (achievement.unlockedAt) {
          achievement.unlockedAt = new Date(achievement.unlockedAt);
        }
      });

      return parsedData;
    } catch (error) {
      console.error('Failed to load game state:', error);
      return null;
    }
  }

  // Save game state to storage
  async saveGameState(): Promise<void> {
    try {
      this.currentState.lastSaved = new Date();
      const serializedState = JSON.stringify(this.currentState);
      await AsyncStorage.setItem(GameStateManager.STORAGE_KEY, serializedState);
      console.log('Game state saved successfully');
    } catch (error) {
      console.error('Failed to save game state:', error);
      throw error;
    }
  }

  // Migrate old game state versions
  private migrateGameState(oldState: any): SavedGameState {
    // Implement migration logic for different versions
    // For now, return initial state and preserve what we can
    const newState = this.createInitialState();
    
    if (oldState.userProgress) {
      newState.userProgress = {
        ...newState.userProgress,
        ...oldState.userProgress,
      };
    }

    if (oldState.unlockedWorlds) {
      newState.unlockedWorlds = [...new Set([...newState.unlockedWorlds, ...oldState.unlockedWorlds])];
    }

    if (oldState.caseProgress) {
      newState.caseProgress = { ...oldState.caseProgress };
    }

    console.log('Game state migrated to version', GameStateManager.VERSION);
    return newState;
  }

  // Get current game state
  getCurrentState(): SavedGameState {
    return { ...this.currentState };
  }

  // Get current game state only
  getGameState(): GameState {
    return { ...this.currentState.gameState };
  }

  // Update game state
  updateGameState(updates: Partial<GameState>): void {
    this.currentState.gameState = {
      ...this.currentState.gameState,
      ...updates,
    };
    
    this.notifyListeners();
    this.onStateChange?.(this.currentState);
  }

  // Start new case
  async startCase(caseData: DetectiveCase): Promise<void> {
    // Update game state
    this.updateGameState({
      currentWorld: caseData.worldId,
      currentCase: caseData.id,
      currentLocation: 'Case Introduction',
      activeCharacters: [],
      availableEvidence: [],
      gamePhase: 'exploration',
      playerProgress: 0,
    });

    // Initialize case progress
    this.currentState.caseProgress[caseData.id] = 0;

    // Record action
    this.recordAction({
      type: 'NAVIGATE',
      payload: { caseId: caseData.id, action: 'start_case' },
      timestamp: new Date(),
    });

    await this.saveGameState();
    console.log('Started case:', caseData.title);
  }

  // Update case progress
  async updateCaseProgress(caseId: string, progress: number): Promise<void> {
    const previousProgress = this.currentState.caseProgress[caseId] || 0;
    this.currentState.caseProgress[caseId] = progress;

    // Update overall player progress
    this.currentState.gameState.playerProgress = progress;

    // Check for case completion
    if (progress >= 100 && previousProgress < 100) {
      await this.completeCase(caseId);
    }

    // Check for achievements
    await this.checkAchievements();

    await this.saveGameState();
    this.notifyListeners();
  }

  // Complete case
  private async completeCase(caseId: string): Promise<void> {
    this.currentState.userProgress.totalCasesCompleted++;
    this.currentState.userProgress.currentStreak++;

    // Unlock next content based on completion
    await this.checkContentUnlocks();

    // Record completion action
    this.recordAction({
      type: 'COMPLETE_OBJECTIVE',
      payload: { caseId, type: 'case_completion' },
      timestamp: new Date(),
    });

    console.log('Case completed:', caseId);
  }

  // Check and unlock content
  private async checkContentUnlocks(): Promise<void> {
    const { totalCasesCompleted } = this.currentState.userProgress;

    // Unlock worlds based on cases completed
    if (totalCasesCompleted >= 3 && !this.currentState.unlockedWorlds.includes('modern-tokyo')) {
      this.currentState.unlockedWorlds.push('modern-tokyo');
      this.onContentUnlocked?.('world', 'modern-tokyo');
    }

    if (totalCasesCompleted >= 8 && !this.currentState.unlockedWorlds.includes('space-station')) {
      this.currentState.unlockedWorlds.push('space-station');
      this.onContentUnlocked?.('world', 'space-station');
    }

    // Unlock specific cases based on world progression
    // Add case unlock logic here based on your game design
  }

  // Check and unlock achievements
  private async checkAchievements(): Promise<void> {
    const achievements = this.getAvailableAchievements();
    
    for (const achievement of achievements) {
      if (this.isAchievementUnlocked(achievement.id)) {
        continue; // Already unlocked
      }

      let shouldUnlock = false;

      switch (achievement.id) {
        case 'first_case':
          shouldUnlock = this.currentState.userProgress.totalCasesCompleted >= 1;
          break;
        case 'detective_novice':
          shouldUnlock = this.currentState.userProgress.totalCasesCompleted >= 5;
          break;
        case 'master_detective':
          shouldUnlock = this.currentState.userProgress.totalCasesCompleted >= 20;
          break;
        case 'voice_commander':
          shouldUnlock = this.actionHistory.filter(a => a.type !== 'NAVIGATE').length >= 50;
          break;
        case 'world_explorer':
          shouldUnlock = this.currentState.unlockedWorlds.length >= 3;
          break;
        default:
          break;
      }

      if (shouldUnlock) {
        await this.unlockAchievement(achievement.id);
      }
    }
  }

  // Unlock achievement
  private async unlockAchievement(achievementId: string): Promise<void> {
    const achievement = this.getAvailableAchievements().find(a => a.id === achievementId);
    if (!achievement) {
      return;
    }

    achievement.unlockedAt = new Date();
    achievement.progress = 100;

    this.currentState.userProgress.achievements.push(achievement);
    this.onAchievementUnlocked?.(achievement);

    console.log('Achievement unlocked:', achievement.name);
  }

  // Check if achievement is unlocked
  private isAchievementUnlocked(achievementId: string): boolean {
    return this.currentState.userProgress.achievements.some(a => a.id === achievementId);
  }

  // Get available achievements
  private getAvailableAchievements(): Achievement[] {
    return [
      {
        id: 'first_case',
        name: 'First Case Solved',
        description: 'Complete your first detective case',
        icon: 'trophy',
        progress: 0,
        target: 1,
      },
      {
        id: 'detective_novice',
        name: 'Detective Novice',
        description: 'Complete 5 detective cases',
        icon: 'star',
        progress: 0,
        target: 5,
      },
      {
        id: 'master_detective',
        name: 'Master Detective',
        description: 'Complete 20 detective cases',
        icon: 'medal',
        progress: 0,
        target: 20,
      },
      {
        id: 'voice_commander',
        name: 'Voice Commander',
        description: 'Use voice commands 50 times',
        icon: 'microphone',
        progress: 0,
        target: 50,
      },
      {
        id: 'world_explorer',
        name: 'World Explorer',
        description: 'Unlock all mystery worlds',
        icon: 'globe',
        progress: 0,
        target: 3,
      },
    ];
  }

  // Record game action
  recordAction(action: GameAction): void {
    this.actionHistory.push(action);
    
    // Keep only last 1000 actions to prevent memory issues
    if (this.actionHistory.length > 1000) {
      this.actionHistory = this.actionHistory.slice(-1000);
    }

    console.log('Action recorded:', action.type, action.payload);
  }

  // Navigate to location
  async navigateToLocation(location: string): Promise<void> {
    this.updateGameState({ currentLocation: location });
    
    this.recordAction({
      type: 'NAVIGATE',
      payload: { location },
      timestamp: new Date(),
    });

    await this.saveGameState();
  }

  // Examine object
  async examineObject(objectId: string, objectName: string): Promise<void> {
    this.recordAction({
      type: 'EXAMINE',
      payload: { objectId, objectName },
      timestamp: new Date(),
    });

    // Add to available evidence if it's new evidence
    const currentEvidence = this.currentState.gameState.availableEvidence;
    if (!currentEvidence.includes(objectId)) {
      this.updateGameState({
        availableEvidence: [...currentEvidence, objectId],
      });
    }

    await this.saveGameState();
  }

  // Question character
  async questionCharacter(characterId: string, characterName: string): Promise<void> {
    this.updateGameState({ gamePhase: 'conversation' });
    
    this.recordAction({
      type: 'QUESTION',
      payload: { characterId, characterName },
      timestamp: new Date(),
    });

    await this.saveGameState();
  }

  // Use item
  async useItem(itemId: string, itemName: string, targetId?: string): Promise<void> {
    this.recordAction({
      type: 'USE_ITEM',
      payload: { itemId, itemName, targetId },
      timestamp: new Date(),
    });

    await this.saveGameState();
  }

  // Update play time
  updatePlayTime(minutes: number): void {
    this.currentState.userProgress.totalPlayTime += minutes;
    this.notifyListeners();
  }

  // Get case progress
  getCaseProgress(caseId: string): number {
    return this.currentState.caseProgress[caseId] || 0;
  }

  // Check if content is unlocked
  isWorldUnlocked(worldId: string): boolean {
    return this.currentState.unlockedWorlds.includes(worldId);
  }

  isCaseUnlocked(caseId: string): boolean {
    return this.currentState.unlockedCases.includes(caseId);
  }

  // Get user statistics
  getUserStats(): UserProgress {
    return { ...this.currentState.userProgress };
  }

  // Add state change listener
  addListener(callback: (state: SavedGameState) => void): void {
    this.listeners.add(callback);
  }

  // Remove state change listener
  removeListener(callback: (state: SavedGameState) => void): void {
    this.listeners.delete(callback);
  }

  // Notify all listeners of state changes
  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.currentState));
  }

  // Reset game state (for testing or new game)
  async resetGameState(): Promise<void> {
    this.currentState = this.createInitialState();
    this.actionHistory = [];
    await this.saveGameState();
    this.notifyListeners();
    console.log('Game state reset');
  }

  // Export game data for backup
  async exportGameData(): Promise<string> {
    const exportData = {
      ...this.currentState,
      actionHistory: this.actionHistory,
      exportedAt: new Date(),
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  // Import game data from backup
  async importGameData(jsonData: string): Promise<void> {
    try {
      const importedData = JSON.parse(jsonData);
      
      // Validate imported data structure
      if (!importedData.gameState || !importedData.userProgress) {
        throw new Error('Invalid game data format');
      }

      // Convert date strings back to Date objects
      importedData.lastSaved = new Date(importedData.lastSaved);
      if (importedData.userProgress.achievements) {
        importedData.userProgress.achievements.forEach((achievement: Achievement) => {
          if (achievement.unlockedAt) {
            achievement.unlockedAt = new Date(achievement.unlockedAt);
          }
        });
      }

      this.currentState = importedData;
      if (importedData.actionHistory) {
        this.actionHistory = importedData.actionHistory.map((action: any) => ({
          ...action,
          timestamp: new Date(action.timestamp),
        }));
      }

      await this.saveGameState();
      this.notifyListeners();
      
      console.log('Game data imported successfully');
    } catch (error) {
      console.error('Failed to import game data:', error);
      throw error;
    }
  }

  // Cleanup
  cleanup(): void {
    this.listeners.clear();
    this.actionHistory = [];
  }
}

export default GameStateManager;