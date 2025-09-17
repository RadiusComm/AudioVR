# AudioVR Advanced Build Instructions
## Enhanced Conversational AI with Synced Sound Effects & Dynamic Voice System

---

## 🎯 Build Goals Overview

This build enhances AudioVR with:
1. **Synced Sound Effects**: Real-time audio triggers based on speech analysis
2. **Memory & Continuity**: Persistent conversation state across sessions
3. **Multi-Voice System**: Dynamic voice switching and management
4. **Custom Voice Generation**: AI-driven voice creation from character descriptions
5. **Cultural Authenticity**: Geographic and accent-based voice selection
6. **Theme-Based Voices**: Automatic voice generation matching story themes

---

## 📋 Prerequisites

### Required Services
- **ElevenLabs Account** with API access (Professional tier recommended)
- **Cloudflare Account** with Workers/Pages enabled
- **Node.js** v18+ and npm v9+
- **Git** for version control

### API Keys & Credentials
```env
ELEVENLABS_API_KEY=your_api_key_here
ELEVENLABS_AGENT_ID=agent_id_here
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
```

---

## 🏗️ Part 1: Enhanced Backend Architecture

### Step 1.1: Update Database Schema for Advanced Features

Create new migration file: `migrations/0002_advanced_features.sql`

```sql
-- Enhanced user sessions with conversation memory
CREATE TABLE IF NOT EXISTS conversation_memory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  case_id TEXT NOT NULL,
  conversation_id TEXT UNIQUE NOT NULL,
  speech_history TEXT, -- JSON array of all utterances
  sound_triggers TEXT, -- JSON array of triggered sound effects
  emotional_state TEXT, -- Current emotional context
  key_facts TEXT, -- JSON of important discovered information
  last_npc_state TEXT, -- NPC's mental state/mood
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(user_id),
  FOREIGN KEY (case_id) REFERENCES cases(case_id)
);

-- Voice profiles for dynamic voice management
CREATE TABLE IF NOT EXISTS voice_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  voice_id TEXT UNIQUE NOT NULL,
  character_name TEXT NOT NULL,
  world TEXT NOT NULL,
  voice_settings TEXT NOT NULL, -- JSON with ElevenLabs settings
  personality_traits TEXT, -- JSON array of traits
  accent TEXT, -- e.g., 'british', 'southern_us', 'japanese'
  geographic_origin TEXT, -- e.g., 'London', 'New Orleans', 'Tokyo'
  age_range TEXT, -- e.g., 'young_adult', 'elderly'
  gender TEXT,
  emotional_range TEXT, -- JSON of supported emotions
  theme_tags TEXT, -- JSON array of theme associations
  is_generated BOOLEAN DEFAULT 0,
  elevenlabs_voice_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sound effect triggers based on speech patterns
CREATE TABLE IF NOT EXISTS sound_triggers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trigger_id TEXT UNIQUE NOT NULL,
  world TEXT NOT NULL,
  keywords TEXT NOT NULL, -- JSON array of trigger words/phrases
  sound_file TEXT NOT NULL, -- R2 storage path
  effect_type TEXT, -- 'ambient', 'action', 'emotional', 'environmental'
  intensity REAL DEFAULT 0.5, -- Volume/intensity 0-1
  duration INTEGER, -- Duration in milliseconds
  fade_in INTEGER DEFAULT 0,
  fade_out INTEGER DEFAULT 0,
  loop BOOLEAN DEFAULT 0,
  priority INTEGER DEFAULT 5, -- 1-10, higher = more important
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Character voice assignments with dynamic properties
CREATE TABLE IF NOT EXISTS character_voices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id TEXT NOT NULL,
  character_name TEXT NOT NULL,
  voice_profile_id INTEGER,
  mood_variations TEXT, -- JSON of mood->voice_settings mappings
  current_mood TEXT DEFAULT 'neutral',
  speaking_rate REAL DEFAULT 1.0,
  pitch_adjustment REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(case_id),
  FOREIGN KEY (voice_profile_id) REFERENCES voice_profiles(id),
  UNIQUE(case_id, character_name)
);

-- Conversation context tracking
CREATE TABLE IF NOT EXISTS conversation_context (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id TEXT NOT NULL,
  turn_number INTEGER NOT NULL,
  speaker TEXT NOT NULL, -- 'user' or character name
  utterance TEXT NOT NULL,
  detected_keywords TEXT, -- JSON array of important words
  triggered_sounds TEXT, -- JSON array of sound_trigger_ids
  emotional_tone TEXT, -- detected emotion
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversation_memory(conversation_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversation_memory_user_case ON conversation_memory(user_id, case_id);
CREATE INDEX IF NOT EXISTS idx_voice_profiles_world ON voice_profiles(world);
CREATE INDEX IF NOT EXISTS idx_sound_triggers_world ON sound_triggers(world);
CREATE INDEX IF NOT EXISTS idx_character_voices_case ON character_voices(case_id);
CREATE INDEX IF NOT EXISTS idx_conversation_context_conversation ON conversation_context(conversation_id);
```

### Step 1.2: Enhanced Hono Backend API

Update `src/index.tsx` with new endpoints:

```typescript
// Add to imports
import { createHash } from 'crypto';

// Voice Generation API
app.post('/api/voice/generate', async (c) => {
  const { env } = c;
  const { 
    characterName, 
    description, 
    world, 
    personality, 
    accent, 
    age, 
    gender,
    theme 
  } = await c.req.json();

  try {
    // Generate voice using ElevenLabs Voice Design API
    const voiceDesignResponse = await fetch('https://api.elevenlabs.io/v1/voice-generation/generate-voice', {
      method: 'POST',
      headers: {
        'xi-api-key': env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: characterName,
        description: `${description}. Personality: ${personality}. Accent: ${accent}. Age: ${age}. Gender: ${gender}. Theme: ${theme}`,
        labels: {
          accent: accent,
          age: age,
          gender: gender,
          use_case: 'narration'
        },
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: personality === 'dramatic' ? 0.8 : 0.5,
          use_speaker_boost: true
        }
      })
    });

    const voiceData = await voiceDesignResponse.json();
    
    // Store voice profile in database
    await env.DB.prepare(`
      INSERT INTO voice_profiles (
        voice_id, character_name, world, voice_settings, 
        personality_traits, accent, geographic_origin, 
        age_range, gender, theme_tags, is_generated, elevenlabs_voice_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).bind(
      `voice_${characterName}_${Date.now()}`,
      characterName,
      world,
      JSON.stringify(voiceData.voice_settings),
      JSON.stringify(personality.split(',')),
      accent,
      voiceData.geographic_origin || accent,
      age,
      gender,
      JSON.stringify([theme]),
      voiceData.voice_id
    ).run();

    return c.json({ 
      success: true, 
      voiceId: voiceData.voice_id,
      message: `Voice generated for ${characterName}`
    });
  } catch (error) {
    console.error('Voice generation error:', error);
    return c.json({ error: 'Failed to generate voice' }, 500);
  }
});

// Speech Analysis & Sound Trigger API
app.post('/api/speech/analyze', async (c) => {
  const { env } = c;
  const { text, world, conversationId } = await c.req.json();
  
  try {
    // Get sound triggers for this world
    const triggers = await env.DB.prepare(`
      SELECT * FROM sound_triggers WHERE world = ?
    `).bind(world).all();
    
    // Analyze text for keywords
    const triggeredSounds = [];
    const detectedKeywords = [];
    
    for (const trigger of triggers.results) {
      const keywords = JSON.parse(trigger.keywords);
      for (const keyword of keywords) {
        if (text.toLowerCase().includes(keyword.toLowerCase())) {
          triggeredSounds.push({
            triggerId: trigger.trigger_id,
            soundFile: trigger.sound_file,
            effectType: trigger.effect_type,
            intensity: trigger.intensity,
            duration: trigger.duration,
            fadeIn: trigger.fade_in,
            fadeOut: trigger.fade_out,
            loop: trigger.loop
          });
          detectedKeywords.push(keyword);
        }
      }
    }
    
    // Analyze emotional tone (simplified - could use sentiment analysis API)
    let emotionalTone = 'neutral';
    if (text.match(/\b(scary|terrifying|horror|afraid|fear)\b/i)) {
      emotionalTone = 'fear';
    } else if (text.match(/\b(happy|joy|excited|wonderful|great)\b/i)) {
      emotionalTone = 'joy';
    } else if (text.match(/\b(sad|crying|tears|sorrow|grief)\b/i)) {
      emotionalTone = 'sadness';
    } else if (text.match(/\b(angry|furious|rage|mad)\b/i)) {
      emotionalTone = 'anger';
    }
    
    // Store in conversation context
    if (conversationId) {
      await env.DB.prepare(`
        INSERT INTO conversation_context (
          conversation_id, turn_number, speaker, utterance,
          detected_keywords, triggered_sounds, emotional_tone
        ) VALUES (
          ?, 
          (SELECT COALESCE(MAX(turn_number), 0) + 1 FROM conversation_context WHERE conversation_id = ?),
          'user', ?, ?, ?, ?
        )
      `).bind(
        conversationId, conversationId, text,
        JSON.stringify(detectedKeywords),
        JSON.stringify(triggeredSounds.map(s => s.triggerId)),
        emotionalTone
      ).run();
    }
    
    return c.json({
      triggeredSounds,
      detectedKeywords,
      emotionalTone
    });
  } catch (error) {
    console.error('Speech analysis error:', error);
    return c.json({ error: 'Failed to analyze speech' }, 500);
  }
});

// Conversation Memory API
app.post('/api/conversation/remember', async (c) => {
  const { env } = c;
  const { userId, caseId, conversationData } = await c.req.json();
  
  try {
    const conversationId = `conv_${userId}_${caseId}_${Date.now()}`;
    
    // Create or update conversation memory
    await env.DB.prepare(`
      INSERT INTO conversation_memory (
        user_id, case_id, conversation_id, speech_history,
        sound_triggers, emotional_state, key_facts, last_npc_state
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, case_id) DO UPDATE SET
        speech_history = ?,
        sound_triggers = ?,
        emotional_state = ?,
        key_facts = ?,
        last_npc_state = ?,
        updated_at = CURRENT_TIMESTAMP
    `).bind(
      userId, caseId, conversationId,
      JSON.stringify(conversationData.speechHistory || []),
      JSON.stringify(conversationData.soundTriggers || []),
      conversationData.emotionalState || 'neutral',
      JSON.stringify(conversationData.keyFacts || {}),
      conversationData.lastNpcState || 'neutral',
      // Update values
      JSON.stringify(conversationData.speechHistory || []),
      JSON.stringify(conversationData.soundTriggers || []),
      conversationData.emotionalState || 'neutral',
      JSON.stringify(conversationData.keyFacts || {}),
      conversationData.lastNpcState || 'neutral'
    ).run();
    
    return c.json({ success: true, conversationId });
  } catch (error) {
    console.error('Memory storage error:', error);
    return c.json({ error: 'Failed to store conversation memory' }, 500);
  }
});

// Get Conversation Memory
app.get('/api/conversation/recall/:userId/:caseId', async (c) => {
  const { env } = c;
  const userId = c.req.param('userId');
  const caseId = c.req.param('caseId');
  
  try {
    const memory = await env.DB.prepare(`
      SELECT * FROM conversation_memory 
      WHERE user_id = ? AND case_id = ?
      ORDER BY updated_at DESC LIMIT 1
    `).bind(userId, caseId).first();
    
    if (!memory) {
      return c.json({ hasMemory: false });
    }
    
    // Get last 10 conversation turns
    const context = await env.DB.prepare(`
      SELECT * FROM conversation_context 
      WHERE conversation_id = ?
      ORDER BY turn_number DESC LIMIT 10
    `).bind(memory.conversation_id).all();
    
    return c.json({
      hasMemory: true,
      memory: {
        conversationId: memory.conversation_id,
        speechHistory: JSON.parse(memory.speech_history || '[]'),
        soundTriggers: JSON.parse(memory.sound_triggers || '[]'),
        emotionalState: memory.emotional_state,
        keyFacts: JSON.parse(memory.key_facts || '{}'),
        lastNpcState: memory.last_npc_state,
        recentContext: context.results.reverse()
      }
    });
  } catch (error) {
    console.error('Memory recall error:', error);
    return c.json({ error: 'Failed to recall conversation memory' }, 500);
  }
});

// Dynamic Voice Assignment
app.post('/api/voice/assign', async (c) => {
  const { env } = c;
  const { caseId, characterName, world, theme } = await c.req.json();
  
  try {
    // Find best matching voice profile
    const voiceProfile = await env.DB.prepare(`
      SELECT * FROM voice_profiles 
      WHERE world = ? 
      AND (
        character_name = ? 
        OR JSON_EXTRACT(theme_tags, '$[0]') = ?
      )
      ORDER BY 
        CASE WHEN character_name = ? THEN 0 ELSE 1 END,
        created_at DESC
      LIMIT 1
    `).bind(world, characterName, theme, characterName).first();
    
    if (!voiceProfile) {
      // Generate new voice if none exists
      return c.json({ 
        needsGeneration: true, 
        message: 'No matching voice found, generation required' 
      });
    }
    
    // Assign voice to character
    await env.DB.prepare(`
      INSERT INTO character_voices (case_id, character_name, voice_profile_id)
      VALUES (?, ?, ?)
      ON CONFLICT(case_id, character_name) DO UPDATE SET
        voice_profile_id = ?
    `).bind(caseId, characterName, voiceProfile.id, voiceProfile.id).run();
    
    return c.json({
      success: true,
      voiceId: voiceProfile.elevenlabs_voice_id,
      voiceSettings: JSON.parse(voiceProfile.voice_settings)
    });
  } catch (error) {
    console.error('Voice assignment error:', error);
    return c.json({ error: 'Failed to assign voice' }, 500);
  }
});
```

---

## 🎮 Part 2: Enhanced Frontend Integration

### Step 2.1: Advanced AudioVR Class

Create `public/static/audiovr-enhanced.js`:

```javascript
class AudioVREnhanced extends AudioVR {
  constructor() {
    super();
    this.soundEffectQueue = [];
    this.activeAudio = {};
    this.conversationMemory = null;
    this.voiceCache = new Map();
    this.speechRecognition = null;
    this.initializeEnhancedFeatures();
  }

  async initializeEnhancedFeatures() {
    // Initialize Web Speech API for real-time analysis
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.speechRecognition = new SpeechRecognition();
      this.speechRecognition.continuous = true;
      this.speechRecognition.interimResults = true;
      
      this.speechRecognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        this.analyzeAndTriggerSounds(transcript);
      };
    }
    
    // Load conversation memory if exists
    await this.loadConversationMemory();
    
    // Initialize sound effect system
    this.initializeSoundSystem();
  }

  async loadConversationMemory() {
    if (!this.userId || !this.currentCase) return;
    
    try {
      const response = await axios.get(
        `/api/conversation/recall/${this.userId}/${this.currentCase.case_id}`
      );
      
      if (response.data.hasMemory) {
        this.conversationMemory = response.data.memory;
        this.applyMemoryContext();
      }
    } catch (error) {
      console.error('Failed to load conversation memory:', error);
    }
  }

  applyMemoryContext() {
    if (!this.conversationMemory) return;
    
    // Update UI with remembered state
    const memory = this.conversationMemory;
    
    // Show personalized greeting based on memory
    if (memory.keyFacts.playerName) {
      this.showNotification(`Welcome back, ${memory.keyFacts.playerName}`);
    }
    
    // Restore emotional state
    this.setEmotionalTone(memory.emotionalState);
    
    // Restore discovered clues
    if (memory.keyFacts.discoveredClues) {
      memory.keyFacts.discoveredClues.forEach(clue => {
        this.addClueToList(clue);
      });
    }
  }

  async analyzeAndTriggerSounds(text) {
    if (!this.currentWorld || !text) return;
    
    try {
      const response = await axios.post('/api/speech/analyze', {
        text,
        world: this.currentWorld,
        conversationId: this.conversationMemory?.conversationId
      });
      
      const { triggeredSounds, emotionalTone } = response.data;
      
      // Queue and play sound effects
      triggeredSounds.forEach(sound => {
        this.queueSoundEffect(sound);
      });
      
      // Update emotional tone
      this.setEmotionalTone(emotionalTone);
      
      // Play queued sounds in sequence
      this.processSoundQueue();
    } catch (error) {
      console.error('Speech analysis failed:', error);
    }
  }

  queueSoundEffect(sound) {
    this.soundEffectQueue.push(sound);
  }

  async processSoundQueue() {
    if (this.soundEffectQueue.length === 0) return;
    
    const sound = this.soundEffectQueue.shift();
    await this.playSound(sound);
    
    // Process next sound after current finishes
    setTimeout(() => {
      this.processSoundQueue();
    }, sound.duration || 1000);
  }

  async playSound(soundConfig) {
    try {
      // Create audio element
      const audio = new Audio(soundConfig.soundFile);
      audio.volume = soundConfig.intensity || 0.5;
      
      // Apply fade effects
      if (soundConfig.fadeIn > 0) {
        audio.volume = 0;
        this.fadeAudioIn(audio, soundConfig.intensity, soundConfig.fadeIn);
      }
      
      // Set loop if needed
      audio.loop = soundConfig.loop || false;
      
      // Store reference for control
      this.activeAudio[soundConfig.triggerId] = audio;
      
      // Play the sound
      await audio.play();
      
      // Apply fade out if specified
      if (soundConfig.fadeOut > 0 && soundConfig.duration) {
        setTimeout(() => {
          this.fadeAudioOut(audio, soundConfig.fadeOut);
        }, soundConfig.duration - soundConfig.fadeOut);
      }
      
      // Clean up after playback
      if (!soundConfig.loop) {
        audio.addEventListener('ended', () => {
          delete this.activeAudio[soundConfig.triggerId];
        });
      }
    } catch (error) {
      console.error('Sound playback error:', error);
    }
  }

  fadeAudioIn(audio, targetVolume, duration) {
    const steps = 30;
    const stepTime = duration / steps;
    const volumeStep = targetVolume / steps;
    let currentStep = 0;
    
    const fadeInterval = setInterval(() => {
      currentStep++;
      audio.volume = Math.min(volumeStep * currentStep, targetVolume);
      
      if (currentStep >= steps) {
        clearInterval(fadeInterval);
      }
    }, stepTime);
  }

  fadeAudioOut(audio, duration) {
    const steps = 30;
    const stepTime = duration / steps;
    const initialVolume = audio.volume;
    const volumeStep = initialVolume / steps;
    let currentStep = 0;
    
    const fadeInterval = setInterval(() => {
      currentStep++;
      audio.volume = Math.max(initialVolume - (volumeStep * currentStep), 0);
      
      if (currentStep >= steps) {
        clearInterval(fadeInterval);
        audio.pause();
      }
    }, stepTime);
  }

  setEmotionalTone(tone) {
    // Update UI to reflect emotional state
    const toneColors = {
      neutral: '#4169E1',
      fear: '#B03030',
      joy: '#FFD700',
      sadness: '#4682B4',
      anger: '#DC143C'
    };
    
    const color = toneColors[tone] || toneColors.neutral;
    
    // Apply color to UI elements
    document.documentElement.style.setProperty('--emotional-color', color);
    
    // Update any emotion indicators
    const emotionIndicator = document.getElementById('emotion-indicator');
    if (emotionIndicator) {
      emotionIndicator.textContent = tone;
      emotionIndicator.style.color = color;
    }
  }

  async generateVoiceForCharacter(characterName, description) {
    // Check cache first
    if (this.voiceCache.has(characterName)) {
      return this.voiceCache.get(characterName);
    }
    
    try {
      // Parse description for voice attributes
      const attributes = this.parseCharacterDescription(description);
      
      const response = await axios.post('/api/voice/generate', {
        characterName,
        description: attributes.description,
        world: this.currentWorld,
        personality: attributes.personality,
        accent: attributes.accent,
        age: attributes.age,
        gender: attributes.gender,
        theme: attributes.theme
      });
      
      if (response.data.success) {
        this.voiceCache.set(characterName, response.data.voiceId);
        return response.data.voiceId;
      }
    } catch (error) {
      console.error('Voice generation failed:', error);
      return null;
    }
  }

  parseCharacterDescription(description) {
    // Extract voice attributes from character description
    const attributes = {
      description: description,
      personality: 'neutral',
      accent: 'neutral',
      age: 'adult',
      gender: 'neutral',
      theme: this.currentWorld
    };
    
    // Parse for personality
    if (description.match(/\b(sinister|dark|evil|menacing)\b/i)) {
      attributes.personality = 'sinister';
    } else if (description.match(/\b(friendly|warm|kind|gentle)\b/i)) {
      attributes.personality = 'friendly';
    } else if (description.match(/\b(mysterious|enigmatic|cryptic)\b/i)) {
      attributes.personality = 'mysterious';
    }
    
    // Parse for accent
    if (description.match(/\b(british|english|london)\b/i)) {
      attributes.accent = 'british';
    } else if (description.match(/\b(southern|texas|alabama)\b/i)) {
      attributes.accent = 'southern_us';
    } else if (description.match(/\b(french|paris|french)\b/i)) {
      attributes.accent = 'french';
    }
    
    // Parse for age
    if (description.match(/\b(young|child|kid|teenager)\b/i)) {
      attributes.age = 'young';
    } else if (description.match(/\b(old|elderly|ancient|aged)\b/i)) {
      attributes.age = 'elderly';
    }
    
    // Parse for gender
    if (description.match(/\b(male|man|boy|he|his)\b/i)) {
      attributes.gender = 'male';
    } else if (description.match(/\b(female|woman|girl|she|her)\b/i)) {
      attributes.gender = 'female';
    }
    
    return attributes;
  }

  async saveConversationMemory(updateData) {
    if (!this.userId || !this.currentCase) return;
    
    try {
      const memoryData = {
        speechHistory: this.conversationMemory?.speechHistory || [],
        soundTriggers: this.conversationMemory?.soundTriggers || [],
        emotionalState: this.conversationMemory?.emotionalState || 'neutral',
        keyFacts: this.conversationMemory?.keyFacts || {},
        lastNpcState: this.conversationMemory?.lastNpcState || 'neutral',
        ...updateData
      };
      
      await axios.post('/api/conversation/remember', {
        userId: this.userId,
        caseId: this.currentCase.case_id,
        conversationData: memoryData
      });
    } catch (error) {
      console.error('Failed to save conversation memory:', error);
    }
  }

  // Override parent method to add enhanced features
  async showCaseScene(caseInfo) {
    // Call parent implementation
    super.showCaseScene(caseInfo);
    
    // Load conversation memory for this case
    await this.loadConversationMemory();
    
    // Start speech recognition if available
    if (this.speechRecognition) {
      this.speechRecognition.start();
    }
    
    // Configure ElevenLabs widget with memory context
    this.configureWidgetWithMemory();
  }

  configureWidgetWithMemory() {
    const widget = document.querySelector('elevenlabs-convai');
    if (!widget || !this.conversationMemory) return;
    
    // Create context prompt based on memory
    const contextPrompt = this.buildContextPrompt();
    
    // Send context to widget via postMessage
    widget.contentWindow?.postMessage({
      type: 'set-context',
      context: contextPrompt
    }, '*');
  }

  buildContextPrompt() {
    if (!this.conversationMemory) return '';
    
    const memory = this.conversationMemory;
    let prompt = 'Previous conversation context:\n';
    
    // Add key facts
    if (memory.keyFacts.playerName) {
      prompt += `Player name: ${memory.keyFacts.playerName}\n`;
    }
    
    if (memory.keyFacts.discoveredClues) {
      prompt += `Discovered clues: ${memory.keyFacts.discoveredClues.join(', ')}\n`;
    }
    
    // Add recent conversation
    if (memory.recentContext && memory.recentContext.length > 0) {
      prompt += '\nRecent conversation:\n';
      memory.recentContext.forEach(turn => {
        prompt += `${turn.speaker}: ${turn.utterance}\n`;
      });
    }
    
    // Add emotional context
    prompt += `\nCurrent emotional tone: ${memory.emotionalState}\n`;
    prompt += `NPC state: ${memory.lastNpcState}\n`;
    
    return prompt;
  }

  // Clean up when leaving case
  async exitCase() {
    // Save final memory state
    await this.saveConversationMemory({
      lastNpcState: 'session_ended'
    });
    
    // Stop speech recognition
    if (this.speechRecognition) {
      this.speechRecognition.stop();
    }
    
    // Stop all active sounds
    Object.values(this.activeAudio).forEach(audio => {
      audio.pause();
    });
    this.activeAudio = {};
    
    // Clear sound queue
    this.soundEffectQueue = [];
  }
}

// Initialize enhanced version
document.addEventListener('DOMContentLoaded', () => {
  window.audioVR = new AudioVREnhanced();
});
```

---

## 🎵 Part 3: Sound Effect Library Setup

### Step 3.1: Populate Sound Triggers

Create `seed-sound-triggers.sql`:

```sql
-- Horror World Sound Triggers
INSERT INTO sound_triggers (trigger_id, world, keywords, sound_file, effect_type, intensity, duration, fade_in, fade_out, loop, priority) VALUES
('horror_door_creak', 'horror', '["door", "open", "creak", "entrance"]', '/sounds/horror/door_creak.mp3', 'action', 0.6, 3000, 100, 200, 0, 7),
('horror_footsteps', 'horror', '["footsteps", "walking", "approaching", "steps"]', '/sounds/horror/footsteps.mp3', 'action', 0.4, 2000, 0, 100, 0, 5),
('horror_scream', 'horror', '["scream", "shriek", "terror", "afraid"]', '/sounds/horror/scream.mp3', 'emotional', 0.8, 2500, 0, 500, 0, 9),
('horror_heartbeat', 'horror', '["heart", "beating", "pulse", "nervous"]', '/sounds/horror/heartbeat.mp3', 'emotional', 0.5, 4000, 500, 500, 1, 6),
('horror_whispers', 'horror', '["whisper", "voices", "murmur", "shadows"]', '/sounds/horror/whispers.mp3', 'ambient', 0.3, 8000, 1000, 1000, 1, 4),
('horror_thunder', 'horror', '["thunder", "lightning", "storm"]', '/sounds/horror/thunder.mp3', 'environmental', 0.7, 4000, 0, 1000, 0, 8),
('horror_chains', 'horror', '["chains", "rattling", "shackles", "prison"]', '/sounds/horror/chains.mp3', 'action', 0.5, 2500, 100, 100, 0, 6),
('horror_growl', 'horror', '["growl", "snarl", "beast", "monster"]', '/sounds/horror/growl.mp3', 'action', 0.6, 1500, 0, 200, 0, 7);

-- Detective World Sound Triggers
INSERT INTO sound_triggers (trigger_id, world, keywords, sound_file, effect_type, intensity, duration, fade_in, fade_out, loop, priority) VALUES
('detective_typewriter', 'detective', '["typing", "typewriter", "report", "writing"]', '/sounds/detective/typewriter.mp3', 'ambient', 0.3, 3000, 200, 200, 0, 4),
('detective_phone_ring', 'detective', '["phone", "ring", "call", "telephone"]', '/sounds/detective/phone_ring.mp3', 'action', 0.5, 2000, 0, 100, 0, 7),
('detective_gunshot', 'detective', '["gun", "shot", "fire", "shoot"]', '/sounds/detective/gunshot.mp3', 'action', 0.8, 500, 0, 0, 0, 10),
('detective_jazz', 'detective', '["music", "jazz", "bar", "lounge"]', '/sounds/detective/jazz_ambient.mp3', 'ambient', 0.2, 30000, 2000, 2000, 1, 3),
('detective_rain', 'detective', '["rain", "raining", "weather", "outside"]', '/sounds/detective/rain.mp3', 'environmental', 0.3, 10000, 1000, 1000, 1, 3),
('detective_car', 'detective', '["car", "drive", "engine", "vehicle"]', '/sounds/detective/car_engine.mp3', 'action', 0.4, 3000, 500, 500, 0, 5);

-- Sci-Fi World Sound Triggers
INSERT INTO sound_triggers (trigger_id, world, keywords, sound_file, effect_type, intensity, duration, fade_in, fade_out, loop, priority) VALUES
('scifi_laser', 'scifi', '["laser", "blast", "fire", "shoot"]', '/sounds/scifi/laser.mp3', 'action', 0.6, 1000, 0, 100, 0, 8),
('scifi_computer', 'scifi', '["computer", "terminal", "console", "data"]', '/sounds/scifi/computer_beeps.mp3', 'ambient', 0.3, 2000, 0, 0, 0, 4),
('scifi_alarm', 'scifi', '["alarm", "alert", "warning", "danger"]', '/sounds/scifi/alarm.mp3', 'environmental', 0.7, 3000, 0, 0, 1, 9),
('scifi_engine', 'scifi', '["engine", "ship", "warp", "thrust"]', '/sounds/scifi/engine_hum.mp3', 'ambient', 0.4, 5000, 1000, 1000, 1, 4),
('scifi_teleport', 'scifi', '["teleport", "beam", "transport", "materialize"]', '/sounds/scifi/teleport.mp3', 'action', 0.5, 2000, 200, 200, 0, 6);
```

---

## 🚀 Part 4: Deployment Instructions

### Step 4.1: Build Process

```bash
# 1. Install dependencies
cd /home/user/webapp
npm install

# 2. Apply new database migrations
npx wrangler d1 migrations apply audiovr-db --local

# 3. Import sound triggers
npx wrangler d1 execute audiovr-db --local --file=./seed-sound-triggers.sql

# 4. Build the application
npm run build

# 5. Copy enhanced frontend files
cp public/static/audiovr-enhanced.js dist/static/

# 6. Test locally
pm2 restart audiovr

# 7. Verify features
curl http://localhost:3000/api/conversation/recall/test/test
```

### Step 4.2: Production Deployment

```bash
# 1. Create production database tables
npx wrangler d1 migrations apply audiovr-db --remote

# 2. Upload sound files to R2
npx wrangler r2 object put audiovr-media/sounds/horror/door_creak.mp3 --file=./sounds/horror/door_creak.mp3

# 3. Set environment variables
npx wrangler pages secret put ELEVENLABS_API_KEY --project-name audiovr

# 4. Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name audiovr

# 5. Verify deployment
curl https://audiovr.pages.dev/api/voice/generate
```

---

## 🧪 Part 5: Testing & Validation

### Test Script: `test-enhanced-features.js`

```javascript
// Test sound trigger system
async function testSoundTriggers() {
  const response = await fetch('/api/speech/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: "I heard footsteps approaching and the door creaked open",
      world: "horror",
      conversationId: "test_conv_001"
    })
  });
  
  const result = await response.json();
  console.log('Triggered sounds:', result.triggeredSounds);
  console.assert(result.triggeredSounds.length >= 2, 'Should trigger multiple sounds');
}

// Test voice generation
async function testVoiceGeneration() {
  const response = await fetch('/api/voice/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      characterName: "Count Vargo",
      description: "Ancient vampire lord with aristocratic bearing",
      world: "horror",
      personality: "sinister,dramatic",
      accent: "eastern_european",
      age: "elderly",
      gender: "male",
      theme: "vampire"
    })
  });
  
  const result = await response.json();
  console.log('Generated voice:', result);
  console.assert(result.success, 'Voice generation should succeed');
}

// Test conversation memory
async function testConversationMemory() {
  // Save memory
  const saveResponse = await fetch('/api/conversation/remember', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: "test_user",
      caseId: "hor_003",
      conversationData: {
        speechHistory: ["Hello", "Tell me about the vampire"],
        emotionalState: "curious",
        keyFacts: { playerName: "TestPlayer", discoveredClues: ["crucifix"] }
      }
    })
  });
  
  // Recall memory
  const recallResponse = await fetch('/api/conversation/recall/test_user/hor_003');
  const memory = await recallResponse.json();
  
  console.log('Recalled memory:', memory);
  console.assert(memory.hasMemory, 'Should have stored memory');
}

// Run all tests
async function runTests() {
  console.log('Testing enhanced AudioVR features...');
  await testSoundTriggers();
  await testVoiceGeneration();
  await testConversationMemory();
  console.log('All tests completed!');
}

runTests();
```

---

## 📊 Part 6: Configuration Templates

### ElevenLabs Agent Configuration

```json
{
  "agent_config": {
    "name": "AudioVR Storyteller",
    "model": "eleven_turbo_v2",
    "voice": {
      "voice_id": "dynamic",
      "settings": {
        "stability": 0.5,
        "similarity_boost": 0.75,
        "style": 0.5,
        "use_speaker_boost": true
      }
    },
    "memory": {
      "type": "conversation",
      "max_tokens": 4000,
      "summarization": true
    },
    "tools": [
      {
        "name": "trigger_sound",
        "description": "Trigger sound effects based on dialogue"
      },
      {
        "name": "switch_voice",
        "description": "Switch to different character voice"
      },
      {
        "name": "remember_fact",
        "description": "Store important information about player"
      }
    ]
  }
}
```

### Sound Library Structure

```
/sounds/
├── horror/
│   ├── ambient/
│   ├── action/
│   ├── emotional/
│   └── environmental/
├── detective/
│   ├── ambient/
│   ├── action/
│   └── environmental/
├── scifi/
├── fantasy/
├── space/
├── historical/
└── pirate/
```

---

## 🔧 Part 7: Troubleshooting Guide

### Common Issues & Solutions

1. **Sound Effects Not Triggering**
   - Check browser autoplay policies
   - Ensure sound files are uploaded to R2
   - Verify keywords in database match speech

2. **Voice Generation Failing**
   - Verify ElevenLabs API key is valid
   - Check API rate limits
   - Ensure character description has required fields

3. **Memory Not Persisting**
   - Check database migrations applied
   - Verify conversation_id is consistent
   - Ensure user_id and case_id are valid

4. **Widget Not Responding**
   - Check agent_id is correct
   - Verify widget script loaded
   - Check browser console for errors

---

## 📈 Performance Optimization

### Caching Strategy
```javascript
// Implement in workers
const cache = caches.default;

// Cache voice profiles
const cacheKey = new Request(`https://cache/voice/${characterName}`);
const cachedVoice = await cache.match(cacheKey);

if (!cachedVoice) {
  // Generate and cache
  const voice = await generateVoice();
  await cache.put(cacheKey, new Response(JSON.stringify(voice)));
}
```

### Sound Preloading
```javascript
// Preload critical sounds
const criticalSounds = [
  '/sounds/horror/heartbeat.mp3',
  '/sounds/horror/whispers.mp3'
];

criticalSounds.forEach(url => {
  const audio = new Audio(url);
  audio.preload = 'auto';
});
```

---

## ✅ Verification Checklist

- [ ] Database migrations applied successfully
- [ ] Sound triggers imported into database
- [ ] ElevenLabs API key configured
- [ ] Agent ID updated in frontend
- [ ] Sound files uploaded to R2
- [ ] Voice generation endpoint working
- [ ] Speech analysis returning triggers
- [ ] Memory persistence verified
- [ ] Widget integration tested
- [ ] Production deployment successful

---

## 🎯 Success Metrics

Monitor these metrics to verify enhanced features are working:

1. **Sound Trigger Rate**: >80% of relevant keywords trigger sounds
2. **Voice Generation Success**: >95% successful voice creations
3. **Memory Recall Accuracy**: 100% of saved memories retrieved
4. **Response Latency**: <200ms for sound triggers
5. **User Engagement**: >30% increase in session duration

---

*Build instructions for AudioVR Enhanced System v2.0*
*Last Updated: 2025-09-17*