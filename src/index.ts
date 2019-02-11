import * as Logger from "bunyan";

import * as db from "./clients/database";
import { createConfig } from "./config";
import { createServer } from "./server";

const config = createConfig();
const logger = Logger.createLogger({
  level: config.logLevel,
  name: config.logName,
});
const client = new db.DatabaseClient(config.databaseUrl);
const server = createServer(config, logger, client);
server.listen(config.port);

logger.info({ port: config.port }, `Listening...`);
