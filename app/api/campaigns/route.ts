import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createCampaignSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  workspaceId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  goals: z.record(z.any()).optional(),
})

// Get campaigns
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    const status = searchParams.get('status')

    const campaigns = await prisma.campaign.findMany({
      where: {
        userId: session.user.id,
        ...(workspaceId ? { workspaceId } : {}),
        ...(status ? { status: status as any } : {}),
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            qrCodes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error('Campaigns fetch error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// Create campaign
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = createCampaignSchema.parse(body)

    // Verify workspace access if specified
    if (data.workspaceId) {
      const workspace = await prisma.workspace.findFirst({
        where: {
          id: data.workspaceId,
          OR: [
            { ownerId: session.user.id },
            {
              members: {
                some: {
                  userId: session.user.id,
                  role: { in: ['ADMIN', 'EDITOR'] },
                },
              },
            },
          ],
        },
      })

      if (!workspace) {
        return NextResponse.json(
          { error: 'Workspace not found or access denied' },
          { status: 403 }
        )
      }
    }

    const campaign = await prisma.campaign.create({
      data: {
        userId: session.user.id,
        name: data.name,
        description: data.description,
        workspaceId: data.workspaceId,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        goals: data.goals,
        status: 'DRAFT',
      },
    })

    return NextResponse.json({ campaign }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Campaign creation error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
