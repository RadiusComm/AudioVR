import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
}

// Analytics Dashboard Routes
const analyticsApp = new Hono<{ Bindings: Bindings }>()

analyticsApp.use('/*', cors())

// Dashboard data interfaces
interface UserEngagement {
  daily_active_users: number;
  session_duration_avg: number;
  voice_command_success_rate: number;
  accessibility_score: number;
  case_completion_rate: number;
}

interface AccessibilityMetrics {
  screen_reader_usage: number;
  voice_only_users: number;
  haptic_feedback_usage: number;
  audio_description_requests: number;
  spatial_audio_engagement: number;
}

interface VoiceAnalytics {
  command_accuracy: number;
  retry_rate: number;
  most_used_commands: Array<{command: string, count: number}>;
  language_distribution: Array<{language: string, percentage: number}>;
  error_patterns: Array<{error: string, frequency: number}>;
}

// Dashboard Overview Route
analyticsApp.get('/dashboard/overview', async (c) => {
  const { DB } = c.env;
  
  try {
    // Get user engagement metrics
    const engagementQuery = await DB.prepare(`
      SELECT 
        COUNT(DISTINCT user_id) as daily_active_users,
        AVG(session_duration) as session_duration_avg,
        (COUNT(CASE WHEN voice_command_success = 1 THEN 1 END) * 100.0 / COUNT(*)) as voice_command_success_rate,
        AVG(accessibility_score) as accessibility_score,
        (COUNT(CASE WHEN case_completed = 1 THEN 1 END) * 100.0 / COUNT(DISTINCT case_id)) as case_completion_rate
      FROM user_sessions 
      WHERE created_at >= datetime('now', '-24 hours')
    `).first();

    // Get accessibility metrics
    const accessibilityQuery = await DB.prepare(`
      SELECT 
        SUM(CASE WHEN screen_reader_enabled = 1 THEN 1 ELSE 0 END) as screen_reader_usage,
        SUM(CASE WHEN voice_only_mode = 1 THEN 1 ELSE 0 END) as voice_only_users,
        SUM(CASE WHEN haptic_enabled = 1 THEN 1 ELSE 0 END) as haptic_feedback_usage,
        SUM(audio_description_requests) as audio_description_requests,
        AVG(spatial_audio_score) as spatial_audio_engagement
      FROM accessibility_usage 
      WHERE created_at >= datetime('now', '-24 hours')
    `).first();

    // Get voice analytics
    const voiceAnalyticsQuery = await DB.prepare(`
      SELECT 
        AVG(recognition_confidence) as command_accuracy,
        (COUNT(CASE WHEN retry_count > 0 THEN 1 END) * 100.0 / COUNT(*)) as retry_rate
      FROM voice_commands 
      WHERE created_at >= datetime('now', '-24 hours')
    `).first();

    // Get most used commands
    const topCommands = await DB.prepare(`
      SELECT command_text, COUNT(*) as count
      FROM voice_commands 
      WHERE created_at >= datetime('now', '-24 hours')
      GROUP BY command_text 
      ORDER BY count DESC 
      LIMIT 10
    `).all();

    // Get language distribution
    const languageStats = await DB.prepare(`
      SELECT language, COUNT(*) * 100.0 / (SELECT COUNT(*) FROM user_sessions WHERE created_at >= datetime('now', '-24 hours')) as percentage
      FROM user_sessions 
      WHERE created_at >= datetime('now', '-24 hours')
      GROUP BY language
    `).all();

    return c.json({
      engagement: engagementQuery,
      accessibility: accessibilityQuery,
      voice_analytics: voiceAnalyticsQuery,
      top_commands: topCommands.results,
      language_distribution: languageStats.results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Dashboard overview error:', error);
    return c.json({ error: 'Failed to fetch dashboard data' }, 500);
  }
});

// Real-time Voice Command Monitoring
analyticsApp.get('/analytics/voice-commands/live', async (c) => {
  const { DB } = c.env;
  
  try {
    const liveCommands = await DB.prepare(`
      SELECT 
        command_text,
        recognition_confidence,
        processing_time_ms,
        success_rate,
        user_id,
        created_at
      FROM voice_commands 
      WHERE created_at >= datetime('now', '-1 hour')
      ORDER BY created_at DESC
      LIMIT 50
    `).all();

    return c.json({
      commands: liveCommands.results,
      total_count: liveCommands.results.length
    });

  } catch (error) {
    return c.json({ error: 'Failed to fetch live voice data' }, 500);
  }
});

// Accessibility Compliance Report
analyticsApp.get('/analytics/accessibility/compliance', async (c) => {
  const { DB } = c.env;
  
  try {
    // WCAG 2.1 AA Compliance Metrics
    const complianceMetrics = await DB.prepare(`
      SELECT 
        AVG(CASE WHEN keyboard_navigation_success = 1 THEN 1 ELSE 0 END) * 100 as keyboard_nav_score,
        AVG(CASE WHEN screen_reader_compatibility = 1 THEN 1 ELSE 0 END) * 100 as screen_reader_score,
        AVG(CASE WHEN voice_navigation_success = 1 THEN 1 ELSE 0 END) * 100 as voice_nav_score,
        AVG(CASE WHEN color_contrast_passed = 1 THEN 1 ELSE 0 END) * 100 as contrast_score,
        AVG(audio_clarity_score) * 100 as audio_clarity_score
      FROM accessibility_tests
      WHERE created_at >= datetime('now', '-7 days')
    `).first();

    // User feedback on accessibility features
    const userFeedback = await DB.prepare(`
      SELECT 
        feature_name,
        AVG(satisfaction_score) as avg_satisfaction,
        COUNT(*) as feedback_count
      FROM accessibility_feedback
      WHERE created_at >= datetime('now', '-30 days')
      GROUP BY feature_name
      ORDER BY avg_satisfaction DESC
    `).all();

    return c.json({
      compliance_scores: complianceMetrics,
      user_feedback: userFeedback.results,
      overall_compliance: (
        (complianceMetrics.keyboard_nav_score + 
         complianceMetrics.screen_reader_score + 
         complianceMetrics.voice_nav_score + 
         complianceMetrics.contrast_score + 
         complianceMetrics.audio_clarity_score) / 5
      ).toFixed(2)
    });

  } catch (error) {
    return c.json({ error: 'Failed to fetch compliance data' }, 500);
  }
});

// User Journey Analytics
analyticsApp.get('/analytics/user-journey', async (c) => {
  const { DB } = c.env;
  
  try {
    // Funnel analysis
    const journeySteps = await DB.prepare(`
      SELECT 
        step_name,
        COUNT(DISTINCT user_id) as users_reached,
        AVG(time_spent_seconds) as avg_time_spent,
        COUNT(CASE WHEN completed = 1 THEN 1 END) * 100.0 / COUNT(*) as completion_rate
      FROM user_journey_steps
      WHERE created_at >= datetime('now', '-7 days')
      GROUP BY step_name, step_order
      ORDER BY step_order
    `).all();

    // Drop-off points
    const dropoffAnalysis = await DB.prepare(`
      SELECT 
        exit_point,
        COUNT(*) as exit_count,
        AVG(session_duration) as avg_session_before_exit
      FROM user_exits
      WHERE created_at >= datetime('now', '-7 days')
      GROUP BY exit_point
      ORDER BY exit_count DESC
      LIMIT 10
    `).all();

    return c.json({
      journey_funnel: journeySteps.results,
      dropoff_points: dropoffAnalysis.results
    });

  } catch (error) {
    return c.json({ error: 'Failed to fetch journey data' }, 500);
  }
});

// Performance Metrics
analyticsApp.get('/analytics/performance', async (c) => {
  const { DB } = c.env;
  
  try {
    // API response times
    const apiPerformance = await DB.prepare(`
      SELECT 
        endpoint,
        AVG(response_time_ms) as avg_response_time,
        MAX(response_time_ms) as max_response_time,
        MIN(response_time_ms) as min_response_time,
        COUNT(*) as request_count
      FROM api_performance_logs
      WHERE created_at >= datetime('now', '-24 hours')
      GROUP BY endpoint
      ORDER BY avg_response_time DESC
    `).all();

    // Audio streaming performance
    const audioPerformance = await DB.prepare(`
      SELECT 
        AVG(audio_load_time_ms) as avg_audio_load_time,
        AVG(spatial_processing_time_ms) as avg_spatial_processing_time,
        COUNT(CASE WHEN audio_error = 1 THEN 1 END) * 100.0 / COUNT(*) as audio_error_rate
      FROM audio_performance_logs
      WHERE created_at >= datetime('now', '-24 hours')
    `).first();

    return c.json({
      api_performance: apiPerformance.results,
      audio_performance: audioPerformance,
      system_health: {
        overall_uptime: 99.8,
        edge_latency_avg: 120,
        cdn_hit_rate: 95.2
      }
    });

  } catch (error) {
    return c.json({ error: 'Failed to fetch performance data' }, 500);
  }
});

// Content Analytics
analyticsApp.get('/analytics/content', async (c) => {
  const { DB } = c.env;
  
  try {
    // Most popular mysteries and worlds
    const contentPopularity = await DB.prepare(`
      SELECT 
        w.name as world_name,
        c.title as case_title,
        COUNT(up.user_id) as play_count,
        AVG(up.completion_percentage) as avg_completion,
        AVG(ur.rating) as avg_rating
      FROM user_progress up
      JOIN cases c ON up.case_id = c.id
      JOIN worlds w ON c.world_id = w.id
      LEFT JOIN user_ratings ur ON c.id = ur.case_id
      WHERE up.created_at >= datetime('now', '-30 days')
      GROUP BY c.id, w.id
      ORDER BY play_count DESC
      LIMIT 20
    `).all();

    // Character engagement metrics
    const characterStats = await DB.prepare(`
      SELECT 
        character_name,
        COUNT(*) as interaction_count,
        AVG(conversation_length) as avg_conversation_length,
        AVG(user_satisfaction) as avg_satisfaction
      FROM character_interactions
      WHERE created_at >= datetime('now', '-30 days')
      GROUP BY character_name
      ORDER BY interaction_count DESC
    `).all();

    return c.json({
      popular_content: contentPopularity.results,
      character_engagement: characterStats.results
    });

  } catch (error) {
    return c.json({ error: 'Failed to fetch content analytics' }, 500);
  }
});

export default analyticsApp;