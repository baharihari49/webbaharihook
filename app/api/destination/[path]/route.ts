import { NextRequest, NextResponse } from 'next/server'

async function handleRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string }> },
  method: string
) {
  const { path } = await params
  
  try {
    // Get request details
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      headers[key] = value
    })

    const body = await request.text()
    const query = Object.fromEntries(request.nextUrl.searchParams)
    const timestamp = new Date().toISOString()

    // Log the received request
    console.log(`[${timestamp}] Destination endpoint ${path} received ${method} request:`, {
      headers,
      body: body || '(empty)',
      query: Object.keys(query).length > 0 ? query : '(empty)',
    })

    // Return a success response with request details
    return NextResponse.json({
      success: true,
      message: `Request received at destination endpoint: ${path}`,
      timestamp,
      method,
      receivedData: {
        headers: Object.keys(headers).length,
        bodySize: body.length,
        queryParams: Object.keys(query).length,
      }
    }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Destination-Path': path,
        'X-Processed-At': timestamp,
      }
    })
  } catch (error) {
    console.error('Error processing destination request:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process request',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string }> }) {
  return handleRequest(request, context, 'GET')
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string }> }) {
  return handleRequest(request, context, 'POST')
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string }> }) {
  return handleRequest(request, context, 'PUT')
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string }> }) {
  return handleRequest(request, context, 'PATCH')
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string }> }) {
  return handleRequest(request, context, 'DELETE')
}