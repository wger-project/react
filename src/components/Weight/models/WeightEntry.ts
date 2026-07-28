import { Adapter } from "@/core/lib/Adapter";

export class WeightEntry {

    constructor(
        public date: Date,
        public weight: number,
        public id?: number,
    ) {
    }

    static clone(other: WeightEntry, overrides?: Partial<Pick<WeightEntry, 'date' | 'weight' | 'id'>>): WeightEntry {
        return new WeightEntry(
            overrides?.date ?? other.date,
            overrides?.weight ?? other.weight,
            overrides?.id ?? other.id,
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any) {
        return adapter.fromJson(json);
    }

    toJson() {
        return adapter.toJson(this);
    }
}

class WeightAdapter implements Adapter<WeightEntry> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fromJson(item: any): WeightEntry {
        return new WeightEntry(
            new Date(item.date),
            parseFloat(item.weight),
            item.id,
        );
    }

    toJson(item: WeightEntry) {
        return {
            date: item.date.toISOString(),
            weight: item.weight,
        };
    }
}

const adapter = new WeightAdapter();