"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PRESET_SIZES, type PresetSize } from "@/lib/qr-advanced-styles"
import { Download, X, Image as ImageIcon } from "lucide-react"

interface PresetExportProps {
  qrDataUrl: string;
  onClose: () => void;
}

export default function PresetExport({ qrDataUrl, onClose }: PresetExportProps) {
  const [selectedCategory, setSelectedCategory] = useState<'social' | 'print' | 'web'>('social')
  const [isExporting, setIsExporting] = useState(false)

  const exportAtSize = async (preset: PresetSize) => {
    if (!qrDataUrl) return

    setIsExporting(true)
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not get canvas context')

      canvas.width = preset.width
      canvas.height = preset.height

      // Load QR code
      const qrImage = new Image()
      await new Promise((resolve, reject) => {
        qrImage.onload = resolve
        qrImage.onerror = reject
        qrImage.src = qrDataUrl
      })

      // Center QR code if dimensions differ
      if (preset.width === preset.height) {
        ctx.drawImage(qrImage, 0, 0, preset.width, preset.height)
      } else {
        // For non-square presets, center the QR code
        const qrSize = Math.min(preset.width, preset.height)
        const offsetX = (preset.width - qrSize) / 2
        const offsetY = (preset.height - qrSize) / 2

        // Fill background
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, preset.width, preset.height)

        ctx.drawImage(qrImage, offsetX, offsetY, qrSize, qrSize)
      }

      // Download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `qrcode-${preset.name.toLowerCase().replace(/\s+/g, '-')}-${preset.width}x${preset.height}.png`
          link.click()
          URL.revokeObjectURL(url)
        }
      }, 'image/png')
    } catch (error) {
      console.error('Error exporting:', error)
      alert('Failed to export QR code')
    } finally {
      setIsExporting(false)
    }
  }

  const categoryPresets = PRESET_SIZES.filter(p => p.category === selectedCategory)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              <CardTitle>Export with Preset Sizes</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Choose from optimized sizes for social media, print, or web
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="social">Social Media</TabsTrigger>
              <TabsTrigger value="print">Print</TabsTrigger>
              <TabsTrigger value="web">Web</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedCategory} className="space-y-3 mt-4">
              {categoryPresets.map((preset, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{preset.name}</h3>
                      <span className="text-xs px-2 py-0.5 bg-muted border rounded">
                        {preset.width} × {preset.height}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{preset.description}</p>
                  </div>
                  <Button
                    onClick={() => exportAtSize(preset)}
                    disabled={isExporting}
                    size="sm"
                    className="ml-4 gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              ))}
            </TabsContent>
          </Tabs>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Tip:</strong> Social media sizes are optimized for each platform&apos;s recommended dimensions.
              Print sizes are at 300 DPI for high-quality printing. Web sizes are optimized for digital display.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
