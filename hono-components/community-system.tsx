import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt } from 'hono/jwt'

type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
  R2: R2Bucket;
}

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  accessibility_preferences: {
    screen_reader: boolean;
    voice_speed: number;
    spatial_audio: boolean;
    high_contrast: boolean;
    audio_descriptions: boolean;
  };
  achievements: string[];
  total_cases_completed: number;
  favorite_genres: string[];
  community_reputation: number;
  created_at: string;
}

interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  post_type: 'discussion' | 'review' | 'tip' | 'accessibility_feedback' | 'case_help';
  mystery_id?: string;
  attachments: string[];
  accessibility_features: {
    alt_text: string;
    audio_transcript: string;
    content_warnings: string[];
  };
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    accessibility_helpful_votes: number;
  };
  created_at: string;
  updated_at: string;
}

interface AccessibilityReview {
  id: string;
  mystery_id: string;
  reviewer_id: string;
  accessibility_scores: {
    voice_navigation: number;
    screen_reader_compatibility: number;
    audio_clarity: number;
    spatial_audio_quality: number;
    cognitive_load: number;
  };
  detailed_feedback: string;
  recommended_improvements: string[];
  would_recommend: boolean;
  accessibility_level: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
}

// Community System Routes
const communityApp = new Hono<{ Bindings: Bindings }>()

communityApp.use('/*', cors())

const authMiddleware = jwt({
  secret: 'your-jwt-secret', // In production, use environment variable
})

// Community Feed - Accessible Posts Discovery
communityApp.get('/community/feed', async (c) => {
  const { DB } = c.env;
  const userId = c.req.query('user_id');
  const filterType = c.req.query('filter') || 'all'; // all, accessibility, reviews, tips
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = parseInt(c.req.query('offset') || '0');

  try {
    let whereClause = '';
    let params: any[] = [];

    switch (filterType) {
      case 'accessibility':
        whereClause = "WHERE p.post_type = 'accessibility_feedback'";
        break;
      case 'reviews':
        whereClause = "WHERE p.post_type = 'review'";
        break;
      case 'tips':
        whereClause = "WHERE p.post_type = 'tip'";
        break;
      case 'help':
        whereClause = "WHERE p.post_type = 'case_help'";
        break;
    }

    const posts = await DB.prepare(`
      SELECT 
        p.*,
        u.username,
        u.display_name,
        u.avatar_url,
        u.community_reputation,
        m.title as mystery_title,
        COUNT(c.id) as comment_count,
        COUNT(DISTINCT l.user_id) as like_count,
        ${userId ? `EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ?) as user_liked` : '0 as user_liked'}
      FROM community_posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN mysteries m ON p.mystery_id = m.id
      LEFT JOIN post_comments c ON p.id = c.post_id
      LEFT JOIN post_likes l ON p.id = l.post_id
      ${whereClause}
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(...(userId ? [userId] : []), limit, offset).all();

    // Get accessibility tags for each post
    for (const post of posts.results) {
      const accessibilityTags = await DB.prepare(`
        SELECT tag_name FROM post_accessibility_tags WHERE post_id = ?
      `).bind(post.id).all();
      
      post.accessibility_tags = accessibilityTags.results.map(tag => tag.tag_name);
    }

    return c.json({
      posts: posts.results,
      total_count: posts.results.length,
      has_more: posts.results.length === limit
    });

  } catch (error) {
    return c.json({ error: 'Failed to fetch community feed' }, 500);
  }
});

// Create Community Post with Accessibility Features
communityApp.post('/community/posts', authMiddleware, async (c) => {
  const { DB } = c.env;
  const payload = c.get('jwtPayload');
  const userId = payload.user_id;

  try {
    const postData = await c.req.json();
    const postId = crypto.randomUUID();

    // Validate accessibility requirements
    if (!postData.accessibility_features?.alt_text && postData.attachments?.length > 0) {
      return c.json({ error: 'Alt text required for posts with attachments' }, 400);
    }

    await DB.prepare(`
      INSERT INTO community_posts (
        id, user_id, content, post_type, mystery_id, attachments,
        accessibility_features, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      postId,
      userId,
      postData.content,
      postData.post_type,
      postData.mystery_id || null,
      JSON.stringify(postData.attachments || []),
      JSON.stringify(postData.accessibility_features || {})
    ).run();

    // Add accessibility tags if provided
    if (postData.accessibility_tags?.length > 0) {
      for (const tag of postData.accessibility_tags) {
        await DB.prepare(`
          INSERT INTO post_accessibility_tags (post_id, tag_name) VALUES (?, ?)
        `).bind(postId, tag).run();
      }
    }

    // Award community participation points
    await this.awardCommunityPoints(userId, 'post_created', 10, DB);

    return c.json({
      id: postId,
      message: 'Post created successfully',
      accessibility_compliance: true
    });

  } catch (error) {
    return c.json({ error: 'Failed to create post' }, 500);
  }
});

// Accessibility-First Comments System
communityApp.post('/community/posts/:postId/comments', authMiddleware, async (c) => {
  const { DB } = c.env;
  const payload = c.get('jwtPayload');
  const userId = payload.user_id;
  const postId = c.req.param('postId');

  try {
    const commentData = await c.req.json();
    const commentId = crypto.randomUUID();

    await DB.prepare(`
      INSERT INTO post_comments (
        id, post_id, user_id, content, accessibility_features,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      commentId,
      postId,
      userId,
      commentData.content,
      JSON.stringify(commentData.accessibility_features || {})
    ).run();

    // Notify post author (accessibility-aware notifications)
    await this.sendAccessibilityNotification(postId, userId, 'comment', DB);

    return c.json({
      id: commentId,
      message: 'Comment added successfully'
    });

  } catch (error) {
    return c.json({ error: 'Failed to add comment' }, 500);
  }
});

// Accessibility Review System
communityApp.post('/community/accessibility-reviews', authMiddleware, async (c) => {
  const { DB } = c.env;
  const payload = c.get('jwtPayload');
  const reviewerId = payload.user_id;

  try {
    const reviewData = await c.req.json();
    const reviewId = crypto.randomUUID();

    // Validate reviewer credentials (must have completed the mystery)
    const userProgress = await DB.prepare(`
      SELECT * FROM user_progress 
      WHERE user_id = ? AND mystery_id = ? AND completed = 1
    `).bind(reviewerId, reviewData.mystery_id).first();

    if (!userProgress) {
      return c.json({ error: 'Must complete mystery to write accessibility review' }, 403);
    }

    await DB.prepare(`
      INSERT INTO accessibility_reviews (
        id, mystery_id, reviewer_id, accessibility_scores,
        detailed_feedback, recommended_improvements,
        would_recommend, accessibility_level, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      reviewId,
      reviewData.mystery_id,
      reviewerId,
      JSON.stringify(reviewData.accessibility_scores),
      reviewData.detailed_feedback,
      JSON.stringify(reviewData.recommended_improvements || []),
      reviewData.would_recommend,
      reviewData.accessibility_level
    ).run();

    // Update mystery accessibility rating
    await this.updateMysteryAccessibilityRating(reviewData.mystery_id, DB);

    // Award reviewer points
    await this.awardCommunityPoints(reviewerId, 'accessibility_review', 25, DB);

    return c.json({
      id: reviewId,
      message: 'Accessibility review submitted successfully'
    });

  } catch (error) {
    return c.json({ error: 'Failed to submit accessibility review' }, 500);
  }
});

// Community Achievements & Reputation System
communityApp.get('/community/users/:userId/achievements', async (c) => {
  const { DB } = c.env;
  const userId = c.req.param('userId');

  try {
    // Get user's achievements
    const achievements = await DB.prepare(`
      SELECT 
        a.*,
        ua.earned_at,
        ua.progress_data
      FROM user_achievements ua
      JOIN achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = ?
      ORDER BY ua.earned_at DESC
    `).bind(userId).all();

    // Get community reputation breakdown
    const reputationBreakdown = await DB.prepare(`
      SELECT 
        action_type,
        SUM(points) as total_points,
        COUNT(*) as action_count
      FROM community_reputation_log
      WHERE user_id = ?
      GROUP BY action_type
      ORDER BY total_points DESC
    `).bind(userId).all();

    // Get accessibility contribution stats
    const accessibilityStats = await DB.prepare(`
      SELECT 
        COUNT(ar.id) as reviews_written,
        AVG(ar.accessibility_scores) as avg_scores_given,
        COUNT(CASE WHEN ar.would_recommend = 1 THEN 1 END) as positive_recommendations
      FROM accessibility_reviews ar
      WHERE ar.reviewer_id = ?
    `).bind(userId).first();

    return c.json({
      achievements: achievements.results,
      reputation_breakdown: reputationBreakdown.results,
      accessibility_contributions: accessibilityStats,
      total_reputation: reputationBreakdown.results.reduce((sum, item) => sum + item.total_points, 0)
    });

  } catch (error) {
    return c.json({ error: 'Failed to fetch user achievements' }, 500);
  }
});

// Accessibility Help & Mentorship System
communityApp.get('/community/accessibility/mentors', async (c) => {
  const { DB } = c.env;
  const specialization = c.req.query('specialization'); // screen_reader, voice_control, spatial_audio, etc.

  try {
    let whereClause = '';
    let params: any[] = [];

    if (specialization) {
      whereClause = 'WHERE JSON_EXTRACT(m.specializations, ?) = 1';
      params.push(`$.${specialization}`);
    }

    const mentors = await DB.prepare(`
      SELECT 
        u.id,
        u.username,
        u.display_name,
        u.bio,
        u.avatar_url,
        u.community_reputation,
        m.specializations,
        m.availability_hours,
        m.preferred_communication,
        m.languages_supported,
        COUNT(mr.id) as mentorship_sessions,
        AVG(mr.rating) as avg_mentor_rating
      FROM users u
      JOIN accessibility_mentors m ON u.id = m.user_id
      LEFT JOIN mentorship_reviews mr ON u.id = mr.mentor_id
      ${whereClause}
      GROUP BY u.id
      HAVING u.community_reputation >= 100
      ORDER BY avg_mentor_rating DESC, u.community_reputation DESC
      LIMIT 20
    `).bind(...params).all();

    return c.json({
      mentors: mentors.results,
      specializations_available: [
        'screen_reader',
        'voice_control', 
        'spatial_audio',
        'cognitive_accessibility',
        'motor_accessibility',
        'visual_impairments',
        'hearing_impairments'
      ]
    });

  } catch (error) {
    return c.json({ error: 'Failed to fetch accessibility mentors' }, 500);
  }
});

// Request Mentorship Session
communityApp.post('/community/mentorship/request', authMiddleware, async (c) => {
  const { DB } = c.env;
  const payload = c.get('jwtPayload');
  const userId = payload.user_id;

  try {
    const requestData = await c.req.json();
    const sessionId = crypto.randomUUID();

    await DB.prepare(`
      INSERT INTO mentorship_requests (
        id, mentee_id, mentor_id, topic, accessibility_focus,
        preferred_time, communication_method, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
    `).bind(
      sessionId,
      userId,
      requestData.mentor_id,
      requestData.topic,
      requestData.accessibility_focus,
      requestData.preferred_time,
      requestData.communication_method
    ).run();

    // Send notification to mentor
    await this.sendAccessibilityNotification(
      requestData.mentor_id, 
      userId, 
      'mentorship_request',
      DB,
      { session_id: sessionId, topic: requestData.topic }
    );

    return c.json({
      session_id: sessionId,
      message: 'Mentorship request sent successfully'
    });

  } catch (error) {
    return c.json({ error: 'Failed to request mentorship session' }, 500);
  }
});

// Community Guidelines & Accessibility Standards
communityApp.get('/community/accessibility/guidelines', async (c) => {
  return c.json({
    content_guidelines: {
      required_features: [
        'Alt text for all images and media',
        'Transcripts for audio content',
        'Clear, descriptive link text',
        'Proper heading structure (H1-H6)',
        'Content warnings for sensitive topics'
      ],
      recommended_practices: [
        'Use clear, simple language',
        'Provide multiple ways to access information',
        'Include audio descriptions for visual content',
        'Test with screen readers before posting',
        'Consider cognitive load and complexity'
      ],
      community_standards: [
        'Respectful language about disabilities',
        'Person-first or identity-first language as preferred',
        'No assumptions about accessibility needs',
        'Constructive feedback only',
        'Share knowledge and resources freely'
      ]
    },
    posting_checklist: [
      'Added alt text to images?',
      'Included content warnings if needed?',
      'Used clear, descriptive language?',
      'Tested with screen reader (if possible)?',
      'Provided multiple formats (text, audio)?'
    ],
    accessibility_tags: [
      'screen-reader-tested',
      'voice-navigation-friendly', 
      'high-contrast-compatible',
      'cognitive-friendly',
      'motor-accessible',
      'beginner-friendly',
      'advanced-techniques'
    ]
  });
});

// Community Leaderboard - Accessibility Contributions
communityApp.get('/community/leaderboard/accessibility', async (c) => {
  const { DB } = c.env;
  const timeframe = c.req.query('timeframe') || 'all_time'; // week, month, all_time

  try {
    let dateFilter = '';
    if (timeframe === 'week') {
      dateFilter = "AND crl.created_at >= datetime('now', '-7 days')";
    } else if (timeframe === 'month') {
      dateFilter = "AND crl.created_at >= datetime('now', '-30 days')";
    }

    const leaderboard = await DB.prepare(`
      SELECT 
        u.id,
        u.username,
        u.display_name,
        u.avatar_url,
        SUM(crl.points) as total_points,
        COUNT(DISTINCT ar.id) as accessibility_reviews,
        COUNT(DISTINCT p.id) as helpful_posts,
        COUNT(DISTINCT mr.id) as mentorship_sessions
      FROM users u
      JOIN community_reputation_log crl ON u.id = crl.user_id
      LEFT JOIN accessibility_reviews ar ON u.id = ar.reviewer_id
      LEFT JOIN community_posts p ON u.id = p.user_id AND p.post_type = 'accessibility_feedback'
      LEFT JOIN mentorship_requests mr ON u.id = mr.mentor_id AND mr.status = 'completed'
      WHERE crl.action_type IN ('accessibility_review', 'helpful_post', 'mentorship_session')
      ${dateFilter}
      GROUP BY u.id
      HAVING total_points > 0
      ORDER BY total_points DESC
      LIMIT 50
    `).bind().all();

    return c.json({
      leaderboard: leaderboard.results,
      timeframe: timeframe,
      updated_at: new Date().toISOString()
    });

  } catch (error) {
    return c.json({ error: 'Failed to fetch accessibility leaderboard' }, 500);
  }
});

// Helper Functions
async function awardCommunityPoints(userId: string, actionType: string, points: number, DB: D1Database) {
  try {
    // Record the points
    await DB.prepare(`
      INSERT INTO community_reputation_log (
        id, user_id, action_type, points, created_at
      ) VALUES (?, ?, ?, ?, datetime('now'))
    `).bind(crypto.randomUUID(), userId, actionType, points).run();

    // Update user's total reputation
    await DB.prepare(`
      UPDATE users 
      SET community_reputation = community_reputation + ?
      WHERE id = ?
    `).bind(points, userId).run();

    // Check for achievement unlocks
    await checkAchievementUnlocks(userId, actionType, DB);

  } catch (error) {
    console.error('Failed to award community points:', error);
  }
}

async function checkAchievementUnlocks(userId: string, actionType: string, DB: D1Database) {
  try {
    // Define achievement criteria
    const achievementChecks = [
      {
        id: 'first_accessibility_review',
        condition: actionType === 'accessibility_review',
        requirement: 1,
        query: 'SELECT COUNT(*) as count FROM accessibility_reviews WHERE reviewer_id = ?'
      },
      {
        id: 'accessibility_advocate',
        condition: actionType === 'accessibility_review',
        requirement: 10,
        query: 'SELECT COUNT(*) as count FROM accessibility_reviews WHERE reviewer_id = ?'
      },
      {
        id: 'community_helper',
        condition: actionType === 'helpful_post',
        requirement: 5,
        query: 'SELECT COUNT(*) as count FROM community_posts WHERE user_id = ? AND post_type = "accessibility_feedback"'
      }
    ];

    for (const check of achievementChecks) {
      if (check.condition) {
        const result = await DB.prepare(check.query).bind(userId).first();
        
        if (result.count >= check.requirement) {
          // Check if user already has this achievement
          const existing = await DB.prepare(`
            SELECT id FROM user_achievements WHERE user_id = ? AND achievement_id = ?
          `).bind(userId, check.id).first();

          if (!existing) {
            // Award the achievement
            await DB.prepare(`
              INSERT INTO user_achievements (
                id, user_id, achievement_id, earned_at, progress_data
              ) VALUES (?, ?, ?, datetime('now'), ?)
            `).bind(
              crypto.randomUUID(),
              userId,
              check.id,
              JSON.stringify({ count: result.count })
            ).run();
          }
        }
      }
    }

  } catch (error) {
    console.error('Failed to check achievement unlocks:', error);
  }
}

async function sendAccessibilityNotification(
  targetUserId: string, 
  fromUserId: string, 
  type: string, 
  DB: D1Database,
  additionalData: any = {}
) {
  try {
    // Get target user's accessibility preferences
    const user = await DB.prepare(`
      SELECT accessibility_preferences FROM users WHERE id = ?
    `).bind(targetUserId).first();

    const preferences = JSON.parse(user?.accessibility_preferences || '{}');
    
    // Create notification with accessibility features
    const notificationId = crypto.randomUUID();
    await DB.prepare(`
      INSERT INTO notifications (
        id, user_id, type, content, accessibility_features,
        additional_data, created_at, read_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), NULL)
    `).bind(
      notificationId,
      targetUserId,
      type,
      generateNotificationContent(type, additionalData),
      JSON.stringify({
        high_priority: type === 'accessibility_issue',
        voice_announcement: preferences.voice_notifications !== false,
        vibration_pattern: type === 'urgent' ? 'long' : 'short'
      }),
      JSON.stringify(additionalData)
    ).run();

  } catch (error) {
    console.error('Failed to send accessibility notification:', error);
  }
}

function generateNotificationContent(type: string, data: any): string {
  const templates = {
    comment: 'Someone commented on your post',
    mentorship_request: `New mentorship request: ${data.topic}`,
    accessibility_review: 'Your content received an accessibility review',
    achievement: `You earned a new achievement: ${data.achievement_name}`,
    community_milestone: `Community milestone reached: ${data.milestone}`
  };
  
  return templates[type] || 'You have a new notification';
}

async function updateMysteryAccessibilityRating(mysteryId: string, DB: D1Database) {
  try {
    // Calculate average accessibility scores
    const scores = await DB.prepare(`
      SELECT 
        AVG(JSON_EXTRACT(accessibility_scores, '$.voice_navigation')) as avg_voice,
        AVG(JSON_EXTRACT(accessibility_scores, '$.screen_reader_compatibility')) as avg_screen_reader,
        AVG(JSON_EXTRACT(accessibility_scores, '$.audio_clarity')) as avg_audio_clarity,
        AVG(JSON_EXTRACT(accessibility_scores, '$.spatial_audio_quality')) as avg_spatial_audio,
        AVG(JSON_EXTRACT(accessibility_scores, '$.cognitive_load')) as avg_cognitive_load,
        COUNT(*) as review_count
      FROM accessibility_reviews
      WHERE mystery_id = ?
    `).bind(mysteryId).first();

    if (scores.review_count > 0) {
      const overallScore = (
        scores.avg_voice +
        scores.avg_screen_reader +
        scores.avg_audio_clarity +
        scores.avg_spatial_audio +
        scores.avg_cognitive_load
      ) / 5;

      await DB.prepare(`
        UPDATE mysteries
        SET 
          accessibility_rating = ?,
          accessibility_review_count = ?,
          accessibility_scores = ?
        WHERE id = ?
      `).bind(
        Math.round(overallScore * 10) / 10,
        scores.review_count,
        JSON.stringify({
          voice_navigation: Math.round(scores.avg_voice * 10) / 10,
          screen_reader_compatibility: Math.round(scores.avg_screen_reader * 10) / 10,
          audio_clarity: Math.round(scores.avg_audio_clarity * 10) / 10,
          spatial_audio_quality: Math.round(scores.avg_spatial_audio * 10) / 10,
          cognitive_load: Math.round(scores.avg_cognitive_load * 10) / 10
        }),
        mysteryId
      ).run();
    }

  } catch (error) {
    console.error('Failed to update mystery accessibility rating:', error);
  }
}

export default communityApp;