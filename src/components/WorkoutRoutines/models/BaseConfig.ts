/* eslint-disable camelcase */

import { Adapter } from "utils/Adapter";

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
