import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/utils/password";

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@rezara.local";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log(`Admin user already exists: ${email}`);
    return;
  }

  const hashed = await hashPassword(password);

  await prisma.user.create({
    data: {
      name: "Admin",
      email,
      password: hashed,
      role: "ADMIN",
    },
  });

  console.log(`Seeded admin user: ${email} / ${password}`);
  console.log("Change this password after first login.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
