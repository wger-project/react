import { Adapter } from "utils/Adapter";

export class MeasurementEntry {

    constructor(
        public id: number | null,
        public category: number,
        public date: Date,
        public value: number,
        public notes: string
    ) {
    }
}


export class MeasurementEntryAdapter implements Adapter<MeasurementEntry> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fromJson(item: any) {
        return new MeasurementEntry(
            item.id,
            item.category,
            new Date(item.date),
            item.value,
            item.notes
        );
    }

    toJson(item: MeasurementEntry) {
        return {
            id: item.id,
            category: item.category,
            date: item.date,
            value: item.value,
            notes: item.notes
        };
    }
}