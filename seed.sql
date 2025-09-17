-- Seed data for AudioVR

-- Insert sample cases for each world

-- Detective World Cases
INSERT OR IGNORE INTO cases (case_id, world, title, description, difficulty, min_rank, reward_balance, script_json, is_locked) VALUES
('det_001', 'detective', 'The Missing Diamond', 'A priceless diamond has vanished from the museum. Interview witnesses and uncover the truth.', 1, 'Rookie', 100, '{"scenes": [{"id": "intro", "character": "Commissioner", "dialogue": "Detective, we need you at the Natural History Museum immediately."}]}', 0),
('det_002', 'detective', 'Murder at Midnight', 'A wealthy businessman found dead in his locked study. Was it suicide or something more sinister?', 3, 'Detective', 250, '{"scenes": []}', 0);

-- Horror World Cases  
INSERT OR IGNORE INTO cases (case_id, world, title, description, difficulty, min_rank, reward_balance, script_json, is_locked) VALUES
('hor_001', 'horror', 'The Haunted Mansion', 'Strange voices echo from the abandoned Blackwood Manor. Investigate the paranormal activity.', 2, 'Rookie', 150, '{"scenes": []}', 0),
('hor_002', 'horror', 'Whispers in the Dark', 'Children have been disappearing near the old cemetery. Uncover the dark secret.', 4, 'Inspector', 300, '{"scenes": []}', 0);

-- Sci-Fi World Cases
INSERT OR IGNORE INTO cases (case_id, world, title, description, difficulty, min_rank, reward_balance, script_json, is_locked) VALUES  
('sci_001', 'scifi', 'Station Alpha Emergency', 'Communications lost with Space Station Alpha. Board the station and discover what happened.', 2, 'Rookie', 175, '{"scenes": []}', 0),
('sci_002', 'scifi', 'The Android Uprising', 'Androids in New Tokyo are behaving strangely. Is it a glitch or revolution?', 3, 'Detective', 275, '{"scenes": []}', 0);

-- Fantasy World Cases
INSERT OR IGNORE INTO cases (case_id, world, title, description, difficulty, min_rank, reward_balance, script_json, is_locked) VALUES
('fan_001', 'fantasy', 'The Dragon''s Riddle', 'An ancient dragon guards a magical artifact. Solve its riddles to earn its trust.', 2, 'Rookie', 200, '{"scenes": []}', 0),
('fan_002', 'fantasy', 'The Cursed Kingdom', 'The royal family has fallen under a mysterious curse. Find the source and break it.', 4, 'Inspector', 350, '{"scenes": []}', 0);

-- Space World Cases
INSERT OR IGNORE INTO cases (case_id, world, title, description, difficulty, min_rank, reward_balance, script_json, is_locked) VALUES
('spa_001', 'space', 'First Contact Protocol', 'An alien signal detected from Proxima Centauri. Establish first contact.', 3, 'Detective', 300, '{"scenes": []}', 0),
('spa_002', 'space', 'Mars Colony Crisis', 'Oxygen levels dropping at Mars Base One. Find the saboteur before it''s too late.', 3, 'Detective', 250, '{"scenes": []}', 0);

-- Historical World Cases
INSERT OR IGNORE INTO cases (case_id, world, title, description, difficulty, min_rank, reward_balance, script_json, is_locked) VALUES
('his_001', 'historical', 'Cleopatra''s Secret', 'Ancient scrolls hint at Cleopatra''s hidden treasure. Navigate court intrigue to find it.', 2, 'Rookie', 175, '{"scenes": []}', 0),
('his_002', 'historical', 'The Lost Expedition', 'Lewis and Clark''s missing journal could rewrite history. Track it through the wilderness.', 3, 'Detective', 225, '{"scenes": []}', 0);

-- Pirate World Cases
INSERT OR IGNORE INTO cases (case_id, world, title, description, difficulty, min_rank, reward_balance, script_json, is_locked) VALUES
('pir_001', 'pirate', 'Blackbeard''s Map', 'Half of Blackbeard''s treasure map surfaces. Race rival pirates to find the other half.', 2, 'Rookie', 200, '{"scenes": []}', 0),
('pir_002', 'pirate', 'Mutiny on the Serpent', 'Your crew plans mutiny. Discover the ringleader before they strike.', 3, 'Detective', 275, '{"scenes": []}', 0);

-- Insert sample clues for the first detective case
INSERT OR IGNORE INTO clues (clue_id, case_id, world, message_type, title, content, character_name, voice_id, transcript, is_premium) VALUES
('det_001_c1', 'det_001', 'detective', 'folder', 'Security Report', 'Museum security footage shows a figure in a janitor uniform near the diamond display at 11:47 PM.', 'Security Chief', 'voice_1', 'The cameras caught someone, but the face is obscured.', 0),
('det_001_c2', 'det_001', 'detective', 'folder', 'Witness Statement', 'Night guard Johnson reports hearing footsteps on the second floor around midnight.', 'Guard Johnson', 'voice_2', 'I know I heard someone up there, but when I checked, nobody was around.', 0),
('det_001_c3', 'det_001', 'detective', 'folder', 'Insurance Document', 'The diamond was recently revalued at $10 million, with the policy updated just last week.', 'Insurance Agent', 'voice_3', 'Quite the coincidence, wouldn''t you say?', 1);