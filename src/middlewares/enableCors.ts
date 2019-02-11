import * as Koa from "koa";

import { Config } from "../config";

export function createMiddleware(config: Config) {
  return async (ctx: Koa.Context, next: any) => {
    if (config.nodeEnv === "development") {
      ctx.set({
        "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
        "Access-Control-Allow-Methods": "GET,HEAD,PUT,POST,DELETE,PATCH",
        "Access-Control-Allow-Origin": "*",
      });
    }

    await next();
  };
}
