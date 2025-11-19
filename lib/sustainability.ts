// Sustainability tracking for QR codes

export interface SustainabilityMetrics {
  digitalScans: number
  printedCopies: number
  co2Saved: number // in kg
  paperSaved: number // in sheets
  treesEquivalent: number
  waterSaved: number // in liters
}

// Carbon footprint constants
const CARBON_PER_PRINTED_PAGE = 0.01 // kg CO2 per printed page
const CARBON_PER_DIGITAL_SCAN = 0.0000001 // Negligible for digital
const PAPER_PER_PAGE = 1 // sheets
const TREES_PER_PAGE = 0.00001 // average
const WATER_PER_PAGE = 0.01 // liters

export function calculateSustainabilityImpact(
  digitalScans: number,
  estimatedPrintedCopies: number = 0
): SustainabilityMetrics {
  // Calculate what would have been printed without QR codes
  // Assumption: Each scan potentially saves 1 printed page
  const potentialPrintedPages = digitalScans + estimatedPrintedCopies

  // Calculate savings by going digital
  const co2Saved = potentialPrintedPages * CARBON_PER_PRINTED_PAGE
  const paperSaved = potentialPrintedPages * PAPER_PER_PAGE
  const treesEquivalent = potentialPrintedPages * TREES_PER_PAGE
  const waterSaved = potentialPrintedPages * WATER_PER_PAGE

  return {
    digitalScans,
    printedCopies: estimatedPrintedCopies,
    co2Saved,
    paperSaved,
    treesEquivalent,
    waterSaved,
  }
}

export function getSustainabilityBadge(metrics: SustainabilityMetrics): {
  level: 'bronze' | 'silver' | 'gold' | 'platinum'
  message: string
} {
  const totalScans = metrics.digitalScans

  if (totalScans >= 10000) {
    return {
      level: 'platinum',
      message: 'Eco Champion! Your digital-first approach is making a huge impact.',
    }
  } else if (totalScans >= 5000) {
    return {
      level: 'gold',
      message: 'Sustainability Leader! Keep up the great work.',
    }
  } else if (totalScans >= 1000) {
    return {
      level: 'silver',
      message: 'Eco Warrior! Your QR codes are helping the planet.',
    }
  } else {
    return {
      level: 'bronze',
      message: 'Getting Started! Every digital scan counts.',
    }
  }
}

export function formatSustainabilityReport(metrics: SustainabilityMetrics): string {
  return `
🌍 Sustainability Impact Report

📱 Digital Scans: ${metrics.digitalScans.toLocaleString()}
🖨️ Printed Copies Avoided: ${metrics.printedCopies.toLocaleString()}

Environmental Savings:
💨 CO2 Reduced: ${metrics.co2Saved.toFixed(2)} kg
📄 Paper Saved: ${metrics.paperSaved.toLocaleString()} sheets
🌳 Trees Equivalent: ${metrics.treesEquivalent.toFixed(4)}
💧 Water Saved: ${metrics.waterSaved.toFixed(2)} liters

By choosing digital QR codes, you've made a positive environmental impact!
  `.trim()
}

export const SUSTAINABILITY_TIPS = [
  {
    title: 'Use Dynamic QR Codes',
    description:
      'Dynamic QR codes can be updated without reprinting, saving paper and reducing waste.',
    impact: 'High',
  },
  {
    title: 'Digital Distribution',
    description:
      'Share QR codes digitally via email, social media, or websites instead of printing.',
    impact: 'High',
  },
  {
    title: 'Recyclable Materials',
    description: 'When printing is necessary, choose recyclable or recycled materials.',
    impact: 'Medium',
  },
  {
    title: 'Strategic Placement',
    description:
      'Place permanent QR codes in high-traffic areas to maximize scans per print.',
    impact: 'Medium',
  },
  {
    title: 'Track and Optimize',
    description:
      'Use analytics to understand which QR codes are most effective, reducing unnecessary printing.',
    impact: 'Medium',
  },
]
