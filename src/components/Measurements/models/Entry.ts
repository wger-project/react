import { Adapter } from "@/core/lib/Adapter";
import { convertWeight, isWeightUnit } from "@/core/lib/weightUnit";

export class MeasurementEntry {

    constructor(
        public id: string | null,
        public category: string,
        public date: Date,
        public value: number,
        public notes: string,
        public source: string = 'user',
        public extraData: Record<string, unknown> = {},
    ) {
    }

    /** Entries synced from a health app are managed by the source app */
    get isEditable(): boolean {
        return this.source === 'user';
    }

    /**
     * The unit the value was entered in: extra_data.unit, falling back to the
     * category unit when absent (same chain as the server)
     */
    unitOrFallback(categoryUnit: string): string {
        const stored = this.extraData['unit'];
        return typeof stored === 'string' && stored !== '' ? stored : categoryUnit;
    }

    /**
     * The value in the given unit. The only way to read a measurement for
     * display or calculation: a category can hold entries in mixed units, so
     * the raw value on its own is meaningless.
     */
    valueIn(targetUnit: string, categoryUnit: string): number {
        return this.convert(this.value, targetUnit, categoryUnit);
    }

    /**
     * A number stored in extra_data next to the value, such as the bounds of a
     * daily aggregate. They are written in the value's unit, so they have to
     * follow it through the same conversion.
     */
    boundIn(bound: number, targetUnit: string, categoryUnit: string): number {
        return this.convert(bound, targetUnit, categoryUnit);
    }

    private convert(value: number, targetUnit: string, categoryUnit: string): number {
        const from = this.unitOrFallback(categoryUnit);

        return isWeightUnit(from) && isWeightUnit(targetUnit)
            ? convertWeight(value, from, targetUnit)
            : value;
    }

    static clone(other: MeasurementEntry, overrides?: Partial<Pick<MeasurementEntry, 'id' | 'category' | 'date' | 'value' | 'notes' | 'extraData'>>): MeasurementEntry {
        return new MeasurementEntry(
            overrides?.id ?? other.id,
            overrides?.category ?? other.category,
            overrides?.date ?? other.date,
            overrides?.value ?? other.value,
            overrides?.notes ?? other.notes,
            other.source,
            overrides?.extraData ?? other.extraData,
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): MeasurementEntry {
        return adapter.fromJson(json);
    }

    toJson() {
        return adapter.toJson(this);
    }
}


class MeasurementEntryAdapter implements Adapter<MeasurementEntry> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fromJson(item: any) {
        return new MeasurementEntry(
            item.id,
            item.category,
            // full ISO datetime from the server, parsing is timezone-safe
            new Date(item.date),
            item.value,
            item.notes,
            item.source,
            item.extra_data ?? {},
        );
    }

    toJson(item: MeasurementEntry) {
        return {
            ...(item.id != null ? { id: item.id } : {}),
            category: item.category,
            // the server field is a datetime, send the full timestamp
            date: item.date.toISOString(),
            value: item.value,
            notes: item.notes,
            // The server replaces extra_data as a whole on update, so send
            // every stored key back
            // eslint-disable-next-line camelcase
            extra_data: item.extraData,
        };
    }
}

const adapter = new MeasurementEntryAdapter();