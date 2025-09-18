-- Production seed data for AudioVR
-- Enhanced mystery cases with full accessibility features

-- Insert sample mystery worlds
INSERT OR REPLACE INTO worlds (id, name, description, difficulty, estimated_duration, background_image, ambient_sound, available_cases, is_unlocked) VALUES
('victorian-london', 'Victorian London', 'Explore the fog-shrouded streets of 1890s London, where gaslight flickers through perpetual mist and mysteries lurk in every shadow. Experience the authentic atmosphere of Jack the Ripper''s era with spatial audio that transports you to cobblestone alleyways and dimly lit taverns.', 4, 45, 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800&h=600&fit=crop', 'victorian_ambient.mp3', 5, 1),
('modern-tokyo', 'Modern Tokyo', 'Navigate the neon-lit streets of contemporary Tokyo, where ancient traditions clash with cutting-edge technology. Solve crimes that blend cyberpunk elements with traditional Japanese mystery storytelling, all enhanced with dynamic binaural audio.', 3, 35, 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop', 'tokyo_ambient.mp3', 4, 1),
('space-station-omega', 'Space Station Omega', 'Investigate mysteries aboard a futuristic research station orbiting Earth. In the zero-gravity environment, every sound carries differently, creating unique spatial audio challenges as you uncover conspiracies among the stars.', 5, 60, 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&h=600&fit=crop', 'space_ambient.mp3', 3, 0);

-- Insert complete mystery cases
INSERT OR REPLACE INTO cases (id, title, world_id, description, difficulty, estimated_duration, current_chapter, total_chapters, background_image, progress, is_unlocked, last_played_at) VALUES
('whitechapel-mystery', 'The Whitechapel Mystery', 'victorian-london', 'A gruesome murder has shaken the fog-bound streets of Whitechapel. As Detective Inspector Harrison, you must navigate the treacherous underworld of Victorian London to catch a killer before they strike again. Use your voice to question suspects, examine evidence, and piece together clues in this fully accessible audio mystery.', 4, 45, 1, 5, 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800&h=600&fit=crop', 0, 1, datetime('now')),

('orient-express-murder', 'Murder on the Orient Express', 'victorian-london', 'A wealthy passenger is found dead in their luxury compartment aboard the famous Orient Express. With the train snowbound in the Alps, the killer must be among the passengers. Question each suspect using voice commands and uncover their secrets before the train reaches its destination.', 3, 40, 1, 4, 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop', 0, 1, datetime('now')),

('cyberpunk-conspiracy', 'The Neon Conspiracy', 'modern-tokyo', 'A tech executive''s apparent suicide in a Tokyo skyscraper hides a deeper corporate conspiracy. Navigate the rain-soaked neon streets, hack into secure systems using voice commands, and uncover the truth behind a web of digital deception in this cyberpunk thriller.', 4, 50, 1, 6, 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop', 0, 1, datetime('now')),

('orbital-sabotage', 'Orbital Sabotage', 'space-station-omega', 'Critical systems are failing aboard Space Station Omega, and sabotage is suspected. With limited oxygen and no escape pods, you must identify the saboteur among the crew before the station''s orbit decays. Experience zero-gravity investigation through innovative spatial audio design.', 5, 65, 1, 7, 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&h=600&fit=crop', 0, 0, NULL);

-- Insert detailed characters with voice acting notes
INSERT OR REPLACE INTO characters (id, name, role, avatar, voice_actor, description, is_alive, suspicion_level, case_id) VALUES
-- Whitechapel Mystery Characters
('sherlock-holmes', 'Sherlock Holmes', 'Consulting Detective', 'https://via.placeholder.com/120x120/2d3436/FFFFFF?text=SH', 'Benedict Cumberbatch', 'The world''s only consulting detective, known for his brilliant deductive reasoning and sharp wit. His voice is crisp and authoritative, with a slight London accent.', 1, 0, 'whitechapel-mystery'),
('inspector-lestrade', 'Inspector Lestrade', 'Scotland Yard Inspector', 'https://via.placeholder.com/120x120/e17055/FFFFFF?text=IL', 'Rupert Graves', 'A dedicated but often frustrated police inspector who relies on traditional investigative methods. Speaks with working-class London accent, often gruff but well-meaning.', 1, 15, 'whitechapel-mystery'),
('mary-kelly', 'Mary Kelly', 'Local Resident', 'https://via.placeholder.com/120x120/00b894/FFFFFF?text=MK', 'Keira Knightley', 'A witness to strange events in Whitechapel. Her voice trembles with fear but shows inner strength. Irish accent with nervous speech patterns.', 1, 25, 'whitechapel-mystery'),
('dr-watson', 'Dr. John Watson', 'Holmes'' Assistant', 'https://via.placeholder.com/120x120/0984e3/FFFFFF?text=JW', 'Martin Freeman', 'Holmes'' loyal companion and medical expert. Warm, reassuring voice with military bearing. Slight stutter when excited.', 1, 5, 'whitechapel-mystery'),
('jack-pemberton', 'Jack Pemberton', 'Suspicious Gentleman', 'https://via.placeholder.com/120x120/6c5ce7/FFFFFF?text=JP', 'Tom Hiddleston', 'A well-dressed man seen near the crime scene. Cultured upper-class accent with carefully measured words that hint at hidden secrets.', 1, 65, 'whitechapel-mystery'),

-- Orient Express Characters
('hercule-poirot', 'Hercule Poirot', 'Belgian Detective', 'https://via.placeholder.com/120x120/fdcb6e/FFFFFF?text=HP', 'David Suchet', 'The meticulous Belgian detective with his distinctive mustache and methodical approach. Speaks with precise French-accented English.', 1, 0, 'orient-express-murder'),
('countess-andrenyi', 'Countess Andrenyi', 'Hungarian Aristocrat', 'https://via.placeholder.com/120x120/e84393/FFFFFF?text=CA', 'Judi Dench', 'An elegant Hungarian countess traveling incognito. Speaks with regal bearing and slight Eastern European accent.', 1, 40, 'orient-express-murder'),
('colonel-arbuthnot', 'Colonel Arbuthnot', 'British Military Officer', 'https://via.placeholder.com/120x120/00b894/FFFFFF?text=AR', 'Hugh Bonneville', 'A retired British colonel with strong opinions and military precision. Clipped, authoritative speech with military terminology.', 1, 30, 'orient-express-murder');

-- Insert comprehensive evidence with audio descriptions
INSERT OR REPLACE INTO evidence (id, name, description, type, found_at, is_key, case_id, audio_description) VALUES
-- Whitechapel Mystery Evidence
('bloody-knife', 'Bloodstained Knife', 'A sharp butcher''s knife found at the crime scene, covered in dried blood with distinctive nicks on the blade suggesting professional use.', 'physical', 'Crime Scene - Dorset Street', 1, 'whitechapel-mystery', 'The knife clinks against the examination table. You can hear the dried blood flaking off as you turn it. The blade has a distinctive whistle when moved through air.'),
('witness-testimony', 'Mary Kelly''s Testimony', 'Detailed account from Mary Kelly about seeing a well-dressed gentleman near the victim''s lodgings on the night of the murder.', 'testimony', 'Witness Interview', 0, 'whitechapel-mystery', 'Mary''s voice trembles as she recounts the events. You can hear the fear in her Irish accent as she describes the mysterious figure.'),
('threatening-letter', 'Anonymous Threat', 'A crudely written letter threatening the victim, found hidden under floorboards in the victim''s room.', 'document', 'Victim''s Lodgings', 1, 'whitechapel-mystery', 'The paper crackles with age and dampness. The handwriting is shaky, suggesting either poor education or deliberate disguise.'),
('pocket-watch', 'Engraved Pocket Watch', 'An expensive gold pocket watch found near the body, engraved with initials "J.P." and bearing scratches consistent with a struggle.', 'physical', 'Crime Scene - Body', 1, 'whitechapel-mystery', 'The watch ticks loudly in the silence. When opened, it plays a haunting melody box tune. The engraving feels rough under your fingertips.'),

-- Orient Express Evidence
('train-ticket', 'First Class Ticket Stub', 'A partially torn first-class ticket found in the victim''s compartment, showing signs of having been handled by multiple people.', 'document', 'Victim''s Compartment', 0, 'orient-express-murder', 'The ticket stub rustles like old parchment. Multiple fingerprints have left the paper slightly damp and worn.'),
('monogrammed-handkerchief', 'Silk Handkerchief', 'An expensive silk handkerchief embroidered with the letter "A" found wedged behind the victim''s berth.', 'physical', 'Victim''s Berth', 1, 'orient-express-murder', 'The silk whispers against your fingers. The embroidery is raised and intricate, clearly expensive craftsmanship.');

-- Insert locations with spatial audio design
INSERT OR REPLACE INTO locations (id, name, description, audio_description, ambient_sound, case_id, connected_locations) VALUES
-- Whitechapel Mystery Locations
('dorset-street', 'Dorset Street Crime Scene', 'A narrow, fog-shrouded alley in Whitechapel where the victim was discovered. Gas lamps flicker weakly, casting dancing shadows on wet cobblestones.', 'Footsteps echo off narrow brick walls. Distant sounds of the Thames and occasional horse hooves on cobblestones. Gas lamps hiss softly overhead.', 'whitechapel_street_ambient.mp3', 'whitechapel-mystery', 'ten-bells-pub,commercial-street'),
('ten-bells-pub', 'The Ten Bells Public House', 'A dimly lit Victorian pub where locals gather to drink and share gossip. The victim was seen here on the night of the murder.', 'Conversations murmur in the background. Glasses clink, chairs scrape on wooden floors. A piano plays melancholy tunes in the corner.', 'victorian_pub_ambient.mp3', 'whitechapel-mystery', 'dorset-street,commercial-street'),
('scotland-yard', 'Scotland Yard Office', 'The headquarters of London''s Metropolitan Police. Inspector Lestrade''s office overlooks the Thames.', 'Papers shuffle on desks. Distant sounds of the Thames through windows. Authoritative voices discussing cases in adjacent rooms.', 'police_office_ambient.mp3', 'whitechapel-mystery', 'commercial-street'),
('baker-street', 'Baker Street - Holmes'' Study', '221B Baker Street, the famous consulting room of Sherlock Holmes. Filled with scientific instruments and the lingering aroma of pipe tobacco.', 'A fire crackles in the fireplace. Papers rustle as Holmes organizes his notes. The occasional bubble from chemistry experiments.', 'holmes_study_ambient.mp3', 'whitechapel-mystery', 'commercial-street'),

-- Orient Express Locations
('dining-car', 'Orient Express Dining Car', 'An elegant dining car with white tablecloths and crystal glasses. Passengers take their meals while the train rocks gently through the countryside.', 'Crystal glasses chime with the train''s movement. Silverware clinks against fine china. Muted conversations in multiple languages.', 'train_dining_ambient.mp3', 'orient-express-murder', 'first-class-corridor,observation-car'),
('first-class-corridor', 'First Class Corridor', 'A narrow, luxuriously appointed corridor connecting the first-class compartments. Rich carpet muffles footsteps.', 'The train''s rhythmic clacking on tracks. Muffled conversations from behind compartment doors. Occasional conductor announcements.', 'train_corridor_ambient.mp3', 'orient-express-murder', 'dining-car,victim-compartment'),
('victim-compartment', 'Victim''s Compartment', 'The scene of the crime - a first-class sleeping compartment now sealed off by authorities. Rich furnishings are now evidence in a murder.', 'Silence broken only by the train''s movement. Every small sound seems amplified - fabric settling, wood creaking with the train''s sway.', 'empty_compartment_ambient.mp3', 'orient-express-murder', 'first-class-corridor');

-- Insert voice commands for accessibility
INSERT OR REPLACE INTO voice_commands (id, pattern, intent, context, examples, case_id) VALUES
-- Navigation Commands
('nav_go_to', 'go to {location}', 'navigate', 'exploration', 'go to the dining car, go to Baker Street, go to Scotland Yard', NULL),
('nav_move_direction', 'move {direction}', 'move', 'exploration', 'move forward, move back, move left, move right', NULL),
('nav_enter', 'enter {room}', 'enter', 'exploration', 'enter the compartment, enter the pub, enter Holmes'' study', NULL),

-- Investigation Commands
('inv_examine', 'examine {object}', 'examine', 'investigation', 'examine the knife, examine the letter, examine the watch', NULL),
('inv_look_at', 'look at {target}', 'look', 'investigation', 'look at the body, look at the evidence, look at the scene', NULL),
('inv_search', 'search {area}', 'search', 'investigation', 'search the room, search the compartment, search the alley', NULL),

-- Conversation Commands  
('conv_question', 'ask {character} about {topic}', 'question', 'conversation', 'ask Holmes about the case, ask Mary about the stranger', NULL),
('conv_accuse', 'accuse {character}', 'accuse', 'conversation', 'accuse Jack Pemberton, accuse the Colonel', NULL),
('conv_show', 'show {evidence} to {character}', 'show_evidence', 'conversation', 'show the knife to Holmes, show the letter to Lestrade', NULL),

-- System Commands
('sys_repeat', 'repeat', 'repeat', 'universal', 'repeat, say again, what did you say', NULL),
('sys_help', 'help', 'help', 'universal', 'help, what can I do, available commands', NULL),
('sys_describe', 'describe scene', 'describe', 'universal', 'describe the scene, where am I, what can I see', NULL);

-- Insert audio triggers for dynamic soundscapes
INSERT OR REPLACE INTO audio_triggers (id, name, trigger_type, trigger_condition, audio_file, volume, fade_in, fade_out, case_id, location_id) VALUES
-- Environmental triggers
('fog_horn', 'Thames Fog Horn', 'location_enter', 'location:dorset-street', 'thames_foghorn.mp3', 0.6, 2.0, 3.0, 'whitechapel-mystery', 'dorset-street'),
('church_bells', 'Distant Church Bells', 'time_trigger', 'hour:evening', 'church_bells_distant.mp3', 0.4, 3.0, 4.0, 'whitechapel-mystery', NULL),
('train_whistle', 'Orient Express Whistle', 'location_enter', 'location:dining-car', 'train_whistle.mp3', 0.7, 1.0, 2.0, 'orient-express-murder', 'dining-car'),

-- Action triggers
('evidence_found', 'Evidence Discovery', 'evidence_found', 'evidence:bloody-knife', 'evidence_discovery.mp3', 0.8, 0.5, 1.0, 'whitechapel-mystery', NULL),
('revelation_sting', 'Mystery Revelation', 'dialogue_complete', 'dialogue:major_revelation', 'revelation_sting.mp3', 0.9, 0.2, 2.0, NULL, NULL),

-- Accessibility audio cues
('location_audio_cue', 'Location Entry Audio Cue', 'location_enter', 'any_location', 'location_entry_chime.mp3', 0.5, 0.3, 0.3, NULL, NULL),
('interaction_available', 'Interaction Available Cue', 'interaction_focus', 'interactive_object', 'interaction_chime.mp3', 0.4, 0.1, 0.1, NULL, NULL);

-- Insert user progress tracking
INSERT OR REPLACE INTO user_progress (id, user_id, total_cases_completed, total_play_time, current_streak, difficulty_preference, accessibility_settings) VALUES
('demo_user', 'demo_user_001', 0, 0, 0, 'medium', '{"voice_navigation_enabled": true, "screen_reader_optimized": true, "haptic_feedback_enabled": true, "spatial_audio_enabled": true}');

-- Insert achievements system
INSERT OR REPLACE INTO achievements (id, name, description, icon, target_value, unlock_condition) VALUES
('first_case_solved', 'First Case Solved', 'Complete your first detective mystery', 'trophy', 1, 'cases_completed >= 1'),
('voice_commander', 'Voice Commander', 'Use voice commands 50 times successfully', 'microphone', 50, 'voice_commands_used >= 50'),
('master_detective', 'Master Detective', 'Solve 10 mystery cases', 'detective-badge', 10, 'cases_completed >= 10'),
('accessibility_champion', 'Accessibility Champion', 'Use all accessibility features', 'accessibility', 1, 'all_accessibility_features_used = true'),
('world_explorer', 'World Explorer', 'Unlock all mystery worlds', 'globe', 3, 'unlocked_worlds >= 3');