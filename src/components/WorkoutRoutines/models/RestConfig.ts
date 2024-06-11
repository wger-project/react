/* eslint-disable camelcase */

import { BaseConfig, BaseConfigAdapter } from "components/WorkoutRoutines/models/BaseConfig";
import { Adapter } from "utils/Adapter";

export class RestConfig extends BaseConfig {
}

export class RestConfigAdapter implements Adapter<RestConfig> {
    fromJson = (item: any) => new BaseConfigAdapter().fromJson(item);
    toJson = (item: RestConfig) => new BaseConfigAdapter().toJson(item);
}
