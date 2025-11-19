import { z } from 'zod'

// URL validation schema
export const urlSchema = z.object({
  url: z.string()
    .min(1, 'URL is required')
    .url('Must be a valid URL')
    .max(2000, 'URL is too long')
})

// WiFi validation schema
export const wifiSchema = z.object({
  ssid: z.string()
    .min(1, 'Network name (SSID) is required')
    .max(32, 'SSID must be 32 characters or less'),
  password: z.string().optional(),
  encryption: z.enum(['WPA', 'WEP', 'nopass']),
  hidden: z.boolean().optional()
})

// Email validation schema
export const emailSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Must be a valid email address'),
  subject: z.string().max(200, 'Subject is too long').optional(),
  body: z.string().max(1000, 'Message is too long').optional()
})

// Phone validation schema
export const phoneSchema = z.object({
  number: z.string()
    .min(1, 'Phone number is required')
    .regex(/^[+]?[0-9\s\-\(\)]+$/, 'Invalid phone number format')
})

// SMS validation schema
export const smsSchema = z.object({
  number: z.string()
    .min(1, 'Phone number is required')
    .regex(/^[+]?[0-9\s\-\(\)]+$/, 'Invalid phone number format'),
  message: z.string().max(160, 'SMS message is too long (max 160 characters)').optional()
})

// vCard validation schema
export const vCardSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  organization: z.string().optional(),
  title: z.string().optional(),
  phone: z.string().regex(/^[+]?[0-9\s\-\(\)]+$/, 'Invalid phone number format').optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  url: z.string().url('Invalid URL').optional().or(z.literal('')),
  address: z.string().optional(),
  note: z.string().optional()
})

// Location validation schema
export const locationSchema = z.object({
  latitude: z.string()
    .min(1, 'Latitude is required')
    .refine((val) => {
      const num = parseFloat(val)
      return !isNaN(num) && num >= -90 && num <= 90
    }, 'Latitude must be between -90 and 90'),
  longitude: z.string()
    .min(1, 'Longitude is required')
    .refine((val) => {
      const num = parseFloat(val)
      return !isNaN(num) && num >= -180 && num <= 180
    }, 'Longitude must be between -180 and 180')
})

// Calendar/Event validation schema
export const calendarSchema = z.object({
  title: z.string().min(1, 'Event title is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  location: z.string().optional(),
  description: z.string().max(500, 'Description is too long').optional()
})

// Crypto validation schema
export const cryptoSchema = z.object({
  address: z.string().min(1, 'Crypto address is required'),
  amount: z.string().optional(),
  message: z.string().optional()
})

// Generic text validation
export const textSchema = z.object({
  text: z.string()
    .min(1, 'Text content is required')
    .max(2000, 'Text is too long (max 2000 characters)')
})

// Type exports
export type URLFormData = z.infer<typeof urlSchema>
export type WiFiFormData = z.infer<typeof wifiSchema>
export type EmailFormData = z.infer<typeof emailSchema>
export type PhoneFormData = z.infer<typeof phoneSchema>
export type SMSFormData = z.infer<typeof smsSchema>
export type VCardFormData = z.infer<typeof vCardSchema>
export type LocationFormData = z.infer<typeof locationSchema>
export type CalendarFormData = z.infer<typeof calendarSchema>
export type CryptoFormData = z.infer<typeof cryptoSchema>
export type TextFormData = z.infer<typeof textSchema>
