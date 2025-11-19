import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, trackApiUsage, hasScope } from '@/lib/api-key'
import { generateQRCode } from '@/lib/qr-generator'
import { createShortUrl } from '@/lib/url-shortener'
import { z } from 'zod'

const qrRequestSchema = z.object({
  content: z.string().min(1).max(4000),
  type: z.string().default('URL'),
  dynamic: z.boolean().default(false),
  customization: z
    .object({
      foregroundColor: z.string().default('#000000'),
      backgroundColor: z.string().default('#ffffff'),
      size: z.number().min(100).max(2000).default(300),
      errorCorrectionLevel: z.enum(['L', 'M', 'Q', 'H']).default('M'),
      margin: z.number().min(0).max(10).default(4),
      logo: z.string().optional(),
    })
    .optional(),
  options: z
    .object({
      name: z.string().optional(),
      description: z.string().optional(),
      expiresAt: z.string().datetime().optional(),
      maxScans: z.number().positive().optional(),
      password: z.string().optional(),
      workspaceId: z.string().optional(),
      campaignId: z.string().optional(),
    })
    .optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    const apiKey = request.headers.get('x-api-key')

    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 })
    }

    const validatedKey = await validateApiKey(apiKey)

    if (!validatedKey) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    // Check scope
    if (!hasScope(validatedKey, 'qr:create')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Track API usage
    await trackApiUsage(validatedKey.id, '/api/v1/qr')

    // Parse and validate request body
    const body = await request.json()
    const data = qrRequestSchema.parse(body)

    let qrCodeUrl: string
    let shortUrl: string | undefined

    // Generate the QR code
    if (data.dynamic) {
      // Create dynamic QR with short URL
      const qrCode = await createShortUrl({
        userId: validatedKey.userId,
        originalUrl: data.content,
        qrType: data.type,
        workspaceId: data.options?.workspaceId,
        campaignId: data.options?.campaignId,
        metadata: {
          name: data.options?.name,
          description: data.options?.description,
        },
        expiresAt: data.options?.expiresAt ? new Date(data.options.expiresAt) : undefined,
        maxScans: data.options?.maxScans,
        password: data.options?.password,
      })

      shortUrl = qrCode.dynamicUrl || ''
      qrCodeUrl = shortUrl
    } else {
      qrCodeUrl = data.content
    }

    // Generate the actual QR code image
    const qrImage = await generateQRCode({
      content: qrCodeUrl,
      foregroundColor: data.customization?.foregroundColor || '#000000',
      backgroundColor: data.customization?.backgroundColor || '#ffffff',
      size: data.customization?.size || 300,
      errorCorrectionLevel: data.customization?.errorCorrectionLevel || 'M',
      margin: data.customization?.margin || 4,
      logo: data.customization?.logo,
    })

    return NextResponse.json({
      success: true,
      qrCode: qrImage.dataUrl,
      shortUrl: data.dynamic ? shortUrl : undefined,
      metadata: {
        type: data.type,
        dynamic: data.dynamic,
        size: data.customization?.size || 300,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }

    console.error('API error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key')

    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 })
    }

    const validatedKey = await validateApiKey(apiKey)

    if (!validatedKey) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    if (!hasScope(validatedKey, 'qr:read')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    await trackApiUsage(validatedKey.id, '/api/v1/qr')

    // Get QR codes for this user
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const skip = (page - 1) * limit

    const [qrCodes, total] = await Promise.all([
      prisma.qRCode.findMany({
        where: { userId: validatedKey.userId },
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          shortId: true,
          type: true,
          content: true,
          dynamicUrl: true,
          isDynamic: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: { scans: true },
          },
        },
      }),
      prisma.qRCode.count({
        where: { userId: validatedKey.userId },
      }),
    ])

    return NextResponse.json({
      qrCodes: qrCodes.map((qr) => ({
        ...qr,
        scans: qr._count.scans,
        _count: undefined,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
