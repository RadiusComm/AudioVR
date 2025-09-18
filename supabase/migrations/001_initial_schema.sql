-- AudioVR Database Schema for Supabase
-- This migration creates the complete database structure for the AudioVR platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Custom types
CREATE TYPE user_role AS ENUM ('player', 'creator', 'moderator', 'admin');
CREATE TYPE mystery_status AS ENUM ('draft', 'review', 'published', 'archived');
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
CREATE TYPE element_type AS ENUM ('scene', 'character', 'evidence', 'dialogue', 'clue', 'audio_cue');
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected', 'revision_needed');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    role user_role DEFAULT 'player',
    accessibility_preferences JSONB DEFAULT '{}',
    voice_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_active TIMESTAMPTZ DEFAULT NOW()
);

-- Creators table (for mystery creators)
CREATE TABLE public.creators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    verification_status VARCHAR(20) DEFAULT 'pending',
    total_mysteries INTEGER DEFAULT 0,
    total_plays INTEGER DEFAULT 0,
    avg_rating DECIMAL(3,2) DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Worlds table (Victorian London, Modern Tokyo, etc.)
CREATE TABLE public.worlds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    setting_period VARCHAR(50),
    atmosphere_description TEXT,
    default_ambient_sounds JSONB DEFAULT '[]',
    background_image_url TEXT,
    accessibility_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mysteries table
CREATE TABLE public.mysteries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    world_id UUID REFERENCES public.worlds(id),
    creator_id UUID REFERENCES public.creators(id),
    difficulty_level difficulty_level NOT NULL,
    estimated_duration INTEGER, -- in minutes
    character_count INTEGER DEFAULT 0,
    evidence_count INTEGER DEFAULT 0,
    status mystery_status DEFAULT 'draft',
    accessibility_features JSONB DEFAULT '[]',
    content_warnings JSONB DEFAULT '[]',
    play_count INTEGER DEFAULT 0,
    avg_rating DECIMAL(3,2) DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Story Elements table (scenes, evidence, dialogue, etc.)
CREATE TABLE public.story_elements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mystery_id UUID REFERENCES public.mysteries(id) ON DELETE CASCADE,
    type element_type NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    audio_description TEXT NOT NULL,
    spatial_position JSONB, -- {x, y, z} coordinates for 3D audio
    trigger_conditions JSONB DEFAULT '[]',
    accessibility_notes TEXT,
    order_index INTEGER DEFAULT 0,
    character_id UUID, -- Reference to character for dialogue
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Characters table
CREATE TABLE public.characters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mystery_id UUID REFERENCES public.mysteries(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    personality_traits JSONB DEFAULT '[]',
    voice_profile JSONB DEFAULT '{}', -- pitch, speed, accent, etc.
    dialogue_style TEXT,
    accessibility_description TEXT,
    role_in_mystery VARCHAR(100),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Progress table
CREATE TABLE public.user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    mystery_id UUID REFERENCES public.mysteries(id) ON DELETE CASCADE,
    completion_percentage INTEGER DEFAULT 0,
    current_scene VARCHAR(100),
    collected_evidence JSONB DEFAULT '[]',
    choices_made JSONB DEFAULT '{}',
    session_count INTEGER DEFAULT 1,
    total_time_spent INTEGER DEFAULT 0, -- in seconds
    completed BOOLEAN DEFAULT false,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, mystery_id)
);

-- User Ratings table
CREATE TABLE public.user_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    mystery_id UUID REFERENCES public.mysteries(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    accessibility_rating INTEGER CHECK (accessibility_rating >= 1 AND accessibility_rating <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, mystery_id)
);

-- User Sessions table (for analytics)
CREATE TABLE public.user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    mystery_id UUID REFERENCES public.mysteries(id),
    session_duration INTEGER, -- in seconds
    voice_commands_used INTEGER DEFAULT 0,
    voice_command_success_rate DECIMAL(5,2),
    accessibility_features_used JSONB DEFAULT '[]',
    device_info JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Voice Commands table (for analytics and improvement)
CREATE TABLE public.voice_commands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    mystery_id UUID REFERENCES public.mysteries(id),
    command_text TEXT NOT NULL,
    recognition_confidence DECIMAL(5,2),
    processing_time_ms INTEGER,
    success BOOLEAN DEFAULT true,
    retry_count INTEGER DEFAULT 0,
    context VARCHAR(100),
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accessibility Usage table (for analytics)
CREATE TABLE public.accessibility_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    mystery_id UUID REFERENCES public.mysteries(id),
    screen_reader_enabled BOOLEAN DEFAULT false,
    voice_only_mode BOOLEAN DEFAULT false,
    haptic_enabled BOOLEAN DEFAULT false,
    spatial_audio_score DECIMAL(5,2),
    audio_description_requests INTEGER DEFAULT 0,
    feature_usage JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Reviews table
CREATE TABLE public.content_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mystery_id UUID REFERENCES public.mysteries(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES public.creators(id),
    reviewer_id UUID REFERENCES public.users(id),
    status review_status DEFAULT 'pending',
    accessibility_score INTEGER CHECK (accessibility_score >= 0 AND accessibility_score <= 100),
    review_notes TEXT,
    suggestions JSONB DEFAULT '[]',
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accessibility Feedback table
CREATE TABLE public.accessibility_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    mystery_id UUID REFERENCES public.mysteries(id),
    feature_name VARCHAR(100) NOT NULL,
    satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),
    feedback_text TEXT,
    improvement_suggestions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audio Assets table
CREATE TABLE public.audio_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mystery_id UUID REFERENCES public.mysteries(id) ON DELETE CASCADE,
    element_id UUID REFERENCES public.story_elements(id) ON DELETE CASCADE,
    asset_type VARCHAR(50), -- 'dialogue', 'ambient', 'effect', 'music'
    file_path TEXT NOT NULL,
    file_size INTEGER,
    duration_ms INTEGER,
    spatial_properties JSONB DEFAULT '{}',
    accessibility_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Logs table
CREATE TABLE public.api_performance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint VARCHAR(200) NOT NULL,
    method VARCHAR(10) NOT NULL,
    response_time_ms INTEGER,
    status_code INTEGER,
    user_id UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audio Performance Logs
CREATE TABLE public.audio_performance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id),
    mystery_id UUID REFERENCES public.mysteries(id),
    audio_load_time_ms INTEGER,
    spatial_processing_time_ms INTEGER,
    audio_error BOOLEAN DEFAULT false,
    error_details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accessibility Tests table
CREATE TABLE public.accessibility_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mystery_id UUID REFERENCES public.mysteries(id),
    test_type VARCHAR(100) NOT NULL,
    keyboard_navigation_success BOOLEAN DEFAULT false,
    screen_reader_compatibility BOOLEAN DEFAULT false,
    voice_navigation_success BOOLEAN DEFAULT false,
    color_contrast_passed BOOLEAN DEFAULT false,
    audio_clarity_score DECIMAL(5,2),
    wcag_compliance_level VARCHAR(10),
    test_results JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_mysteries_world_id ON public.mysteries(world_id);
CREATE INDEX idx_mysteries_creator_id ON public.mysteries(creator_id);
CREATE INDEX idx_mysteries_status ON public.mysteries(status);
CREATE INDEX idx_mysteries_difficulty ON public.mysteries(difficulty_level);
CREATE INDEX idx_story_elements_mystery_id ON public.story_elements(mystery_id);
CREATE INDEX idx_story_elements_type ON public.story_elements(type);
CREATE INDEX idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX idx_user_progress_mystery_id ON public.user_progress(mystery_id);
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_created_at ON public.user_sessions(created_at);
CREATE INDEX idx_voice_commands_user_id ON public.voice_commands(user_id);
CREATE INDEX idx_voice_commands_created_at ON public.voice_commands(created_at);
CREATE INDEX idx_accessibility_usage_user_id ON public.accessibility_usage(user_id);
CREATE INDEX idx_accessibility_usage_created_at ON public.accessibility_usage(created_at);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mysteries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accessibility_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for mysteries table
CREATE POLICY "Published mysteries are viewable by everyone" ON public.mysteries
    FOR SELECT USING (status = 'published');

CREATE POLICY "Creators can manage their own mysteries" ON public.mysteries
    FOR ALL USING (creator_id IN (
        SELECT id FROM public.creators WHERE user_id = auth.uid()
    ));

-- RLS Policies for user progress
CREATE POLICY "Users can manage their own progress" ON public.user_progress
    FOR ALL USING (user_id = auth.uid());

-- RLS Policies for user ratings
CREATE POLICY "Users can manage their own ratings" ON public.user_ratings
    FOR ALL USING (user_id = auth.uid());

-- RLS Policies for analytics tables (users can only see their own data)
CREATE POLICY "Users can read their own sessions" ON public.user_sessions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own sessions" ON public.user_sessions
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mysteries_updated_at BEFORE UPDATE ON public.mysteries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_story_elements_updated_at BEFORE UPDATE ON public.story_elements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON public.user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update mystery statistics
CREATE OR REPLACE FUNCTION update_mystery_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update play count and average rating
    UPDATE public.mysteries SET
        play_count = (
            SELECT COUNT(*) FROM public.user_progress 
            WHERE mystery_id = NEW.mystery_id
        ),
        avg_rating = (
            SELECT AVG(rating) FROM public.user_ratings 
            WHERE mystery_id = NEW.mystery_id
        )
    WHERE id = NEW.mystery_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating mystery statistics
CREATE TRIGGER update_mystery_stats_on_progress AFTER INSERT OR UPDATE ON public.user_progress
    FOR EACH ROW EXECUTE FUNCTION update_mystery_stats();

CREATE TRIGGER update_mystery_stats_on_rating AFTER INSERT OR UPDATE OR DELETE ON public.user_ratings
    FOR EACH ROW EXECUTE FUNCTION update_mystery_stats();

-- Function to update creator statistics
CREATE OR REPLACE FUNCTION update_creator_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.creators SET
        total_mysteries = (
            SELECT COUNT(*) FROM public.mysteries 
            WHERE creator_id = NEW.creator_id AND status = 'published'
        ),
        total_plays = (
            SELECT SUM(play_count) FROM public.mysteries 
            WHERE creator_id = NEW.creator_id
        ),
        avg_rating = (
            SELECT AVG(avg_rating) FROM public.mysteries 
            WHERE creator_id = NEW.creator_id AND avg_rating > 0
        )
    WHERE id = NEW.creator_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updating creator statistics
CREATE TRIGGER update_creator_stats_trigger AFTER INSERT OR UPDATE ON public.mysteries
    FOR EACH ROW EXECUTE FUNCTION update_creator_stats();