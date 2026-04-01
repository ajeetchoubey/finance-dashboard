import type { ErrorRequestHandler } from "express";

import { AppError } from "../errors/app-error.js";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errorCode: error.errorCode,
      details: error.details ?? []
    });
    return;
  }

  console.error(error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    errorCode: "INTERNAL_SERVER_ERROR",
    details: []
  });
};
