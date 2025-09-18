import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Return mock dashboard data for development
    const dashboardData = {
      engagement: {
        daily_active_users: 42,
        session_duration_avg: 1800, // 30 minutes
        voice_command_success_rate: 94.2,
        case_completion_rate: 78.5
      },
      accessibility: {
        screen_reader_usage: 15.3,
        voice_only_users: 8.7,
        accessibility_score: 94.2
      },
      voice_analytics: {
        command_accuracy: 96.8,
        total_commands: 1250
      },
      top_commands: [
        { command: 'examine evidence', count: 312 },
        { command: 'ask witness', count: 287 },
        { command: 'check notes', count: 195 },
        { command: 'move to location', count: 178 },
        { command: 'use item', count: 156 }
      ],
      timestamp: new Date().toISOString()
    }

    res.status(200).json(dashboardData)

  } catch (error) {
    console.error('Dashboard API error:', error)
    res.status(500).json({ 
      error: 'Failed to fetch dashboard data',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}