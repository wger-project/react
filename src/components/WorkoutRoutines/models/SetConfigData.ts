/* eslint-disable camelcase */

import { Adapter } from "utils/Adapter";

export class SetConfigData {

    constructor(
        public exerciseId: number,
        public nrOfSets: number,
        public weight: number,
        public weightUnitId: number,
        public weightRoundin: number,
        public reps: number,
        public repsUnitId: number,
        public repsRounding: number,
        public rir: number,
        public restTime: number,
    ) {
    }
}


export class SetConfigDataAdapter implements Adapter<SetConfigData> {
    fromJson = (item: any) => new SetConfigData(
        item.exercise,
        item.sets,
        parseFloat(item.weight),
        item.weight_unit,
        parseFloat(item.weight_rounding),
        parseFloat(item.reps),
        item.reps_unit,
        parseFloat(item.reps_rounding),
        parseFloat(item.rir),
        parseFloat(item.rest),
    );
}