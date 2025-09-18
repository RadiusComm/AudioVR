# AudioVR Screen Design Specifications

## 🎨 **Design Philosophy**

AudioVR's visual design prioritizes accessibility while maintaining aesthetic appeal. Every screen follows these principles:
- **Accessibility First**: High contrast, large touch targets, screen reader optimization
- **Voice-Centric**: Visual elements support but never require visual interaction
- **Atmospheric Immersion**: Dark themes with purple accent colors evoke mystery
- **Consistent Navigation**: Predictable layouts reduce cognitive load

---

## 🎯 **Design System Foundation**

### **Color Palette**
```css
/* Primary Colors */
--background-primary: #1a1a2e;     /* Dark navy background */
--background-secondary: #16213e;   /* Gradient start */
--background-tertiary: #0f3460;    /* Gradient end */

/* Accent Colors */
--purple-primary: #6c5ce7;         /* Main brand purple */
--purple-light: #a29bfe;          /* Highlights and focus states */
--purple-dark: #5f3dc4;           /* Pressed states and depth */
--purple-glow: rgba(108, 92, 231, 0.3); /* Glow effects */

/* Text Colors */
--text-primary: #ffffff;           /* Primary text (high contrast) */
--text-secondary: #b2bec3;         /* Secondary text (medium contrast) */
--text-tertiary: #636e72;          /* Tertiary text (subtle) */
--text-accent: #6c5ce7;            /* Purple accent text */

/* Status Colors */
--success: #00b894;                /* Success states and confirmations */
--warning: #fdcb6e;                /* Warnings and difficulty indicators */
--error: #e17055;                  /* Errors and critical states */
--info: #74b9ff;                   /* Information and help states */

/* Surface Colors */
--surface-primary: rgba(255, 255, 255, 0.05);    /* Semi-transparent cards */
--surface-secondary: rgba(0, 0, 0, 0.3);         /* Overlays */
--surface-elevated: rgba(255, 255, 255, 0.1);    /* Elevated elements */

/* Border Colors */
--border-light: rgba(255, 255, 255, 0.1);        /* Subtle borders */
--border-medium: rgba(255, 255, 255, 0.2);       /* Standard borders */
--border-accent: #6c5ce7;                         /* Accent borders */
```

### **Typography Scale**
```css
/* Font Sizes (Accessible sizing) */
--text-xs: 12px;      /* Small labels */
--text-sm: 14px;      /* Secondary text */
--text-base: 16px;    /* Body text (minimum for accessibility) */
--text-lg: 18px;      /* Large body text */
--text-xl: 20px;      /* Small headings */
--text-2xl: 24px;     /* Medium headings */
--text-3xl: 28px;     /* Large headings */
--text-4xl: 32px;     /* Display text */
--text-5xl: 36px;     /* Hero text */
--text-6xl: 42px;     /* Extra large display */

/* Font Weights */
--weight-light: 300;
--weight-normal: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
--weight-extrabold: 800;

/* Line Heights (Optimized for readability) */
--line-height-tight: 1.2;    /* Headings */
--line-height-normal: 1.4;   /* Body text */
--line-height-relaxed: 1.6;  /* Long-form content */
--line-height-loose: 1.8;    /* Very relaxed reading */
```

### **Spacing System**
```css
/* Consistent spacing scale */
--space-xs: 4px;      /* Micro spacing */
--space-sm: 8px;      /* Small spacing */
--space-md: 16px;     /* Standard spacing */
--space-lg: 24px;     /* Large spacing */
--space-xl: 32px;     /* Extra large spacing */
--space-2xl: 48px;    /* Section spacing */
--space-3xl: 64px;    /* Page spacing */

/* Touch Targets (Accessibility requirement: minimum 44x44pt) */
--touch-target-min: 44px;
--touch-target-comfortable: 56px;
--touch-target-large: 72px;
```

### **Border Radius & Shadows**
```css
/* Border Radius */
--radius-xs: 4px;     /* Small elements */
--radius-sm: 8px;     /* Standard elements */
--radius-md: 12px;    /* Cards and buttons */
--radius-lg: 16px;    /* Large cards */
--radius-xl: 20px;    /* Extra large cards */
--radius-2xl: 24px;   /* Hero elements */
--radius-full: 9999px; /* Circular elements */

/* Shadow System */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.2);
--shadow-md: 0 2px 4px rgba(0, 0, 0, 0.25);
--shadow-lg: 0 4px 8px rgba(0, 0, 0, 0.3);
--shadow-xl: 0 4px 12px rgba(108, 92, 231, 0.4); /* Purple glow shadow */
```

---

## 📱 **Screen 1: World Selection**

### **Layout Structure**
```
┌─────────────────────────────────────────┐ ← Status Bar (44px)
│  🔋 WiFi 📶                   🕐 Time   │
├─────────────────────────────────────────┤
│  ← Back              Choose Your World   │ ← Header (88px)
│                                      ⚙️  │
├─────────────────────────────────────────┤
│                                         │
│        Choose Your World                │ ← Title Section (120px)  
│   Select a mystery world to begin       │
│      your investigation                 │
│                                         │
├─────────────────────────────────────────┤
│  ╭─────────────────────────────────────╮ │
│  │    🏴󠁧󠁢󠁥󠁮󠁧󠁿 Victorian London          │ │ ← World Cards
│  │    ⭐⭐⭐⭐ Difficulty               │ │   (200px each)
│  │    ⏱️ 45 min avg • 📚 5 cases      │ │
│  │    [Foggy street atmosphere image]   │ │
│  ╰─────────────────────────────────────╯ │
│                                         │
│  ╭─────────────────────────────────────╮ │
│  │    🏙️ Modern Tokyo                  │ │
│  │    ⭐⭐⭐ Difficulty                 │ │
│  │    ⏱️ 35 min avg • 📚 4 cases      │ │
│  │    [Neon city atmosphere image]      │ │
│  ╰─────────────────────────────────────╯ │
│                                         │
│  ╭─────────────────────────────────────╮ │
│  │    🚀 Space Station Omega 🔒        │ │
│  │    ⭐⭐⭐⭐⭐ Difficulty            │ │
│  │    ⏱️ 60 min avg • 📚 3 cases      │ │
│  │    [Space station atmosphere image]  │ │
│  ╰─────────────────────────────────────╯ │
├─────────────────────────────────────────┤
│  🎤 Say "Select [World Name]"           │ ← Voice Commands
│  🎧 Say "Preview World" for audio       │   (100px)
└─────────────────────────────────────────┘
```

### **Component Specifications**

#### **Header Component**
```css
.world-selection-header {
  height: 88px;
  padding: 44px 24px 16px 24px; /* Account for status bar */
  background: linear-gradient(180deg, #1a1a2e 0%, rgba(26, 26, 46, 0.95) 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-button {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* Accessibility */
  min-width: 44px;
  min-height: 44px;
  
  /* Focus state */
  &:focus {
    border-color: #6c5ce7;
    box-shadow: 0 0 0 2px rgba(108, 92, 231, 0.3);
  }
}

.settings-button {
  /* Same styling as back-button */
}
```

#### **World Cards**
```css
.world-card {
  margin: 0 24px 16px 24px;
  border-radius: 20px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  /* Accessibility touch target */
  min-height: 200px;
  
  /* Interactive states */
  &:hover, &:focus {
    border-color: #6c5ce7;
    box-shadow: 0 4px 12px rgba(108, 92, 231, 0.4);
    transform: translateY(-2px);
    transition: all 0.3s ease;
  }
  
  &:active {
    transform: translateY(0);
  }
  
  /* Locked state */
  &.locked {
    opacity: 0.6;
    border-color: rgba(255, 255, 255, 0.05);
  }
}

.world-card-background {
  position: relative;
  height: 140px;
  background-size: cover;
  background-position: center;
  
  /* Dark overlay for text readability */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      180deg, 
      rgba(0, 0, 0, 0.3) 0%, 
      rgba(0, 0, 0, 0.6) 50%,
      rgba(0, 0, 0, 0.8) 100%
    );
  }
}

.world-card-content {
  position: relative;
  z-index: 1;
  padding: 16px;
  color: #ffffff;
}

.world-title {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 8px;
  
  /* High contrast for accessibility */
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}

.world-stats {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #b2bec3;
}

.difficulty-stars {
  display: flex;
  gap: 2px;
  
  .star {
    width: 12px;
    height: 12px;
    color: #fdcb6e;
  }
  
  .star-empty {
    color: #636e72;
  }
}
```

### **Voice Command Integration**
```css
.voice-commands-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 24px 32px 24px;
  background: linear-gradient(
    180deg, 
    rgba(26, 26, 46, 0) 0%, 
    rgba(26, 26, 46, 0.95) 100%
  );
}

.voice-command-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 8px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  min-height: 48px; /* Accessibility touch target */
  
  .voice-icon {
    width: 20px;
    height: 20px;
    margin-right: 12px;
    color: #6c5ce7;
  }
  
  .command-text {
    font-size: 14px;
    color: #b2bec3;
    flex: 1;
  }
  
  .chevron-icon {
    width: 16px;
    height: 16px;
    color: #636e72;
  }
}
```

---

## 📱 **Screen 2: Case Detail**

### **Layout Structure**
```
┌─────────────────────────────────────────┐
│        The Whitechapel Mystery          │ ← Hero Title Section
│                                         │   (Background image with overlay)
│  ← Back                              ⚙️ │   (300px height)
│                                         │
│    [Atmospheric Victorian street image] │
│                                         │
├─────────────────────────────────────────┤
│  ╭─ Case Stats ─────────────────────────╮ │
│  │ ⭐⭐⭐⭐ Difficulty                 │ │ ← Stats Row (80px)
│  │ ⏱️ 45 min │ 📖 Ch 2/5 │ 🎯 40%    │ │
│  ╰─────────────────────────────────────╯ │
├─────────────────────────────────────────┤
│                                         │
│  Case Description                       │ ← Content Section
│  A gruesome murder has shaken the       │   (Scrollable)
│  fog-bound streets of Whitechapel...    │
│                                         │
│  Key Characters                         │
│  ┌─────────────────────────────────────┐ │
│  │ 👤 Sherlock Holmes                  │ │
│  │    Consulting Detective             │ │
│  └─────────────────────────────────────┘ │
│  ┌─────────────────────────────────────┐ │
│  │ 👮 Inspector Lestrade              │ │
│  │    Scotland Yard Inspector          │ │
│  └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│  ╭─ Progress ────────────────────────── ╮ │ ← Progress Section (60px)
│  │ Chapter 2 of 5                      │ │
│  │ ████████████░░░░░░░░ 40%            │ │
│  ╰─────────────────────────────────────╯ │
├─────────────────────────────────────────┤
│  ╭─────────────────────────────────────╮ │ ← Action Buttons
│  │  ▶️ Continue Investigation           │ │   (150px)
│  ╰─────────────────────────────────────╯ │
│  🎤 Say 'Play' to start                 │
│  📝 Say 'Review' for case notes         │
└─────────────────────────────────────────┘
```

### **Component Specifications**

#### **Hero Section with Background**
```css
.case-detail-hero {
  position: relative;
  height: 300px;
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.hero-background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    180deg,
    rgba(26, 26, 46, 0.3) 0%,
    rgba(26, 26, 46, 0.8) 50%,
    rgba(26, 26, 46, 0.95) 100%
  );
}

.hero-header {
  position: relative;
  z-index: 2;
  padding: 44px 24px 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hero-title {
  position: relative;
  z-index: 2;
  padding: 0 24px 24px 24px;
  
  .case-title {
    font-size: 32px;
    font-weight: 700;
    line-height: 1.2;
    color: #ffffff;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
    margin-bottom: 8px;
  }
}
```

#### **Stats Row Component**
```css
.case-stats-row {
  display: flex;
  gap: 8px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.05);
}

.stat-badge {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 8px 12px;
  min-height: 44px; /* Accessibility */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  
  .stat-label {
    font-size: 12px;
    color: #636e72;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .stat-value {
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.difficulty-stars {
  display: flex;
  gap: 1px;
  
  .star-filled { color: #fdcb6e; }
  .star-empty { color: #636e72; }
}
```

#### **Character Cards**
```css
.characters-section {
  padding: 0 24px;
  margin: 24px 0;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 16px;
  line-height: 1.2;
}

.character-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin-bottom: 12px;
  min-height: 72px; /* Accessibility */
  
  &:focus, &:hover {
    border-color: #6c5ce7;
    background: rgba(108, 92, 231, 0.1);
  }
}

.character-avatar {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  margin-right: 16px;
  border: 2px solid #6c5ce7;
  background-size: cover;
  background-position: center;
}

.character-info {
  flex: 1;
  
  .character-name {
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    line-height: 1.2;
    margin-bottom: 4px;
  }
  
  .character-role {
    font-size: 14px;
    color: #b2bec3;
    line-height: 1.2;
  }
}
```

#### **Progress Indicator**
```css
.progress-section {
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.03);
}

.progress-title {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 12px;
}

.progress-bar-container {
  background: rgba(255, 255, 255, 0.1);
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #6c5ce7 0%, #a29bfe 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
  
  /* Accessibility: Ensure progress is announced */
  &[aria-valuenow] {
    position: relative;
  }
}
```

#### **Action Buttons**
```css
.actions-container {
  position: sticky;
  bottom: 0;
  padding: 16px 24px 32px 24px;
  background: linear-gradient(
    180deg,
    rgba(26, 26, 46, 0) 0%,
    rgba(26, 26, 46, 0.95) 100%
  );
}

.primary-action-button {
  width: 100%;
  height: 56px; /* Accessible touch target */
  background: linear-gradient(135deg, #6c5ce7 0%, #5f3dc4 100%);
  border: none;
  border-radius: 16px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(108, 92, 231, 0.4);
  
  &:hover, &:focus {
    background: linear-gradient(135deg, #5f3dc4 0%, #4c63d2 100%);
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(108, 92, 231, 0.5);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  /* Focus state for accessibility */
  &:focus {
    outline: 2px solid #ffffff;
    outline-offset: 2px;
  }
}

.voice-command-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 48px;
  padding: 0 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #b2bec3;
  font-size: 14px;
  margin-bottom: 8px;
  
  &:hover, &:focus {
    border-color: #6c5ce7;
    background: rgba(108, 92, 231, 0.1);
  }
}
```

---

## 📱 **Screen 3: Active Investigation**

### **Layout Structure**
```
┌─────────────────────────────────────────┐
│ ← Back    Baker Street Study        ⏸️  │ ← Header (88px)
│           Chapter 2 • 45min             │
├─────────────────────────────────────────┤
│ 🎯 Question Holmes about evidence       │ ← Objective Banner (60px)
│                                    ✖️   │
├─────────────────────────────────────────┤
│                                         │
│           👤 Character Area             │ ← Character Interaction
│        [Sherlock Holmes Avatar]         │   (300px)
│             🔊 Speaking                 │
│                                         │
│    ▂▄▆█▆▄▂▄▆█▆▄▂▄▆█▆▄▂               │ ← Audio Waveform (60px)
│       "Elementary, my dear..."          │
│                                         │
├─────────────────────────────────────────┤
│                                    📊   │ ← Side Panel (Evidence)
│                                    🔪   │   (Floating, 120px wide)
│                                    📜   │
│                                    ⌚   │
│                                    ⋯   │
├─────────────────────────────────────────┤
│        🎤                              │ ← Controls (100px)
│      [Recording]                        │
│   ⏸️        ⏭️                         │
├─────────────────────────────────────────┤
│ 🎤 Say your response or tap to type     │ ← Voice Hint (50px)
└─────────────────────────────────────────┘
```

### **Component Specifications**

#### **Investigation Header**
```css
.investigation-header {
  height: 88px;
  padding: 44px 24px 16px 24px;
  background: linear-gradient(
    180deg,
    rgba(22, 33, 62, 0.95) 0%,
    rgba(15, 52, 96, 0.95) 100%
  );
  display: flex;
  align-items: center;
}

.header-left, .header-right {
  flex: 1;
}

.header-center {
  flex: 2;
  text-align: center;
}

.location-text {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.2;
  margin-bottom: 2px;
}

.chapter-info {
  font-size: 12px;
  color: #b2bec3;
  line-height: 1.2;
}
```

#### **Objective Banner**
```css
.objective-banner {
  margin: 16px 24px;
  padding: 16px;
  background: rgba(108, 92, 231, 0.1);
  border: 1px solid rgba(108, 92, 231, 0.3);
  border-left: 4px solid #6c5ce7;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.objective-icon {
  width: 16px;
  height: 16px;
  color: #6c5ce7;
  flex-shrink: 0;
}

.objective-text {
  flex: 1;
  font-size: 14px;
  color: #ffffff;
  line-height: 1.4;
}

.objective-close {
  width: 20px;
  height: 20px;
  color: #636e72;
  cursor: pointer;
  
  &:hover, &:focus {
    color: #b2bec3;
  }
}
```

#### **Character Interaction Zone**
```css
.character-interaction-zone {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  min-height: 300px;
}

.character-avatar-container {
  position: relative;
  margin-bottom: 24px;
}

.character-main-avatar {
  width: 120px;
  height: 120px;
  border-radius: 60px;
  border: 4px solid #6c5ce7;
  background-size: cover;
  background-position: center;
  position: relative;
  
  /* Animated border for speaking state */
  &.speaking {
    animation: pulse-border 2s infinite;
  }
}

@keyframes pulse-border {
  0%, 100% {
    border-color: #6c5ce7;
    box-shadow: 0 0 0 0 rgba(108, 92, 231, 0.4);
  }
  50% {
    border-color: #a29bfe;
    box-shadow: 0 0 0 8px rgba(108, 92, 231, 0);
  }
}

.speaking-indicator {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: #6c5ce7;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 1s infinite;
}

.character-name-display {
  text-align: center;
  
  .name {
    font-size: 18px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 4px;
  }
  
  .role {
    font-size: 14px;
    color: #b2bec3;
  }
}
```

#### **Audio Waveform Visualization**
```css
.audio-visualization-container {
  width: 100%;
  padding: 0 24px;
  margin: 16px 0;
}

.audio-label {
  text-align: center;
  font-size: 14px;
  color: #b2bec3;
  margin-bottom: 16px;
}

.waveform-container {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: 40px;
  gap: 2px;
}

.waveform-bar {
  width: 3px;
  background: #636e72;
  border-radius: 1.5px;
  transition: all 0.1s ease;
  
  &.active {
    background: linear-gradient(180deg, #6c5ce7 0%, #a29bfe 100%);
  }
  
  /* Bars animate with different delays for wave effect */
  &:nth-child(odd) { animation-delay: 0.1s; }
  &:nth-child(even) { animation-delay: 0.05s; }
}

@keyframes waveform-pulse {
  0%, 100% { height: 4px; }
  50% { height: 32px; }
}

.waveform-bar.active {
  animation: waveform-pulse 0.6s infinite;
}
```

#### **Evidence Sidebar**
```css
.evidence-sidebar {
  position: absolute;
  right: 16px;
  top: 40%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 8px;
  width: 60px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.sidebar-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #636e72;
  text-align: center;
  margin-bottom: 12px;
}

.evidence-item {
  width: 44px;
  height: 44px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  cursor: pointer;
  
  &:hover, &:focus {
    border-color: #6c5ce7;
    background: rgba(108, 92, 231, 0.2);
  }
  
  .evidence-icon {
    width: 20px;
    height: 20px;
    color: #b2bec3;
  }
}

.evidence-more {
  border-style: dashed;
  border-color: rgba(255, 255, 255, 0.3);
}
```

#### **Control Panel**
```css
.controls-container {
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(22, 33, 62, 0.8);
}

.microphone-button {
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background: linear-gradient(135deg, #6c5ce7 0%, #5f3dc4 100%);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(108, 92, 231, 0.4);
  
  &.recording {
    background: linear-gradient(135deg, #e17055 0%, #d63031 100%);
    animation: pulse 1s infinite;
  }
  
  &:hover, &:focus {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(108, 92, 231, 0.5);
  }
  
  .mic-icon {
    width: 32px;
    height: 32px;
    color: #ffffff;
  }
}

.control-buttons {
  display: flex;
  gap: 16px;
}

.control-button {
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover, &:focus {
    background: rgba(255, 255, 255, 0.2);
    border-color: #6c5ce7;
  }
  
  .control-icon {
    width: 24px;
    height: 24px;
    color: #b2bec3;
  }
}
```

#### **Voice Hint Footer**
```css
.voice-hint-container {
  padding: 16px 24px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.voice-hint-text {
  text-align: center;
  font-size: 14px;
  color: #636e72;
  line-height: 1.4;
  
  &.listening {
    color: #6c5ce7;
    font-weight: 500;
  }
}
```

---

## ♿ **Accessibility Enhancements**

### **High Contrast Mode**
```css
@media (prefers-contrast: high) {
  :root {
    --text-primary: #ffffff;
    --text-secondary: #ffffff;
    --border-light: rgba(255, 255, 255, 0.4);
    --border-medium: rgba(255, 255, 255, 0.6);
    --surface-primary: rgba(255, 255, 255, 0.15);
  }
  
  .world-card, .character-card, .evidence-item {
    border-width: 2px;
  }
}
```

### **Reduced Motion Support**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .character-main-avatar.speaking {
    animation: none;
    border-color: #a29bfe; /* Static highlight instead of animation */
  }
  
  .waveform-bar.active {
    animation: none;
    height: 24px; /* Static height instead of pulsing */
  }
}
```

### **Large Text Mode Support**
```css
@media (prefers-font-size: large) {
  :root {
    --text-xs: 16px;
    --text-sm: 18px;
    --text-base: 20px;
    --text-lg: 22px;
    --text-xl: 24px;
    --text-2xl: 28px;
    --text-3xl: 32px;
    --text-4xl: 36px;
  }
  
  .touch-target {
    min-width: 56px;
    min-height: 56px;
  }
}
```

### **Focus Management**
```css
/* Enhanced focus indicators for keyboard navigation */
*:focus {
  outline: 2px solid #6c5ce7;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Skip to main content link for keyboard users */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #6c5ce7;
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1000;
  
  &:focus {
    top: 6px;
  }
}
```

---

## 🎨 **Animation & Transitions**

### **Screen Transitions**
```css
/* Page transition animations */
.screen-enter {
  opacity: 0;
  transform: translateY(20px);
}

.screen-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 300ms ease, transform 300ms ease;
}

.screen-exit {
  opacity: 1;
  transform: translateY(0);
}

.screen-exit-active {
  opacity: 0;
  transform: translateY(-20px);
  transition: opacity 300ms ease, transform 300ms ease;
}
```

### **Interactive Feedback**
```css
/* Button press animations */
.interactive-element {
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.98);
  }
}

/* Voice command success animation */
@keyframes command-success {
  0% { 
    background-color: rgba(0, 184, 148, 0.2);
    transform: scale(1);
  }
  50% { 
    background-color: rgba(0, 184, 148, 0.4);
    transform: scale(1.02);
  }
  100% { 
    background-color: rgba(0, 184, 148, 0);
    transform: scale(1);
  }
}

.command-success {
  animation: command-success 0.6s ease;
}
```

---

## 📊 **Responsive Design Considerations**

### **Device Adaptation**
```css
/* Small devices (iPhone SE, etc.) */
@media (max-width: 375px) {
  .world-card {
    margin: 0 16px 12px 16px;
  }
  
  .character-main-avatar {
    width: 100px;
    height: 100px;
  }
  
  .microphone-button {
    width: 70px;
    height: 70px;
  }
}

/* Large devices (iPhone Pro Max, etc.) */
@media (min-width: 428px) {
  .world-card {
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
  }
}

/* Tablet landscape mode */
@media (orientation: landscape) and (min-width: 768px) {
  .investigation-layout {
    flex-direction: row;
  }
  
  .character-interaction-zone {
    flex: 2;
  }
  
  .evidence-sidebar {
    position: relative;
    right: auto;
    top: auto;
    flex: 0 0 200px;
    width: auto;
    height: fit-content;
  }
}
```

This comprehensive screen design specification provides a complete foundation for implementing AudioVR's accessibility-first mobile interface. Every element is designed to work seamlessly with voice commands while maintaining visual appeal and usability for all users.
