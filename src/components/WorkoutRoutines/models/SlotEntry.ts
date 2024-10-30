/* eslint-disable camelcase */

import { Exercise } from "components/Exercises/models/exercise";
import { BaseConfig, BaseConfigAdapter } from "components/WorkoutRoutines/models/BaseConfig";
import { Adapter } from "utils/Adapter";

export type SlotEntryType = 'normal' | 'dropset' | 'myo' | 'partial' | 'forced' | 'tut' | 'iso' | 'jump';

export class SlotEntry {

    weightConfigs: BaseConfig[] = [];
    maxWeightConfigs: BaseConfig[] = [];
    repsConfigs: BaseConfig[] = [];
    maxRepsConfigs: BaseConfig[] = [];
    restTimeConfigs: BaseConfig[] = [];
    maxRestTimeConfigs: BaseConfig[] = [];
    nrOfSetsConfigs: BaseConfig[] = [];
    rirConfigs: BaseConfig[] = [];

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
        public config: any | null,
        configs?: {
            weightConfigs?: BaseConfig[],
            maxWeightConfigs?: BaseConfig[],
            repsConfigs?: BaseConfig[],
            maxRepsConfigs?: BaseConfig[],
            restTimeConfigs?: BaseConfig[],
            maxRestTimeConfigs?: BaseConfig[],
            nrOfSetsConfigs?: BaseConfig[],
            rirConfigs?: BaseConfig[]
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
            item.config,
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
        type: item.type,
        config: item.config,
    });
}