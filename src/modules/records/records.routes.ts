import { Router } from "express";

import { requirePermission } from "../../common/middleware/require-role.js";
import {
  createRecord,
  deleteRecord,
  getRecordById,
  listRecords,
  updateRecord
} from "./records.controller.js";

export const recordsRouter = Router();

recordsRouter.get("/", requirePermission("records.read"), listRecords);
recordsRouter.get("/:id", requirePermission("records.read"), getRecordById);
recordsRouter.post("/", requirePermission("records.write"), createRecord);
recordsRouter.patch("/:id", requirePermission("records.write"), updateRecord);
recordsRouter.delete("/:id", requirePermission("records.write"), deleteRecord);
