import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

async function main() {
  console.log("Step 1: Connected");

  console.log("Step 2: Creating incident...");

  const incident = await prisma.incident.create({
    data: {
      title: "Prisma Test",
      description: "Testing database connection",
      severity: "HIGH",
    },
  });

  console.log("Step 3: Success!");
  console.log(incident);
}

main()
  .catch((e) => {
    console.error("ERROR:");
    console.error(e);
  })
  .finally(async () => {
    console.log("Disconnecting...");
    await prisma.$disconnect();
  });