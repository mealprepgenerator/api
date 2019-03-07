import * as squel from "squel";

import Joi = require("joi");

import shortid = require("shortid");

import { DatabaseClient } from "../clients/database";

export interface DraftPlanData {
  groups: MealGroupData[];
}

export interface DraftGroupData {
  label: string;
  items: DraftPlanItem[];
}

export interface DraftPlanItem {
  servings: number;
  recipeUrl: string;
}

export interface MealPlanData extends DraftPlanData {
  id: string;
}

export interface MealPlanItem extends DraftPlanItem {
  id: number;
}

export interface MealGroupData extends DraftGroupData {
  id: number;
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
        .field("json_agg(i.*)", "items")
        .from("meal_group", "g")
        .join("meal_plan_item", "i", "g.id = i.group_id")
        .where("g.meal_plan_id = ?", id)
        .group("g.id")
        .toParam()
    );

    if (!result.rowCount) {
      return null;
    }

    return {
      groups: result.rows,
      id: result.rows[0].meal_plan_id
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
  ...draftPlanGroupSchema,
  id: Joi.number().required()
};

export const mealPlanDataSchema = {
  ...draftPlanDataSchema,
  id: Joi.string().required()
};
