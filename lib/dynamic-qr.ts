export interface DynamicQR {
  id: string
  name: string
  shortCode: string
  currentDestination: string
  originalDestination: string
  created: number
  updated: number
  expiresAt?: number
  password?: string
  maxScans?: number
  scanCount: number
  enabled: boolean
  history: {
    timestamp: number
    destination: string
    reason?: string
  }[]
}

const DYNAMIC_QRS_KEY = 'qr-dynamic-codes'
const MAX_DYNAMIC_QRS = 100

/**
 * Get all dynamic QR codes
 */
export function getDynamicQRs(): DynamicQR[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(DYNAMIC_QRS_KEY)
    if (!stored) return []

    const qrs = JSON.parse(stored) as DynamicQR[]
    return qrs.sort((a, b) => b.updated - a.updated)
  } catch (error) {
    console.error('Error loading dynamic QRs:', error)
    return []
  }
}

/**
 * Create a new dynamic QR code
 */
export function createDynamicQR(
  name: string,
  destination: string,
  options: {
    expiresAt?: number
    password?: string
    maxScans?: number
  } = {}
): DynamicQR {
  if (typeof window === 'undefined') throw new Error('Not in browser')

  const qrs = getDynamicQRs()
  const shortCode = generateShortCode()

  const newQR: DynamicQR = {
    id: generateId(),
    name,
    shortCode,
    currentDestination: destination,
    originalDestination: destination,
    created: Date.now(),
    updated: Date.now(),
    expiresAt: options.expiresAt,
    password: options.password,
    maxScans: options.maxScans,
    scanCount: 0,
    enabled: true,
    history: [
      {
        timestamp: Date.now(),
        destination,
        reason: 'Initial creation',
      },
    ],
  }

  qrs.unshift(newQR)

  if (qrs.length > MAX_DYNAMIC_QRS) {
    qrs.splice(MAX_DYNAMIC_QRS)
  }

  localStorage.setItem(DYNAMIC_QRS_KEY, JSON.stringify(qrs))
  return newQR
}

/**
 * Update dynamic QR destination
 */
export function updateDynamicQRDestination(
  id: string,
  newDestination: string,
  reason?: string
): void {
  if (typeof window === 'undefined') return

  const qrs = getDynamicQRs()
  const index = qrs.findIndex(q => q.id === id)

  if (index !== -1) {
    qrs[index].currentDestination = newDestination
    qrs[index].updated = Date.now()
    qrs[index].history.unshift({
      timestamp: Date.now(),
      destination: newDestination,
      reason,
    })

    localStorage.setItem(DYNAMIC_QRS_KEY, JSON.stringify(qrs))
  }
}

/**
 * Toggle dynamic QR enabled state
 */
export function toggleDynamicQR(id: string): void {
  if (typeof window === 'undefined') return

  const qrs = getDynamicQRs()
  const index = qrs.findIndex(q => q.id === id)

  if (index !== -1) {
    qrs[index].enabled = !qrs[index].enabled
    qrs[index].updated = Date.now()
    localStorage.setItem(DYNAMIC_QRS_KEY, JSON.stringify(qrs))
  }
}

/**
 * Delete a dynamic QR code
 */
export function deleteDynamicQR(id: string): void {
  if (typeof window === 'undefined') return

  const qrs = getDynamicQRs()
  const filtered = qrs.filter(q => q.id !== id)
  localStorage.setItem(DYNAMIC_QRS_KEY, JSON.stringify(filtered))
}

/**
 * Get a dynamic QR by ID
 */
export function getDynamicQRById(id: string): DynamicQR | null {
  const qrs = getDynamicQRs()
  return qrs.find(q => q.id === id) || null
}

/**
 * Increment scan count
 */
export function incrementScanCount(id: string): void {
  if (typeof window === 'undefined') return

  const qrs = getDynamicQRs()
  const index = qrs.findIndex(q => q.id === id)

  if (index !== -1) {
    qrs[index].scanCount++
    localStorage.setItem(DYNAMIC_QRS_KEY, JSON.stringify(qrs))
  }
}

/**
 * Check if dynamic QR is valid
 */
export function isDynamicQRValid(qr: DynamicQR): {
  valid: boolean
  reason?: string
} {
  if (!qr.enabled) {
    return { valid: false, reason: 'QR code is disabled' }
  }

  if (qr.expiresAt && Date.now() > qr.expiresAt) {
    return { valid: false, reason: 'QR code has expired' }
  }

  if (qr.maxScans && qr.scanCount >= qr.maxScans) {
    return { valid: false, reason: 'Maximum scans reached' }
  }

  return { valid: true }
}

/**
 * Get redirect URL for a dynamic QR
 * Note: In a real implementation, this would be a backend API endpoint
 */
export function getDynamicQRRedirectURL(shortCode: string): string {
  // In a real implementation, this would point to your backend
  // For demo purposes, we'll use a data URL or placeholder
  return `https://qr.example.com/${shortCode}`
}

/**
 * Generate a short code for the dynamic QR
 */
function generateShortCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `dqr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Export dynamic QRs as JSON
 */
export function exportDynamicQRs(): string {
  const qrs = getDynamicQRs()
  return JSON.stringify(qrs, null, 2)
}

/**
 * Get statistics for dynamic QRs
 */
export function getDynamicQRStats() {
  const qrs = getDynamicQRs()

  return {
    total: qrs.length,
    enabled: qrs.filter(q => q.enabled).length,
    disabled: qrs.filter(q => !q.enabled).length,
    expired: qrs.filter(q => q.expiresAt && Date.now() > q.expiresAt).length,
    totalScans: qrs.reduce((sum, q) => sum + q.scanCount, 0),
    withPassword: qrs.filter(q => q.password).length,
    withMaxScans: qrs.filter(q => q.maxScans).length,
    avgScansPerQR: qrs.length > 0 ? Math.round(qrs.reduce((sum, q) => sum + q.scanCount, 0) / qrs.length) : 0,
  }
}
