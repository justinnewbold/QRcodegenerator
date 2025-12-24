"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Printer, Grid3x3 } from "lucide-react"

interface PrintLayout {
  columns: number;
  rows: number;
  spacing: number;
  showLabels: boolean;
}

interface PrintItem {
  id: string;
  qrDataUrl: string;
  label: string;
}

export default function MultiPrint() {
  const [layout, setLayout] = useState<PrintLayout>({
    columns: 3,
    rows: 4,
    spacing: 20,
    showLabels: true,
  })

  const [items, setItems] = useState<PrintItem[]>([])
  const [currentQR, setCurrentQR] = useState<string>("")
  const [currentLabel, setCurrentLabel] = useState<string>("")

  const addItemToGrid = () => {
    if (!currentQR) return

    const newItem: PrintItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      qrDataUrl: currentQR,
      label: currentLabel || `QR ${items.length + 1}`,
    }

    setItems([...items, newItem])
    setCurrentLabel("")
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const duplicateItem = (item: PrintItem) => {
    const newItem: PrintItem = {
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    }
    setItems([...items, newItem])
  }

  const openPrintView = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const pageWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const margin = 15 // mm

    const availableWidth = pageWidth - (2 * margin)
    const availableHeight = pageHeight - (2 * margin)

    const cellWidth = (availableWidth - (layout.columns - 1) * layout.spacing / 3.78) / layout.columns
    const cellHeight = (availableHeight - (layout.rows - 1) * layout.spacing / 3.78) / layout.rows

    let gridHTML = ''
    const totalCells = layout.columns * layout.rows
    const totalPages = Math.ceil(items.length / totalCells)

    for (let page = 0; page < totalPages; page++) {
      const pageItems = items.slice(page * totalCells, (page + 1) * totalCells)

      gridHTML += `
        <div class="print-page" style="page-break-after: always;">
          <div style="
            display: grid;
            grid-template-columns: repeat(${layout.columns}, 1fr);
            grid-template-rows: repeat(${layout.rows}, 1fr);
            gap: ${layout.spacing / 3.78}mm;
            width: ${availableWidth}mm;
            height: ${availableHeight}mm;
            margin: ${margin}mm;
          ">
      `

      pageItems.forEach((item) => {
        gridHTML += `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border: 1px dashed #ccc;
            padding: 5mm;
          ">
            <img src="${item.qrDataUrl}" style="
              width: 100%;
              height: auto;
              max-width: ${cellWidth - 10}mm;
              max-height: ${cellHeight - (layout.showLabels ? 20 : 10)}mm;
            " />
            ${layout.showLabels ? `<p style="
              margin-top: 2mm;
              font-size: 10pt;
              text-align: center;
              word-break: break-word;
            ">${item.label}</p>` : ''}
          </div>
        `
      })

      // Fill empty cells
      const emptyCells = totalCells - pageItems.length
      for (let i = 0; i < emptyCells; i++) {
        gridHTML += `
          <div style="
            border: 1px dashed #eee;
          "></div>
        `
      }

      gridHTML += `
          </div>
        </div>
      `
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Codes</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
            }
            @media print {
              .print-page:last-child {
                page-break-after: auto;
              }
              @page {
                size: A4;
                margin: 0;
              }
            }
            @media screen {
              body {
                background: #f0f0f0;
                padding: 20px;
              }
              .print-page {
                background: white;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                margin-bottom: 20px;
              }
            }
          </style>
        </head>
        <body>
          ${gridHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => printWindow.print(), 250)
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Multi-QR Print Layout</h1>
        <p className="text-muted-foreground">Print multiple QR codes on one page</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Print Settings</CardTitle>
            <CardDescription>Configure your print layout</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="columns">Columns: {layout.columns}</Label>
              <Slider
                id="columns"
                value={layout.columns}
                onValueChange={(val) => setLayout({ ...layout, columns: val })}
                min={1}
                max={6}
                step={1}
              />
            </div>

            <div>
              <Label htmlFor="rows">Rows: {layout.rows}</Label>
              <Slider
                id="rows"
                value={layout.rows}
                onValueChange={(val) => setLayout({ ...layout, rows: val })}
                min={1}
                max={8}
                step={1}
              />
            </div>

            <div>
              <Label htmlFor="spacing">Spacing: {layout.spacing}px</Label>
              <Slider
                id="spacing"
                value={layout.spacing}
                onValueChange={(val) => setLayout({ ...layout, spacing: val })}
                min={0}
                max={50}
                step={5}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="show-labels"
                type="checkbox"
                checked={layout.showLabels}
                onChange={(e) => setLayout({ ...layout, showLabels: e.target.checked })}
                className="cursor-pointer"
              />
              <Label htmlFor="show-labels" className="cursor-pointer">Show Labels</Label>
            </div>

            <div className="border-t pt-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                Grid: {layout.columns} × {layout.rows} = {layout.columns * layout.rows} QR codes per page
              </p>
              <p className="text-sm text-muted-foreground">
                Total items: {items.length}
              </p>
              <p className="text-sm text-muted-foreground">
                Pages needed: {Math.ceil(items.length / (layout.columns * layout.rows)) || 0}
              </p>
            </div>

            <Button
              onClick={openPrintView}
              disabled={items.length === 0}
              className="w-full gap-2"
            >
              <Printer className="h-4 w-4" />
              Print Layout
            </Button>
          </CardContent>
        </Card>

        {/* Add Items Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>QR Codes</CardTitle>
            <CardDescription>Add QR codes to your print layout</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg p-4 space-y-3 bg-muted/50">
              <div>
                <Label htmlFor="qr-data">QR Code Data URL</Label>
                <Input
                  id="qr-data"
                  placeholder="Paste QR code data URL or generate one first"
                  value={currentQR}
                  onChange={(e) => setCurrentQR(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="qr-label">Label (Optional)</Label>
                <Input
                  id="qr-label"
                  placeholder="e.g., Product Name, Table #, etc."
                  value={currentLabel}
                  onChange={(e) => setCurrentLabel(e.target.value)}
                />
              </div>
              <Button onClick={addItemToGrid} disabled={!currentQR} className="w-full">
                Add to Grid
              </Button>
              <p className="text-xs text-muted-foreground">
                Tip: Generate QR codes first, then add them to the print grid
              </p>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Grid3x3 className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>No QR codes added yet</p>
                <p className="text-sm">Add QR codes to start building your print layout</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 max-h-[500px] overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-2 space-y-2 group relative"
                  >
                    <img
                      src={item.qrDataUrl}
                      alt={item.label}
                      className="w-full h-auto rounded"
                    />
                    <p className="text-xs text-center truncate">{item.label}</p>
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => duplicateItem(item)}
                        className="h-6 w-6 p-0"
                      >
                        +
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeItem(item.id)}
                        className="h-6 w-6 p-0"
                      >
                        ×
                      </Button>
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
