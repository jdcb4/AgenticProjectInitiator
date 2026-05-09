import { z } from "zod";

export const ServerEnvSchema = z.object({
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});
export type ServerEnv = z.infer<typeof ServerEnvSchema>;

export const ClientEnvSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
});
export type ClientEnv = z.infer<typeof ClientEnvSchema>;
