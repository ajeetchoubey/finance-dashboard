import type { Request, Response } from "express";
import { z } from "zod";

import { AppError } from "../../common/errors/app-error.js";
import { paginationQuerySchema } from "../../common/utils/pagination.js";
import { sendSuccess } from "../../common/utils/response.js";
import { validateOrThrow } from "../../common/utils/validation.js";
import { transactionTypeSchema } from "../../common/utils/domain.js";
import { dateStringPattern } from "./records.shared.js";
import * as recordsService from "./records.service.js";

const recordIdParamsSchema = z.object({
  id: z.string().uuid()
});

const dateStringSchema = z.string().regex(dateStringPattern, "Date must be in YYYY-MM-DD format");

const recordBodySchema = z.object({
  amount: z.coerce.number().positive(),
  type: transactionTypeSchema,
  category: z.string().trim().min(1).max(80),
  note: z.string().trim().max(500).optional().nullable(),
  transactionDate: dateStringSchema
});

const updateRecordSchema = recordBodySchema.partial().refine(
  (value) => Object.values(value).some((entry) => entry !== undefined),
  {
    message: "At least one field must be provided"
  }
);

const listRecordsQuerySchema = paginationQuerySchema.extend({
  from: dateStringSchema.optional(),
  to: dateStringSchema.optional(),
  type: transactionTypeSchema.optional(),
  category: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
  sortBy: z.enum(["transactionDate", "amount", "createdAt", "updatedAt"]).default("transactionDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc")
});

function getAuthenticatedUserId(req: Request) {
  if (!req.user?.id) {
    throw new AppError(401, "Authentication required", "UNAUTHORIZED");
  }

  return req.user.id;
}

export async function listRecords(req: Request, res: Response) {
  const query = validateOrThrow(listRecordsQuerySchema, req.query);
  const data = await recordsService.listRecords(query);

  sendSuccess(res, data, "Records fetched successfully");
}

export async function getRecordById(req: Request, res: Response) {
  const params = validateOrThrow(recordIdParamsSchema, req.params);
  const data = await recordsService.getRecordById(params.id);

  sendSuccess(res, data, "Record fetched successfully");
}

export async function createRecord(req: Request, res: Response) {
  const payload = validateOrThrow(recordBodySchema, req.body);
  const data = await recordsService.createRecord({
    ...payload,
    userId: getAuthenticatedUserId(req)
  });

  sendSuccess(res, data, "Record created successfully", 201);
}

export async function updateRecord(req: Request, res: Response) {
  const params = validateOrThrow(recordIdParamsSchema, req.params);
  const payload = validateOrThrow(updateRecordSchema, req.body);
  const data = await recordsService.updateRecord({
    id: params.id,
    ...payload,
    userId: getAuthenticatedUserId(req)
  });

  sendSuccess(res, data, "Record updated successfully");
}

export async function deleteRecord(req: Request, res: Response) {
  const params = validateOrThrow(recordIdParamsSchema, req.params);
  const data = await recordsService.deleteRecord(params.id, getAuthenticatedUserId(req));

  sendSuccess(res, data, "Record deleted successfully");
}
