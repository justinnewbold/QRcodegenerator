import { customAlphabet } from 'nanoid'
import { prisma } from './prisma'

// Create a custom nanoid with URL-safe characters
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 8)

export interface CreateShortUrlOptions {
  userId: string
  originalUrl: string
  customShortId?: string
  workspaceId?: string
  campaignId?: string
  qrType: string
  metadata?: Record<string, any>
  expiresAt?: Date
  maxScans?: number
  password?: string
}

export async function createShortUrl(options: CreateShortUrlOptions) {
  const {
    userId,
    originalUrl,
    customShortId,
    workspaceId,
    campaignId,
    qrType,
    metadata,
    expiresAt,
    maxScans,
    password,
  } = options

  // Generate or use custom short ID
  let shortId = customShortId || nanoid()

  // Check if custom short ID already exists
  if (customShortId) {
    const existing = await prisma.qRCode.findUnique({
      where: { shortId: customShortId },
    })

    if (existing) {
      throw new Error('Custom short ID already taken')
    }
  }

  // Create the QR code record with shortened URL
  const qrCode = await prisma.qRCode.create({
    data: {
      userId,
      workspaceId,
      campaignId,
      shortId,
      type: qrType as any,
      content: originalUrl,
      isDynamic: true,
      dynamicUrl: `${process.env.SHORT_URL_DOMAIN || 'localhost:3000'}/s/${shortId}`,
      customization: {},
      expiresAt,
      maxScans,
      password: password ? await hashPassword(password) : null,
      metadata,
    },
  })

  return qrCode
}

export async function resolveShortUrl(shortId: string) {
  const qrCode = await prisma.qRCode.findUnique({
    where: { shortId },
    include: {
      scans: {
        orderBy: { scannedAt: 'desc' },
        take: 1,
      },
    },
  })

  if (!qrCode) {
    return null
  }

  // Check if expired
  if (qrCode.expiresAt && qrCode.expiresAt < new Date()) {
    return { error: 'expired', qrCode }
  }

  // Check if max scans reached
  if (qrCode.maxScans && qrCode.scans.length >= qrCode.maxScans) {
    return { error: 'max_scans_reached', qrCode }
  }

  // Check if active
  if (!qrCode.isActive) {
    return { error: 'inactive', qrCode }
  }

  return { qrCode }
}

export async function trackScan(
  qrCodeId: string,
  scanData: {
    ipAddress?: string
    userAgent?: string
    country?: string
    city?: string
    latitude?: number
    longitude?: number
    device?: string
    os?: string
    browser?: string
    referrer?: string
    language?: string
  }
) {
  return await prisma.scan.create({
    data: {
      qrCodeId,
      ...scanData,
    },
  })
}

export async function updateQRContent(qrCodeId: string, newContent: string, userId: string) {
  // Create a version before updating
  const qrCode = await prisma.qRCode.findUnique({
    where: { id: qrCodeId },
  })

  if (!qrCode) {
    throw new Error('QR code not found')
  }

  if (qrCode.userId !== userId) {
    throw new Error('Unauthorized')
  }

  // Save current version
  await prisma.qRVersion.create({
    data: {
      qrCodeId,
      content: qrCode.content,
      metadata: qrCode.metadata,
    },
  })

  // Update with new content
  return await prisma.qRCode.update({
    where: { id: qrCodeId },
    data: { content: newContent },
  })
}

async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs')
  return bcrypt.hash(password, 10)
}

export async function verifyQRPassword(qrCodeId: string, password: string): Promise<boolean> {
  const qrCode = await prisma.qRCode.findUnique({
    where: { id: qrCodeId },
  })

  if (!qrCode || !qrCode.password) {
    return false
  }

  const bcrypt = await import('bcryptjs')
  return bcrypt.compare(password, qrCode.password)
}
