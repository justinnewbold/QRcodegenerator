"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { SimpleSelect as Select } from "@/components/ui/simple-select"
import { generateQRCode, type QRStyle, type FinderPattern, type ErrorCorrectionLevel } from "@/lib/qr-generator"
import { X, Copy, Download } from "lucide-react"

interface QRComparisonProps {
  content: string;
  baseOptions: {
    errorLevel: ErrorCorrectionLevel;
    size: number;
    fgColor: string;
    bgColor: string;
    margin: number;
    logoUrl?: string;
  };
  onClose: () => void;
}

interface ComparisonSlot {
  id: number;
  style: QRStyle;
  finderPattern: FinderPattern;
  qrDataUrl: string | null;
  generating: boolean;
}

export default function QRComparison({ content, baseOptions, onClose }: QRComparisonProps) {
  const [slots, setSlots] = useState<ComparisonSlot[]>([
    { id: 1, style: 'squares', finderPattern: 'square', qrDataUrl: null, generating: false },
    { id: 2, style: 'dots', finderPattern: 'rounded', qrDataUrl: null, generating: false },
    { id: 3, style: 'rounded', finderPattern: 'dots', qrDataUrl: null, generating: false },
    { id: 4, style: 'extra-rounded', finderPattern: 'extra-rounded', qrDataUrl: null, generating: false },
  ])

  const initialGenerationDone = useRef(false);

  const generateAllComparisons = useCallback(async () => {
    const initialSlots = [
      { id: 1, style: 'squares' as QRStyle, finderPattern: 'square' as FinderPattern },
      { id: 2, style: 'dots' as QRStyle, finderPattern: 'rounded' as FinderPattern },
      { id: 3, style: 'rounded' as QRStyle, finderPattern: 'dots' as FinderPattern },
      { id: 4, style: 'extra-rounded' as QRStyle, finderPattern: 'extra-rounded' as FinderPattern },
    ];
    for (const slot of initialSlots) {
      try {
        setSlots(prev => prev.map(s =>
          s.id === slot.id ? { ...s, generating: true } : s
        ));
        const result = await generateQRCode({
          content,
          errorCorrectionLevel: baseOptions.errorLevel,
          size: baseOptions.size,
          foregroundColor: baseOptions.fgColor,
          backgroundColor: baseOptions.bgColor,
          margin: baseOptions.margin,
          logoUrl: baseOptions.logoUrl,
          style: slot.style,
          finderPattern: slot.finderPattern,
        });
        setSlots(prev => prev.map(s =>
          s.id === slot.id ? { ...s, qrDataUrl: result.dataUrl, generating: false } : s
        ));
      } catch {
        setSlots(prev => prev.map(s =>
          s.id === slot.id ? { ...s, generating: false } : s
        ));
      }
    }
  }, [content, baseOptions]);

  useEffect(() => {
    if (!initialGenerationDone.current) {
      initialGenerationDone.current = true;
      generateAllComparisons();
    }
  }, [generateAllComparisons]);

  const generateSlot = async (slotId: number) => {
    const slot = slots.find(s => s.id === slotId)
    if (!slot) return

    setSlots(prev => prev.map(s =>
      s.id === slotId ? { ...s, generating: true } : s
    ))

    try {
      const result = await generateQRCode({
        content,
        errorCorrectionLevel: baseOptions.errorLevel,
        size: baseOptions.size,
        foregroundColor: baseOptions.fgColor,
        backgroundColor: baseOptions.bgColor,
        margin: baseOptions.margin,
        logoUrl: baseOptions.logoUrl,
        style: slot.style,
        finderPattern: slot.finderPattern,
      })

      setSlots(prev => prev.map(s =>
        s.id === slotId ? { ...s, qrDataUrl: result.dataUrl, generating: false } : s
      ))
    } catch (error) {
      console.error('Error generating comparison QR:', error)
      setSlots(prev => prev.map(s =>
        s.id === slotId ? { ...s, generating: false } : s
      ))
    }
  }

  const updateSlot = (slotId: number, field: 'style' | 'finderPattern', value: any) => {
    setSlots(prev => prev.map(s =>
      s.id === slotId ? { ...s, [field]: value } : s
    ))
    setTimeout(() => generateSlot(slotId), 100)
  }

  const copyToClipboard = async (dataUrl: string) => {
    try {
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      const item = new ClipboardItem({ 'image/png': blob })
      await navigator.clipboard.write([item])
      alert('QR Code copied to clipboard!')
    } catch (error) {
      console.error('Error copying:', error)
      alert('Failed to copy. Please use download instead.')
    }
  }

  const downloadQR = (dataUrl: string, slotId: number) => {
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `qr-comparison-${slotId}-${Date.now()}.png`
    link.click()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-auto">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Side-by-Side Comparison</CardTitle>
              <CardDescription>
                Compare different QR code styles and patterns simultaneously
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {slots.map((slot) => (
              <Card key={slot.id} className="relative">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Variation {slot.id}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Preview */}
                  <div className="aspect-square bg-white rounded border flex items-center justify-center p-4">
                    {slot.generating ? (
                      <div className="text-center">
                        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p className="text-sm text-muted-foreground">Generating...</p>
                      </div>
                    ) : slot.qrDataUrl ? (
                      <img src={slot.qrDataUrl} alt={`QR ${slot.id}`} className="max-w-full" />
                    ) : (
                      <p className="text-sm text-muted-foreground">No QR code</p>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Module Style</Label>
                      <Select
                        value={slot.style}
                        onChange={(e) => updateSlot(slot.id, 'style', e.target.value as QRStyle)}
                        className="text-sm"
                      >
                        <option value="squares">Squares</option>
                        <option value="dots">Dots</option>
                        <option value="rounded">Rounded</option>
                        <option value="extra-rounded">Extra Rounded</option>
                        <option value="classy">Classy</option>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs">Finder Pattern</Label>
                      <Select
                        value={slot.finderPattern}
                        onChange={(e) => updateSlot(slot.id, 'finderPattern', e.target.value as FinderPattern)}
                        className="text-sm"
                      >
                        <option value="square">Square</option>
                        <option value="rounded">Rounded</option>
                        <option value="dots">Dots</option>
                        <option value="extra-rounded">Extra Rounded</option>
                      </Select>
                    </div>

                    {/* Actions */}
                    {slot.qrDataUrl && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(slot.qrDataUrl!)}
                          className="flex-1 gap-2"
                        >
                          <Copy className="h-3 w-3" />
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadQR(slot.qrDataUrl!, slot.id)}
                          className="flex-1 gap-2"
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Tip:</strong> All variations use the same content, colors, and settings.
              Only the module style and finder pattern differ. Click any variation to download or copy.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
