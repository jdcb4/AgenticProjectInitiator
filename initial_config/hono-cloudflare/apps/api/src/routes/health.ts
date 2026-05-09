import { Hono } from "hono";

import type { AppEnv } from "../types";

export const health = new Hono<AppEnv>();

health.get("/", (c) =>
  c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  }),
);
