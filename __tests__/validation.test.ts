/**
 * Tests for validation utilities
 */

import {
  urlSchema,
  emailSchema,
  phoneSchema,
  wifiSchema,
  vcardSchema,
  calendarEventSchema,
  locationSchema,
  validateField,
  validateWithSchema,
  isValidUrl,
  isValidEmail,
  isValidPhone,
  sanitizeInput,
} from '../lib/validation';

describe('URL Validation', () => {
  it('should validate correct URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://example.com')).toBe(true);
    expect(isValidUrl('https://example.com/path/to/page')).toBe(true);
    expect(isValidUrl('https://example.com?query=value')).toBe(true);
  });

  it('should reject invalid URLs', () => {
    expect(isValidUrl('')).toBe(false);
    expect(isValidUrl('not-a-url')).toBe(false);
    expect(isValidUrl('ftp://example.com')).toBe(false);
    expect(isValidUrl('example.com')).toBe(false);
  });

  it('should return appropriate error messages', () => {
    const result = validateField(urlSchema, '');
    expect(result).toBe('URL is required');

    const result2 = validateField(urlSchema, 'not-a-url');
    expect(result2).toBe('Please enter a valid URL');
  });
});

describe('Email Validation', () => {
  it('should validate correct emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    expect(isValidEmail('user+tag@example.org')).toBe(true);
  });

  it('should reject invalid emails', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
  });
});

describe('Phone Validation', () => {
  it('should validate correct phone numbers', () => {
    expect(isValidPhone('1234567890')).toBe(true);
    expect(isValidPhone('+1-555-555-5555')).toBe(true);
    expect(isValidPhone('(555) 555-5555')).toBe(true);
    expect(isValidPhone('+44 20 7123 4567')).toBe(true);
  });

  it('should reject invalid phone numbers', () => {
    expect(isValidPhone('')).toBe(false);
    expect(isValidPhone('123')).toBe(false); // Too short
    expect(isValidPhone('phone-number')).toBe(false); // Contains letters
  });
});

describe('WiFi Schema Validation', () => {
  it('should validate correct WiFi configurations', () => {
    const validWifi = {
      ssid: 'MyNetwork',
      password: 'password123',
      encryption: 'WPA' as const,
    };
    const result = validateWithSchema(wifiSchema, validWifi);
    expect(result.success).toBe(true);
  });

  it('should reject invalid SSID', () => {
    const invalidWifi = {
      ssid: 'Network;Name', // Contains semicolon
      password: 'password',
      encryption: 'WPA' as const,
    };
    const result = validateWithSchema(wifiSchema, invalidWifi);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.ssid).toBeDefined();
    }
  });

  it('should reject empty SSID', () => {
    const invalidWifi = {
      ssid: '',
      password: 'password',
      encryption: 'WPA' as const,
    };
    const result = validateWithSchema(wifiSchema, invalidWifi);
    expect(result.success).toBe(false);
  });

  it('should allow empty password for open networks', () => {
    const openWifi = {
      ssid: 'OpenNetwork',
      password: '',
      encryption: 'nopass' as const,
    };
    const result = validateWithSchema(wifiSchema, openWifi);
    expect(result.success).toBe(true);
  });
});

describe('vCard Schema Validation', () => {
  it('should validate correct vCard data', () => {
    const validVcard = {
      firstName: 'John',
      lastName: 'Doe',
      organization: 'Acme Inc',
      jobTitle: 'Developer',
      phone: '+1-555-555-5555',
      email: 'john@example.com',
      website: 'https://example.com',
    };
    const result = validateWithSchema(vcardSchema, validVcard);
    expect(result.success).toBe(true);
  });

  it('should require first and last name', () => {
    const invalidVcard = {
      firstName: '',
      lastName: 'Doe',
    };
    const result = validateWithSchema(vcardSchema, invalidVcard);
    expect(result.success).toBe(false);
  });

  it('should validate birthday format', () => {
    const vcardWithBirthday = {
      firstName: 'John',
      lastName: 'Doe',
      birthday: '1990-01-15',
    };
    const result = validateWithSchema(vcardSchema, vcardWithBirthday);
    expect(result.success).toBe(true);

    const vcardWithBadBirthday = {
      firstName: 'John',
      lastName: 'Doe',
      birthday: '15/01/1990',
    };
    const result2 = validateWithSchema(vcardSchema, vcardWithBadBirthday);
    expect(result2.success).toBe(false);
  });
});

describe('Calendar Event Schema Validation', () => {
  it('should validate correct calendar events', () => {
    const validEvent = {
      title: 'Team Meeting',
      location: 'Conference Room A',
      startDate: '2024-12-25T10:00:00',
      endDate: '2024-12-25T11:00:00',
      description: 'Weekly team sync',
    };
    const result = validateWithSchema(calendarEventSchema, validEvent);
    expect(result.success).toBe(true);
  });

  it('should reject event with missing title', () => {
    const invalidEvent = {
      title: '',
      startDate: '2024-12-25T10:00:00',
      endDate: '2024-12-25T11:00:00',
    };
    const result = validateWithSchema(calendarEventSchema, invalidEvent);
    expect(result.success).toBe(false);
  });

  it('should reject event where end date is before start date', () => {
    const invalidEvent = {
      title: 'Meeting',
      startDate: '2024-12-25T11:00:00',
      endDate: '2024-12-25T10:00:00', // Before start
    };
    const result = validateWithSchema(calendarEventSchema, invalidEvent);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.endDate).toBeDefined();
    }
  });
});

describe('Location Schema Validation', () => {
  it('should validate correct coordinates', () => {
    const validLocation = {
      latitude: '37.7749',
      longitude: '-122.4194',
      label: 'San Francisco',
    };
    const result = validateWithSchema(locationSchema, validLocation);
    expect(result.success).toBe(true);
  });

  it('should reject out of range latitude', () => {
    const invalidLocation = {
      latitude: '95', // > 90
      longitude: '-122.4194',
    };
    const result = validateWithSchema(locationSchema, invalidLocation);
    expect(result.success).toBe(false);
  });

  it('should reject out of range longitude', () => {
    const invalidLocation = {
      latitude: '37.7749',
      longitude: '-200', // < -180
    };
    const result = validateWithSchema(locationSchema, invalidLocation);
    expect(result.success).toBe(false);
  });
});

describe('sanitizeInput', () => {
  it('should escape HTML special characters', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
  });

  it('should escape ampersands', () => {
    expect(sanitizeInput('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });

  it('should escape quotes', () => {
    expect(sanitizeInput("It's a \"test\"")).toBe(
      "It&#039;s a &quot;test&quot;"
    );
  });

  it('should handle empty strings', () => {
    expect(sanitizeInput('')).toBe('');
  });
});

describe('validateWithSchema', () => {
  it('should return success with data for valid input', () => {
    const result = validateWithSchema(emailSchema, 'test@example.com');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('test@example.com');
    }
  });

  it('should return errors object for invalid input', () => {
    const result = validateWithSchema(emailSchema, 'invalid');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(typeof result.errors).toBe('object');
    }
  });
});
