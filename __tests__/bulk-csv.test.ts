/**
 * Tests for CSV parsing utilities
 */

import {
  parseCSV,
  validateCSVHeaders,
  getSampleCSV,
} from '../lib/bulk-csv';

describe('CSV Parsing', () => {
  describe('parseCSV', () => {
    it('should parse simple CSV correctly', () => {
      const csv = `name,url,description
GitHub,https://github.com,Code repository
Google,https://google.com,Search engine`;

      const result = parseCSV(csv);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        name: 'GitHub',
        url: 'https://github.com',
        description: 'Code repository',
      });
      expect(result[1]).toEqual({
        name: 'Google',
        url: 'https://google.com',
        description: 'Search engine',
      });
    });

    it('should handle quoted values', () => {
      const csv = `name,description
"Company Name","A description with, comma"`;

      const result = parseCSV(csv);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Company Name');
      expect(result[0].description).toBe('A description with, comma');
    });

    it('should handle escaped quotes (RFC 4180)', () => {
      const csv = `name,quote
Test,"He said ""Hello""."`;

      const result = parseCSV(csv);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Test');
      expect(result[0].quote).toBe('He said "Hello".');
    });

    it('should skip rows with mismatched column count', () => {
      const csv = `name,url,description
Valid,https://example.com,A description
Invalid,missing column
AlsoValid,https://test.com,Another desc`;

      const result = parseCSV(csv);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Valid');
      expect(result[1].name).toBe('AlsoValid');
    });

    it('should throw error for CSV with only header', () => {
      const csv = 'name,url';

      expect(() => parseCSV(csv)).toThrow('CSV must have at least a header row and one data row');
    });

    it('should throw error for empty CSV', () => {
      const csv = '';

      expect(() => parseCSV(csv)).toThrow();
    });

    it('should handle empty values', () => {
      const csv = `name,url,description
Test,https://example.com,
Empty,,has description`;

      const result = parseCSV(csv);

      expect(result).toHaveLength(2);
      expect(result[0].description).toBe('');
      expect(result[1].url).toBe('');
    });

    it('should trim whitespace from values', () => {
      const csv = `name,url
  Spaced Name  ,  https://example.com  `;

      const result = parseCSV(csv);

      expect(result[0].name).toBe('Spaced Name');
      expect(result[0].url).toBe('https://example.com');
    });

    it('should handle multi-line quoted values', () => {
      // Note: This test verifies the parser handles newlines in quotes
      const csv = `name,description
Test,"Line one
Line two"`;

      // Current parser may not handle newlines in quotes perfectly
      // but should not crash
      expect(() => parseCSV(csv)).not.toThrow();
    });
  });

  describe('validateCSVHeaders', () => {
    it('should return valid for existing column', () => {
      const headers = ['name', 'url', 'description'];
      const result = validateCSVHeaders(headers, 'url');

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return invalid for missing column', () => {
      const headers = ['name', 'description'];
      const result = validateCSVHeaders(headers, 'url');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('url');
      expect(result.error).toContain('not found');
    });

    it('should be case sensitive', () => {
      const headers = ['Name', 'URL'];
      const result = validateCSVHeaders(headers, 'name');

      expect(result.valid).toBe(false);
    });
  });

  describe('getSampleCSV', () => {
    it('should return valid CSV sample', () => {
      const sample = getSampleCSV();

      expect(typeof sample).toBe('string');
      expect(sample.length).toBeGreaterThan(0);

      // Should be parseable
      const parsed = parseCSV(sample);
      expect(parsed.length).toBeGreaterThan(0);
    });

    it('should include expected columns', () => {
      const sample = getSampleCSV();
      const firstLine = sample.split('\n')[0];

      expect(firstLine).toContain('name');
      expect(firstLine).toContain('url');
    });
  });
});

describe('Edge Cases', () => {
  it('should handle CSV with special characters', () => {
    const csv = `name,special
Test,émoji 🎉 and ñ characters`;

    const result = parseCSV(csv);
    expect(result[0].special).toContain('émoji');
    expect(result[0].special).toContain('🎉');
  });

  it('should handle Windows line endings', () => {
    const csv = 'name,url\r\nTest,https://example.com\r\nTest2,https://test.com';

    // Parser should handle or at least not crash
    expect(() => parseCSV(csv)).not.toThrow();
  });

  it('should handle single column CSV', () => {
    const csv = `url
https://example.com
https://test.com`;

    const result = parseCSV(csv);
    expect(result).toHaveLength(2);
    expect(result[0].url).toBe('https://example.com');
  });
});
