import { Adapter } from "utils/Adapter";
import { ApiNutritionDiaryType } from "types";
import { Ingredient } from "components/Nutrition/models/Ingredient";
import { NutritionalValues } from "components/Nutrition/helpers/nutritionalValues";
import { NutritionWeightUnit } from "components/Nutrition/models/weightUnit";

export class DiaryEntry {


    constructor(
        public id: number,
        public planId: number,
        public mealId: number | null,
        public ingredientId: number,
        public weightUnitId: number | null,
        public amount: number,
        public datetime: Date,
        public ingredient?: Ingredient,
        public weightUnit?: NutritionWeightUnit | null
    ) {
    }

    get nutritionalValues(): NutritionalValues {
        const out = new NutritionalValues();

        if (this.ingredient == null) {
            return out;
        }

        const weight = this.weightUnit == null
            ? this.amount
            : this.amount * this.weightUnit.amount * this.weightUnit.grams;

        out.energy = this.ingredient.energy * weight / 100;
        out.protein = this.ingredient.protein * weight / 100;
        out.carbohydrates = this.ingredient.carbohydrates * weight / 100;
        out.carbohydratesSugar = this.ingredient.carbohydratesSugar ? this.ingredient.carbohydratesSugar * weight / 100 : 0;
        out.fat = this.ingredient.fat * weight / 100;
        out.fatSaturated = this.ingredient.fatSaturated ? this.ingredient.fatSaturated * weight / 100 : 0;
        out.fibres = this.ingredient.fibres ? this.ingredient.fibres * weight / 100 : 0;
        out.sodium = this.ingredient.sodium ? this.ingredient.sodium * weight / 100 : 0;

        return out;
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