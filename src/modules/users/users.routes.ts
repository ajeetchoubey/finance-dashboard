import { Router } from "express";

import { requirePermission } from "../../common/middleware/require-role.js";
import {
  createUser,
  getUserById,
  listUsers,
  updateUser,
  updateUserStatus
} from "./users.controller.js";

export const usersRouter = Router();

usersRouter.use(requirePermission("users.manage"));
usersRouter.post("/", createUser);
usersRouter.get("/", listUsers);
usersRouter.get("/:id", getUserById);
usersRouter.patch("/:id", updateUser);
usersRouter.patch("/:id/status", updateUserStatus);
