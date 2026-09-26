const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: {
      email: "admin@campus.com"
    },
    update: {
      role: "ADMIN",
      password: "$2a$10$MdHZQ/0HG.AohbDkJCMlP.3KUcWEH0WLwdoN/hDpCfUeTj1tRPoZS"
    },
    create: {
      name: "Campus Admin",
      email: "admin@campus.com",
      password: "$2a$10$MdHZQ/0HG.AohbDkJCMlP.3KUcWEH0WLwdoN/hDpCfUeTj1tRPoZS",
      role: "ADMIN"
    }
  });

  console.log("Admin ready:", admin.email, admin.role);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());