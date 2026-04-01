import { Router } from "express";

import { authenticateRequest } from "../../common/middleware/auth.js";
import { getCurrentUser, login } from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/login", login);
authRouter.get("/me", authenticateRequest, getCurrentUser);
