import { prisma } from "../../config/prisma.js";

export async function findRoles() {
  return prisma.role.findMany({
    orderBy: {
      name: "asc"
    },
    include: {
      _count: {
        select: {
          users: true
        }
      }
    }
  });
}
