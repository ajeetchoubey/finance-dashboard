import { prisma } from "../../config/prisma.js";

export async function findUserByEmail(email: string) {
  return prisma.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive"
      }
    },
    include: {
      role: true
    }
  });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      role: true
    }
  });
}

export async function updateLastLogin(id: string, lastLoginAt: Date) {
  return prisma.user.update({
    where: { id },
    data: { lastLoginAt },
    include: {
      role: true
    }
  });
}
