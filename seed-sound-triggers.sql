-- Horror World Sound Triggers
INSERT OR IGNORE INTO sound_triggers (trigger_id, world, keywords, sound_file, effect_type, intensity, duration, fade_in, fade_out, loop, priority) VALUES
('horror_door_creak', 'horror', '["door", "open", "creak", "entrance", "enter"]', 'https://audiovr-media.r2.dev/sounds/horror/door_creak.mp3', 'action', 0.6, 3000, 100, 200, 0, 7),
('horror_footsteps', 'horror', '["footsteps", "walking", "approaching", "steps", "coming closer"]', 'https://audiovr-media.r2.dev/sounds/horror/footsteps.mp3', 'action', 0.4, 2000, 0, 100, 0, 5),
('horror_scream', 'horror', '["scream", "shriek", "terror", "afraid", "horrified"]', 'https://audiovr-media.r2.dev/sounds/horror/scream.mp3', 'emotional', 0.8, 2500, 0, 500, 0, 9),
('horror_heartbeat', 'horror', '["heart", "beating", "pulse", "nervous", "anxious"]', 'https://audiovr-media.r2.dev/sounds/horror/heartbeat.mp3', 'emotional', 0.5, 4000, 500, 500, 1, 6),
('horror_whispers', 'horror', '["whisper", "voices", "murmur", "shadows", "speaking softly"]', 'https://audiovr-media.r2.dev/sounds/horror/whispers.mp3', 'ambient', 0.3, 8000, 1000, 1000, 1, 4),
('horror_thunder', 'horror', '["thunder", "lightning", "storm", "tempest"]', 'https://audiovr-media.r2.dev/sounds/horror/thunder.mp3', 'environmental', 0.7, 4000, 0, 1000, 0, 8),
('horror_chains', 'horror', '["chains", "rattling", "shackles", "prison", "bound"]', 'https://audiovr-media.r2.dev/sounds/horror/chains.mp3', 'action', 0.5, 2500, 100, 100, 0, 6),
('horror_growl', 'horror', '["growl", "snarl", "beast", "monster", "creature"]', 'https://audiovr-media.r2.dev/sounds/horror/growl.mp3', 'action', 0.6, 1500, 0, 200, 0, 7),
('horror_wind', 'horror', '["wind", "howling", "breeze", "draft"]', 'https://audiovr-media.r2.dev/sounds/horror/wind.mp3', 'environmental', 0.4, 5000, 1000, 1000, 1, 3),
('horror_clock', 'horror', '["clock", "ticking", "midnight", "time"]', 'https://audiovr-media.r2.dev/sounds/horror/clock_ticking.mp3', 'ambient', 0.3, 3000, 200, 200, 1, 4);

-- Detective World Sound Triggers
INSERT OR IGNORE INTO sound_triggers (trigger_id, world, keywords, sound_file, effect_type, intensity, duration, fade_in, fade_out, loop, priority) VALUES
('detective_typewriter', 'detective', '["typing", "typewriter", "report", "writing", "documenting"]', 'https://audiovr-media.r2.dev/sounds/detective/typewriter.mp3', 'ambient', 0.3, 3000, 200, 200, 0, 4),
('detective_phone_ring', 'detective', '["phone", "ring", "call", "telephone", "dialing"]', 'https://audiovr-media.r2.dev/sounds/detective/phone_ring.mp3', 'action', 0.5, 2000, 0, 100, 0, 7),
('detective_gunshot', 'detective', '["gun", "shot", "fire", "shoot", "bang"]', 'https://audiovr-media.r2.dev/sounds/detective/gunshot.mp3', 'action', 0.8, 500, 0, 0, 0, 10),
('detective_jazz', 'detective', '["music", "jazz", "bar", "lounge", "nightclub"]', 'https://audiovr-media.r2.dev/sounds/detective/jazz_ambient.mp3', 'ambient', 0.2, 30000, 2000, 2000, 1, 3),
('detective_rain', 'detective', '["rain", "raining", "weather", "outside", "downpour"]', 'https://audiovr-media.r2.dev/sounds/detective/rain.mp3', 'environmental', 0.3, 10000, 1000, 1000, 1, 3),
('detective_car', 'detective', '["car", "drive", "engine", "vehicle", "automobile"]', 'https://audiovr-media.r2.dev/sounds/detective/car_engine.mp3', 'action', 0.4, 3000, 500, 500, 0, 5),
('detective_lighter', 'detective', '["lighter", "cigarette", "smoke", "light"]', 'https://audiovr-media.r2.dev/sounds/detective/lighter.mp3', 'action', 0.3, 1000, 0, 100, 0, 4),
('detective_glass', 'detective', '["glass", "drink", "whiskey", "pour"]', 'https://audiovr-media.r2.dev/sounds/detective/glass_clink.mp3', 'action', 0.3, 800, 0, 0, 0, 3);

-- Sci-Fi World Sound Triggers
INSERT OR IGNORE INTO sound_triggers (trigger_id, world, keywords, sound_file, effect_type, intensity, duration, fade_in, fade_out, loop, priority) VALUES
('scifi_laser', 'scifi', '["laser", "blast", "fire", "shoot", "phaser"]', 'https://audiovr-media.r2.dev/sounds/scifi/laser.mp3', 'action', 0.6, 1000, 0, 100, 0, 8),
('scifi_computer', 'scifi', '["computer", "terminal", "console", "data", "system"]', 'https://audiovr-media.r2.dev/sounds/scifi/computer_beeps.mp3', 'ambient', 0.3, 2000, 0, 0, 0, 4),
('scifi_alarm', 'scifi', '["alarm", "alert", "warning", "danger", "emergency"]', 'https://audiovr-media.r2.dev/sounds/scifi/alarm.mp3', 'environmental', 0.7, 3000, 0, 0, 1, 9),
('scifi_engine', 'scifi', '["engine", "ship", "warp", "thrust", "reactor"]', 'https://audiovr-media.r2.dev/sounds/scifi/engine_hum.mp3', 'ambient', 0.4, 5000, 1000, 1000, 1, 4),
('scifi_teleport', 'scifi', '["teleport", "beam", "transport", "materialize", "dematerialize"]', 'https://audiovr-media.r2.dev/sounds/scifi/teleport.mp3', 'action', 0.5, 2000, 200, 200, 0, 6),
('scifi_door', 'scifi', '["door", "airlock", "hatch", "seal"]', 'https://audiovr-media.r2.dev/sounds/scifi/door_hiss.mp3', 'action', 0.4, 1500, 0, 100, 0, 5),
('scifi_robot', 'scifi', '["robot", "android", "mechanical", "servo"]', 'https://audiovr-media.r2.dev/sounds/scifi/robot_voice.mp3', 'action', 0.5, 1000, 0, 0, 0, 6);

-- Fantasy World Sound Triggers
INSERT OR IGNORE INTO sound_triggers (trigger_id, world, keywords, sound_file, effect_type, intensity, duration, fade_in, fade_out, loop, priority) VALUES
('fantasy_magic', 'fantasy', '["magic", "spell", "cast", "enchant", "wizard"]', 'https://audiovr-media.r2.dev/sounds/fantasy/magic_cast.mp3', 'action', 0.6, 2000, 200, 300, 0, 8),
('fantasy_sword', 'fantasy', '["sword", "blade", "slash", "strike", "weapon"]', 'https://audiovr-media.r2.dev/sounds/fantasy/sword_clash.mp3', 'action', 0.7, 800, 0, 0, 0, 7),
('fantasy_dragon', 'fantasy', '["dragon", "roar", "beast", "creature"]', 'https://audiovr-media.r2.dev/sounds/fantasy/dragon_roar.mp3', 'action', 0.8, 3000, 0, 500, 0, 9),
('fantasy_tavern', 'fantasy', '["tavern", "inn", "drinking", "celebration"]', 'https://audiovr-media.r2.dev/sounds/fantasy/tavern_ambient.mp3', 'ambient', 0.3, 20000, 1500, 1500, 1, 3),
('fantasy_forest', 'fantasy', '["forest", "woods", "trees", "nature"]', 'https://audiovr-media.r2.dev/sounds/fantasy/forest_ambient.mp3', 'environmental', 0.3, 15000, 2000, 2000, 1, 3);