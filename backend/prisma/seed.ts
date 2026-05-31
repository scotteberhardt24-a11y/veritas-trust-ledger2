import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: {
      email: "admin@veritas.local",
    },
    update: {},
    create: {
      email: "admin@veritas.local",
      username: "veritas_admin",
      passwordHash: "CHANGE_ME_HASH",
      role: UserRole.ADMIN,
      trustScore: 100,
      skills: ["governance", "security", "moderation"],
    },
  });

  console.log("Admin user created:", admin.id);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });