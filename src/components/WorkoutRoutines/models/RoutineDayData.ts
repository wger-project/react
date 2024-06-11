/* eslint-disable camelcase */

import { Day, DayAdapter } from "components/WorkoutRoutines/models/Day";
import { SlotData, SlotDataAdapter } from "components/WorkoutRoutines/models/SlotData";
import { Adapter } from "utils/Adapter";

export class RoutineDayData {

    slots: SlotData[] = [];

    constructor(
        public iteration: number,
        public date: Date,
        public label: string,
        public day: Day,
        slots?: SlotData[],
    ) {

        if (slots) {
            this.slots = slots;
        }
    }
}


export class RoutineDayDataAdapter implements Adapter<RoutineDayData> {
    fromJson = (item: any) => new RoutineDayData(
        item.iteration,
        new Date(item.date),
        item.label,
        new DayAdapter().fromJson(item.day),
        item.slots.map((slot: any) => new SlotDataAdapter().fromJson(slot))
    );
}