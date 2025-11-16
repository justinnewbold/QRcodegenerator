import JSZip from 'jszip'
import { generateQRCode, type QRCodeOptions } from './qr-generator'

export interface CSVRow {
  [key: string]: string
}

export interface BulkGenerationOptions {
  qrOptions: Omit<QRCodeOptions, 'content'>
  filenameColumn?: string
  contentColumn: string
  format: 'png' | 'svg'
}

export interface BulkGenerationResult {
  total: number
  successful: number
  failed: number
  errors: { row: number; error: string }[]
}

/**
 * Parse CSV content into rows
 */
export function parseCSV(csvContent: string): CSVRow[] {
  const lines = csvContent.trim().split('\n')
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row')
  }

  // Parse header
  const headers = parseCSVLine(lines[0])

  // Parse data rows
  const rows: CSVRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length === headers.length) {
      const row: CSVRow = {}
      headers.forEach((header, index) => {
        row[header] = values[index]
      })
      rows.push(row)
    }
  }

  return rows
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

/**
 * Generate QR codes from CSV data and create a ZIP file
 */
export async function generateBulkQRCodes(
  rows: CSVRow[],
  options: BulkGenerationOptions,
  onProgress?: (current: number, total: number) => void
): Promise<{ zipBlob: Blob; result: BulkGenerationResult }> {
  const zip = new JSZip()
  const result: BulkGenerationResult = {
    total: rows.length,
    successful: 0,
    failed: 0,
    errors: [],
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]

    try {
      // Get content from specified column
      const content = row[options.contentColumn]
      if (!content) {
        throw new Error(`Missing content in column "${options.contentColumn}"`)
      }

      // Generate QR code
      const qrDataUrl = await generateQRCode({
        ...options.qrOptions,
        content,
      })

      // Determine filename
      let filename = options.filenameColumn && row[options.filenameColumn]
        ? row[options.filenameColumn]
        : `qr_${i + 1}`

      // Clean filename
      filename = filename.replace(/[^a-z0-9_-]/gi, '_')

      // Add to ZIP
      if (options.format === 'png') {
        // Convert data URL to blob
        const base64Data = qrDataUrl.dataUrl.split(',')[1]
        zip.file(`${filename}.png`, base64Data, { base64: true })
      } else {
        // For SVG, we'd need to convert - for now use PNG
        const base64Data = qrDataUrl.dataUrl.split(',')[1]
        zip.file(`${filename}.png`, base64Data, { base64: true })
      }

      result.successful++
    } catch (error) {
      result.failed++
      result.errors.push({
        row: i + 1,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }

    // Report progress
    if (onProgress) {
      onProgress(i + 1, rows.length)
    }
  }

  // Generate ZIP blob
  const zipBlob = await zip.generateAsync({ type: 'blob' })

  return { zipBlob, result }
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Validate CSV headers
 */
export function validateCSVHeaders(
  headers: string[],
  requiredColumn: string
): { valid: boolean; error?: string } {
  if (!headers.includes(requiredColumn)) {
    return {
      valid: false,
      error: `Required column "${requiredColumn}" not found in CSV headers`,
    }
  }
  return { valid: true }
}

/**
 * Get sample CSV template
 */
export function getSampleCSV(): string {
  return `name,url,description
GitHub,https://github.com,Code repository
Google,https://google.com,Search engine
Twitter,https://twitter.com,Social media`
}
