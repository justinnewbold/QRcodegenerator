// Smart QR Router - Context-aware content delivery

export interface RouterContext {
  userAgent: string
  language?: string
  country?: string
  device?: 'mobile' | 'tablet' | 'desktop'
  os?: string
  time?: Date
}

export interface RouterRule {
  id: string
  condition: 'device' | 'os' | 'country' | 'language' | 'time_range' | 'day_of_week'
  operator: 'equals' | 'contains' | 'in' | 'between'
  value: any
  destination: string
  priority: number
}

export interface SmartQRConfig {
  default Destination: string
  rules: RouterRule[]
  fallback?: string
}

export function routeRequest(context: RouterContext, config: SmartQRConfig): string {
  // Sort rules by priority (higher first)
  const sortedRules = [...config.rules].sort((a, b) => b.priority - a.priority)

  // Evaluate each rule
  for (const rule of sortedRules) {
    if (evaluateRule(rule, context)) {
      return rule.destination
    }
  }

  // Return default or fallback
  return config.fallback || config.defaultDestination
}

function evaluateRule(rule: RouterRule, context: RouterContext): boolean {
  switch (rule.condition) {
    case 'device':
      return evaluateCondition(context.device, rule.operator, rule.value)

    case 'os':
      return evaluateCondition(context.os, rule.operator, rule.value)

    case 'country':
      return evaluateCondition(context.country, rule.operator, rule.value)

    case 'language':
      const lang = context.language?.split('-')[0] // Get primary language
      return evaluateCondition(lang, rule.operator, rule.value)

    case 'time_range':
      if (!context.time) return false
      const hour = context.time.getHours()
      return rule.operator === 'between' &&
             Array.isArray(rule.value) &&
             hour >= rule.value[0] &&
             hour < rule.value[1]

    case 'day_of_week':
      if (!context.time) return false
      const day = context.time.getDay() // 0-6
      return evaluateCondition(day, rule.operator, rule.value)

    default:
      return false
  }
}

function evaluateCondition(actual: any, operator: string, expected: any): boolean {
  switch (operator) {
    case 'equals':
      return actual === expected

    case 'contains':
      return typeof actual === 'string' && actual.toLowerCase().includes(expected.toLowerCase())

    case 'in':
      return Array.isArray(expected) && expected.includes(actual)

    default:
      return false
  }
}

// Example smart router configurations

export const SMART_ROUTER_EXAMPLES = {
  // App Store Router - directs to iOS App Store or Google Play
  appStore: {
    defaultDestination: 'https://example.com/download',
    rules: [
      {
        id: '1',
        condition: 'os' as const,
        operator: 'equals' as const,
        value: 'iOS',
        destination: 'https://apps.apple.com/app/example',
        priority: 10,
      },
      {
        id: '2',
        condition: 'os' as const,
        operator: 'equals' as const,
        value: 'Android',
        destination: 'https://play.google.com/store/apps/details?id=com.example',
        priority: 10,
      },
    ],
  },

  // Regional Router - different content by country
  regional: {
    defaultDestination: 'https://example.com',
    rules: [
      {
        id: '1',
        condition: 'country' as const,
        operator: 'in' as const,
        value: ['US', 'CA'],
        destination: 'https://example.com/en-us',
        priority: 10,
      },
      {
        id: '2',
        condition: 'country' as const,
        operator: 'in' as const,
        value: ['GB', 'IE'],
        destination: 'https://example.com/en-gb',
        priority: 10,
      },
      {
        id: '3',
        condition: 'country' as const,
        operator: 'in' as const,
        value: ['FR', 'BE', 'CH'],
        destination: 'https://example.com/fr',
        priority: 10,
      },
    ],
  },

  // Time-based Router - different content by time of day
  timeBased: {
    defaultDestination: 'https://restaurant.com/menu',
    rules: [
      {
        id: '1',
        condition: 'time_range' as const,
        operator: 'between' as const,
        value: [6, 11], // 6 AM to 11 AM
        destination: 'https://restaurant.com/breakfast',
        priority: 10,
      },
      {
        id: '2',
        condition: 'time_range' as const,
        operator: 'between' as const,
        value: [11, 15], // 11 AM to 3 PM
        destination: 'https://restaurant.com/lunch',
        priority: 10,
      },
      {
        id: '3',
        condition: 'time_range' as const,
        operator: 'between' as const,
        value: [17, 22], // 5 PM to 10 PM
        destination: 'https://restaurant.com/dinner',
        priority: 10,
      },
    ],
  },

  // Device-optimized Router
  deviceOptimized: {
    defaultDestination: 'https://example.com',
    rules: [
      {
        id: '1',
        condition: 'device' as const,
        operator: 'equals' as const,
        value: 'mobile',
        destination: 'https://m.example.com',
        priority: 10,
      },
      {
        id: '2',
        condition: 'device' as const,
        operator: 'equals' as const,
        value: 'tablet',
        destination: 'https://tablet.example.com',
        priority: 9,
      },
    ],
  },
}
