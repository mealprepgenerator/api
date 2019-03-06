import * as Logger from "bunyan";
import throng = require("throng");

import * as db from "./clients/database";
import { createConfig } from "./config";
import { createServer } from "./server";

const config = createConfig();
const client = new db.DatabaseClient(config.databaseUrl);

function start(id?: number) {
  const logger = Logger.createLogger({
    level: config.logLevel,
    name: `${config.logName}${id && `-${id}`}`
  });
  const server = createServer(config, logger, client);
  server.listen(config.port);
  logger.info({ port: config.port }, `Listening...`);
}

if (config.webConcurrency > 1) {
  throng({
    lifetime: Infinity,
    start,
    workers: config.webConcurrency
  });
} else {
  // For development, it's a lot easier to debug with one unforked
  // process because VSCode doesn't know what to do so it's
  // breakpoints won't work.
  start();
}
