/* eslint-disable camelcase */

import { BaseConfig, BaseConfigAdapter } from "components/WorkoutRoutines/models/BaseConfig";
import { Adapter } from "utils/Adapter";

export class WeightConfig extends BaseConfig {
}

export class WeightConfigAdapter implements Adapter<WeightConfig> {
    fromJson = (item: any) => new BaseConfigAdapter().fromJson(item);
    toJson = (item: WeightConfig) => new BaseConfigAdapter().toJson(item);
}
