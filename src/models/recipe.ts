import { get, post } from "got";
import Joi = require("joi");

import { Config } from "../config";

export interface RecipeData {
  url: string;
  name: string;
  image: string;
  servings: number;
  nutrition: NutritionData;
  ingredients: string[];
  instructions: string[];
}

export interface NutritionData {
  perDaily: NutrientData;
  perWeight: NutrientData;
  perCalories: NutrientData;
  totalWeight: number;
  totalCalories: number;
}

export interface NutrientData {
  [code: string]: {
    unit: string;
    quantity: number;
  };
}

export interface RecipeParams {
  config: Config;
}

export class RecipeModel {
  private config: Config;

  constructor(params: RecipeParams) {
    this.config = params.config;
  }

  public async get(recipeUrl: string): Promise<RecipeData> {
    const validateUrl = `${this.config.validateUrl}?recipeUrl=${recipeUrl}`;
    const { body: recipe } = await get(validateUrl, {
      json: true,
    });

    const analyzeUrl = this.config.analyzeUrl;
    const { body: nutrition } = await post(analyzeUrl, {
      body: {
        ingr: recipe.ingredients.map((i: any) => i.text),
        title: recipe.name,
        yield: recipe.recipeYield,
      },
      json: true,
    });

    const transform = {
      image: recipe.image,
      ingredients: recipe.ingredients.map((i: any) => i.text),
      instructions: recipe.instructions.map((i: any) => i.text),
      name: recipe.name,
      nutrition: {
        perCalories: nutrition.totalNutrientsKCal,
        perDaily: nutrition.totalDaily,
        perWeight: nutrition.totalNutrients,
        totalCalories: nutrition.calories,
        totalWeight: nutrition.totalWeight,
      },
      servings: recipe.recipeYield,
      url: decodeURIComponent(recipeUrl),
    };

    const { error } = Joi.validate(transform, recipeDataSchema);
    if (error) {
      throw error;
    }

    return transform;
  }
}

export const nutrientValuesSchema = {
  label: Joi.string(),
  quantity: Joi.number().required(),
  unit: Joi.string().required(),
};

export const nutrientDataSchema = Joi
  .object()
  .required()
  .keys({
    CHOCDF: nutrientValuesSchema,
    FAT: nutrientValuesSchema,
    PROCNT: nutrientValuesSchema,
  })
  .requiredKeys(["CHOCDF", "FAT", "PROCNT"])
  .unknown(true);

export const nutrientKcalDataSchema = Joi
  .object()
  .required()
  .keys({
    CHOCDF_KCAL: nutrientValuesSchema,
    FAT_KCAL: nutrientValuesSchema,
    PROCNT_KCAL: nutrientValuesSchema,
  })
  .requiredKeys(["CHOCDF_KCAL", "FAT_KCAL", "PROCNT_KCAL"])
  .unknown(true);

export const recipeDataSchema = {
  image: Joi.string(),
  ingredients: Joi.array().items([Joi.string()]).required(),
  instructions: Joi.array().items([Joi.string()]).required(),
  name: Joi.string().required(),
  nutrition: {
    perCalories: nutrientKcalDataSchema,
    perDaily: nutrientDataSchema,
    perWeight: nutrientDataSchema,
    totalCalories: Joi.number().required(),
    totalWeight: Joi.number().required(),
  },
  servings: Joi.number().required(),
  url: Joi.string().required(),
};
