import { NutritionalValues } from "components/Nutrition/helpers/nutritionalValues";
import { Ingredient } from "components/Nutrition/models/Ingredient";
import { NutritionWeightUnit } from "components/Nutrition/models/weightUnit";
import { ApiMealItemType } from "types";
import { Adapter } from "utils/Adapter";

export class MealItem {


    constructor(
        public id: number,
        public ingredientId: number,
        public weightUnitId: number | null,
        public amount: number,
        public order: number,
        public ingredient?: Ingredient,
        public weightUnit?: NutritionWeightUnit | null
    ) {
    }

    get amountString(): string {
        return this.amount.toFixed().toString() + (this.weightUnitId !== null ? ` ${this.weightUnit?.name}` : 'g');
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


export class MealItemAdapter implements Adapter<MealItem> {
    fromJson(item: ApiMealItemType) {
        return new MealItem(
            item.id,
            item.ingredient,
            item.weight_unit,
            parseFloat(item.amount),
            item.order,
        );
    }

    toJson(item: MealItem) {
        return {
            ingredient: item.ingredientId,

            // eslint-disable-next-line camelcase
            weight_unit: item.weightUnitId,
            amount: item.amount.toString(),
            order: item.order,
        };
    }
}