import { Adapter } from "utils";
import { BodyWeightType } from "types";
import { dateToYYYYMMDD } from "utils/date";

export class WeightEntry {

    constructor(
        public date: Date,
        public weight: number,
        public id?: number,
    ) {
    }
}

export class WeightAdapter implements Adapter<WeightEntry> {
    fromJson(item: BodyWeightType): WeightEntry {
        return new WeightEntry(
            new Date(item.date),
            parseFloat(item.weight),
            item.id,
        );
    }

    toJson(item: WeightEntry): any {
        return {
            id: item.id,
            date: dateToYYYYMMDD(item.date),
            weight: item.weight,
        };
    }
}