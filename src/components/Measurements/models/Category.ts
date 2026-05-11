import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import { Adapter } from "@/core/lib/Adapter";

export class MeasurementCategory {

    entries: MeasurementEntry[] = [];

    constructor(
        public id: number,
        public name: string,
        public unit: string,
        public is_dynamic: boolean = false,
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
            item.is_dynamic ?? false // Map from snake_case backend property
        );
    }

    toJson(item: MeasurementCategory) {
        return {
            id: item.id,
            name: item.name,
            unit: item.unit,
            is_dynamic: item.is_dynamic // Map to snake_case for backend
        };
    }
}

const adapter = new MeasurementCategoryAdapter();