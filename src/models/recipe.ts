import { get, post } from "got";
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

    return {
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
  }
}
