import { NextRequest, NextResponse } from 'next/server'

// Mock database - replace with Supabase
let cases = [
  {
    id: 'whitechapel-mystery',
    title: 'The Whitechapel Conspiracy',
    description: 'A series of mysterious disappearances in London\'s East End. Work with Inspector Lestrade to uncover a sinister plot.',
    difficulty: 'hard',
    category: 'mystery',
    duration: '45-60 min',
    completed: false,
    backgroundImage: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500',
    plays: 1247,
    completions: 892,
    status: 'published'
  },
  {
    id: 'midnight-caller',
    title: 'The Midnight Caller',
    description: 'Strange phone calls have been terrorizing a small town. Investigate the source before the caller strikes again.',
    difficulty: 'medium',
    category: 'horror',
    duration: '30-40 min',
    completed: false,
    backgroundImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500',
    plays: 856,
    completions: 634,
    status: 'published'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    
    let filteredCases = cases.filter(case_ => case_.status === 'published')
    
    if (category && category !== 'all') {
      filteredCases = filteredCases.filter(case_ => case_.category === category)
    }
    
    if (difficulty && difficulty !== 'all') {
      filteredCases = filteredCases.filter(case_ => case_.difficulty === difficulty)
    }
    
    return NextResponse.json({
      success: true,
      data: filteredCases,
      total: filteredCases.length
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cases' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const newCase = {
      id: `case_${Date.now()}`,
      ...body,
      plays: 0,
      completions: 0,
      status: 'draft',
      createdAt: new Date().toISOString()
    }
    
    cases.push(newCase)
    
    return NextResponse.json({
      success: true,
      data: newCase,
      message: 'Case created successfully'
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create case' },
      { status: 500 }
    )
  }
}