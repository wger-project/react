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


export const TEST_MEAL_ITEM_1 = new MealItem({
    id: 42,
    mealId: 1001,
    amount: 120,
    order: 3,
    ingredient: TEST_INGREDIENT_1,
    ingredientId: 101,
    weightUnitId: null,
});
export const TEST_MEAL_ITEM_2 = new MealItem({
    id: 43,
    mealId: 1001,
    amount: 220,
    order: 1,
    ingredientId: 102,
    weightUnitId: null,
    ingredient: TEST_INGREDIENT_2
});
export const TEST_MEAL_ITEM_3 = new MealItem({
    id: 45,
    mealId: 1001,
    amount: 320,
    order: 2,
    ingredientId: 104,
    weightUnitId: null,
    ingredient: TEST_INGREDIENT_4
});

export const TEST_MEAL_ITEM_4 = new MealItem({
    id: 46,
    mealId: 999,
    amount: 320,
    order: 1,
    ingredientId: 105,
    weightUnitId: null,
    ingredient: TEST_INGREDIENT_5
});

export const TEST_MEAL_ITEM_5 = new MealItem({
    id: 47,
    mealId: 1,
    amount: 320,
    order: 1,
    ingredientId: 101,
    weightUnitId: null,
    ingredient: TEST_INGREDIENT_1
});

export const TEST_MEAL_ITEM_6 = new MealItem({
    id: 48,
    mealId: 123,
    amount: 100,
    order: 2,
    ingredientId: 102,
    weightUnitId: null,
    ingredient: TEST_INGREDIENT_2
});
export const TEST_MEAL_ITEM_7 = new MealItem({
    id: 103,
    mealId: 2345,
    amount: 100,
    order: 1,
    ingredientId: 109,
    weightUnitId: null,
    ingredient: TEST_INGREDIENT_3
});

export const TEST_MEAL_ITEM_8 = new MealItem({
    id: 104,
    mealId: 2222,
    amount: 120,
    order: 1,
    ingredientId: 110,
    weightUnitId: null,
    ingredient: TEST_INGREDIENT_4
});


export const TEST_MEAL_1 = new Meal({
    id: 78,
    planId: 123,
    order: 2,
    time: HHMMToDateTime('12:30'),
    name: 'Second breakfast',
});
TEST_MEAL_1.items = [TEST_MEAL_ITEM_1, TEST_MEAL_ITEM_2, TEST_MEAL_ITEM_3];


export const TEST_MEAL_2 = new Meal({
    id: 999,
    order: 3,
    time: HHMMToDateTime('22:30'),
    name: 'evening snack',
});
TEST_MEAL_2.items = [TEST_MEAL_ITEM_4];

export const TEST_MEAL_3 = new Meal({
    id: 1,
    order: 1,
    time: HHMMToDateTime('6:30'),
    name: 'breakfast',
});
TEST_MEAL_3.items = [TEST_MEAL_ITEM_5, TEST_MEAL_ITEM_6];

export const TEST_MEAL_4 = new Meal({
    id: 2,
    order: 1,
    time: HHMMToDateTime('7:45'),
    name: 'Cake time',
});
TEST_MEAL_4.items = [TEST_MEAL_ITEM_7];

export const TEST_MEAL_5 = new Meal({
    id: 22,
    order: 2,
    time: HHMMToDateTime('12:00'),
    name: 'Time to visit McDonalds',
});
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