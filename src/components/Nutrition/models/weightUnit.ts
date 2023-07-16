import { Adapter } from "utils/Adapter";
import { ApiIngredientWeightUnitType } from "types";

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
            item.amount,
            item.gram,
        );
    }

    toJson(item: NutritionWeightUnit) {
        return {};
    }
}