import { NutritionalValues } from "components/Nutrition/helpers/nutritionalValues";
import { DiaryEntry } from "components/Nutrition/models/diaryEntry";
import { Ingredient } from "components/Nutrition/models/Ingredient";
import { NutritionWeightUnit } from "components/Nutrition/models/weightUnit";
import { Adapter } from "utils/Adapter";

export interface ApiMealItemType {
    id: number,
    meal: number,
    ingredient: number,
    weight_unit: number,
    order: number,
    amount: string
}

export type MealItemConstructorParams = {
    id?: number;
    mealId: number;
    amount: number;
    order: number;

    ingredientId: number;
    ingredient?: Ingredient | null;

    weightUnitId?: number | null;
    weightUnit?: NutritionWeightUnit | null;
};

export class MealItem {
    public id?: number | null;
    public mealId: number;
    public ingredientId: number;
    public weightUnitId: number | null;
    public amount: number;
    public order: number;
    public ingredient: Ingredient | null = null;
    public weightUnit: NutritionWeightUnit | null = null;

    constructor(params: MealItemConstructorParams) {
        this.id = params.id || null;
        this.mealId = params.mealId;
        this.amount = params.amount;
        this.order = params.order;

        this.ingredientId = params.ingredientId;
        this.weightUnitId = params.weightUnitId ?? null;
        if (params.ingredient) {
            this.ingredient = params.ingredient;
            this.ingredientId = params.ingredient.id;
        }
        if (params.weightUnit) {
            this.weightUnit = params.weightUnit;
            this.weightUnitId = params.weightUnit.id;
        }
    }

    get amountString(): string {
        return this.amount.toFixed().toString() + (this.weightUnitId !== null ? ` ${this.weightUnit?.name}` : 'g');
    }

    get nutritionalValues() {
        if (this.ingredient) {
            return NutritionalValues.fromIngredient(this.ingredient, this.amount, this.weightUnit);
        }
        return new NutritionalValues();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): MealItem {
        return adapter.fromJson(json);
    }

    static clone(other: MealItem, overrides?: Partial<MealItemConstructorParams>): MealItem {
        const ingredient = overrides?.ingredient ?? other.ingredient;
        const weightUnit = overrides?.weightUnit ?? other.weightUnit;

        return new MealItem({
            id: overrides?.id ?? (other.id ?? undefined),
            mealId: overrides?.mealId ?? other.mealId,
            amount: overrides?.amount ?? other.amount,
            order: overrides?.order ?? other.order,
            ingredientId: ingredient ? ingredient.id : (overrides?.ingredientId ?? other.ingredientId),
            ingredient,
            weightUnitId: weightUnit ? weightUnit.id : (overrides?.weightUnitId ?? other.weightUnitId),
            weightUnit,
        });
    }

    diaryEntry(planId: number, date?: Date): DiaryEntry {
        return new DiaryEntry({
            mealId: this.mealId,
            planId: planId,
            amount: this.amount,
            datetime: date || new Date(),
            ingredient: this.ingredient,
            ingredientId: this.ingredientId,
            weightUnitId: this.weightUnitId,
            weightUnit: this.weightUnit,
        });
    }

    toJson() {
        return adapter.toJson(this);
    }
}


class MealItemAdapter implements Adapter<MealItem> {
    fromJson(item: ApiMealItemType) {
        return new MealItem({
            id: item.id,
            mealId: item.meal,
            ingredientId: item.ingredient,
            weightUnitId: item.weight_unit,
            amount: parseFloat(item.amount),
            order: item.order,
        });
    }

    toJson(item: MealItem) {
        return {
            ...(item.id != null ? { id: item.id } : {}),
            meal: item.mealId,
            ingredient: item.ingredientId,

            // eslint-disable-next-line camelcase
            weight_unit: item.weightUnitId,
            amount: item.amount.toString(),
            order: item.order,
        };
    }
}

const adapter = new MealItemAdapter();