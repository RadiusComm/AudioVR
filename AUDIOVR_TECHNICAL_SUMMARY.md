# AudioVR Technical Implementation Summary

## 🏗️ Application Architecture Overview

### Technology Stack
```
┌─────────────────────────────────────┐
│         Frontend Layer              │
│   Vanilla JS + TailwindCSS          │
│   ElevenLabs Widget Integration     │
└──────────────┬──────────────────────┘
               │ HTTPS/REST
┌──────────────▼──────────────────────┐
│         Backend Layer               │
│   Hono Framework on CF Workers      │
│   Edge Computing (Global)           │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Data Layer                  │
│   D1 (SQLite) + KV + R2             │
│   Cloudflare Infrastructure         │
└─────────────────────────────────────┘
```

---

## 📁 Project Structure

```
audiovr/
├── src/
│   └── index.tsx           # Main Hono backend application
├── public/
│   └── static/
│       ├── app.js         # Frontend application logic
│       └── style.css      # Custom styles
├── migrations/
│   └── 0001_initial_schema.sql  # Database schema
├── dist/                  # Build output directory
│   ├── _worker.js        # Compiled backend
│   ├── _routes.json      # Routing configuration
│   └── static/           # Static assets
├── .dev.vars             # Local environment variables
├── wrangler.jsonc        # Cloudflare configuration
├── ecosystem.config.cjs  # PM2 process management
├── package.json          # Dependencies and scripts
└── README.md            # Documentation
```

---

## 🗄️ Database Schema

### Core Tables

#### 1. profiles
```sql
- id (PRIMARY KEY)
- user_id (UNIQUE)
- email
- name
- rank (Rookie/Detective/Inspector/Chief)
- balance (virtual currency)
- current_world
- territories_unlocked (JSON)
- achievements (JSON)
- created_at
- updated_at
```

#### 2. cases
```sql
- id (PRIMARY KEY)
- case_id (UNIQUE)
- world (detective/horror/scifi/fantasy/space/historical/pirate)
- title
- description
- difficulty (1-5)
- min_rank
- reward_balance
- script_json (dialogue trees, prompts)
- prerequisites (JSON)
- is_premium
- is_locked
- created_at
```

#### 3. clues
```sql
- id (PRIMARY KEY)
- clue_id (UNIQUE)
- case_id (FOREIGN KEY)
- world
- message_type (folder/scroll/data_cube/etc)
- title
- content
- character_name
- voice_id
- transcript
- audio_url
- is_premium
- analysis_cost
- unlock_condition (JSON)
- created_at
```

#### 4. user_progress
```sql
- id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- case_id (FOREIGN KEY)
- world
- status (started/in_progress/completed/failed)
- clues_found (JSON)
- dialogue_history (JSON)
- current_scene
- choices_made (JSON)
- completion_time
- started_at
- completed_at
```

#### 5. inbox
```sql
- id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- clue_id (FOREIGN KEY)
- case_id (FOREIGN KEY)
- world
- is_analyzed
- analysis_notes
- acquired_at
```

#### 6. sessions
```sql
- id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- session_token (UNIQUE)
- world
- case_id
- scene_state (JSON)
- last_activity
```

---

## 🔌 API Endpoints

### Authentication & Profile
```http
GET  /api/profile/:userId
     Returns: User profile with rank, balance, progress
```

### World & Case Management
```http
GET  /api/worlds
     Returns: All 7 worlds with metadata

GET  /api/cases/:world
     Headers: X-User-Id
     Returns: Cases for specific world with user progress

POST /api/cases/:caseId/start
     Body: { userId }
     Returns: Case details and initial clues
```

### Dialogue & Progress
```http
POST /api/dialogue/save
     Body: { userId, caseId, dialogue }
     Returns: Success status

POST /api/session/save
     Body: { userId, world, caseId, sceneState }
     Returns: Session token

GET  /api/session/restore/:userId
     Returns: Last session state
```

### Evidence & Analysis
```http
GET  /api/inbox/:userId
     Returns: User's collected evidence

POST /api/clues/:clueId/analyze
     Body: { userId }
     Returns: Analysis results (deducts balance)
```

### Audio Generation (Server-side)
```http
POST /api/audio/generate
     Body: { text, voiceId, clueId }
     Returns: Audio file or storage key

GET  /api/voices
     Returns: Available ElevenLabs voices
```

---

## 🎙️ ElevenLabs Integration

### Widget Configuration
```html
<elevenlabs-convai 
  agent-id="agent_2901k5ce2hyrendtmhzd8r2ayyk5">
</elevenlabs-convai>

<script 
  src="https://unpkg.com/@elevenlabs/convai-widget-embed" 
  async>
</script>
```

### API Key Usage
- **Location**: `.dev.vars` file
- **Key**: `ELEVENLABS_API_KEY`
- **Usage**: Server-side TTS generation, voice listing

### Voice Interaction Flow
1. User enters case scene
2. Widget becomes visible
3. Initial prompt plays automatically
4. User speaks naturally
5. AI processes using system prompt
6. Character responds with voice
7. Transcript updates in real-time
8. Clues unlock based on dialogue

---

## 🎮 Frontend Application

### Core Components

#### AudioVR Class
```javascript
class AudioVR {
  - getUserId()           // Generate/retrieve user ID
  - init()               // Initialize application
  - loadProfile()        // Fetch user data
  - restoreSession()     // Resume previous game
  - showWorldSelection() // Display world grid
  - showDesk()          // Display case selection
  - showCaseScene()     // Start case with AI
  - showInbox()         // Display evidence locker
  - signOut()           // Save and exit
}
```

### State Management
```javascript
// Local Storage
localStorage.setItem('audiovr_user_id', userId)

// Session State
{
  userId: string,
  currentWorld: string,
  currentCase: object,
  profile: object
}

// UI State Classes
body.world-selection  // Hides widget
body.case-scene      // Shows widget
body.desk-view      // Desk environment
body.inbox-view     // Evidence locker
```

### Event Handling
```javascript
// Voice Widget Events
window.addEventListener('message', (event) => {
  if (event.data.type === 'elevenlabs-convai') {
    // Handle widget messages
  }
})

// User Interactions
worldCard.addEventListener('click', selectWorld)
caseObject.addEventListener('click', startCase)
textInput.addEventListener('keypress', handleTextInput)
```

---

## 🚀 Deployment Configuration

### Wrangler Configuration (wrangler.jsonc)
```json
{
  "name": "audiovr",
  "compatibility_date": "2024-01-01",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": ["nodejs_compat"],
  
  "d1_databases": [{
    "binding": "DB",
    "database_name": "audiovr-db",
    "database_id": "production-db-id"
  }],
  
  "kv_namespaces": [{
    "binding": "SESSION_STORE",
    "id": "kv-namespace-id"
  }],
  
  "r2_buckets": [{
    "binding": "MEDIA_STORAGE",
    "bucket_name": "audiovr-media"
  }]
}
```

### PM2 Configuration (ecosystem.config.cjs)
```javascript
module.exports = {
  apps: [{
    name: 'audiovr',
    script: 'npx',
    args: 'wrangler pages dev dist --d1=audiovr-db --local --ip 0.0.0.0 --port 3000',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    }
  }]
}
```

---

## 📊 Content Structure

### Case JSON Format
```json
{
  "initial_prompt": "Character's opening dialogue",
  "system_prompt": "AI behavior instructions",
  "full_description": "Detailed case description",
  "estimated_time": "30-60 min",
  "reward": "Item or achievement",
  "background_image": "visual_asset.jpg",
  "primary_color": "#hexcolor",
  "scenes": [
    {
      "id": "scene_1",
      "trigger": "dialogue_condition",
      "branches": [...]
    }
  ]
}
```

### Current Content
- **8 Horror Cases** (fully implemented)
- **14 Demo Cases** (2 per other world)
- **36 Clues** with dialogue
- **7 Worlds** configured

---

## 🔒 Security Implementation

### API Security
- User ID header validation
- Balance deduction checks
- Premium content verification
- Session token validation

### Environment Variables
```env
ELEVENLABS_API_KEY=secured_in_dev_vars
SUPABASE_URL=optional_external_db
SUPABASE_ANON_KEY=optional_external_auth
```

### Data Protection
- No PII in localStorage
- Secure session tokens
- HTTPS only deployment
- Cloudflare DDoS protection

---

## 📈 Performance Optimizations

### Edge Computing Benefits
- Global CDN distribution
- Sub-10ms response times
- Automatic scaling
- Zero cold starts

### Database Performance
- SQLite on edge (D1)
- KV for fast caching
- R2 for media storage
- Indexed queries

### Frontend Optimizations
- Lazy loading for worlds
- Debounced API calls
- Cached user profile
- Progressive enhancement

---

## 🧪 Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Apply database migrations
npx wrangler d1 migrations apply audiovr-db --local

# Import seed data
npx wrangler d1 execute audiovr-db --local --file=./seed.sql

# Build project
npm run build

# Start development server
pm2 start ecosystem.config.cjs

# View logs
pm2 logs audiovr --nostream
```

### Production Deployment
```bash
# Build for production
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name audiovr

# Add secrets
npx wrangler pages secret put ELEVENLABS_API_KEY

# Apply production migrations
npx wrangler d1 migrations apply audiovr-db
```

---

## 🔄 Data Flow Diagram

```
User Voice Input → ElevenLabs Widget → Agent Processing
                                           ↓
                                    Character Response
                                           ↓
Frontend Updates ← API Call ← Trigger Condition Met
       ↓
Update Transcript → Save Progress → Unlock Clues
       ↓
Update UI State → Show New Content → Continue Loop
```

---

## 📱 Responsive Behavior

### Breakpoints
- **Mobile**: < 768px (single column)
- **Tablet**: 768-1024px (2 columns)
- **Desktop**: > 1024px (3-4 columns)

### Adaptive Features
- Touch gestures on mobile
- Keyboard shortcuts on desktop
- Reduced animations on low-end devices
- Progressive blur effects

---

## 🎯 Key Features Implementation

### ✅ Completed
1. Voice-driven gameplay (ElevenLabs)
2. 7 themed worlds
3. Case management system
4. Evidence locker
5. User progression
6. Balance economy
7. Session persistence
8. Glassmorphic UI
9. Horror content (8 cases)
10. API integration

### 🔜 Planned
1. Additional world content
2. Multiplayer features
3. Achievement system
4. Custom case creator
5. Voice actor integration

---

## 📞 Support & Resources

### Documentation
- README.md - User guide
- DESIGN_REFERENCE.md - UI/UX specs
- TECHNICAL_SUMMARY.md - This document

### External Resources
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages)
- [Hono Framework](https://hono.dev)
- [ElevenLabs API](https://elevenlabs.io/docs)
- [D1 Database Guide](https://developers.cloudflare.com/d1)

---

*Technical implementation current as of 2025-09-17*
*Version 1.0 - AudioVR Platform*