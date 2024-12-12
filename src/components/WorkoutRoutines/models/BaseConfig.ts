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

export const REQUIREMENTS_VALUES = ["weight", "reps", "rir", "rest"] as const

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

export interface RuleRequirements {
    rules: RequirementsType[];
}

export class BaseConfig {
    id: number;
    slotEntryId: number;
    iteration: number;
    trigger: "session" | "week" | null;
    value: number;
    operation: OperationType;
    step: StepType;
    needLogToApply: boolean;
    repeat: boolean;
    requirements: RuleRequirements | null;


    constructor(data: {
        id: number;
        slotEntryId: number;
        iteration: number;
        trigger: "session" | "week" | null;
        value: number;
        operation: OperationType;
        step: StepType;
        needLogToApply: boolean;
        repeat: boolean;
        requirements: RuleRequirements | null;
    }) {
        this.id = data.id;
        this.slotEntryId = data.slotEntryId;
        this.iteration = data.iteration;
        this.trigger = data.trigger;
        this.value = data.value;
        this.operation = data.operation;
        this.step = data.step;
        this.needLogToApply = data.needLogToApply;
        this.repeat = data.repeat;
        this.requirements = data.requirements;
    }

    get replace() {
        return this.operation === "r";
    }
}

export class BaseConfigAdapter implements Adapter<BaseConfig> {
    fromJson = (item: any) => new BaseConfig({
        id: item.id,
        slotEntryId: item.slot_entry,
        iteration: item.iteration,
        trigger: item.trigger,
        value: parseFloat(item.value),
        operation: item.operation,
        step: item.step,
        needLogToApply: item.need_log_to_apply,
        repeat: item.repeat,
        requirements: item.requirements
    });

    toJson = (item: BaseConfig) => ({
        slot_entry: item.slotEntryId,
        iteration: item.iteration,
        trigger: item.trigger,
        value: item.value,
        operation: item.operation,
        step: item.step,
        need_log_to_apply: item.needLogToApply,
        repeat: item.repeat,
        requirements: item.requirements,
    });
}
