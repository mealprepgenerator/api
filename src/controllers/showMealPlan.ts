import * as Koa from "koa";

export default async function saveMealPlan(ctx: Koa.Context) {
  const { planId } = ctx.params;
  const mealPlan = await ctx.mealPlan.get(planId);

  if (!mealPlan) {
    ctx.throw(404);
  }

  ctx.body = mealPlan;
}
