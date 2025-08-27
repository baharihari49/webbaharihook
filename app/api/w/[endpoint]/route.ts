import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

async function handleWebhook(
  request: NextRequest,
  { params }: { params: Promise<{ endpoint: string }> },
  method: string
) {
  const { endpoint } = await params
  
  try {
    const webhook = await prisma.webhook.findUnique({
      where: { endpoint },
    })

    if (!webhook || !webhook.isActive) {
      return NextResponse.json(
        { error: 'Webhook not found or inactive' },
        { status: 404 }
      )
    }

    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      headers[key] = value
    })

    const body = await request.text()
    const query = Object.fromEntries(request.nextUrl.searchParams)

    const requestRecord = await prisma.request.create({
      data: {
        webhookId: webhook.id,
        method,
        headers: JSON.stringify(headers),
        body,
        query: JSON.stringify(query),
      },
    })

    let statusCode = 200
    let responseBody = ''
    let error: string | null = null
    let forwardedAt: Date | null = null
    let responseTime: number | null = null
    let usedDestinationUrl: string | null = null

    // Get destination URLs from webhook (handle both old and new format)
    let destinationUrls: string[] = []
    
    if (webhook.destinationUrls) {
      if (Array.isArray(webhook.destinationUrls)) {
        destinationUrls = webhook.destinationUrls.filter((url): url is string => typeof url === 'string')
      } else if (typeof webhook.destinationUrls === 'string') {
        destinationUrls = [webhook.destinationUrls]
      } else {
        // Handle case where destinationUrls might be a JSON string or other format
        try {
          const parsed = typeof webhook.destinationUrls === 'string' 
            ? JSON.parse(webhook.destinationUrls) 
            : webhook.destinationUrls
          if (Array.isArray(parsed)) {
            destinationUrls = parsed.filter((url): url is string => typeof url === 'string')
          }
        } catch {
          destinationUrls = []
        }
      }
    } else if (webhook.destinationUrl) {
      // Fallback to legacy single destination URL
      destinationUrls = [webhook.destinationUrl]
    }

    if (destinationUrls.length === 0) {
      error = 'No destination URLs configured'
      statusCode = 500
    } else {
      const startTime = Date.now()
      
      // Try each destination URL until one succeeds
      for (let i = 0; i < destinationUrls.length; i++) {
        const destinationUrl = destinationUrls[i]
        usedDestinationUrl = destinationUrl
        
        try {
          const forwardHeaders = { ...headers }
          delete forwardHeaders['host']
          delete forwardHeaders['content-length']
          
          forwardHeaders['x-forwarded-for'] = headers['x-forwarded-for'] || '127.0.0.1'
          forwardHeaders['x-original-host'] = headers['host'] || ''

          // Add custom headers if configured
          if (webhook.customHeaders) {
            const customHeaders = typeof webhook.customHeaders === 'string' 
              ? JSON.parse(webhook.customHeaders) 
              : webhook.customHeaders
            Object.assign(forwardHeaders, customHeaders)
          }

          const response = await fetch(destinationUrl, {
            method,
            headers: {
              ...forwardHeaders,
              'Content-Type': headers['content-type'] || 'application/json',
            },
            body: ['GET', 'HEAD'].includes(method.toUpperCase()) ? undefined : body,
            signal: AbortSignal.timeout((webhook.timeout || 30) * 1000), // Use webhook timeout
          })

          statusCode = response.status
          responseBody = await response.text()
          forwardedAt = new Date()
          responseTime = Date.now() - startTime
          break // Success, stop trying other URLs
          
        } catch (err) {
          error = err instanceof Error ? err.message : 'Unknown error occurred'
          statusCode = 500
          responseTime = Date.now() - startTime
          
          // If this is the last URL, keep the error. Otherwise, try the next one
          if (i === destinationUrls.length - 1) {
            break
          } else {
            // Reset error for next attempt
            error = null
          }
        }
      }
    }

    await prisma.request.update({
      where: { id: requestRecord.id },
      data: {
        statusCode,
        responseBody,
        responseTime,
        error,
        forwardedAt,
        destinationUrl: usedDestinationUrl,
      },
    })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to forward webhook', details: error },
        { status: 502 }
      )
    }

    return new NextResponse(responseBody, {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ endpoint: string }> }) {
  return handleWebhook(request, context, 'GET')
}

export async function POST(request: NextRequest, context: { params: Promise<{ endpoint: string }> }) {
  return handleWebhook(request, context, 'POST')
}

export async function PUT(request: NextRequest, context: { params: Promise<{ endpoint: string }> }) {
  return handleWebhook(request, context, 'PUT')
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ endpoint: string }> }) {
  return handleWebhook(request, context, 'PATCH')
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ endpoint: string }> }) {
  return handleWebhook(request, context, 'DELETE')
}