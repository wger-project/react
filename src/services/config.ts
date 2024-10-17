import axios from 'axios';
import { BaseConfig, BaseConfigAdapter } from "components/WorkoutRoutines/models/BaseConfig";
import { ApiPath } from "utils/consts";
import { makeHeader, makeUrl } from "utils/url";

export interface AddBaseConfigParams {
    value: number;
    slot_config: number;
    iteration?: number;
    operation?: string;
    replace?: boolean;
    need_logs_to_apply?: boolean;
}

export interface EditBaseConfigParams extends Partial<AddBaseConfigParams> {
    id: number,
}

const editBaseConfig = async (data: EditBaseConfigParams, url: string): Promise<BaseConfig> => {

    const response = await axios.patch(
        makeUrl(url, { id: data.id }),
        data,
        { headers: makeHeader() }
    );

    const adapter = new BaseConfigAdapter();
    return adapter.fromJson(response.data);
};
const addBaseConfig = async (data: AddBaseConfigParams, url: string): Promise<BaseConfig> => {

    const response = await axios.post(
        makeUrl(url),
        data,
        { headers: makeHeader() }
    );

    const adapter = new BaseConfigAdapter();
    return adapter.fromJson(response.data);
};

export const editWeightConfig = async (data: EditBaseConfigParams): Promise<BaseConfig> => await editBaseConfig(data, ApiPath.WEIGHT_CONFIG);
export const addWeightConfig = async (data: AddBaseConfigParams): Promise<BaseConfig> => await addBaseConfig(data, ApiPath.WEIGHT_CONFIG);

export const editMaxWeightConfig = async (data: EditBaseConfigParams): Promise<BaseConfig> => await editBaseConfig(data, ApiPath.MAX_WEIGHT_CONFIG);
export const addMaxWeightConfig = async (data: AddBaseConfigParams): Promise<BaseConfig> => await addBaseConfig(data, ApiPath.MAX_WEIGHT_CONFIG);

export const editRepsConfig = async (data: EditBaseConfigParams): Promise<BaseConfig> => await editBaseConfig(data, ApiPath.REPS_CONFIG);
export const addRepsConfig = async (data: AddBaseConfigParams): Promise<BaseConfig> => await addBaseConfig(data, ApiPath.REPS_CONFIG);

export const editMaxRepsConfig = async (data: EditBaseConfigParams): Promise<BaseConfig> => await editBaseConfig(data, ApiPath.MAX_REPS_CONFIG);
export const addMaxRepsConfig = async (data: AddBaseConfigParams): Promise<BaseConfig> => await addBaseConfig(data, ApiPath.MAX_REPS_CONFIG);

export const editNrOfSetsConfig = async (data: EditBaseConfigParams): Promise<BaseConfig> => await editBaseConfig(data, ApiPath.NR_OF_SETS_CONFIG);
export const addNrOfSetsConfig = async (data: AddBaseConfigParams): Promise<BaseConfig> => await addBaseConfig(data, ApiPath.NR_OF_SETS_CONFIG);

export const editRirConfig = async (data: EditBaseConfigParams): Promise<BaseConfig> => await editBaseConfig(data, ApiPath.RIR_CONFIG);
export const addRirConfig = async (data: AddBaseConfigParams): Promise<BaseConfig> => await addBaseConfig(data, ApiPath.RIR_CONFIG);

export const editRestConfig = async (data: EditBaseConfigParams): Promise<BaseConfig> => await editBaseConfig(data, ApiPath.REST_CONFIG);
export const addRestConfig = async (data: AddBaseConfigParams): Promise<BaseConfig> => await addBaseConfig(data, ApiPath.REST_CONFIG);

export const editMaxRestConfig = async (data: EditBaseConfigParams): Promise<BaseConfig> => await editBaseConfig(data, ApiPath.MAX_REST_CONFIG);
export const addMaxRestConfig = async (data: AddBaseConfigParams): Promise<BaseConfig> => await addBaseConfig(data, ApiPath.MAX_REST_CONFIG);

