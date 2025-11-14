"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { generateQRCode, type QRCodeOptions, type ErrorCorrectionLevel } from "@/lib/qr-generator"
import { Download, Upload, FileSpreadsheet, Trash2, Package } from "lucide-react"

interface BatchItem {
  id: string;
  content: string;
  label?: string;
  preview?: string;
}

export default function BatchGenerator() {
  const [batchItems, setBatchItems] = useState<BatchItem[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Default QR options for batch
  const [size] = useState<number>(300)
  const [errorLevel] = useState<ErrorCorrectionLevel>("M")
  const [fgColor] = useState<string>("#000000")
  const [bgColor] = useState<string>("#ffffff")

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n').filter(line => line.trim())

      // Parse CSV (simple parser, assumes: content, label)
      const items: BatchItem[] = []
      lines.forEach((line, index) => {
        // Skip header if it exists
        if (index === 0 && (line.toLowerCase().includes('content') || line.toLowerCase().includes('url'))) {
          return
        }

        const parts = line.split(',').map(p => p.trim().replace(/['"]/g, ''))
        if (parts[0]) {
          items.push({
            id: `item-${Date.now()}-${index}`,
            content: parts[0],
            label: parts[1] || undefined,
          })
        }
      })

      setBatchItems(items)
    }

    reader.readAsText(file)
  }

  const generateBatch = async () => {
    setIsGenerating(true)
    setProgress(0)

    const updatedItems: BatchItem[] = []

    for (let i = 0; i < batchItems.length; i++) {
      const item = batchItems[i]

      try {
        const options: QRCodeOptions = {
          content: item.content,
          errorCorrectionLevel: errorLevel,
          size,
          foregroundColor: fgColor,
          backgroundColor: bgColor,
          margin: 4,
        }

        const result = await generateQRCode(options)
        updatedItems.push({
          ...item,
          preview: result.dataUrl,
        })
      } catch (error) {
        console.error(`Error generating QR for item ${i}:`, error)
        updatedItems.push(item)
      }

      setProgress(Math.round(((i + 1) / batchItems.length) * 100))
    }

    setBatchItems(updatedItems)
    setIsGenerating(false)
  }

  const downloadAll = () => {
    batchItems.forEach((item, index) => {
      if (item.preview) {
        const link = document.createElement("a")
        link.href = item.preview
        link.download = `qr-${item.label || index + 1}.png`
        link.click()
      }
    })
  }

  const downloadCSVTemplate = () => {
    const template = "content,label\nhttps://example.com,Example Label\nhttps://example2.com,Another Label"
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "qr-batch-template.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearBatch = () => {
    setBatchItems([])
    setProgress(0)
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Batch QR Code Generator</h1>
        <p className="text-muted-foreground">Generate multiple QR codes from a CSV file</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Upload CSV</CardTitle>
            <CardDescription>Upload a CSV file with your QR code data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="csv-upload">CSV File</Label>
              <Input
                id="csv-upload"
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <Button
                onClick={downloadCSVTemplate}
                variant="outline"
                className="w-full gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Download Template
              </Button>

              <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted rounded">
                <p className="font-semibold">CSV Format:</p>
                <code className="block">content,label</code>
                <code className="block">https://example.com,Label1</code>
                <code className="block">https://example2.com,Label2</code>
              </div>
            </div>

            {batchItems.length > 0 && (
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Items loaded: {batchItems.length}</span>
                  <Button
                    onClick={clearBatch}
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear
                  </Button>
                </div>

                <Button
                  onClick={generateBatch}
                  disabled={isGenerating}
                  className="w-full gap-2"
                >
                  <Package className="h-4 w-4" />
                  {isGenerating ? `Generating... ${progress}%` : "Generate All"}
                </Button>

                {batchItems.some(item => item.preview) && (
                  <Button
                    onClick={downloadAll}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download All ({batchItems.filter(i => i.preview).length})
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>Preview of generated QR codes</CardDescription>
          </CardHeader>
          <CardContent>
            {batchItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Upload className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>Upload a CSV file to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
                {batchItems.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-3 space-y-2"
                  >
                    {item.preview ? (
                      <img
                        src={item.preview}
                        alt={item.label || 'QR Code'}
                        className="w-full h-auto rounded"
                      />
                    ) : (
                      <div className="aspect-square bg-muted rounded flex items-center justify-center">
                        <Package className="h-8 w-8 opacity-20" />
                      </div>
                    )}
                    <div className="text-xs">
                      {item.label && (
                        <p className="font-semibold truncate">{item.label}</p>
                      )}
                      <p className="text-muted-foreground truncate">{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
