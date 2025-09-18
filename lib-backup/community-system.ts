// AudioVR Community Features and Social Integration System
// This module handles user communities, social features, leaderboards,
// mystery sharing, and collaborative gameplay elements

import { supabase } from './supabase'

export interface UserCommunity {
  id: string
  name: string
  description: string
  type: 'public' | 'private' | 'accessibility_focused' | 'creator_group'
  member_count: number
  activity_level: 'low' | 'medium' | 'high'
  accessibility_features: string[]
  language: string
  created_by: string
  created_at: string
  settings: {
    allow_mystery_sharing: boolean
    enable_voice_chat: boolean
    moderation_level: 'strict' | 'moderate' | 'relaxed'
    accessibility_required: boolean
  }
}

export interface CommunityMember {
  user_id: string
  community_id: string
  role: 'member' | 'moderator' | 'admin' | 'creator'
  joined_at: string
  contribution_score: number
  accessibility_champion: boolean
  preferred_mysteries: string[]
  activity_status: 'active' | 'inactive' | 'away'
}

export interface MysteryShare {
  id: string
  mystery_id: string
  shared_by: string
  community_id: string
  share_type: 'recommendation' | 'completion' | 'review' | 'collaboration'
  accessibility_notes: string
  difficulty_rating: number
  engagement_score: number
  comments: CommunityComment[]
  created_at: string
}

export interface CommunityComment {
  id: string
  user_id: string
  content: string
  accessibility_description: string
  reply_to?: string
  likes: number
  accessibility_helpful: boolean
  created_at: string
}

export interface Leaderboard {
  id: string
  type: 'global' | 'community' | 'accessibility' | 'creators'
  time_period: 'daily' | 'weekly' | 'monthly' | 'all_time'
  category: 'mysteries_completed' | 'accessibility_score' | 'community_contributions' | 'voice_accuracy'
  entries: LeaderboardEntry[]
  updated_at: string
}

export interface LeaderboardEntry {
  user_id: string
  username: string
  display_name: string
  avatar_url: string
  score: number
  rank: number
  accessibility_badges: string[]
  achievements: string[]
  streak_days: number
}

export interface SocialAchievement {
  id: string
  name: string
  description: string
  accessibility_description: string
  type: 'mystery_completion' | 'community_engagement' | 'accessibility_excellence' | 'voice_mastery'
  criteria: Record<string, any>
  badge_icon: string
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary'
  accessibility_points: number
}

export interface UserProfile {
  user_id: string
  display_name: string
  bio: string
  accessibility_statement: string
  achievements: string[]
  mystery_preferences: {
    difficulty_levels: string[]
    preferred_worlds: string[]
    accessibility_needs: string[]
    voice_preference_public: boolean
  }
  social_stats: {
    mysteries_completed: number
    communities_joined: number
    mysteries_shared: number
    helpful_reviews: number
    accessibility_score: number
  }
  privacy_settings: {
    profile_visibility: 'public' | 'friends' | 'private'
    show_achievements: boolean
    show_progress: boolean
    allow_friend_requests: boolean
  }
}

export class CommunitySystem {
  constructor(private userId: string) {}

  // Community Management
  async createCommunity(communityData: {
    name: string
    description: string
    type: UserCommunity['type']
    accessibility_features: string[]
    language: string
    settings: UserCommunity['settings']
  }): Promise<UserCommunity> {
    try {
      const community: UserCommunity = {
        id: crypto.randomUUID(),
        ...communityData,
        member_count: 1,
        activity_level: 'low',
        created_by: this.userId,
        created_at: new Date().toISOString()
      }

      // Create community
      await supabase
        .from('communities')
        .insert(community)

      // Add creator as admin
      await supabase
        .from('community_members')
        .insert({
          user_id: this.userId,
          community_id: community.id,
          role: 'admin',
          joined_at: new Date().toISOString(),
          contribution_score: 0,
          accessibility_champion: false,
          preferred_mysteries: [],
          activity_status: 'active'
        })

      return community
    } catch (error) {
      console.error('Failed to create community:', error)
      throw error
    }
  }

  async joinCommunity(communityId: string): Promise<CommunityMember> {
    try {
      // Check if already a member
      const { data: existingMember } = await supabase
        .from('community_members')
        .select('*')
        .eq('user_id', this.userId)
        .eq('community_id', communityId)
        .single()

      if (existingMember) {
        throw new Error('Already a member of this community')
      }

      // Join community
      const member: CommunityMember = {
        user_id: this.userId,
        community_id: communityId,
        role: 'member',
        joined_at: new Date().toISOString(),
        contribution_score: 0,
        accessibility_champion: false,
        preferred_mysteries: [],
        activity_status: 'active'
      }

      await supabase
        .from('community_members')
        .insert(member)

      // Update community member count
      await supabase
        .rpc('increment_community_members', { community_id: communityId })

      return member
    } catch (error) {
      console.error('Failed to join community:', error)
      throw error
    }
  }

  async getCommunityRecommendations(): Promise<UserCommunity[]> {
    try {
      // Get user's accessibility preferences and interests
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('accessibility_statement, mystery_preferences')
        .eq('user_id', this.userId)
        .single()

      // Find communities matching user's accessibility needs
      let query = supabase
        .from('communities')
        .select('*')
        .eq('type', 'public')
        .order('member_count', { ascending: false })

      const { data: communities, error } = await query

      if (error) throw error

      // Filter and score communities based on user preferences
      const scoredCommunities = communities?.map(community => ({
        ...community,
        relevance_score: this.calculateCommunityRelevance(community, userProfile)
      })).sort((a, b) => b.relevance_score - a.relevance_score) || []

      return scoredCommunities.slice(0, 10)
    } catch (error) {
      console.error('Failed to get community recommendations:', error)
      return []
    }
  }

  // Mystery Sharing and Collaboration
  async shareMysteryWithCommunity(
    mysteryId: string,
    communityId: string,
    shareData: {
      share_type: MysteryShare['share_type']
      accessibility_notes: string
      difficulty_rating: number
      personal_review?: string
    }
  ): Promise<MysteryShare> {
    try {
      const mysteryShare: MysteryShare = {
        id: crypto.randomUUID(),
        mystery_id: mysteryId,
        shared_by: this.userId,
        community_id: communityId,
        ...shareData,
        engagement_score: 0,
        comments: [],
        created_at: new Date().toISOString()
      }

      await supabase
        .from('mystery_shares')
        .insert(mysteryShare)

      // Update user's contribution score
      await this.updateContributionScore(communityId, 'mystery_share', 10)

      return mysteryShare
    } catch (error) {
      console.error('Failed to share mystery:', error)
      throw error
    }
  }

  async addCommunityComment(
    shareId: string,
    content: string,
    accessibilityDescription: string,
    replyTo?: string
  ): Promise<CommunityComment> {
    try {
      const comment: CommunityComment = {
        id: crypto.randomUUID(),
        user_id: this.userId,
        content: content,
        accessibility_description: accessibilityDescription,
        reply_to: replyTo,
        likes: 0,
        accessibility_helpful: false,
        created_at: new Date().toISOString()
      }

      await supabase
        .from('community_comments')
        .insert({
          ...comment,
          mystery_share_id: shareId
        })

      return comment
    } catch (error) {
      console.error('Failed to add comment:', error)
      throw error
    }
  }

  async getCommunityFeed(communityId: string, limit: number = 20): Promise<MysteryShare[]> {
    try {
      const { data: shares, error } = await supabase
        .from('mystery_shares')
        .select(`
          *,
          mysteries(*),
          users(username, display_name, avatar_url),
          community_comments(
            *,
            users(username, display_name, avatar_url)
          )
        `)
        .eq('community_id', communityId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return shares || []
    } catch (error) {
      console.error('Failed to get community feed:', error)
      return []
    }
  }

  // Leaderboards and Achievements
  async getLeaderboard(
    type: Leaderboard['type'],
    category: Leaderboard['category'],
    timePeriod: Leaderboard['time_period'] = 'weekly'
  ): Promise<LeaderboardEntry[]> {
    try {
      let query = supabase.from('leaderboard_entries')

      // Apply filters based on type and time period
      const startDate = this.getStartDateForPeriod(timePeriod)
      
      const { data: entries, error } = await query
        .select(`
          *,
          users(username, display_name, avatar_url),
          user_achievements(achievement_id, achievements(*))
        `)
        .eq('leaderboard_type', type)
        .eq('category', category)
        .gte('period_start', startDate)
        .order('rank', { ascending: true })
        .limit(100)

      if (error) throw error

      return entries?.map(entry => ({
        user_id: entry.user_id,
        username: entry.users.username,
        display_name: entry.users.display_name,
        avatar_url: entry.users.avatar_url,
        score: entry.score,
        rank: entry.rank,
        accessibility_badges: entry.accessibility_badges || [],
        achievements: entry.user_achievements?.map((ua: any) => ua.achievements.name) || [],
        streak_days: entry.streak_days || 0
      })) || []
    } catch (error) {
      console.error('Failed to get leaderboard:', error)
      return []
    }
  }

  async updateUserAchievements(userId: string = this.userId): Promise<string[]> {
    try {
      // Get user's current stats
      const { data: userStats } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)

      const { data: voiceStats } = await supabase
        .from('voice_commands')
        .select('success, recognition_confidence')
        .eq('user_id', userId)

      const { data: accessibilityStats } = await supabase
        .from('accessibility_usage')
        .select('*')
        .eq('user_id', userId)

      // Get all available achievements
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*')

      const newAchievements: string[] = []

      // Check each achievement criteria
      for (const achievement of achievements || []) {
        const criteria = achievement.criteria
        let meetsRequirements = true

        switch (achievement.type) {
          case 'mystery_completion':
            const completedCount = userStats?.filter(stat => stat.completed).length || 0
            meetsRequirements = completedCount >= (criteria.mysteries_completed || 0)
            break

          case 'voice_mastery':
            const avgConfidence = voiceStats?.reduce((sum, stat) => sum + (stat.recognition_confidence || 0), 0) / (voiceStats?.length || 1) || 0
            meetsRequirements = avgConfidence >= (criteria.min_accuracy || 0)
            break

          case 'accessibility_excellence':
            const accessibilityScore = accessibilityStats?.length || 0
            meetsRequirements = accessibilityScore >= (criteria.min_usage || 0)
            break

          case 'community_engagement':
            const { data: communityStats } = await supabase
              .from('community_members')
              .select('contribution_score')
              .eq('user_id', userId)
            const totalContribution = communityStats?.reduce((sum, stat) => sum + (stat.contribution_score || 0), 0) || 0
            meetsRequirements = totalContribution >= (criteria.min_contribution || 0)
            break
        }

        if (meetsRequirements) {
          // Check if user already has this achievement
          const { data: existingAchievement } = await supabase
            .from('user_achievements')
            .select('*')
            .eq('user_id', userId)
            .eq('achievement_id', achievement.id)
            .single()

          if (!existingAchievement) {
            // Grant achievement
            await supabase
              .from('user_achievements')
              .insert({
                user_id: userId,
                achievement_id: achievement.id,
                earned_at: new Date().toISOString()
              })

            newAchievements.push(achievement.name)
          }
        }
      }

      return newAchievements
    } catch (error) {
      console.error('Failed to update achievements:', error)
      return []
    }
  }

  // Social Features
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          user_achievements(
            achievement_id,
            achievements(name, description, badge_icon)
          )
        `)
        .eq('user_id', userId)
        .single()

      if (error) return null

      return {
        user_id: profile.user_id,
        display_name: profile.display_name,
        bio: profile.bio,
        accessibility_statement: profile.accessibility_statement,
        achievements: profile.user_achievements?.map((ua: any) => ua.achievements.name) || [],
        mystery_preferences: profile.mystery_preferences || {
          difficulty_levels: [],
          preferred_worlds: [],
          accessibility_needs: [],
          voice_preference_public: false
        },
        social_stats: profile.social_stats || {
          mysteries_completed: 0,
          communities_joined: 0,
          mysteries_shared: 0,
          helpful_reviews: 0,
          accessibility_score: 0
        },
        privacy_settings: profile.privacy_settings || {
          profile_visibility: 'public',
          show_achievements: true,
          show_progress: true,
          allow_friend_requests: true
        }
      }
    } catch (error) {
      console.error('Failed to get user profile:', error)
      return null
    }
  }

  async sendFriendRequest(targetUserId: string): Promise<void> {
    try {
      await supabase
        .from('friend_requests')
        .insert({
          from_user_id: this.userId,
          to_user_id: targetUserId,
          status: 'pending',
          created_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Failed to send friend request:', error)
      throw error
    }
  }

  async acceptFriendRequest(requestId: string): Promise<void> {
    try {
      // Update request status
      const { data: request } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId)
        .eq('to_user_id', this.userId)
        .select()
        .single()

      if (request) {
        // Create friendship records
        await supabase
          .from('friendships')
          .insert([
            {
              user_id: request.from_user_id,
              friend_id: this.userId,
              created_at: new Date().toISOString()
            },
            {
              user_id: this.userId,
              friend_id: request.from_user_id,
              created_at: new Date().toISOString()
            }
          ])
      }
    } catch (error) {
      console.error('Failed to accept friend request:', error)
      throw error
    }
  }

  // Real-time Community Features
  async subscribeToCommunityChatUpdates(
    communityId: string,
    callback: (payload: any) => void
  ) {
    return supabase
      .channel(`community-chat-${communityId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `community_id=eq.${communityId}`
        },
        callback
      )
      .subscribe()
  }

  async subscribeToMysteryShareUpdates(
    communityId: string,
    callback: (payload: any) => void
  ) {
    return supabase
      .channel(`mystery-shares-${communityId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mystery_shares',
          filter: `community_id=eq.${communityId}`
        },
        callback
      )
      .subscribe()
  }

  // Helper Methods
  private calculateCommunityRelevance(community: UserCommunity, userProfile: any): number {
    let score = 0

    // Base score from member count and activity
    score += Math.min(community.member_count * 0.1, 10)
    score += community.activity_level === 'high' ? 5 : community.activity_level === 'medium' ? 3 : 1

    // Accessibility match bonus
    if (community.type === 'accessibility_focused' && userProfile?.accessibility_statement) {
      score += 15
    }

    // Language match
    if (community.language === 'en' || community.language === userProfile?.language) {
      score += 5
    }

    return score
  }

  private async updateContributionScore(
    communityId: string,
    action: string,
    points: number
  ): Promise<void> {
    try {
      await supabase
        .rpc('update_contribution_score', {
          p_user_id: this.userId,
          p_community_id: communityId,
          p_points: points
        })
    } catch (error) {
      console.error('Failed to update contribution score:', error)
    }
  }

  private getStartDateForPeriod(period: Leaderboard['time_period']): string {
    const now = new Date()
    switch (period) {
      case 'daily':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
      case 'weekly':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      case 'monthly':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      case 'all_time':
      default:
        return '1970-01-01T00:00:00.000Z'
    }
  }
}

// Export utility functions
export const createCommunitySystem = (userId: string) => new CommunitySystem(userId)

export const getPublicCommunities = async (limit: number = 20): Promise<UserCommunity[]> => {
  const { data } = await supabase
    .from('communities')
    .select('*')
    .eq('type', 'public')
    .order('member_count', { ascending: false })
    .limit(limit)
  
  return data || []
}

export const searchCommunities = async (query: string): Promise<UserCommunity[]> => {
  const { data } = await supabase
    .from('communities')
    .select('*')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .eq('type', 'public')
    .limit(10)
  
  return data || []
}