import type { Request, Response } from "express";
import { z } from "zod";

import { roleSchema, userStatusSchema } from "../../common/utils/domain.js";
import { paginationQuerySchema } from "../../common/utils/pagination.js";
import { sendSuccess } from "../../common/utils/response.js";
import { validateOrThrow } from "../../common/utils/validation.js";
import * as usersService from "./users.service.js";

const userIdParamsSchema = z.object({
  id: z.string().uuid()
});

const createUserSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: roleSchema,
  status: userStatusSchema.default("active")
});

const listUsersQuerySchema = paginationQuerySchema.extend({
  status: userStatusSchema.optional(),
  role: roleSchema.optional(),
  search: z.string().trim().min(1).optional()
});

const updateUserSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    role: roleSchema.optional(),
    status: userStatusSchema.optional()
  })
  .refine((value) => Object.values(value).some((entry) => entry !== undefined), {
    message: "At least one field must be provided"
  });

const updateUserStatusSchema = z.object({
  status: userStatusSchema
});

export async function createUser(req: Request, res: Response) {
  const payload = validateOrThrow(createUserSchema, req.body);
  const data = await usersService.createUser(payload);

  sendSuccess(res, data, "User created successfully", 201);
}

export async function listUsers(req: Request, res: Response) {
  const query = validateOrThrow(listUsersQuerySchema, req.query);
  const data = await usersService.listUsers(query);

  sendSuccess(res, data, "Users fetched successfully");
}

export async function getUserById(req: Request, res: Response) {
  const params = validateOrThrow(userIdParamsSchema, req.params);
  const data = await usersService.getUserById(params.id);

  sendSuccess(res, data, "User fetched successfully");
}

export async function updateUser(req: Request, res: Response) {
  const params = validateOrThrow(userIdParamsSchema, req.params);
  const payload = validateOrThrow(updateUserSchema, req.body);
  const data = await usersService.updateUser({
    id: params.id,
    ...payload
  });

  sendSuccess(res, data, "User updated successfully");
}

export async function updateUserStatus(req: Request, res: Response) {
  const params = validateOrThrow(userIdParamsSchema, req.params);
  const payload = validateOrThrow(updateUserStatusSchema, req.body);
  const data = await usersService.updateUserStatus(params.id, payload.status);

  sendSuccess(res, data, "User status updated successfully");
}
