"use client"

import { Card } from "./ui/card"
import { Alert, AlertDescription } from "./ui/alert"
import { Lightbulb, AlertTriangle, CheckCircle, Info } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Suggestion {
  type: 'tip' | 'warning' | 'success' | 'info'
  message: string
}

interface SmartSuggestionsProps {
  qrType: string
  hasLogo?: boolean
  errorLevel?: string
  size?: number
  contentLength?: number
}

export function SmartSuggestions({
  qrType,
  hasLogo,
  errorLevel,
  size,
  contentLength = 0
}: SmartSuggestionsProps) {
  const suggestions: Suggestion[] = []

  // Logo-based suggestions
  if (hasLogo && errorLevel && errorLevel !== 'H') {
    suggestions.push({
      type: 'warning',
      message: 'Consider using error correction level H (High) when adding a logo to ensure better readability.'
    })
  }

  // WiFi-specific suggestions
  if (qrType === 'wifi') {
    suggestions.push({
      type: 'tip',
      message: 'Most people add a visible password hint or print "Scan for WiFi" near their WiFi QR codes.'
    })
  }

  // vCard suggestions
  if (qrType === 'vcard') {
    suggestions.push({
      type: 'tip',
      message: 'Business cards often include a logo in the QR code center for branding.'
    })
  }

  // Content length warnings
  if (contentLength > 500) {
    suggestions.push({
      type: 'warning',
      message: 'Large amount of data detected. The QR code may become complex and harder to scan. Consider using a URL shortener.'
    })
  }

  // Size recommendations
  if (size && size < 200) {
    suggestions.push({
      type: 'info',
      message: 'For print materials, we recommend a minimum size of 300x300 pixels for optimal scanning.'
    })
  }

  // URL shortener suggestion
  if (qrType === 'url' && contentLength > 100) {
    suggestions.push({
      type: 'tip',
      message: 'Long URLs create complex QR codes. Consider using a URL shortener (bit.ly, tinyurl.com) for simpler codes.'
    })
  }

  // Email suggestions
  if (qrType === 'email') {
    suggestions.push({
      type: 'tip',
      message: 'Pre-fill the subject line to help users send more relevant emails.'
    })
  }

  // Location suggestions
  if (qrType === 'location') {
    suggestions.push({
      type: 'success',
      message: 'Location QR codes work great for event venues, store locations, and tourist attractions!'
    })
  }

  if (suggestions.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Lightbulb className="h-4 w-4 text-primary" />
        <span>Smart Suggestions</span>
      </div>

      <AnimatePresence>
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.type === 'warning' ? AlertTriangle :
                      suggestion.type === 'success' ? CheckCircle :
                      suggestion.type === 'info' ? Info : Lightbulb

          const bgClass = suggestion.type === 'warning' ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800' :
                         suggestion.type === 'success' ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' :
                         suggestion.type === 'info' ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' :
                         'bg-primary/5 border-primary/20'

          const iconClass = suggestion.type === 'warning' ? 'text-amber-600 dark:text-amber-400' :
                           suggestion.type === 'success' ? 'text-green-600 dark:text-green-400' :
                           suggestion.type === 'info' ? 'text-blue-600 dark:text-blue-400' :
                           'text-primary'

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`p-3 rounded-lg border ${bgClass}`}>
                <div className="flex items-start gap-2">
                  <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${iconClass}`} />
                  <p className="text-sm text-foreground/90">{suggestion.message}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
