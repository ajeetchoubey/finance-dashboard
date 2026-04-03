import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { authRouter } from "./modules/auth/auth.routes.js";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes.js";
import { healthRouter } from "./modules/health/health.routes.js";
import { recordsRouter } from "./modules/records/records.routes.js";
import { rolesRouter } from "./modules/roles/roles.routes.js";
import { usersRouter } from "./modules/users/users.routes.js";
import { authenticateRequest } from "./common/middleware/auth.js";
import { errorHandler } from "./common/middleware/error-handler.js";
import { notFoundHandler } from "./common/middleware/not-found.js";
import { authRateLimiter, globalRateLimiter } from "./common/middleware/rate-limit.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));
  app.use(globalRateLimiter);

  app.get("/", (_req, res) => {
    res.json({
      success: true,
      message: "Finance Dashboard Backend",
      data: {
        version: "1.0.0",
        stack: ["Node.js", "Express", "TypeScript", "Prisma", "PostgreSQL"]
      }
    });
  });

  app.use("/api/v1/health", healthRouter);
  app.use("/api/v1/auth", authRateLimiter, authRouter);

  app.use(authenticateRequest);
  app.use("/api/v1/users", usersRouter);
  app.use("/api/v1/records", recordsRouter);
  app.use("/api/v1/dashboard", dashboardRouter);
  app.use("/api/v1/roles", rolesRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
