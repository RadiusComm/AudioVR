# AudioVR Mobile App

A voice-driven detective mystery platform designed with accessibility-first principles, featuring immersive spatial audio and hands-free navigation.

## 🎯 Features

### 🎮 Core Gameplay
- **Voice-Controlled Navigation**: Complete hands-free control using natural language
- **Detective Mystery Cases**: Immersive stories across multiple worlds (Victorian London, Modern Tokyo, Space Station)
- **Character Conversations**: AI-powered dialogue with ElevenLabs integration
- **Evidence Management**: Voice-activated inventory and investigation tools
- **Progress Tracking**: Chapter-based progression with achievements

### 🔊 Audio Excellence
- **Spatial Audio**: 3D positioned sound effects for immersive environments
- **Multi-Layer Audio**: Separate control for ambient, dialogue, music, and UI sounds
- **Adaptive Streaming**: Smart caching and preloading for smooth playback
- **Voice Synthesis**: High-quality text-to-speech for character responses

### ♿ Accessibility First
- **Screen Reader Optimization**: Full VoiceOver/TalkBack support
- **Voice Navigation**: 100% hands-free operation capability
- **High Contrast Mode**: Enhanced visibility options
- **Haptic Feedback**: Tactile responses for important interactions
- **Customizable Controls**: Adjustable voice sensitivity and audio levels

## 🏗️ Technical Architecture

### 📱 Platform
- **Framework**: React Native with Expo SDK 49
- **Navigation**: React Navigation v6 with stack-based routing
- **State Management**: React hooks with context providers
- **Audio Engine**: Expo AV with custom spatial audio processing
- **Voice Recognition**: React Native Voice with custom NLP processing

### 🎵 Audio System
```typescript
// Multi-layer audio architecture
AudioLayers {
  ambient: 0.6,    // Environmental sounds
  dialogue: 1.0,   // Character speech
  sfx: 0.8,        // Sound effects  
  music: 0.4,      // Background music
  ui: 0.7          // Interface sounds
}
```

### 🎤 Voice Commands
- **Navigation**: "Go to dining car", "Move forward", "Enter room"
- **Investigation**: "Examine window", "Look at evidence", "Search area"
- **Conversation**: "Ask Holmes about clues", "Question witness"
- **System**: "Repeat", "Pause", "Help", "Describe scene"
- **Accessibility**: "Increase dialogue volume", "Enable descriptions"

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator (Mac) or Android Emulator
- Physical device for voice testing (recommended)

### Installation
```bash
# Clone the repository
git clone https://github.com/username/audiovr-mobile
cd audiovr-mobile

# Install dependencies
npm install

# Start development server
npm start

# Run on specific platform
npm run ios     # iOS Simulator
npm run android # Android Emulator
npm run web     # Web browser
```

### Platform-Specific Setup

#### iOS Setup
```bash
# Install iOS dependencies
cd ios && pod install && cd ..

# Configure microphone permissions
# Add to Info.plist:
# - NSMicrophoneUsageDescription
# - NSSpeechRecognitionUsageDescription
```

#### Android Setup
```bash
# Enable microphone permissions in android/app/src/main/AndroidManifest.xml:
# - android.permission.RECORD_AUDIO
# - android.permission.INTERNET
# - android.permission.ACCESS_NETWORK_STATE
```

## 📂 Project Structure

```
mobile-app/
├── components/          # Reusable UI components
│   ├── DesignSystem.tsx # Design tokens and styles
│   └── ...
├── screens/            # Main app screens
│   ├── WorldSelectionScreen.tsx
│   ├── CaseDetailScreen.tsx
│   ├── ActiveInvestigationScreen.tsx
│   └── ...
├── services/           # Core business logic
│   ├── VoiceService.ts        # Voice recognition & NLP
│   ├── AudioAssetManager.ts   # Audio streaming & caching
│   └── ...
├── types/              # TypeScript definitions
│   └── index.ts
├── utils/              # Helper functions
├── assets/             # Images, fonts, audio files
├── App.tsx            # Main app component
└── package.json       # Dependencies and scripts
```

## 🎨 Design System

### Color Palette
```typescript
Colors {
  background: '#1a1a2e',      // Dark navy background
  purple: {
    primary: '#6c5ce7',       // Main purple accent
    light: '#a29bfe',         // Light purple highlights
    dark: '#5f3dc4',          // Dark purple depth
  },
  text: {
    primary: '#ffffff',       // White primary text
    secondary: '#b2bec3',     // Light gray secondary
    tertiary: '#636e72',      // Medium gray tertiary
  }
}
```

### Typography
- **Headings**: Bold, high contrast for accessibility
- **Body Text**: Optimized line height and spacing
- **Voice Commands**: Clear, descriptive labels

## 🧪 Testing

### Voice Recognition Testing
```bash
# Test voice commands in development
npm test

# Test with different accents and languages
# Use physical device for accurate microphone testing
```

### Accessibility Testing
- **Screen Reader**: Test with VoiceOver (iOS) and TalkBack (Android)
- **Voice Navigation**: Ensure complete hands-free operation
- **Contrast**: Verify color contrast ratios meet WCAG guidelines
- **Motor Accessibility**: Test with voice-only interaction

## 🏗️ Build & Deployment

### Development Build
```bash
# Create development build
eas build --profile development --platform ios
eas build --profile development --platform android
```

### Production Build
```bash
# Create production builds
eas build --profile production --platform all

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

### Environment Configuration
```bash
# Set up environment variables
cp .env.example .env

# Configure ElevenLabs API key
ELEVENLABS_API_KEY=your_api_key_here

# Configure Cloudflare backend URL
BACKEND_URL=https://your-backend.pages.dev
```

## 🎵 Audio Asset Management

### Asset Types
- **Ambient**: Environmental background sounds (rain, city noise, space hum)
- **Dialogue**: Character speech with spatial positioning
- **SFX**: Interactive sound effects (footsteps, door creaks, object interactions)
- **Music**: Adaptive background music based on tension/mood
- **UI**: Interface feedback sounds (button presses, confirmations)

### Caching Strategy
- **Preload**: Essential game assets (500MB cache limit)
- **Streaming**: Dynamic content based on user choices
- **Compression**: Optimized audio formats for mobile bandwidth

## 🔊 Voice Command System

### Natural Language Processing
```typescript
// Command pattern matching
patterns: {
  'go to {location}': navigate,
  'examine {object}': investigate, 
  'ask {character} about {topic}': question,
  'use {item} on {target}': interact
}
```

### Context Awareness
- **Game Phase**: Different commands available in menu vs. gameplay
- **Location**: Environment-specific interaction options
- **Character Presence**: Conversation commands only when characters present
- **Inventory**: Item-specific usage commands

## 📊 Performance Optimization

### Audio Performance
- **Spatial Audio**: Efficient 3D positioning calculations
- **Memory Management**: Smart loading/unloading of audio assets
- **Battery Optimization**: Adaptive processing based on device state

### Voice Processing
- **Local Recognition**: Core commands processed offline
- **Cloud Fallback**: Advanced NLP via cloud services when available
- **Latency Reduction**: <500ms response time target

## 🤝 Contributing

### Development Guidelines
1. **Accessibility First**: Every feature must support voice-only operation
2. **Performance**: Maintain 60fps and <2s load times
3. **Testing**: Include voice command tests for all new features
4. **Documentation**: Update voice command lists and accessibility guides

### Code Style
- **TypeScript**: Strict mode enabled with comprehensive typing
- **ESLint**: Expo-recommended configuration with accessibility rules
- **Prettier**: Consistent code formatting
- **Commit Messages**: Conventional commits format

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

### Troubleshooting
- **Voice Recognition Issues**: Check microphone permissions and background noise
- **Audio Playback Problems**: Verify device audio settings and restart app
- **Performance Issues**: Clear app cache and ensure sufficient storage space

### Contact
- **GitHub Issues**: Report bugs and feature requests
- **Email Support**: support@audiovr.app
- **Accessibility Feedback**: accessibility@audiovr.app

---

*AudioVR - Making detective mysteries accessible to everyone through the power of voice and spatial audio.*