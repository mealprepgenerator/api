import * as Koa from "koa";

export default async function saveMealPlan(ctx: Koa.Context) {
  const { recipes } = ctx.request.body;
  ctx.body = await ctx.mealPlan.save(recipes);
}
