import * as squel from "squel";

import Joi = require("joi");

import shortid = require("shortid");

import { DatabaseClient } from "../clients/database";

export interface DraftPlanData {
  groups: DraftGroupData[];
}

export interface DraftGroupData {
  label: string;
  items: DraftPlanItem[];
}

export interface DraftPlanItem {
  servings: number;
  recipeUrl: string;
}

export interface MealPlanData {
  id: string;
  groups: MealGroupData[];
}

export interface MealPlanItem {
  id: number;
  servings: number;
  recipeUrl: string;
}

export interface MealGroupData {
  id: number;
  label: string;
  items: MealPlanItem[];
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

  public async save(plan: DraftPlanData): Promise<MealPlanData> {
    return this.database.trans(async client => {
      const newMealPlanId = shortid.generate();

      await client.query(
        this.sqlBuilder
          .insert()
          .into("meal_plan")
          .set("id", newMealPlanId)
          .toParam()
      );

      const groupData: MealGroupData[] = [];
      for (const group of plan.groups) {
        const {
          rows: [g]
        } = await client.query(
          this.sqlBuilder
            .insert()
            .into("meal_group")
            .set("label", group.label)
            .set("meal_plan_id", newMealPlanId)
            .returning("*")
            .toParam()
        );

        const items: MealPlanItem[] = [];
        for (const item of group.items) {
          const {
            rows: [r]
          } = await client.query(
            this.sqlBuilder
              .insert()
              .into("meal_plan_item")
              .set("servings", item.servings)
              .set("meal_plan_id", newMealPlanId)
              .set("group_id", g.id)
              .set("recipe_url", item.recipeUrl)
              .returning("*")
              .toParam()
          );

          items.push({
            id: r.id,
            recipeUrl: item.recipeUrl,
            servings: item.servings
          });
        }

        groupData.push({
          id: g.id,
          items,
          label: group.label
        });
      }

      return {
        groups: groupData,
        id: newMealPlanId
      };
    });
  }

  public async get(id: string): Promise<MealPlanData | null> {
    const result = await this.database.query(
      this.sqlBuilder
        .select()
        .field("g.id")
        .field("g.label")
        .field(
          "COALESCE(json_agg(i.*) FILTER (WHERE i.id IS NOT NULL), '[]')",
          "items"
        )
        .from("meal_group", "g")
        .left_join("meal_plan_item", "i", "g.id = i.group_id")
        .where("g.meal_plan_id = ?", id)
        .group("g.id")
        .toParam()
    );

    if (!result.rowCount) {
      return null;
    }

    return {
      groups: result.rows.map(g => ({
        id: g.id,
        items: g.items.map((i: any) => ({
          id: i.id,
          recipeUrl: i.recipe_url,
          servings: i.servings
        })),
        label: g.label
      })),
      id
    };
  }
}

export const draftPlanItemSchema = {
  recipeUrl: Joi.string().required(),
  servings: Joi.number().required()
};

export const draftPlanGroupSchema = {
  items: Joi.array()
    .items([draftPlanItemSchema])
    .required(),
  label: Joi.string().required()
};

export const draftPlanDataSchema = {
  groups: Joi.array()
    .items([draftPlanGroupSchema])
    .required()
};

export const mealPlanItemSchema = {
  ...draftPlanItemSchema,
  id: Joi.number().required()
};

export const mealPlanGroupSchema = {
  id: Joi.number().required(),
  items: Joi.array()
    .items([mealPlanItemSchema])
    .required(),
  label: Joi.string().required()
};

export const mealPlanDataSchema = {
  groups: Joi.array()
    .items([mealPlanGroupSchema])
    .required(),
  id: Joi.string().required()
};
