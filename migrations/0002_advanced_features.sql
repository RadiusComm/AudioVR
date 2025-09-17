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