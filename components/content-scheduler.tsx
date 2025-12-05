'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  ScheduledChange,
  scheduleChange,
  getQRScheduledChanges,
  getPendingChanges,
  getUpcomingChanges,
  cancelChange,
  deleteChange,
  updateChange,
  getSchedulerStats,
  startScheduleChecker,
  applyChange,
} from '@/lib/content-scheduler';
import {
  Calendar,
  X,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  Play,
  Pause,
  RefreshCw,
  ChevronRight,
  Repeat,
  CalendarDays,
  Timer,
} from 'lucide-react';

interface ContentSchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  qrId?: string;
  qrName?: string;
  currentContent?: string;
  currentType?: string;
}

export function ContentScheduler({
  isOpen,
  onClose,
  qrId,
  qrName,
  currentContent,
  currentType,
}: ContentSchedulerProps) {
  const [activeTab, setActiveTab] = useState<'schedule' | 'upcoming' | 'history'>('schedule');
  const [scheduledFor, setScheduledFor] = useState('');
  const [newContent, setNewContent] = useState(currentContent || '');
  const [newType, setNewType] = useState(currentType || '');
  const [repeatType, setRepeatType] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [repeatUntil, setRepeatUntil] = useState('');
  const [scheduleName, setScheduleName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Start scheduler on mount
  useEffect(() => {
    startScheduleChecker();
  }, []);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setNewContent(currentContent || '');
      setNewType(currentType || '');
      setScheduledFor('');
      setRepeatType('none');
      setRepeatUntil('');
      setScheduleName('');
      setEditingId(null);
      setSuccess(false);
    }
  }, [isOpen, currentContent, currentType]);

  // Get changes based on context
  const changes = useMemo(() => {
    if (qrId) {
      return getQRScheduledChanges(qrId);
    }
    return getPendingChanges();
  }, [qrId, isOpen, success]);

  const stats = useMemo(() => getSchedulerStats(), [isOpen, success]);
  const upcomingChanges = useMemo(() => getUpcomingChanges(10), [isOpen, success]);

  // Handle schedule submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrId || !scheduledFor || !newContent) return;

    setIsSubmitting(true);

    try {
      if (editingId) {
        updateChange(editingId, {
          scheduledFor: new Date(scheduledFor).toISOString(),
          newContent,
          newType: newType || undefined,
          metadata: {
            name: scheduleName || undefined,
            repeatType,
            repeatUntil: repeatUntil ? new Date(repeatUntil).toISOString() : undefined,
          },
        });
      } else {
        scheduleChange(qrId, new Date(scheduledFor), newContent, {
          newType: newType || undefined,
          name: scheduleName || undefined,
          repeatType,
          repeatUntil: repeatUntil ? new Date(repeatUntil).toISOString() : undefined,
        });
      }

      setSuccess(true);
      setScheduledFor('');
      setNewContent(currentContent || '');
      setScheduleName('');
      setRepeatType('none');
      setRepeatUntil('');
      setEditingId(null);

      setTimeout(() => setSuccess(false), 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (change: ScheduledChange) => {
    setEditingId(change.id);
    setScheduledFor(change.scheduledFor.slice(0, 16)); // Format for datetime-local
    setNewContent(change.newContent);
    setNewType(change.newType || '');
    setScheduleName(change.metadata?.name || '');
    setRepeatType(change.metadata?.repeatType || 'none');
    setRepeatUntil(change.metadata?.repeatUntil?.slice(0, 16) || '');
    setActiveTab('schedule');
  };

  // Handle cancel
  const handleCancel = (changeId: string) => {
    cancelChange(changeId);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 1000);
  };

  // Handle delete
  const handleDelete = (changeId: string) => {
    deleteChange(changeId);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 1000);
  };

  // Handle apply now
  const handleApplyNow = (changeId: string) => {
    applyChange(changeId);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 1000);
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

  // Get min datetime (now)
  const minDateTime = new Date().toISOString().slice(0, 16);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Content Scheduler</h2>
              <p className="text-sm text-muted-foreground">
                {qrName ? `Schedule changes for ${qrName}` : 'Schedule QR code content updates'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 border-b border-border bg-muted/30 px-4 py-2 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{stats.pending} pending</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span>{stats.applied} applied</span>
          </div>
          {stats.overdue.length > 0 && (
            <div className="flex items-center gap-2 text-yellow-600">
              <AlertCircle className="h-4 w-4" />
              <span>{stats.overdue.length} overdue</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {[
            { id: 'schedule', label: 'New Schedule', icon: Plus },
            { id: 'upcoming', label: 'Upcoming', icon: CalendarDays },
            { id: 'history', label: 'All Changes', icon: Timer },
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
          {activeTab === 'schedule' && qrId && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Schedule name */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Schedule Name (optional)
                </label>
                <input
                  type="text"
                  value={scheduleName}
                  onChange={(e) => setScheduleName(e.target.value)}
                  placeholder="e.g., Holiday Campaign"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2"
                />
              </div>

              {/* Date/time */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Schedule For <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  min={minDateTime}
                  required
                  className="w-full rounded-lg border border-border bg-background px-3 py-2"
                />
              </div>

              {/* New content */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  New Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Enter the new content for this QR code"
                  rows={3}
                  required
                  className="w-full rounded-lg border border-border bg-background px-3 py-2"
                />
              </div>

              {/* Repeat options */}
              <div className="rounded-lg border border-border p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Repeat className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Repeat</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm">Frequency</label>
                    <select
                      value={repeatType}
                      onChange={(e) => setRepeatType(e.target.value as typeof repeatType)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2"
                    >
                      <option value="none">Do not repeat</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  {repeatType !== 'none' && (
                    <div>
                      <label className="mb-1 block text-sm">Repeat Until</label>
                      <input
                        type="datetime-local"
                        value={repeatUntil}
                        onChange={(e) => setRepeatUntil(e.target.value)}
                        min={scheduledFor || minDateTime}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || !scheduledFor || !newContent}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : editingId ? (
                  <>
                    <Check className="h-4 w-4" />
                    Update Schedule
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4" />
                    Schedule Change
                  </>
                )}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setScheduledFor('');
                    setNewContent(currentContent || '');
                    setScheduleName('');
                    setRepeatType('none');
                    setRepeatUntil('');
                  }}
                  className="w-full rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Cancel Edit
                </button>
              )}
            </form>
          )}

          {activeTab === 'schedule' && !qrId && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="font-medium">No QR code selected</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Select a QR code from your history to schedule content changes
              </p>
            </div>
          )}

          {activeTab === 'upcoming' && (
            <div className="space-y-4">
              {upcomingChanges.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CalendarDays className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="font-medium">No upcoming changes</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Schedule a change to see it here
                  </p>
                </div>
              ) : (
                upcomingChanges.map((change) => (
                  <ScheduledChangeCard
                    key={change.id}
                    change={change}
                    onEdit={() => handleEdit(change)}
                    onCancel={() => handleCancel(change.id)}
                    onDelete={() => handleDelete(change.id)}
                    onApplyNow={() => handleApplyNow(change.id)}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              {changes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Timer className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="font-medium">No scheduled changes</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {qrId ? 'No changes scheduled for this QR code' : 'Schedule content changes to see them here'}
                  </p>
                </div>
              ) : (
                changes.map((change) => (
                  <ScheduledChangeCard
                    key={change.id}
                    change={change}
                    onEdit={change.status === 'pending' ? () => handleEdit(change) : undefined}
                    onCancel={change.status === 'pending' ? () => handleCancel(change.id) : undefined}
                    onDelete={() => handleDelete(change.id)}
                    onApplyNow={change.status === 'pending' ? () => handleApplyNow(change.id) : undefined}
                  />
                ))
              )}
            </div>
          )}
        </div>

        {/* Success notification */}
        {success && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white">
            <Check className="h-4 w-4" />
            Success
          </div>
        )}
      </div>
    </div>
  );
}

// Scheduled Change Card
function ScheduledChangeCard({
  change,
  onEdit,
  onCancel,
  onDelete,
  onApplyNow,
}: {
  change: ScheduledChange;
  onEdit?: () => void;
  onCancel?: () => void;
  onDelete: () => void;
  onApplyNow?: () => void;
}) {
  const statusColors = {
    pending: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    applied: 'bg-green-500/10 text-green-600 dark:text-green-400',
    failed: 'bg-red-500/10 text-red-600 dark:text-red-400',
    cancelled: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
  };

  const statusIcons = {
    pending: Clock,
    applied: Check,
    failed: AlertCircle,
    cancelled: Pause,
  };

  const StatusIcon = statusIcons[change.status];
  const scheduledDate = new Date(change.scheduledFor);
  const isOverdue = change.status === 'pending' && scheduledDate < new Date();

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="mb-2 flex items-start justify-between">
        <div>
          {change.metadata?.name && (
            <p className="font-medium">{change.metadata.name}</p>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {scheduledDate.toLocaleDateString()} at {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {change.metadata?.repeatType && change.metadata.repeatType !== 'none' && (
              <span className="flex items-center gap-1 text-primary">
                <Repeat className="h-3 w-3" />
                {change.metadata.repeatType}
              </span>
            )}
          </div>
        </div>
        <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[change.status]}`}>
          <StatusIcon className="h-3 w-3" />
          <span className="capitalize">{isOverdue ? 'overdue' : change.status}</span>
        </div>
      </div>

      <div className="mb-3 rounded bg-muted/50 p-2">
        <p className="text-xs text-muted-foreground">New content:</p>
        <p className="truncate font-mono text-sm">{change.newContent}</p>
      </div>

      {change.error && (
        <div className="mb-3 flex items-center gap-2 rounded bg-red-500/10 p-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>{change.error}</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Edit
          </button>
        )}
        {onApplyNow && (
          <button
            onClick={onApplyNow}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-primary hover:bg-primary/10"
          >
            <Play className="h-3.5 w-3.5" />
            Apply Now
          </button>
        )}
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Pause className="h-3.5 w-3.5" />
            Cancel
          </button>
        )}
        <button
          onClick={onDelete}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-red-500 hover:bg-red-500/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </div>
  );
}

// Scheduler Button
export function ContentSchedulerButton({
  qrId,
  qrName,
  currentContent,
  currentType,
}: {
  qrId?: string;
  qrName?: string;
  currentContent?: string;
  currentType?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        title="Schedule content changes"
      >
        <Calendar className="h-4 w-4" />
        <span className="hidden sm:inline">Schedule</span>
      </button>
      <ContentScheduler
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        qrId={qrId}
        qrName={qrName}
        currentContent={currentContent}
        currentType={currentType}
      />
    </>
  );
}
