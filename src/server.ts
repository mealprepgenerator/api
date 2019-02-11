import * as Logger from "bunyan";
import * as http from "http";
import * as Koa from "koa";

import koaBody = require("koa-body");
import koaBunyanLogger = require("koa-bunyan-logger");

import * as db from "./clients/database";
import * as recipe from "./models/recipe";

import { Config } from "./config";
import * as cors from "./middlewares/enableCors";
import * as errors from "./middlewares/errors";
import * as mealPlan from "./models/mealPlan";
import * as publicRouter from "./routes/public";

declare module "koa" {
  interface BaseContext {
    recipe: recipe.RecipeModel;
    mealPlan: mealPlan.MealPlanModel;
  }
}

export function createServer(config: Config, logger: Logger, database: db.DatabaseClient) {
  const app = new Koa();
  const pub = publicRouter.createRouter();

  app.context.recipe = new recipe.RecipeModel({config});
  app.context.mealPlan = new mealPlan.MealPlanModel({database});

  app.use(koaBunyanLogger(logger));
  app.use(errors.createMiddleware());
  app.use(koaBunyanLogger.requestLogger());
  app.use(koaBunyanLogger.requestIdContext());
  app.use(cors.createMiddleware(config));
  app.use(koaBody());
  app.use(pub.routes());
  app.use(pub.allowedMethods());

  return http.createServer(app.callback());
}
