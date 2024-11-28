/* eslint-disable camelcase */

import { Adapter } from "utils/Adapter";

export interface BaseConfigEntryForm {
    edited: boolean;
    iteration: number;
    id: number | null;
    idMax: number | null;
    value: number | string;
    valueMax: number | string;
    operation: OperationType;
    operationMax: OperationType;
    step: StepType;
    stepMax: StepType;
    requirements: RequirementsType[];
    requirementsMax: RequirementsType[];
    repeat: boolean;
    repeatMax: boolean;
}

export const OPERATION_REPLACE = 'r';

export const REQUIREMENTS_VALUES = ["weight", "reps", "rir", "sets", "rest"] as const

export type OperationType = "+" | "-" | "r";
export type StepType = "abs" | "percent";
export type RequirementsType = typeof REQUIREMENTS_VALUES;


export const STEP_VALUES_SELECT = [
    { value: 'abs', 'label': 'Absolute' },
    { value: 'percent', 'label': 'Percent' },
];

export const OPERATION_VALUES_SELECT = [
    { value: '+', label: 'Add' },
    { value: '-', label: 'Subtract' },
    { value: OPERATION_REPLACE, label: 'Replace' },
];

export const RIR_VALUES = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4] as const;

export const RIR_VALUES_SELECT = [
    { value: '', label: '-/-' },
    ...RIR_VALUES.map(value => ({ value: value.toString(), label: value.toString() })),
    { value: '4.5', label: '4+' }
] as const;

export class BaseConfig {

    constructor(
        public id: number,
        public slotEntryId: number,
        public iteration: number,
        public trigger: "session" | "week" | null,
        public value: number,
        public operation: OperationType,
        public step: StepType,
        public needLogToApply: boolean,
        public repeat: boolean
    ) {
    }

    get replace() {
        return this.operation === "r";
    }
}

export class BaseConfigAdapter implements Adapter<BaseConfig> {
    fromJson = (item: any) => new BaseConfig(
        item.id,
        item.slot_entry,
        item.iteration,
        item.trigger,
        parseFloat(item.value),
        item.operation,
        item.step,
        item.need_log_to_apply,
        item.repeat
    );

    toJson = (item: BaseConfig) => ({
        slot_entry: item.slotEntryId,
        iteration: item.iteration,
        trigger: item.trigger,
        value: item.value,
        operation: item.operation,
        step: item.step,
        need_log_to_apply: item.needLogToApply,
        repeat: item.repeat
    });
}
