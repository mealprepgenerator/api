/* Replace with your SQL commands */

CREATE TABLE IF NOT EXISTS meal_group (
  id SERIAL PRIMARY KEY NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  meal_plan_id TEXT NOT NULL,

  FOREIGN KEY (meal_plan_id)
    REFERENCES meal_plan (id)
);

INSERT INTO meal_group (meal_plan_id)
SELECT meal_plan_id FROM meal_plan_item;

ALTER TABLE meal_plan_item
ADD COLUMN group_id INTEGER;

ALTER TABLE meal_plan_item
ADD CONSTRAINT meal_group_id
FOREIGN KEY (group_id)
REFERENCES meal_group (id);

UPDATE meal_plan_item
SET group_id = g1.id
FROM meal_group g1
WHERE g1.meal_plan_id = meal_plan_item.meal_plan_id;
