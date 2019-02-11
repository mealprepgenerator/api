import * as Router from "koa-router";

import analyzeRecipe from "../controllers/analyzeRecipe";
import saveMealPlan from "../controllers/saveMealPlan";
import showMealPlan from "../controllers/showMealPlan";

export function createRouter() {
  const router = new Router();
  router.get("/analyze", analyzeRecipe);
  router.get("/plans/:planId", showMealPlan);
  router.post("/plans", saveMealPlan);
  return router;
}
