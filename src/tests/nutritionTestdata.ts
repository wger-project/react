import { Meal } from "components/Nutrition/models/meal";
import { MealItem } from "components/Nutrition/models/mealItem";
import { NutritionalPlan } from "components/Nutrition/models/nutritionalPlan";
import { NutritionWeightUnit } from "components/Nutrition/models/weightUnit";
import {
    TEST_INGREDIENT_1,
    TEST_INGREDIENT_2,
    TEST_INGREDIENT_3,
    TEST_INGREDIENT_4,
    TEST_INGREDIENT_5
} from "tests/ingredientTestdata";
import {
    TEST_DIARY_ENTRY_1,
    TEST_DIARY_ENTRY_10,
    TEST_DIARY_ENTRY_11,
    TEST_DIARY_ENTRY_12,
    TEST_DIARY_ENTRY_13,
    TEST_DIARY_ENTRY_14,
    TEST_DIARY_ENTRY_15,
    TEST_DIARY_ENTRY_2,
    TEST_DIARY_ENTRY_3,
    TEST_DIARY_ENTRY_4,
    TEST_DIARY_ENTRY_5,
    TEST_DIARY_ENTRY_6,
    TEST_DIARY_ENTRY_7,
    TEST_DIARY_ENTRY_8,
    TEST_DIARY_ENTRY_9
} from "tests/nutritionDiaryTestdata";
import { HHMMToDateTime } from "utils/date";

export const TEST_WEIGHT_UNIT_SLICE = new NutritionWeightUnit(
    5432,
    1,
    50,
    'slice',
);
export const TEST_WEIGHT_UNIT_CUP = new NutritionWeightUnit(
    5544,
    1,
    300,
    'Cup',
);


export const TEST_MEAL_ITEM_1 = new MealItem(
    42,
    101,
    null,
    120,
    3,
    TEST_INGREDIENT_1
);
export const TEST_MEAL_ITEM_2 = new MealItem(
    43,
    102,
    null,
    220,
    1,
    TEST_INGREDIENT_2
);
export const TEST_MEAL_ITEM_3 = new MealItem(
    45,
    104,
    null,
    320,
    2,
    TEST_INGREDIENT_4
);

export const TEST_MEAL_ITEM_4 = new MealItem(
    46,
    105,
    null,
    320,
    1,
    TEST_INGREDIENT_5
);

export const TEST_MEAL_ITEM_5 = new MealItem(
    47,
    101,
    null,
    320,
    1,
    TEST_INGREDIENT_1
);

export const TEST_MEAL_ITEM_6 = new MealItem(
    48,
    102,
    null,
    100,
    2,
    TEST_INGREDIENT_2
);
export const TEST_MEAL_ITEM_7 = new MealItem(
    103,
    109,
    null,
    100,
    1,
    TEST_INGREDIENT_3
);

export const TEST_MEAL_ITEM_8 = new MealItem(
    104,
    110,
    null,
    120,
    1,
    TEST_INGREDIENT_4
);


export const TEST_MEAL_1 = new Meal(
    78,
    2,
    HHMMToDateTime('12:30'),
    'Second breakfast',
);
TEST_MEAL_1.items = [TEST_MEAL_ITEM_1, TEST_MEAL_ITEM_2, TEST_MEAL_ITEM_3];


export const TEST_MEAL_2 = new Meal(
    999,
    3,
    HHMMToDateTime('22:30'),
    'evening snack',
);
TEST_MEAL_2.items = [TEST_MEAL_ITEM_4];

export const TEST_MEAL_3 = new Meal(
    1,
    1,
    HHMMToDateTime('6:30'),
    'breakfast',
);
TEST_MEAL_3.items = [TEST_MEAL_ITEM_5, TEST_MEAL_ITEM_6];

export const TEST_MEAL_4 = new Meal(
    2,
    1,
    HHMMToDateTime('7:45'),
    'Cake time',
);
TEST_MEAL_4.items = [TEST_MEAL_ITEM_7];

export const TEST_MEAL_5 = new Meal(
    22,
    2,
    HHMMToDateTime('12:00'),
    'Time to visit McDonalds',
);
TEST_MEAL_5.items = [TEST_MEAL_ITEM_8];

export const TEST_NUTRITIONAL_PLAN_1 = new NutritionalPlan({
    id: 101,
    creationDate: new Date('2023-01-01'),
    description: 'Summer body!!!',
});
TEST_NUTRITIONAL_PLAN_1.meals = [
    TEST_MEAL_1,
    TEST_MEAL_2,
    TEST_MEAL_3,
];

TEST_NUTRITIONAL_PLAN_1.diaryEntries = [
    TEST_DIARY_ENTRY_1,
    TEST_DIARY_ENTRY_2,
    TEST_DIARY_ENTRY_3,
    TEST_DIARY_ENTRY_4,
    TEST_DIARY_ENTRY_5,
    TEST_DIARY_ENTRY_6,
    TEST_DIARY_ENTRY_7,
    TEST_DIARY_ENTRY_8,
    TEST_DIARY_ENTRY_9,
    TEST_DIARY_ENTRY_10,
    TEST_DIARY_ENTRY_11,
    TEST_DIARY_ENTRY_12,
    TEST_DIARY_ENTRY_13,
    TEST_DIARY_ENTRY_14,
    TEST_DIARY_ENTRY_15,
];


export const TEST_NUTRITIONAL_PLAN_2 = new NutritionalPlan({
    id: 222,
    creationDate: new Date('2023-08-01'),
    description: 'Bulking till we puke',
});
TEST_NUTRITIONAL_PLAN_2.meals = [TEST_MEAL_4, TEST_MEAL_5];