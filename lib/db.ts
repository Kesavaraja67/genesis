import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.log("[db.ts] Returning dummy client because DATABASE_URL is missing.");
    // Return a dummy client during Edge module evaluation if env is not loaded
    // We DO NOT cache this dummy client in globalForPrisma.
    return new PrismaClient();
  }
  
  if (!globalForPrisma.prisma) {
    const adapter = new PrismaNeon({ connectionString });
    globalForPrisma.prisma = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  }
  
  return globalForPrisma.prisma;
}

export const prisma = getPrismaClient();

// In development, Next.js clears the cache but keeps globalThis. 
// We only want to store the VALID client in globalThis.
if (process.env.NODE_ENV !== "production" && process.env.DATABASE_URL) {
  globalForPrisma.prisma = prisma;
}

