import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface QRDesignContext {
  type: string
  industry?: string
  purpose?: string
  targetAudience?: string
  brandColors?: string[]
  hasLogo?: boolean
}

export async function getSuggestions(context: QRDesignContext) {
  const prompt = `As a QR code design expert, provide specific recommendations for a QR code with the following context:

Type: ${context.type}
Industry: ${context.industry || 'General'}
Purpose: ${context.purpose || 'General use'}
Target Audience: ${context.targetAudience || 'General public'}
Brand Colors: ${context.brandColors?.join(', ') || 'None specified'}
Has Logo: ${context.hasLogo ? 'Yes' : 'No'}

Please provide:
1. Recommended error correction level (L, M, Q, or H) with reasoning
2. Suggested color palette (3-5 colors with hex codes)
3. Design tips specific to this use case
4. Optimal size recommendations
5. Placement and context suggestions

Format your response as JSON with these exact keys: errorCorrection, colorPalette (array of objects with 'name' and 'hex'), designTips (array), sizeRecommendation, placementTips (array).`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert QR code designer who provides practical, actionable advice for creating effective and scannable QR codes.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const suggestions = JSON.parse(completion.choices[0].message.content || '{}')
    return suggestions
  } catch (error) {
    console.error('AI suggestion error:', error)
    return getFallbackSuggestions(context)
  }
}

export async function analyzeScannability(qrConfig: any) {
  const issues: string[] = []
  const recommendations: string[] = []

  // Check contrast
  const fgColor = qrConfig.foregroundColor || '#000000'
  const bgColor = qrConfig.backgroundColor || '#ffffff'
  const contrast = calculateContrast(fgColor, bgColor)

  if (contrast < 4.5) {
    issues.push('Low color contrast may affect scannability')
    recommendations.push('Increase contrast between foreground and background colors')
  }

  // Check error correction vs logo
  if (qrConfig.logo && qrConfig.errorCorrectionLevel === 'L') {
    issues.push('Low error correction with logo may cause scan failures')
    recommendations.push('Use error correction level H (High) when adding a logo')
  }

  // Check size
  if (qrConfig.size < 200) {
    issues.push('QR code may be too small for reliable scanning')
    recommendations.push('Use a minimum size of 200x200 pixels for print')
  }

  // Check content length
  const contentLength = qrConfig.content?.length || 0
  if (contentLength > 500) {
    issues.push('Large amount of data may create dense, hard-to-scan QR code')
    recommendations.push('Consider using a URL shortener to reduce QR code complexity')
  }

  return {
    score: Math.max(0, 100 - issues.length * 20),
    issues,
    recommendations,
    contrast,
  }
}

function getFallbackSuggestions(context: QRDesignContext) {
  const suggestions: any = {
    errorCorrection: 'M',
    colorPalette: [
      { name: 'Primary', hex: '#000000' },
      { name: 'Background', hex: '#FFFFFF' },
    ],
    designTips: [
      'Ensure high contrast between foreground and background',
      'Leave adequate quiet zone around QR code',
      'Test scanning in various lighting conditions',
    ],
    sizeRecommendation: '300x300 pixels minimum for digital, 1-2 inches for print',
    placementTips: [
      'Place at eye level when possible',
      'Ensure good lighting in scan area',
      'Avoid curved or reflective surfaces',
    ],
  }

  if (context.hasLogo) {
    suggestions.errorCorrection = 'H'
    suggestions.designTips.push('Use high error correction (H) level with logos')
  }

  if (context.type === 'WIFI') {
    suggestions.placementTips.push('Place near entrance or reception area')
    suggestions.designTips.push('Include visible network name near QR code')
  }

  return suggestions
}

function calculateContrast(color1: string, color2: string): number {
  const l1 = getLuminance(color1)
  const l2 = getLuminance(color2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

function getLuminance(hex: string): number {
  const rgb = parseInt(hex.slice(1), 16)
  const r = ((rgb >> 16) & 0xff) / 255
  const g = ((rgb >> 8) & 0xff) / 255
  const b = (rgb & 0xff) / 255

  const [rs, gs, bs] = [r, g, b].map((c) => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}
