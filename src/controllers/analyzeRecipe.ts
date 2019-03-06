import * as Koa from "koa";

export default async function analyzeRecipe(ctx: Koa.Context) {
  const { recipeUrl } = ctx.query;

  try {
    ctx.body = await ctx.recipe.get(recipeUrl);
  } catch (err) {
    ctx.log.debug(err);
    ctx.status = 400;
  }
}
