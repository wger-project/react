import { NutritionalValues } from "components/Nutrition/helpers/nutritionalValues";
import { Ingredient } from "components/Nutrition/models/Ingredient";
import { NutritionWeightUnit } from "components/Nutrition/models/weightUnit";
import { ApiNutritionDiaryType } from "types";
import { Adapter } from "utils/Adapter";

export class DiaryEntry {

    public ingredient: Ingredient | null = null;
    public weightUnit: NutritionWeightUnit | null = null;


    constructor(
        public id: number,
        public planId: number,
        public mealId: number | null,
        public ingredientId: number,
        public weightUnitId: number | null,
        public amount: number,
        public datetime: Date,
        ingredient?: Ingredient,
        weightUnit?: NutritionWeightUnit | null
    ) {
        if (ingredient) {
            this.ingredient = ingredient;
        }
        if (weightUnit) {
            this.weightUnit = weightUnit;
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
}


export class DiaryEntryAdapter implements Adapter<DiaryEntry> {
    fromJson(item: ApiNutritionDiaryType) {
        return new DiaryEntry(
            item.id,
            item.plan,
            item.meal,
            item.ingredient,
            item.weight_unit,
            parseFloat(item.amount),
            new Date(item.datetime)
        );
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