import { ApiIngredientWeightUnitType } from "types";
import { Adapter } from "utils/Adapter";

export class NutritionWeightUnit {

    constructor(
        public id: number,
        public amount: number,
        public grams: number,
        public name: string = ''
    ) {
    }
}


export class NutritionWeightUnitAdapter implements Adapter<NutritionWeightUnit> {
    fromJson(item: ApiIngredientWeightUnitType) {
        return new NutritionWeightUnit(
            item.id,
            parseFloat(item.amount),
            item.gram,
        );
    }
}