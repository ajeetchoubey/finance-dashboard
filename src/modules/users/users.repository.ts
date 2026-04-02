import { Prisma } from "../../generated/prisma/client.js";

import { prisma } from "../../config/prisma.js";
import {
  toRoleEnum,
  toUserStatusEnum,
  type RoleInput,
  type UserStatusInput
} from "../../common/utils/domain.js";

type UserFilters = {
  page: number;
  limit: number;
  status?: UserStatusInput;
  role?: RoleInput;
  search?: string;
};

function buildUserWhere(filters: Omit<UserFilters, "page" | "limit">): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {};

  if (filters.status) {
    where.status = toUserStatusEnum(filters.status);
  }

  if (filters.role) {
    where.role = {
      name: toRoleEnum(filters.role)
    };
  }

  if (filters.search) {
    where.OR = [
      {
        name: {
          contains: filters.search,
          mode: "insensitive"
        }
      },
      {
        email: {
          contains: filters.search,
          mode: "insensitive"
        }
      }
    ];
  }

  return where;
}

export async function findUserByEmail(email: string) {
  return prisma.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive"
      }
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

export async function findRoleByName(role: RoleInput) {
  return prisma.role.findUnique({
    where: {
      name: toRoleEnum(role)
    }
  });
}

export async function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
  roleId: string;
  status: UserStatusInput;
}) {
  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash: input.passwordHash,
      roleId: input.roleId,
      status: toUserStatusEnum(input.status)
    },
    include: {
      role: true
    }
  });
}

export async function findUsers(filters: UserFilters) {
  const where = buildUserWhere(filters);
  const skip = (filters.page - 1) * filters.limit;
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: filters.limit,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        role: true
      }
    }),
    prisma.user.count({ where })
  ]);

  return {
    items,
    total
  };
}

export async function updateUser(input: {
  id: string;
  name?: string;
  roleId?: string;
  status?: UserStatusInput;
  passwordHash?: string;
}) {
  const data: Prisma.UserUpdateInput = {};

  if (input.name !== undefined) {
    data.name = input.name;
  }

  if (input.roleId !== undefined) {
    data.role = {
      connect: {
        id: input.roleId
      }
    };
  }

  if (input.status !== undefined) {
    data.status = toUserStatusEnum(input.status);
  }

  if (input.passwordHash !== undefined) {
    data.passwordHash = input.passwordHash;
  }

  return prisma.user.update({
    where: { id: input.id },
    data,
    include: {
      role: true
    }
  });
}

export async function updateUserStatus(id: string, status: UserStatusInput) {
  return prisma.user.update({
    where: { id },
    data: {
      status: toUserStatusEnum(status)
    },
    include: {
      role: true
    }
  });
}
