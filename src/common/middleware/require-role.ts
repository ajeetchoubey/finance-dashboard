import type { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/app-error.js";
import { ROLE_PERMISSIONS, type Permission } from "../constants/permissions.js";

export function requirePermission(permission: Permission) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      next(new AppError(401, "Authentication required", "UNAUTHORIZED"));
      return;
    }

    if (String(user.status).toLowerCase() !== "active") {
      next(new AppError(403, "Inactive users cannot access this resource", "FORBIDDEN"));
      return;
    }

    const roleKey = String(user.role).toLowerCase() as keyof typeof ROLE_PERMISSIONS;
    const permissions = (ROLE_PERMISSIONS[roleKey] ?? []) as readonly Permission[];

    if (!permissions.includes(permission)) {
      next(new AppError(403, "You do not have permission to perform this action", "FORBIDDEN"));
      return;
    }

    next();
  };
}
