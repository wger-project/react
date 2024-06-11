/* eslint-disable camelcase */

import { BaseConfig, BaseConfigAdapter } from "components/WorkoutRoutines/models/BaseConfig";
import { Adapter } from "utils/Adapter";

export class RepsConfig extends BaseConfig {
}

export class RepsConfigAdapter implements Adapter<RepsConfig> {
    fromJson = (item: any) => new BaseConfigAdapter().fromJson(item);
    toJson = (item: RepsConfig) => new BaseConfigAdapter().toJson(item);
}
