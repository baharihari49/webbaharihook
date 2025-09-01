import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: webhookId } = await params
  
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { requestId, destinationUrls, resendAll = false } = body

    // Get the webhook to ensure user owns it
    const webhook = await prisma.webhook.findUnique({
      where: { 
        id: webhookId,
        userId: session.user.id 
      }
    })

    if (!webhook) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      )
    }

    // Get the original request
    const originalRequest = await prisma.request.findUnique({
      where: { 
        id: requestId,
        webhookId: webhookId 
      }
    })

    if (!originalRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    const headers = JSON.parse(originalRequest.headers)
    const query = JSON.parse(originalRequest.query)
    
    // Debug logging for resend
    console.log(`Resend request ${requestId}:`)
    console.log(`- Original method: ${originalRequest.method}`)
    console.log(`- Original body length: ${originalRequest.body?.length || 0}`)
    console.log(`- Original body type: ${typeof originalRequest.body}`)
    if (originalRequest.body && originalRequest.body.length < 500) {
      console.log(`- Original body preview: ${originalRequest.body}`)
    }
    
    // Determine which URLs to resend to
    let urlsToResend: string[] = []
    
    if (resendAll) {
      // Resend to all destination URLs
      if (webhook.destinationUrls) {
        if (Array.isArray(webhook.destinationUrls)) {
          urlsToResend = webhook.destinationUrls.filter((url): url is string => typeof url === 'string')
        } else if (typeof webhook.destinationUrls === 'string') {
          urlsToResend = [webhook.destinationUrls]
        } else {
          // Handle case where destinationUrls might be a JSON string or other format
          try {
            const parsed = typeof webhook.destinationUrls === 'string' 
              ? JSON.parse(webhook.destinationUrls) 
              : webhook.destinationUrls
            if (Array.isArray(parsed)) {
              urlsToResend = parsed.filter((url): url is string => typeof url === 'string')
            }
          } catch {
            urlsToResend = []
          }
        }
      } else if (webhook.destinationUrl) {
        // Fallback to legacy single destination URL
        urlsToResend = [webhook.destinationUrl]
      }
    } else if (destinationUrls && Array.isArray(destinationUrls)) {
      // Resend to specific URLs
      urlsToResend = destinationUrls
    } else {
      return NextResponse.json(
        { error: 'Must specify destinationUrls or set resendAll to true' },
        { status: 400 }
      )
    }

    const results = []

    // Process each destination URL
    for (const destinationUrl of urlsToResend) {
      const startTime = Date.now()
      let statusCode = 200
      let responseBody = ''
      let error: string | null = null
      let responseTime: number | null = null

      try {
        const forwardHeaders = { ...headers }
        
        // Remove headers that shouldn't be forwarded
        delete forwardHeaders['host']
        delete forwardHeaders['content-length']
        delete forwardHeaders['x-forwarded-host']
        delete forwardHeaders['x-forwarded-port']
        delete forwardHeaders['x-original-host']
        delete forwardHeaders['content-type'] // Remove original to avoid duplication
        
        // Set forwarding headers for resend
        forwardHeaders['x-forwarded-for'] = headers['x-forwarded-for'] || '127.0.0.1'
        forwardHeaders['x-original-host'] = headers['host'] || ''
        forwardHeaders['x-resend'] = 'true'
        forwardHeaders['x-original-request-id'] = requestId
        forwardHeaders['x-webhook-source'] = 'webbaharihook-resend'

        // Handle content-type properly
        let contentType = headers['content-type']
        if (contentType) {
          // Remove duplicates and clean up
          contentType = contentType.split(',')[0].trim()
        } else {
          contentType = 'application/json'
        }

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

        // Prepare request body
        let requestBody = undefined
        if (!['GET', 'HEAD'].includes(originalRequest.method.toUpperCase()) && originalRequest.body) {
          requestBody = originalRequest.body
        }

        console.log(`📤 Resending to: ${destinationUrl}`)
        console.log(`- Method: ${originalRequest.method}`)
        console.log(`- Content-Type: ${contentType}`)
        console.log(`- Body length: ${requestBody ? requestBody.length : 0}`)
        console.log(`- Request body type: ${typeof requestBody}`)
        if (requestBody && requestBody.length < 500) {
          console.log(`- Request body: ${requestBody}`)
        }

        const response = await fetch(destinationUrl, {
          method: originalRequest.method,
          headers: {
            ...forwardHeaders,
            'Content-Type': contentType,
          },
          body: requestBody,
          signal: AbortSignal.timeout((webhook.timeout || 30) * 1000),
        })

        statusCode = response.status
        responseBody = await response.text()
        responseTime = Date.now() - startTime
        
        console.log(`✅ Resend Response from ${destinationUrl}:`)
        console.log(`- Status: ${statusCode}`)
        console.log(`- Response Time: ${responseTime}ms`)
        console.log(`- Response Body: ${responseBody.substring(0, 500)}`)

      } catch (err) {
        error = err instanceof Error ? err.message : 'Unknown error occurred'
        statusCode = 500
        responseTime = Date.now() - startTime
      }

      // Create a new request record for the resend
      const resendRequest = await prisma.request.create({
        data: {
          webhookId: webhook.id,
          method: originalRequest.method,
          headers: JSON.stringify({
            ...headers,
            'x-resend': 'true',
            'x-original-request-id': requestId
          }),
          body: originalRequest.body,
          query: JSON.stringify(query),
          statusCode,
          responseBody,
          responseTime,
          error,
          destinationUrl,
          forwardedAt: new Date(),
        },
      })

      results.push({
        destinationUrl,
        statusCode,
        responseTime,
        error,
        success: !error && statusCode < 400,
        requestId: resendRequest.id
      })
    }

    const successCount = results.filter(r => r.success).length
    const totalCount = results.length

    return NextResponse.json({
      success: successCount > 0,
      message: `Resent to ${successCount}/${totalCount} destinations`,
      results,
      summary: {
        total: totalCount,
        success: successCount,
        failed: totalCount - successCount
      }
    })

  } catch (error) {
    console.error('Error resending webhook:', error)
    return NextResponse.json(
      { error: 'Failed to resend webhook' },
      { status: 500 }
    )
  }
}