/* eslint-disable camelcase */

import { Exercise } from "components/Exercises/models/exercise";
import { BaseConfig, BaseConfigAdapter } from "components/WorkoutRoutines/models/BaseConfig";
import { RepetitionUnit } from "components/WorkoutRoutines/models/RepetitionUnit";
import { WeightUnit } from "components/WorkoutRoutines/models/WeightUnit";
import { Adapter } from "utils/Adapter";

export type SlotEntryType = 'normal' | 'dropset' | 'myo' | 'partial' | 'forced' | 'tut' | 'iso' | 'jump';

type ConstructorParamsType = {
    id?: number | null,
    slotId: number,
    exerciseId: number,
    exercise?: Exercise,
    repetitionUnitId: number,
    repetitionUnit?: RepetitionUnit,
    repetitionRounding?: number | null,
    weightUnitId: number,
    weightRounding?: number | null,
    weightUnit?: WeightUnit,
    order: number,
    comment: string,
    type: SlotEntryType
    // eslint-disable-next-line @typescript-eslint/no-explicit-any,
    config: any | null,
    configs?: {
        weightConfigs?: BaseConfig[],
        maxWeightConfigs?: BaseConfig[],
        repetitionsConfigs?: BaseConfig[],
        maxRepetitionsConfigs?: BaseConfig[],
        restTimeConfigs?: BaseConfig[],
        maxRestTimeConfigs?: BaseConfig[],
        nrOfSetsConfigs?: BaseConfig[],
        maxNrOfSetsConfigs?: BaseConfig[],
        rirConfigs?: BaseConfig[],
        maxRirConfigs?: BaseConfig[],
    }
};


export class SlotEntry {

    id: number | null = null;
    slotId: number;
    exerciseId: number;
    repetitionUnitId: number;
    repetitionRounding: number | null;
    weightUnitId: number;
    weightRounding: number | null;
    order: number;
    comment: string;
    type: SlotEntryType;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config: any | null;

    weightConfigs: BaseConfig[] = [];
    maxWeightConfigs: BaseConfig[] = [];
    repetitionsConfigs: BaseConfig[] = [];
    maxRepetitionsConfigs: BaseConfig[] = [];
    restTimeConfigs: BaseConfig[] = [];
    maxRestTimeConfigs: BaseConfig[] = [];
    nrOfSetsConfigs: BaseConfig[] = [];
    maxNrOfSetsConfigs: BaseConfig[] = [];
    rirConfigs: BaseConfig[] = [];
    maxRirConfigs: BaseConfig[] = [];

    exercise?: Exercise;
    repetitionUnit: RepetitionUnit | null = null;
    weightUnit: WeightUnit | null = null;


    constructor(data: ConstructorParamsType) {
        this.id = data.id ?? null;
        this.slotId = data.slotId;
        this.exerciseId = data.exerciseId;
        this.exercise = data.exercise;
        this.repetitionUnitId = data.repetitionUnitId;
        this.repetitionRounding = data.repetitionRounding ?? null;
        this.weightUnitId = data.weightUnitId;
        this.weightRounding = data.weightRounding ?? null;
        this.order = data.order;
        this.comment = data.comment;
        this.type = data.type;
        this.config = data.config;

        if (data.configs !== undefined) {
            this.weightConfigs = data.configs.weightConfigs ?? [];
            this.maxWeightConfigs = data.configs.maxWeightConfigs ?? [];
            this.repetitionsConfigs = data.configs.repetitionsConfigs ?? [];
            this.maxRepetitionsConfigs = data.configs.maxRepetitionsConfigs ?? [];
            this.restTimeConfigs = data.configs.restTimeConfigs ?? [];
            this.maxRestTimeConfigs = data.configs.maxRestTimeConfigs ?? [];
            this.nrOfSetsConfigs = data.configs.nrOfSetsConfigs ?? [];
            this.maxNrOfSetsConfigs = data.configs.maxNrOfSetsConfigs ?? [];
            this.rirConfigs = data.configs.rirConfigs ?? [];
            this.maxRirConfigs = data.configs.maxRirConfigs ?? [];
        }

        if (data.weightUnit !== undefined) {
            this.weightUnit = data.weightUnit;
            this.weightUnitId = data.weightUnit.id;
        }

        if (data.repetitionUnit !== undefined) {
            this.repetitionUnit = data.repetitionUnit;
            this.repetitionUnitId = data.repetitionUnit.id;
        }
    }

    get hasProgressionRules(): boolean {
        return this.weightConfigs.length > 1
            || this.maxWeightConfigs.length > 1
            || this.repetitionsConfigs.length > 1
            || this.maxRepetitionsConfigs.length > 1
            || this.restTimeConfigs.length > 1
            || this.maxRestTimeConfigs.length > 1
            || this.nrOfSetsConfigs.length > 1
            || this.maxNrOfSetsConfigs.length > 1
            || this.rirConfigs.length > 1
            || this.maxRirConfigs.length > 1;
    }

    static clone(other: SlotEntry, overrides?: Partial<ConstructorParamsType>): SlotEntry {
        return new SlotEntry({
            id: overrides?.id ?? other?.id,
            exerciseId: overrides?.exerciseId ?? other.exerciseId,
            exercise: overrides?.exercise ?? other.exercise,
            slotId: overrides?.slotId ?? other.slotId,
            config: overrides?.config ?? other.config,
            type: overrides?.type ?? other.type,
            order: overrides?.order ?? other.order,
            comment: overrides?.comment ?? other.comment,

            repetitionUnit: overrides?.repetitionUnit ?? (other.repetitionUnit ?? undefined),
            repetitionUnitId: overrides?.repetitionUnitId ?? other.repetitionUnitId,
            repetitionRounding: overrides?.repetitionRounding ?? other.repetitionRounding,

            weightUnit: overrides?.weightUnit ?? (other.weightUnit ?? undefined),
            weightUnitId: overrides?.weightUnitId ?? other.weightUnitId,
            weightRounding: overrides?.weightRounding ?? other.weightRounding,
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any) {
        return adapter.fromJson(json);
    }

    toJson() {
        return adapter.toJson(this);
    }
}


class SlotEntryAdapter implements Adapter<SlotEntry> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fromJson = (item: any) => {
        const baseConfigAdapter = new BaseConfigAdapter();

        const configs = {
            weightConfigs: [],
            maxWeightConfigs: [],
            repetitionsConfigs: [],
            maxRepetitionsConfigs: [],
            restTimeConfigs: [],
            maxRestTimeConfigs: [],
            nrOfSetsConfigs: [],
            maxNrOfSetsConfigs: [],
            rirConfigs: [],
            maxRirConfigs: [],
        };
        if (Object.hasOwn(item, 'weight_configs')) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            configs.weightConfigs = item.weight_configs.map((config: any) => baseConfigAdapter.fromJson(config));
        }
        if (Object.hasOwn(item, 'max_weight_configs')) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            configs.maxWeightConfigs = item.max_weight_configs.map((config: any) => baseConfigAdapter.fromJson(config));
        }
        if (Object.hasOwn(item, 'repetitions_configs')) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            configs.repetitionsConfigs = item.repetitions_configs.map((config: any) => baseConfigAdapter.fromJson(config));
        }
        if (Object.hasOwn(item, 'max_repetitions_configs')) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            configs.maxRepetitionsConfigs = item.max_repetitions_configs.map((config: any) => baseConfigAdapter.fromJson(config));
        }
        if (Object.hasOwn(item, 'set_nr_configs')) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            configs.nrOfSetsConfigs = item.set_nr_configs.map((config: any) => baseConfigAdapter.fromJson(config));
        }
        if (Object.hasOwn(item, 'max_set_nr_configs')) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            configs.maxNrOfSetsConfigs = item.max_set_nr_configs.map((config: any) => baseConfigAdapter.fromJson(config));
        }
        if (Object.hasOwn(item, 'rest_configs')) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            configs.restTimeConfigs = item.rest_configs.map((config: any) => baseConfigAdapter.fromJson(config));
        }
        if (Object.hasOwn(item, 'max_rest_configs')) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            configs.maxRestTimeConfigs = item.max_rest_configs.map((config: any) => baseConfigAdapter.fromJson(config));
        }
        if (Object.hasOwn(item, 'rir_configs')) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            configs.rirConfigs = item.rir_configs.map((config: any) => baseConfigAdapter.fromJson(config));
        }
        if (Object.hasOwn(item, 'max_rir_configs')) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            configs.maxRirConfigs = item.max_rir_configs.map((config: any) => baseConfigAdapter.fromJson(config));
        }

        return new SlotEntry({
            id: item.id,
            slotId: item.slot,
            exerciseId: item.exercise,
            repetitionUnitId: item.repetition_unit,
            repetitionRounding: item.repetition_rounding,
            weightUnitId: item.weight_unit,
            weightRounding: item.weight_rounding,
            order: item.order,
            comment: item.comment,
            type: item.type,
            config: item.config,
            configs: configs
        });
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

const adapter = new SlotEntryAdapter();