import * as Koa from "koa";

export default async function saveMealPlan(ctx: Koa.Context) {
  ctx.body = await ctx.mealPlan.save(ctx.request.body);
}
