import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const qrCodeId = searchParams.get('qrCodeId')
    const timeRange = searchParams.get('timeRange') || '7d'
    const workspaceId = searchParams.get('workspaceId')

    // Calculate date range
    const now = new Date()
    const startDate = new Date()
    switch (timeRange) {
      case '24h':
        startDate.setHours(now.getHours() - 24)
        break
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    // Build filter
    const where: any = {
      scannedAt: {
        gte: startDate,
        lte: now,
      },
    }

    if (qrCodeId) {
      // Get specific QR code analytics
      const qrCode = await prisma.qRCode.findUnique({
        where: { id: qrCodeId },
      })

      if (!qrCode || qrCode.userId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      where.qrCodeId = qrCodeId
    } else {
      // Get all QR codes for user
      const qrCodes = await prisma.qRCode.findMany({
        where: {
          userId: session.user.id,
          ...(workspaceId ? { workspaceId } : {}),
        },
        select: { id: true },
      })

      where.qrCodeId = {
        in: qrCodes.map((qr) => qr.id),
      }
    }

    // Get scan statistics
    const [totalScans, scans, scansByCountry, scansByDevice, scansByBrowser] =
      await Promise.all([
        // Total scans
        prisma.scan.count({ where }),

        // Scans over time
        prisma.scan.groupBy({
          by: ['scannedAt'],
          where,
          _count: true,
          orderBy: { scannedAt: 'asc' },
        }),

        // By country
        prisma.scan.groupBy({
          by: ['country'],
          where,
          _count: true,
          orderBy: { _count: { country: 'desc' } },
          take: 10,
        }),

        // By device
        prisma.scan.groupBy({
          by: ['device'],
          where,
          _count: true,
        }),

        // By browser
        prisma.scan.groupBy({
          by: ['browser'],
          where,
          _count: true,
        }),
      ])

    // Format scans over time for charts
    const scansOverTime = groupScansByInterval(scans, timeRange)

    return NextResponse.json({
      totalScans,
      scansOverTime,
      scansByCountry: scansByCountry.map((item) => ({
        country: item.country || 'Unknown',
        count: item._count,
      })),
      scansByDevice: scansByDevice.map((item) => ({
        device: item.device || 'Unknown',
        count: item._count,
      })),
      scansByBrowser: scansByBrowser.map((item) => ({
        browser: item.browser || 'Unknown',
        count: item._count,
      })),
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

function groupScansByInterval(
  scans: any[],
  timeRange: string
): { date: string; count: number }[] {
  const grouped = new Map<string, number>()

  const format = timeRange === '24h' ? 'hour' : 'day'

  scans.forEach((scan) => {
    const date = new Date(scan.scannedAt)
    let key: string

    if (format === 'hour') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }

    grouped.set(key, (grouped.get(key) || 0) + scan._count)
  })

  return Array.from(grouped.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
}
