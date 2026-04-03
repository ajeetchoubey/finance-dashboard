import bcrypt from "bcryptjs";

import { createAuditLog } from "../../common/audit/audit.repository.js";
import type { DbClient } from "../../common/audit/audit.shared.js";
import { AppError } from "../../common/errors/app-error.js";
import {
  fromRoleEnum,
  fromUserStatusEnum,
  normalizeEmail,
  type RoleInput,
  type UserStatusInput
} from "../../common/utils/domain.js";
import { buildPaginationMeta } from "../../common/utils/pagination.js";
import { prisma } from "../../config/prisma.js";
import * as usersRepository from "./users.repository.js";

type CreateUserInput = {
  actorId: string;
  name: string;
  email: string;
  password: string;
  role: RoleInput;
  status: UserStatusInput;
};

type ListUsersInput = {
  page: number;
  limit: number;
  status?: UserStatusInput;
  role?: RoleInput;
  search?: string;
};

type UpdateUserInput = {
  id: string;
  actorId: string;
  name?: string;
  role?: RoleInput;
  status?: UserStatusInput;
  password?: string;
};

function serializeUser(user: {
  id: string;
  name: string;
  email: string;
  status: string;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  role: {
    id: string;
    name: string;
    description: string | null;
  };
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: fromRoleEnum(user.role.name),
    roleId: user.role.id,
    roleDescription: user.role.description,
    status: fromUserStatusEnum(user.status),
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  };
}

async function getUserOrThrow(id: string, db?: DbClient) {
  const user = await usersRepository.findUserById(id, db);

  if (!user) {
    throw new AppError(404, "User not found", "USER_NOT_FOUND");
  }

  return user;
}

async function getRoleIdOrThrow(role: RoleInput, db?: DbClient) {
  const roleRecord = await usersRepository.findRoleByName(role, db);

  if (!roleRecord) {
    throw new AppError(404, "Role not found", "ROLE_NOT_FOUND");
  }

  return roleRecord.id;
}

export async function createUser(input: CreateUserInput) {
  const email = normalizeEmail(input.email);
  const passwordHash = await bcrypt.hash(input.password, 10);

  return prisma.$transaction(async (tx) => {
    const existingUser = await usersRepository.findUserByEmail(email, tx);

    if (existingUser) {
      throw new AppError(409, "A user with this email already exists", "EMAIL_ALREADY_EXISTS");
    }

    const roleId = await getRoleIdOrThrow(input.role, tx);
    const user = await usersRepository.createUser({
      name: input.name.trim(),
      email,
      passwordHash,
      roleId,
      status: input.status
    }, tx);
    const serializedUser = serializeUser(user);

    await createAuditLog({
      actorUserId: input.actorId,
      action: "USER_CREATED",
      entityType: "user",
      entityId: user.id,
      afterData: serializedUser
    }, tx);

    return serializedUser;
  });
}

export async function listUsers(input: ListUsersInput) {
  const result = await usersRepository.findUsers(input);

  return {
    items: result.items.map(serializeUser),
    pagination: buildPaginationMeta(input.page, input.limit, result.total)
  };
}

export async function getUserById(id: string) {
  const user = await getUserOrThrow(id);

  return serializeUser(user);
}

export async function updateUser(input: UpdateUserInput) {
  const passwordHash = input.password ? await bcrypt.hash(input.password, 10) : undefined;

  return prisma.$transaction(async (tx) => {
    const existingUser = await getUserOrThrow(input.id, tx);

    if (input.status === "inactive" && input.id === input.actorId) {
      throw new AppError(400, "You cannot deactivate your own account", "CANNOT_DEACTIVATE_SELF");
    }

    const roleId = input.role ? await getRoleIdOrThrow(input.role, tx) : undefined;
    const updatedUser = await usersRepository.updateUser({
      id: input.id,
      name: input.name?.trim(),
      roleId,
      status: input.status,
      passwordHash
    }, tx);
    const changedFields = [
      input.name !== undefined ? "name" : null,
      input.role !== undefined ? "role" : null,
      input.status !== undefined ? "status" : null,
      input.password !== undefined ? "password" : null
    ].filter((value): value is string => value !== null);
    const beforeData = serializeUser(existingUser);
    const afterData = {
      ...serializeUser(updatedUser),
      changedFields
    };

    await createAuditLog({
      actorUserId: input.actorId,
      action: "USER_UPDATED",
      entityType: "user",
      entityId: updatedUser.id,
      beforeData,
      afterData
    }, tx);

    return serializeUser(updatedUser);
  });
}

export async function updateUserStatus(id: string, status: UserStatusInput, actorId: string) {
  return prisma.$transaction(async (tx) => {
    const existingUser = await getUserOrThrow(id, tx);

    if (status === "inactive" && id === actorId) {
      throw new AppError(400, "You cannot deactivate your own account", "CANNOT_DEACTIVATE_SELF");
    }

    const updatedUser = await usersRepository.updateUserStatus(id, status, tx);
    const beforeData = serializeUser(existingUser);
    const afterData = serializeUser(updatedUser);

    await createAuditLog({
      actorUserId: actorId,
      action: "USER_STATUS_UPDATED",
      entityType: "user",
      entityId: updatedUser.id,
      beforeData,
      afterData
    }, tx);

    return afterData;
  });
}
