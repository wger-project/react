import { Adapter } from "utils/Adapter";
import { MeasurementEntry } from "components/Measurements/models/Entry";

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
    fromJson(item: any) {
        return new MeasurementCategory(
            item.id,
            item.name,
            item.unit
        );
    }

    toJson(item: MeasurementCategory): any {
        return {
            id: item.id,
            name: item.name,
            unit: item.unit,
        };
    }
}