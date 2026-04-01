import { z } from "zod";

import { RoleName, TransactionType, UserStatus } from "../../generated/prisma/enums.js";

export const roleSchema = z.enum(["viewer", "analyst", "admin"]);
export const userStatusSchema = z.enum(["active", "inactive"]);
export const transactionTypeSchema = z.enum(["income", "expense"]);

export type RoleInput = z.infer<typeof roleSchema>;
export type UserStatusInput = z.infer<typeof userStatusSchema>;
export type TransactionTypeInput = z.infer<typeof transactionTypeSchema>;

const ROLE_TO_ENUM: Record<RoleInput, RoleName> = {
  viewer: RoleName.VIEWER,
  analyst: RoleName.ANALYST,
  admin: RoleName.ADMIN
};

const STATUS_TO_ENUM: Record<UserStatusInput, UserStatus> = {
  active: UserStatus.ACTIVE,
  inactive: UserStatus.INACTIVE
};

const TRANSACTION_TYPE_TO_ENUM: Record<TransactionTypeInput, TransactionType> = {
  income: TransactionType.INCOME,
  expense: TransactionType.EXPENSE
};

export function toRoleEnum(role: RoleInput) {
  return ROLE_TO_ENUM[role];
}

export function toUserStatusEnum(status: UserStatusInput) {
  return STATUS_TO_ENUM[status];
}

export function toTransactionTypeEnum(type: TransactionTypeInput) {
  return TRANSACTION_TYPE_TO_ENUM[type];
}

export function fromRoleEnum(role: string) {
  return role.toLowerCase() as RoleInput;
}

export function fromUserStatusEnum(status: string) {
  return status.toLowerCase() as UserStatusInput;
}

export function fromTransactionTypeEnum(type: string) {
  return type.toLowerCase() as TransactionTypeInput;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}
