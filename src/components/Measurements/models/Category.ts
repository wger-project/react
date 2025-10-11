import { MeasurementEntry } from "components/Measurements/models/Entry";
import { Adapter } from "utils/Adapter";

export class MeasurementCategory {

    entries: MeasurementEntry[] = [];

    constructor(
        public id: number,
        public name: string,
        public unit: string,
        entries?: MeasurementEntry[]
    ) {
        if (entries) {
            this.entries = entries;
        }
    }
}


export class MeasurementCategoryAdapter implements Adapter<MeasurementCategory> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fromJson(item: any) {
        return new MeasurementCategory(
            item.id,
            item.name,
            item.unit
        );
    }

    toJson(item: MeasurementCategory) {
        return {
            id: item.id,
            name: item.name,
            unit: item.unit,
        };
    }
}