import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt } from 'hono/jwt'

type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
  AI: Ai; // Cloudflare AI for voice processing
}

interface VoiceProfile {
  id: string;
  user_id: string;
  profile_name: string;
  accent: string;
  speaking_rate: number; // words per minute
  pitch_range: { min: number; max: number };
  volume_preference: number;
  pronunciation_patterns: Record<string, string>;
  common_commands: string[];
  recognition_confidence_threshold: number;
  background_noise_level: number;
  created_at: string;
  updated_at: string;
}

interface PersonalizationSettings {
  id: string;
  user_id: string;
  voice_feedback_style: 'concise' | 'detailed' | 'immersive';
  spatial_audio_sensitivity: number; // 0.1 to 1.0
  command_confirmation_mode: 'always' | 'on_low_confidence' | 'never';
  preferred_voice_character: string;
  accessibility_adaptations: {
    screen_reader_integration: boolean;
    haptic_feedback_intensity: number;
    visual_cue_preferences: string[];
    cognitive_load_level: 'low' | 'medium' | 'high';
  };
  learning_preferences: {
    training_session_length: number; // minutes
    feedback_frequency: 'immediate' | 'end_of_session' | 'milestone_based';
    difficulty_progression: 'automatic' | 'manual';
    focus_areas: string[];
  };
  updated_at: string;
}

interface TrainingSession {
  id: string;
  user_id: string;
  session_type: 'initial_setup' | 'accent_training' | 'command_practice' | 'noise_adaptation' | 'advanced_scenarios';
  exercises_completed: number;
  total_exercises: number;
  accuracy_scores: number[];
  improvement_metrics: {
    recognition_accuracy: number;
    response_time: number;
    confidence_level: number;
  };
  session_duration: number; // minutes
  notes: string;
  created_at: string;
}

interface VoiceCommand {
  id: string;
  command_text: string;
  intent: string;
  difficulty_level: number; // 1-5
  alternative_phrasings: string[];
  context_requirements: string[];
  accessibility_notes: string;
}

// Voice Training & Personalization Routes
const voiceTrainingApp = new Hono<{ Bindings: Bindings }>()

voiceTrainingApp.use('/*', cors())

const authMiddleware = jwt({
  secret: 'your-jwt-secret', // In production, use environment variable
})

// Initial Voice Profile Setup
voiceTrainingApp.post('/voice-training/setup', authMiddleware, async (c) => {
  const { DB, AI } = c.env;
  const payload = c.get('jwtPayload');
  const userId = payload.user_id;

  try {
    const setupData = await c.req.json();
    const profileId = crypto.randomUUID();

    // Analyze voice sample if provided
    let voiceAnalysis = {};
    if (setupData.voice_sample_url) {
      voiceAnalysis = await analyzeVoiceSample(setupData.voice_sample_url, AI);
    }

    // Create initial voice profile
    await DB.prepare(`
      INSERT INTO voice_profiles (
        id, user_id, profile_name, accent, speaking_rate,
        pitch_range, volume_preference, pronunciation_patterns,
        common_commands, recognition_confidence_threshold,
        background_noise_level, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      profileId,
      userId,
      setupData.profile_name || 'Default',
      setupData.accent || voiceAnalysis.detected_accent || 'neutral',
      setupData.speaking_rate || voiceAnalysis.speaking_rate || 150,
      JSON.stringify(setupData.pitch_range || voiceAnalysis.pitch_range || { min: 100, max: 300 }),
      setupData.volume_preference || 0.8,
      JSON.stringify(voiceAnalysis.pronunciation_patterns || {}),
      JSON.stringify(setupData.preferred_commands || []),
      setupData.confidence_threshold || 0.8,
      setupData.background_noise || 0.3
    ).run();

    // Create personalization settings
    const personalizationId = crypto.randomUUID();
    await DB.prepare(`
      INSERT INTO personalization_settings (
        id, user_id, voice_feedback_style, spatial_audio_sensitivity,
        command_confirmation_mode, preferred_voice_character,
        accessibility_adaptations, learning_preferences, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      personalizationId,
      userId,
      setupData.feedback_style || 'detailed',
      setupData.spatial_sensitivity || 0.7,
      setupData.confirmation_mode || 'on_low_confidence',
      setupData.voice_character || 'neutral',
      JSON.stringify(setupData.accessibility_adaptations || {}),
      JSON.stringify(setupData.learning_preferences || {})
    ).run();

    // Schedule initial training session
    const trainingPlan = generatePersonalizedTrainingPlan(setupData, voiceAnalysis);

    return c.json({
      profile_id: profileId,
      personalization_id: personalizationId,
      voice_analysis: voiceAnalysis,
      training_plan: trainingPlan,
      message: 'Voice profile setup completed successfully'
    });

  } catch (error) {
    console.error('Voice setup error:', error);
    return c.json({ error: 'Failed to setup voice profile' }, 500);
  }
});

// Personalized Training Session
voiceTrainingApp.post('/voice-training/session/start', authMiddleware, async (c) => {
  const { DB } = c.env;
  const payload = c.get('jwtPayload');
  const userId = payload.user_id;

  try {
    const sessionData = await c.req.json();
    const sessionId = crypto.randomUUID();

    // Get user's current voice profile and settings
    const voiceProfile = await DB.prepare(`
      SELECT * FROM voice_profiles WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1
    `).bind(userId).first();

    const personalizationSettings = await DB.prepare(`
      SELECT * FROM personalization_settings WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1
    `).bind(userId).first();

    if (!voiceProfile || !personalizationSettings) {
      return c.json({ error: 'Voice profile setup required first' }, 400);
    }

    // Generate adaptive training exercises
    const exercises = await generateAdaptiveExercises(
      sessionData.session_type,
      voiceProfile,
      JSON.parse(personalizationSettings.accessibility_adaptations || '{}'),
      JSON.parse(personalizationSettings.learning_preferences || '{}'),
      DB
    );

    // Create training session
    await DB.prepare(`
      INSERT INTO training_sessions (
        id, user_id, session_type, exercises_completed, total_exercises,
        accuracy_scores, improvement_metrics, session_duration, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      sessionId,
      userId,
      sessionData.session_type,
      0,
      exercises.length,
      JSON.stringify([]),
      JSON.stringify({
        recognition_accuracy: voiceProfile.recognition_confidence_threshold,
        response_time: 0,
        confidence_level: 0
      }),
      0,
      ''
    ).run();

    return c.json({
      session_id: sessionId,
      exercises: exercises,
      personalized_instructions: generatePersonalizedInstructions(
        personalizationSettings,
        sessionData.session_type
      ),
      accessibility_features: JSON.parse(personalizationSettings.accessibility_adaptations || '{}')
    });

  } catch (error) {
    return c.json({ error: 'Failed to start training session' }, 500);
  }
});

// Process Training Exercise Result
voiceTrainingApp.post('/voice-training/exercise/result', authMiddleware, async (c) => {
  const { DB, AI } = c.env;
  const payload = c.get('jwtPayload');
  const userId = payload.user_id;

  try {
    const resultData = await c.req.json();
    
    // Analyze voice command accuracy
    const analysisResult = await analyzeVoiceCommand(
      resultData.user_input,
      resultData.expected_command,
      resultData.audio_data,
      AI
    );

    // Update training session progress
    await DB.prepare(`
      UPDATE training_sessions 
      SET 
        exercises_completed = exercises_completed + 1,
        accuracy_scores = json_insert(accuracy_scores, '$[#]', ?),
        improvement_metrics = ?
      WHERE id = ?
    `).bind(
      analysisResult.accuracy_score,
      JSON.stringify(analysisResult.improvement_metrics),
      resultData.session_id
    ).run();

    // Adaptive feedback based on performance
    const feedback = generateAdaptiveFeedback(
      analysisResult,
      resultData.exercise_type,
      await getUserPersonalizationSettings(userId, DB)
    );

    // Update voice profile if significant patterns detected
    if (analysisResult.significant_patterns) {
      await updateVoiceProfile(userId, analysisResult.patterns, DB);
    }

    return c.json({
      accuracy_score: analysisResult.accuracy_score,
      feedback: feedback,
      suggestions: analysisResult.improvement_suggestions,
      next_exercise: analysisResult.accuracy_score < 0.7 ? 'retry_similar' : 'advance',
      personalized_tips: generatePersonalizedTips(analysisResult, userId, DB)
    });

  } catch (error) {
    return c.json({ error: 'Failed to process exercise result' }, 500);
  }
});

// Advanced Noise Adaptation Training
voiceTrainingApp.post('/voice-training/noise-adaptation', authMiddleware, async (c) => {
  const { DB } = c.env;
  const payload = c.get('jwtPayload');
  const userId = payload.user_id;

  try {
    const adaptationData = await c.req.json();
    
    // Background noise scenarios for training
    const noiseScenarios = [
      {
        id: 'cafe_ambience',
        name: 'Café Environment',
        description: 'Practice voice commands in a busy café setting',
        noise_level: 0.4,
        frequency_profile: 'low_frequency_chatter',
        commands_to_practice: ['basic_navigation', 'volume_control', 'repeat_request']
      },
      {
        id: 'street_traffic',
        name: 'Street Traffic',
        description: 'Urban traffic noise adaptation',
        noise_level: 0.6,
        frequency_profile: 'mixed_frequency_traffic',
        commands_to_practice: ['emergency_commands', 'navigation', 'help_request']
      },
      {
        id: 'home_household',
        name: 'Household Environment',
        description: 'TV, appliances, family conversation',
        noise_level: 0.3,
        frequency_profile: 'varied_household_sounds',
        commands_to_practice: ['all_commands']
      },
      {
        id: 'public_transport',
        name: 'Public Transportation',
        description: 'Bus, train, subway environments',
        noise_level: 0.5,
        frequency_profile: 'mechanical_transport_noise',
        commands_to_practice: ['quick_commands', 'essential_navigation']
      }
    ];

    // Select appropriate scenario based on user's current noise tolerance
    const currentProfile = await DB.prepare(`
      SELECT background_noise_level FROM voice_profiles WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1
    `).bind(userId).first();

    const targetScenario = noiseScenarios.find(scenario => 
      scenario.noise_level > currentProfile.background_noise_level * 1.2
    ) || noiseScenarios[0];

    // Generate noise adaptation exercises
    const exercises = await generateNoiseAdaptationExercises(
      targetScenario,
      adaptationData.duration_minutes || 10,
      DB
    );

    return c.json({
      scenario: targetScenario,
      exercises: exercises,
      adaptive_instructions: {
        pre_exercise: 'This training will help improve voice recognition in noisy environments.',
        during_exercise: 'Speak clearly and slightly louder than the background noise.',
        post_exercise: 'Great job adapting to challenging audio conditions!'
      },
      accessibility_notes: [
        'Background noise will gradually increase during the session',
        'Visual indicators show when the system is listening',
        'Take breaks if you experience fatigue'
      ]
    });

  } catch (error) {
    return c.json({ error: 'Failed to setup noise adaptation training' }, 500);
  }
});

// Personalized Command Shortcuts
voiceTrainingApp.post('/voice-training/custom-commands', authMiddleware, async (c) => {
  const { DB } = c.env;
  const payload = c.get('jwtPayload');
  const userId = payload.user_id;

  try {
    const commandData = await c.req.json();
    const commandId = crypto.randomUUID();

    // Validate command doesn't conflict with system commands
    const conflictCheck = await DB.prepare(`
      SELECT id FROM system_commands WHERE command_text = ? OR ? = ANY(alternative_phrasings)
    `).bind(commandData.command_text, commandData.command_text).first();

    if (conflictCheck) {
      return c.json({ error: 'Command conflicts with system command' }, 409);
    }

    // Create custom command
    await DB.prepare(`
      INSERT INTO user_custom_commands (
        id, user_id, command_text, intent, action_mapping,
        alternative_phrasings, context_requirements, accessibility_description,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      commandId,
      userId,
      commandData.command_text,
      commandData.intent,
      JSON.stringify(commandData.action_mapping),
      JSON.stringify(commandData.alternative_phrasings || []),
      JSON.stringify(commandData.context_requirements || []),
      commandData.accessibility_description || ''
    ).run();

    // Update user's voice profile with new command
    await DB.prepare(`
      UPDATE voice_profiles 
      SET 
        common_commands = json_insert(common_commands, '$[#]', ?),
        updated_at = datetime('now')
      WHERE user_id = ?
    `).bind(commandData.command_text, userId).run();

    return c.json({
      command_id: commandId,
      message: 'Custom command created successfully',
      training_suggestion: 'Practice this command 5-10 times for optimal recognition'
    });

  } catch (error) {
    return c.json({ error: 'Failed to create custom command' }, 500);
  }
});

// Voice Profile Analytics & Improvement Suggestions
voiceTrainingApp.get('/voice-training/analytics/:userId', async (c) => {
  const { DB } = c.env;
  const userId = c.req.param('userId');

  try {
    // Get training history
    const trainingHistory = await DB.prepare(`
      SELECT 
        session_type,
        COUNT(*) as session_count,
        AVG(JSON_EXTRACT(improvement_metrics, '$.recognition_accuracy')) as avg_accuracy,
        AVG(JSON_EXTRACT(improvement_metrics, '$.response_time')) as avg_response_time,
        AVG(JSON_EXTRACT(improvement_metrics, '$.confidence_level')) as avg_confidence
      FROM training_sessions
      WHERE user_id = ?
      GROUP BY session_type
      ORDER BY avg_accuracy DESC
    `).bind(userId).all();

    // Get voice profile evolution
    const profileEvolution = await DB.prepare(`
      SELECT 
        recognition_confidence_threshold,
        background_noise_level,
        speaking_rate,
        updated_at
      FROM voice_profiles
      WHERE user_id = ?
      ORDER BY updated_at ASC
    `).bind(userId).all();

    // Calculate improvement areas
    const improvementAreas = await analyzeImprovementAreas(userId, DB);

    // Generate personalized recommendations
    const recommendations = await generatePersonalizedRecommendations(
      trainingHistory.results,
      profileEvolution.results,
      improvementAreas
    );

    return c.json({
      training_statistics: trainingHistory.results,
      profile_evolution: profileEvolution.results,
      improvement_areas: improvementAreas,
      personalized_recommendations: recommendations,
      next_training_sessions: await suggestNextTrainingSessions(userId, improvementAreas, DB)
    });

  } catch (error) {
    return c.json({ error: 'Failed to fetch voice training analytics' }, 500);
  }
});

// Accessibility-Focused Voice Training
voiceTrainingApp.post('/voice-training/accessibility-focus', authMiddleware, async (c) => {
  const { DB } = c.env;
  const payload = c.get('jwtPayload');
  const userId = payload.user_id;

  try {
    const focusData = await c.req.json();
    
    // Specialized training for different accessibility needs
    const accessibilityFocusAreas = {
      screen_reader_integration: {
        name: 'Screen Reader Integration',
        description: 'Optimize voice commands to work seamlessly with screen readers',
        exercises: [
          'voice_navigation_with_screen_reader',
          'context_switching_practice',
          'multi_modal_interaction_training'
        ],
        success_criteria: {
          command_interruption_handling: 0.9,
          context_retention: 0.85,
          seamless_switching: 0.8
        }
      },
      motor_accessibility: {
        name: 'Motor Accessibility Support',
        description: 'Enhanced voice control for users with limited mobility',
        exercises: [
          'hands_free_navigation',
          'complex_command_sequences',
          'voice_macro_creation'
        ],
        success_criteria: {
          single_command_success: 0.95,
          command_chain_accuracy: 0.9,
          macro_reliability: 0.88
        }
      },
      cognitive_accessibility: {
        name: 'Cognitive Accessibility',
        description: 'Simplified, consistent command patterns',
        exercises: [
          'simple_command_practice',
          'consistent_pattern_training',
          'error_recovery_practice'
        ],
        success_criteria: {
          command_consistency: 0.92,
          error_recovery_rate: 0.85,
          learning_curve_optimization: 0.8
        }
      }
    };

    const selectedFocus = accessibilityFocusAreas[focusData.focus_area];
    if (!selectedFocus) {
      return c.json({ error: 'Invalid accessibility focus area' }, 400);
    }

    // Generate specialized exercises
    const exercises = await generateAccessibilityFocusedExercises(
      selectedFocus,
      focusData.user_specific_needs || {},
      DB
    );

    return c.json({
      focus_area: selectedFocus,
      personalized_exercises: exercises,
      accessibility_accommodations: await generateAccessibilityAccommodations(
        focusData.focus_area,
        focusData.user_specific_needs,
        DB
      ),
      success_tracking: selectedFocus.success_criteria
    });

  } catch (error) {
    return c.json({ error: 'Failed to setup accessibility-focused training' }, 500);
  }
});

// Helper Functions

async function analyzeVoiceSample(audioUrl: string, AI: Ai): Promise<any> {
  try {
    // Use Cloudflare AI for voice analysis
    const analysis = await AI.run('@cf/openai/whisper', {
      audio: await fetch(audioUrl).then(r => r.arrayBuffer())
    });

    return {
      detected_accent: detectAccentFromTranscript(analysis.text),
      speaking_rate: calculateSpeakingRate(analysis.text, analysis.duration),
      pitch_range: { min: 100, max: 300 }, // Placeholder - would need audio processing
      pronunciation_patterns: extractPronunciationPatterns(analysis.text),
      confidence_level: analysis.confidence || 0.8
    };
  } catch (error) {
    console.error('Voice analysis error:', error);
    return {};
  }
}

function detectAccentFromTranscript(text: string): string {
  // Simplified accent detection based on common patterns
  // In a real implementation, this would use more sophisticated analysis
  const accentIndicators = {
    british: ['colour', 'flavour', 'realise'],
    australian: ['mate', 'arvo'],
    american: ['color', 'flavor', 'realize'],
    irish: ['ye', 'yer'],
    scottish: ['ken', 'wee']
  };

  for (const [accent, indicators] of Object.entries(accentIndicators)) {
    if (indicators.some(indicator => text.toLowerCase().includes(indicator))) {
      return accent;
    }
  }

  return 'neutral';
}

function calculateSpeakingRate(text: string, duration: number): number {
  const wordCount = text.split(/\s+/).length;
  return Math.round((wordCount / duration) * 60); // words per minute
}

function extractPronunciationPatterns(text: string): Record<string, string> {
  // Extract common mispronunciations or alternate pronunciations
  // This is a simplified version - real implementation would be more sophisticated
  return {};
}

function generatePersonalizedTrainingPlan(setupData: any, voiceAnalysis: any): any {
  const plan = {
    beginner_sessions: [
      'basic_navigation_commands',
      'volume_and_speed_control',
      'help_and_information_requests'
    ],
    intermediate_sessions: [
      'complex_navigation_patterns',
      'multi_step_commands',
      'context_switching_practice'
    ],
    advanced_sessions: [
      'natural_conversation_flow',
      'background_noise_adaptation',
      'custom_command_creation'
    ]
  };

  // Customize based on voice analysis
  if (voiceAnalysis.speaking_rate < 100) {
    plan.focus_areas = ['speaking_rate_improvement'];
  }
  if (voiceAnalysis.confidence_level < 0.7) {
    plan.focus_areas = ['pronunciation_clarity'];
  }

  return plan;
}

async function generateAdaptiveExercises(
  sessionType: string,
  voiceProfile: any,
  accessibilityAdaptations: any,
  learningPreferences: any,
  DB: D1Database
): Promise<any[]> {
  
  const baseExercises = await DB.prepare(`
    SELECT * FROM training_exercises 
    WHERE session_type = ? AND difficulty_level <= ?
    ORDER BY difficulty_level ASC
  `).bind(sessionType, 3).all();

  // Adapt exercises based on accessibility needs
  return baseExercises.results.map(exercise => ({
    ...exercise,
    accessibility_accommodations: generateExerciseAccommodations(exercise, accessibilityAdaptations),
    personalized_instructions: adaptInstructionsToUser(exercise.instructions, learningPreferences),
    success_criteria: adjustSuccessCriteriaForUser(exercise.success_criteria, voiceProfile)
  }));
}

function generatePersonalizedInstructions(settings: any, sessionType: string): any {
  const baseInstructions = {
    initial_setup: 'We\'ll help you create a personalized voice profile',
    accent_training: 'Practice commands to improve recognition of your accent',
    command_practice: 'Master the essential AudioVR voice commands',
    noise_adaptation: 'Learn to use voice commands in challenging environments',
    advanced_scenarios: 'Practice complex, real-world voice interaction scenarios'
  };

  const instructions = baseInstructions[sessionType] || 'Complete voice training exercises';
  
  // Personalize based on accessibility preferences
  if (settings.accessibility_adaptations?.screen_reader_integration) {
    return `${instructions}. Screen reader announcements are enabled for all feedback.`;
  }
  
  return instructions;
}

async function analyzeVoiceCommand(
  userInput: string,
  expectedCommand: string,
  audioData: any,
  AI: Ai
): Promise<any> {
  
  try {
    // Analyze accuracy
    const accuracy = calculateCommandAccuracy(userInput, expectedCommand);
    
    // Analyze audio quality if provided
    let audioAnalysis = {};
    if (audioData) {
      audioAnalysis = await AI.run('@cf/openai/whisper', { audio: audioData });
    }

    return {
      accuracy_score: accuracy,
      improvement_metrics: {
        recognition_accuracy: accuracy,
        response_time: audioAnalysis.processing_time || 0,
        confidence_level: audioAnalysis.confidence || 0
      },
      improvement_suggestions: generateImprovementSuggestions(accuracy, userInput, expectedCommand),
      significant_patterns: accuracy < 0.6,
      patterns: extractLearningPatterns(userInput, expectedCommand, audioAnalysis)
    };
    
  } catch (error) {
    console.error('Voice command analysis error:', error);
    return { accuracy_score: 0, improvement_metrics: {}, improvement_suggestions: [] };
  }
}

function calculateCommandAccuracy(userInput: string, expectedCommand: string): number {
  // Simple similarity calculation - in production would use more sophisticated NLP
  const user = userInput.toLowerCase().trim();
  const expected = expectedCommand.toLowerCase().trim();
  
  if (user === expected) return 1.0;
  
  // Calculate word overlap
  const userWords = user.split(/\s+/);
  const expectedWords = expected.split(/\s+/);
  const overlap = userWords.filter(word => expectedWords.includes(word)).length;
  
  return overlap / Math.max(userWords.length, expectedWords.length);
}

function generateImprovementSuggestions(accuracy: number, userInput: string, expectedCommand: string): string[] {
  const suggestions = [];
  
  if (accuracy < 0.5) {
    suggestions.push('Try speaking more slowly and clearly');
    suggestions.push('Ensure you\'re in a quiet environment');
  } else if (accuracy < 0.8) {
    suggestions.push('Practice the exact command phrasing');
    suggestions.push('Check microphone positioning');
  }
  
  return suggestions;
}

// Additional helper functions would continue here...
// For brevity, including key functions only

async function getUserPersonalizationSettings(userId: string, DB: D1Database): Promise<any> {
  return await DB.prepare(`
    SELECT * FROM personalization_settings WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1
  `).bind(userId).first();
}

function generateAdaptiveFeedback(analysisResult: any, exerciseType: string, settings: any): any {
  const feedbackStyle = settings?.voice_feedback_style || 'detailed';
  
  const feedback = {
    concise: `${Math.round(analysisResult.accuracy_score * 100)}% accuracy`,
    detailed: `Great job! Your command recognition accuracy was ${Math.round(analysisResult.accuracy_score * 100)}%. ${analysisResult.improvement_suggestions.join(' ')}`,
    immersive: `Excellent work, detective! Your voice command skills are improving. The system recognized your intent with ${Math.round(analysisResult.accuracy_score * 100)}% accuracy. ${analysisResult.improvement_suggestions.join(' ')} Keep practicing to unlock the full potential of voice-controlled investigation.`
  };

  return feedback[feedbackStyle] || feedback.detailed;
}

export default voiceTrainingApp;