import { Adapter } from "utils/Adapter";
import { ApiNutritionalPlanType } from "types";

export class NutritionalPlan {

    constructor(
        public id: number,
        public creationDate: Date,
        public description: string,
    ) {
    }
}


export class NutritionalPlanAdapter implements Adapter<NutritionalPlan> {
    fromJson(item: ApiNutritionalPlanType) {
        return new NutritionalPlan(
            item.id,
            new Date(item.creation_date),
            item.description
        );
    }

    toJson(item: NutritionalPlan): any {
        return {
            description: item.description
        };
    }
}