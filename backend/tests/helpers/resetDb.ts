import { prisma } from "../../src/lib/prisma";

// Extend this in FK-safe order (children first) as more models are added.
export async function resetDb() {
  await prisma.user.deleteMany();
}
