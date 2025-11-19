import { NextRequest, NextResponse } from 'next/server'
import { generateQRCode } from '@/lib/qr-generator'

interface BatchItem {
  content: string
  options?: any
  metadata?: Record<string, any>
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items } = body as { items: BatchItem[] }

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      )
    }

    if (items.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 items per batch' },
        { status: 400 }
      )
    }

    // Generate all QR codes
    const results = await Promise.allSettled(
      items.map(async (item) => {
        const result = await generateQRCode({
          content: item.content,
          errorCorrectionLevel: 'M',
          size: 300,
          foregroundColor: '#000000',
          backgroundColor: '#ffffff',
          margin: 4,
          ...(item.options || {})
        })
        return {
          content: item.content,
          qrCode: result.dataUrl,
          metadata: item.metadata,
          success: true
        }
      })
    )

    const successful = results.filter(r => r.status === 'fulfilled').map(r => (r as PromiseFulfilledResult<any>).value)
    const failed = results.filter(r => r.status === 'rejected').length

    return NextResponse.json({
      success: true,
      total: items.length,
      successful: successful.length,
      failed,
      results: successful
    })
  } catch (error) {
    console.error('Batch generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate batch QR codes' },
      { status: 500 }
    )
  }
}
