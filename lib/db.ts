import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient();
// For prisma to not be affected by hot reload from nextjs
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
