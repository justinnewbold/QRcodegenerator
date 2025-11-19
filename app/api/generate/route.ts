import { NextRequest, NextResponse } from 'next/server'
import { generateQRCode } from '@/lib/qr-generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, options } = body

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Generate QR code with defaults
    const result = await generateQRCode({
      content,
      errorCorrectionLevel: 'M',
      size: 300,
      foregroundColor: '#000000',
      backgroundColor: '#ffffff',
      margin: 4,
      ...(options || {})
    })

    return NextResponse.json({
      success: true,
      qrCode: result.dataUrl,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('QR generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    )
  }
}

// GET endpoint for simple URL-based generation
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const content = searchParams.get('content')
    const size = parseInt(searchParams.get('size') || '300')
    const errorLevel = searchParams.get('errorLevel') || 'M'

    if (!content) {
      return NextResponse.json(
        { error: 'Content parameter is required' },
        { status: 400 }
      )
    }

    const result = await generateQRCode({
      content,
      size,
      errorCorrectionLevel: errorLevel as any,
      foregroundColor: '#000000',
      backgroundColor: '#ffffff',
      margin: 4
    })

    return NextResponse.json({
      success: true,
      qrCode: result.dataUrl
    })
  } catch (error) {
    console.error('QR generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    )
  }
}
