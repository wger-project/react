import { Adapter } from "utils";
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
    fromJson(item: any): WeightEntry {
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