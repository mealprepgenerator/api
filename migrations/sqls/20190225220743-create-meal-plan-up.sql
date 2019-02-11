/* Replace with your SQL commands */

CREATE TABLE IF NOT EXISTS meal_plan (
  id TEXT PRIMARY KEY NOT NULL
);

CREATE TABLE IF NOT EXISTS meal_plan_item (
  id SERIAL PRIMARY KEY NOT NULL,
  servings INTEGER NOT NULL DEFAULT 0,
  recipe_url TEXT NOT NULL,
  meal_plan_id TEXT NOT NULL,

  CONSTRAINT no_empty_recipe
    CHECK (recipe_url != ''),

  FOREIGN KEY (meal_plan_id)
    REFERENCES meal_plan (id)
);
