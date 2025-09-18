-- Supabase AI is experimental and may produce incorrect answers
-- Always verify the output before executing

-- Insert sample data for AudioVR development and testing

-- Users (test data)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test@audiovr.com',
  crypt('password123', gen_salt('bf')),
  timezone('utc'::text, now()),
  timezone('utc'::text, now()),
  timezone('utc'::text, now()),
  '',
  '',
  '',
  ''
);

-- Get the user ID for foreign key references
DO $$
DECLARE
    test_user_id uuid;
BEGIN
    SELECT id INTO test_user_id FROM auth.users WHERE email = 'test@audiovr.com' LIMIT 1;

    -- Insert user profile
    INSERT INTO public.user_profiles (
        user_id,
        display_name,
        bio,
        avatar_url,
        accessibility_preferences,
        voice_settings,
        created_at,
        updated_at
    ) VALUES (
        test_user_id,
        'Test Detective',
        'Mystery enthusiast and accessibility advocate',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=detective',
        jsonb_build_object(
            'screen_reader', true,
            'high_contrast', false,
            'large_text', true,
            'reduced_motion', false,
            'voice_only_mode', true
        ),
        jsonb_build_object(
            'speech_rate', 1.0,
            'voice_pitch', 1.0,
            'preferred_voice', 'en-US-Standard-A',
            'auto_speak', true
        ),
        now(),
        now()
    );

    -- Insert sample worlds
    INSERT INTO public.worlds (
        id,
        name,
        description,
        creator_id,
        theme,
        difficulty_level,
        estimated_duration,
        accessibility_features,
        content_warnings,
        spatial_audio_enabled,
        environment_sounds,
        is_public,
        status,
        created_at,
        updated_at
    ) VALUES 
    (
        gen_random_uuid(),
        'Victorian London',
        'A fog-shrouded Victorian London setting perfect for classic detective mysteries',
        test_user_id,
        'historical',
        'intermediate',
        60,
        ARRAY['voice_navigation', 'screen_reader', 'spatial_audio', 'haptic_feedback'],
        ARRAY['mild_violence', 'dark_themes'],
        true,
        jsonb_build_object(
            'ambient', 'https://example.com/audio/victorian-ambience.mp3',
            'footsteps', 'https://example.com/audio/cobblestone-steps.mp3',
            'weather', 'https://example.com/audio/fog-wind.mp3'
        ),
        true,
        'published',
        now(),
        now()
    ),
    (
        gen_random_uuid(),
        'Modern Office Building',
        'A sleek corporate environment for contemporary mysteries',
        test_user_id,
        'modern',
        'beginner',
        30,
        ARRAY['voice_navigation', 'screen_reader', 'spatial_audio'],
        ARRAY['mild_suspense'],
        true,
        jsonb_build_object(
            'ambient', 'https://example.com/audio/office-ambience.mp3',
            'elevator', 'https://example.com/audio/elevator-ding.mp3',
            'typing', 'https://example.com/audio/keyboard-typing.mp3'
        ),
        true,
        'published',
        now(),
        now()
    );

    -- Get world IDs for mystery creation
    WITH world_data AS (
        SELECT id, name FROM public.worlds WHERE creator_id = test_user_id
    )
    -- Insert sample mysteries
    INSERT INTO public.mysteries (
        id,
        title,
        description,
        creator_id,
        world_id,
        difficulty_level,
        estimated_duration,
        accessibility_features,
        content_warnings,
        status,
        is_featured,
        created_at,
        updated_at
    ) 
    SELECT 
        gen_random_uuid(),
        CASE 
            WHEN w.name = 'Victorian London' THEN 'The Vanishing Violinist'
            WHEN w.name = 'Modern Office Building' THEN 'Corporate Conspiracy'
        END,
        CASE 
            WHEN w.name = 'Victorian London' THEN 'A renowned violinist disappears during a performance at the Royal Opera House. Can you solve the mystery before the final curtain?'
            WHEN w.name = 'Modern Office Building' THEN 'Confidential documents have gone missing from the 47th floor. Navigate office politics and hidden agendas to uncover the truth.'
        END,
        test_user_id,
        w.id,
        'intermediate',
        45,
        ARRAY['voice_only', 'screen_reader', 'spatial_audio'],
        ARRAY['mild_suspense'],
        'published',
        true,
        now(),
        now()
    FROM world_data w;

END $$;

-- Insert sample mystery elements (scenes, evidence, characters)
DO $$
DECLARE
    mystery_id uuid;
    world_id uuid;
BEGIN
    -- Get mystery and world IDs
    SELECT m.id, m.world_id INTO mystery_id, world_id 
    FROM public.mysteries m 
    WHERE m.title = 'The Vanishing Violinist' 
    LIMIT 1;

    -- Insert scenes for Victorian London mystery
    INSERT INTO public.mystery_elements (
        id,
        mystery_id,
        world_id,
        element_type,
        title,
        content,
        audio_description,
        spatial_position,
        interaction_triggers,
        accessibility_metadata,
        order_index,
        created_at,
        updated_at
    ) VALUES 
    (
        gen_random_uuid(),
        mystery_id,
        world_id,
        'scene',
        'The Grand Opera House Lobby',
        'An opulent Victorian lobby with marble columns and crystal chandeliers. The sound of concerned patrons fills the air.',
        'You stand in a grand marble lobby. Worried voices echo around you as news of the missing violinist spreads.',
        jsonb_build_object('x', 0, 'y', 0, 'z', 0),
        jsonb_build_array(
            jsonb_build_object('trigger', 'examine chandelier', 'response', 'The chandelier sparkles overhead, casting dancing shadows.'),
            jsonb_build_object('trigger', 'listen to crowd', 'response', 'Patrons whisper about the mysterious disappearance.')
        ),
        jsonb_build_object(
            'audio_cues', jsonb_build_array('crowd_murmur', 'footsteps_marble'),
            'voice_description', 'A luxurious opera house lobby buzzing with concerned voices'
        ),
        1,
        now(),
        now()
    ),
    (
        gen_random_uuid(),
        mystery_id,
        world_id,
        'evidence',
        'Violin Case',
        'An expensive violin case, left open and empty on the stage. The velvet interior shows the impression of where the Stradivarius once lay.',
        'An empty violin case sits open before you. The red velvet interior bears the ghostly impression of the missing instrument.',
        jsonb_build_object('x', 10, 'y', 2, 'z', 0),
        jsonb_build_array(
            jsonb_build_object('trigger', 'examine case', 'response', 'The case is lined with red velvet. A small business card is tucked in the corner.'),
            jsonb_build_object('trigger', 'check for fingerprints', 'response', 'The case handle shows multiple fingerprints, but they appear smudged.')
        ),
        jsonb_build_object(
            'audio_cues', jsonb_build_array('case_closing_sound', 'velvet_rustle'),
            'voice_description', 'An elegant violin case, now ominously empty'
        ),
        2,
        now(),
        now()
    ),
    (
        gen_random_uuid(),
        mystery_id,
        world_id,
        'character',
        'Madame Isabella Rosetti',
        'The opera house director, a sophisticated woman in her 60s with an encyclopedic knowledge of the venue and its performers.',
        'Madame Rosetti approaches with the measured steps of someone accustomed to command. Her voice carries the authority of decades in the opera world.',
        jsonb_build_object('x', -5, 'y', 0, 'z', 2),
        jsonb_build_array(
            jsonb_build_object('trigger', 'ask about violinist', 'response', 'Maestro Benedetti was scheduled to perform tonight. He arrived early as always, around 6 PM.'),
            jsonb_build_object('trigger', 'ask about security', 'response', 'We have cameras in the lobby and hallways, but not in the dressing rooms for privacy reasons.')
        ),
        jsonb_build_object(
            'audio_cues', jsonb_build_array('heels_clicking', 'opera_director_voice'),
            'voice_description', 'A distinguished woman with an authoritative presence and cultured accent',
            'dialogue_style', 'formal, knowledgeable, slightly worried'
        ),
        3,
        now(),
        now()
    );

    -- Insert player progress tracking
    INSERT INTO public.player_progress (
        id,
        user_id,
        mystery_id,
        world_id,
        current_scene,
        discovered_evidence,
        character_interactions,
        voice_commands_used,
        accessibility_aids_used,
        completion_percentage,
        session_duration,
        hints_used,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        (SELECT user_id FROM public.user_profiles LIMIT 1),
        mystery_id,
        world_id,
        'The Grand Opera House Lobby',
        jsonb_build_array('Violin Case'),
        jsonb_build_array(
            jsonb_build_object(
                'character', 'Madame Isabella Rosetti',
                'interaction_count', 2,
                'last_interaction', now()
            )
        ),
        jsonb_build_array('examine violin case', 'ask about violinist', 'listen to crowd'),
        jsonb_build_array('screen_reader', 'voice_navigation', 'spatial_audio'),
        25.5,
        1800, -- 30 minutes
        1,
        now(),
        now()
    );

END $$;

-- Insert sample analytics data
INSERT INTO public.analytics_events (
    id,
    user_id,
    event_type,
    event_data,
    mystery_id,
    world_id,
    session_id,
    accessibility_context,
    created_at
) 
SELECT 
    gen_random_uuid(),
    up.user_id,
    event_types.event_type,
    event_types.event_data,
    (SELECT id FROM public.mysteries LIMIT 1),
    (SELECT world_id FROM public.mysteries LIMIT 1),
    gen_random_uuid(),
    jsonb_build_object(
        'screen_reader_active', true,
        'voice_commands_enabled', true,
        'spatial_audio_on', true
    ),
    now() - (random() * interval '7 days')
FROM public.user_profiles up,
(VALUES 
    ('mystery_started', jsonb_build_object('mystery_title', 'The Vanishing Violinist')),
    ('voice_command_used', jsonb_build_object('command', 'examine violin case', 'success', true)),
    ('evidence_discovered', jsonb_build_object('evidence', 'Violin Case', 'time_to_discover', 120)),
    ('character_interaction', jsonb_build_object('character', 'Madame Isabella Rosetti', 'dialogue_count', 3)),
    ('accessibility_feature_used', jsonb_build_object('feature', 'screen_reader', 'duration', 1800))
) AS event_types(event_type, event_data)
LIMIT 25;

-- Insert content creator data
INSERT INTO public.creator_analytics (
    id,
    creator_id,
    mystery_id,
    world_id,
    total_plays,
    completion_rate,
    avg_rating,
    total_ratings,
    accessibility_usage_stats,
    performance_metrics,
    created_at,
    updated_at
) 
SELECT 
    gen_random_uuid(),
    up.user_id,
    m.id,
    m.world_id,
    42,
    78.5,
    4.7,
    23,
    jsonb_build_object(
        'screen_reader_users', 15,
        'voice_only_users', 8,
        'spatial_audio_users', 35,
        'high_contrast_users', 5
    ),
    jsonb_build_object(
        'avg_session_duration', 2700,
        'bounce_rate', 12.5,
        'repeat_play_rate', 34.2,
        'hint_usage_rate', 15.8
    ),
    now(),
    now()
FROM public.user_profiles up
JOIN public.mysteries m ON m.creator_id = up.user_id;

COMMIT;