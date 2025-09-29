import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim())

const prismaClient = hasDatabaseUrl
  ? globalForPrisma.prisma ??
    new PrismaClient({
      log: ['query'],
    })
  : undefined

if (process.env.NODE_ENV !== 'production' && prismaClient) {
  globalForPrisma.prisma = prismaClient
}

if (!hasDatabaseUrl && process.env.NODE_ENV !== 'production') {
  console.warn(
    'DATABASE_URL is not set. Running with in-memory data stores; persistence is disabled.'
  )
}

export const db = prismaClient

export const isDatabaseConfigured = hasDatabaseUrl
