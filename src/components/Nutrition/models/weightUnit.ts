import { ApiIngredientWeightUnitType } from "@/types";
import { Adapter } from "@/core/lib/Adapter";

export class NutritionWeightUnit {

    constructor(
        public id: number,
        public grams: number,
        public name: string,
    ) {
    }
}


export class NutritionWeightUnitAdapter implements Adapter<NutritionWeightUnit> {
    fromJson(item: ApiIngredientWeightUnitType) {
        return new NutritionWeightUnit(
            item.id,
            item.gram,
            item.name,
        );
    }
}
