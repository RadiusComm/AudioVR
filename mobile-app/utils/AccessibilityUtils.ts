import { AccessibilityInfo, Platform, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';

export interface AccessibilityAnnouncement {
  message: string;
  priority?: 'low' | 'high';
  interrupt?: boolean;
}

export interface HapticFeedbackOptions {
  type: 'success' | 'warning' | 'error' | 'selection' | 'impact';
  intensity?: 'light' | 'medium' | 'heavy';
}

export class AccessibilityUtils {
  private static screenReaderEnabled: boolean = false;
  private static voiceOverEnabled: boolean = false;
  private static talkBackEnabled: boolean = false;

  // Initialize accessibility utilities
  static async initialize(): Promise<void> {
    try {
      // Check screen reader status
      this.screenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      
      if (Platform.OS === 'ios') {
        this.voiceOverEnabled = this.screenReaderEnabled;
      } else if (Platform.OS === 'android') {
        this.talkBackEnabled = this.screenReaderEnabled;
      }

      // Listen for screen reader changes
      AccessibilityInfo.addEventListener('screenReaderChanged', this.handleScreenReaderChange);
      
      console.log('AccessibilityUtils initialized:', {
        screenReaderEnabled: this.screenReaderEnabled,
        voiceOverEnabled: this.voiceOverEnabled,
        talkBackEnabled: this.talkBackEnabled,
      });
    } catch (error) {
      console.error('Failed to initialize AccessibilityUtils:', error);
    }
  }

  // Handle screen reader state changes
  private static handleScreenReaderChange = (isEnabled: boolean) => {
    this.screenReaderEnabled = isEnabled;
    
    if (Platform.OS === 'ios') {
      this.voiceOverEnabled = isEnabled;
    } else if (Platform.OS === 'android') {
      this.talkBackEnabled = isEnabled;
    }

    console.log('Screen reader state changed:', isEnabled);
  };

  // Check if screen reader is enabled
  static isScreenReaderEnabled(): boolean {
    return this.screenReaderEnabled;
  }

  // Check if VoiceOver (iOS) is enabled
  static isVoiceOverEnabled(): boolean {
    return Platform.OS === 'ios' && this.voiceOverEnabled;
  }

  // Check if TalkBack (Android) is enabled
  static isTalkBackEnabled(): boolean {
    return Platform.OS === 'android' && this.talkBackEnabled;
  }

  // Announce message to screen reader
  static announce(announcement: AccessibilityAnnouncement): void {
    const { message, interrupt = false } = announcement;
    
    try {
      if (this.screenReaderEnabled) {
        AccessibilityInfo.announceForAccessibility(message);
        
        // Add haptic feedback for important announcements
        if (announcement.priority === 'high') {
          this.provideHapticFeedback({ type: 'impact', intensity: 'medium' });
        }
        
        console.log('Accessibility announcement:', message);
      }
    } catch (error) {
      console.error('Failed to make accessibility announcement:', error);
    }
  }

  // Announce navigation change
  static announceNavigation(screenName: string, context?: string): void {
    const message = context 
      ? `Navigated to ${screenName}. ${context}`
      : `Navigated to ${screenName}`;
    
    this.announce({
      message,
      priority: 'high',
      interrupt: true,
    });
  }

  // Announce game state change
  static announceGameState(
    location?: string,
    objective?: string,
    characters?: string[],
    evidence?: string[]
  ): void {
    const parts: string[] = [];
    
    if (location) {
      parts.push(`Current location: ${location}`);
    }
    
    if (objective) {
      parts.push(`Objective: ${objective}`);
    }
    
    if (characters && characters.length > 0) {
      parts.push(`Characters present: ${characters.join(', ')}`);
    }
    
    if (evidence && evidence.length > 0) {
      parts.push(`Evidence available: ${evidence.length} items`);
    }

    if (parts.length > 0) {
      this.announce({
        message: parts.join('. '),
        priority: 'high',
      });
    }
  }

  // Announce voice command help
  static announceVoiceHelp(availableCommands: string[]): void {
    const message = `Available voice commands: ${availableCommands.slice(0, 5).join(', ')}${
      availableCommands.length > 5 ? `, and ${availableCommands.length - 5} more` : ''
    }. Say "help" for full list.`;
    
    this.announce({
      message,
      priority: 'high',
    });
  }

  // Announce audio feedback
  static announceAudioFeedback(
    type: 'playing' | 'paused' | 'stopped' | 'volume_changed',
    details?: string
  ): void {
    let message = '';
    
    switch (type) {
      case 'playing':
        message = `Audio playing${details ? `: ${details}` : ''}`;
        break;
      case 'paused':
        message = 'Audio paused';
        break;
      case 'stopped':
        message = 'Audio stopped';
        break;
      case 'volume_changed':
        message = `Volume ${details || 'changed'}`;
        break;
    }

    if (message) {
      this.announce({ message, priority: 'low' });
    }
  }

  // Provide haptic feedback
  static provideHapticFeedback(options: HapticFeedbackOptions): void {
    try {
      if (Platform.OS === 'ios') {
        this.provideiOSHaptics(options);
      } else if (Platform.OS === 'android') {
        this.provideAndroidHaptics(options);
      }
    } catch (error) {
      console.error('Failed to provide haptic feedback:', error);
    }
  }

  // iOS haptic feedback
  private static async provideiOSHaptics(options: HapticFeedbackOptions): Promise<void> {
    switch (options.type) {
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'selection':
        await Haptics.selectionAsync();
        break;
      case 'impact':
        const intensity = options.intensity || 'medium';
        switch (intensity) {
          case 'light':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
          case 'medium':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            break;
          case 'heavy':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            break;
        }
        break;
    }
  }

  // Android haptic feedback
  private static provideAndroidHaptics(options: HapticFeedbackOptions): void {
    const patterns = {
      success: [0, 100, 50, 100],
      warning: [0, 200, 100, 200],
      error: [0, 300, 100, 300, 100, 300],
      selection: [0, 50],
      impact: [0, 100],
    };

    const pattern = patterns[options.type] || patterns.selection;
    Vibration.vibrate(pattern);
  }

  // Create accessible button props
  static createAccessibleButtonProps(
    label: string,
    hint?: string,
    role: 'button' | 'link' | 'tab' = 'button'
  ): Record<string, any> {
    return {
      accessible: true,
      accessibilityLabel: label,
      accessibilityHint: hint,
      accessibilityRole: role,
      ...(this.screenReaderEnabled && {
        importantForAccessibility: 'yes',
      }),
    };
  }

  // Create accessible text props
  static createAccessibleTextProps(
    text: string,
    isHeading?: boolean,
    level?: number
  ): Record<string, any> {
    const props: Record<string, any> = {
      accessible: true,
      accessibilityLabel: text,
    };

    if (isHeading) {
      props.accessibilityRole = 'header';
      if (level) {
        props.accessibilityLevel = level;
      }
    }

    return props;
  }

  // Create accessible input props
  static createAccessibleInputProps(
    label: string,
    value?: string,
    placeholder?: string,
    hint?: string
  ): Record<string, any> {
    return {
      accessible: true,
      accessibilityLabel: label,
      accessibilityValue: value ? { text: value } : undefined,
      accessibilityHint: hint || placeholder,
      ...(this.screenReaderEnabled && {
        importantForAccessibility: 'yes',
      }),
    };
  }

  // Focus management for screen readers
  static focusElement(elementRef: any, delay: number = 100): void {
    if (this.screenReaderEnabled && elementRef?.current) {
      setTimeout(() => {
        AccessibilityInfo.setAccessibilityFocus(elementRef.current);
      }, delay);
    }
  }

  // Check if user prefers reduced motion
  static async prefersReducedMotion(): Promise<boolean> {
    try {
      return await AccessibilityInfo.isReduceMotionEnabled();
    } catch (error) {
      console.error('Failed to check reduced motion preference:', error);
      return false;
    }
  }

  // Create voice command announcement
  static announceVoiceCommandResult(
    command: string,
    success: boolean,
    result?: string
  ): void {
    let message = '';
    
    if (success) {
      message = result 
        ? `Command "${command}" executed. ${result}`
        : `Command "${command}" executed successfully`;
      
      this.provideHapticFeedback({ type: 'success' });
    } else {
      message = `Command "${command}" not recognized. Please try again or say "help" for available commands.`;
      this.provideHapticFeedback({ type: 'error' });
    }

    this.announce({
      message,
      priority: 'high',
      interrupt: true,
    });
  }

  // Announce case progress
  static announceCaseProgress(
    caseName: string,
    chapter: number,
    totalChapters: number,
    progress: number
  ): void {
    const message = `Case progress: ${caseName}, Chapter ${chapter} of ${totalChapters}, ${Math.round(progress)}% complete`;
    
    this.announce({
      message,
      priority: 'high',
    });
  }

  // Announce audio layers status
  static announceAudioLayersStatus(layers: Array<{ name: string; volume: number; isMuted: boolean }>): void {
    const activeLayerNames = layers
      .filter(layer => !layer.isMuted && layer.volume > 0)
      .map(layer => layer.name);
    
    const message = activeLayerNames.length > 0
      ? `Active audio layers: ${activeLayerNames.join(', ')}`
      : 'All audio layers are muted';
    
    this.announce({
      message,
      priority: 'low',
    });
  }

  // Create accessibility-optimized styles
  static createAccessibleStyles(baseStyles: any): any {
    if (!this.screenReaderEnabled) {
      return baseStyles;
    }

    return {
      ...baseStyles,
      // Increase touch targets for better accessibility
      minHeight: Math.max(baseStyles.minHeight || 0, 44),
      minWidth: Math.max(baseStyles.minWidth || 0, 44),
      // Ensure sufficient color contrast
      ...(baseStyles.backgroundColor && {
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
      }),
    };
  }

  // Cleanup
  static cleanup(): void {
    AccessibilityInfo.removeEventListener('screenReaderChanged', this.handleScreenReaderChange);
  }
}

// Enhanced accessibility hooks for React components
export const useAccessibilityAnnouncement = () => {
  return {
    announce: AccessibilityUtils.announce,
    announceNavigation: AccessibilityUtils.announceNavigation,
    announceGameState: AccessibilityUtils.announceGameState,
    announceVoiceHelp: AccessibilityUtils.announceVoiceHelp,
  };
};

export const useHapticFeedback = () => {
  return {
    success: () => AccessibilityUtils.provideHapticFeedback({ type: 'success' }),
    warning: () => AccessibilityUtils.provideHapticFeedback({ type: 'warning' }),
    error: () => AccessibilityUtils.provideHapticFeedback({ type: 'error' }),
    selection: () => AccessibilityUtils.provideHapticFeedback({ type: 'selection' }),
    impact: (intensity: 'light' | 'medium' | 'heavy' = 'medium') => 
      AccessibilityUtils.provideHapticFeedback({ type: 'impact', intensity }),
  };
};

export const useAccessibleProps = () => {
  return {
    createButtonProps: AccessibilityUtils.createAccessibleButtonProps,
    createTextProps: AccessibilityUtils.createAccessibleTextProps,
    createInputProps: AccessibilityUtils.createAccessibleInputProps,
    createStyles: AccessibilityUtils.createAccessibleStyles,
  };
};

export default AccessibilityUtils;