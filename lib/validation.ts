/**
 * Input Validation using Zod
 * Provides type-safe validation for QR code content and settings
 */

import { z } from 'zod';

// ============================================
// URL Validation
// ============================================

export const urlSchema = z.string()
  .min(1, 'URL is required')
  .url('Please enter a valid URL')
  .refine(
    (url) => url.startsWith('http://') || url.startsWith('https://'),
    'URL must start with http:// or https://'
  );

export const optionalUrlSchema = z.string()
  .url('Please enter a valid URL')
  .optional()
  .or(z.literal(''));

// ============================================
// Email Validation
// ============================================

export const emailSchema = z.string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

export const optionalEmailSchema = z.string()
  .email('Please enter a valid email address')
  .optional()
  .or(z.literal(''));

// ============================================
// Phone Validation
// ============================================

export const phoneSchema = z.string()
  .min(1, 'Phone number is required')
  .regex(
    /^[\d\s\-+()]+$/,
    'Phone number can only contain digits, spaces, dashes, and parentheses'
  )
  .min(7, 'Phone number is too short')
  .max(20, 'Phone number is too long');

export const optionalPhoneSchema = z.string()
  .regex(
    /^[\d\s\-+()]*$/,
    'Phone number can only contain digits, spaces, dashes, and parentheses'
  )
  .optional()
  .or(z.literal(''));

// ============================================
// WiFi Validation
// ============================================

export const wifiSsidSchema = z.string()
  .min(1, 'Network name (SSID) is required')
  .max(32, 'Network name cannot exceed 32 characters')
  .refine(
    (ssid) => !ssid.includes(';') && !ssid.includes(':'),
    'Network name cannot contain ; or : characters'
  );

export const wifiPasswordSchema = z.string()
  .max(63, 'WiFi password cannot exceed 63 characters');

export const wifiSchema = z.object({
  ssid: wifiSsidSchema,
  password: wifiPasswordSchema,
  encryption: z.enum(['WPA', 'WEP', 'nopass']),
});

// ============================================
// vCard Validation
// ============================================

export const vcardSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  organization: z.string().max(100).optional(),
  jobTitle: z.string().max(100).optional(),
  phone: optionalPhoneSchema,
  email: optionalEmailSchema,
  website: optionalUrlSchema,
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  zip: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
  birthday: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Birthday must be in YYYY-MM-DD format')
    .optional()
    .or(z.literal('')),
  note: z.string().max(500).optional(),
  twitter: z.string().max(50).optional(),
  linkedin: z.string().max(200).optional(),
  instagram: z.string().max(50).optional(),
});

// ============================================
// Calendar Event Validation
// ============================================

export const calendarEventSchema = z.object({
  title: z.string().min(1, 'Event title is required').max(200),
  location: z.string().max(200).optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  description: z.string().max(1000).optional(),
}).refine(
  (data) => new Date(data.endDate) >= new Date(data.startDate),
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

// ============================================
// SMS Validation
// ============================================

export const smsSchema = z.object({
  phone: phoneSchema,
  message: z.string().max(160, 'SMS message should not exceed 160 characters').optional(),
});

// ============================================
// Crypto Validation
// ============================================

export const bitcoinAddressSchema = z.string()
  .regex(
    /^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}$/,
    'Invalid Bitcoin address'
  );

export const ethereumAddressSchema = z.string()
  .regex(
    /^0x[a-fA-F0-9]{40}$/,
    'Invalid Ethereum address'
  );

export const cryptoSchema = z.object({
  address: z.string().min(1, 'Crypto address is required'),
  amount: z.string()
    .regex(/^\d*\.?\d*$/, 'Amount must be a valid number')
    .optional(),
  label: z.string().max(100).optional(),
});

// ============================================
// Location Validation
// ============================================

export const locationSchema = z.object({
  latitude: z.string()
    .regex(/^-?\d+\.?\d*$/, 'Invalid latitude')
    .refine(
      (lat) => {
        const num = parseFloat(lat);
        return num >= -90 && num <= 90;
      },
      'Latitude must be between -90 and 90'
    ),
  longitude: z.string()
    .regex(/^-?\d+\.?\d*$/, 'Invalid longitude')
    .refine(
      (lng) => {
        const num = parseFloat(lng);
        return num >= -180 && num <= 180;
      },
      'Longitude must be between -180 and 180'
    ),
  label: z.string().max(100).optional(),
});

// ============================================
// WhatsApp Validation
// ============================================

export const whatsappSchema = z.object({
  phone: phoneSchema,
  message: z.string().max(1000).optional(),
});

// ============================================
// Social Media Validation
// ============================================

export const socialMediaSchema = z.object({
  platform: z.enum(['twitter', 'instagram', 'linkedin', 'facebook', 'tiktok', 'youtube']),
  username: z.string()
    .min(1, 'Username is required')
    .max(100)
    .refine(
      (username) => !username.includes(' '),
      'Username cannot contain spaces'
    ),
});

// ============================================
// QR Code Settings Validation
// ============================================

export const qrSettingsSchema = z.object({
  size: z.number().min(100, 'Size must be at least 100px').max(2000, 'Size cannot exceed 2000px'),
  errorCorrection: z.enum(['L', 'M', 'Q', 'H']),
  margin: z.number().min(0).max(10),
  foregroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid foreground color'),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid background color'),
});

// ============================================
// PayPal Validation
// ============================================

export const paypalSchema = z.object({
  email: z.string().min(1, 'PayPal email/username is required'),
  amount: z.string()
    .regex(/^\d*\.?\d*$/, 'Amount must be a valid number')
    .optional(),
  currency: z.string().max(3).optional(),
  note: z.string().max(200).optional(),
});

// ============================================
// Helper Functions
// ============================================

/**
 * Validate data against a schema and return errors if any
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path.join('.') || '_root';
    errors[path] = issue.message;
  });

  return { success: false, errors };
}

/**
 * Validate a single field and return error message if invalid
 */
export function validateField<T>(
  schema: z.ZodSchema<T>,
  value: unknown
): string | null {
  const result = schema.safeParse(value);
  if (result.success) {
    return null;
  }
  return result.error.issues[0]?.message || 'Invalid value';
}

/**
 * Check if a URL is valid
 */
export function isValidUrl(url: string): boolean {
  return urlSchema.safeParse(url).success;
}

/**
 * Check if an email is valid
 */
export function isValidEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}

/**
 * Check if a phone number is valid
 */
export function isValidPhone(phone: string): boolean {
  return phoneSchema.safeParse(phone).success;
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Export types
export type UrlInput = z.infer<typeof urlSchema>;
export type EmailInput = z.infer<typeof emailSchema>;
export type PhoneInput = z.infer<typeof phoneSchema>;
export type WifiInput = z.infer<typeof wifiSchema>;
export type VCardInput = z.infer<typeof vcardSchema>;
export type CalendarEventInput = z.infer<typeof calendarEventSchema>;
export type SmsInput = z.infer<typeof smsSchema>;
export type CryptoInput = z.infer<typeof cryptoSchema>;
export type LocationInput = z.infer<typeof locationSchema>;
export type WhatsAppInput = z.infer<typeof whatsappSchema>;
export type SocialMediaInput = z.infer<typeof socialMediaSchema>;
export type QRSettingsInput = z.infer<typeof qrSettingsSchema>;
export type PayPalInput = z.infer<typeof paypalSchema>;
