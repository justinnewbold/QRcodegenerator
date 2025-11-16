import type { QRStyle, FinderPattern } from './qr-generator'

export interface BrandKit {
  id: string
  name: string
  description?: string
  createdAt: number
  updatedAt: number
  colors: {
    foreground: string
    background: string
  }
  style: QRStyle
  finderPattern: FinderPattern
  logo?: string // base64 data URL
  logoSize?: number
}

const BRAND_KITS_KEY = 'qr-brand-kits'
const MAX_KITS = 50

/**
 * Get all saved brand kits
 */
export function getBrandKits(): BrandKit[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(BRAND_KITS_KEY)
    if (!stored) return []

    const kits = JSON.parse(stored) as BrandKit[]
    return kits.sort((a, b) => b.updatedAt - a.updatedAt)
  } catch (error) {
    console.error('Error loading brand kits:', error)
    return []
  }
}

/**
 * Save a new brand kit
 */
export function saveBrandKit(kit: Omit<BrandKit, 'id' | 'createdAt' | 'updatedAt'>): BrandKit {
  if (typeof window === 'undefined') throw new Error('Not in browser')

  const kits = getBrandKits()

  const newKit: BrandKit = {
    ...kit,
    id: generateId(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  kits.unshift(newKit)

  // Limit to MAX_KITS
  if (kits.length > MAX_KITS) {
    kits.splice(MAX_KITS)
  }

  localStorage.setItem(BRAND_KITS_KEY, JSON.stringify(kits))
  return newKit
}

/**
 * Update an existing brand kit
 */
export function updateBrandKit(id: string, updates: Partial<Omit<BrandKit, 'id' | 'createdAt'>>): void {
  if (typeof window === 'undefined') return

  const kits = getBrandKits()
  const index = kits.findIndex(k => k.id === id)

  if (index !== -1) {
    kits[index] = {
      ...kits[index],
      ...updates,
      updatedAt: Date.now(),
    }
    localStorage.setItem(BRAND_KITS_KEY, JSON.stringify(kits))
  }
}

/**
 * Delete a brand kit
 */
export function deleteBrandKit(id: string): void {
  if (typeof window === 'undefined') return

  const kits = getBrandKits()
  const filtered = kits.filter(k => k.id !== id)
  localStorage.setItem(BRAND_KITS_KEY, JSON.stringify(filtered))
}

/**
 * Get a single brand kit by ID
 */
export function getBrandKitById(id: string): BrandKit | null {
  const kits = getBrandKits()
  return kits.find(k => k.id === id) || null
}

/**
 * Duplicate a brand kit
 */
export function duplicateBrandKit(id: string): BrandKit | null {
  const kit = getBrandKitById(id)
  if (!kit) return null

  return saveBrandKit({
    name: `${kit.name} (Copy)`,
    description: kit.description,
    colors: { ...kit.colors },
    style: kit.style,
    finderPattern: kit.finderPattern,
    logo: kit.logo,
    logoSize: kit.logoSize,
  })
}

/**
 * Export brand kits as JSON
 */
export function exportBrandKits(): string {
  const kits = getBrandKits()
  return JSON.stringify(kits, null, 2)
}

/**
 * Import brand kits from JSON
 */
export function importBrandKits(jsonString: string): { imported: number; skipped: number } {
  if (typeof window === 'undefined') return { imported: 0, skipped: 0 }

  try {
    const importedKits = JSON.parse(jsonString) as BrandKit[]
    if (!Array.isArray(importedKits)) {
      throw new Error('Invalid format: expected array of brand kits')
    }

    const existingKits = getBrandKits()
    const existingNames = new Set(existingKits.map(k => k.name))

    let imported = 0
    let skipped = 0

    for (const kit of importedKits) {
      // Skip if name already exists
      if (existingNames.has(kit.name)) {
        skipped++
        continue
      }

      // Import with new ID and timestamps
      saveBrandKit({
        name: kit.name,
        description: kit.description,
        colors: kit.colors,
        style: kit.style,
        finderPattern: kit.finderPattern,
        logo: kit.logo,
        logoSize: kit.logoSize,
      })

      imported++
    }

    return { imported, skipped }
  } catch (error) {
    throw new Error('Failed to import brand kits: ' + (error instanceof Error ? error.message : 'Unknown error'))
  }
}

/**
 * Get popular/default brand kit presets
 */
export function getDefaultBrandKits(): Omit<BrandKit, 'id' | 'createdAt' | 'updatedAt'>[] {
  return [
    {
      name: 'Corporate Blue',
      description: 'Professional blue color scheme',
      colors: { foreground: '#003366', background: '#ffffff' },
      style: 'squares',
      finderPattern: 'square',
    },
    {
      name: 'Eco Green',
      description: 'Natural green tones',
      colors: { foreground: '#2d5016', background: '#f0f7ed' },
      style: 'rounded',
      finderPattern: 'rounded',
    },
    {
      name: 'Modern Purple',
      description: 'Vibrant purple design',
      colors: { foreground: '#6b21a8', background: '#faf5ff' },
      style: 'dots',
      finderPattern: 'dots',
    },
    {
      name: 'Classic Black',
      description: 'Timeless black and white',
      colors: { foreground: '#000000', background: '#ffffff' },
      style: 'squares',
      finderPattern: 'square',
    },
    {
      name: 'Ocean Blue',
      description: 'Calming ocean colors',
      colors: { foreground: '#0369a1', background: '#e0f2fe' },
      style: 'extra-rounded',
      finderPattern: 'extra-rounded',
    },
  ]
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `kit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Search brand kits
 */
export function searchBrandKits(query: string): BrandKit[] {
  const kits = getBrandKits()
  const lowerQuery = query.toLowerCase()

  return kits.filter(kit =>
    kit.name.toLowerCase().includes(lowerQuery) ||
    (kit.description?.toLowerCase().includes(lowerQuery))
  )
}

/**
 * Get brand kit statistics
 */
export function getBrandKitStats() {
  const kits = getBrandKits()

  const styleCount: Record<string, number> = {}
  const patternCount: Record<string, number> = {}

  kits.forEach(kit => {
    styleCount[kit.style] = (styleCount[kit.style] || 0) + 1
    patternCount[kit.finderPattern] = (patternCount[kit.finderPattern] || 0) + 1
  })

  return {
    total: kits.length,
    withLogo: kits.filter(k => k.logo).length,
    withDescription: kits.filter(k => k.description).length,
    byStyle: styleCount,
    byPattern: patternCount,
  }
}
