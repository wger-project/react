/**
 * What the aggregate endpoints return: measurements condensed into what a
 * chart draws.
 *
 * A chart shows a few hundred points and a watch-fed metric holds tens of
 * thousands a year, so the condensing happens in the query. Both shapes are
 * grouped by the unit the values were entered in as well, because a mean over
 * kg and lb values is a number in neither: the client converts each row
 * through `valueIn` before merging them.
 */

/** One calendar bucket of a category's entries */
export class MeasurementBucket {
    constructor(
        public category: string,
        public start: Date,
        /** The unit the values were entered in, null when they carry none */
        public unit: string | null,
        public count: number,
        public sum: number,
        /**
         * Lowest and highest value the bucket stands for. An entry that is
         * itself a daily aggregate contributes its stored bounds rather than
         * its value, so condensing one keeps the true extremes.
         */
        public min: number,
        public max: number,
    ) {
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(item: any): MeasurementBucket {
        return new MeasurementBucket(
            item.category,
            new Date(item.start),
            item.unit ?? null,
            item.count,
            parseFloat(item.sum),
            parseFloat(item.min),
            parseFloat(item.max),
        );
    }
}

/** How often one value occurred, the histogram's counterpart to a bucket */
export class MeasurementValueCount {
    constructor(
        public category: string,
        public value: number,
        public unit: string | null,
        public count: number,
        /** Newest entry holding this value, i.e. where the user stands today */
        public newest: Date,
    ) {
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(item: any): MeasurementValueCount {
        return new MeasurementValueCount(
            item.category,
            parseFloat(item.value),
            item.unit ?? null,
            item.count,
            new Date(item.newest),
        );
    }
}
