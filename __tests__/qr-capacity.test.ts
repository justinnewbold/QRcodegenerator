import { getQRCapacityInfo } from '../hooks/use-qr-capacity';

describe('QR Capacity', () => {
  describe('getQRCapacityInfo', () => {
    it('should return ok for small content', () => {
      const info = getQRCapacityInfo('https://example.com', 'M');
      expect(info.fitsInQR).toBe(true);
      expect(info.warningLevel).toBe('ok');
      expect(info.contentSize).toBe(19);
    });

    it('should calculate correct content size', () => {
      const info = getQRCapacityInfo('Hello World', 'M');
      expect(info.contentSize).toBe(11);
    });

    it('should handle UTF-8 multi-byte characters', () => {
      const info = getQRCapacityInfo('こんにちは', 'M'); // Japanese "Hello"
      expect(info.contentSize).toBe(15); // 5 characters × 3 bytes each
    });

    it('should return warning for medium content', () => {
      // Create content that's around 70-90% of M capacity (2331 bytes)
      const content = 'x'.repeat(1800);
      const info = getQRCapacityInfo(content, 'M');
      expect(info.warningLevel).toBe('warning');
    });

    it('should return danger for large content', () => {
      // Create content that's around 90%+ of M capacity
      const content = 'x'.repeat(2100);
      const info = getQRCapacityInfo(content, 'M');
      expect(info.warningLevel).toBe('danger');
    });

    it('should return overflow for content exceeding max capacity', () => {
      const content = 'x'.repeat(3000);
      const info = getQRCapacityInfo(content, 'M');
      expect(info.fitsInQR).toBe(false);
      expect(info.warningLevel).toBe('overflow');
    });

    it('should adjust capacity based on error correction level', () => {
      const content = 'x'.repeat(1500);

      const infoL = getQRCapacityInfo(content, 'L');
      const infoH = getQRCapacityInfo(content, 'H');

      // L has more capacity than H
      expect(infoL.usagePercent).toBeLessThan(infoH.usagePercent);
    });

    it('should report correct max capacity for each level', () => {
      const info = getQRCapacityInfo('test', 'L');
      expect(info.maxCapacity).toBe(2953);

      const infoM = getQRCapacityInfo('test', 'M');
      expect(infoM.maxCapacity).toBe(2331);

      const infoQ = getQRCapacityInfo('test', 'Q');
      expect(infoQ.maxCapacity).toBe(1663);

      const infoH = getQRCapacityInfo('test', 'H');
      expect(infoH.maxCapacity).toBe(1273);
    });

    it('should calculate usage percentage correctly', () => {
      const content = 'x'.repeat(100);
      const info = getQRCapacityInfo(content, 'M');
      expect(info.usagePercent).toBeGreaterThan(0);
      expect(info.usagePercent).toBeLessThanOrEqual(100);
    });

    it('should report required version', () => {
      const smallInfo = getQRCapacityInfo('test', 'M');
      expect(smallInfo.requiredVersion).toBeLessThanOrEqual(10);

      const largeContent = 'x'.repeat(2000);
      const largeInfo = getQRCapacityInfo(largeContent, 'M');
      expect(largeInfo.requiredVersion).toBeGreaterThan(20);
    });

    it('should handle empty content', () => {
      const info = getQRCapacityInfo('', 'M');
      expect(info.contentSize).toBe(0);
      expect(info.fitsInQR).toBe(true);
      expect(info.warningLevel).toBe('ok');
    });
  });
});
