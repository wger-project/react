import { DiaryEntry } from "components/Nutrition/models/diaryEntry";
import { TEST_INGREDIENT_1, TEST_INGREDIENT_2, TEST_INGREDIENT_3, TEST_INGREDIENT_4 } from "tests/ingredientTestdata";


export const TEST_DIARY_ENTRY_1 = new DiaryEntry({
    id: 42,
    planId: 1,
    mealId: 78,
    ingredientId: 101,
    weightUnitId: null,
    amount: 120,
    datetime: new Date("2023-07-01"),
    ingredient: TEST_INGREDIENT_1
});

export const TEST_DIARY_ENTRY_2 = new DiaryEntry({
    id: 44,
    planId: 1,
    mealId: 78,
    ingredientId: 102,
    weightUnitId: null,
    amount: 50,
    datetime: new Date("2023-07-01"),
    ingredient: TEST_INGREDIENT_2
});

export const TEST_DIARY_ENTRY_3 = new DiaryEntry({
    id: 45,
    planId: 1,
    mealId: 78,
    ingredientId: 103,
    weightUnitId: null,
    amount: 200,
    datetime: new Date("2023-07-01"),
    ingredient: TEST_INGREDIENT_3
});

export const TEST_DIARY_ENTRY_4 = new DiaryEntry({
    id: 46,
    planId: 1,
    mealId: 78,
    ingredientId: 103,
    weightUnitId: null,
    amount: 20,
    datetime: new Date("2023-07-02"),
    ingredient: TEST_INGREDIENT_3
});

export const TEST_DIARY_ENTRY_5 = new DiaryEntry({
    id: 47,
    planId: 1,
    mealId: 78,
    ingredientId: 103,
    weightUnitId: null,
    amount: 20,
    datetime: new Date("2023-07-03"),
    ingredient: TEST_INGREDIENT_3
});

export const TEST_DIARY_ENTRY_6 = new DiaryEntry({
    id: 48,
    planId: 1,
    mealId: 78,
    ingredientId: 103,
    weightUnitId: null,
    amount: 50,
    datetime: new Date("2023-07-04"),
    ingredient: TEST_INGREDIENT_3
});

export const TEST_DIARY_ENTRY_7 = new DiaryEntry({
    id: 49,
    planId: 1,
    mealId: 78,
    ingredientId: 103,
    weightUnitId: null,
    amount: 50,
    datetime: new Date("2023-07-05"),
    ingredient: TEST_INGREDIENT_3
});

export const TEST_DIARY_ENTRY_8 = new DiaryEntry({
    id: 50,
    planId: 1,
    mealId: 78,
    ingredientId: 103,
    weightUnitId: null,
    amount: 100,
    datetime: new Date("2023-07-06"),
    ingredient: TEST_INGREDIENT_3
});

export const TEST_DIARY_ENTRY_9 = new DiaryEntry({
    id: 51,
    planId: 1,
    mealId: 999,
    ingredientId: 103,
    weightUnitId: null,
    amount: 80,
    datetime: new Date("2023-07-07"),
    ingredient: TEST_INGREDIENT_3
});

export const TEST_DIARY_ENTRY_10 = new DiaryEntry({
    id: 51,
    planId: 1,
    mealId: 78,
    ingredientId: 103,
    weightUnitId: null,
    amount: 80,
    datetime: new Date("2023-07-08"),
    ingredient: TEST_INGREDIENT_3
});

export const TEST_DIARY_ENTRY_11 = new DiaryEntry({
    id: 52,
    planId: 1,
    mealId: 999,
    ingredientId: 103,
    weightUnitId: null,
    amount: 500,
    datetime: new Date("2023-06-01"),
    ingredient: TEST_INGREDIENT_3
});

export const TEST_DIARY_ENTRY_12 = new DiaryEntry({
    id: 52,
    planId: 1,
    mealId: 999,
    ingredientId: 104,
    weightUnitId: null,
    amount: 500,
    datetime: new Date("2023-06-15"),
    ingredient: TEST_INGREDIENT_4
});

export const TEST_DIARY_ENTRY_13 = new DiaryEntry({
    id: 53,
    planId: 1,
    mealId: 78,
    ingredientId: 104,
    weightUnitId: null,
    amount: 500,
    datetime: new Date("2023-06-20"),
    ingredient: TEST_INGREDIENT_4
});

export const TEST_DIARY_ENTRY_14 = new DiaryEntry({
    id: 54,
    planId: 1,
    mealId: null,
    ingredientId: 104,
    weightUnitId: null,
    amount: 20,
    datetime: new Date("2023-08-20"),
    ingredient: TEST_INGREDIENT_4
});
export const TEST_DIARY_ENTRY_15 = new DiaryEntry({
    id: 54,
    planId: 1,
    mealId: null,
    ingredientId: 103,
    weightUnitId: null,
    amount: 50,
    datetime: new Date("2023-08-20"),
    ingredient: TEST_INGREDIENT_4
});
