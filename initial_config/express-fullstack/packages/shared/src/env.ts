import { z } from "zod";

export const ServerEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
});
export type ServerEnv = z.infer<typeof ServerEnvSchema>;

export const ClientEnvSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
});
export type ClientEnv = z.infer<typeof ClientEnvSchema>;
