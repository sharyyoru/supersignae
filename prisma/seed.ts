import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "wilson@drehomes.com";
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!passwordHash) {
    console.warn("ADMIN_PASSWORD_HASH not set; skipping admin seed.");
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    await prisma.user.create({
      data: {
        email,
        role: "ADMIN",
        fullName: "Wilson Admin",
        password: passwordHash,
      },
    });
    console.log(`Admin user ${email} seeded.`);
  } else {
    console.log(`Admin user ${email} already exists.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
