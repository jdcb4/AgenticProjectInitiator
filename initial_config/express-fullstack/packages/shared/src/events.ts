/**
 * Shared Socket.io event schemas.
 *
 * Both client and server import from here so the wire format stays in sync.
 * Add events here before wiring them into the server or client.
 */
import { z } from "zod";

export const PingSchema = z.object({ at: z.string() });
export type Ping = z.infer<typeof PingSchema>;

export const PongSchema = z.object({ at: z.string() });
export type Pong = z.infer<typeof PongSchema>;
