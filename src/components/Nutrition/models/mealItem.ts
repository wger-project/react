import { NutritionalValues } from "components/Nutrition/helpers/nutritionalValues";
import { Ingredient } from "components/Nutrition/models/Ingredient";
import { NutritionWeightUnit } from "components/Nutrition/models/weightUnit";
import { ApiMealItemType } from "types";
import { Adapter } from "utils/Adapter";

export class MealItem {

    public ingredient: Ingredient | null = null;
    public weightUnit: NutritionWeightUnit | null = null;

    constructor(
        public id: number,
        public ingredientId: number,
        public weightUnitId: number | null,
        public amount: number,
        public order: number,
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