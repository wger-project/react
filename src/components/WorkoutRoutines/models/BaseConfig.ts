/* eslint-disable camelcase */

import { Adapter } from "utils/Adapter";

export interface BaseConfigEntryForm {
    // This value is only used to change the conditional validation.
    // This is kinda ugly but seems to be the cleanest way to do it
    forceInteger: boolean;

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
export const OPERATION_ADD = '+';
export const OPERATION_SUBSTRACT = '-';

export const REQUIREMENTS_VALUES = ["weight", "repetitions", "rir", "rest"] as const;

export type OperationType = "+" | "-" | "r";
export type StepType = "abs" | "percent";
export type RequirementsType = typeof REQUIREMENTS_VALUES;


export const STEP_VALUES_SELECT = [
    { value: 'abs', 'label': 'Absolute' },
    { value: 'percent', 'label': 'Percent' },
];

export const OPERATION_VALUES_SELECT = [
    { value: OPERATION_ADD, label: 'Add' },
    { value: OPERATION_SUBSTRACT, label: 'Subtract' },
    { value: OPERATION_REPLACE, label: 'Replace' },
];

export const RIR_VALUES_SELECT_LIST = [
    { value: '', label: '-/-' },
    ...[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4].map(value => ({ value: value, label: value.toString() })),
    { value: 4.5, label: '4+' }
];

export const RIR_VALUES_SELECT = [...RIR_VALUES_SELECT_LIST] as const;

export interface RuleRequirements {
    rules: RequirementsType[];
}

export class BaseConfig {
    id: number;
    slotEntryId: number;
    iteration: number;
    value: number;
    operation: OperationType;
    step: StepType;
    repeat: boolean;
    requirements: RuleRequirements | null;


    constructor(data: {
        id: number;
        slotEntryId: number;
        iteration: number;
        value: number;
        operation?: OperationType;
        step?: StepType;
        repeat?: boolean;
        requirements?: RuleRequirements | null;
    }) {
        this.id = data.id;
        this.slotEntryId = data.slotEntryId;
        this.iteration = data.iteration;
        this.value = data.value;
        this.operation = data.operation ?? 'r';
        this.step = data.step ?? 'abs';
        this.repeat = data.repeat ?? false;
        this.requirements = data.requirements ?? null;
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
        value: parseFloat(item.value),
        operation: item.operation,
        step: item.step,
        repeat: item.repeat,
        requirements: item.requirements
    });

    toJson = (item: BaseConfig) => ({
        slot_entry: item.slotEntryId,
        iteration: item.iteration,
        value: item.value,
        operation: item.operation,
        step: item.step,
        repeat: item.repeat,
        requirements: item.requirements,
    });
}
