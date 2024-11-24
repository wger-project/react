/* eslint-disable camelcase */

import { Adapter } from "utils/Adapter";

export const RIR_VALUES = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4] as const;

export const RIR_VALUES_SELECT = [
    {
        value: '',
        label: '-/-',
    },
    ...RIR_VALUES.map(value => ({ value: value.toString(), label: value.toString() })),
    {
        value: '4.5',
        label: '4+'
    }
] as const;

export class BaseConfig {

    constructor(
        public id: number,
        public slotEntryId: number,
        public iteration: number,
        public trigger: "session" | "week" | null,
        public value: number,
        public operation: "+" | "-" | "r",
        public step: "abs" | "percent" | null,
        public needLogToApply: boolean
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
        item.need_log_to_apply
    );

    toJson = (item: BaseConfig) => ({
        slot_entry: item.slotEntryId,
        iteration: item.iteration,
        trigger: item.trigger,
        value: item.value,
        operation: item.operation,
        step: item.step,
        need_log_to_apply: item.needLogToApply
    });
}
