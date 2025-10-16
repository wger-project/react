import { Day } from "components/WorkoutRoutines/models/Day";
import { SlotData, SlotDataAdapter } from "components/WorkoutRoutines/models/SlotData";
import { Adapter } from "utils/Adapter";

export class RoutineDayData {

    slots: SlotData[] = [];

    constructor(
        public iteration: number,
        public date: Date,
        public label: string,
        public day: Day | null,
        slots?: SlotData[],
    ) {
        this.slots = slots ?? [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any) {
        return adapter.fromJson(json);
    }
}


class RoutineDayDataAdapter implements Adapter<RoutineDayData> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fromJson = (item: any) => new RoutineDayData(
        item.iteration,
        new Date(item.date),
        item.label,
        item.day != null ? Day.fromJson(item.day) : null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        item.slots.map((slot: any) => new SlotDataAdapter().fromJson(slot))
    );
}

const adapter = new RoutineDayDataAdapter();