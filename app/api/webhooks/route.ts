import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const webhooks = await prisma.webhook.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { requests: true }
        }
      }
    })
    
    return NextResponse.json(webhooks)
  } catch (error) {
    console.error('Error fetching webhooks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch webhooks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, destinationUrl } = body

    if (!name || !destinationUrl) {
      return NextResponse.json(
        { error: 'Name and destination URL are required' },
        { status: 400 }
      )
    }

    const endpoint = Math.random().toString(36).substring(2, 15)

    const webhook = await prisma.webhook.create({
      data: {
        name,
        endpoint,
        destinationUrl,
        userId: session.user.id,
      },
    })

    return NextResponse.json(webhook, { status: 201 })
  } catch (error) {
    console.error('Error creating webhook:', error)
    return NextResponse.json(
      { error: 'Failed to create webhook' },
      { status: 500 }
    )
  }
}