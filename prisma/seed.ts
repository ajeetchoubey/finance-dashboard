import "dotenv/config";

import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client.js";
import { RoleName, TransactionType, UserStatus } from "../src/generated/prisma/enums.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required for seeding.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString })
});

async function main() {
  const [viewerRole, analystRole, adminRole] = await Promise.all([
    prisma.role.upsert({
      where: { name: RoleName.VIEWER },
      update: {},
      create: { name: RoleName.VIEWER, description: "Read-only dashboard access" }
    }),
    prisma.role.upsert({
      where: { name: RoleName.ANALYST },
      update: {},
      create: { name: RoleName.ANALYST, description: "Read access to records and analytics" }
    }),
    prisma.role.upsert({
      where: { name: RoleName.ADMIN },
      update: {},
      create: { name: RoleName.ADMIN, description: "Full access to manage users and records" }
    })
  ]);

  const passwordHash = await bcrypt.hash("Password@123", 10);

  const [adminUser, analystUser, viewerUser] = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@example.com" },
      update: {},
      create: {
        name: "Admin User",
        email: "admin@example.com",
        passwordHash,
        roleId: adminRole.id,
        status: UserStatus.ACTIVE
      }
    }),
    prisma.user.upsert({
      where: { email: "analyst@example.com" },
      update: {},
      create: {
        name: "Analyst User",
        email: "analyst@example.com",
        passwordHash,
        roleId: analystRole.id,
        status: UserStatus.ACTIVE
      }
    }),
    prisma.user.upsert({
      where: { email: "viewer@example.com" },
      update: {},
      create: {
        name: "Viewer User",
        email: "viewer@example.com",
        passwordHash,
        roleId: viewerRole.id,
        status: UserStatus.ACTIVE
      }
    })
  ]);

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: "Salary" },
      update: {},
      create: { name: "Salary" }
    }),
    prisma.category.upsert({
      where: { name: "Investments" },
      update: {},
      create: { name: "Investments" }
    }),
    prisma.category.upsert({
      where: { name: "Food" },
      update: {},
      create: { name: "Food" }
    }),
    prisma.category.upsert({
      where: { name: "Travel" },
      update: {},
      create: { name: "Travel" }
    }),
    prisma.category.upsert({
      where: { name: "Utilities" },
      update: {},
      create: { name: "Utilities" }
    })
  ]);

  const [salary, investments, food, travel, utilities] = categories;

  await prisma.financialRecord.deleteMany();

  await prisma.financialRecord.createMany({
    data: [
      {
        amount: 120000,
        type: TransactionType.INCOME,
        categoryId: salary.id,
        note: "Monthly salary",
        transactionDate: new Date("2026-03-01"),
        createdById: adminUser.id,
        updatedById: adminUser.id
      },
      {
        amount: 14500,
        type: TransactionType.INCOME,
        categoryId: investments.id,
        note: "Dividend payout",
        transactionDate: new Date("2026-03-10"),
        createdById: adminUser.id,
        updatedById: adminUser.id
      },
      {
        amount: 4200,
        type: TransactionType.EXPENSE,
        categoryId: food.id,
        note: "Groceries",
        transactionDate: new Date("2026-03-03"),
        createdById: adminUser.id,
        updatedById: adminUser.id
      },
      {
        amount: 15000,
        type: TransactionType.EXPENSE,
        categoryId: travel.id,
        note: "Flight booking",
        transactionDate: new Date("2026-03-15"),
        createdById: adminUser.id,
        updatedById: adminUser.id
      },
      {
        amount: 6200,
        type: TransactionType.EXPENSE,
        categoryId: utilities.id,
        note: "Electricity and internet",
        transactionDate: new Date("2026-03-20"),
        createdById: adminUser.id,
        updatedById: adminUser.id
      }
    ]
  });

  console.log("Seed completed with users, roles, categories, and records.");
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
