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
    
    // Check if method is allowed
    const allowedMethods = webhook.allowedMethods as string[] | null
    if (allowedMethods && allowedMethods.length > 0) {
      if (!allowedMethods.includes(method.toUpperCase())) {
        return NextResponse.json(
          { error: `Method ${method} not allowed. Allowed methods: ${allowedMethods.join(', ')}` },
          { status: 405 }
        )
      }
    }

    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      headers[key] = value
    })

    // Read body once and store it
    let body = ''
    const contentType = headers['content-type'] || ''
    
    try {
      if (!['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())) {
        body = await request.text()
      }
    } catch (error) {
      console.error('Error reading request body:', error)
      body = ''
    }
    
    const query = Object.fromEntries(request.nextUrl.searchParams)

    // Debug logging
    console.log(`🚀 Webhook ${endpoint} - ${method}:`)
    console.log(`- Headers:`, Object.keys(headers))
    console.log(`- Body length:`, body.length)
    console.log(`- Content-Type:`, contentType)
    console.log(`- Query params:`, Object.keys(query))
    if (body.length > 0 && body.length < 1000) {
      console.log(`- Body content:`, body)
    } else if (body.length > 0) {
      console.log(`- Body preview (first 500 chars):`, body.substring(0, 500))
    }

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
          // Prevent infinite loops - check if destination is our own webhook system
          const isOwnWebhook = destinationUrl.includes('webbaharihook2.baharihari.com/api/w/') ||
                              destinationUrl.includes('172.28.1.12:3002/api/w/') ||
                              destinationUrl.includes('localhost:3002/api/w/')
          
          if (isOwnWebhook) {
            console.error(`⚠️ Skipping self-referencing webhook: ${destinationUrl}`)
            error = 'Cannot forward webhook to itself (infinite loop prevention)'
            statusCode = 400
            responseTime = 0
            continue // Try next destination URL
          }
          
          const forwardHeaders = { ...headers }
          
          // Remove headers that shouldn't be forwarded
          delete forwardHeaders['host']
          delete forwardHeaders['content-length']
          delete forwardHeaders['connection'] // This causes "invalid connection header" error
          delete forwardHeaders['x-forwarded-host']
          delete forwardHeaders['x-forwarded-port']
          delete forwardHeaders['x-original-host']
          delete forwardHeaders['x-resend']
          delete forwardHeaders['x-original-request-id']
          
          // Set forwarding headers
          forwardHeaders['x-forwarded-for'] = headers['x-forwarded-for'] || '127.0.0.1'
          forwardHeaders['x-original-host'] = headers['host'] || ''
          forwardHeaders['x-webhook-source'] = 'webbaharihook'

          // Handle content-type properly - clean and set it
          let forwardContentType = contentType
          if (forwardContentType) {
            // Remove duplicates and clean up
            forwardContentType = forwardContentType.split(',')[0].trim()
          } else {
            forwardContentType = 'application/json'
          }
          
          // Remove the original content-type and set the clean one
          delete forwardHeaders['content-type']
          forwardHeaders['content-type'] = forwardContentType

          // Add custom headers if configured
          if (webhook.customHeaders) {
            try {
              const customHeaders = typeof webhook.customHeaders === 'string' 
                ? JSON.parse(webhook.customHeaders) 
                : webhook.customHeaders
              if (customHeaders && typeof customHeaders === 'object') {
                Object.assign(forwardHeaders, customHeaders)
              }
            } catch (e) {
              console.warn('Invalid custom headers:', webhook.customHeaders)
            }
          }

          // Prepare request body - use cloned request to get fresh body stream
          let requestBody = undefined
          if (!['GET', 'HEAD'].includes(method.toUpperCase()) && body) {
            // Use the original body string we saved
            requestBody = body
          }

          // Debug logging for forwarding
          console.log(`📤 Forwarding to: ${destinationUrl}`)
          console.log(`- Method: ${method}`)
          console.log(`- Content-Type: ${forwardContentType}`)
          console.log(`- Body length: ${requestBody ? requestBody.length : 0}`)
          console.log(`- Request body type: ${typeof requestBody}`)
          console.log(`- Headers: ${Object.keys(forwardHeaders).join(', ')}`)
          if (requestBody && requestBody.length < 500) {
            console.log(`- Request body: ${requestBody}`)
          }

          const response = await fetch(destinationUrl, {
            method,
            headers: forwardHeaders, // Headers already include cleaned content-type
            body: requestBody,
            signal: AbortSignal.timeout((webhook.timeout || 30) * 1000),
          })

          statusCode = response.status
          responseBody = await response.text()
          forwardedAt = new Date()
          responseTime = Date.now() - startTime
          
          console.log(`✅ Response from ${destinationUrl}:`)
          console.log(`- Status: ${statusCode}`)
          console.log(`- Response Time: ${responseTime}ms`)
          console.log(`- Response Body: ${responseBody.substring(0, 500)}`)
          
          break // Success, stop trying other URLs
          
        } catch (err) {
          console.error(`❌ Error forwarding to ${destinationUrl}:`, err)
          console.error(`- Error type:`, err?.constructor?.name)
          console.error(`- Error message:`, err instanceof Error ? err.message : String(err))
          console.error(`- Error cause:`, err instanceof Error && err.cause ? JSON.stringify(err.cause) : 'No cause')
          console.error(`- Environment: ${process.env.NODE_ENV || 'development'}`)
          
          // More detailed error for fetch failures
          if (err instanceof Error && err.message === 'fetch failed') {
            console.error(`🔍 Fetch failed - Common causes in production:`)
            console.error(`  1. SSL/TLS certificate issues`)
            console.error(`  2. DNS resolution problems`)
            console.error(`  3. Firewall/network restrictions`)
            console.error(`  4. Target server rejecting connections from production IP`)
            console.error(`  5. Missing Node.js fetch polyfills in production`)
            console.error(`- Target URL: ${destinationUrl}`)
            console.error(`- Is HTTPS: ${destinationUrl.startsWith('https')}`)
          }
          
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

export async function HEAD(request: NextRequest, context: { params: Promise<{ endpoint: string }> }) {
  return handleWebhook(request, context, 'HEAD')
}

export async function OPTIONS(request: NextRequest, context: { params: Promise<{ endpoint: string }> }) {
  return handleWebhook(request, context, 'OPTIONS')
}