import type { Request, Response } from "express";

import { sendSuccess } from "../../common/utils/response.js";
import * as rolesService from "./roles.service.js";

export async function listRoles(_req: Request, res: Response) {
  const data = await rolesService.listRoles();

  sendSuccess(res, data, "Roles fetched successfully");
}
