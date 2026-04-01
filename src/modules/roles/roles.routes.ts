import { Router } from "express";

import { requirePermission } from "../../common/middleware/require-role.js";
import { listRoles } from "./roles.controller.js";

export const rolesRouter = Router();

rolesRouter.use(requirePermission("roles.manage"));
rolesRouter.get("/", listRoles);
