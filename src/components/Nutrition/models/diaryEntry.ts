import { Adapter } from "utils/Adapter";
import { ApiNutritionDiaryType } from "types";
import { Ingredient } from "components/Nutrition/models/Ingredient";

export class DiaryEntry {


    constructor(
        public id: number,
        public planId: number,
        public mealId: number | null,
        public ingredient: number,
        public weightUnit: number,
        public amount: number,
        public datetime: Date,
        public ingredientObj?: Ingredient,
        public weightUnitObj?: Ingredient
    ) {
        if (ingredientObj !== undefined) {
            this.ingredientObj = ingredientObj;
        }

        if (weightUnitObj !== undefined) {
            this.weightUnitObj = weightUnitObj;
        }
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
            item.amount,
            new Date(item.datetime)
        );
    }

    toJson(item: DiaryEntry): any {
        return {
            plan: item.planId,
            meal: item.mealId,
            ingredient: item.ingredient,
            // eslint-disable-next-line camelcase
            weight_unit: item.weightUnit,
            amount: item.amount,
            datetime: item.datetime.toISOString(),
        };
    }
}