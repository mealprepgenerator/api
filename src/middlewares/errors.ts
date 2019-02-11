import * as Koa from "koa";

export function createMiddleware(): Koa.Middleware {
  return async (ctx: Koa.Context, next: any) => {
    try {
      await next();

      const status = ctx.status;
      if (status === 404) {
        ctx.throw(404);
      }
    } catch (err) {
      ctx.status = err.status || 500;

      ctx.body = {
        error: err.expose
          ? err.message
          : "Whoops, something went wrong",
      };

      if (!err.expose) {
        ctx.log.error(err);
      }

      ctx.app.emit("error", err, ctx);
    }
  };
}
