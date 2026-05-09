import { createServer } from "node:http";
import { Server as IOServer } from "socket.io";

import { createApp } from "./app";
import { env } from "./config/env";
import { registerSockets } from "./sockets";

const app = createApp();
const httpServer = createServer(app);

const io = new IOServer(httpServer, {
  cors: { origin: env.CORS_ORIGIN },
});

registerSockets(io);

httpServer.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${env.PORT}`);
});
