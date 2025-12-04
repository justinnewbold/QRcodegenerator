/**
 * Quick Actions - Pre-built templates for common QR code use cases
 */

export interface QuickAction {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: QuickActionCategory;
  template: QuickActionTemplate;
  popularity: number; // For sorting
}

export type QuickActionCategory =
  | 'business'
  | 'social'
  | 'personal'
  | 'marketing'
  | 'utility';

export interface QuickActionTemplate {
  type: string;
  placeholders: Record<string, string>;
  defaultStyle?: {
    foregroundColor?: string;
    backgroundColor?: string;
    dotStyle?: string;
    cornerStyle?: string;
  };
}

export const QUICK_ACTION_CATEGORIES: Record<QuickActionCategory, { label: string; color: string }> = {
  business: { label: 'Business', color: '#3b82f6' },
  social: { label: 'Social', color: '#ec4899' },
  personal: { label: 'Personal', color: '#10b981' },
  marketing: { label: 'Marketing', color: '#f59e0b' },
  utility: { label: 'Utility', color: '#6366f1' },
};

export const QUICK_ACTIONS: QuickAction[] = [
  // Business
  {
    id: 'digital-business-card',
    name: 'Digital Business Card',
    description: 'Share your contact info instantly',
    icon: 'user-circle',
    category: 'business',
    popularity: 100,
    template: {
      type: 'vcard',
      placeholders: {
        firstName: 'Your First Name',
        lastName: 'Your Last Name',
        organization: 'Company Name',
        title: 'Job Title',
        email: 'email@example.com',
        phone: '+1 234 567 8900',
        website: 'https://yourwebsite.com',
      },
      defaultStyle: {
        foregroundColor: '#1e293b',
        dotStyle: 'rounded',
      },
    },
  },
  {
    id: 'company-website',
    name: 'Company Website',
    description: 'Link to your business website',
    icon: 'building',
    category: 'business',
    popularity: 95,
    template: {
      type: 'url',
      placeholders: {
        url: 'https://yourcompany.com',
      },
      defaultStyle: {
        dotStyle: 'rounded',
        cornerStyle: 'rounded',
      },
    },
  },
  {
    id: 'email-contact',
    name: 'Email Contact',
    description: 'Quick email with subject line',
    icon: 'mail',
    category: 'business',
    popularity: 85,
    template: {
      type: 'email',
      placeholders: {
        email: 'contact@company.com',
        subject: 'Inquiry from QR Code',
        body: 'Hello, I scanned your QR code and would like to...',
      },
    },
  },
  {
    id: 'phone-call',
    name: 'Phone Call',
    description: 'One-tap phone call',
    icon: 'phone',
    category: 'business',
    popularity: 80,
    template: {
      type: 'phone',
      placeholders: {
        phone: '+1 234 567 8900',
      },
    },
  },

  // Social Media
  {
    id: 'instagram-profile',
    name: 'Instagram Profile',
    description: 'Link to your Instagram',
    icon: 'instagram',
    category: 'social',
    popularity: 98,
    template: {
      type: 'social',
      placeholders: {
        platform: 'instagram',
        username: 'yourusername',
      },
      defaultStyle: {
        foregroundColor: '#e1306c',
        dotStyle: 'rounded',
      },
    },
  },
  {
    id: 'twitter-profile',
    name: 'X / Twitter Profile',
    description: 'Link to your X account',
    icon: 'twitter',
    category: 'social',
    popularity: 90,
    template: {
      type: 'social',
      placeholders: {
        platform: 'twitter',
        username: 'yourusername',
      },
      defaultStyle: {
        foregroundColor: '#000000',
        dotStyle: 'squares',
      },
    },
  },
  {
    id: 'linkedin-profile',
    name: 'LinkedIn Profile',
    description: 'Professional networking link',
    icon: 'linkedin',
    category: 'social',
    popularity: 88,
    template: {
      type: 'social',
      placeholders: {
        platform: 'linkedin',
        username: 'your-profile-id',
      },
      defaultStyle: {
        foregroundColor: '#0077b5',
        dotStyle: 'rounded',
      },
    },
  },
  {
    id: 'youtube-channel',
    name: 'YouTube Channel',
    description: 'Subscribe to your channel',
    icon: 'youtube',
    category: 'social',
    popularity: 85,
    template: {
      type: 'social',
      placeholders: {
        platform: 'youtube',
        username: 'yourchannel',
      },
      defaultStyle: {
        foregroundColor: '#ff0000',
        dotStyle: 'rounded',
      },
    },
  },
  {
    id: 'tiktok-profile',
    name: 'TikTok Profile',
    description: 'Link to your TikTok',
    icon: 'video',
    category: 'social',
    popularity: 92,
    template: {
      type: 'social',
      placeholders: {
        platform: 'tiktok',
        username: 'yourusername',
      },
      defaultStyle: {
        foregroundColor: '#000000',
        dotStyle: 'rounded',
      },
    },
  },

  // Personal
  {
    id: 'wifi-home',
    name: 'Home WiFi',
    description: 'Share your WiFi with guests',
    icon: 'wifi',
    category: 'personal',
    popularity: 99,
    template: {
      type: 'wifi',
      placeholders: {
        ssid: 'Your WiFi Name',
        password: 'Your WiFi Password',
        encryption: 'WPA',
        hidden: 'false',
      },
      defaultStyle: {
        foregroundColor: '#0ea5e9',
        dotStyle: 'dots',
      },
    },
  },
  {
    id: 'personal-website',
    name: 'Personal Website',
    description: 'Link to your portfolio',
    icon: 'globe',
    category: 'personal',
    popularity: 82,
    template: {
      type: 'url',
      placeholders: {
        url: 'https://yourname.com',
      },
      defaultStyle: {
        dotStyle: 'extra-rounded',
      },
    },
  },
  {
    id: 'whatsapp-chat',
    name: 'WhatsApp Chat',
    description: 'Start a WhatsApp conversation',
    icon: 'message-circle',
    category: 'personal',
    popularity: 88,
    template: {
      type: 'whatsapp',
      placeholders: {
        phone: '1234567890',
        message: 'Hello! I found your QR code.',
      },
      defaultStyle: {
        foregroundColor: '#25d366',
        dotStyle: 'rounded',
      },
    },
  },
  {
    id: 'calendar-event',
    name: 'Event Invitation',
    description: 'Add event to calendar',
    icon: 'calendar',
    category: 'personal',
    popularity: 75,
    template: {
      type: 'calendar',
      placeholders: {
        title: 'Event Name',
        location: 'Event Location',
        startDate: new Date().toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '11:00',
        description: 'Event details...',
      },
    },
  },

  // Marketing
  {
    id: 'product-page',
    name: 'Product Page',
    description: 'Link to product details',
    icon: 'shopping-bag',
    category: 'marketing',
    popularity: 86,
    template: {
      type: 'url',
      placeholders: {
        url: 'https://store.com/product',
      },
      defaultStyle: {
        dotStyle: 'rounded',
        cornerStyle: 'rounded',
      },
    },
  },
  {
    id: 'app-download',
    name: 'App Download',
    description: 'Link to app store listing',
    icon: 'smartphone',
    category: 'marketing',
    popularity: 84,
    template: {
      type: 'app',
      placeholders: {
        iosUrl: 'https://apps.apple.com/app/id123',
        androidUrl: 'https://play.google.com/store/apps/details?id=com.app',
      },
    },
  },
  {
    id: 'review-request',
    name: 'Leave a Review',
    description: 'Request customer reviews',
    icon: 'star',
    category: 'marketing',
    popularity: 78,
    template: {
      type: 'url',
      placeholders: {
        url: 'https://g.page/r/your-business/review',
      },
      defaultStyle: {
        foregroundColor: '#f59e0b',
        dotStyle: 'rounded',
      },
    },
  },
  {
    id: 'coupon-code',
    name: 'Coupon / Discount',
    description: 'Share promotional codes',
    icon: 'ticket',
    category: 'marketing',
    popularity: 80,
    template: {
      type: 'text',
      placeholders: {
        text: 'Use code SAVE20 for 20% off!',
      },
      defaultStyle: {
        foregroundColor: '#16a34a',
        dotStyle: 'rounded',
      },
    },
  },

  // Utility
  {
    id: 'location-map',
    name: 'Location / Map',
    description: 'Share a map location',
    icon: 'map-pin',
    category: 'utility',
    popularity: 83,
    template: {
      type: 'location',
      placeholders: {
        latitude: '40.7128',
        longitude: '-74.0060',
        label: 'Our Location',
      },
      defaultStyle: {
        foregroundColor: '#ef4444',
        dotStyle: 'dots',
      },
    },
  },
  {
    id: 'zoom-meeting',
    name: 'Zoom Meeting',
    description: 'Join a Zoom call',
    icon: 'video',
    category: 'utility',
    popularity: 76,
    template: {
      type: 'zoom',
      placeholders: {
        meetingId: '123 456 7890',
        password: 'abc123',
      },
      defaultStyle: {
        foregroundColor: '#2d8cff',
        dotStyle: 'rounded',
      },
    },
  },
  {
    id: 'sms-message',
    name: 'SMS Message',
    description: 'Pre-filled text message',
    icon: 'message-square',
    category: 'utility',
    popularity: 70,
    template: {
      type: 'sms',
      placeholders: {
        phone: '+1234567890',
        message: 'Your pre-filled message here',
      },
    },
  },
  {
    id: 'plain-text',
    name: 'Plain Text',
    description: 'Any text content',
    icon: 'type',
    category: 'utility',
    popularity: 65,
    template: {
      type: 'text',
      placeholders: {
        text: 'Your text here',
      },
    },
  },
];

/**
 * Get quick actions sorted by popularity
 */
export function getQuickActions(): QuickAction[] {
  return [...QUICK_ACTIONS].sort((a, b) => b.popularity - a.popularity);
}

/**
 * Get quick actions by category
 */
export function getQuickActionsByCategory(category: QuickActionCategory): QuickAction[] {
  return QUICK_ACTIONS
    .filter(action => action.category === category)
    .sort((a, b) => b.popularity - a.popularity);
}

/**
 * Get a single quick action by ID
 */
export function getQuickAction(id: string): QuickAction | undefined {
  return QUICK_ACTIONS.find(action => action.id === id);
}

/**
 * Search quick actions
 */
export function searchQuickActions(query: string): QuickAction[] {
  const lowerQuery = query.toLowerCase();
  return QUICK_ACTIONS
    .filter(action =>
      action.name.toLowerCase().includes(lowerQuery) ||
      action.description.toLowerCase().includes(lowerQuery) ||
      action.category.toLowerCase().includes(lowerQuery)
    )
    .sort((a, b) => b.popularity - a.popularity);
}

/**
 * Get recently used quick actions from localStorage
 */
export function getRecentQuickActions(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem('qr-recent-quick-actions');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Add a quick action to recent list
 */
export function addRecentQuickAction(actionId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const recent = getRecentQuickActions();
    const filtered = recent.filter(id => id !== actionId);
    const updated = [actionId, ...filtered].slice(0, 5);
    localStorage.setItem('qr-recent-quick-actions', JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
}
