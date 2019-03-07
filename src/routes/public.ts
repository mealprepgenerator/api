import router = require("koa-joi-router");

import analyzeRecipe from "../controllers/analyzeRecipe";
import saveMealPlan from "../controllers/saveMealPlan";
import showMealPlan from "../controllers/showMealPlan";

import { draftPlanDataSchema, mealPlanDataSchema } from "../models/mealPlan";
import { recipeDataSchema } from "../models/recipe";

const Joi = router.Joi;

export function createRouter() {
  const pub = router();

  const routes: router.Spec[] = [
    {
      handler: analyzeRecipe,
      method: "get",
      path: "/analyze",
      validate: {
        output: {
          200: {
            body: recipeDataSchema
          }
        },
        query: {
          recipeUrl: Joi.string().required()
        }
      }
    },
    {
      handler: showMealPlan,
      method: "get",
      path: "/plans/:planId",
      validate: {
        output: {
          200: {
            body: mealPlanDataSchema
          }
        },
        params: {
          planId: mealPlanDataSchema.id
        }
      }
    },
    {
      handler: saveMealPlan,
      method: "post",
      path: "/plans",
      validate: {
        body: draftPlanDataSchema,
        output: {
          200: {
            body: mealPlanDataSchema
          }
        },
        type: "json"
      }
    }
  ];

  pub.route(routes);

  return pub;
}
