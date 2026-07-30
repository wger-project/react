import { Adapter } from "@/core/lib/Adapter";
import { convertWeight, WeightUnit } from "@/core/lib/weightUnit";

/**
 * A body weight entry, stored on the server as a measurement in the user's
 * official body weight category. The id is the measurement's UUID.
 *
 * The weight is stored in the unit it was entered in — read it through
 * valueIn(), never directly.
 */
export class WeightEntry {

    constructor(
        public date: Date,
        public weight: number,
        public id?: string,
        public notes: string = '',
        public unit: WeightUnit = 'kg',
        public source: string = 'user',
    ) {
    }

    /** Entries synced from a health app are managed by the source app */
    get isEditable(): boolean {
        return this.source === 'user';
    }

    static clone(other: WeightEntry, overrides?: Partial<Pick<WeightEntry, 'date' | 'weight' | 'id' | 'notes' | 'unit'>>): WeightEntry {
        return new WeightEntry(
            overrides?.date ?? other.date,
            overrides?.weight ?? other.weight,
            overrides?.id ?? other.id,
            overrides?.notes ?? other.notes,
            overrides?.unit ?? other.unit,
            other.source,
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any, fallbackUnit: WeightUnit = 'kg') {
        return adapter.fromJson(json, fallbackUnit);
    }

    valueIn(unit: WeightUnit): number {
        return convertWeight(this.weight, this.unit, unit);
    }

    toJson() {
        return adapter.toJson(this);
    }
}

class WeightAdapter implements Adapter<WeightEntry> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fromJson(item: any, fallbackUnit: WeightUnit = 'kg'): WeightEntry {
        return new WeightEntry(
            new Date(item.date),
            parseFloat(item.value),
            item.id,
            item.notes ?? '',
            item.extra_data?.unit ?? fallbackUnit,
            item.source ?? 'user',
        );
    }

    toJson(item: WeightEntry) {
        return {
            date: item.date.toISOString(),
            value: item.weight,
            notes: item.notes,
            // eslint-disable-next-line camelcase
            extra_data: { unit: item.unit },
        };
    }
}

const adapter = new WeightAdapter();
