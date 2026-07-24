import { Adapter } from "@/core/lib/Adapter";
import { yyyymmddToDate } from "@/core/lib/date";

export class MeasurementEntry {

    constructor(
        public id: string | null,
        public category: string,
        public date: Date,
        public value: number,
        public notes: string
    ) {
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
            // The server field is a DateTimeField, but both this app and the API
            // treat it as a calendar date (we send YYYY-MM-DD, the server returns
            // it at midnight server time). Only parse the date part: new Date()
            // on the full datetime would shift the day in timezones behind UTC.
            yyyymmddToDate(item.date.split('T')[0]),
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

const adapter = new MeasurementEntryAdapter();