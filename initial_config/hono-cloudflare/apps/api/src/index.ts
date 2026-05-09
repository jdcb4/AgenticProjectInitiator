import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { health } from "./routes/health";
import { errorHandler } from "./middleware/errorHandler";
import type { AppEnv } from "./types";

const app = new Hono<AppEnv>();

app.use("*", logger());
app.use("*", cors());

app.route("/health", health);

app.onError(errorHandler);

app.notFound((c) => c.json({ error: "Not Found" }, 404));

export default app;
