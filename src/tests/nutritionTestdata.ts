import { NutritionalPlan } from "components/Nutrition/models/nutritionalPlan";
import { Meal } from "components/Nutrition/models/meal";
import { MealItem } from "components/Nutrition/models/mealItem";
import { Ingredient } from "components/Nutrition/models/Ingredient";

export const TEST_INGREDIENT_1 = new Ingredient(
    101,
    "3af59658-7d83-4b0a-82f9-9f0edc0f00d5",
    "00975957",
    "0% fat Greek style yogurt",
    1,
    5.700,
    18.600,
    10.200,
    3.300,
    0.900,
    0.500,
    0.040,
);

export const TEST_INGREDIENT_2 = new Ingredient(
    102,
    "18985fac-a519-4ebe-9017-b2fc3be91357",
    "4005967511077",
    "1001 Nacht Haferbrei",
    351,
    10.400,
    61.100,
    17.100,
    5.100,
    1.000,
    9.300,
    0.008,
);

export const TEST_INGREDIENT_3 = new Ingredient(
    103,
    "ef7b50e0-5a2f-4060-8f9d-dd6b181d393c",
    "0082592720153",
    "100% boosted juice smoothie",
    60,
    0.890,
    14.000,
    11.780,
    0.000,
    0.000,
    0.000,
    0.006,
);

export const TEST_INGREDIENT_4 = new Ingredient(
    104,
    "20a2ed05-f216-414a-a4a5-515d5bb9cb85",
    "3596710427192",
    "100% Cacao Boissons et Pâtisseries",
    385,
    22.000,
    12.000,
    1.900,
    21.000,
    13.000,
    30.000,
    0.020,
);

export const TEST_INGREDIENT_5 = new Ingredient(
    105,
    "12512223-5df8-457b-9f1f-9ff409e828fb",
    "3036850776410",
    "100% cacao non sucré",
    367,
    19.000,
    12.000,
    1.900,
    21.000,
    13.000,
    27.000,
    0.020,
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
    42,
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
    '12:30',
    'Second breakfast',
);
TEST_MEAL_1.items = [TEST_MEAL_ITEM_1, TEST_MEAL_ITEM_2, TEST_MEAL_ITEM_3];


export const TEST_MEAL_2 = new Meal(
    999,
    3,
    '22:30',
    'evening snack',
);
TEST_MEAL_2.items = [TEST_MEAL_ITEM_4];

export const TEST_MEAL_3 = new Meal(
    1,
    1,
    '6:30',
    'breakfast',
);
TEST_MEAL_3.items = [TEST_MEAL_ITEM_5, TEST_MEAL_ITEM_6];

export const TEST_MEAL_4 = new Meal(
    2,
    1,
    '7:45',
    'Cake time',
);
TEST_MEAL_4.items = [TEST_MEAL_ITEM_7];

export const TEST_MEAL_5 = new Meal(
    22,
    2,
    '12:00',
    'Time to visit McDonalds',
);
TEST_MEAL_5.items = [TEST_MEAL_ITEM_8];

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