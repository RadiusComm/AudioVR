import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt, sign, verify } from 'hono/jwt'

type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
}

interface CreatorProfile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  verification_status: 'pending' | 'verified' | 'featured';
  total_mysteries: number;
  total_plays: number;
  avg_rating: number;
  created_at: string;
}

interface MysteryContent {
  id: string;
  title: string;
  description: string;
  world_setting: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimated_duration: number;
  character_count: number;
  evidence_count: number;
  status: 'draft' | 'review' | 'published' | 'archived';
  creator_id: string;
  accessibility_features: string[];
  content_warnings: string[];
  created_at: string;
  updated_at: string;
}

interface StoryElement {
  id: string;
  mystery_id: string;
  type: 'scene' | 'character' | 'evidence' | 'dialogue' | 'clue' | 'audio_cue';
  title: string;
  content: string;
  audio_description: string;
  spatial_position?: { x: number; y: number; z: number };
  trigger_conditions: string[];
  accessibility_notes: string;
  order_index: number;
}

// Content Management System Routes
const contentApp = new Hono<{ Bindings: Bindings }>()

contentApp.use('/*', cors())

// Creator Authentication Middleware
const authMiddleware = jwt({
  secret: 'your-jwt-secret', // In production, use environment variable
})

// Creator Dashboard - Overview
contentApp.get('/creator/dashboard', authMiddleware, async (c) => {
  const { DB } = c.env;
  const payload = c.get('jwtPayload');
  const creatorId = payload.creator_id;

  try {
    // Get creator profile
    const creator = await DB.prepare(`
      SELECT * FROM creators WHERE id = ?
    `).bind(creatorId).first();

    // Get creator's mysteries with stats
    const mysteries = await DB.prepare(`
      SELECT 
        m.*,
        COUNT(up.id) as total_plays,
        AVG(ur.rating) as avg_rating,
        COUNT(CASE WHEN up.completed = 1 THEN 1 END) as completions
      FROM mysteries m
      LEFT JOIN user_progress up ON m.id = up.mystery_id
      LEFT JOIN user_ratings ur ON m.id = ur.mystery_id
      WHERE m.creator_id = ?
      GROUP BY m.id
      ORDER BY m.updated_at DESC
    `).bind(creatorId).all();

    // Get recent activity
    const recentActivity = await DB.prepare(`
      SELECT 
        'play' as activity_type,
        up.created_at,
        m.title as mystery_title,
        u.username as user_name
      FROM user_progress up
      JOIN mysteries m ON up.mystery_id = m.id
      JOIN users u ON up.user_id = u.id
      WHERE m.creator_id = ?
      ORDER BY up.created_at DESC
      LIMIT 10
    `).bind(creatorId).all();

    return c.json({
      creator: creator,
      mysteries: mysteries.results,
      recent_activity: recentActivity.results,
      stats: {
        total_mysteries: mysteries.results.length,
        total_plays: mysteries.results.reduce((sum, m) => sum + (m.total_plays || 0), 0),
        avg_rating: mysteries.results.reduce((sum, m) => sum + (m.avg_rating || 0), 0) / mysteries.results.length || 0
      }
    });

  } catch (error) {
    return c.json({ error: 'Failed to fetch creator dashboard' }, 500);
  }
});

// Create New Mystery
contentApp.post('/creator/mysteries', authMiddleware, async (c) => {
  const { DB } = c.env;
  const payload = c.get('jwtPayload');
  const creatorId = payload.creator_id;
  
  try {
    const mysteryData = await c.req.json();
    const mysteryId = crypto.randomUUID();
    
    await DB.prepare(`
      INSERT INTO mysteries (
        id, title, description, world_setting, difficulty_level, 
        estimated_duration, status, creator_id, accessibility_features,
        content_warnings, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      mysteryId,
      mysteryData.title,
      mysteryData.description,
      mysteryData.world_setting,
      mysteryData.difficulty_level,
      mysteryData.estimated_duration,
      'draft',
      creatorId,
      JSON.stringify(mysteryData.accessibility_features || []),
      JSON.stringify(mysteryData.content_warnings || [])
    ).run();

    return c.json({ 
      id: mysteryId, 
      message: 'Mystery created successfully',
      status: 'draft'
    });

  } catch (error) {
    return c.json({ error: 'Failed to create mystery' }, 500);
  }
});

// Mystery Builder - Story Elements
contentApp.get('/creator/mysteries/:id/elements', authMiddleware, async (c) => {
  const { DB } = c.env;
  const mysteryId = c.req.param('id');
  
  try {
    const elements = await DB.prepare(`
      SELECT * FROM story_elements 
      WHERE mystery_id = ? 
      ORDER BY order_index ASC
    `).bind(mysteryId).all();

    // Group elements by type
    const groupedElements = elements.results.reduce((acc, element) => {
      if (!acc[element.type]) acc[element.type] = [];
      acc[element.type].push(element);
      return acc;
    }, {});

    return c.json({
      elements: elements.results,
      grouped: groupedElements,
      total_count: elements.results.length
    });

  } catch (error) {
    return c.json({ error: 'Failed to fetch story elements' }, 500);
  }
});

// Add Story Element
contentApp.post('/creator/mysteries/:id/elements', authMiddleware, async (c) => {
  const { DB } = c.env;
  const mysteryId = c.req.param('id');
  
  try {
    const elementData = await c.req.json();
    const elementId = crypto.randomUUID();
    
    await DB.prepare(`
      INSERT INTO story_elements (
        id, mystery_id, type, title, content, audio_description,
        spatial_position, trigger_conditions, accessibility_notes,
        order_index, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      elementId,
      mysteryId,
      elementData.type,
      elementData.title,
      elementData.content,
      elementData.audio_description,
      JSON.stringify(elementData.spatial_position || null),
      JSON.stringify(elementData.trigger_conditions || []),
      elementData.accessibility_notes,
      elementData.order_index || 0
    ).run();

    return c.json({ 
      id: elementId, 
      message: 'Story element added successfully' 
    });

  } catch (error) {
    return c.json({ error: 'Failed to add story element' }, 500);
  }
});

// Character Builder
contentApp.post('/creator/mysteries/:id/characters', authMiddleware, async (c) => {
  const { DB } = c.env;
  const mysteryId = c.req.param('id');
  
  try {
    const characterData = await c.req.json();
    const characterId = crypto.randomUUID();
    
    await DB.prepare(`
      INSERT INTO characters (
        id, mystery_id, name, description, personality_traits,
        voice_profile, dialogue_style, accessibility_description,
        role_in_mystery, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      characterId,
      mysteryId,
      characterData.name,
      characterData.description,
      JSON.stringify(characterData.personality_traits || []),
      JSON.stringify(characterData.voice_profile || {}),
      characterData.dialogue_style,
      characterData.accessibility_description,
      characterData.role_in_mystery
    ).run();

    return c.json({ 
      id: characterId, 
      message: 'Character created successfully' 
    });

  } catch (error) {
    return c.json({ error: 'Failed to create character' }, 500);
  }
});

// Audio Script Generator
contentApp.post('/creator/mysteries/:id/generate-audio-script', authMiddleware, async (c) => {
  const { DB } = c.env;
  const mysteryId = c.req.param('id');
  
  try {
    // Get all dialogue elements
    const dialogues = await DB.prepare(`
      SELECT se.*, c.name as character_name, c.voice_profile
      FROM story_elements se
      LEFT JOIN characters c ON se.character_id = c.id
      WHERE se.mystery_id = ? AND se.type = 'dialogue'
      ORDER BY se.order_index ASC
    `).bind(mysteryId).all();

    // Generate audio script with accessibility annotations
    const audioScript = {
      mystery_id: mysteryId,
      script_sections: dialogues.results.map(dialogue => ({
        section_id: dialogue.id,
        character_name: dialogue.character_name || 'Narrator',
        dialogue_text: dialogue.content,
        audio_description: dialogue.audio_description,
        accessibility_notes: dialogue.accessibility_notes,
        voice_direction: JSON.parse(dialogue.voice_profile || '{}'),
        spatial_position: JSON.parse(dialogue.spatial_position || '{}'),
        timing_notes: `Scene ${dialogue.order_index + 1}`
      })),
      accessibility_requirements: [
        'Clear pronunciation for voice synthesis',
        'Consistent character voice profiles',
        'Audio descriptions for visual elements',
        'Spatial audio positioning cues',
        'Background ambient sound descriptions'
      ],
      production_notes: {
        estimated_recording_time: dialogues.results.length * 2, // minutes
        voice_actors_needed: new Set(dialogues.results.map(d => d.character_name)).size,
        accessibility_review_required: true
      }
    };

    return c.json({
      script: audioScript,
      download_url: `/creator/mysteries/${mysteryId}/download-script`
    });

  } catch (error) {
    return c.json({ error: 'Failed to generate audio script' }, 500);
  }
});

// Accessibility Validator
contentApp.post('/creator/mysteries/:id/validate-accessibility', authMiddleware, async (c) => {
  const { DB } = c.env;
  const mysteryId = c.req.param('id');
  
  try {
    // Get mystery and all elements
    const mystery = await DB.prepare(`
      SELECT * FROM mysteries WHERE id = ?
    `).bind(mysteryId).first();

    const elements = await DB.prepare(`
      SELECT * FROM story_elements WHERE mystery_id = ?
    `).bind(mysteryId).all();

    const characters = await DB.prepare(`
      SELECT * FROM characters WHERE mystery_id = ?
    `).bind(mysteryId).all();

    // Accessibility validation checks
    const validationResults = {
      mystery_id: mysteryId,
      overall_score: 0,
      checks: {
        audio_descriptions: {
          passed: elements.results.every(e => e.audio_description && e.audio_description.trim().length > 10),
          message: 'All elements have detailed audio descriptions',
          required_for_wcag: true
        },
        spatial_audio_positioning: {
          passed: elements.results.filter(e => e.type === 'scene').every(e => {
            const position = JSON.parse(e.spatial_position || '{}');
            return position.x !== undefined && position.y !== undefined;
          }),
          message: 'All scenes have spatial audio positioning',
          required_for_wcag: false
        },
        character_voice_profiles: {
          passed: characters.results.every(c => {
            const profile = JSON.parse(c.voice_profile || '{}');
            return profile.pitch || profile.speed || profile.accent;
          }),
          message: 'All characters have distinct voice profiles',
          required_for_wcag: false
        },
        content_warnings: {
          passed: JSON.parse(mystery.content_warnings || '[]').length > 0,
          message: 'Content warnings provided for user safety',
          required_for_wcag: true
        },
        navigation_clarity: {
          passed: elements.results.filter(e => e.type === 'scene').every(e => 
            e.accessibility_notes && e.accessibility_notes.includes('navigation')
          ),
          message: 'Navigation instructions provided for all scenes',
          required_for_wcag: true
        },
        difficulty_appropriateness: {
          passed: mystery.difficulty_level && mystery.estimated_duration > 0,
          message: 'Difficulty and duration clearly specified',
          required_for_wcag: false
        }
      },
      recommendations: [],
      wcag_compliance_level: 'AA' // Will be calculated based on checks
    };

    // Calculate overall score
    const totalChecks = Object.keys(validationResults.checks).length;
    const passedChecks = Object.values(validationResults.checks).filter(check => check.passed).length;
    validationResults.overall_score = Math.round((passedChecks / totalChecks) * 100);

    // Add recommendations for failed checks
    Object.entries(validationResults.checks).forEach(([key, check]) => {
      if (!check.passed) {
        validationResults.recommendations.push({
          category: key,
          priority: check.required_for_wcag ? 'high' : 'medium',
          suggestion: getAccessibilityRecommendation(key)
        });
      }
    });

    // Determine WCAG compliance level
    const requiredChecksPassed = Object.values(validationResults.checks)
      .filter(check => check.required_for_wcag && check.passed).length;
    const totalRequiredChecks = Object.values(validationResults.checks)
      .filter(check => check.required_for_wcag).length;
    
    if (requiredChecksPassed === totalRequiredChecks) {
      validationResults.wcag_compliance_level = 'AA';
    } else if (requiredChecksPassed > totalRequiredChecks * 0.7) {
      validationResults.wcag_compliance_level = 'A';
    } else {
      validationResults.wcag_compliance_level = 'Non-compliant';
    }

    return c.json(validationResults);

  } catch (error) {
    return c.json({ error: 'Failed to validate accessibility' }, 500);
  }
});

// Content Review System
contentApp.post('/creator/mysteries/:id/submit-for-review', authMiddleware, async (c) => {
  const { DB } = c.env;
  const mysteryId = c.req.param('id');
  const payload = c.get('jwtPayload');
  const creatorId = payload.creator_id;
  
  try {
    // Update mystery status to review
    await DB.prepare(`
      UPDATE mysteries 
      SET status = 'review', updated_at = datetime('now')
      WHERE id = ? AND creator_id = ?
    `).bind(mysteryId, creatorId).run();

    // Create review request
    const reviewId = crypto.randomUUID();
    await DB.prepare(`
      INSERT INTO content_reviews (
        id, mystery_id, creator_id, status, submitted_at
      ) VALUES (?, ?, ?, 'pending', datetime('now'))
    `).bind(reviewId, mysteryId, creatorId).run();

    return c.json({ 
      message: 'Mystery submitted for review successfully',
      review_id: reviewId,
      estimated_review_time: '2-5 business days'
    });

  } catch (error) {
    return c.json({ error: 'Failed to submit for review' }, 500);
  }
});

// Creator Analytics
contentApp.get('/creator/analytics', authMiddleware, async (c) => {
  const { DB } = c.env;
  const payload = c.get('jwtPayload');
  const creatorId = payload.creator_id;
  
  try {
    // Get creator's content performance
    const mysteriesAnalytics = await DB.prepare(`
      SELECT 
        m.id,
        m.title,
        COUNT(DISTINCT up.user_id) as unique_players,
        COUNT(up.id) as total_sessions,
        AVG(up.completion_percentage) as avg_completion,
        AVG(ur.rating) as avg_rating,
        COUNT(ur.id) as total_ratings
      FROM mysteries m
      LEFT JOIN user_progress up ON m.id = up.mystery_id
      LEFT JOIN user_ratings ur ON m.id = ur.mystery_id
      WHERE m.creator_id = ?
      GROUP BY m.id
      ORDER BY unique_players DESC
    `).bind(creatorId).all();

    // Get accessibility metrics
    const accessibilityMetrics = await DB.prepare(`
      SELECT 
        AVG(CASE WHEN ua.screen_reader_enabled = 1 THEN 1 ELSE 0 END) * 100 as screen_reader_usage,
        AVG(CASE WHEN ua.voice_only_mode = 1 THEN 1 ELSE 0 END) * 100 as voice_only_usage,
        AVG(ua.accessibility_score) as avg_accessibility_score
      FROM user_accessibility_stats ua
      JOIN mysteries m ON ua.mystery_id = m.id
      WHERE m.creator_id = ?
    `).bind(creatorId).first();

    return c.json({
      mysteries: mysteriesAnalytics.results,
      accessibility: accessibilityMetrics,
      summary: {
        total_unique_players: mysteriesAnalytics.results.reduce((sum, m) => sum + (m.unique_players || 0), 0),
        avg_rating_across_all: mysteriesAnalytics.results.reduce((sum, m) => sum + (m.avg_rating || 0), 0) / mysteriesAnalytics.results.length || 0,
        accessibility_score: accessibilityMetrics?.avg_accessibility_score || 0
      }
    });

  } catch (error) {
    return c.json({ error: 'Failed to fetch creator analytics' }, 500);
  }
});

// Helper function for accessibility recommendations
function getAccessibilityRecommendation(checkType: string): string {
  const recommendations = {
    audio_descriptions: 'Add detailed audio descriptions for all visual elements. Describe actions, settings, and important visual cues in 20-50 words.',
    spatial_audio_positioning: 'Define X, Y, Z coordinates for spatial audio positioning. This helps users navigate with directional audio cues.',
    character_voice_profiles: 'Create distinct voice profiles for each character with pitch, speed, and accent specifications for voice synthesis.',
    content_warnings: 'Add appropriate content warnings for violence, adult themes, or potentially triggering content to ensure user safety.',
    navigation_clarity: 'Include clear navigation instructions in accessibility notes. Explain how users can move between scenes and interact with elements.',
    difficulty_appropriateness: 'Clearly specify difficulty level and estimated completion time to help users choose appropriate content.'
  };
  
  return recommendations[checkType] || 'Please review this aspect of your content for better accessibility.';
}

export default contentApp;