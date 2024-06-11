/* eslint-disable camelcase */

import { BaseConfig, BaseConfigAdapter } from "components/WorkoutRoutines/models/BaseConfig";
import { Adapter } from "utils/Adapter";

export class NrOfSetsConfig extends BaseConfig {
}

export class NrOfSetsConfigAdapter implements Adapter<NrOfSetsConfig> {
    fromJson = (item: any) => new BaseConfigAdapter().fromJson(item);
    toJson = (item: NrOfSetsConfig) => new BaseConfigAdapter().toJson(item);
}
