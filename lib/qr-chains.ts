/**
 * QR Code Chains System
 * Sequential QR codes for scavenger hunts, tours, and multi-step experiences
 */

export interface QRChain {
  id: string;
  name: string;
  description?: string;
  steps: ChainStep[];
  settings: ChainSettings;
  stats: ChainStats;
  createdAt: string;
  updatedAt: string;
}

export interface ChainStep {
  id: string;
  order: number;
  name: string;
  description?: string;
  content: string;
  type: string;
  hint?: string;
  clue?: string; // Clue for finding the next QR code
  completionMessage?: string;
  requiredAction?: 'scan' | 'answer' | 'location';
  answerQuestion?: string;
  correctAnswer?: string;
  locationLat?: number;
  locationLon?: number;
  locationRadius?: number;
  timeLimit?: number; // Minutes
  points?: number;
}

export interface ChainSettings {
  isPublic: boolean;
  requireSequential: boolean; // Must complete in order
  allowSkip: boolean;
  showProgress: boolean;
  enableTimer: boolean;
  enablePoints: boolean;
  completionReward?: string;
  startDate?: string;
  endDate?: string;
  maxParticipants?: number;
}

export interface ChainStats {
  totalStarts: number;
  totalCompletions: number;
  averageCompletionTime?: number; // Minutes
  stepCompletions: Record<string, number>;
}

export interface ChainProgress {
  chainId: string;
  participantId: string;
  completedSteps: string[];
  currentStep: number;
  startedAt: string;
  completedAt?: string;
  totalPoints: number;
  answers: Record<string, string>;
}

const CHAINS_KEY = 'qr-chains';
const PROGRESS_KEY = 'qr-chain-progress';

// ============================================
// Chain Management
// ============================================

/**
 * Get all chains
 */
function getAllChains(): Record<string, QRChain> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(CHAINS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Save all chains
 */
function saveAllChains(chains: Record<string, QRChain>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CHAINS_KEY, JSON.stringify(chains));
}

/**
 * Create a new chain
 */
export function createChain(
  name: string,
  description?: string,
  settings?: Partial<ChainSettings>
): QRChain {
  const chains = getAllChains();

  const chain: QRChain = {
    id: `chain-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    description,
    steps: [],
    settings: {
      isPublic: false,
      requireSequential: true,
      allowSkip: false,
      showProgress: true,
      enableTimer: false,
      enablePoints: false,
      ...settings,
    },
    stats: {
      totalStarts: 0,
      totalCompletions: 0,
      stepCompletions: {},
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  chains[chain.id] = chain;
  saveAllChains(chains);

  return chain;
}

/**
 * Get a chain by ID
 */
export function getChain(chainId: string): QRChain | null {
  const chains = getAllChains();
  return chains[chainId] || null;
}

/**
 * Update chain
 */
export function updateChain(
  chainId: string,
  updates: Partial<Pick<QRChain, 'name' | 'description' | 'settings'>>
): QRChain | null {
  const chains = getAllChains();
  if (!chains[chainId]) return null;

  chains[chainId] = {
    ...chains[chainId],
    ...updates,
    settings: {
      ...chains[chainId].settings,
      ...updates.settings,
    },
    updatedAt: new Date().toISOString(),
  };

  saveAllChains(chains);
  return chains[chainId];
}

/**
 * Delete chain
 */
export function deleteChain(chainId: string): void {
  const chains = getAllChains();
  delete chains[chainId];
  saveAllChains(chains);
}

/**
 * Get all chains list
 */
export function listChains(): QRChain[] {
  return Object.values(getAllChains());
}

// ============================================
// Step Management
// ============================================

/**
 * Add step to chain
 */
export function addStep(
  chainId: string,
  step: Omit<ChainStep, 'id' | 'order'>
): ChainStep | null {
  const chains = getAllChains();
  if (!chains[chainId]) return null;

  const newStep: ChainStep = {
    ...step,
    id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    order: chains[chainId].steps.length,
  };

  chains[chainId].steps.push(newStep);
  chains[chainId].updatedAt = new Date().toISOString();
  saveAllChains(chains);

  return newStep;
}

/**
 * Update step
 */
export function updateStep(
  chainId: string,
  stepId: string,
  updates: Partial<Omit<ChainStep, 'id' | 'order'>>
): ChainStep | null {
  const chains = getAllChains();
  if (!chains[chainId]) return null;

  const stepIndex = chains[chainId].steps.findIndex(s => s.id === stepId);
  if (stepIndex === -1) return null;

  chains[chainId].steps[stepIndex] = {
    ...chains[chainId].steps[stepIndex],
    ...updates,
  };
  chains[chainId].updatedAt = new Date().toISOString();
  saveAllChains(chains);

  return chains[chainId].steps[stepIndex];
}

/**
 * Remove step
 */
export function removeStep(chainId: string, stepId: string): void {
  const chains = getAllChains();
  if (!chains[chainId]) return;

  chains[chainId].steps = chains[chainId].steps
    .filter(s => s.id !== stepId)
    .map((s, i) => ({ ...s, order: i }));
  chains[chainId].updatedAt = new Date().toISOString();
  saveAllChains(chains);
}

/**
 * Reorder steps
 */
export function reorderSteps(chainId: string, stepIds: string[]): void {
  const chains = getAllChains();
  if (!chains[chainId]) return;

  const stepsMap = new Map(chains[chainId].steps.map(s => [s.id, s]));
  chains[chainId].steps = stepIds
    .map((id, index) => {
      const step = stepsMap.get(id);
      return step ? { ...step, order: index } : null;
    })
    .filter((s): s is ChainStep => s !== null);

  chains[chainId].updatedAt = new Date().toISOString();
  saveAllChains(chains);
}

// ============================================
// Progress Tracking
// ============================================

/**
 * Get all progress
 */
function getAllProgress(): Record<string, ChainProgress> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(PROGRESS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Save all progress
 */
function saveAllProgress(progress: Record<string, ChainProgress>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

/**
 * Get participant ID (create if not exists)
 */
function getParticipantId(): string {
  if (typeof window === 'undefined') return 'anon';

  let id = localStorage.getItem('qr-chain-participant-id');
  if (!id) {
    id = `participant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem('qr-chain-participant-id', id);
  }
  return id;
}

/**
 * Start a chain
 */
export function startChain(chainId: string): ChainProgress | null {
  const chain = getChain(chainId);
  if (!chain) return null;

  const participantId = getParticipantId();
  const progressKey = `${chainId}-${participantId}`;

  const allProgress = getAllProgress();

  // Check if already started
  if (allProgress[progressKey] && !allProgress[progressKey].completedAt) {
    return allProgress[progressKey];
  }

  // Create new progress
  const progress: ChainProgress = {
    chainId,
    participantId,
    completedSteps: [],
    currentStep: 0,
    startedAt: new Date().toISOString(),
    totalPoints: 0,
    answers: {},
  };

  allProgress[progressKey] = progress;
  saveAllProgress(allProgress);

  // Update chain stats
  const chains = getAllChains();
  if (chains[chainId]) {
    chains[chainId].stats.totalStarts++;
    saveAllChains(chains);
  }

  return progress;
}

/**
 * Get progress for current participant
 */
export function getProgress(chainId: string): ChainProgress | null {
  const participantId = getParticipantId();
  const progressKey = `${chainId}-${participantId}`;
  const allProgress = getAllProgress();
  return allProgress[progressKey] || null;
}

/**
 * Complete a step
 */
export function completeStep(
  chainId: string,
  stepId: string,
  answer?: string
): {
  success: boolean;
  points?: number;
  nextStep?: ChainStep;
  isChainComplete?: boolean;
  message?: string;
} {
  const chain = getChain(chainId);
  if (!chain) return { success: false, message: 'Chain not found' };

  const progress = getProgress(chainId);
  if (!progress) return { success: false, message: 'Chain not started' };

  const step = chain.steps.find(s => s.id === stepId);
  if (!step) return { success: false, message: 'Step not found' };

  // Check if already completed
  if (progress.completedSteps.includes(stepId)) {
    return { success: true, message: 'Step already completed' };
  }

  // Check sequential requirement
  if (chain.settings.requireSequential && step.order !== progress.currentStep) {
    if (!chain.settings.allowSkip) {
      return { success: false, message: 'Complete previous steps first' };
    }
  }

  // Check answer if required
  if (step.requiredAction === 'answer' && step.correctAnswer) {
    if (!answer || answer.toLowerCase().trim() !== step.correctAnswer.toLowerCase().trim()) {
      return { success: false, message: 'Incorrect answer' };
    }
    progress.answers[stepId] = answer;
  }

  // Mark as complete
  progress.completedSteps.push(stepId);
  progress.currentStep = Math.max(progress.currentStep, step.order + 1);

  // Add points
  const points = step.points || 0;
  progress.totalPoints += points;

  // Check if chain complete
  const isChainComplete = progress.completedSteps.length === chain.steps.length;
  if (isChainComplete) {
    progress.completedAt = new Date().toISOString();
  }

  // Save progress
  const allProgress = getAllProgress();
  const progressKey = `${chainId}-${getParticipantId()}`;
  allProgress[progressKey] = progress;
  saveAllProgress(allProgress);

  // Update chain stats
  const chains = getAllChains();
  if (chains[chainId]) {
    chains[chainId].stats.stepCompletions[stepId] =
      (chains[chainId].stats.stepCompletions[stepId] || 0) + 1;

    if (isChainComplete) {
      chains[chainId].stats.totalCompletions++;
    }

    saveAllChains(chains);
  }

  // Get next step
  const nextStep = chain.steps.find(s => s.order === step.order + 1);

  return {
    success: true,
    points,
    nextStep,
    isChainComplete,
    message: step.completionMessage,
  };
}

/**
 * Reset progress
 */
export function resetProgress(chainId: string): void {
  const participantId = getParticipantId();
  const progressKey = `${chainId}-${participantId}`;
  const allProgress = getAllProgress();
  delete allProgress[progressKey];
  saveAllProgress(allProgress);
}

/**
 * Get chain leaderboard
 */
export function getLeaderboard(chainId: string): {
  participantId: string;
  completedSteps: number;
  totalPoints: number;
  completionTime?: number;
}[] {
  const allProgress = getAllProgress();

  return Object.values(allProgress)
    .filter(p => p.chainId === chainId)
    .map(p => ({
      participantId: p.participantId,
      completedSteps: p.completedSteps.length,
      totalPoints: p.totalPoints,
      completionTime: p.completedAt
        ? (new Date(p.completedAt).getTime() - new Date(p.startedAt).getTime()) / 60000
        : undefined,
    }))
    .sort((a, b) => {
      // Sort by points, then by completion time
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      if (a.completionTime && b.completionTime) {
        return a.completionTime - b.completionTime;
      }
      return b.completedSteps - a.completedSteps;
    });
}

/**
 * Generate QR content for a step
 */
export function generateStepQRContent(chainId: string, stepId: string): string {
  return `qrchain://${chainId}/${stepId}`;
}

/**
 * Parse QR chain content
 */
export function parseChainQRContent(content: string): { chainId: string; stepId: string } | null {
  const match = content.match(/^qrchain:\/\/([^/]+)\/(.+)$/);
  if (!match) return null;
  return { chainId: match[1], stepId: match[2] };
}
