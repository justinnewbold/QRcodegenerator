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
 * Parse a single CSV line, handling quoted values and escaped quotes
 * Per RFC 4180: double quotes inside quoted fields are escaped by doubling them
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote (two consecutive quotes inside quoted field = literal quote)
        current += '"'
        i++ // Skip the next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes
      }
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
        // SVG format - use the SVG string from the result
        zip.file(`${filename}.svg`, qrDataUrl.svg)
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

// ============================================
// Batch Deduplication System
// ============================================

export interface DeduplicationResult {
  uniqueRows: CSVRow[];
  duplicateGroups: Map<string, CSVRow[]>;
  stats: {
    totalRows: number;
    uniqueCount: number;
    duplicateCount: number;
    savedGenerations: number;
  };
}

export interface DeduplicationOptions {
  contentColumn: string;
  caseSensitive?: boolean;
  trimWhitespace?: boolean;
}

/**
 * Analyze CSV rows for duplicates before generation
 */
export function analyzeForDuplicates(
  rows: CSVRow[],
  options: DeduplicationOptions
): DeduplicationResult {
  const { contentColumn, caseSensitive = true, trimWhitespace = true } = options;

  const contentMap = new Map<string, CSVRow[]>();

  for (const row of rows) {
    let content = row[contentColumn] || '';

    if (trimWhitespace) {
      content = content.trim();
    }
    if (!caseSensitive) {
      content = content.toLowerCase();
    }

    if (!contentMap.has(content)) {
      contentMap.set(content, []);
    }
    contentMap.get(content)!.push(row);
  }

  const uniqueRows: CSVRow[] = [];
  const duplicateGroups = new Map<string, CSVRow[]>();
  let duplicateCount = 0;

  Array.from(contentMap.entries()).forEach(([content, group]) => {
    // Take the first row as the unique representative
    uniqueRows.push(group[0]);

    if (group.length > 1) {
      duplicateGroups.set(content, group);
      duplicateCount += group.length - 1;
    }
  });

  return {
    uniqueRows,
    duplicateGroups,
    stats: {
      totalRows: rows.length,
      uniqueCount: uniqueRows.length,
      duplicateCount,
      savedGenerations: duplicateCount,
    },
  };
}

/**
 * Generate QR codes with deduplication support
 */
export async function generateBulkQRCodesWithDeduplication(
  rows: CSVRow[],
  options: BulkGenerationOptions & { deduplicate?: boolean },
  onProgress?: (current: number, total: number, phase: 'analyzing' | 'generating') => void
): Promise<{
  zipBlob: Blob;
  result: BulkGenerationResult;
  deduplication?: DeduplicationResult;
}> {
  const { deduplicate = true, ...bulkOptions } = options;

  if (!deduplicate) {
    const { zipBlob, result } = await generateBulkQRCodes(
      rows,
      bulkOptions,
      (current, total) => onProgress?.(current, total, 'generating')
    );
    return { zipBlob, result };
  }

  // Analyze for duplicates
  onProgress?.(0, rows.length, 'analyzing');
  const deduplication = analyzeForDuplicates(rows, {
    contentColumn: bulkOptions.contentColumn,
  });

  // Generate only unique QR codes
  const zip = new JSZip();
  const result: BulkGenerationResult = {
    total: rows.length,
    successful: 0,
    failed: 0,
    errors: [],
  };

  // Map to store generated QR codes by content
  const generatedQRs = new Map<string, { dataUrl: string; svg: string }>();

  // Generate unique QR codes
  for (let i = 0; i < deduplication.uniqueRows.length; i++) {
    const row = deduplication.uniqueRows[i];

    try {
      const content = row[bulkOptions.contentColumn];
      if (!content) {
        throw new Error(`Missing content in column "${bulkOptions.contentColumn}"`);
      }

      const qrDataUrl = await generateQRCode({
        ...bulkOptions.qrOptions,
        content,
      });

      generatedQRs.set(content.trim(), qrDataUrl);
    } catch (error) {
      result.failed++;
      result.errors.push({
        row: i + 1,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    onProgress?.(i + 1, deduplication.uniqueRows.length, 'generating');
  }

  // Add all files to ZIP (including duplicates pointing to same QR)
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const content = (row[bulkOptions.contentColumn] || '').trim();
    const qrData = generatedQRs.get(content);

    if (qrData) {
      let filename = bulkOptions.filenameColumn && row[bulkOptions.filenameColumn]
        ? row[bulkOptions.filenameColumn]
        : `qr_${i + 1}`;

      filename = filename.replace(/[^a-z0-9_-]/gi, '_');

      if (bulkOptions.format === 'png') {
        const base64Data = qrData.dataUrl.split(',')[1];
        zip.file(`${filename}.png`, base64Data, { base64: true });
      } else {
        zip.file(`${filename}.svg`, qrData.svg);
      }

      result.successful++;
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });

  return { zipBlob, result, deduplication };
}

/**
 * Get deduplication summary text
 */
export function getDeduplicationSummary(stats: DeduplicationResult['stats']): string {
  if (stats.duplicateCount === 0) {
    return `All ${stats.totalRows} entries are unique.`;
  }

  const percent = Math.round((stats.savedGenerations / stats.totalRows) * 100);
  return `Found ${stats.uniqueCount} unique entries out of ${stats.totalRows} total. ` +
    `${stats.duplicateCount} duplicates detected. ` +
    `Saving ${stats.savedGenerations} redundant QR generations (${percent}% reduction).`;
}
