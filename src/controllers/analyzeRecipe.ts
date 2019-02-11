import * as Koa from "koa";

export default async function analyzeRecipe(ctx: Koa.Context) {
  const { recipeUrl } = ctx.query;
  ctx.body = await ctx.recipe.get(recipeUrl);
}
