export class CalendarMeasurement {

    constructor(
        public name: string,
        public unit: string,
        public value: number,
        public date: Date,
    ) {
    }
}