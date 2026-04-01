import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { AppError } from "../errors/app-error.js";
import { env } from "../../config/env.js";
import { prisma } from "../../config/prisma.js";
import type { AuthUser } from "../types/auth.js";
import { fromRoleEnum, fromUserStatusEnum } from "../utils/domain.js";

type JwtPayload = {
  sub: string;
};

export async function authenticateRequest(req: Request, _res: Response, next: NextFunction) {
  const authorization = req.header("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    next(new AppError(401, "Missing bearer token", "UNAUTHORIZED"));
    return;
  }

  const token = authorization.slice("Bearer ".length);
  let decoded: JwtPayload;

  try {
    decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch {
    next(new AppError(401, "Invalid or expired token", "UNAUTHORIZED"));
    return;
  }

  const userRecord = await prisma.user.findUnique({
    where: { id: decoded.sub },
    include: {
      role: true
    }
  });

  if (!userRecord) {
    next(new AppError(401, "User not found", "UNAUTHORIZED"));
    return;
  }

  const normalizedStatus = fromUserStatusEnum(userRecord.status);

  if (normalizedStatus !== "active") {
    next(new AppError(403, "Inactive users cannot access this resource", "FORBIDDEN"));
    return;
  }

  const user: AuthUser = {
    id: userRecord.id,
    name: userRecord.name,
    email: userRecord.email,
    role: fromRoleEnum(userRecord.role.name),
    status: normalizedStatus
  };

  req.user = user;
  next();
}
