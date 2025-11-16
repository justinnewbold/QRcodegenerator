import { ErrorCorrectionLevel, QRStyle, FinderPattern, FrameStyle } from './qr-generator';

export interface QRTemplate {
  id: string;
  name: string;
  type: string;
  timestamp: number;
  options: {
    errorLevel: ErrorCorrectionLevel;
    size: number;
    fgColor: string;
    bgColor: string;
    margin: number;
    style: QRStyle;
    finderPattern: FinderPattern;
    frameStyle: FrameStyle;
    frameText?: string;
    transparentBg: boolean;
    gradientEnabled: boolean;
    gradientType?: 'linear' | 'radial';
    gradientColorStart?: string;
    gradientColorEnd?: string;
    gradientRotation?: number;
  };
  // Store some content info for display (but not the actual sensitive content)
  contentPreview?: string;
}

const TEMPLATES_KEY = 'qr_templates';
const MAX_TEMPLATES = 20;

export function saveTemplate(template: Omit<QRTemplate, 'id' | 'timestamp'>): void {
  if (typeof window === 'undefined') return;

  const templates = getTemplates();
  const newTemplate: QRTemplate = {
    ...template,
    id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
  };

  templates.unshift(newTemplate);

  // Keep only the most recent templates
  if (templates.length > MAX_TEMPLATES) {
    templates.splice(MAX_TEMPLATES);
  }

  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

export function getTemplates(): QRTemplate[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(TEMPLATES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function deleteTemplate(id: string): void {
  if (typeof window === 'undefined') return;

  const templates = getTemplates().filter(t => t.id !== id);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

export function clearTemplates(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(TEMPLATES_KEY);
}

export function getTemplateById(id: string): QRTemplate | undefined {
  return getTemplates().find(t => t.id === id);
}

export function updateTemplate(id: string, updates: Partial<QRTemplate>): void {
  if (typeof window === 'undefined') return;

  const templates = getTemplates().map(t =>
    t.id === id ? { ...t, ...updates, timestamp: Date.now() } : t
  );

  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}
