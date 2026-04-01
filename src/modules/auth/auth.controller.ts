import type { Request, Response } from "express";
import { z } from "zod";

import { AppError } from "../../common/errors/app-error.js";
import { sendSuccess } from "../../common/utils/response.js";
import { validateOrThrow } from "../../common/utils/validation.js";
import * as authService from "./auth.service.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function login(req: Request, res: Response) {
  const payload = validateOrThrow(loginSchema, req.body);
  const data = await authService.login(payload);

  sendSuccess(res, data, "Login successful");
}

export async function getCurrentUser(req: Request, res: Response) {
  if (!req.user?.id) {
    throw new AppError(401, "Authentication required", "UNAUTHORIZED");
  }

  const data = await authService.getCurrentUser(req.user.id);

  sendSuccess(res, data, "Current user fetched successfully");
}
