/* eslint-disable camelcase */

import { Adapter } from "utils/Adapter";

export class BaseConfig {

    constructor(
        public id: number,
        public slotConfigId: number,
        public iteration: number,
        public trigger: "session" | "week" | null,
        public value: number,
        public operation: "+" | "-" | null,
        public step: "abs" | "percent" | null,
        public replace: boolean,
        public needLogToApply: boolean
    ) {
    }
}

export class BaseConfigAdapter implements Adapter<BaseConfig> {
    fromJson = (item: any) => new BaseConfig(
        item.id,
        item.slot_config,
        item.iteration,
        item.trigger,
        parseFloat(item.value),
        item.operation,
        item.step,
        item.replace,
        item.need_log_to_apply
    );

    toJson = (item: BaseConfig) => ({
        slot_config: item.slotConfigId,
        iteration: item.iteration,
        trigger: item.trigger,
        value: item.value,
        operation: item.operation,
        step: item.step,
        replace: item.replace,
        need_log_to_apply: item.needLogToApply
    });
}
