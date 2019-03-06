import * as squel from "squel";

import Joi = require("joi");

import shortid = require("shortid");

import { DatabaseClient } from "../clients/database";

export interface MealPlanData {
  id: number;
  recipes: MealPlanRecipe[];
}

export interface MealPlanRecipe {
  servings: number;
  recipeUrl: string;
}

export interface MealPlanParams {
  database: DatabaseClient;
}

export class MealPlanModel {
  private database: DatabaseClient;
  private sqlBuilder: squel.PostgresSquel;

  constructor(params: MealPlanParams) {
    this.database = params.database;
    this.sqlBuilder = squel.useFlavour("postgres");
  }

  public async save(recipes: MealPlanRecipe[]): Promise<MealPlanData> {
    return this.database.trans(async (client) => {
      const newMealPlanId = shortid.generate();

      await client.query(
        this.sqlBuilder
          .insert()
          .into("meal_plan")
          .set("id", newMealPlanId)
          .toParam(),
      );

      for (const recipe of recipes) {
        await client.query(
          this.sqlBuilder
            .insert()
            .into("meal_plan_item")
            .set("servings", recipe.servings)
            .set("meal_plan_id", newMealPlanId)
            .set("recipe_url", recipe.recipeUrl)
            .toParam(),
        );
      }

      return {
        id: newMealPlanId,
        recipes,
      };
    });
  }

  public async get(id: string): Promise<MealPlanData | null> {
    const result = await this.database.query(
      this.sqlBuilder
        .select()
        .field("i.*")
        .from("meal_plan", "m")
        .join("meal_plan_item", "i", "m.id = i.meal_plan_id")
        .where("m.id = ?", id)
        .toParam(),
    );

    if (!result.rowCount) {
      return null;
    }

    return {
      id: result.rows[0].meal_plan_id,
      recipes: result.rows.map((item) => ({
        recipeUrl: item.recipe_url,
        servings: item.servings,
      })),
    };
  }
}

export const mealPlanDataSchema = {
  id: Joi.string().required(),
  recipes: Joi.array().items([
    {
      recipeUrl: Joi.string().required(),
      servings: Joi.number().required(),
    },
  ]).required(),
};
