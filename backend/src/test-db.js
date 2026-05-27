const prisma = require("./config/prisma");

async function test() {
  try {
    await prisma.$connect();

    console.log("✅ DATABASE CONNECTED");

    const users = await prisma.user.findMany();

    console.log("✅ USERS:", users);

    await prisma.$disconnect();
  } catch (err) {
    console.error("❌ DATABASE ERROR");
    console.error(err);
  }
}

test();
