import { Adapter } from "utils/Adapter";
import { ApiMealItemType } from "types";
import { Ingredient } from "components/Nutrition/models/Ingredient";

export class MealItem {


    constructor(
        public id: number,
        public ingredient: number,
        public weightUnit: number,
        public amount: number,
        public order: number,
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


export class MealItemAdapter implements Adapter<MealItem> {
    fromJson(item: ApiMealItemType) {
        return new MealItem(
            item.id,
            item.ingredient,
            item.weight_unit,
            item.amount,
            item.order,
        );
    }

    toJson(item: MealItem): any {
        return {
            ingredient: item.ingredient,
            // eslint-disable-next-line camelcase
            weight_unit: item.weightUnit,
            amount: item.amount,
            order: item.order,
        };
    }
}