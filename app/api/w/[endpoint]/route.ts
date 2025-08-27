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

    let responseStatus = 200
    let responseBody = ''
    let error: string | null = null
    let forwardedAt: Date | null = null

    try {
      const forwardHeaders = { ...headers }
      delete forwardHeaders['host']
      delete forwardHeaders['content-length']
      
      forwardHeaders['x-forwarded-for'] = headers['x-forwarded-for'] || '127.0.0.1'
      forwardHeaders['x-original-host'] = headers['host'] || ''

      const response = await fetch(webhook.destinationUrl, {
        method,
        headers: {
          ...forwardHeaders,
          'Content-Type': headers['content-type'] || 'application/json',
        },
        body: ['GET', 'HEAD'].includes(method.toUpperCase()) ? undefined : body,
      })

      responseStatus = response.status
      responseBody = await response.text()
      forwardedAt = new Date()
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error occurred'
      responseStatus = 500
    }

    await prisma.request.update({
      where: { id: requestRecord.id },
      data: {
        responseStatus,
        responseBody,
        error,
        forwardedAt,
      },
    })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to forward webhook', details: error },
        { status: 502 }
      )
    }

    return new NextResponse(responseBody, {
      status: responseStatus,
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