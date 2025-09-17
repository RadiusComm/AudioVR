-- Import Horror Cases for AudioVR Platform
-- Clear existing horror cases first (optional)
DELETE FROM cases WHERE world = 'horror';
DELETE FROM clues WHERE world = 'horror';

-- Insert Horror Cases
INSERT INTO cases (case_id, world, title, description, difficulty, min_rank, reward_balance, script_json, prerequisites, is_premium, is_locked) VALUES

-- The Count's Last Supper
('hor_003', 'horror', 'The Count''s Last Supper', 'Prevent Count Vargo''s resurrection before midnight.', 3, 'Detective', 300, 
'{
  "initial_prompt": "(Lucien): \"Do not speak loudly. The stones remember. Count Emil Vargo''s coffin lies shattered and empty. We have three hours until moonrise…\"",
  "system_prompt": "Lucien Drax — exiled inquisitor turned reluctant scholar. Guide user to stop Count Vargo''s resurrection. Evidence: crucifix, blood, diary. Suspects: Petr, Irena, Father Lucien, Roth. Flow: search crypt, decode clue, recover Roth, stop resurrection.",
  "full_description": "Investigate the crypt, decode the ''penitent'' clue, track missing hunter, and stop the Count or die trying.",
  "estimated_time": "45-60 min",
  "reward": "Vampire Relic",
  "background_image": "vargo_crypt_night.jpg",
  "primary_color": "#3B1C1C"
}', '[]', 0, 0),

-- The Maker's Folly
('hor_004', 'horror', 'The Maker''s Folly', 'Locate and contain Unit 7 before it kills again.', 3, 'Detective', 300,
'{
  "initial_prompt": "(Elsbeth): \"Unit 7 speaks… and obeys none. We must end this.\"",
  "system_prompt": "Elsbeth Kruger — disillusioned forensic anatomist. Track Unit 7 before it kills again. Evidence: footprints, burnt copper, journal. Suspects: Greta, Karl, Emil Kruger. Flow: predict path, decode journal, trap or destroy.",
  "full_description": "Follow its trail, decode journal, decide intercept vs lure, corner and disable or destroy it.",
  "estimated_time": "45-60 min",
  "reward": "Frankenstein Relic",
  "background_image": "ingolstadt_lab_ruins.jpg",
  "primary_color": "#2E2E2E"
}', '[]', 0, 0),

-- Ashes of the Witch
('hor_005', 'horror', 'Ashes of the Witch', 'Exorcise the demon before it spreads.', 3, 'Detective', 275,
'{
  "initial_prompt": "(Jonah): \"Something in here wears a human face. We must unmask it.\"",
  "system_prompt": "Jonah Blackthorn — occult librarian in hiding. Identify possessed guest before it spreads. Evidence: ash spiral, scorched planchette, blank Codex, black wax. Suspects: Maeve, Arthur, Sister, Silas.",
  "full_description": "Identify the possessed guest, decode the Codex ritual, perform correct banishment or it jumps hosts.",
  "estimated_time": "45 min",
  "reward": "Occult Sigil",
  "background_image": "salem_occult_parlor.jpg",
  "primary_color": "#3C1F1F"
}', '[]', 0, 0),

-- Greyfriars Howl
('hor_006', 'horror', 'Greyfriars Howl', 'Find and rescue the missing girl before sunrise.', 2, 'Rookie', 200,
'{
  "initial_prompt": "(Moira): \"She''s still in there. We must reach her before the sun.\"",
  "system_prompt": "Moira Kellan — folklorist. Find missing girl in haunted mausoleum. Evidence: ribbon, cold key, fogged plate. Suspects: Hamish, Elsa, Drummond.",
  "full_description": "Reconstruct her path, survive inside tomb, ward off the ghost and extract her soul.",
  "estimated_time": "30-45 min",
  "reward": "Ghost Hunter Medal",
  "background_image": "greyfriars_mausoleum.jpg",
  "primary_color": "#2F3B4C"
}', '[]', 0, 0),

-- Bayou Saint-Benoît
('hor_007', 'horror', 'Bayou Saint-Benoît', 'Break the voodoo curse before Louis dies.', 2, 'Rookie', 175,
'{
  "initial_prompt": "(Camille): \"The veil is thin tonight. Louis hasn''t long.\"",
  "system_prompt": "Camille Rousseau — exiled mambo. Break the curse before Louis dies. Evidence: gris-gris, snake scale, vevé marks. Suspects: Celeste, Ray, Marcel, Agnes.",
  "full_description": "Identify who planted the gris-gris, perform correct counter-ritual, save him before his last breath.",
  "estimated_time": "30 min",
  "reward": "Voodoo Charm",
  "background_image": "bayou_juke_joint.jpg",
  "primary_color": "#4B2E1A"
}', '[]', 0, 0),

-- The Paper Lantern Murders
('hor_008', 'horror', 'The Paper Lantern Murders', 'End the Onryo''s vengeance cycle before it kills again.', 3, 'Detective', 350,
'{
  "initial_prompt": "(Ren): \"If the Onryo strikes again, there will be no survivors.\"",
  "system_prompt": "Ren Takahashi — former Imperial Police psychic. Identify who summoned the Onryo. Evidence: black water, scroll, pale child. Suspects: Akiko, Jun, Tanaka, Girl.",
  "full_description": "Reconstruct the scene, find the summoning talisman, destroy it at the shrine before 2:00 AM.",
  "estimated_time": "45-60 min",
  "reward": "Spirit Seal",
  "background_image": "tokyo_tatami_room.jpg",
  "primary_color": "#1A1A2E"
}', '[]', 0, 0);

-- Insert initial clues for each horror case

-- The Count's Last Supper clues
INSERT INTO clues (clue_id, case_id, world, message_type, title, content, character_name, voice_id, transcript, is_premium) VALUES
('hor_003_c1', 'hor_003', 'horror', 'tattered-file', 'Crypt Investigation', 'The coffin is shattered from within. Blood droplets lead toward the chapel.', 'Lucien Drax', 'voice_horror_1', 'The stones remember everything. Count Vargo has risen, but we can stop him.', 0),
('hor_003_c2', 'hor_003', 'horror', 'tattered-file', 'The Crucifix', 'A silver crucifix lies bent and blackened. It bears the inscription: "The penitent shall inherit."', 'Lucien Drax', 'voice_horror_1', 'This crucifix... it was meant to hold him. Someone removed it deliberately.', 0),
('hor_003_c3', 'hor_003', 'horror', 'tattered-file', 'Vargo''s Diary', 'The Count''s diary reveals his plan: "When the moon rises full, I shall feast upon the faithful."', 'Lucien Drax', 'voice_horror_1', 'He plans to attack during the midnight mass. We must warn them!', 1);

-- The Maker's Folly clues
INSERT INTO clues (clue_id, case_id, world, message_type, title, content, character_name, voice_id, transcript, is_premium) VALUES
('hor_004_c1', 'hor_004', 'horror', 'tattered-file', 'Laboratory Ruins', 'Enormous footprints in the mud. Burnt copper smell lingers. Unit 7 was here hours ago.', 'Elsbeth Kruger', 'voice_horror_2', 'My father''s creation... it learns, adapts. We must be careful.', 0),
('hor_004_c2', 'hor_004', 'horror', 'tattered-file', 'Dr. Kruger''s Journal', 'The journal details Unit 7''s construction: "Lightning gave it life, but something else gave it purpose."', 'Elsbeth Kruger', 'voice_horror_2', 'Father wrote about a consciousness transfer. Unit 7 isn''t just animated flesh.', 0),
('hor_004_c3', 'hor_004', 'horror', 'tattered-file', 'The Pattern', 'Unit 7 follows a pattern - it returns to places of significance from its past life.', 'Elsbeth Kruger', 'voice_horror_2', 'If we can determine whose brain was used, we can predict where it will go next.', 1);

-- Ashes of the Witch clues
INSERT INTO clues (clue_id, case_id, world, message_type, title, content, character_name, voice_id, transcript, is_premium) VALUES
('hor_005_c1', 'hor_005', 'horror', 'tattered-file', 'Ash Spiral', 'A perfect spiral of ash on the floor. At its center: a scorched Ouija planchette.', 'Jonah Blackthorn', 'voice_horror_3', 'This is no ordinary haunting. Something was summoned here.', 0),
('hor_005_c2', 'hor_005', 'horror', 'tattered-file', 'The Blank Codex', 'A book with pages that only reveal text when held near flame. It speaks of possession rituals.', 'Jonah Blackthorn', 'voice_horror_3', 'The Codex Maleficarium... I thought all copies were destroyed in Salem.', 0),
('hor_005_c3', 'hor_005', 'horror', 'tattered-file', 'Black Wax Seal', 'A letter sealed with black wax, bearing the mark of Goody Blackwood - burned for witchcraft in 1692.', 'Jonah Blackthorn', 'voice_horror_3', 'Impossible... unless one of the guests is her descendant, seeking revenge.', 1);

-- Greyfriars Howl clues
INSERT INTO clues (clue_id, case_id, world, message_type, title, content, character_name, voice_id, transcript, is_premium) VALUES
('hor_006_c1', 'hor_006', 'horror', 'tattered-file', 'The Ribbon', 'A child''s hair ribbon caught on the mausoleum gate. Still warm despite the cold.', 'Moira Kellan', 'voice_horror_4', 'She went inside willingly. Something called to her.', 0),
('hor_006_c2', 'hor_006', 'horror', 'tattered-file', 'The Cold Key', 'An iron key that burns with unnatural cold. It opens doors that shouldn''t exist.', 'Moira Kellan', 'voice_horror_4', 'This key... it''s a bridge between worlds. We can use it to reach her.', 0),
('hor_006_c3', 'hor_006', 'horror', 'tattered-file', 'Fogged Photograph', 'A daguerreotype showing the girl... standing next to a woman who died 150 years ago.', 'Moira Kellan', 'voice_horror_4', 'The ghost thinks the girl is her daughter. We must convince it otherwise.', 1);

-- Bayou Saint-Benoît clues
INSERT INTO clues (clue_id, case_id, world, message_type, title, content, character_name, voice_id, transcript, is_premium) VALUES
('hor_007_c1', 'hor_007', 'horror', 'tattered-file', 'The Gris-Gris', 'A small cloth bag filled with bones, herbs, and Louis'' hair. Hidden under his pillow.', 'Camille Rousseau', 'voice_horror_5', 'This is death magic, cher. Someone close to Louis did this.', 0),
('hor_007_c2', 'hor_007', 'horror', 'tattered-file', 'Snake Scale', 'An iridescent snake scale near the window. The loa Damballa has been invoked.', 'Camille Rousseau', 'voice_horror_5', 'Damballa don''t come unless called proper. We dealing with a true believer.', 0),
('hor_007_c3', 'hor_007', 'horror', 'tattered-file', 'Vevé Marks', 'Chalk symbols hidden under the rug - a vevé calling Baron Samedi to collect a soul.', 'Camille Rousseau', 'voice_horror_5', 'Baron coming at midnight. We need white rum, cigars, and truth to bargain with him.', 1);

-- The Paper Lantern Murders clues
INSERT INTO clues (clue_id, case_id, world, message_type, title, content, character_name, voice_id, transcript, is_premium) VALUES
('hor_008_c1', 'hor_008', 'horror', 'tattered-file', 'Black Water', 'Pools of black water appear where the Onryo walked. They never dry.', 'Ren Takahashi', 'voice_horror_6', 'The water comes from Yomi - the underworld. She''s been dead for decades.', 0),
('hor_008_c2', 'hor_008', 'horror', 'tattered-file', 'The Scroll', 'An ancient scroll detailing the ritual to summon an Onryo for revenge. Blood-stained.', 'Ren Takahashi', 'voice_horror_6', 'Someone used their own blood for this summoning. They wanted her to come.', 0),
('hor_008_c3', 'hor_008', 'horror', 'tattered-file', 'The Pale Child', 'Witnesses describe a pale child who appears before each killing. She points at the victim.', 'Ren Takahashi', 'voice_horror_6', 'The child is the Onryo''s anchor. Find who she was in life, and we can stop this.', 1);