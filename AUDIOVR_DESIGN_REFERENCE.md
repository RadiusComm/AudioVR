# AudioVR Design Reference Guide
## Complete Application Summary for Website & App Development

---

## 🎯 Executive Overview

**AudioVR** is a voice-first virtual reality storytelling platform that revolutionizes narrative gaming by replacing traditional UI with natural conversation. Players speak directly to AI-driven characters to solve mysteries across seven immersive genre worlds.

### Core Value Proposition
- **No menus, no buttons** - just natural speech
- **Real-time AI conversations** with unique characters
- **Immersive audio-first** experience
- **Multi-genre storytelling** (Horror, Detective, Sci-Fi, Fantasy, Space, Historical, Pirate)

---

## 🎨 Visual Design System

### Color Palette by World

| World | Primary Color | Accent Color | Message Object | Visual Theme |
|-------|--------------|--------------|----------------|--------------|
| **Detective** | #C19A6B | Warm Gold | Manila folders | Film noir, 1940s aesthetic |
| **Horror** | #B03030 | Blood Red | Tattered files | Gothic, dark Victorian |
| **Sci-Fi** | #00C0C0 | Electric Cyan | Data cubes | Neon cyberpunk, holographic |
| **Fantasy** | #6A0DAD | Royal Purple | Sealed scrolls | Medieval illuminated manuscripts |
| **Space** | #4169E1 | Stellar Blue | Magnetic cartridges | NASA retro-futurism |
| **Historical** | #B08D57 | Antique Bronze | Wax-sealed letters | Aged parchment, sepia tones |
| **Pirate** | #A52A2A | Deep Crimson | Treasure maps | Weathered nautical charts |

### UI Design Principles

#### Glassmorphism Effects
```css
/* Glass Card Standard */
background: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.1);
box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
```

#### Typography
- **Primary Font**: Inter (300, 400, 500, 600, 700)
- **Headers**: Bold 600-700 weight
- **Body**: Regular 400 weight
- **Captions**: Light 300 weight

#### Animation Standards
- **Transitions**: 0.3s cubic-bezier(0.4, 0, 0.2, 1)
- **Hover Effects**: translateY(-5px) scale(1.02)
- **Fade In**: 0.5s ease-in-out
- **Pulse Glow**: 2s infinite for active elements

---

## 🏗️ Information Architecture

### 1. World Selection Screen
**Purpose**: Entry point for genre selection

**Layout**:
- Grid of 7 world cards (responsive: 1-4 columns)
- Each card shows:
  - World icon (emoji/SVG)
  - World name
  - Brief description
  - Difficulty indicator
  - Available cases count

**Interaction**:
- Click/tap to select
- Voice command: "Select [World Name]"
- Hover shows expanded description
- Selected world glows with accent color

### 2. Desk Hub Interface
**Purpose**: Case selection within chosen world

**Visual Elements**:
- Themed background (changes per world)
- 3D perspective desk surface
- Message objects scattered naturally
- Ambient lighting matching world color
- Parallax depth on mouse/device movement

**Components**:
- Case objects (folders, scrolls, cubes, etc.)
- Top HUD bar (persistent)
- Evidence locker button (bottom right)
- World indicator (top left)

### 3. Case/Scene Mode
**Purpose**: Active gameplay with AI conversation

**Layout Structure**:
```
┌─────────────────────────────────┐
│         Top HUD Bar             │
├─────────────────────────────────┤
│                                 │
│     Character Portrait/         │
│     Visual Scene                │
│                                 │
├─────────────────────────────────┤
│   ElevenLabs Widget (Voice UI)  │
├─────────────────────────────────┤
│   Transcript Drawer             │
├─────────────────────────────────┤
│   Discovered Clues Grid         │
└─────────────────────────────────┘
```

### 4. Evidence Locker (Inbox)
**Purpose**: Review collected clues and evidence

**Features**:
- Grid/list view toggle
- Filter by world/case
- Search functionality
- Clue details modal
- Audio replay option
- Analysis purchase (premium)

---

## 🔊 Voice Interaction Design

### ElevenLabs Integration Points
1. **Widget Placement**: Center of case scene
2. **Visibility Logic**:
   - Hidden: World selection, desk hub, menus
   - Visible: Active case scenes only
3. **Voice Indicators**:
   - Listening: Pulsing blue ring
   - Processing: Spinning animation
   - Speaking: Waveform visualization

### Conversation Flow
```
Initial Prompt → User Speaks → AI Processes → Character Responds
                      ↑                              ↓
                      ← Unlock Clues ← Trigger Conditions
```

---

## 📱 Responsive Design Breakpoints

### Mobile (< 768px)
- Single column world grid
- Full-screen case scenes
- Bottom sheet for transcript
- Simplified HUD
- Touch-optimized interactions

### Tablet (768px - 1024px)
- 2-column world grid
- Split view for case/transcript
- Floating evidence button
- Gesture controls enabled

### Desktop (> 1024px)
- 3-4 column world grid
- Full glassmorphic effects
- Keyboard shortcuts active
- Multi-panel layouts
- Enhanced parallax effects

---

## 🎮 User Journey Maps

### New Player Flow
1. **Onboarding** → Auto-create profile
2. **World Selection** → Choose genre
3. **Tutorial Case** → Learn voice mechanics
4. **First Case** → Guided experience
5. **Progress Loop** → Unlock harder cases

### Returning Player Flow
1. **Session Restore** → Continue where left off
2. **Desk Hub** → Resume current world
3. **Case Selection** → Pick new or continue
4. **Evidence Review** → Check previous clues
5. **Progress** → Complete and unlock

---

## 💾 Data Structure for UI

### User Profile Object
```json
{
  "userId": "unique_id",
  "name": "Player Name",
  "rank": "Detective",
  "balance": 500,
  "currentWorld": "horror",
  "territoriesUnlocked": ["europe", "asia"],
  "achievements": [...]
}
```

### Case Display Object
```json
{
  "caseId": "hor_003",
  "title": "The Count's Last Supper",
  "description": "Prevent resurrection...",
  "difficulty": 3,
  "estimatedTime": "45-60 min",
  "reward": "Vampire Relic",
  "backgroundImage": "url",
  "primaryColor": "#3B1C1C",
  "isLocked": false,
  "progress": 45
}
```

### Clue Object
```json
{
  "clueId": "hor_003_c1",
  "title": "Crypt Investigation",
  "content": "The coffin is shattered...",
  "character": "Lucien Drax",
  "messageType": "tattered-file",
  "isPremium": false,
  "isAnalyzed": false
}
```

---

## 🎯 UI Component Library

### Essential Components

#### 1. WorldCard
- World icon and name
- Color-coded border
- Hover glow effect
- Case count badge
- Lock indicator if needed

#### 2. CaseObject
- World-specific visual (folder, scroll, etc.)
- Difficulty stars
- Completion checkmark
- Hover animation
- Click to start

#### 3. TranscriptLine
- Speaker name
- Message text
- Timestamp
- User/NPC distinction
- Auto-scroll

#### 4. ClueCard
- Evidence type icon
- Title and description
- Premium badge if applicable
- Analysis button
- Cost display

#### 5. BalanceIndicator
- Coin icon
- Current balance
- Animation on change
- Purchase prompt
- History tooltip

---

## 🔄 State Management Requirements

### Global State
- User profile
- Current world
- Active case
- Session data
- Balance/rank
- Unlocked content

### Local State
- Transcript history
- Current scene
- Widget visibility
- UI preferences
- Animation states

### Persistent Storage
- User ID (localStorage)
- Session token
- Preferences
- Audio settings
- Progress cache

---

## 🎨 Visual Asset Requirements

### Per World Assets Needed
1. **Background Images** (1920x1080)
   - Desk scene background
   - Case scene environments
   - Blur overlay versions

2. **Message Objects** (SVG/PNG)
   - World-specific items
   - Hover/active states
   - Shadow versions

3. **Character Portraits** (512x512)
   - NPC avatars
   - Expression variants
   - Silhouettes for mystery

4. **Icons** (64x64)
   - World emblems
   - Achievement badges
   - Currency symbols
   - Status indicators

---

## 📊 Performance Optimization Guidelines

### Loading Strategy
1. **Lazy load** world backgrounds
2. **Preload** audio for current case
3. **Cache** frequently used assets
4. **Progressive** image loading
5. **Code split** by world/feature

### Animation Performance
- Use CSS transforms over position
- GPU-accelerated properties only
- RequestAnimationFrame for JS animations
- Throttle scroll/resize events
- Reduce blur radius on mobile

---

## 🔐 Security & Privacy Considerations

### Client-Side
- No sensitive data in localStorage
- Sanitize all user inputs
- HTTPS only for API calls
- CSP headers configured

### Voice Privacy
- Microphone permission handling
- Clear recording indicators
- No local voice storage
- Opt-out options available

---

## 📱 Platform-Specific Considerations

### Web Application
- PWA capabilities
- Offline mode for played content
- Browser compatibility (Chrome, Safari, Firefox)
- WebGL for advanced effects

### Mobile App (Future)
- Native voice integration
- Push notifications for new cases
- Biometric authentication
- Background audio support

### VR/AR (Future)
- Spatial audio positioning
- Hand tracking for selection
- Eye tracking for focus
- Room-scale experiences

---

## 🚀 Deployment Architecture

### Current Stack
- **Frontend**: Vanilla JS + TailwindCSS
- **Backend**: Hono on Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2
- **Voice AI**: ElevenLabs Widget
- **Hosting**: Cloudflare Pages

### API Endpoints for UI
```
GET  /api/worlds           - List all worlds
GET  /api/cases/:world     - Get cases for world  
POST /api/cases/:id/start  - Start a case
POST /api/dialogue/save    - Save conversation
GET  /api/inbox/:userId    - Get evidence locker
POST /api/clues/:id/analyze - Analyze clue
GET  /api/profile/:userId  - Get user profile
POST /api/session/save     - Save progress
GET  /api/session/restore  - Restore session
```

---

## 🎯 Success Metrics for UI/UX

### Engagement Metrics
- Time to first voice interaction
- Average session duration
- Cases completed per session
- Voice vs text input ratio

### Usability Metrics
- Tutorial completion rate
- Error recovery success
- Feature discovery rate
- Navigation efficiency

### Business Metrics
- Premium analysis conversion
- Balance spending patterns
- World exploration rate
- Return player percentage

---

## 📝 Design Dos and Don'ts

### ✅ DO
- Maintain voice-first philosophy
- Keep UI minimal and unobtrusive
- Use world colors consistently
- Animate state changes smoothly
- Provide visual feedback for voice
- Make text optional, not required

### ❌ DON'T
- Add unnecessary UI elements
- Block voice interaction with modals
- Use jarring transitions
- Require text input
- Hide critical information
- Break immersion with ads

---

## 🔮 Future Design Considerations

### Phase 2 Features
- Multiplayer investigation mode
- Custom case creator
- Voice training for NPCs
- Achievement showcase
- Social features (carefully)

### Phase 3 Expansions
- New worlds quarterly
- Seasonal events
- Cross-world narratives
- Player-generated content
- Voice actor collaborations

---

*This design reference guide should be used as the single source of truth for all AudioVR UI/UX development across web, mobile, and future platforms.*

**Last Updated**: 2025-09-17
**Version**: 1.0
**Platform**: AudioVR