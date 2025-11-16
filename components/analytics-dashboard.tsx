"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, TrendingUp, Download, Eye, QrCode, Activity, BarChart3 } from "lucide-react"
import {
  getOverallStats,
  getAllQRAnalytics,
  exportAnalyticsCSV,
  getChartData,
  type QRAnalyticsSummary
} from "@/lib/qr-analytics"
import { downloadBlob } from "@/lib/bulk-csv"

interface AnalyticsDashboardProps {
  onClose: () => void
}

export default function AnalyticsDashboard({ onClose }: AnalyticsDashboardProps) {
  const [stats, setStats] = useState<ReturnType<typeof getOverallStats> | null>(null)
  const [qrAnalytics, setQRAnalytics] = useState<QRAnalyticsSummary[]>([])
  const [chartData, setChartData] = useState<ReturnType<typeof getChartData>>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setStats(getOverallStats())
    setQRAnalytics(getAllQRAnalytics())
    setChartData(getChartData(7))
  }

  const handleExport = () => {
    const csv = exportAnalyticsCSV()
    const blob = new Blob([csv], { type: 'text/csv' })
    downloadBlob(blob, `qr-analytics-${new Date().toISOString().slice(0, 10)}.csv`)
  }

  if (!stats) return null

  const maxValue = Math.max(...chartData.map(d => d.generated + d.downloaded + d.scanned + d.viewed), 1)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-6xl my-8" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              <CardTitle>Analytics Dashboard</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-1" />
                Export CSV
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            Track QR code generation, downloads, and scans
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <QrCode className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{stats.uniqueQRs}</div>
                  <div className="text-xs text-muted-foreground">Unique QR Codes</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold">{stats.totalEvents}</div>
                  <div className="text-xs text-muted-foreground">Total Events</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Download className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold">{stats.eventsByType.downloaded || 0}</div>
                  <div className="text-xs text-muted-foreground">Downloads</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Eye className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <div className="text-2xl font-bold">{stats.eventsByType.viewed || 0}</div>
                  <div className="text-xs text-muted-foreground">Views</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Last 7 Days Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Last 7 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Generated</div>
                  <div className="text-2xl font-bold">{stats.last7Days.generated}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Downloaded</div>
                  <div className="text-2xl font-bold">{stats.last7Days.downloaded}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Scanned</div>
                  <div className="text-2xl font-bold">{stats.last7Days.scanned}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Viewed</div>
                  <div className="text-2xl font-bold">{stats.last7Days.viewed}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {chartData.map((day) => {
                  const total = day.generated + day.downloaded + day.scanned + day.viewed
                  const percentage = (total / maxValue) * 100

                  return (
                    <div key={day.date} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span className="font-mono">{total} events</span>
                      </div>
                      <div className="h-6 bg-muted rounded-full overflow-hidden flex">
                        {day.generated > 0 && (
                          <div
                            className="bg-blue-500"
                            style={{ width: `${(day.generated / total) * percentage}%` }}
                            title={`${day.generated} generated`}
                          />
                        )}
                        {day.downloaded > 0 && (
                          <div
                            className="bg-green-500"
                            style={{ width: `${(day.downloaded / total) * percentage}%` }}
                            title={`${day.downloaded} downloaded`}
                          />
                        )}
                        {day.scanned > 0 && (
                          <div
                            className="bg-purple-500"
                            style={{ width: `${(day.scanned / total) * percentage}%` }}
                            title={`${day.scanned} scanned`}
                          />
                        )}
                        {day.viewed > 0 && (
                          <div
                            className="bg-orange-500"
                            style={{ width: `${(day.viewed / total) * percentage}%` }}
                            title={`${day.viewed} viewed`}
                          />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex gap-4 mt-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded" />
                  <span>Generated</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded" />
                  <span>Downloaded</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-purple-500 rounded" />
                  <span>Scanned</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-orange-500 rounded" />
                  <span>Viewed</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top QR Codes */}
          {qrAnalytics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top QR Codes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {qrAnalytics.slice(0, 5).map((qr, idx) => (
                    <div key={qr.qrId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-bold text-muted-foreground">#{idx + 1}</div>
                        <div>
                          <div className="font-medium">{qr.qrName || `QR #${qr.qrId.slice(-8)}`}</div>
                          <div className="text-xs text-muted-foreground">
                            {qr.totalEvents} events • Last: {new Date(qr.lastEvent).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-bold">{qr.downloaded}</div>
                          <div className="text-xs text-muted-foreground">Downloads</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold">{qr.scanned}</div>
                          <div className="text-xs text-muted-foreground">Scans</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {stats.totalEvents === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No analytics data yet. Start generating QR codes to see insights!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
