/* eslint-disable camelcase */

import { BaseConfig, BaseConfigAdapter } from "components/WorkoutRoutines/models/BaseConfig";
import { Adapter } from "utils/Adapter";

export class RirConfig extends BaseConfig {
}

export class RirConfigAdapter implements Adapter<RirConfig> {
    fromJson = (item: any) => new BaseConfigAdapter().fromJson(item);
    toJson = (item: RirConfig) => new BaseConfigAdapter().toJson(item);
}
