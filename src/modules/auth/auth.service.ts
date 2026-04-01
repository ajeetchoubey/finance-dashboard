import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { AppError } from "../../common/errors/app-error.js";
import { env } from "../../config/env.js";
import {
  fromRoleEnum,
  fromUserStatusEnum,
  normalizeEmail
} from "../../common/utils/domain.js";
import * as authRepository from "./auth.repository.js";

type LoginInput = {
  email: string;
  password: string;
};

function serializeAuthUser(user: {
  id: string;
  name: string;
  email: string;
  status: string;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  role: {
    name: string;
  };
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: fromRoleEnum(user.role.name),
    status: fromUserStatusEnum(user.status),
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  };
}

export async function login(input: LoginInput) {
  const email = normalizeEmail(input.email);
  const user = await authRepository.findUserByEmail(email);

  if (!user) {
    throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  if (fromUserStatusEnum(user.status) !== "active") {
    throw new AppError(403, "Inactive users cannot log in", "FORBIDDEN");
  }

  const updatedUser = await authRepository.updateLastLogin(user.id, new Date());
  const token = jwt.sign(
    { sub: updatedUser.id },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] }
  );

  return {
    token,
    user: serializeAuthUser(updatedUser)
  };
}

export async function getCurrentUser(userId: string) {
  const user = await authRepository.findUserById(userId);

  if (!user) {
    throw new AppError(404, "User not found", "USER_NOT_FOUND");
  }

  return serializeAuthUser(user);
}
