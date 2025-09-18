import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
}

interface UserProfile {
  user_id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  accessibility_preferences: Record<string, any>;
  badges: string[];
  achievements: string[];
  total_mysteries_completed: number;
  total_playtime_hours: number;
  favorite_genres: string[];
  privacy_level: 'public' | 'friends' | 'private';
  created_at: string;
  last_active: string;
}

interface CommunityPost {
  post_id: string;
  user_id: string;
  content: string;
  post_type: 'discussion' | 'review' | 'tip' | 'accessibility_feedback' | 'mystery_recommendation';
  mystery_id?: string;
  accessibility_tags: string[];
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

interface AccessibilityFeedback {
  feedback_id: string;
  user_id: string;
  mystery_id: string;
  accessibility_rating: number;
  features_used: string[];
  improvement_suggestions: string[];
  positive_aspects: string[];
  difficulty_level: string;
  assistive_tech_used: string[];
  helpful_for_community: boolean;
  created_at: string;
}

interface MysteryReview {
  review_id: string;
  user_id: string;
  mystery_id: string;
  rating: number;
  title: string;
  content: string;
  accessibility_score: number;
  voice_command_rating: number;
  audio_quality_rating: number;
  story_rating: number;
  replay_value: number;
  recommended_for: string[];
  content_warnings: string[];
  spoiler_free: boolean;
  created_at: string;
}

// Community Features and Social Integration
const communityApp = new Hono<{ Bindings: Bindings }>()

communityApp.use('/*', cors())

// User Profile Management
communityApp.get('/community/profile/:userId', async (c) => {
  const { DB } = c.env;
  const userId = c.req.param('userId');
  
  try {
    // Get user profile
    const profile = await DB.prepare(`
      SELECT * FROM user_profiles WHERE user_id = ?
    `).bind(userId).first();
    
    if (!profile) {
      return c.json({ error: 'User profile not found' }, 404);
    }
    
    // Get user's recent activity
    const recentActivity = await DB.prepare(`
      SELECT 
        'mystery_completed' as activity_type,
        m.title as mystery_title,
        up.completed_at as timestamp,
        up.completion_percentage
      FROM user_progress up
      JOIN mysteries m ON up.mystery_id = m.id
      WHERE up.user_id = ? AND up.completed = 1
      ORDER BY up.completed_at DESC
      LIMIT 10
    `).bind(userId).all();
    
    // Get user's badges and achievements
    const badges = await DB.prepare(`
      SELECT 
        badge_name,
        badge_description,
        earned_at,
        rarity_level
      FROM user_badges
      WHERE user_id = ?
      ORDER BY earned_at DESC
    `).bind(userId).all();
    
    // Get user's mystery reviews
    const reviews = await DB.prepare(`
      SELECT 
        r.*,
        m.title as mystery_title
      FROM mystery_reviews r
      JOIN mysteries m ON r.mystery_id = m.id
      WHERE r.user_id = ? AND r.spoiler_free = 1
      ORDER BY r.created_at DESC
      LIMIT 5
    `).bind(userId).all();
    
    return c.json({
      profile: {
        ...profile,
        accessibility_preferences: JSON.parse(profile.accessibility_preferences || '{}'),
        badges: JSON.parse(profile.badges || '[]'),
        achievements: JSON.parse(profile.achievements || '[]'),
        favorite_genres: JSON.parse(profile.favorite_genres || '[]')
      },
      recent_activity: recentActivity.results,
      badges: badges.results,
      reviews: reviews.results,
      stats: {
        mysteries_completed: profile.total_mysteries_completed,
        playtime_hours: profile.total_playtime_hours,
        community_contributions: await getContributionCount(DB, userId),
        accessibility_helpfulness: await getAccessibilityHelpfulnessScore(DB, userId)
      }
    });
    
  } catch (error) {
    return c.json({ error: 'Failed to fetch user profile' }, 500);
  }
});

// Community Feed
communityApp.get('/community/feed', async (c) => {
  const { DB } = c.env;
  const userId = c.req.query('user_id');
  const feedType = c.req.query('type') || 'all'; // all, accessibility, reviews, discussions
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = parseInt(c.req.query('offset') || '0');
  
  try {
    let whereClause = '1=1';
    if (feedType !== 'all') {
      whereClause = `p.post_type = '${feedType}'`;
    }
    
    // Get community posts with user info
    const posts = await DB.prepare(`
      SELECT 
        p.*,
        u.username,
        u.display_name,
        u.avatar_url,
        m.title as mystery_title,
        COUNT(pl.user_id) as likes_count,
        COUNT(pc.id) as comments_count
      FROM community_posts p
      JOIN user_profiles u ON p.user_id = u.user_id
      LEFT JOIN mysteries m ON p.mystery_id = m.id
      LEFT JOIN post_likes pl ON p.post_id = pl.post_id
      LEFT JOIN post_comments pc ON p.post_id = pc.post_id
      WHERE ${whereClause} AND u.privacy_level IN ('public', 'friends')
      GROUP BY p.post_id
      ORDER BY 
        p.is_pinned DESC,
        p.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all();
    
    // Get user interactions if user_id provided
    let userInteractions = {};
    if (userId) {
      const interactions = await DB.prepare(`
        SELECT 
          post_id,
          'like' as interaction_type
        FROM post_likes
        WHERE user_id = ?
        UNION
        SELECT 
          post_id,
          'comment' as interaction_type
        FROM post_comments
        WHERE user_id = ?
      `).bind(userId, userId).all();
      
      userInteractions = interactions.results.reduce((acc, int) => {
        if (!acc[int.post_id]) acc[int.post_id] = [];
        acc[int.post_id].push(int.interaction_type);
        return acc;
      }, {});
    }
    
    return c.json({
      posts: posts.results.map(post => ({
        ...post,
        accessibility_tags: JSON.parse(post.accessibility_tags || '[]'),
        user_interactions: userInteractions[post.post_id] || []
      })),
      pagination: {
        limit,
        offset,
        has_more: posts.results.length === limit
      }
    });
    
  } catch (error) {
    return c.json({ error: 'Failed to fetch community feed' }, 500);
  }
});

// Create Community Post
communityApp.post('/community/posts', async (c) => {
  const { DB } = c.env;
  
  try {
    const postData = await c.req.json();
    const postId = crypto.randomUUID();
    
    await DB.prepare(`
      INSERT INTO community_posts (
        post_id, user_id, content, post_type, mystery_id,
        accessibility_tags, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      postId,
      postData.user_id,
      postData.content,
      postData.post_type,
      postData.mystery_id || null,
      JSON.stringify(postData.accessibility_tags || [])
    ).run();
    
    // Award badge for first community post
    await checkAndAwardCommunityBadges(DB, postData.user_id, 'first_post');
    
    return c.json({ 
      post_id: postId, 
      message: 'Post created successfully' 
    });
    
  } catch (error) {
    return c.json({ error: 'Failed to create post' }, 500);
  }
});

// Accessibility Feedback System
communityApp.post('/community/accessibility-feedback', async (c) => {
  const { DB } = c.env;
  
  try {
    const feedbackData = await c.req.json();
    const feedbackId = crypto.randomUUID();
    
    await DB.prepare(`
      INSERT INTO accessibility_feedback (
        feedback_id, user_id, mystery_id, accessibility_rating,
        features_used, improvement_suggestions, positive_aspects,
        difficulty_level, assistive_tech_used, helpful_for_community,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      feedbackId,
      feedbackData.user_id,
      feedbackData.mystery_id,
      feedbackData.accessibility_rating,
      JSON.stringify(feedbackData.features_used || []),
      JSON.stringify(feedbackData.improvement_suggestions || []),
      JSON.stringify(feedbackData.positive_aspects || []),
      feedbackData.difficulty_level,
      JSON.stringify(feedbackData.assistive_tech_used || []),
      feedbackData.helpful_for_community || false
    ).run();
    
    // Create community post for helpful feedback
    if (feedbackData.helpful_for_community) {
      await createAccessibilityFeedbackPost(DB, feedbackData, feedbackId);
    }
    
    // Award accessibility advocate badge
    await checkAndAwardCommunityBadges(DB, feedbackData.user_id, 'accessibility_feedback');
    
    return c.json({ 
      feedback_id: feedbackId, 
      message: 'Accessibility feedback submitted successfully' 
    });
    
  } catch (error) {
    return c.json({ error: 'Failed to submit accessibility feedback' }, 500);
  }
});

// Mystery Reviews
communityApp.post('/community/reviews', async (c) => {
  const { DB } = c.env;
  
  try {
    const reviewData = await c.req.json();
    const reviewId = crypto.randomUUID();
    
    await DB.prepare(`
      INSERT INTO mystery_reviews (
        review_id, user_id, mystery_id, rating, title, content,
        accessibility_score, voice_command_rating, audio_quality_rating,
        story_rating, replay_value, recommended_for, content_warnings,
        spoiler_free, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      reviewId,
      reviewData.user_id,
      reviewData.mystery_id,
      reviewData.rating,
      reviewData.title,
      reviewData.content,
      reviewData.accessibility_score,
      reviewData.voice_command_rating,
      reviewData.audio_quality_rating,
      reviewData.story_rating,
      reviewData.replay_value,
      JSON.stringify(reviewData.recommended_for || []),
      JSON.stringify(reviewData.content_warnings || []),
      reviewData.spoiler_free
    ).run();
    
    // Create community post for the review
    if (reviewData.share_to_community) {
      await createReviewCommunityPost(DB, reviewData, reviewId);
    }
    
    return c.json({ 
      review_id: reviewId, 
      message: 'Review submitted successfully' 
    });
    
  } catch (error) {
    return c.json({ error: 'Failed to submit review' }, 500);
  }
});

// Accessibility Leaderboard
communityApp.get('/community/accessibility-leaderboard', async (c) => {
  const { DB } = c.env;
  const timeframe = c.req.query('timeframe') || '30d'; // 7d, 30d, all
  
  try {
    let dateFilter = '';
    switch (timeframe) {
      case '7d':
        dateFilter = "AND af.created_at >= datetime('now', '-7 days')";
        break;
      case '30d':
        dateFilter = "AND af.created_at >= datetime('now', '-30 days')";
        break;
    }
    
    // Get accessibility contributors
    const leaderboard = await DB.prepare(`
      SELECT 
        u.user_id,
        u.username,
        u.display_name,
        u.avatar_url,
        COUNT(af.feedback_id) as feedback_count,
        AVG(af.accessibility_rating) as avg_accessibility_rating,
        COUNT(CASE WHEN af.helpful_for_community = 1 THEN 1 END) as helpful_feedback_count,
        COUNT(DISTINCT af.mystery_id) as mysteries_reviewed,
        SUM(CASE WHEN af.helpful_for_community = 1 THEN 5 ELSE 1 END) as accessibility_points
      FROM user_profiles u
      JOIN accessibility_feedback af ON u.user_id = af.user_id
      WHERE u.privacy_level = 'public' ${dateFilter}
      GROUP BY u.user_id
      HAVING feedback_count >= 3
      ORDER BY accessibility_points DESC, helpful_feedback_count DESC
      LIMIT 50
    `).all();
    
    // Get accessibility badges for top contributors
    const topUserIds = leaderboard.results.slice(0, 10).map(user => user.user_id);
    const badges = await DB.prepare(`
      SELECT 
        user_id,
        badge_name,
        badge_description,
        rarity_level
      FROM user_badges
      WHERE user_id IN (${topUserIds.map(() => '?').join(',')}) 
        AND badge_name LIKE '%accessibility%'
    `).bind(...topUserIds).all();
    
    const badgesByUser = badges.results.reduce((acc, badge) => {
      if (!acc[badge.user_id]) acc[badge.user_id] = [];
      acc[badge.user_id].push(badge);
      return acc;
    }, {});
    
    return c.json({
      leaderboard: leaderboard.results.map(user => ({
        ...user,
        accessibility_badges: badgesByUser[user.user_id] || []
      })),
      timeframe,
      total_contributors: leaderboard.results.length
    });
    
  } catch (error) {
    return c.json({ error: 'Failed to fetch accessibility leaderboard' }, 500);
  }
});

// Community Challenges
communityApp.get('/community/challenges', async (c) => {
  const { DB } = c.env;
  
  try {
    // Get active community challenges
    const challenges = await DB.prepare(`
      SELECT 
        challenge_id,
        title,
        description,
        challenge_type,
        requirements,
        reward_badge,
        reward_points,
        start_date,
        end_date,
        participants_count,
        completions_count
      FROM community_challenges
      WHERE status = 'active' 
        AND start_date <= datetime('now')
        AND end_date > datetime('now')
      ORDER BY created_at DESC
    `).all();
    
    // Get user's participation status if user_id provided
    const userId = c.req.query('user_id');
    let participationStatus = {};
    
    if (userId && challenges.results.length > 0) {
      const participation = await DB.prepare(`
        SELECT 
          challenge_id,
          status,
          progress_percentage,
          completed_at
        FROM challenge_participation
        WHERE user_id = ? AND challenge_id IN (${challenges.results.map(() => '?').join(',')})
      `).bind(userId, ...challenges.results.map(c => c.challenge_id)).all();
      
      participationStatus = participation.results.reduce((acc, p) => {
        acc[p.challenge_id] = p;
        return acc;
      }, {});
    }
    
    return c.json({
      challenges: challenges.results.map(challenge => ({
        ...challenge,
        requirements: JSON.parse(challenge.requirements || '[]'),
        user_participation: participationStatus[challenge.challenge_id] || null
      }))
    });
    
  } catch (error) {
    return c.json({ error: 'Failed to fetch community challenges' }, 500);
  }
});

// Join Community Challenge
communityApp.post('/community/challenges/:challengeId/join', async (c) => {
  const { DB } = c.env;
  const challengeId = c.req.param('challengeId');
  const { user_id } = await c.req.json();
  
  try {
    // Check if challenge exists and is active
    const challenge = await DB.prepare(`
      SELECT * FROM community_challenges 
      WHERE challenge_id = ? AND status = 'active'
        AND start_date <= datetime('now')
        AND end_date > datetime('now')
    `).bind(challengeId).first();
    
    if (!challenge) {
      return c.json({ error: 'Challenge not found or not active' }, 404);
    }
    
    // Check if user already joined
    const existing = await DB.prepare(`
      SELECT * FROM challenge_participation 
      WHERE user_id = ? AND challenge_id = ?
    `).bind(user_id, challengeId).first();
    
    if (existing) {
      return c.json({ error: 'Already participating in this challenge' }, 400);
    }
    
    // Join challenge
    await DB.prepare(`
      INSERT INTO challenge_participation (
        user_id, challenge_id, status, progress_percentage, joined_at
      ) VALUES (?, ?, 'active', 0, datetime('now'))
    `).bind(user_id, challengeId).run();
    
    // Increment participants count
    await DB.prepare(`
      UPDATE community_challenges 
      SET participants_count = participants_count + 1 
      WHERE challenge_id = ?
    `).bind(challengeId).run();
    
    return c.json({ 
      message: 'Successfully joined challenge',
      challenge_title: challenge.title
    });
    
  } catch (error) {
    return c.json({ error: 'Failed to join challenge' }, 500);
  }
});

// Accessibility Tips and Guides
communityApp.get('/community/accessibility-tips', async (c) => {
  const { DB } = c.env;
  const category = c.req.query('category'); // voice_commands, navigation, audio_settings, etc.
  
  try {
    let whereClause = '1=1';
    if (category) {
      whereClause = `category = '${category}'`;
    }
    
    const tips = await DB.prepare(`
      SELECT 
        t.*,
        u.username,
        u.display_name,
        COUNT(th.user_id) as helpful_votes,
        AVG(CASE WHEN tf.rating THEN tf.rating ELSE NULL END) as avg_rating
      FROM accessibility_tips t
      JOIN user_profiles u ON t.author_id = u.user_id
      LEFT JOIN tip_helpful_votes th ON t.tip_id = th.tip_id
      LEFT JOIN tip_feedback tf ON t.tip_id = tf.tip_id
      WHERE ${whereClause} AND t.status = 'approved'
      GROUP BY t.tip_id
      ORDER BY helpful_votes DESC, t.created_at DESC
      LIMIT 50
    `).all();
    
    return c.json({
      tips: tips.results.map(tip => ({
        ...tip,
        categories: JSON.parse(tip.categories || '[]'),
        accessibility_features: JSON.parse(tip.accessibility_features || '[]')
      }))
    });
    
  } catch (error) {
    return c.json({ error: 'Failed to fetch accessibility tips' }, 500);
  }
});

// Submit Accessibility Tip
communityApp.post('/community/accessibility-tips', async (c) => {
  const { DB } = c.env;
  
  try {
    const tipData = await c.req.json();
    const tipId = crypto.randomUUID();
    
    await DB.prepare(`
      INSERT INTO accessibility_tips (
        tip_id, author_id, title, content, category, 
        accessibility_features, difficulty_level, 
        assistive_tech_compatibility, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
    `).bind(
      tipId,
      tipData.user_id,
      tipData.title,
      tipData.content,
      tipData.category,
      JSON.stringify(tipData.accessibility_features || []),
      tipData.difficulty_level,
      JSON.stringify(tipData.assistive_tech_compatibility || [])
    ).run();
    
    return c.json({ 
      tip_id: tipId, 
      message: 'Accessibility tip submitted for review' 
    });
    
  } catch (error) {
    return c.json({ error: 'Failed to submit accessibility tip' }, 500);
  }
});

// Social Features: Friends and Following
communityApp.post('/community/friends/request', async (c) => {
  const { DB } = c.env;
  const { from_user_id, to_user_id } = await c.req.json();
  
  try {
    // Check if request already exists
    const existing = await DB.prepare(`
      SELECT * FROM friend_requests 
      WHERE from_user_id = ? AND to_user_id = ?
    `).bind(from_user_id, to_user_id).first();
    
    if (existing) {
      return c.json({ error: 'Friend request already sent' }, 400);
    }
    
    // Create friend request
    await DB.prepare(`
      INSERT INTO friend_requests (
        from_user_id, to_user_id, status, created_at
      ) VALUES (?, ?, 'pending', datetime('now'))
    `).bind(from_user_id, to_user_id).run();
    
    return c.json({ message: 'Friend request sent successfully' });
    
  } catch (error) {
    return c.json({ error: 'Failed to send friend request' }, 500);
  }
});

// Helper Functions
async function getContributionCount(DB: D1Database, userId: string) {
  const result = await DB.prepare(`
    SELECT 
      (SELECT COUNT(*) FROM community_posts WHERE user_id = ?) +
      (SELECT COUNT(*) FROM accessibility_feedback WHERE user_id = ?) +
      (SELECT COUNT(*) FROM mystery_reviews WHERE user_id = ?) as total
  `).bind(userId, userId, userId).first();
  
  return result?.total || 0;
}

async function getAccessibilityHelpfulnessScore(DB: D1Database, userId: string) {
  const result = await DB.prepare(`
    SELECT AVG(helpful_rating) as score
    FROM accessibility_feedback
    WHERE user_id = ? AND helpful_for_community = 1
  `).bind(userId).first();
  
  return Math.round((result?.score || 0) * 20); // Convert to percentage
}

async function checkAndAwardCommunityBadges(DB: D1Database, userId: string, actionType: string) {
  const badgeRules = {
    first_post: { badge: 'community_newcomer', threshold: 1 },
    accessibility_feedback: { badge: 'accessibility_advocate', threshold: 5 },
    helpful_review: { badge: 'trusted_reviewer', threshold: 10 }
  };
  
  const rule = badgeRules[actionType];
  if (!rule) return;
  
  // Check if user already has badge
  const existing = await DB.prepare(`
    SELECT * FROM user_badges 
    WHERE user_id = ? AND badge_name = ?
  `).bind(userId, rule.badge).first();
  
  if (existing) return;
  
  // Count user's actions
  let count = 0;
  switch (actionType) {
    case 'first_post':
      const postCount = await DB.prepare(`
        SELECT COUNT(*) as count FROM community_posts WHERE user_id = ?
      `).bind(userId).first();
      count = postCount?.count || 0;
      break;
    case 'accessibility_feedback':
      const feedbackCount = await DB.prepare(`
        SELECT COUNT(*) as count FROM accessibility_feedback WHERE user_id = ?
      `).bind(userId).first();
      count = feedbackCount?.count || 0;
      break;
  }
  
  if (count >= rule.threshold) {
    await DB.prepare(`
      INSERT INTO user_badges (
        user_id, badge_name, badge_description, rarity_level, earned_at
      ) VALUES (?, ?, ?, ?, datetime('now'))
    `).bind(
      userId,
      rule.badge,
      getBadgeDescription(rule.badge),
      'common'
    ).run();
  }
}

async function createAccessibilityFeedbackPost(DB: D1Database, feedbackData: any, feedbackId: string) {
  const postId = crypto.randomUUID();
  const content = `Shared accessibility feedback for mystery: ${feedbackData.mystery_title}\n\nPositive aspects: ${feedbackData.positive_aspects.join(', ')}\n\nSuggestions for improvement: ${feedbackData.improvement_suggestions.join(', ')}`;
  
  await DB.prepare(`
    INSERT INTO community_posts (
      post_id, user_id, content, post_type, mystery_id,
      accessibility_tags, created_at
    ) VALUES (?, ?, ?, 'accessibility_feedback', ?, ?, datetime('now'))
  `).bind(
    postId,
    feedbackData.user_id,
    content,
    feedbackData.mystery_id,
    JSON.stringify(['accessibility_feedback', 'community_helpful'])
  ).run();
}

async function createReviewCommunityPost(DB: D1Database, reviewData: any, reviewId: string) {
  const postId = crypto.randomUUID();
  const content = `${reviewData.title}\n\n${reviewData.content}\n\nOverall Rating: ${reviewData.rating}/5\nAccessibility Score: ${reviewData.accessibility_score}/5`;
  
  await DB.prepare(`
    INSERT INTO community_posts (
      post_id, user_id, content, post_type, mystery_id,
      accessibility_tags, created_at
    ) VALUES (?, ?, ?, 'review', ?, ?, datetime('now'))
  `).bind(
    postId,
    reviewData.user_id,
    content,
    reviewData.mystery_id,
    JSON.stringify(['review', 'mystery_recommendation'])
  ).run();
}

function getBadgeDescription(badgeName: string): string {
  const descriptions = {
    community_newcomer: 'Welcome to the AudioVR community! First post shared.',
    accessibility_advocate: 'Dedicated to improving accessibility for all users.',
    trusted_reviewer: 'Consistently provides helpful mystery reviews.'
  };
  
  return descriptions[badgeName] || 'Special community contribution';
}

export default communityApp;