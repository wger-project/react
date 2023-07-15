import { Adapter } from "utils/Adapter";
import { ApiMealItemType } from "types";
import { Ingredient } from "components/Nutrition/models/Ingredient";
import { NutritionalValues } from "components/Nutrition/helpers/nutritionalValues";

export class MealItem {


    constructor(
        public id: number,
        public ingredient: number,
        public weightUnit: number | null,
        public amount: number,
        public order: number,
        public ingredientObj?: Ingredient,
        public weightUnitObj?: Ingredient
    ) {
        
    }

    get nutritionalValues(): NutritionalValues {
        const out = new NutritionalValues();

        if (this.ingredientObj == null) {
            return out;
        }
        //weight = this.weightUnit == null ? amount : amount * weightUnit.amount * weightUnit.grams;
        const weight = this.amount;

        out.energy = this.ingredientObj.energy * weight / 100;
        out.protein = this.ingredientObj.protein * weight / 100;
        out.carbohydrates = this.ingredientObj.carbohydrates * weight / 100;
        out.carbohydratesSugar = this.ingredientObj.carbohydratesSugar ? this.ingredientObj.carbohydratesSugar * weight / 100 : 0;
        out.fat = this.ingredientObj.fat * weight / 100;
        out.fatSaturated = this.ingredientObj.fatSaturated ? this.ingredientObj.fatSaturated * weight / 100 : 0;
        out.fibres = this.ingredientObj.fibres ? this.ingredientObj.fibres * weight / 100 : 0;
        out.sodium = this.ingredientObj.sodium ? this.ingredientObj.sodium * weight / 100 : 0;

        return out;
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