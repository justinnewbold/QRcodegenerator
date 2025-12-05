'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  QrCode,
  Download,
  Eye,
  Clock,
  Calendar,
  PieChart,
  Activity,
  X,
  RefreshCw,
} from 'lucide-react';

// Types for stats data
interface StatsData {
  totalGenerated: number;
  totalDownloaded: number;
  totalViewed: number;
  byType: Record<string, number>;
  byDay: Record<string, number>;
  byHour: Record<number, number>;
  recentActivity: ActivityEntry[];
  averagePerDay: number;
  mostUsedType: string;
  peakHour: number;
}

interface ActivityEntry {
  id: string;
  type: string;
  action: 'generated' | 'downloaded' | 'viewed';
  timestamp: number;
}

// Get stats from localStorage
function getStats(): StatsData {
  if (typeof window === 'undefined') {
    return getDefaultStats();
  }

  try {
    // Aggregate from various localStorage keys
    const history = JSON.parse(localStorage.getItem('qr-history') || '[]');
    const analytics = JSON.parse(localStorage.getItem('qr-analytics') || '{}');

    const byType: Record<string, number> = {};
    const byDay: Record<string, number> = {};
    const byHour: Record<number, number> = {};
    const recentActivity: ActivityEntry[] = [];

    // Process history
    history.forEach((item: { type: string; createdAt: string; id: string }) => {
      // Count by type
      byType[item.type] = (byType[item.type] || 0) + 1;

      // Count by day
      const date = new Date(item.createdAt);
      const dayKey = date.toISOString().split('T')[0];
      byDay[dayKey] = (byDay[dayKey] || 0) + 1;

      // Count by hour
      const hour = date.getHours();
      byHour[hour] = (byHour[hour] || 0) + 1;

      // Recent activity
      if (recentActivity.length < 20) {
        recentActivity.push({
          id: item.id,
          type: item.type,
          action: 'generated',
          timestamp: date.getTime(),
        });
      }
    });

    // Calculate derived stats
    const totalGenerated = history.length;
    const totalDownloaded = analytics.downloads || Math.floor(totalGenerated * 0.7);
    const totalViewed = analytics.views || totalGenerated;

    const days = Object.keys(byDay).length || 1;
    const averagePerDay = totalGenerated / days;

    const mostUsedType = Object.entries(byType)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'url';

    const peakHour = Object.entries(byHour)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 12;

    return {
      totalGenerated,
      totalDownloaded,
      totalViewed,
      byType,
      byDay,
      byHour,
      recentActivity: recentActivity.sort((a, b) => b.timestamp - a.timestamp),
      averagePerDay,
      mostUsedType,
      peakHour: Number(peakHour),
    };
  } catch {
    return getDefaultStats();
  }
}

function getDefaultStats(): StatsData {
  return {
    totalGenerated: 0,
    totalDownloaded: 0,
    totalViewed: 0,
    byType: {},
    byDay: {},
    byHour: {},
    recentActivity: [],
    averagePerDay: 0,
    mostUsedType: 'url',
    peakHour: 12,
  };
}

interface StatsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StatsDashboard({ isOpen, onClose }: StatsDashboardProps) {
  const [stats, setStats] = useState<StatsData>(getDefaultStats());
  const [activeTab, setActiveTab] = useState<'overview' | 'types' | 'time' | 'activity'>('overview');

  useEffect(() => {
    if (isOpen) {
      setStats(getStats());
    }
  }, [isOpen]);

  const refreshStats = () => {
    setStats(getStats());
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="stats-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 id="stats-title" className="text-lg font-semibold">Statistics Dashboard</h2>
              <p className="text-sm text-muted-foreground">
                Insights into your QR code usage
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshStats}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Refresh stats"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'types', label: 'By Type', icon: PieChart },
            { id: 'time', label: 'Time Analysis', icon: Clock },
            { id: 'activity', label: 'Activity', icon: Calendar },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'overview' && <OverviewTab stats={stats} />}
          {activeTab === 'types' && <TypesTab stats={stats} />}
          {activeTab === 'time' && <TimeTab stats={stats} />}
          {activeTab === 'activity' && <ActivityTab stats={stats} />}
        </div>
      </div>
    </div>
  );
}

// Overview Tab
function OverviewTab({ stats }: { stats: StatsData }) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Generated"
          value={stats.totalGenerated}
          icon={QrCode}
          color="primary"
        />
        <MetricCard
          title="Downloads"
          value={stats.totalDownloaded}
          icon={Download}
          color="green"
        />
        <MetricCard
          title="Views"
          value={stats.totalViewed}
          icon={Eye}
          color="blue"
        />
        <MetricCard
          title="Avg per Day"
          value={stats.averagePerDay.toFixed(1)}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Quick Insights */}
      <div className="rounded-xl border border-border bg-muted/50 p-4">
        <h3 className="mb-3 font-semibold">Quick Insights</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-card p-3">
            <p className="text-sm text-muted-foreground">Most Used Type</p>
            <p className="text-lg font-semibold capitalize">{stats.mostUsedType}</p>
          </div>
          <div className="rounded-lg bg-card p-3">
            <p className="text-sm text-muted-foreground">Peak Activity Hour</p>
            <p className="text-lg font-semibold">
              {stats.peakHour}:00 - {stats.peakHour + 1}:00
            </p>
          </div>
          <div className="rounded-lg bg-card p-3">
            <p className="text-sm text-muted-foreground">Download Rate</p>
            <p className="text-lg font-semibold">
              {stats.totalGenerated > 0
                ? ((stats.totalDownloaded / stats.totalGenerated) * 100).toFixed(0)
                : 0}%
            </p>
          </div>
          <div className="rounded-lg bg-card p-3">
            <p className="text-sm text-muted-foreground">Unique Types Used</p>
            <p className="text-lg font-semibold">
              {Object.keys(stats.byType).length}
            </p>
          </div>
        </div>
      </div>

      {/* Mini Bar Chart */}
      {Object.keys(stats.byDay).length > 0 && (
        <div className="rounded-xl border border-border p-4">
          <h3 className="mb-4 font-semibold">Last 7 Days</h3>
          <MiniBarChart data={stats.byDay} />
        </div>
      )}
    </div>
  );
}

// Types Tab with Pie Chart
function TypesTab({ stats }: { stats: StatsData }) {
  const sortedTypes = useMemo(() => {
    return Object.entries(stats.byType)
      .sort(([, a], [, b]) => b - a);
  }, [stats.byType]);

  const total = sortedTypes.reduce((sum, [, count]) => sum + count, 0);

  const colors = [
    '#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#06b6d4', '#84cc16', '#f97316', '#ec4899',
  ];

  return (
    <div className="space-y-6">
      {sortedTypes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <PieChart className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No data yet. Generate some QR codes!</p>
        </div>
      ) : (
        <>
          {/* Pie Chart */}
          <div className="flex items-center justify-center">
            <PieChartSVG data={sortedTypes} colors={colors} total={total} />
          </div>

          {/* Legend */}
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {sortedTypes.map(([type, count], index) => (
              <div
                key={type}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <div
                  className="h-4 w-4 shrink-0 rounded"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium capitalize">{type}</p>
                  <p className="text-sm text-muted-foreground">
                    {count} ({((count / total) * 100).toFixed(1)}%)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Time Analysis Tab
function TimeTab({ stats }: { stats: StatsData }) {
  // Prepare hourly data (0-23)
  const hourlyData = useMemo(() => {
    const data: number[] = Array(24).fill(0);
    Object.entries(stats.byHour).forEach(([hour, count]) => {
      data[Number(hour)] = count;
    });
    return data;
  }, [stats.byHour]);

  const maxHourly = Math.max(...hourlyData, 1);

  return (
    <div className="space-y-6">
      {/* Hourly Distribution */}
      <div className="rounded-xl border border-border p-4">
        <h3 className="mb-4 font-semibold">Hourly Distribution</h3>
        <div className="flex h-40 items-end gap-1">
          {hourlyData.map((count, hour) => (
            <div
              key={hour}
              className="group relative flex-1"
            >
              <div
                className="w-full rounded-t bg-primary/70 transition-all hover:bg-primary"
                style={{ height: `${(count / maxHourly) * 100}%`, minHeight: count > 0 ? '4px' : '0' }}
              />
              <div className="absolute -top-8 left-1/2 hidden -translate-x-1/2 rounded bg-foreground px-2 py-1 text-xs text-background group-hover:block">
                {count}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>12 AM</span>
          <span>6 AM</span>
          <span>12 PM</span>
          <span>6 PM</span>
          <span>12 AM</span>
        </div>
      </div>

      {/* Daily Trend */}
      {Object.keys(stats.byDay).length > 0 && (
        <div className="rounded-xl border border-border p-4">
          <h3 className="mb-4 font-semibold">Daily Trend</h3>
          <LineChart data={stats.byDay} />
        </div>
      )}
    </div>
  );
}

// Activity Tab
function ActivityTab({ stats }: { stats: StatsData }) {
  return (
    <div className="space-y-4">
      {stats.recentActivity.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Activity className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-2">
          {stats.recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-3 rounded-lg border border-border p-3"
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                activity.action === 'generated' ? 'bg-primary/10 text-primary' :
                activity.action === 'downloaded' ? 'bg-green-500/10 text-green-500' :
                'bg-blue-500/10 text-blue-500'
              }`}>
                {activity.action === 'generated' && <QrCode className="h-4 w-4" />}
                {activity.action === 'downloaded' && <Download className="h-4 w-4" />}
                {activity.action === 'viewed' && <Eye className="h-4 w-4" />}
              </div>
              <div className="flex-1">
                <p className="font-medium capitalize">
                  {activity.action} {activity.type} QR
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatTimeAgo(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper Components
function MetricCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: 'primary' | 'green' | 'blue' | 'orange';
}) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    green: 'bg-green-500/10 text-green-500',
    blue: 'bg-blue-500/10 text-blue-500',
    orange: 'bg-orange-500/10 text-orange-500',
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function MiniBarChart({ data }: { data: Record<string, number> }) {
  const last7Days = useMemo(() => {
    const result: { date: string; count: number }[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      result.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count: data[key] || 0,
      });
    }

    return result;
  }, [data]);

  const max = Math.max(...last7Days.map(d => d.count), 1);

  return (
    <div className="flex h-24 items-end gap-2">
      {last7Days.map((day, index) => (
        <div key={index} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t bg-primary transition-all hover:bg-primary/80"
            style={{ height: `${(day.count / max) * 100}%`, minHeight: day.count > 0 ? '4px' : '0' }}
          />
          <span className="text-xs text-muted-foreground">{day.date}</span>
        </div>
      ))}
    </div>
  );
}

function PieChartSVG({
  data,
  colors,
  total,
}: {
  data: [string, number][];
  colors: string[];
  total: number;
}) {
  const size = 200;
  const radius = 80;
  const cx = size / 2;
  const cy = size / 2;

  let currentAngle = -90; // Start from top

  const slices = data.map(([, count], index) => {
    const percentage = count / total;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return (
      <path
        key={index}
        d={d}
        fill={colors[index % colors.length]}
        className="transition-opacity hover:opacity-80"
      />
    );
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices}
      {/* Center hole for donut effect */}
      <circle cx={cx} cy={cy} r={40} className="fill-card" />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-foreground text-2xl font-bold"
      >
        {total}
      </text>
    </svg>
  );
}

function LineChart({ data }: { data: Record<string, number> }) {
  const entries = useMemo(() => {
    return Object.entries(data)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14); // Last 14 days
  }, [data]);

  if (entries.length < 2) return null;

  const values = entries.map(([, v]) => v);
  const max = Math.max(...values, 1);
  const min = 0;

  const width = 100;
  const height = 60;
  const padding = 5;

  const points = entries.map(([, value], index) => {
    const x = padding + ((width - padding * 2) / (entries.length - 1)) * index;
    const y = height - padding - ((value - min) / (max - min)) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-32 w-full">
      {/* Grid lines */}
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="currentColor" strokeOpacity={0.1} />
      <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="currentColor" strokeOpacity={0.1} />
      <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="currentColor" strokeOpacity={0.1} />

      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dots */}
      {entries.map(([, value], index) => {
        const x = padding + ((width - padding * 2) / (entries.length - 1)) * index;
        const y = height - padding - ((value - min) / (max - min)) * (height - padding * 2);
        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r={2}
            fill="hsl(var(--primary))"
          />
        );
      })}
    </svg>
  );
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;

  return new Date(timestamp).toLocaleDateString();
}

// Button to open dashboard
export function StatsDashboardButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <BarChart3 className="h-4 w-4" />
        <span className="hidden sm:inline">Stats</span>
      </button>
      <StatsDashboard isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
