import { Adapter } from "@/core/lib/Adapter";

/**
 * A body weight entry, stored on the server as a measurement in the user's
 * official body weight category. The id is the measurement's UUID.
 */
export class WeightEntry {

    constructor(
        public date: Date,
        public weight: number,
        public id?: string,
        public notes: string = '',
    ) {
    }

    static clone(other: WeightEntry, overrides?: Partial<Pick<WeightEntry, 'date' | 'weight' | 'id' | 'notes'>>): WeightEntry {
        return new WeightEntry(
            overrides?.date ?? other.date,
            overrides?.weight ?? other.weight,
            overrides?.id ?? other.id,
            overrides?.notes ?? other.notes,
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
            parseFloat(item.value),
            item.id,
            item.notes ?? '',
        );
    }

    toJson(item: WeightEntry) {
        return {
            date: item.date.toISOString(),
            value: item.weight,
            notes: item.notes,
        };
    }
}

const adapter = new WeightAdapter();
