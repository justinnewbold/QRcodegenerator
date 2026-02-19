/**
 * Tests for QR generator string functions
 */

import {
  generateWiFiString,
  generateVCardString,
  generateEmailString,
  generateSMSString,
  generatePhoneString,
  generateCalendarString,
  generateCryptoString,
  generateAppStoreString,
  generateSocialMediaString,
} from '../lib/qr-generator';

describe('generateWiFiString', () => {
  it('should generate basic WPA WiFi string', () => {
    const result = generateWiFiString('MyNetwork', 'mypassword', 'WPA');
    expect(result).toBe('WIFI:T:WPA;S:MyNetwork;P:mypassword;;');
  });

  it('should generate WEP WiFi string', () => {
    const result = generateWiFiString('TestNet', 'wepkey', 'WEP');
    expect(result).toBe('WIFI:T:WEP;S:TestNet;P:wepkey;;');
  });

  it('should generate open WiFi string', () => {
    const result = generateWiFiString('OpenNet', '', 'nopass');
    expect(result).toBe('WIFI:T:nopass;S:OpenNet;P:;;');
  });

  it('should escape special characters in SSID', () => {
    const result = generateWiFiString('My;Network', 'pass', 'WPA');
    expect(result).toContain('S:My\\;Network');
  });

  it('should escape special characters in password', () => {
    const result = generateWiFiString('Net', 'p;a:s\\s', 'WPA');
    expect(result).toContain('P:p\\;a\\:s\\\\s');
  });
});

describe('generateVCardString', () => {
  it('should generate minimal vCard', () => {
    const result = generateVCardString({
      firstName: 'John',
      lastName: 'Doe',
    });
    expect(result).toContain('BEGIN:VCARD');
    expect(result).toContain('VERSION:3.0');
    expect(result).toContain('N:Doe;John;;;');
    expect(result).toContain('FN:John Doe');
    expect(result).toContain('END:VCARD');
  });

  it('should include all optional fields', () => {
    const result = generateVCardString({
      firstName: 'Jane',
      lastName: 'Smith',
      organization: 'Acme Corp',
      jobTitle: 'Engineer',
      phone: '+1234567890',
      email: 'jane@acme.com',
      website: 'https://acme.com',
      address: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      zip: '62701',
      country: 'US',
      birthday: '1990-01-15',
      note: 'A note',
    });
    expect(result).toContain('ORG:Acme Corp');
    expect(result).toContain('TITLE:Engineer');
    expect(result).toContain('TEL:+1234567890');
    expect(result).toContain('EMAIL:jane@acme.com');
    expect(result).toContain('URL:https://acme.com');
    expect(result).toContain('ADR:;;123 Main St;Springfield;IL;62701;US');
    expect(result).toContain('BDAY:1990-01-15');
    expect(result).toContain('NOTE:A note');
  });

  it('should escape special characters in vCard values', () => {
    const result = generateVCardString({
      firstName: 'John',
      lastName: 'Doe',
      note: 'Line1\nLine2; with semicolons, and commas',
    });
    expect(result).toContain('NOTE:Line1\\nLine2\\; with semicolons\\, and commas');
  });

  it('should strip @ from Twitter handle', () => {
    const result = generateVCardString({
      firstName: 'John',
      lastName: 'Doe',
      twitter: '@johndoe',
    });
    expect(result).toContain('https://twitter.com/johndoe');
    expect(result).not.toContain('@@');
  });

  it('should strip all @ symbols from Instagram handle', () => {
    const result = generateVCardString({
      firstName: 'John',
      lastName: 'Doe',
      instagram: '@@double_at',
    });
    expect(result).toContain('https://instagram.com/double_at');
  });

  it('should use full URL for LinkedIn if provided', () => {
    const result = generateVCardString({
      firstName: 'John',
      lastName: 'Doe',
      linkedin: 'https://linkedin.com/in/custom-url',
    });
    expect(result).toContain('X-SOCIALPROFILE;TYPE=linkedin:https://linkedin.com/in/custom-url');
  });

  it('should build LinkedIn URL from username', () => {
    const result = generateVCardString({
      firstName: 'John',
      lastName: 'Doe',
      linkedin: 'johndoe',
    });
    expect(result).toContain('X-SOCIALPROFILE;TYPE=linkedin:https://linkedin.com/in/johndoe');
  });
});

describe('generateEmailString', () => {
  it('should generate basic mailto string', () => {
    const result = generateEmailString('user@example.com');
    expect(result).toBe('mailto:user@example.com');
  });

  it('should include subject', () => {
    const result = generateEmailString('user@example.com', 'Hello World');
    expect(result).toBe('mailto:user@example.com?subject=Hello%20World');
  });

  it('should include subject and body', () => {
    const result = generateEmailString('user@example.com', 'Hi', 'Body text');
    expect(result).toBe('mailto:user@example.com?subject=Hi&body=Body%20text');
  });

  it('should encode special characters', () => {
    const result = generateEmailString('user@example.com', 'Q&A', 'Hello & goodbye');
    expect(result).toContain('subject=Q%26A');
    expect(result).toContain('body=Hello%20%26%20goodbye');
  });
});

describe('generateSMSString', () => {
  it('should generate basic SMS string', () => {
    const result = generateSMSString('+1234567890');
    expect(result).toBe('sms:+1234567890');
  });

  it('should include message body', () => {
    const result = generateSMSString('+1234567890', 'Hello!');
    expect(result).toBe('sms:+1234567890?body=Hello!');
  });
});

describe('generatePhoneString', () => {
  it('should generate tel: string', () => {
    const result = generatePhoneString('+1234567890');
    expect(result).toBe('tel:+1234567890');
  });
});

describe('generateCalendarString', () => {
  it('should generate basic calendar event', () => {
    const result = generateCalendarString({
      title: 'Meeting',
      startDate: '2024-01-15T10:00:00Z',
      endDate: '2024-01-15T11:00:00Z',
    });
    expect(result).toContain('BEGIN:VCALENDAR');
    expect(result).toContain('VERSION:2.0');
    expect(result).toContain('SUMMARY:Meeting');
    expect(result).toContain('DTSTART:20240115T100000Z');
    expect(result).toContain('DTEND:20240115T110000Z');
    expect(result).toContain('END:VEVENT');
    expect(result).toContain('END:VCALENDAR');
  });

  it('should include location and description', () => {
    const result = generateCalendarString({
      title: 'Party',
      startDate: '2024-06-01T18:00:00Z',
      endDate: '2024-06-01T23:00:00Z',
      location: 'Central Park',
      description: 'A fun party',
    });
    expect(result).toContain('LOCATION:Central Park');
    expect(result).toContain('DESCRIPTION:A fun party');
  });

  it('should escape special characters', () => {
    const result = generateCalendarString({
      title: 'Meeting; Important, Yes',
      startDate: '2024-01-15T10:00:00Z',
      endDate: '2024-01-15T11:00:00Z',
    });
    expect(result).toContain('SUMMARY:Meeting\\; Important\\, Yes');
  });
});

describe('generateCryptoString', () => {
  it('should format Bitcoin legacy address', () => {
    const btcAddress = '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2';
    const result = generateCryptoString(btcAddress);
    expect(result).toBe(`bitcoin:${btcAddress}`);
  });

  it('should format Bitcoin address with amount and label', () => {
    const btcAddress = '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2';
    const result = generateCryptoString(btcAddress, '0.5', 'Donation');
    expect(result).toBe(`bitcoin:${btcAddress}?amount=0.5&label=Donation`);
  });

  it('should format Ethereum address', () => {
    const ethAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD3e';
    const result = generateCryptoString(ethAddress);
    expect(result).toBe(`ethereum:${ethAddress}`);
  });

  it('should return raw address for unrecognized format', () => {
    const result = generateCryptoString('unknown-address-format');
    expect(result).toBe('unknown-address-format');
  });
});

describe('generateAppStoreString', () => {
  it('should generate iOS App Store URL', () => {
    const result = generateAppStoreString('ios', '123456789');
    expect(result).toBe('https://apps.apple.com/app/id123456789');
  });

  it('should generate Google Play Store URL', () => {
    const result = generateAppStoreString('android', 'com.example.app');
    expect(result).toBe('https://play.google.com/store/apps/details?id=com.example.app');
  });
});

describe('generateSocialMediaString', () => {
  it('should generate Twitter URL', () => {
    const result = generateSocialMediaString('twitter', '@johndoe');
    expect(result).toBe('https://twitter.com/johndoe');
  });

  it('should generate Instagram URL', () => {
    const result = generateSocialMediaString('instagram', 'johndoe');
    expect(result).toBe('https://instagram.com/johndoe');
  });

  it('should generate Facebook URL', () => {
    const result = generateSocialMediaString('facebook', 'johndoe');
    expect(result).toBe('https://facebook.com/johndoe');
  });

  it('should generate TikTok URL with @ prefix', () => {
    const result = generateSocialMediaString('tiktok', 'johndoe');
    expect(result).toBe('https://tiktok.com/@johndoe');
  });

  it('should use full URL for LinkedIn when provided', () => {
    const result = generateSocialMediaString('linkedin', 'https://linkedin.com/company/acme');
    expect(result).toBe('https://linkedin.com/company/acme');
  });

  it('should build LinkedIn URL from username', () => {
    const result = generateSocialMediaString('linkedin', 'johndoe');
    expect(result).toBe('https://linkedin.com/in/johndoe');
  });

  it('should strip all @ symbols from username', () => {
    const result = generateSocialMediaString('twitter', '@@double');
    expect(result).toBe('https://twitter.com/double');
  });
});
