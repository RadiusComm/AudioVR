# AudioVR - Voice-Driven Virtual Reality Storytelling Platform

## 🎯 Project Overview
- **Name**: AudioVR
- **Goal**: Create an immersive audio-first virtual reality storytelling platform that merges narrative gameplay with real-time conversational AI
- **Features**: Voice-driven gameplay, multi-genre worlds, AI-powered character conversations, evidence locker system, user progression

## 🌐 URLs
- **Development**: https://3000-ipmbxxfzcw6uaj7qzht2b-6532622b.e2b.dev
- **API Health Check**: https://3000-ipmbxxfzcw6uaj7qzht2b-6532622b.e2b.dev/api/worlds
- **Production**: *To be deployed to audiovr.pages.dev*
- **GitHub**: *To be configured*

## ✅ Currently Completed Features

### 1. **World Selection System**
- 7 themed genre worlds with unique visual styles
  - Detective (Gold) - Noir-style investigations
  - Horror (Red) - Dark mysteries
  - Sci-Fi (Cyan) - Futuristic adventures
  - Fantasy (Purple) - Magical quests  
  - Space (Blue) - Cosmic exploration
  - Historical (Bronze) - Time travel mysteries
  - Pirate (Crimson) - High seas adventures
- Animated world cards with hover effects
- Voice or click selection

### 2. **Desk Hub Environment**
- Themed desk scenes per world
- Message objects (folders, scrolls, data cubes)
- Case selection interface
- Visual theming with world-specific colors

### 3. **Case/Scene System**
- Case loading from database
- Branching narrative structure support
- Character dialogue system
- Transcript logging
- Optional text input alongside voice

### 4. **Evidence Locker (Inbox)**
- Store discovered clues
- Replay dialogue transcripts
- Premium analysis feature (costs balance)
- Organized by case and world

### 5. **User System**
- Automatic user profile creation
- Balance currency system
- Rank progression (Rookie → Detective → Inspector)
- Session persistence and restoration

### 6. **Database Architecture**
- D1 SQLite database schema
- Tables: profiles, cases, clues, user_progress, inbox, sessions
- Proper foreign key relationships
- Indexed for performance

### 7. **API Endpoints**
- `/api/profile/:userId` - Get/create user profile
- `/api/worlds` - Get all available worlds
- `/api/cases/:world` - Get cases for specific world
- `/api/cases/:caseId/start` - Start a new case
- `/api/dialogue/save` - Save conversation history
- `/api/inbox/:userId` - Get user's evidence locker
- `/api/clues/:clueId/analyze` - Analyze clue (premium)
- `/api/session/save` - Save current session
- `/api/session/restore/:userId` - Restore previous session
- `/api/audio/generate` - Generate custom audio for clues (ElevenLabs TTS)
- `/api/voices` - Get available ElevenLabs voices

### 8. **UI/UX Features**
- Glassmorphic design with blur effects
- Responsive layout (mobile-friendly)
- Top HUD with balance, rank, and sign-out
- Smooth animations and transitions
- Dark theme optimized for immersion

### 9. **ElevenLabs Conversational AI Integration**
- Widget embedded with agent ID: `agent_2901k5ce2hyrendtmhzd8r2ayyk5`
- Context-aware visibility (hidden on world selection, visible in cases)
- Message event listeners for transcript synchronization
- Custom styling for dark theme consistency
- Ready for voice interactions

## 📊 Data Architecture

### Data Models:
- **Profile**: User data, rank, balance, territories
- **Case**: Story content, difficulty, rewards
- **Clue**: Evidence items, dialogue, voice data
- **UserProgress**: Case completion tracking
- **Inbox**: Evidence locker items
- **Session**: Save/resume functionality

### Storage Services:
- **D1 Database**: Primary data storage (user profiles, cases, clues)
- **KV Namespace**: Fast session caching
- **R2 Bucket**: Media file storage (audio, images)

### Data Flow:
1. User selects world → Load cases from D1
2. Start case → Create progress entry
3. Discover clues → Add to inbox
4. Save dialogue → Store in progress history
5. Session saves → KV for speed, D1 for persistence

## 📚 User Guide

### Getting Started:
1. Visit the AudioVR platform
2. Your profile is automatically created
3. Select a world from the grid
4. Choose a case from your desk
5. Speak naturally to AI characters
6. Collect clues and solve mysteries

### Navigation:
- **World Selection**: Main menu with 7 genre cards
- **Desk Hub**: Case selection for current world
- **Case Scene**: Active dialogue and clue discovery
- **Evidence Locker**: Review collected evidence
- **Sign Out**: Save progress and exit (top-right)

### Gameplay Tips:
- Speak naturally - no commands needed
- Check your evidence locker for clues
- Balance is earned by solving cases
- Premium analysis reveals hidden connections
- Progress saves automatically

## 🚧 Features Not Yet Implemented

1. **~~ElevenLabs Integration~~** ✅ **COMPLETED**
   - Widget integrated with agent ID: `agent_2901k5ce2hyrendtmhzd8r2ayyk5`
   - Auto-hide/show based on scene context
   - Message event listeners configured
   - Transcript synchronization ready

2. **Content Creation**
   - Full case scripts with branching logic
   - Character personalities and memories
   - Voice recordings for NPCs

3. **Advanced Features**
   - Territory unlocking system
   - Achievement tracking
   - Leaderboards
   - Multiplayer investigations

4. **Monetization**
   - Payment processing integration
   - Premium case packs
   - Subscription tiers

## 🔮 Recommended Next Steps

### Immediate Priority:
1. **~~Configure ElevenLabs Widget~~** ✅ **COMPLETED**
   - Agent integrated: `agent_2901k5ce2hyrendtmhzd8r2ayyk5`
   - Widget embedded and styled
   - Event listeners configured

2. **Create Sample Content**
   - Write 2-3 complete cases per world
   - Design branching dialogue trees
   - Record character voice samples

3. **Deploy to Production**
   - Configure Cloudflare Pages
   - Set up custom domain
   - Add environment variables

### Future Enhancements:
1. **Mobile App Development**
   - React Native version
   - Offline mode support
   - Push notifications

2. **VR Integration**
   - WebXR support
   - Spatial audio
   - Hand tracking

3. **Content Management System**
   - Admin panel for case creation
   - Analytics dashboard
   - User feedback system

## 🚀 Deployment

### Platform: 
- **Cloudflare Pages** (Edge deployment)
- **Status**: ✅ Development Active
- **Tech Stack**: Hono + TypeScript + Vanilla JS + TailwindCSS
- **Last Updated**: 2025-09-17

### Environment Variables Configured:
```env
# ElevenLabs API Key (configured in .dev.vars)
ELEVENLABS_API_KEY=✅ Configured

# Optional integrations
SUPABASE_URL=your_supabase_url (optional)
SUPABASE_ANON_KEY=your_supabase_key (optional)
```

### ElevenLabs Configuration:
- **Agent ID**: `agent_2901k5ce2hyrendtmhzd8r2ayyk5` (embedded in HTML)
- **API Key**: ✅ Configured in `.dev.vars` for server-side features
- **Widget Source**: `https://unpkg.com/@elevenlabs/convai-widget-embed`
- **Integration**: Automatic with message event listeners
- **Server Features**: Audio generation, voice listing, custom TTS

### Deployment Commands:
```bash
# Build project
npm run build

# Deploy to Cloudflare Pages
npm run deploy

# Create D1 database (production)
npx wrangler d1 create audiovr-db

# Apply migrations
npx wrangler d1 migrations apply audiovr-db

# Add secrets (API key already configured locally)
npx wrangler pages secret put ELEVENLABS_API_KEY --project-name audiovr
# When prompted, enter: 9edb698d39ffb153c2734d49cdd16f68edf910d4924e72c832da3d853bc3e02d
```

## 📝 Development Notes

### Known Limitations:
- D1 database is in beta (size limits apply)
- Wrangler requires "MEDIA_STORAGE" instead of "ASSETS" (reserved name)
- Static files must be in `dist/static/` for proper serving

### Testing:
- Use `pm2 logs audiovr --nostream` to check logs
- Test API endpoints with curl or browser
- Session persistence works via localStorage

### Architecture Decisions:
- Vanilla JS frontend for simplicity and performance
- Hono backend for lightweight edge computing
- D1 for data persistence without external dependencies
- Glassmorphic UI for immersive experience

---

*AudioVR v1.0 - Built with Hono, Cloudflare Workers, and ElevenLabs AI*