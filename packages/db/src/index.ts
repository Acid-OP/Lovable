import { PrismaClient } from "../generated/prisma/client.js";

const databaseUrl = process.env.DATABASE_URL;

export const prisma = new PrismaClient({
  datasourceUrl: databaseUrl,
});

export * from "../generated/prisma/client.js";
export { PrismaClient };
