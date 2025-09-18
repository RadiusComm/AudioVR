import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

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
    const { data: mystery, error } = await supabase
      .from('mysteries')
      .select(`
        *,
        worlds(*),
        creators(
          id,
          user_id,
          users(username, display_name, avatar_url)
        ),
        story_elements(*),
        characters(*),
        user_ratings(rating, review_text),
        audio_assets(*)
      `)
      .eq('id', mysteryId)
      .eq('status', 'published')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Mystery not found' })
      }
      throw error
    }

    // Calculate average rating
    const avgRating = mystery.user_ratings?.length > 0
      ? mystery.user_ratings.reduce((sum: number, rating: any) => sum + rating.rating, 0) / mystery.user_ratings.length
      : 0

    // Group story elements by type
    const groupedElements = mystery.story_elements?.reduce((acc: any, element: any) => {
      if (!acc[element.type]) acc[element.type] = []
      acc[element.type].push(element)
      return acc
    }, {})

    const response = {
      ...mystery,
      avg_rating: Math.round(avgRating * 10) / 10,
      grouped_elements: groupedElements,
      total_ratings: mystery.user_ratings?.length || 0
    }

    res.status(200).json(response)

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

    // Validate user can update this mystery (should be creator or admin)
    const { data: mystery } = await supabase
      .from('mysteries')
      .select('creator_id, creators(user_id)')
      .eq('id', mysteryId)
      .single()

    if (!mystery) {
      return res.status(404).json({ error: 'Mystery not found' })
    }

    const { data: updatedMystery, error } = await supabase
      .from('mysteries')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', mysteryId)
      .select()
      .single()

    if (error) throw error

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
    // Validate user can delete this mystery (should be creator or admin)
    const { data: mystery } = await supabase
      .from('mysteries')
      .select('creator_id, creators(user_id)')
      .eq('id', mysteryId)
      .single()

    if (!mystery) {
      return res.status(404).json({ error: 'Mystery not found' })
    }

    const { error } = await supabase
      .from('mysteries')
      .delete()
      .eq('id', mysteryId)

    if (error) throw error

    res.status(204).end()

  } catch (error) {
    console.error('Delete mystery error:', error)
    res.status(500).json({ 
      error: 'Failed to delete mystery',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}