import http from "http";

import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";

const server = http.createServer(app);

server.listen(env.PORT, () => {
  logger.info(
    `🚀 Veritas backend running on http://localhost:${env.PORT}`
  );
});
