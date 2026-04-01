import type { RequestHandler } from "express";

export function notImplemented(message: string): RequestHandler {
  return (_req, res) => {
    res.status(501).json({
      success: false,
      message,
      errorCode: "NOT_IMPLEMENTED",
      details: []
    });
  };
}
