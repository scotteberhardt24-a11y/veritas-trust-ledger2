import bcrypt from "bcryptjs";

async function main() {
  const password = "Bellablue";

  const hashed = await bcrypt.hash(password, 10);

  const adminUser = {
    name: "Scott William",
    email: "swe20933@gmail.com",
    phone: "2066585559",
    password: hashed,
    role: "admin",
    tier: "Diamond",
    truscore: 1000,
    is_verified: true,
  };

  console.log("\nADMIN USER:\n");
  console.log(adminUser);
}

main();
