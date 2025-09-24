import { NutritionalValues } from "components/Nutrition/helpers/nutritionalValues";
import { Ingredient } from "components/Nutrition/models/Ingredient";
import { NutritionWeightUnit } from "components/Nutrition/models/weightUnit";
import { Adapter } from "utils/Adapter";

export interface ApiNutritionDiaryType {
    id: number,
    plan: number,
    meal: number | null,
    ingredient: number,
    weight_unit: number,
    datetime: Date,
    amount: string
}

export type DiaryEntryConstructorParams = {
    id?: number;
    planId: number;
    mealId?: number | null;
    ingredientId: number;
    weightUnitId?: number | null;
    amount: number;
    datetime: Date;
    ingredient?: Ingredient | null;
    weightUnit?: NutritionWeightUnit | null;
};

export class DiaryEntry {

    public id?: number | null;
    public planId: number;
    public mealId: number | null;
    public amount: number;
    public datetime: Date;

    public ingredientId: number;
    public ingredient: Ingredient | null = null;
    public weightUnitId: number | null;
    public weightUnit: NutritionWeightUnit | null = null;


    constructor(params: DiaryEntryConstructorParams) {
        this.id = params.id ?? null;
        this.planId = params.planId;
        this.mealId = params.mealId ?? null;
        this.amount = params.amount;
        this.datetime = params.datetime;

        this.ingredientId = params.ingredientId;
        if (params.ingredient) {
            this.ingredient = params.ingredient;
            this.ingredientId = params.ingredient.id;
        }

        this.weightUnitId = params.weightUnitId ?? null;
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
        console.log('Diary entry has no ingredient, returning empty NutritionalValues object');
        return new NutritionalValues();
    }

    static clone(other: DiaryEntry, overrides?: Partial<DiaryEntryConstructorParams>): DiaryEntry {
        const ingredient = overrides?.ingredient ?? other.ingredient;
        const weightUnit = overrides?.weightUnit ?? other.weightUnit;

        return new DiaryEntry({
            id: overrides?.id ?? (other.id ?? undefined),
            planId: overrides?.planId ?? other.planId,
            mealId: overrides?.mealId ?? other.mealId,
            amount: overrides?.amount ?? other.amount,
            datetime: overrides?.datetime ?? other.datetime,
            ingredientId: ingredient ? ingredient.id : (overrides?.ingredientId ?? other.ingredientId),
            ingredient,
            weightUnitId: weightUnit ? weightUnit.id : (overrides?.weightUnitId ?? other.weightUnitId),
            weightUnit,
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): DiaryEntry {
        return adapter.fromJson(json);
    }

    toJson() {
        return adapter.toJson(this);
    }
}

class DiaryEntryAdapter implements Adapter<DiaryEntry> {
    fromJson(item: ApiNutritionDiaryType) {
        return new DiaryEntry({
            id: item.id,
            planId: item.plan,
            mealId: item.meal,
            ingredientId: item.ingredient,
            weightUnitId: item.weight_unit,
            amount: parseFloat(item.amount),
            datetime: new Date(item.datetime),
        });
    }

    toJson(item: DiaryEntry) {
        return {
            plan: item.planId,
            meal: item.mealId,
            ingredient: item.ingredientId,

            // eslint-disable-next-line camelcase
            weight_unit: item.weightUnitId,
            amount: item.amount.toString(),
            datetime: item.datetime.toISOString(),
        };
    }
}


const adapter = new DiaryEntryAdapter();