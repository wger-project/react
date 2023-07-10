import { NutritionalPlan } from "components/Nutrition/models/nutritionalPlan";
import { Meal } from "components/Nutrition/models/meal";

export const TEST_MEAL_1 = new Meal(
    78,
    2,
    '12:30',
    'Second breakfast',
);
export const TEST_MEAL_2 = new Meal(
    999,
    3,
    '22:30',
    'evening snack',
);
export const TEST_MEAL_3 = new Meal(
    1,
    1,
    '6:30',
    'breakfast',
);

export const TEST_MEAL_4 = new Meal(
    2,
    1,
    '7:45',
    'Cake time',
);
export const TEST_MEAL_5 = new Meal(
    22,
    2,
    '12:00',
    'Time to visit McDonalds',
);

export const TEST_NUTRITIONAL_PLAN_1 = new NutritionalPlan(
    101,
    new Date('2023-01-01'),
    'Summer body!!!',
);
TEST_NUTRITIONAL_PLAN_1.meals = [TEST_MEAL_1, TEST_MEAL_2, TEST_MEAL_3];


export const TEST_NUTRITIONAL_PLAN_2 = new NutritionalPlan(
    222,
    new Date('2023-08-01'),
    'Bulking till we puke',
);
TEST_NUTRITIONAL_PLAN_2.meals = [TEST_MEAL_4, TEST_MEAL_5];