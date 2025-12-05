/**
 * Tutorial & Onboarding System
 * Interactive guides for new users
 */

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string; // CSS selector to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'type' | 'scroll' | 'none';
  actionTarget?: string;
  tip?: string;
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: 'basics' | 'advanced' | 'features' | 'tips';
  estimatedTime: string;
  steps: TutorialStep[];
  prerequisites?: string[];
}

export const TUTORIALS: Tutorial[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of creating your first QR code',
    category: 'basics',
    estimatedTime: '2 min',
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to QR Code Generator!',
        description: 'This quick tutorial will show you how to create beautiful QR codes in minutes. Let\'s get started!',
        position: 'center',
        action: 'none',
      },
      {
        id: 'select-type',
        title: 'Choose QR Code Type',
        description: 'First, select what type of QR code you want to create. You can choose from URL, WiFi, vCard, and many more options.',
        targetSelector: '[data-tutorial="qr-type-selector"]',
        position: 'bottom',
        tip: 'URL is the most common type for sharing website links',
      },
      {
        id: 'enter-content',
        title: 'Enter Your Content',
        description: 'Type or paste the content for your QR code. For URLs, enter the full web address including https://',
        targetSelector: '[data-tutorial="content-input"]',
        position: 'bottom',
        action: 'type',
      },
      {
        id: 'customize-colors',
        title: 'Customize Colors',
        description: 'Make your QR code stand out by choosing custom colors. Click the color pickers to select foreground and background colors.',
        targetSelector: '[data-tutorial="color-options"]',
        position: 'left',
        tip: 'Ensure good contrast for better scannability',
      },
      {
        id: 'choose-style',
        title: 'Select a Style',
        description: 'Choose from different QR code styles like squares, dots, or rounded corners to match your brand.',
        targetSelector: '[data-tutorial="style-options"]',
        position: 'left',
      },
      {
        id: 'preview',
        title: 'Preview Your QR Code',
        description: 'Your QR code updates in real-time as you make changes. The preview shows exactly what you\'ll download.',
        targetSelector: '[data-tutorial="qr-preview"]',
        position: 'right',
      },
      {
        id: 'download',
        title: 'Download Your QR Code',
        description: 'When you\'re happy with your design, click the download button. You can choose PNG, SVG, or PDF format.',
        targetSelector: '[data-tutorial="download-button"]',
        position: 'top',
        tip: 'SVG is best for printing at any size',
      },
      {
        id: 'complete',
        title: 'You\'re All Set!',
        description: 'Congratulations! You\'ve created your first QR code. Explore more features like adding logos, frames, and gradients.',
        position: 'center',
        action: 'none',
      },
    ],
  },
  {
    id: 'advanced-styling',
    title: 'Advanced Styling',
    description: 'Learn to create professional QR codes with advanced customization',
    category: 'advanced',
    estimatedTime: '3 min',
    prerequisites: ['getting-started'],
    steps: [
      {
        id: 'intro',
        title: 'Advanced Styling Options',
        description: 'Take your QR codes to the next level with logos, gradients, and custom frames.',
        position: 'center',
      },
      {
        id: 'add-logo',
        title: 'Add a Logo',
        description: 'Upload your logo or icon to appear in the center of the QR code. The error correction will adjust automatically.',
        targetSelector: '[data-tutorial="logo-upload"]',
        position: 'left',
        tip: 'Use a simple, high-contrast logo for best results',
      },
      {
        id: 'gradients',
        title: 'Apply Gradients',
        description: 'Add eye-catching gradient effects to your QR code. Choose from linear or radial gradients.',
        targetSelector: '[data-tutorial="gradient-options"]',
        position: 'left',
      },
      {
        id: 'eye-colors',
        title: 'Customize Eye Colors',
        description: 'The three corner squares (eyes) can have different colors for a unique look.',
        targetSelector: '[data-tutorial="eye-colors"]',
        position: 'left',
      },
      {
        id: 'frames',
        title: 'Add a Frame',
        description: 'Frames add context to your QR code with customizable text like "Scan Me" or your brand name.',
        targetSelector: '[data-tutorial="frame-options"]',
        position: 'left',
      },
      {
        id: 'error-correction',
        title: 'Error Correction Level',
        description: 'Higher error correction allows the QR code to work even if partially damaged or obscured by a logo.',
        targetSelector: '[data-tutorial="error-correction"]',
        position: 'right',
        tip: 'Use "High" when adding logos',
      },
    ],
  },
  {
    id: 'wifi-sharing',
    title: 'WiFi Sharing',
    description: 'Create QR codes for easy WiFi access',
    category: 'features',
    estimatedTime: '1 min',
    steps: [
      {
        id: 'intro',
        title: 'Share WiFi Instantly',
        description: 'Create a QR code that lets guests connect to your WiFi network without typing passwords.',
        position: 'center',
      },
      {
        id: 'select-wifi',
        title: 'Select WiFi Type',
        description: 'Choose "WiFi" from the QR code type selector.',
        targetSelector: '[data-tutorial="qr-type-selector"]',
        position: 'bottom',
      },
      {
        id: 'enter-network',
        title: 'Enter Network Details',
        description: 'Fill in your network name (SSID), password, and security type (usually WPA/WPA2).',
        targetSelector: '[data-tutorial="wifi-fields"]',
        position: 'bottom',
        tip: 'The password is stored in the QR code, not on any server',
      },
      {
        id: 'hidden-network',
        title: 'Hidden Networks',
        description: 'If your network is hidden, check the "Hidden Network" option.',
        targetSelector: '[data-tutorial="hidden-network"]',
        position: 'right',
      },
      {
        id: 'download-wifi',
        title: 'Download & Share',
        description: 'Download your WiFi QR code and display it where guests can easily scan it.',
        targetSelector: '[data-tutorial="download-button"]',
        position: 'top',
        tip: 'Print and frame it near your entrance!',
      },
    ],
  },
  {
    id: 'batch-generation',
    title: 'Batch Generation',
    description: 'Create multiple QR codes at once from a CSV file',
    category: 'advanced',
    estimatedTime: '3 min',
    steps: [
      {
        id: 'intro',
        title: 'Bulk QR Code Generation',
        description: 'Need to create hundreds of QR codes? Import a CSV file and generate them all at once.',
        position: 'center',
      },
      {
        id: 'navigate',
        title: 'Go to Batch Generator',
        description: 'Click on "Batch" in the navigation to access the bulk generation tool.',
        targetSelector: '[data-tutorial="batch-nav"]',
        position: 'bottom',
      },
      {
        id: 'prepare-csv',
        title: 'Prepare Your CSV',
        description: 'Create a CSV file with columns for your data. The first row should contain headers like "url", "name", etc.',
        position: 'center',
        tip: 'Download our sample CSV template to get started',
      },
      {
        id: 'upload',
        title: 'Upload Your File',
        description: 'Drag and drop your CSV file or click to browse. The system will preview your data.',
        targetSelector: '[data-tutorial="csv-upload"]',
        position: 'bottom',
      },
      {
        id: 'configure',
        title: 'Configure Settings',
        description: 'Apply consistent styling to all QR codes or use different settings per row.',
        targetSelector: '[data-tutorial="batch-settings"]',
        position: 'left',
      },
      {
        id: 'generate',
        title: 'Generate & Download',
        description: 'Click generate to create all QR codes. They\'ll be packaged in a ZIP file for easy download.',
        targetSelector: '[data-tutorial="batch-generate"]',
        position: 'top',
      },
    ],
  },
  {
    id: 'best-practices',
    title: 'Best Practices',
    description: 'Tips for creating scannable, professional QR codes',
    category: 'tips',
    estimatedTime: '2 min',
    steps: [
      {
        id: 'intro',
        title: 'QR Code Best Practices',
        description: 'Follow these tips to ensure your QR codes are always scannable and look professional.',
        position: 'center',
      },
      {
        id: 'contrast',
        title: 'Maintain Good Contrast',
        description: 'Always use dark colors on light backgrounds. Avoid low-contrast combinations that scanners struggle with.',
        position: 'center',
        tip: 'Black on white has the best scannability',
      },
      {
        id: 'size',
        title: 'Size Matters',
        description: 'For print, use at least 2cm x 2cm (0.8" x 0.8"). For scanning from a distance, increase the size proportionally.',
        position: 'center',
        tip: 'Rule of thumb: 10:1 ratio of distance to QR code size',
      },
      {
        id: 'quiet-zone',
        title: 'Keep the Quiet Zone',
        description: 'The white space around your QR code (quiet zone) is essential. Never crop it too close.',
        position: 'center',
      },
      {
        id: 'test',
        title: 'Always Test',
        description: 'Before printing, test your QR code with multiple phones and scanning apps to ensure it works.',
        position: 'center',
        tip: 'Test in different lighting conditions too',
      },
      {
        id: 'error-correction-tips',
        title: 'Choose Error Correction Wisely',
        description: 'Use higher error correction (Q or H) when adding logos or when QR codes may get damaged.',
        position: 'center',
      },
    ],
  },
];

const STORAGE_KEY = 'qr-tutorial-progress';
const ONBOARDING_KEY = 'qr-onboarding-complete';

interface TutorialProgress {
  tutorialId: string;
  currentStep: number;
  completedAt?: string;
  startedAt: string;
}

/**
 * Get all tutorials
 */
export function getAllTutorials(): Tutorial[] {
  return TUTORIALS;
}

/**
 * Get a tutorial by ID
 */
export function getTutorial(id: string): Tutorial | undefined {
  return TUTORIALS.find(t => t.id === id);
}

/**
 * Get tutorials by category
 */
export function getTutorialsByCategory(category: Tutorial['category']): Tutorial[] {
  return TUTORIALS.filter(t => t.category === category);
}

/**
 * Get tutorial progress
 */
export function getTutorialProgress(): Record<string, TutorialProgress> {
  if (typeof window === 'undefined') return {};

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Start a tutorial
 */
export function startTutorial(tutorialId: string): TutorialProgress {
  const progress = getTutorialProgress();

  progress[tutorialId] = {
    tutorialId,
    currentStep: 0,
    startedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  return progress[tutorialId];
}

/**
 * Update tutorial progress
 */
export function updateTutorialProgress(tutorialId: string, stepIndex: number): void {
  const progress = getTutorialProgress();

  if (progress[tutorialId]) {
    progress[tutorialId].currentStep = stepIndex;

    const tutorial = getTutorial(tutorialId);
    if (tutorial && stepIndex >= tutorial.steps.length - 1) {
      progress[tutorialId].completedAt = new Date().toISOString();
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }
}

/**
 * Check if a tutorial is completed
 */
export function isTutorialCompleted(tutorialId: string): boolean {
  const progress = getTutorialProgress();
  return !!progress[tutorialId]?.completedAt;
}

/**
 * Get completed tutorials count
 */
export function getCompletedTutorialsCount(): number {
  const progress = getTutorialProgress();
  return Object.values(progress).filter(p => p.completedAt).length;
}

/**
 * Check if onboarding is complete
 */
export function isOnboardingComplete(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(ONBOARDING_KEY) === 'true';
}

/**
 * Mark onboarding as complete
 */
export function completeOnboarding(): void {
  localStorage.setItem(ONBOARDING_KEY, 'true');
}

/**
 * Reset tutorial progress
 */
export function resetTutorialProgress(tutorialId?: string): void {
  if (tutorialId) {
    const progress = getTutorialProgress();
    delete progress[tutorialId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } else {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ONBOARDING_KEY);
  }
}

/**
 * Get recommended next tutorial
 */
export function getRecommendedTutorial(): Tutorial | null {
  const progress = getTutorialProgress();

  // First, check for incomplete tutorials
  for (const tutorial of TUTORIALS) {
    const p = progress[tutorial.id];
    if (p && !p.completedAt) {
      return tutorial;
    }
  }

  // Then, find unstarted tutorials with met prerequisites
  for (const tutorial of TUTORIALS) {
    if (progress[tutorial.id]) continue;

    const prerequisitesMet = !tutorial.prerequisites ||
      tutorial.prerequisites.every(prereq => isTutorialCompleted(prereq));

    if (prerequisitesMet) {
      return tutorial;
    }
  }

  return null;
}
