import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';

// Design System based on the Whitechapel Mystery screen design
export const Colors = {
  // Primary colors from the design
  background: '#1a1a2e', // Dark navy background
  backgroundGradientStart: '#16213e', // Gradient start
  backgroundGradientEnd: '#0f3460', // Gradient end
  
  // Purple accent system
  purple: {
    primary: '#6c5ce7', // Main purple accent
    light: '#a29bfe', // Light purple for highlights
    dark: '#5f3dc4', // Dark purple for depth
    glow: 'rgba(108, 92, 231, 0.3)', // Purple glow effect
  },
  
  // Text colors
  text: {
    primary: '#ffffff', // White primary text
    secondary: '#b2bec3', // Light gray secondary text
    tertiary: '#636e72', // Medium gray tertiary text
    accent: '#6c5ce7', // Purple accent text
  },
  
  // Button colors
  button: {
    primary: '#6c5ce7', // Purple primary button
    primaryHover: '#5f3dc4', // Darker purple on press
    secondary: 'rgba(255, 255, 255, 0.1)', // Transparent white
    secondaryHover: 'rgba(255, 255, 255, 0.2)',
    success: '#00b894', // Green for success actions
    danger: '#e17055', // Orange-red for danger actions
  },
  
  // Card and surface colors
  surface: {
    primary: 'rgba(255, 255, 255, 0.05)', // Semi-transparent white
    secondary: 'rgba(0, 0, 0, 0.3)', // Semi-transparent black
    elevated: 'rgba(255, 255, 255, 0.1)', // More opaque for elevated surfaces
  },
  
  // Status and feedback colors
  status: {
    success: '#00b894',
    warning: '#fdcb6e',
    error: '#e17055',
    info: '#74b9ff',
  },
  
  // Border and divider colors
  border: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.2)',
    accent: '#6c5ce7',
  }
};

export const Typography = {
  // Font sizes following the design
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
    '6xl': 42,
  },
  
  // Font weights
  weights: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  
  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  }
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
};

// Screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const Layout = {
  window: {
    width: screenWidth,
    height: screenHeight,
  },
  isSmallDevice: screenWidth < 375,
  isTablet: screenWidth >= 768,
  headerHeight: 88,
  bottomTabHeight: 83,
  statusBarHeight: 44,
};

// Common component styles matching the design
export const CommonStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  // Header styles (matching the back arrow and settings icon layout)
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Layout.statusBarHeight,
    paddingBottom: Spacing.md,
    height: Layout.headerHeight,
  },
  
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Card styles (matching the main content card)
  card: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  
  cardElevated: {
    backgroundColor: Colors.surface.elevated,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.lg,
  },
  
  // Button styles (matching the "Continue Investigation" button)
  primaryButton: {
    backgroundColor: Colors.button.primary,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    ...Shadows.md,
  },
  
  secondaryButton: {
    backgroundColor: Colors.button.secondary,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  
  voiceCommandButton: {
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    marginBottom: Spacing.sm,
  },
  
  // Text styles
  headingLarge: {
    fontSize: Typography.sizes['4xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    lineHeight: Typography.sizes['4xl'] * Typography.lineHeights.tight,
  },
  
  headingMedium: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
    lineHeight: Typography.sizes['2xl'] * Typography.lineHeights.tight,
  },
  
  headingSmall: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
    lineHeight: Typography.sizes.lg * Typography.lineHeights.normal,
  },
  
  bodyLarge: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.normal,
    color: Colors.text.secondary,
    lineHeight: Typography.sizes.base * Typography.lineHeights.relaxed,
  },
  
  bodyMedium: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.normal,
    color: Colors.text.secondary,
    lineHeight: Typography.sizes.sm * Typography.lineHeights.normal,
  },
  
  bodySmall: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.normal,
    color: Colors.text.tertiary,
    lineHeight: Typography.sizes.xs * Typography.lineHeights.normal,
  },
  
  buttonTextPrimary: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
  },
  
  buttonTextSecondary: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text.secondary,
  },
  
  // Accessibility styles
  accessibilityFocus: {
    borderWidth: 2,
    borderColor: Colors.purple.primary,
  },
  
  highContrast: {
    borderWidth: 1,
    borderColor: Colors.text.primary,
  },
  
  // Layout helpers
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  spaceBetween: {
    justifyContent: 'space-between',
  },
  
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Gradient background (for screens like this one)
  gradientBackground: {
    flex: 1,
  },
  
  // Image overlay for atmospheric backgrounds
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  
  // Status indicators (like the 4/5 stars, difficulty level)
  statusBadge: {
    backgroundColor: Colors.surface.elevated,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    marginRight: Spacing.xs,
  },
  
  progressIndicator: {
    height: 4,
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.xs,
    overflow: 'hidden',
  },
  
  progressFill: {
    height: '100%',
    backgroundColor: Colors.purple.primary,
    borderRadius: BorderRadius.xs,
  },
});

// Animation configurations
export const Animations = {
  spring: {
    damping: 20,
    stiffness: 300,
  },
  timing: {
    duration: 300,
  },
  fade: {
    duration: 200,
  },
};