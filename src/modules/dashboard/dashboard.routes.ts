import { Router } from "express";

import { requirePermission } from "../../common/middleware/require-role.js";
import {
  getCategoryTotals,
  getRecentActivity,
  getSummary,
  getTrends
} from "./dashboard.controller.js";

export const dashboardRouter = Router();

dashboardRouter.use(requirePermission("dashboard.read"));
dashboardRouter.get("/summary", getSummary);
dashboardRouter.get("/category-totals", getCategoryTotals);
dashboardRouter.get("/trends", getTrends);
dashboardRouter.get("/recent-activity", getRecentActivity);
