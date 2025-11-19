import { customAlphabet } from 'nanoid'
import { prisma } from './prisma'

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 32)

export async function createApiKey(userId: string, name: string, scopes: string[]) {
  const key = `qr_${nanoid()}`

  return await prisma.apiKey.create({
    data: {
      userId,
      name,
      key,
      scopes,
    },
  })
}

export async function validateApiKey(key: string) {
  const apiKey = await prisma.apiKey.findUnique({
    where: { key },
    include: { user: true },
  })

  if (!apiKey || !apiKey.isActive) {
    return null
  }

  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return null
  }

  // Update last used timestamp
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  })

  return apiKey
}

export async function trackApiUsage(apiKeyId: string, endpoint: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  await prisma.apiKeyUsage.upsert({
    where: {
      apiKeyId_endpoint_date: {
        apiKeyId,
        endpoint,
        date: today,
      },
    },
    create: {
      apiKeyId,
      endpoint,
      date: today,
      requests: 1,
    },
    update: {
      requests: {
        increment: 1,
      },
    },
  })
}

export function hasScope(apiKey: { scopes: any }, requiredScope: string): boolean {
  const scopes = apiKey.scopes as string[]
  return scopes.includes('*') || scopes.includes(requiredScope)
}
