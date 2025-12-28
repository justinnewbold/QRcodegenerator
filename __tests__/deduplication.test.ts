import {
  analyzeForDuplicates,
  getDeduplicationSummary,
  type CSVRow,
} from '../lib/bulk-csv';

describe('Batch Deduplication', () => {
  describe('analyzeForDuplicates', () => {
    it('should identify unique rows', () => {
      const rows: CSVRow[] = [
        { url: 'https://a.com', name: 'A' },
        { url: 'https://b.com', name: 'B' },
        { url: 'https://c.com', name: 'C' },
      ];

      const result = analyzeForDuplicates(rows, { contentColumn: 'url' });

      expect(result.stats.totalRows).toBe(3);
      expect(result.stats.uniqueCount).toBe(3);
      expect(result.stats.duplicateCount).toBe(0);
      expect(result.uniqueRows).toHaveLength(3);
    });

    it('should identify duplicate rows', () => {
      const rows: CSVRow[] = [
        { url: 'https://a.com', name: 'A1' },
        { url: 'https://b.com', name: 'B' },
        { url: 'https://a.com', name: 'A2' },
        { url: 'https://a.com', name: 'A3' },
      ];

      const result = analyzeForDuplicates(rows, { contentColumn: 'url' });

      expect(result.stats.totalRows).toBe(4);
      expect(result.stats.uniqueCount).toBe(2);
      expect(result.stats.duplicateCount).toBe(2);
      expect(result.stats.savedGenerations).toBe(2);
    });

    it('should group duplicates correctly', () => {
      const rows: CSVRow[] = [
        { url: 'https://a.com', name: 'A1' },
        { url: 'https://a.com', name: 'A2' },
        { url: 'https://b.com', name: 'B1' },
        { url: 'https://b.com', name: 'B2' },
      ];

      const result = analyzeForDuplicates(rows, { contentColumn: 'url' });

      expect(result.duplicateGroups.size).toBe(2);
      expect(result.duplicateGroups.get('https://a.com')).toHaveLength(2);
      expect(result.duplicateGroups.get('https://b.com')).toHaveLength(2);
    });

    it('should handle case sensitivity option', () => {
      const rows: CSVRow[] = [
        { url: 'https://A.com', name: '1' },
        { url: 'https://a.com', name: '2' },
      ];

      const caseSensitive = analyzeForDuplicates(rows, {
        contentColumn: 'url',
        caseSensitive: true,
      });
      expect(caseSensitive.stats.uniqueCount).toBe(2);

      const caseInsensitive = analyzeForDuplicates(rows, {
        contentColumn: 'url',
        caseSensitive: false,
      });
      expect(caseInsensitive.stats.uniqueCount).toBe(1);
    });

    it('should handle whitespace trimming option', () => {
      const rows: CSVRow[] = [
        { url: 'https://a.com', name: '1' },
        { url: '  https://a.com  ', name: '2' },
      ];

      const withTrim = analyzeForDuplicates(rows, {
        contentColumn: 'url',
        trimWhitespace: true,
      });
      expect(withTrim.stats.uniqueCount).toBe(1);

      const withoutTrim = analyzeForDuplicates(rows, {
        contentColumn: 'url',
        trimWhitespace: false,
      });
      expect(withoutTrim.stats.uniqueCount).toBe(2);
    });

    it('should preserve first occurrence in unique rows', () => {
      const rows: CSVRow[] = [
        { url: 'https://a.com', name: 'First' },
        { url: 'https://a.com', name: 'Second' },
      ];

      const result = analyzeForDuplicates(rows, { contentColumn: 'url' });

      expect(result.uniqueRows[0].name).toBe('First');
    });

    it('should handle empty content column', () => {
      const rows: CSVRow[] = [
        { url: '', name: 'A' },
        { url: '', name: 'B' },
        { url: 'https://a.com', name: 'C' },
      ];

      const result = analyzeForDuplicates(rows, { contentColumn: 'url' });

      expect(result.stats.uniqueCount).toBe(2); // empty and https://a.com
      expect(result.stats.duplicateCount).toBe(1);
    });
  });

  describe('getDeduplicationSummary', () => {
    it('should report all unique when no duplicates', () => {
      const stats = {
        totalRows: 10,
        uniqueCount: 10,
        duplicateCount: 0,
        savedGenerations: 0,
      };

      const summary = getDeduplicationSummary(stats);
      expect(summary).toContain('All 10 entries are unique');
    });

    it('should report duplicates correctly', () => {
      const stats = {
        totalRows: 100,
        uniqueCount: 80,
        duplicateCount: 20,
        savedGenerations: 20,
      };

      const summary = getDeduplicationSummary(stats);
      expect(summary).toContain('80 unique entries');
      expect(summary).toContain('100 total');
      expect(summary).toContain('20 duplicates');
      expect(summary).toContain('20%');
    });

    it('should calculate percentage correctly', () => {
      const stats = {
        totalRows: 200,
        uniqueCount: 100,
        duplicateCount: 100,
        savedGenerations: 100,
      };

      const summary = getDeduplicationSummary(stats);
      expect(summary).toContain('50%');
    });
  });
});
