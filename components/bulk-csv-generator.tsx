"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { X, Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react"
import { parseCSV, generateBulkQRCodes, downloadBlob, getSampleCSV, type CSVRow, type BulkGenerationOptions } from "@/lib/bulk-csv"
import type { ErrorCorrectionLevel } from "@/lib/qr-generator"

interface BulkCSVGeneratorProps {
  onClose: () => void
}

export default function BulkCSVGenerator({ onClose }: BulkCSVGeneratorProps) {
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<CSVRow[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [contentColumn, setContentColumn] = useState<string>("")
  const [filenameColumn, setFilenameColumn] = useState<string>("")
  const [errorLevel, setErrorLevel] = useState<ErrorCorrectionLevel>('M')
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{ successful: number; failed: number; errors: { row: number; error: string }[] } | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setCsvFile(file)
    setResult(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        const rows = parseCSV(content)

        if (rows.length === 0) {
          alert('CSV file is empty')
          return
        }

        const csvHeaders = Object.keys(rows[0])
        setCsvData(rows)
        setHeaders(csvHeaders)

        // Auto-select first column as content if available
        if (csvHeaders.length > 0) {
          setContentColumn(csvHeaders[0])
        }
      } catch (error) {
        alert('Error parsing CSV: ' + (error instanceof Error ? error.message : 'Unknown error'))
      }
    }

    reader.readAsText(file)
  }

  const handleGenerate = async () => {
    if (!contentColumn) {
      alert('Please select a content column')
      return
    }

    setGenerating(true)
    setProgress(0)
    setResult(null)

    try {
      const options: BulkGenerationOptions = {
        qrOptions: {
          errorCorrectionLevel: errorLevel,
          size: 512,
          foregroundColor: '#000000',
          backgroundColor: '#ffffff',
          margin: 4,
        },
        contentColumn,
        filenameColumn: filenameColumn || undefined,
        format: 'png',
      }

      const { zipBlob, result: genResult } = await generateBulkQRCodes(
        csvData,
        options,
        (current, total) => {
          setProgress(Math.round((current / total) * 100))
        }
      )

      setResult(genResult)

      // Download ZIP file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      downloadBlob(zipBlob, `qr_codes_${timestamp}.zip`)
    } catch (error) {
      alert('Error generating QR codes: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setGenerating(false)
    }
  }

  const downloadSampleCSV = () => {
    const sample = getSampleCSV()
    const blob = new Blob([sample], { type: 'text/csv' })
    downloadBlob(blob, 'sample_qr_data.csv')
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-3xl my-8" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-6 w-6" />
              <CardTitle>Bulk CSV Generator</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Upload a CSV file to generate hundreds of QR codes at once
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>CSV File</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={downloadSampleCSV}
                className="text-xs"
              >
                <Download className="h-3 w-3 mr-1" />
                Download Sample
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={generating}
              />
              {csvFile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCsvFile(null)
                    setCsvData([])
                    setHeaders([])
                    setResult(null)
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Preview */}
          {csvData.length > 0 && (
            <div className="space-y-2">
              <Label>CSV Preview ({csvData.length} rows)</Label>
              <div className="border rounded-lg p-3 bg-muted/50 max-h-32 overflow-auto">
                <div className="text-xs font-mono space-y-1">
                  <div className="font-bold">
                    {headers.join(' | ')}
                  </div>
                  {csvData.slice(0, 3).map((row, idx) => (
                    <div key={idx} className="text-muted-foreground">
                      {headers.map(h => row[h]).join(' | ')}
                    </div>
                  ))}
                  {csvData.length > 3 && (
                    <div className="text-muted-foreground italic">
                      ... and {csvData.length - 3} more rows
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Column Selection */}
          {headers.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Content Column *</Label>
                <Select value={contentColumn} onValueChange={setContentColumn} disabled={generating}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {headers.map(header => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Column containing URL/text for QR codes
                </p>
              </div>

              <div className="space-y-2">
                <Label>Filename Column (Optional)</Label>
                <Select value={filenameColumn} onValueChange={setFilenameColumn} disabled={generating}>
                  <SelectTrigger>
                    <SelectValue placeholder="Auto-numbered" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Auto-numbered</SelectItem>
                    {headers.map(header => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Column to use for file names
                </p>
              </div>
            </div>
          )}

          {/* QR Options */}
          {headers.length > 0 && (
            <div className="space-y-2">
              <Label>Error Correction Level</Label>
              <Select value={errorLevel} onValueChange={(v) => setErrorLevel(v as ErrorCorrectionLevel)} disabled={generating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Low (7%)</SelectItem>
                  <SelectItem value="M">Medium (15%)</SelectItem>
                  <SelectItem value="Q">Quartile (25%)</SelectItem>
                  <SelectItem value="H">High (30%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Progress */}
          {generating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Generating QR codes...</span>
                <span className="font-mono">{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-2">
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="font-medium">
                    Successfully generated {result.successful} of {result.successful + result.failed} QR codes
                  </span>
                </div>

                {result.failed > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{result.failed} errors occurred:</span>
                    </div>
                    <div className="max-h-32 overflow-auto border rounded p-2 bg-muted/50">
                      {result.errors.map((err, idx) => (
                        <div key={idx} className="text-xs font-mono text-muted-foreground">
                          Row {err.row}: {err.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={generating}>
              Close
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={!csvData.length || !contentColumn || generating}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              {generating ? 'Generating...' : 'Generate & Download ZIP'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
