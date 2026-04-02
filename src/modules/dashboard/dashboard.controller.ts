import type { Request, Response } from "express";
import { z } from "zod";

import { transactionTypeSchema } from "../../common/utils/domain.js";
import { sendSuccess } from "../../common/utils/response.js";
import { validateOrThrow } from "../../common/utils/validation.js";
import { dateStringPattern } from "../records/records.shared.js";
import * as dashboardService from "./dashboard.service.js";

const dateStringSchema = z.string().regex(dateStringPattern, "Date must be in YYYY-MM-DD format");

const summaryQuerySchema = z.object({
  from: dateStringSchema.optional(),
  to: dateStringSchema.optional(),
  type: transactionTypeSchema.optional()
});

const trendQuerySchema = summaryQuerySchema.extend({
  period: z.enum(["daily", "weekly", "monthly"]).default("monthly")
});

const recentActivityQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(20).default(5),
  from: dateStringSchema.optional(),
  to: dateStringSchema.optional(),
  type: transactionTypeSchema.optional()
});

export async function getSummary(req: Request, res: Response) {
  const query = validateOrThrow(summaryQuerySchema, req.query);
  const data = await dashboardService.getSummary(query);

  sendSuccess(res, data, "Dashboard summary fetched successfully");
}

export async function getCategoryTotals(req: Request, res: Response) {
  const query = validateOrThrow(summaryQuerySchema, req.query);
  const data = await dashboardService.getCategoryTotals(query);

  sendSuccess(res, data, "Category totals fetched successfully");
}

export async function getTrends(req: Request, res: Response) {
  const query = validateOrThrow(trendQuerySchema, req.query);
  const data = await dashboardService.getTrends(query);

  sendSuccess(res, data, "Trend data fetched successfully");
}

export async function getRecentActivity(req: Request, res: Response) {
  const query = validateOrThrow(recentActivityQuerySchema, req.query);
  const data = await dashboardService.getRecentActivity(query);

  sendSuccess(res, data, "Recent activity fetched successfully");
}
