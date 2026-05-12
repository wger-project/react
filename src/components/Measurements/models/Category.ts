import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import { Adapter } from "@/core/lib/Adapter";

export type DynamicMeasurementType = 'NONE' | 'BMI' | 'SQUAT_1RM';

export class MeasurementCategory {

    entries: MeasurementEntry[] = [];

    constructor(
        public id: number,
        public name: string,
        public unit: string,
        public dynamic_type: DynamicMeasurementType = 'NONE',
        entries?: MeasurementEntry[]
    ) {
        if (entries) {
            this.entries = entries;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): MeasurementCategory {
        return adapter.fromJson(json);
    }

    toJson() {
        return adapter.toJson(this);
    }
}

class MeasurementCategoryAdapter implements Adapter<MeasurementCategory> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fromJson(item: any) {
        return new MeasurementCategory(
            item.id,
            item.name,
            item.unit,
            item.dynamic_type
        );
    }

    toJson(item: MeasurementCategory) {
        return {
            id: item.id,
            name: item.name,
            unit: item.unit,
            dynamic_type: item.dynamic_type
        };
    }
}

const adapter = new MeasurementCategoryAdapter();