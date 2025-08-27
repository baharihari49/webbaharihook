import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Generate random path
    const randomPath = Math.random().toString(36).substring(2, 15)
    
    // Determine base URL priority:
    // 1. NGROK_URL from environment (for public access)
    // 2. x-forwarded-proto + host (for proxied requests)
    // 3. https://localhost:3001 (default for local HTTPS)
    
    let baseUrl = process.env.NGROK_URL
    
    if (!baseUrl) {
      const protocol = request.headers.get('x-forwarded-proto') || 'https'
      const host = request.headers.get('host') || 'localhost:3001'
      baseUrl = `${protocol}://${host}`
    }
    
    const destinationUrl = `${baseUrl}/api/destination/${randomPath}`
    
    return NextResponse.json({ 
      destinationUrl,
      randomPath,
      baseUrl,
      isPublic: !!process.env.NGROK_URL
    })
  } catch (error) {
    console.error('Error generating destination URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate destination URL' },
      { status: 500 }
    )
  }
}