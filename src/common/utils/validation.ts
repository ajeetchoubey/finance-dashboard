import { z } from "zod";

import { AppError } from "../errors/app-error.js";

export function validateOrThrow<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);

  if (result.success) {
    return result.data;
  }

  throw new AppError(
    400,
    "Validation failed",
    "VALIDATION_ERROR",
    result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message
    }))
  );
}
