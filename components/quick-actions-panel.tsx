'use client';

import { useState, useEffect } from 'react';
import {
  QuickAction,
  QuickActionCategory,
  QUICK_ACTION_CATEGORIES,
  getQuickActions,
  getQuickActionsByCategory,
  getRecentQuickActions,
  addRecentQuickAction,
  getQuickAction,
  searchQuickActions,
} from '@/lib/quick-actions';
import {
  Zap,
  Search,
  Clock,
  User,
  Building,
  Wifi,
  Mail,
  Phone,
  Globe,
  Instagram,
  Linkedin,
  Youtube,
  MessageCircle,
  Calendar,
  ShoppingBag,
  Smartphone,
  Star,
  Ticket,
  MapPin,
  Video,
  MessageSquare,
  Type,
  X,
  ChevronRight,
} from 'lucide-react';

// Icon mapping
const ICONS: Record<string, React.ElementType> = {
  'user-circle': User,
  building: Building,
  mail: Mail,
  phone: Phone,
  instagram: Instagram,
  twitter: MessageCircle, // X icon
  linkedin: Linkedin,
  youtube: Youtube,
  video: Video,
  wifi: Wifi,
  globe: Globe,
  'message-circle': MessageCircle,
  calendar: Calendar,
  'shopping-bag': ShoppingBag,
  smartphone: Smartphone,
  star: Star,
  ticket: Ticket,
  'map-pin': MapPin,
  'message-square': MessageSquare,
  type: Type,
};

interface QuickActionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (action: QuickAction) => void;
}

export function QuickActionsPanel({ isOpen, onClose, onSelect }: QuickActionsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<QuickActionCategory | 'all' | 'recent'>('all');
  const [recentIds, setRecentIds] = useState<string[]>([]);

  // Load recent actions
  useEffect(() => {
    setRecentIds(getRecentQuickActions());
  }, [isOpen]);

  // Get filtered actions
  const getFilteredActions = (): QuickAction[] => {
    if (searchQuery) {
      return searchQuickActions(searchQuery);
    }

    if (selectedCategory === 'recent') {
      return recentIds
        .map(id => getQuickAction(id))
        .filter((a): a is QuickAction => a !== undefined);
    }

    if (selectedCategory === 'all') {
      return getQuickActions();
    }

    return getQuickActionsByCategory(selectedCategory);
  };

  const filteredActions = getFilteredActions();

  // Handle action selection
  const handleSelect = (action: QuickAction) => {
    addRecentQuickAction(action.id);
    onSelect(action);
    onClose();
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
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-20 backdrop-blur-sm sm:items-center sm:pt-0">
      <div
        className="relative flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-actions-title"
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 id="quick-actions-title" className="text-lg font-semibold">Quick Actions</h2>
            <p className="text-sm text-muted-foreground">Choose a template to get started quickly</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-border p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
          </div>
        </div>

        {/* Categories */}
        {!searchQuery && (
          <div className="flex gap-2 overflow-x-auto border-b border-border p-4">
            <CategoryButton
              active={selectedCategory === 'all'}
              onClick={() => setSelectedCategory('all')}
              color="#6366f1"
            >
              All
            </CategoryButton>
            {recentIds.length > 0 && (
              <CategoryButton
                active={selectedCategory === 'recent'}
                onClick={() => setSelectedCategory('recent')}
                color="#8b5cf6"
                icon={<Clock className="h-3.5 w-3.5" />}
              >
                Recent
              </CategoryButton>
            )}
            {(Object.entries(QUICK_ACTION_CATEGORIES) as [QuickActionCategory, { label: string; color: string }][]).map(
              ([key, { label, color }]) => (
                <CategoryButton
                  key={key}
                  active={selectedCategory === key}
                  onClick={() => setSelectedCategory(key)}
                  color={color}
                >
                  {label}
                </CategoryButton>
              )
            )}
          </div>
        )}

        {/* Actions Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredActions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground">No templates found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different search term or category
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredActions.map(action => (
                <ActionCard
                  key={action.id}
                  action={action}
                  onSelect={() => handleSelect(action)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 text-center text-sm text-muted-foreground">
          Press <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">Esc</kbd> to close
        </div>
      </div>
    </div>
  );
}

// Category Button Component
function CategoryButton({
  children,
  active,
  onClick,
  color,
  icon,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  color: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
        active
          ? 'text-white'
          : 'bg-muted text-muted-foreground hover:bg-muted/80'
      }`}
      style={active ? { backgroundColor: color } : undefined}
    >
      {icon}
      {children}
    </button>
  );
}

// Action Card Component
function ActionCard({
  action,
  onSelect,
}: {
  action: QuickAction;
  onSelect: () => void;
}) {
  const Icon = ICONS[action.icon] || Globe;
  const categoryInfo = QUICK_ACTION_CATEGORIES[action.category];

  return (
    <button
      onClick={onSelect}
      className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:bg-muted/50 hover:shadow-lg"
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
        style={{ backgroundColor: `${categoryInfo.color}15` }}
      >
        <Icon className="h-6 w-6" style={{ color: categoryInfo.color }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground">{action.name}</h3>
          <span
            className="rounded-full px-2 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: `${categoryInfo.color}15`,
              color: categoryInfo.color,
            }}
          >
            {categoryInfo.label}
          </span>
        </div>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {action.description}
        </p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
    </button>
  );
}

// Quick Actions Button for easy integration
export function QuickActionsButton({
  onSelect,
}: {
  onSelect: (action: QuickAction) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/20"
      >
        <Zap className="h-4 w-4" />
        Quick Actions
      </button>
      <QuickActionsPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelect={onSelect}
      />
    </>
  );
}
