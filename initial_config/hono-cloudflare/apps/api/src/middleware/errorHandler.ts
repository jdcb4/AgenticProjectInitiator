import type { ErrorHandler } from "hono";
import { ZodError } from "zod";

import type { AppEnv } from "../types";

export const errorHandler: ErrorHandler<AppEnv> = (err, c) => {
  if (err instanceof ZodError) {
    return c.json({ error: "ValidationError", issues: err.issues }, 400);
  }
  console.error(err);
  return c.json({ error: "InternalServerError" }, 500);
};
