import type { Request, Response } from "express";

import { sendSuccess } from "../../common/utils/response.js";
import { getHealthStatus } from "./health.service.js";

export function getHealth(_req: Request, res: Response) {
  sendSuccess(res, getHealthStatus(), "Service is healthy");
}
