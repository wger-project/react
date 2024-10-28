/* eslint-disable camelcase */

import { Exercise } from "components/Exercises/models/exercise";
import { BaseConfigAdapter } from "components/WorkoutRoutines/models/BaseConfig";
import { NrOfSetsConfig } from "components/WorkoutRoutines/models/NrOfSetsConfig";
import { RepsConfig } from "components/WorkoutRoutines/models/RepsConfig";
import { RestConfig } from "components/WorkoutRoutines/models/RestConfig";
import { RirConfig } from "components/WorkoutRoutines/models/RirConfig";
import { WeightConfig } from "components/WorkoutRoutines/models/WeightConfig";
import { Adapter } from "utils/Adapter";

export type SlotEntryType = 'normal' | 'dropset' | 'myo' | 'partial' | 'forced' | 'tut' | 'iso' | 'jump';

export class SlotEntry {

    weightConfigs: WeightConfig[] = [];
    maxWeightConfigs: WeightConfig[] = [];
    repsConfigs: RepsConfig[] = [];
    maxRepsConfigs: RepsConfig[] = [];
    restTimeConfigs: RestConfig[] = [];
    maxRestTimeConfigs: RestConfig[] = [];
    nrOfSetsConfigs: NrOfSetsConfig[] = [];
    rirConfigs: RirConfig[] = [];

    exercise?: Exercise;


    constructor(
        public id: number,
        public slotId: number,
        public exerciseId: number,
        public repetitionUnitId: number,
        public repetitionRounding: number,
        public weightUnitId: number,
        public weightRounding: number,
        public order: number,
        public comment: string,
        public type: SlotEntryType,
        configs?: {
            weightConfigs?: WeightConfig[],
            maxWeightConfigs?: WeightConfig[],
            repsConfigs?: RepsConfig[],
            maxRepsConfigs?: RepsConfig[],
            restTimeConfigs?: RestConfig[],
            maxRestTimeConfigs?: RestConfig[],
            nrOfSetsConfigs?: NrOfSetsConfig[],
            rirConfigs?: RirConfig[]
        }
    ) {
        if (configs !== undefined) {
            this.weightConfigs = configs.weightConfigs ?? [];
            this.maxWeightConfigs = configs.maxWeightConfigs ?? [];
            this.repsConfigs = configs.repsConfigs ?? [];
            this.maxRepsConfigs = configs.maxRepsConfigs ?? [];
            this.restTimeConfigs = configs.restTimeConfigs ?? [];
            this.maxRestTimeConfigs = configs.maxRestTimeConfigs ?? [];
            this.nrOfSetsConfigs = configs.nrOfSetsConfigs ?? [];
            this.rirConfigs = configs.rirConfigs ?? [];
        }
    }
}


export class SlotEntryAdapter implements Adapter<SlotEntry> {
    fromJson = (item: any) => {
        let configs = {
            weightConfigs: [],
            maxWeightConfigs: [],
            repsConfigs: [],
            maxRepsConfigs: [],
            restTimeConfigs: [],
            maxRestTimeConfigs: [],
            nrOfSetsConfigs: [],
            rirConfigs: []
        };
        if (item.hasOwnProperty('weight_configs')) {
            configs.weightConfigs = item.weight_configs.map((config: any) => new BaseConfigAdapter().fromJson(config));
        }
        if (item.hasOwnProperty('max_weight_configs')) {
            configs.maxWeightConfigs = item.max_weight_configs.map((config: any) => new BaseConfigAdapter().fromJson(config));
        }
        if (item.hasOwnProperty('reps_configs')) {
            configs.repsConfigs = item.reps_configs.map((config: any) => new BaseConfigAdapter().fromJson(config));
        }
        if (item.hasOwnProperty('max_reps_configs')) {
            configs.maxRepsConfigs = item.max_reps_configs.map((config: any) => new BaseConfigAdapter().fromJson(config));
        }
        if (item.hasOwnProperty('set_nr_configs')) {
            configs.nrOfSetsConfigs = item.set_nr_configs.map((config: any) => new BaseConfigAdapter().fromJson(config));
        }
        if (item.hasOwnProperty('rest_configs')) {
            configs.restTimeConfigs = item.rest_configs.map((config: any) => new BaseConfigAdapter().fromJson(config));
        }
        if (item.hasOwnProperty('max_rest_configs')) {
            configs.maxRestTimeConfigs = item.max_rest_configs.map((config: any) => new BaseConfigAdapter().fromJson(config));
        }
        if (item.hasOwnProperty('rir_configs')) {
            configs.rirConfigs = item.rir_configs.map((config: any) => new BaseConfigAdapter().fromJson(config));
        }

        return new SlotEntry(
            item.id,
            item.slot,
            item.exercise,
            item.repetition_unit,
            item.repetition_rounding,
            item.weight_unit,
            item.weight_rounding,
            item.order,
            item.comment,
            item.type,
            configs
        );
    };

    toJson = (item: SlotEntry) => ({
        slot: item.slotId,
        exercise: item.exerciseId,
        repetition_unit: item.repetitionUnitId,
        repetition_rounding: item.repetitionRounding,
        weight_unit: item.weightUnitId,
        weight_rounding: item.weightRounding,
        order: item.order,
        comment: item.comment,
        type: item.type
    });
}