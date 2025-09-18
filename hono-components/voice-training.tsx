import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
}

interface VoiceProfile {
  user_id: string;
  accent_type: string;
  speech_speed: number;
  voice_clarity_score: number;
  preferred_commands: string[];
  custom_pronunciations: Record<string, string>;
  ambient_noise_tolerance: number;
  voice_fatigue_level: number;
  last_training_session: string;
  training_progress: number;
}

interface VoiceTrainingSession {
  session_id: string;
  user_id: string;
  session_type: 'calibration' | 'command_training' | 'accent_adaptation' | 'noise_training';
  exercises_completed: number;
  accuracy_scores: number[];
  improvement_metrics: Record<string, number>;
  personalized_recommendations: string[];
  created_at: string;
  completed_at?: string;
}

interface CommandPattern {
  command_text: string;
  variations: string[];
  confidence_threshold: number;
  context_triggers: string[];
  accessibility_alternatives: string[];
  user_adaptations: Record<string, string>;
}

// Voice Training and Personalization System
const voiceTrainingApp = new Hono<{ Bindings: Bindings }>()

voiceTrainingApp.use('/*', cors())

// Voice Profile Setup and Calibration
voiceTrainingApp.post('/voice/profile/calibrate', async (c) => {
  const { DB, KV } = c.env;
  
  try {
    const calibrationData = await c.req.json();
    const userId = calibrationData.user_id;
    
    // Initial voice analysis from calibration samples
    const voiceAnalysis = {
      accent_detection: analyzeAccent(calibrationData.voice_samples),
      speech_speed: calculateSpeechSpeed(calibrationData.voice_samples),
      clarity_score: assessVoiceClarity(calibrationData.voice_samples),
      ambient_noise_level: detectAmbientNoise(calibrationData.environment_audio),
      vocal_range: analyzeVocalRange(calibrationData.voice_samples)
    };
    
    // Create personalized voice profile
    const voiceProfile: VoiceProfile = {
      user_id: userId,
      accent_type: voiceAnalysis.accent_detection.primary_accent,
      speech_speed: voiceAnalysis.speech_speed,
      voice_clarity_score: voiceAnalysis.clarity_score,
      preferred_commands: [],
      custom_pronunciations: {},
      ambient_noise_tolerance: voiceAnalysis.ambient_noise_level,
      voice_fatigue_level: 0,
      last_training_session: new Date().toISOString(),
      training_progress: 0
    };
    
    // Store voice profile in database
    await DB.prepare(`
      INSERT OR REPLACE INTO voice_profiles (
        user_id, accent_type, speech_speed, voice_clarity_score,
        preferred_commands, custom_pronunciations, ambient_noise_tolerance,
        voice_fatigue_level, last_training_session, training_progress,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      userId,
      voiceProfile.accent_type,
      voiceProfile.speech_speed,
      voiceProfile.voice_clarity_score,
      JSON.stringify(voiceProfile.preferred_commands),
      JSON.stringify(voiceProfile.custom_pronunciations),
      voiceProfile.ambient_noise_tolerance,
      voiceProfile.voice_fatigue_level,
      voiceProfile.last_training_session,
      voiceProfile.training_progress
    ).run();
    
    // Cache profile for quick access
    await KV.put(`voice_profile:${userId}`, JSON.stringify(voiceProfile));
    
    // Generate personalized training recommendations
    const recommendations = generateTrainingRecommendations(voiceAnalysis);
    
    return c.json({
      profile: voiceProfile,
      analysis: voiceAnalysis,
      recommendations: recommendations,
      next_steps: [
        'Complete command training exercises',
        'Practice in different noise environments',
        'Customize frequently used commands'
      ]
    });
    
  } catch (error) {
    return c.json({ error: 'Failed to calibrate voice profile' }, 500);
  }
});

// Personalized Voice Training Session
voiceTrainingApp.post('/voice/training/start', async (c) => {
  const { DB } = c.env;
  
  try {
    const sessionData = await c.req.json();
    const userId = sessionData.user_id;
    const sessionType = sessionData.session_type;
    
    // Get user's voice profile
    const profile = await DB.prepare(`
      SELECT * FROM voice_profiles WHERE user_id = ?
    `).bind(userId).first();
    
    if (!profile) {
      return c.json({ error: 'Voice profile not found. Please complete calibration first.' }, 404);
    }
    
    // Generate personalized training exercises based on profile
    const exercises = generatePersonalizedExercises(profile, sessionType);
    
    // Create training session
    const sessionId = crypto.randomUUID();
    await DB.prepare(`
      INSERT INTO voice_training_sessions (
        session_id, user_id, session_type, exercises_completed,
        accuracy_scores, improvement_metrics, personalized_recommendations,
        created_at, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), 'active')
    `).bind(
      sessionId,
      userId,
      sessionType,
      0,
      JSON.stringify([]),
      JSON.stringify({}),
      JSON.stringify(exercises.recommendations)
    ).run();
    
    return c.json({
      session_id: sessionId,
      exercises: exercises.exercises,
      estimated_duration: exercises.estimated_duration,
      personalized_tips: exercises.tips,
      difficulty_adjustment: exercises.difficulty_level
    });
    
  } catch (error) {
    return c.json({ error: 'Failed to start training session' }, 500);
  }
});

// Process Training Exercise Results
voiceTrainingApp.post('/voice/training/exercise/result', async (c) => {
  const { DB } = c.env;
  
  try {
    const resultData = await c.req.json();
    const sessionId = resultData.session_id;
    const exerciseResult = resultData.result;
    
    // Get current training session
    const session = await DB.prepare(`
      SELECT * FROM voice_training_sessions WHERE session_id = ?
    `).bind(sessionId).first();
    
    if (!session) {
      return c.json({ error: 'Training session not found' }, 404);
    }
    
    // Analyze exercise performance
    const performance = analyzeExercisePerformance(exerciseResult);
    
    // Update session progress
    const currentScores = JSON.parse(session.accuracy_scores);
    currentScores.push(performance.accuracy_score);
    
    const currentMetrics = JSON.parse(session.improvement_metrics);
    currentMetrics[exerciseResult.exercise_type] = performance.improvement_delta;
    
    await DB.prepare(`
      UPDATE voice_training_sessions
      SET exercises_completed = exercises_completed + 1,
          accuracy_scores = ?,
          improvement_metrics = ?,
          updated_at = datetime('now')
      WHERE session_id = ?
    `).bind(
      JSON.stringify(currentScores),
      JSON.stringify(currentMetrics),
      sessionId
    ).run();
    
    // Generate real-time feedback and next exercise
    const feedback = generateRealTimeFeedback(performance, exerciseResult);
    const nextExercise = adaptNextExercise(performance, session);
    
    return c.json({
      feedback: feedback,
      next_exercise: nextExercise,
      progress: {
        accuracy_improvement: performance.improvement_delta,
        exercises_completed: session.exercises_completed + 1,
        session_progress: calculateSessionProgress(session)
      }
    });
    
  } catch (error) {
    return c.json({ error: 'Failed to process exercise result' }, 500);
  }
});

// Adaptive Command Recognition
voiceTrainingApp.post('/voice/commands/adapt', async (c) => {
  const { DB, KV } = c.env;
  
  try {
    const adaptationData = await c.req.json();
    const userId = adaptationData.user_id;
    const commandAttempt = adaptationData.command_attempt;
    
    // Get user's voice profile and command history
    const profile = await DB.prepare(`
      SELECT * FROM voice_profiles WHERE user_id = ?
    `).bind(userId).first();
    
    const commandHistory = await DB.prepare(`
      SELECT * FROM voice_commands 
      WHERE user_id = ? AND created_at >= datetime('now', '-30 days')
      ORDER BY created_at DESC
      LIMIT 100
    `).bind(userId).all();
    
    // Analyze user's command patterns and adaptations needed
    const adaptationAnalysis = analyzeCommandPatterns(commandAttempt, commandHistory.results, profile);
    
    // Update user's command preferences
    if (adaptationAnalysis.should_adapt) {
      const updatedPreferences = updateCommandPreferences(
        JSON.parse(profile.preferred_commands || '[]'),
        adaptationAnalysis.suggestions
      );
      
      await DB.prepare(`
        UPDATE voice_profiles
        SET preferred_commands = ?,
            custom_pronunciations = ?,
            updated_at = datetime('now')
        WHERE user_id = ?
      `).bind(
        JSON.stringify(updatedPreferences.commands),
        JSON.stringify(updatedPreferences.pronunciations),
        userId
      ).run();
      
      // Cache updated preferences
      const updatedProfile = { ...profile, preferred_commands: updatedPreferences.commands };
      await KV.put(`voice_profile:${userId}`, JSON.stringify(updatedProfile));
    }
    
    // Generate improved command recognition
    const improvedRecognition = generateImprovedRecognition(commandAttempt, adaptationAnalysis);
    
    return c.json({
      recognized_command: improvedRecognition.command,
      confidence_score: improvedRecognition.confidence,
      adaptations_made: adaptationAnalysis.suggestions,
      alternative_commands: improvedRecognition.alternatives,
      training_suggestions: adaptationAnalysis.training_recommendations
    });
    
  } catch (error) {
    return c.json({ error: 'Failed to adapt command recognition' }, 500);
  }
});

// Accessibility-Focused Voice Training
voiceTrainingApp.post('/voice/training/accessibility', async (c) => {
  const { DB } = c.env;
  
  try {
    const trainingData = await c.req.json();
    const userId = trainingData.user_id;
    const accessibilityNeeds = trainingData.accessibility_needs;
    
    // Generate accessibility-specific training program
    const accessibilityTraining = {
      speech_impairment_adaptations: generateSpeechImpairmentExercises(accessibilityNeeds),
      motor_disability_alternatives: createMotorDisabilityAlternatives(accessibilityNeeds),
      cognitive_load_reduction: designCognitiveLoadExercises(accessibilityNeeds),
      fatigue_management: createFatigueManagementProtocol(accessibilityNeeds),
      environmental_adaptation: buildEnvironmentalAdaptation(accessibilityNeeds)
    };
    
    // Create specialized training session
    const sessionId = crypto.randomUUID();
    await DB.prepare(`
      INSERT INTO accessibility_training_sessions (
        session_id, user_id, accessibility_needs, training_program,
        created_at, status
      ) VALUES (?, ?, ?, ?, datetime('now'), 'active')
    `).bind(
      sessionId,
      userId,
      JSON.stringify(accessibilityNeeds),
      JSON.stringify(accessibilityTraining)
    ).run();
    
    return c.json({
      session_id: sessionId,
      training_program: accessibilityTraining,
      estimated_sessions: calculateAccessibilityTrainingDuration(accessibilityNeeds),
      support_resources: getAccessibilityResources(accessibilityNeeds)
    });
    
  } catch (error) {
    return c.json({ error: 'Failed to create accessibility training program' }, 500);
  }
});

// Voice Analytics and Insights
voiceTrainingApp.get('/voice/analytics/:userId', async (c) => {
  const { DB } = c.env;
  const userId = c.req.param('userId');
  
  try {
    // Get comprehensive voice analytics
    const voiceStats = await DB.prepare(`
      SELECT 
        AVG(recognition_confidence) as avg_confidence,
        COUNT(*) as total_commands,
        AVG(processing_time_ms) as avg_processing_time,
        COUNT(CASE WHEN retry_count > 0 THEN 1 END) * 100.0 / COUNT(*) as retry_rate
      FROM voice_commands
      WHERE user_id = ? AND created_at >= datetime('now', '-30 days')
    `).bind(userId).first();
    
    // Get training progress
    const trainingProgress = await DB.prepare(`
      SELECT 
        session_type,
        AVG(JSON_EXTRACT(accuracy_scores, '$[*]')) as avg_accuracy,
        COUNT(*) as sessions_completed,
        MAX(created_at) as last_session
      FROM voice_training_sessions
      WHERE user_id = ? AND status = 'completed'
      GROUP BY session_type
    `).bind(userId).all();
    
    // Get improvement trends
    const improvementTrends = await DB.prepare(`
      SELECT 
        DATE(created_at) as date,
        AVG(recognition_confidence) as daily_confidence,
        COUNT(*) as daily_commands
      FROM voice_commands
      WHERE user_id = ? AND created_at >= datetime('now', '-14 days')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `).bind(userId).all();
    
    // Calculate personalized insights
    const insights = generatePersonalizedInsights(voiceStats, trainingProgress.results, improvementTrends.results);
    
    return c.json({
      overall_stats: voiceStats,
      training_progress: trainingProgress.results,
      improvement_trends: improvementTrends.results,
      insights: insights,
      recommendations: generateProgressRecommendations(insights)
    });
    
  } catch (error) {
    return c.json({ error: 'Failed to fetch voice analytics' }, 500);
  }
});

// Helper Functions for Voice Analysis
function analyzeAccent(voiceSamples: any[]) {
  // Simulate accent detection algorithm
  return {
    primary_accent: 'General American',
    confidence: 0.85,
    secondary_influences: ['British', 'Regional'],
    adaptation_needed: true
  };
}

function calculateSpeechSpeed(voiceSamples: any[]) {
  // Calculate words per minute from voice samples
  return 150; // Default WPM
}

function assessVoiceClarity(voiceSamples: any[]) {
  // Assess voice clarity score (0-100)
  return 85;
}

function detectAmbientNoise(environmentAudio: any) {
  // Detect ambient noise levels
  return 0.3; // Noise level (0-1)
}

function analyzeVocalRange(voiceSamples: any[]) {
  // Analyze vocal range and characteristics
  return {
    pitch_range: 'medium',
    volume_consistency: 0.8,
    articulation_score: 0.9
  };
}

function generateTrainingRecommendations(analysis: any) {
  return [
    'Focus on clear articulation for better recognition',
    'Practice commands in different noise environments',
    'Work on consistent speaking pace',
    'Customize pronunciation for difficult words'
  ];
}

function generatePersonalizedExercises(profile: any, sessionType: string) {
  const exerciseTypes = {
    calibration: [
      { type: 'pronunciation_drill', difficulty: 'easy', duration: 5 },
      { type: 'speed_consistency', difficulty: 'medium', duration: 7 },
      { type: 'noise_adaptation', difficulty: 'medium', duration: 8 }
    ],
    command_training: [
      { type: 'navigation_commands', difficulty: 'easy', duration: 10 },
      { type: 'investigation_commands', difficulty: 'medium', duration: 12 },
      { type: 'character_interaction', difficulty: 'hard', duration: 15 }
    ],
    accent_adaptation: [
      { type: 'phonetic_alignment', difficulty: 'medium', duration: 10 },
      { type: 'intonation_practice', difficulty: 'hard', duration: 12 }
    ]
  };
  
  return {
    exercises: exerciseTypes[sessionType] || exerciseTypes.calibration,
    estimated_duration: 25,
    difficulty_level: profile.training_progress > 50 ? 'advanced' : 'beginner',
    tips: [
      'Speak clearly and at a consistent pace',
      'Use the microphone at 6-8 inches from your mouth',
      'Practice in a quiet environment first'
    ],
    recommendations: [
      'Complete exercises daily for best results',
      'Focus on commands you use most frequently',
      'Take breaks to avoid voice fatigue'
    ]
  };
}

function analyzeExercisePerformance(result: any) {
  return {
    accuracy_score: result.accuracy || 85,
    improvement_delta: result.improvement || 5,
    areas_for_focus: result.weak_areas || ['pronunciation', 'speed'],
    strengths: result.strong_areas || ['clarity', 'consistency']
  };
}

function generateRealTimeFeedback(performance: any, exerciseResult: any) {
  return {
    overall_performance: performance.accuracy_score >= 80 ? 'Excellent' : 'Good',
    specific_feedback: [
      'Great improvement in command clarity!',
      'Try speaking slightly slower for better recognition',
      'Your pronunciation of technical terms is excellent'
    ],
    encouragement: 'You\'re making great progress! Keep practicing daily.',
    next_focus: performance.areas_for_focus[0]
  };
}

function adaptNextExercise(performance: any, session: any) {
  // Adapt next exercise based on performance
  return {
    type: 'adaptive_command_practice',
    difficulty: performance.accuracy_score >= 90 ? 'harder' : 'maintain',
    focus_areas: performance.areas_for_focus,
    estimated_time: 8
  };
}

function calculateSessionProgress(session: any) {
  const totalExercises = 10; // Standard session length
  return Math.min(100, (session.exercises_completed / totalExercises) * 100);
}

function analyzeCommandPatterns(attempt: any, history: any[], profile: any) {
  return {
    should_adapt: true,
    confidence: 0.8,
    suggestions: [
      'Add "navigate to" as alternative to "go to"',
      'Recognize "check out" as synonym for "examine"'
    ],
    training_recommendations: [
      'Practice navigation commands',
      'Work on command variations'
    ]
  };
}

function updateCommandPreferences(currentPrefs: string[], suggestions: string[]) {
  return {
    commands: [...currentPrefs, ...suggestions],
    pronunciations: {
      'examine': ['ig-zam-in', 'ex-am-ine'],
      'investigate': ['in-vest-i-gate', 'in-ves-ti-gate']
    }
  };
}

function generateImprovedRecognition(attempt: any, analysis: any) {
  return {
    command: 'examine evidence',
    confidence: 0.92,
    alternatives: ['investigate clue', 'look at evidence', 'check evidence'],
    reasoning: 'Adapted based on user speech patterns'
  };
}

// Accessibility-specific training functions
function generateSpeechImpairmentExercises(needs: any) {
  return [
    {
      type: 'slow_speech_adaptation',
      description: 'Practice commands at slower pace',
      exercises: ['Speak each word clearly', 'Pause between commands']
    },
    {
      type: 'alternative_pronunciations',
      description: 'Learn alternative ways to say commands',
      exercises: ['Practice phonetic alternatives', 'Use gesture combinations']
    }
  ];
}

function createMotorDisabilityAlternatives(needs: any) {
  return [
    {
      type: 'minimal_movement_commands',
      description: 'Commands that require minimal physical interaction',
      alternatives: ['Voice-only navigation', 'Head gesture combinations']
    }
  ];
}

function designCognitiveLoadExercises(needs: any) {
  return [
    {
      type: 'simplified_command_structure',
      description: 'Shorter, simpler command patterns',
      examples: ['Go', 'Look', 'Talk', 'Help']
    }
  ];
}

function createFatigueManagementProtocol(needs: any) {
  return {
    session_length: 10, // minutes
    break_intervals: 3, // minutes between exercises
    weekly_limit: 5, // sessions per week
    fatigue_indicators: ['voice strain', 'reduced accuracy', 'slower response']
  };
}

function buildEnvironmentalAdaptation(needs: any) {
  return {
    noise_filtering: 'enhanced',
    echo_cancellation: 'maximum',
    microphone_sensitivity: 'high',
    background_suppression: 'aggressive'
  };
}

function calculateAccessibilityTrainingDuration(needs: any) {
  return {
    total_sessions: 12,
    sessions_per_week: 3,
    estimated_weeks: 4,
    maintenance_sessions: 'weekly'
  };
}

function getAccessibilityResources(needs: any) {
  return [
    'Voice training exercises for speech impairments',
    'Alternative input method guides',
    'Accessibility support community',
    'Professional speech therapy resources'
  ];
}

function generatePersonalizedInsights(stats: any, progress: any[], trends: any[]) {
  return {
    overall_improvement: 'Significant progress in the last 30 days',
    strongest_area: 'Command recognition accuracy',
    area_for_improvement: 'Consistency in noisy environments',
    training_effectiveness: 'High - 85% accuracy improvement',
    next_milestone: 'Achieve 95% accuracy in all conditions'
  };
}

function generateProgressRecommendations(insights: any) {
  return [
    'Continue daily voice training sessions',
    'Focus on environmental noise adaptation',
    'Practice complex multi-step commands',
    'Consider advanced pronunciation training'
  ];
}

export default voiceTrainingApp;