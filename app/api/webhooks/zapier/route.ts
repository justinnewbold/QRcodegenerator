import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/api-key'
import { createShortUrl } from '@/lib/url-shortener'
import { z } from 'zod'

// Zapier webhook for QR code generation
// This allows users to create QR codes from Zapier workflows

const zapierQRSchema = z.object({
  content: z.string().min(1),
  type: z.string().default('URL'),
  name: z.string().optional(),
  dynamic: z.boolean().default(false),
  workspaceId: z.string().optional(),
  campaignId: z.string().optional(),
  customization: z
    .object({
      foregroundColor: z.string().optional(),
      backgroundColor: z.string().optional(),
      size: z.number().optional(),
      errorCorrectionLevel: z.enum(['L', 'M', 'Q', 'H']).optional(),
    })
    .optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Verify API key
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 })
    }

    const validatedKey = await validateApiKey(apiKey)
    if (!validatedKey) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    // Parse and validate body
    const body = await request.json()
    const data = zapierQRSchema.parse(body)

    let qrCode
    if (data.dynamic) {
      qrCode = await createShortUrl({
        userId: validatedKey.userId,
        originalUrl: data.content,
        qrType: data.type,
        workspaceId: data.workspaceId,
        campaignId: data.campaignId,
        metadata: { name: data.name },
      })
    }

    // Generate the QR code image
    const { generateQRCode } = await import('@/lib/qrcode-generator')
    const qrImage = await generateQRCode({
      content: data.dynamic && qrCode ? qrCode.dynamicUrl! : data.content,
      foregroundColor: data.customization?.foregroundColor || '#000000',
      backgroundColor: data.customization?.backgroundColor || '#ffffff',
      size: data.customization?.size || 300,
      errorCorrectionLevel: data.customization?.errorCorrectionLevel || 'M',
    })

    return NextResponse.json({
      id: qrCode?.id,
      qrCodeImage: qrImage.dataUrl,
      shortUrl: qrCode?.dynamicUrl,
      content: data.content,
      type: data.type,
      dynamic: data.dynamic,
      createdAt: new Date().toISOString(),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Zapier webhook error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// Zapier polling endpoint - for triggers
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

    const { searchParams } = new URL(request.url)
    const since = searchParams.get('since')

    const { prisma } = await import('@/lib/prisma')

    // Get recent QR codes
    const qrCodes = await prisma.qRCode.findMany({
      where: {
        userId: validatedKey.userId,
        ...(since ? { createdAt: { gte: new Date(since) } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        shortId: true,
        type: true,
        content: true,
        dynamicUrl: true,
        isDynamic: true,
        createdAt: true,
      },
    })

    return NextResponse.json(qrCodes)
  } catch (error) {
    console.error('Zapier polling error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
