-- Profiles table (user data and progression)
CREATE TABLE IF NOT EXISTS profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  rank TEXT DEFAULT 'Rookie',
  balance INTEGER DEFAULT 100,
  current_world TEXT,
  territories_unlocked TEXT DEFAULT '[]', -- JSON array of unlocked territories
  achievements TEXT DEFAULT '[]', -- JSON array of achievements
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cases table (story content)
CREATE TABLE IF NOT EXISTS cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id TEXT UNIQUE NOT NULL,
  world TEXT NOT NULL, -- Detective, Horror, Sci-Fi, Fantasy, Space, Historical, Pirate
  title TEXT NOT NULL,
  description TEXT,
  difficulty INTEGER DEFAULT 1, -- 1-5 difficulty rating
  min_rank TEXT DEFAULT 'Rookie',
  reward_balance INTEGER DEFAULT 50,
  script_json TEXT NOT NULL, -- Case script and branching logic
  prerequisites TEXT DEFAULT '[]', -- JSON array of required case_ids
  is_premium BOOLEAN DEFAULT 0,
  is_locked BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Clues table (evidence and messages)
CREATE TABLE IF NOT EXISTS clues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clue_id TEXT UNIQUE NOT NULL,
  case_id TEXT NOT NULL,
  world TEXT NOT NULL,
  message_type TEXT NOT NULL, -- folder, scroll, data_cube, etc.
  title TEXT NOT NULL,
  content TEXT,
  character_name TEXT, -- NPC who provides this clue
  voice_id TEXT, -- ElevenLabs voice ID
  transcript TEXT, -- Dialogue transcript
  audio_url TEXT, -- Optional stored audio
  is_premium BOOLEAN DEFAULT 0,
  analysis_cost INTEGER DEFAULT 10, -- Balance cost for premium analysis
  unlock_condition TEXT, -- JSON of conditions to unlock
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(case_id)
);

-- User progress table (tracks user's case progress)
CREATE TABLE IF NOT EXISTS user_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  case_id TEXT NOT NULL,
  world TEXT NOT NULL,
  status TEXT DEFAULT 'started', -- started, in_progress, completed, failed
  clues_found TEXT DEFAULT '[]', -- JSON array of found clue_ids
  dialogue_history TEXT DEFAULT '[]', -- JSON array of conversation history
  current_scene TEXT,
  choices_made TEXT DEFAULT '[]', -- JSON array of choices
  completion_time INTEGER, -- Time to complete in seconds
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES profiles(user_id),
  FOREIGN KEY (case_id) REFERENCES cases(case_id),
  UNIQUE(user_id, case_id)
);

-- Inbox table (evidence locker)
CREATE TABLE IF NOT EXISTS inbox (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  clue_id TEXT NOT NULL,
  case_id TEXT NOT NULL,
  world TEXT NOT NULL,
  is_analyzed BOOLEAN DEFAULT 0,
  analysis_notes TEXT,
  acquired_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(user_id),
  FOREIGN KEY (clue_id) REFERENCES clues(clue_id),
  FOREIGN KEY (case_id) REFERENCES cases(case_id),
  UNIQUE(user_id, clue_id)
);

-- Sessions table (save/resume functionality)
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  world TEXT,
  case_id TEXT,
  scene_state TEXT, -- JSON of current scene state
  last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_cases_world ON cases(world);
CREATE INDEX IF NOT EXISTS idx_clues_case_id ON clues(case_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_case ON user_progress(user_id, case_id);
CREATE INDEX IF NOT EXISTS idx_inbox_user_id ON inbox(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);