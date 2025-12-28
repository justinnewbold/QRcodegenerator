import {
  calculateReadabilityScore,
  getReadabilitySummary,
  isLogoSettingSafe,
  type LogoAnalysis,
} from '../lib/logo-optimizer';

// Mock logo analysis for testing
const createMockAnalysis = (overrides: Partial<LogoAnalysis> = {}): LogoAnalysis => ({
  width: 200,
  height: 200,
  aspectRatio: 1,
  fileSize: 50000,
  hasTransparency: true,
  dominantColors: ['#FF0000', '#FFFFFF', '#000000'],
  complexity: 'moderate',
  recommendations: [],
  optimalSize: 0.2,
  positioning: { centered: true },
  ...overrides,
});

describe('Logo Readability', () => {
  describe('calculateReadabilityScore', () => {
    it('should return excellent score for optimal settings', () => {
      const analysis = createMockAnalysis({ complexity: 'simple' });
      const score = calculateReadabilityScore(analysis, 15, 'H');

      expect(score.score).toBeGreaterThanOrEqual(8);
      expect(score.label).toBe('Excellent');
    });

    it('should return good score for reasonable settings', () => {
      const analysis = createMockAnalysis();
      const score = calculateReadabilityScore(analysis, 20, 'M');

      expect(score.score).toBeGreaterThanOrEqual(6);
      expect(['Excellent', 'Good']).toContain(score.label);
    });

    it('should return poor score for problematic settings', () => {
      const analysis = createMockAnalysis({ complexity: 'complex' });
      const score = calculateReadabilityScore(analysis, 35, 'L');

      expect(score.score).toBeLessThan(6);
      expect(['Fair', 'Poor', 'Critical']).toContain(score.label);
    });

    it('should penalize large logo sizes', () => {
      const analysis = createMockAnalysis();
      const smallLogo = calculateReadabilityScore(analysis, 15, 'H');
      const largeLogo = calculateReadabilityScore(analysis, 30, 'H');

      expect(smallLogo.factors.logoSize).toBeGreaterThan(largeLogo.factors.logoSize);
    });

    it('should penalize complex logos', () => {
      const simple = createMockAnalysis({ complexity: 'simple' });
      const complex = createMockAnalysis({ complexity: 'complex' });

      const simpleScore = calculateReadabilityScore(simple, 20, 'M');
      const complexScore = calculateReadabilityScore(complex, 20, 'M');

      expect(simpleScore.factors.complexity).toBeGreaterThan(complexScore.factors.complexity);
    });

    it('should provide recommendations for poor settings', () => {
      const analysis = createMockAnalysis({ complexity: 'complex' });
      const score = calculateReadabilityScore(analysis, 30, 'L');

      expect(score.recommendations.length).toBeGreaterThan(0);
      expect(score.recommendations.some(r => r.includes('Reduce logo size') || r.includes('error correction'))).toBe(true);
    });

    it('should suggest optimal settings', () => {
      const analysis = createMockAnalysis();
      const score = calculateReadabilityScore(analysis, 30, 'L');

      expect(score.suggestedSettings.logoSize).toBeLessThanOrEqual(30);
      expect(['L', 'M', 'Q', 'H']).toContain(score.suggestedSettings.errorCorrectionLevel);
    });

    it('should estimate recovery percentage', () => {
      const analysis = createMockAnalysis();
      const score = calculateReadabilityScore(analysis, 20, 'H');

      expect(score.estimatedRecovery).toBeGreaterThan(0);
      expect(score.estimatedRecovery).toBeLessThanOrEqual(100);
    });

    it('should consider contrast with QR colors', () => {
      const darkLogo = createMockAnalysis({ dominantColors: ['#000000'] });
      const lightLogo = createMockAnalysis({ dominantColors: ['#FFFFFF'] });

      // Dark logo on white background should have better contrast
      const darkOnWhite = calculateReadabilityScore(darkLogo, 20, 'M', '#000000', '#FFFFFF');
      const lightOnWhite = calculateReadabilityScore(lightLogo, 20, 'M', '#000000', '#FFFFFF');

      expect(darkOnWhite.factors.contrastRatio).toBeGreaterThanOrEqual(lightOnWhite.factors.contrastRatio);
    });
  });

  describe('getReadabilitySummary', () => {
    it('should include score and label', () => {
      const analysis = createMockAnalysis();
      const score = calculateReadabilityScore(analysis, 20, 'M');
      const summary = getReadabilitySummary(score);

      expect(summary).toContain('/10');
      expect(summary).toContain(score.label);
    });

    it('should include recovery estimate', () => {
      const analysis = createMockAnalysis();
      const score = calculateReadabilityScore(analysis, 20, 'M');
      const summary = getReadabilitySummary(score);

      expect(summary).toContain('recoverable');
      expect(summary).toContain('%');
    });
  });

  describe('isLogoSettingSafe', () => {
    it('should return true for safe settings', () => {
      expect(isLogoSettingSafe(15, 'H', 'simple')).toBe(true);
      expect(isLogoSettingSafe(20, 'H', 'moderate')).toBe(true);
    });

    it('should return false for unsafe settings', () => {
      expect(isLogoSettingSafe(30, 'L', 'complex')).toBe(false);
      expect(isLogoSettingSafe(35, 'M', 'complex')).toBe(false);
    });

    it('should consider error correction level', () => {
      // Same logo size, different EC levels
      expect(isLogoSettingSafe(25, 'H', 'moderate')).toBe(true);
      expect(isLogoSettingSafe(25, 'L', 'moderate')).toBe(false);
    });

    it('should consider complexity', () => {
      // Same settings, different complexity
      expect(isLogoSettingSafe(20, 'M', 'simple')).toBe(true);
      expect(isLogoSettingSafe(20, 'M', 'complex')).toBe(false);
    });

    it('should use moderate as default complexity', () => {
      const withDefault = isLogoSettingSafe(20, 'Q');
      const withExplicit = isLogoSettingSafe(20, 'Q', 'moderate');
      expect(withDefault).toBe(withExplicit);
    });
  });
});
