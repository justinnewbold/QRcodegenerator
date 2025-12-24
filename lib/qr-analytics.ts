export interface QRAnalyticsEvent {
  id: string
  qrId: string
  qrName?: string
  timestamp: number
  eventType: 'generated' | 'downloaded' | 'scanned' | 'viewed'
  metadata: {
    userAgent?: string
    screenSize?: string
    format?: string
    size?: number
    [key: string]: any
  }
}

export interface QRAnalyticsSummary {
  qrId: string
  qrName?: string
  totalEvents: number
  generated: number
  downloaded: number
  scanned: number
  viewed: number
  firstEvent: number
  lastEvent: number
  popularFormats: Record<string, number>
  downloadsByDay: Record<string, number>
}

const ANALYTICS_KEY = 'qr-analytics-events'
const MAX_EVENTS = 1000

/**
 * Track a QR code event
 */
export function trackQREvent(
  qrId: string,
  eventType: QRAnalyticsEvent['eventType'],
  metadata: QRAnalyticsEvent['metadata'] = {},
  qrName?: string
): void {
  if (typeof window === 'undefined') return

  try {
    const events = getAnalyticsEvents()

    const event: QRAnalyticsEvent = {
      id: generateEventId(),
      qrId,
      qrName,
      timestamp: Date.now(),
      eventType,
      metadata: {
        userAgent: navigator.userAgent,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        ...metadata,
      },
    }

    events.unshift(event)

    // Limit events
    if (events.length > MAX_EVENTS) {
      events.splice(MAX_EVENTS)
    }

    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(events))
  } catch (error) {
    console.error('Error tracking QR event:', error)
  }
}

/**
 * Get all analytics events
 */
export function getAnalyticsEvents(): QRAnalyticsEvent[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(ANALYTICS_KEY)
    if (!stored) return []

    return JSON.parse(stored) as QRAnalyticsEvent[]
  } catch (error) {
    console.error('Error loading analytics:', error)
    return []
  }
}

/**
 * Get analytics summary for a specific QR code
 */
export function getQRAnalytics(qrId: string): QRAnalyticsSummary | null {
  const events = getAnalyticsEvents().filter(e => e.qrId === qrId)

  if (events.length === 0) return null

  const summary: QRAnalyticsSummary = {
    qrId,
    qrName: events[0].qrName,
    totalEvents: events.length,
    generated: events.filter(e => e.eventType === 'generated').length,
    downloaded: events.filter(e => e.eventType === 'downloaded').length,
    scanned: events.filter(e => e.eventType === 'scanned').length,
    viewed: events.filter(e => e.eventType === 'viewed').length,
    firstEvent: Math.min(...events.map(e => e.timestamp)),
    lastEvent: Math.max(...events.map(e => e.timestamp)),
    popularFormats: {},
    downloadsByDay: {},
  }

  // Calculate popular formats
  events.forEach(event => {
    if (event.metadata.format) {
      const format = event.metadata.format
      summary.popularFormats[format] = (summary.popularFormats[format] || 0) + 1
    }
  })

  // Calculate downloads by day
  events
    .filter(e => e.eventType === 'downloaded')
    .forEach(event => {
      const day = new Date(event.timestamp).toISOString().split('T')[0]
      summary.downloadsByDay[day] = (summary.downloadsByDay[day] || 0) + 1
    })

  return summary
}

/**
 * Get analytics for all QR codes
 */
export function getAllQRAnalytics(): QRAnalyticsSummary[] {
  const events = getAnalyticsEvents()
  const qrIds = Array.from(new Set(events.map(e => e.qrId)))

  return qrIds
    .map(id => getQRAnalytics(id))
    .filter((s): s is QRAnalyticsSummary => s !== null)
    .sort((a, b) => b.totalEvents - a.totalEvents)
}

/**
 * Get overall analytics stats
 */
export function getOverallStats() {
  const events = getAnalyticsEvents()
  const uniqueQRs = new Set(events.map(e => e.qrId)).size

  const eventsByType: Record<string, number> = {}
  events.forEach(event => {
    eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1
  })

  const eventsByDay: Record<string, number> = {}
  events.forEach(event => {
    const day = new Date(event.timestamp).toISOString().split('T')[0]
    eventsByDay[day] = (eventsByDay[day] || 0) + 1
  })

  return {
    totalEvents: events.length,
    uniqueQRs,
    eventsByType,
    eventsByDay,
    last7Days: getLast7DaysStats(events),
    last30Days: getLast30DaysStats(events),
  }
}

/**
 * Get stats for last 7 days
 */
function getLast7DaysStats(events: QRAnalyticsEvent[]) {
  const now = Date.now()
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000

  const recentEvents = events.filter(e => e.timestamp >= sevenDaysAgo)

  return {
    total: recentEvents.length,
    generated: recentEvents.filter(e => e.eventType === 'generated').length,
    downloaded: recentEvents.filter(e => e.eventType === 'downloaded').length,
    scanned: recentEvents.filter(e => e.eventType === 'scanned').length,
    viewed: recentEvents.filter(e => e.eventType === 'viewed').length,
  }
}

/**
 * Get stats for last 30 days
 */
function getLast30DaysStats(events: QRAnalyticsEvent[]) {
  const now = Date.now()
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000

  const recentEvents = events.filter(e => e.timestamp >= thirtyDaysAgo)

  return {
    total: recentEvents.length,
    generated: recentEvents.filter(e => e.eventType === 'generated').length,
    downloaded: recentEvents.filter(e => e.eventType === 'downloaded').length,
    scanned: recentEvents.filter(e => e.eventType === 'scanned').length,
    viewed: recentEvents.filter(e => e.eventType === 'viewed').length,
  }
}

/**
 * Clear all analytics data
 */
export function clearAnalytics(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ANALYTICS_KEY)
}

/**
 * Export analytics as CSV
 */
export function exportAnalyticsCSV(): string {
  const events = getAnalyticsEvents()

  const headers = ['ID', 'QR ID', 'QR Name', 'Event Type', 'Timestamp', 'Date', 'User Agent', 'Screen Size', 'Format']
  const rows = events.map(event => [
    event.id,
    event.qrId,
    event.qrName || '',
    event.eventType,
    event.timestamp.toString(),
    new Date(event.timestamp).toISOString(),
    event.metadata.userAgent || '',
    event.metadata.screenSize || '',
    event.metadata.format || '',
  ])

  // Helper to escape CSV cell values per RFC 4180
  const escapeCSV = (cell: string | number): string => {
    const str = String(cell);
    // Escape quotes by doubling them
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(escapeCSV).join(',')),
  ].join('\n')

  return csvContent
}

/**
 * Generate a unique event ID
 */
function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Get chart data for analytics dashboard
 */
export function getChartData(days: number = 7) {
  const events = getAnalyticsEvents()
  const now = Date.now()
  const startDate = now - days * 24 * 60 * 60 * 1000

  const dateMap: Record<string, { generated: number; downloaded: number; scanned: number; viewed: number }> = {}

  // Initialize all days
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate + i * 24 * 60 * 60 * 1000)
    const dateStr = date.toISOString().split('T')[0]
    dateMap[dateStr] = { generated: 0, downloaded: 0, scanned: 0, viewed: 0 }
  }

  // Populate with events
  events
    .filter(e => e.timestamp >= startDate)
    .forEach(event => {
      const dateStr = new Date(event.timestamp).toISOString().split('T')[0]
      if (dateMap[dateStr]) {
        dateMap[dateStr][event.eventType]++
      }
    })

  return Object.entries(dateMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({
      date,
      ...counts,
    }))
}
