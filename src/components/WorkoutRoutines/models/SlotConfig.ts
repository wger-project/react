/* eslint-disable camelcase */

import { BaseConfigAdapter } from "components/WorkoutRoutines/models/BaseConfig";
import { NrOfSetsConfig } from "components/WorkoutRoutines/models/NrOfSetsConfig";
import { RepsConfig } from "components/WorkoutRoutines/models/RepsConfig";
import { RestConfig } from "components/WorkoutRoutines/models/RestConfig";
import { RirConfig } from "components/WorkoutRoutines/models/RirConfig";
import { WeightConfig } from "components/WorkoutRoutines/models/WeightConfig";
import { Adapter } from "utils/Adapter";

export class SlotConfig {

    weightConfigs: WeightConfig[] = [];
    repsConfigs: RepsConfig[] = [];
    restTimeConfigs: RestConfig[] = [];
    nrOfSetsConfigs: NrOfSetsConfig[] = [];
    rirConfigs: RirConfig[] = [];


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
        public type: 'normal' | 'dropset' | 'myo' | 'partial' | 'forced' | 'tut' | 'iso' | 'jump',
        configs?: {
            weightConfigs?: WeightConfig[],
            repsConfigs?: RepsConfig[],
            restTimeConfigs?: RestConfig[],
            nrOfSetsConfigs?: NrOfSetsConfig[],
            rirConfigs?: RirConfig[]
        }
    ) {
        if (configs !== undefined) {
            this.weightConfigs = configs.weightConfigs ?? [];
            this.repsConfigs = configs.repsConfigs ?? [];
            this.restTimeConfigs = configs.restTimeConfigs ?? [];
            this.nrOfSetsConfigs = configs.nrOfSetsConfigs ?? [];
            this.rirConfigs = configs.rirConfigs ?? [];
        }
    }
}


export class SlotConfigAdapter implements Adapter<SlotConfig> {
    fromJson = (item: any) => {
        let configs = {
            weightConfigs: [],
            repsConfigs: [],
            restTimeConfigs: [],
            nrOfSetsConfigs: [],
            rirConfigs: []
        };
        if (item.hasOwnProperty('weight_configs')) {
            configs.weightConfigs = item.weight_configs.map((config: any) => new BaseConfigAdapter().fromJson(config));
        }
        if (item.hasOwnProperty('reps_configs')) {
            configs.repsConfigs = item.reps_configs.map((config: any) => new BaseConfigAdapter().fromJson(config));
        }
        if (item.hasOwnProperty('set_nr_configs')) {
            configs.restTimeConfigs = item.set_nr_configs.map((config: any) => new BaseConfigAdapter().fromJson(config));
        }
        if (item.hasOwnProperty('rest_configs')) {
            configs.nrOfSetsConfigs = item.rest_configs.map((config: any) => new BaseConfigAdapter().fromJson(config));
        }
        if (item.hasOwnProperty('rir_configs')) {
            configs.rirConfigs = item.rir_configs.map((config: any) => new BaseConfigAdapter().fromJson(config));
        }

        return new SlotConfig(
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

    toJson = (item: SlotConfig) => ({
        slot: item.slotId,
        exercise: item.exerciseId,
        repetition_unit: item.repetitionUnitId,
        repetition_rounding: item.repetitionRounding,
        weight_unit: item.weightUnitId,
        weight_rounding: item.weightRounding,
        order: item.order,
        comment: item.comment,
        is_dropset: item.isDropset
    });
}