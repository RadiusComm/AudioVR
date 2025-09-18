import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid mystery ID' })
  }

  switch (req.method) {
    case 'GET':
      return getMystery(req, res, id)
    case 'PUT':
      return updateMystery(req, res, id)
    case 'DELETE':
      return deleteMystery(req, res, id)
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      return res.status(405).json({ error: 'Method not allowed' })
  }
}

async function getMystery(
  req: NextApiRequest,
  res: NextApiResponse,
  mysteryId: string
) {
  try {
    // Return mock mystery data for development
    const mystery = {
      id: mysteryId,
      title: 'The Vanishing Violin',
      description: 'A priceless Stradivarius violin disappears from a locked room during a concert.',
      creator_id: 'creator-1',
      world_id: 'world-1',
      difficulty_level: 'intermediate',
      estimated_duration: 45,
      accessibility_features: ['voice_only', 'screen_reader', 'spatial_audio'],
      content_warnings: ['mild_suspense'],
      status: 'published',
      avg_rating: 4.7,
      total_ratings: 156,
      worlds: {
        id: 'world-1',
        name: 'Concert Hall Mystery',
        description: 'An elegant concert hall setting',
        theme: 'classical'
      },
      creators: {
        id: 'creator-1',
        creator_name: 'Mystery Master',
        bio: 'Expert in classical mystery scenarios'
      },
      grouped_elements: {
        scene: [
          {
            id: 'scene-1',
            title: 'The Concert Hall',
            content: 'A grand concert hall with excellent acoustics',
            audio_description: 'The sound of a bustling concert hall before the performance'
          }
        ],
        evidence: [
          {
            id: 'evidence-1',
            title: 'Violin Case',
            content: 'An empty violin case left on stage',
            audio_description: 'The hollow sound of an empty violin case being opened'
          }
        ]
      },
      created_at: new Date().toISOString()
    }

    res.status(200).json(mystery)

  } catch (error) {
    console.error('Get mystery error:', error)
    res.status(500).json({ 
      error: 'Failed to fetch mystery',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

async function updateMystery(
  req: NextApiRequest,
  res: NextApiResponse,
  mysteryId: string
) {
  try {
    const updateData = req.body

    const updatedMystery = {
      id: mysteryId,
      ...updateData,
      updated_at: new Date().toISOString()
    }

    res.status(200).json(updatedMystery)

  } catch (error) {
    console.error('Update mystery error:', error)
    res.status(500).json({ 
      error: 'Failed to update mystery',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

async function deleteMystery(
  req: NextApiRequest,
  res: NextApiResponse,
  mysteryId: string
) {
  try {
    // Mock deletion success
    res.status(204).end()

  } catch (error) {
    console.error('Delete mystery error:', error)
    res.status(500).json({ 
      error: 'Failed to delete mystery',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}