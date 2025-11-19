"use client"

import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Copy, RotateCcw, Zap } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"

interface QuickActionsProps {
  qrDataUrl?: string
  onDuplicate?: () => void
  onQuickTemplate?: (template: string) => void
}

const quickTemplates = [
  { id: 'wifi', label: 'WiFi', icon: '📶' },
  { id: 'url', label: 'Website', icon: '🌐' },
  { id: 'vcard', label: 'Contact', icon: '👤' },
  { id: 'email', label: 'Email', icon: '✉️' },
]

export function QuickActions({ qrDataUrl, onDuplicate, onQuickTemplate }: QuickActionsProps) {
  const copyToClipboard = async () => {
    if (!qrDataUrl) {
      toast.error('No QR code to copy')
      return
    }

    try {
      const response = await fetch(qrDataUrl)
      const blob = await response.blob()
      const item = new ClipboardItem({ 'image/png': blob })
      await navigator.clipboard.write([item])
      toast.success('QR code copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('Failed to copy to clipboard')
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">Quick Actions</h3>
      </div>

      <div className="space-y-3">
        {/* Copy to Clipboard */}
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={copyToClipboard}
          disabled={!qrDataUrl}
        >
          <Copy className="h-4 w-4" />
          Copy QR to Clipboard
        </Button>

        {/* Duplicate Last */}
        {onDuplicate && (
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={onDuplicate}
          >
            <RotateCcw className="h-4 w-4" />
            Duplicate Last QR
          </Button>
        )}

        {/* Quick Templates */}
        {onQuickTemplate && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Quick Templates</p>
            <div className="grid grid-cols-2 gap-2">
              {quickTemplates.map((template) => (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs gap-1"
                    onClick={() => onQuickTemplate(template.id)}
                  >
                    <span>{template.icon}</span>
                    {template.label}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
