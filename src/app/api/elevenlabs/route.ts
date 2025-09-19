import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { text, voice_id, agent_id } = await request.json()
    
    if (!text) {
      return NextResponse.json(
        { success: false, error: 'Text is required' },
        { status: 400 }
      )
    }

    const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY
    const defaultAgentId = process.env.ELEVENLABS_AGENT_ID || 'agent_2901k5ce2hyrendtmhzd8r2ayyk5'
    
    if (!elevenlabsApiKey) {
      // Return mock response for development
      return NextResponse.json({
        success: true,
        data: {
          audio_url: 'https://example.com/mock-audio.mp3',
          transcript: text,
          voice_id: voice_id || 'default',
          agent_id: agent_id || defaultAgentId,
          duration: Math.floor(text.length / 10), // Mock duration based on text length
          mock: true
        }
      })
    }

    // ElevenLabs API call
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + (voice_id || 'default'), {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenlabsApiKey
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    })

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`)
    }

    const audioBuffer = await response.arrayBuffer()
    
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    })

  } catch (error) {
    console.error('ElevenLabs API error:', error)
    
    // Return mock audio response on error
    return NextResponse.json({
      success: false,
      error: 'ElevenLabs API unavailable',
      mock_response: {
        audio_url: 'https://example.com/mock-audio.mp3',
        transcript: 'Audio generation failed, but case continues...',
        message: 'Using text-only mode for now'
      }
    }, { status: 503 })
  }
}

// Health check endpoint
export async function GET() {
  const hasApiKey = !!process.env.ELEVENLABS_API_KEY
  
  return NextResponse.json({
    success: true,
    status: hasApiKey ? 'configured' : 'mock_mode',
    agent_id: process.env.ELEVENLABS_AGENT_ID || 'agent_2901k5ce2hyrendtmhzd8r2ayyk5',
    message: hasApiKey ? 'ElevenLabs integration ready' : 'Running in mock mode'
  })
}