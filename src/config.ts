import { LogLevel } from "bunyan";
import * as dotenv from "dotenv";
import * as env from "env-var";

dotenv.config();

export interface Config {
  webConcurrency: number;
  databaseUrl: string;
  validateUrl: string;
  analyzeUrl: string;
  logLevel: LogLevel;
  logName: string;
  nodeEnv: string;
  port: number;
}

export function createConfig(): Config {
  return {
    analyzeUrl: env
      .get("ANALYZE_URL")
      .required()
      .asString(),
    databaseUrl: env
      .get("DATABASE_URL")
      .required()
      .asString(),
    logLevel: env
      .get("LOG_LEVEL")
      .required()
      .asIntPositive(),
    logName: env
      .get("LOG_NAME")
      .required()
      .asString(),
    nodeEnv: env
      .get("NODE_ENV")
      .required()
      .asString(),
    port: env
      .get("PORT")
      .required()
      .asIntPositive(),
    validateUrl: env
      .get("VALIDATE_URL")
      .required()
      .asString(),
    webConcurrency: env.get("WEB_CONCURRENCY", "1").asIntPositive()
  };
}
