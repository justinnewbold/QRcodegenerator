import { NextRequest, NextResponse } from 'next/server'
import { resolveShortUrl, trackScan, verifyQRPassword } from '@/lib/url-shortener'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { shortId, password, metadata } = body

    if (!shortId) {
      return NextResponse.json({ error: 'Short ID required' }, { status: 400 })
    }

    // Resolve the short URL
    const result = await resolveShortUrl(shortId)

    if (!result) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const { qrCode } = result

    // Check if password protected
    if (qrCode.password) {
      if (!password) {
        return NextResponse.json({ passwordRequired: true }, { status: 401 })
      }

      const isValidPassword = await verifyQRPassword(qrCode.id, password)
      if (!isValidPassword) {
        return NextResponse.json({ error: 'invalid_password' }, { status: 401 })
      }
    }

    // Get client info
    const headersList = await headers()
    const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] ||
                     headersList.get('x-real-ip') ||
                     'unknown'

    // Parse user agent
    const userAgent = metadata?.userAgent || headersList.get('user-agent') || ''
    const deviceInfo = parseUserAgent(userAgent)

    // Track the scan
    await trackScan(qrCode.id, {
      ipAddress,
      userAgent,
      language: metadata?.language,
      referrer: metadata?.referrer,
      ...deviceInfo,
    })

    // Return the redirect URL
    return NextResponse.json({
      redirectUrl: qrCode.content,
    })
  } catch (error) {
    console.error('Redirect error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

function parseUserAgent(userAgent: string) {
  let device = 'Unknown'
  let os = 'Unknown'
  let browser = 'Unknown'

  // Detect device
  if (/mobile/i.test(userAgent)) device = 'Mobile'
  else if (/tablet/i.test(userAgent)) device = 'Tablet'
  else device = 'Desktop'

  // Detect OS
  if (/windows/i.test(userAgent)) os = 'Windows'
  else if (/mac/i.test(userAgent)) os = 'macOS'
  else if (/linux/i.test(userAgent)) os = 'Linux'
  else if (/android/i.test(userAgent)) os = 'Android'
  else if (/ios|iphone|ipad/i.test(userAgent)) os = 'iOS'

  // Detect browser
  if (/chrome/i.test(userAgent) && !/edg/i.test(userAgent)) browser = 'Chrome'
  else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = 'Safari'
  else if (/firefox/i.test(userAgent)) browser = 'Firefox'
  else if (/edg/i.test(userAgent)) browser = 'Edge'

  return { device, os, browser }
}
