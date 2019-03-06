import * as Koa from "koa";

export function createMiddleware() {
  return async (ctx: Koa.Context, next: any) => {
    ctx.set({
      "Access-Control-Allow-Headers":
        "Origin, X-Requested-With, Content-Type, Accept",
      "Access-Control-Allow-Methods": "GET,HEAD,PUT,POST,DELETE,PATCH",
      "Access-Control-Allow-Origin": "*"
    });

    await next();
  };
}
