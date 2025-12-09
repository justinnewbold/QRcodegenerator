/**
 * QR Code Templates Gallery
 * Pre-designed templates for common use cases
 */

export interface QRTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  thumbnail: string;
  settings: TemplateSettings;
  tags: string[];
  popularity: number;
}

export interface TemplateSettings {
  type: string;
  foregroundColor: string;
  backgroundColor: string;
  dotStyle: 'square' | 'dots' | 'rounded' | 'classy' | 'classy-rounded';
  cornerStyle: 'square' | 'dot' | 'rounded';
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  margin: number;
  size: number;
  gradient?: {
    enabled: boolean;
    type: 'linear' | 'radial';
    colors: string[];
    rotation?: number;
  };
  eyeColors?: {
    topLeft?: string;
    topRight?: string;
    bottomLeft?: string;
  };
  frameStyle?: string;
  frameText?: string;
  frameColor?: string;
}

export type TemplateCategory =
  | 'restaurant'
  | 'business'
  | 'event'
  | 'retail'
  | 'social'
  | 'education'
  | 'healthcare'
  | 'real-estate'
  | 'minimal'
  | 'creative';

export const TEMPLATE_CATEGORIES: { id: TemplateCategory; label: string; icon: string }[] = [
  { id: 'restaurant', label: 'Restaurant & Food', icon: '🍽️' },
  { id: 'business', label: 'Business & Corporate', icon: '💼' },
  { id: 'event', label: 'Events & Tickets', icon: '🎫' },
  { id: 'retail', label: 'Retail & Shopping', icon: '🛍️' },
  { id: 'social', label: 'Social Media', icon: '📱' },
  { id: 'education', label: 'Education', icon: '📚' },
  { id: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { id: 'real-estate', label: 'Real Estate', icon: '🏠' },
  { id: 'minimal', label: 'Minimal & Clean', icon: '✨' },
  { id: 'creative', label: 'Creative & Fun', icon: '🎨' },
];

export const QR_TEMPLATES: QRTemplate[] = [
  // Restaurant Templates
  {
    id: 'restaurant-menu',
    name: 'Digital Menu',
    description: 'Clean design for restaurant menus with appetizing colors',
    category: 'restaurant',
    thumbnail: '🍽️',
    tags: ['menu', 'food', 'dining'],
    popularity: 95,
    settings: {
      type: 'url',
      foregroundColor: '#2D3436',
      backgroundColor: '#FFEAA7',
      dotStyle: 'rounded',
      cornerStyle: 'rounded',
      errorCorrection: 'M',
      margin: 4,
      size: 300,
      frameStyle: 'banner-bottom',
      frameText: 'Scan for Menu',
      frameColor: '#2D3436',
    },
  },
  {
    id: 'restaurant-review',
    name: 'Leave a Review',
    description: 'Encourage customers to leave reviews',
    category: 'restaurant',
    thumbnail: '⭐',
    tags: ['review', 'feedback', 'rating'],
    popularity: 88,
    settings: {
      type: 'url',
      foregroundColor: '#E17055',
      backgroundColor: '#FFFFFF',
      dotStyle: 'dots',
      cornerStyle: 'dot',
      errorCorrection: 'M',
      margin: 4,
      size: 300,
      frameStyle: 'banner-bottom',
      frameText: 'Rate Us!',
      frameColor: '#E17055',
    },
  },
  {
    id: 'cafe-wifi',
    name: 'Cafe WiFi',
    description: 'Cozy design for sharing WiFi in cafes',
    category: 'restaurant',
    thumbnail: '☕',
    tags: ['wifi', 'cafe', 'coffee'],
    popularity: 92,
    settings: {
      type: 'wifi',
      foregroundColor: '#6F4E37',
      backgroundColor: '#F5F5DC',
      dotStyle: 'classy-rounded',
      cornerStyle: 'rounded',
      errorCorrection: 'H',
      margin: 4,
      size: 300,
      frameStyle: 'banner-bottom',
      frameText: 'Free WiFi',
      frameColor: '#6F4E37',
    },
  },

  // Business Templates
  {
    id: 'business-card',
    name: 'Business Card',
    description: 'Professional design for business cards',
    category: 'business',
    thumbnail: '💼',
    tags: ['professional', 'contact', 'vcard'],
    popularity: 98,
    settings: {
      type: 'vcard',
      foregroundColor: '#1E3A5F',
      backgroundColor: '#FFFFFF',
      dotStyle: 'square',
      cornerStyle: 'square',
      errorCorrection: 'Q',
      margin: 4,
      size: 300,
    },
  },
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    description: 'Trust-inspiring corporate design',
    category: 'business',
    thumbnail: '🏢',
    tags: ['corporate', 'professional', 'formal'],
    popularity: 90,
    settings: {
      type: 'url',
      foregroundColor: '#0077B6',
      backgroundColor: '#FFFFFF',
      dotStyle: 'rounded',
      cornerStyle: 'rounded',
      errorCorrection: 'M',
      margin: 4,
      size: 300,
      gradient: {
        enabled: true,
        type: 'linear',
        colors: ['#0077B6', '#023E8A'],
        rotation: 45,
      },
    },
  },
  {
    id: 'linkedin-connect',
    name: 'LinkedIn Connect',
    description: 'Share your LinkedIn profile',
    category: 'business',
    thumbnail: '🔗',
    tags: ['linkedin', 'networking', 'social'],
    popularity: 85,
    settings: {
      type: 'url',
      foregroundColor: '#0A66C2',
      backgroundColor: '#FFFFFF',
      dotStyle: 'rounded',
      cornerStyle: 'rounded',
      errorCorrection: 'M',
      margin: 4,
      size: 300,
      frameStyle: 'banner-bottom',
      frameText: 'Connect on LinkedIn',
      frameColor: '#0A66C2',
    },
  },

  // Event Templates
  {
    id: 'event-ticket',
    name: 'Event Ticket',
    description: 'Vibrant design for event tickets',
    category: 'event',
    thumbnail: '🎫',
    tags: ['ticket', 'concert', 'festival'],
    popularity: 94,
    settings: {
      type: 'url',
      foregroundColor: '#9B59B6',
      backgroundColor: '#FFFFFF',
      dotStyle: 'dots',
      cornerStyle: 'dot',
      errorCorrection: 'H',
      margin: 4,
      size: 300,
      gradient: {
        enabled: true,
        type: 'linear',
        colors: ['#9B59B6', '#E74C3C'],
        rotation: 135,
      },
    },
  },
  {
    id: 'wedding-rsvp',
    name: 'Wedding RSVP',
    description: 'Elegant design for wedding invitations',
    category: 'event',
    thumbnail: '💒',
    tags: ['wedding', 'rsvp', 'invitation'],
    popularity: 87,
    settings: {
      type: 'url',
      foregroundColor: '#C9A86C',
      backgroundColor: '#FFFEF7',
      dotStyle: 'classy',
      cornerStyle: 'rounded',
      errorCorrection: 'M',
      margin: 4,
      size: 300,
      frameStyle: 'banner-bottom',
      frameText: 'RSVP Here',
      frameColor: '#C9A86C',
    },
  },
  {
    id: 'conference-badge',
    name: 'Conference Badge',
    description: 'Professional conference attendee badge',
    category: 'event',
    thumbnail: '🎤',
    tags: ['conference', 'badge', 'networking'],
    popularity: 82,
    settings: {
      type: 'vcard',
      foregroundColor: '#2C3E50',
      backgroundColor: '#ECF0F1',
      dotStyle: 'rounded',
      cornerStyle: 'rounded',
      errorCorrection: 'Q',
      margin: 4,
      size: 300,
    },
  },

  // Retail Templates
  {
    id: 'product-info',
    name: 'Product Info',
    description: 'Link to product details and reviews',
    category: 'retail',
    thumbnail: '📦',
    tags: ['product', 'info', 'details'],
    popularity: 89,
    settings: {
      type: 'url',
      foregroundColor: '#2D3436',
      backgroundColor: '#FFFFFF',
      dotStyle: 'rounded',
      cornerStyle: 'rounded',
      errorCorrection: 'M',
      margin: 4,
      size: 300,
      frameStyle: 'banner-bottom',
      frameText: 'Product Details',
      frameColor: '#2D3436',
    },
  },
  {
    id: 'discount-coupon',
    name: 'Discount Coupon',
    description: 'Eye-catching design for promotions',
    category: 'retail',
    thumbnail: '🏷️',
    tags: ['discount', 'sale', 'coupon'],
    popularity: 93,
    settings: {
      type: 'url',
      foregroundColor: '#E74C3C',
      backgroundColor: '#FFFFFF',
      dotStyle: 'dots',
      cornerStyle: 'dot',
      errorCorrection: 'M',
      margin: 4,
      size: 300,
      frameStyle: 'banner-bottom',
      frameText: 'SCAN FOR 20% OFF',
      frameColor: '#E74C3C',
    },
  },
  {
    id: 'loyalty-program',
    name: 'Loyalty Program',
    description: 'Join your loyalty rewards program',
    category: 'retail',
    thumbnail: '🎁',
    tags: ['loyalty', 'rewards', 'membership'],
    popularity: 86,
    settings: {
      type: 'url',
      foregroundColor: '#F39C12',
      backgroundColor: '#FFFFFF',
      dotStyle: 'classy-rounded',
      cornerStyle: 'rounded',
      errorCorrection: 'M',
      margin: 4,
      size: 300,
      gradient: {
        enabled: true,
        type: 'linear',
        colors: ['#F39C12', '#E74C3C'],
        rotation: 90,
      },
    },
  },

  // Social Media Templates
  {
    id: 'instagram-follow',
    name: 'Instagram Follow',
    description: 'Gradient design matching Instagram branding',
    category: 'social',
    thumbnail: '📸',
    tags: ['instagram', 'follow', 'social'],
    popularity: 96,
    settings: {
      type: 'url',
      foregroundColor: '#833AB4',
      backgroundColor: '#FFFFFF',
      dotStyle: 'dots',
      cornerStyle: 'dot',
      errorCorrection: 'M',
      margin: 4,
      size: 300,
      gradient: {
        enabled: true,
        type: 'radial',
        colors: ['#833AB4', '#FD1D1D', '#FCAF45'],
      },
      frameStyle: 'banner-bottom',
      frameText: 'Follow Us',
      frameColor: '#833AB4',
    },
  },
  {
    id: 'youtube-subscribe',
    name: 'YouTube Subscribe',
    description: 'Red design for YouTube channels',
    category: 'social',
    thumbnail: '▶️',
    tags: ['youtube', 'subscribe', 'video'],
    popularity: 91,
    settings: {
      type: 'url',
      foregroundColor: '#FF0000',
      backgroundColor: '#FFFFFF',
      dotStyle: 'rounded',
      cornerStyle: 'rounded',
      errorCorrection: 'M',
      margin: 4,
      size: 300,
      frameStyle: 'banner-bottom',
      frameText: 'Subscribe',
      frameColor: '#FF0000',
    },
  },
  {
    id: 'tiktok-follow',
    name: 'TikTok Follow',
    description: 'Trendy design for TikTok profiles',
    category: 'social',
    thumbnail: '🎵',
    tags: ['tiktok', 'follow', 'video'],
    popularity: 88,
    settings: {
      type: 'url',
      foregroundColor: '#000000',
      backgroundColor: '#FFFFFF',
      dotStyle: 'dots',
      cornerStyle: 'dot',
      errorCorrection: 'M',
      margin: 4,
      size: 300,
      eyeColors: {
        topLeft: '#25F4EE',
        topRight: '#FE2C55',
        bottomLeft: '#000000',
      },
    },
  },

  // Education Templates
  {
    id: 'classroom-materials',
    name: 'Classroom Materials',
    description: 'Link to educational resources',
    category: 'education',
    thumbnail: '📚',
    tags: ['classroom', 'learning', 'resources'],
    popularity: 84,
    settings: {
      type: 'url',
      foregroundColor: '#27AE60',
      backgroundColor: '#FFFFFF',
      dotStyle: 'rounded',
      cornerStyle: 'rounded',
      errorCorrection: 'M',
      margin: 4,
      size: 300,
      frameStyle: 'banner-bottom',
      frameText: 'Learning Materials',
      frameColor: '#27AE60',
    },
  },
  {
    id: 'student-id',
    name: 'Student ID',
    description: 'Clean design for student identification',
    category: 'education',
    thumbnail: '🎓',
    tags: ['student', 'id', 'school'],
    popularity: 80,
    settings: {
      type: 'vcard',
      foregroundColor: '#2C3E50',
      backgroundColor: '#FFFFFF',
      dotStyle: 'square',
      cornerStyle: 'square',
      errorCorrection: 'H',
      margin: 4,
      size: 300,
    },
  },

  // Healthcare Templates
  {
    id: 'patient-portal',
    name: 'Patient Portal',
    description: 'Access patient information securely',
    category: 'healthcare',
    thumbnail: '🏥',
    tags: ['health', 'patient', 'medical'],
    popularity: 83,
    settings: {
      type: 'url',
      foregroundColor: '#3498DB',
      backgroundColor: '#FFFFFF',
      dotStyle: 'rounded',
      cornerStyle: 'rounded',
      errorCorrection: 'H',
      margin: 4,
      size: 300,
      frameStyle: 'banner-bottom',
      frameText: 'Patient Portal',
      frameColor: '#3498DB',
    },
  },
  {
    id: 'medication-info',
    name: 'Medication Info',
    description: 'Link to medication information',
    category: 'healthcare',
    thumbnail: '💊',
    tags: ['medication', 'pharmacy', 'info'],
    popularity: 79,
    settings: {
      type: 'url',
      foregroundColor: '#1ABC9C',
      backgroundColor: '#FFFFFF',
      dotStyle: 'square',
      cornerStyle: 'square',
      errorCorrection: 'H',
      margin: 4,
      size: 300,
    },
  },

  // Real Estate Templates
  {
    id: 'property-listing',
    name: 'Property Listing',
    description: 'Link to property details and photos',
    category: 'real-estate',
    thumbnail: '🏠',
    tags: ['property', 'listing', 'home'],
    popularity: 87,
    settings: {
      type: 'url',
      foregroundColor: '#2ECC71',
      backgroundColor: '#FFFFFF',
      dotStyle: 'rounded',
      cornerStyle: 'rounded',
      errorCorrection: 'M',
      margin: 4,
      size: 300,
      frameStyle: 'banner-bottom',
      frameText: 'View Property',
      frameColor: '#2ECC71',
    },
  },
  {
    id: 'virtual-tour',
    name: 'Virtual Tour',
    description: '3D virtual tour of property',
    category: 'real-estate',
    thumbnail: '🔮',
    tags: ['tour', '3d', 'virtual'],
    popularity: 85,
    settings: {
      type: 'url',
      foregroundColor: '#9B59B6',
      backgroundColor: '#FFFFFF',
      dotStyle: 'dots',
      cornerStyle: 'dot',
      errorCorrection: 'M',
      margin: 4,
      size: 300,
      frameStyle: 'banner-bottom',
      frameText: '360° Virtual Tour',
      frameColor: '#9B59B6',
    },
  },

  // Minimal Templates
  {
    id: 'minimal-black',
    name: 'Minimal Black',
    description: 'Clean black and white design',
    category: 'minimal',
    thumbnail: '⬛',
    tags: ['minimal', 'clean', 'simple'],
    popularity: 97,
    settings: {
      type: 'url',
      foregroundColor: '#000000',
      backgroundColor: '#FFFFFF',
      dotStyle: 'square',
      cornerStyle: 'square',
      errorCorrection: 'M',
      margin: 4,
      size: 300,
    },
  },
  {
    id: 'minimal-rounded',
    name: 'Soft Minimal',
    description: 'Soft rounded minimal design',
    category: 'minimal',
    thumbnail: '⚪',
    tags: ['minimal', 'soft', 'rounded'],
    popularity: 94,
    settings: {
      type: 'url',
      foregroundColor: '#2D3436',
      backgroundColor: '#FFFFFF',
      dotStyle: 'rounded',
      cornerStyle: 'rounded',
      errorCorrection: 'M',
      margin: 4,
      size: 300,
    },
  },
  {
    id: 'minimal-dots',
    name: 'Dotted Minimal',
    description: 'Elegant dotted pattern',
    category: 'minimal',
    thumbnail: '⚫',
    tags: ['minimal', 'dots', 'elegant'],
    popularity: 90,
    settings: {
      type: 'url',
      foregroundColor: '#1A1A1A',
      backgroundColor: '#FAFAFA',
      dotStyle: 'dots',
      cornerStyle: 'dot',
      errorCorrection: 'M',
      margin: 4,
      size: 300,
    },
  },

  // Creative Templates
  {
    id: 'neon-glow',
    name: 'Neon Glow',
    description: 'Vibrant neon cyberpunk style',
    category: 'creative',
    thumbnail: '🌈',
    tags: ['neon', 'glow', 'cyberpunk'],
    popularity: 89,
    settings: {
      type: 'url',
      foregroundColor: '#00FF87',
      backgroundColor: '#1A1A2E',
      dotStyle: 'dots',
      cornerStyle: 'dot',
      errorCorrection: 'M',
      margin: 4,
      size: 300,
      gradient: {
        enabled: true,
        type: 'linear',
        colors: ['#00FF87', '#60EFFF'],
        rotation: 45,
      },
    },
  },
  {
    id: 'sunset-gradient',
    name: 'Sunset Gradient',
    description: 'Warm sunset color gradient',
    category: 'creative',
    thumbnail: '🌅',
    tags: ['sunset', 'gradient', 'warm'],
    popularity: 86,
    settings: {
      type: 'url',
      foregroundColor: '#FF6B6B',
      backgroundColor: '#FFFFFF',
      dotStyle: 'rounded',
      cornerStyle: 'rounded',
      errorCorrection: 'M',
      margin: 4,
      size: 300,
      gradient: {
        enabled: true,
        type: 'linear',
        colors: ['#FF6B6B', '#FFA500', '#FFD93D'],
        rotation: 180,
      },
    },
  },
  {
    id: 'ocean-wave',
    name: 'Ocean Wave',
    description: 'Cool ocean blue tones',
    category: 'creative',
    thumbnail: '🌊',
    tags: ['ocean', 'blue', 'wave'],
    popularity: 84,
    settings: {
      type: 'url',
      foregroundColor: '#0077B6',
      backgroundColor: '#FFFFFF',
      dotStyle: 'classy-rounded',
      cornerStyle: 'rounded',
      errorCorrection: 'M',
      margin: 4,
      size: 300,
      gradient: {
        enabled: true,
        type: 'linear',
        colors: ['#CAF0F8', '#90E0EF', '#0077B6'],
        rotation: 90,
      },
    },
  },
];

/**
 * Get all templates
 */
export function getAllTemplates(): QRTemplate[] {
  return QR_TEMPLATES;
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: TemplateCategory): QRTemplate[] {
  return QR_TEMPLATES.filter(t => t.category === category);
}

/**
 * Get popular templates
 */
export function getPopularTemplates(limit: number = 10): QRTemplate[] {
  return [...QR_TEMPLATES]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

/**
 * Search templates
 */
export function searchTemplates(query: string): QRTemplate[] {
  const lowerQuery = query.toLowerCase();
  return QR_TEMPLATES.filter(t =>
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get template by ID
 */
export function getTemplate(id: string): QRTemplate | undefined {
  return QR_TEMPLATES.find(t => t.id === id);
}

/**
 * Get all categories with template counts
 */
export function getCategoriesWithCounts(): { category: typeof TEMPLATE_CATEGORIES[0]; count: number }[] {
  return TEMPLATE_CATEGORIES.map(cat => ({
    category: cat,
    count: QR_TEMPLATES.filter(t => t.category === cat.id).length,
  }));
}

/**
 * Apply a template and return its settings
 */
export function applyTemplate(templateId: string): TemplateSettings | null {
  const template = getTemplate(templateId);
  if (!template) return null;
  return { ...template.settings };
}
