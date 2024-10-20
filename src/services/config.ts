import axios from 'axios';
import { BaseConfig, BaseConfigAdapter } from "components/WorkoutRoutines/models/BaseConfig";
import { ApiPath } from "utils/consts";
import { makeHeader, makeUrl } from "utils/url";

export interface AddBaseConfigParams {
    value: number;
    slot_config: number;
    iteration?: number;
    operation?: "+" | "-" | "r";
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
const deleteBaseConfig = async (id: number, url: string): Promise<void> => await axios.delete(makeUrl(url, { id: id }), { headers: makeHeader() });


export const editWeightConfig = async (data: EditBaseConfigParams) => await editBaseConfig(data, ApiPath.WEIGHT_CONFIG);
export const addWeightConfig = async (data: AddBaseConfigParams) => await addBaseConfig(data, ApiPath.WEIGHT_CONFIG);
export const deleteWeightConfig = async (id: number) => await deleteBaseConfig(id, ApiPath.WEIGHT_CONFIG);

export const editMaxWeightConfig = async (data: EditBaseConfigParams) => await editBaseConfig(data, ApiPath.MAX_WEIGHT_CONFIG);
export const addMaxWeightConfig = async (data: AddBaseConfigParams) => await addBaseConfig(data, ApiPath.MAX_WEIGHT_CONFIG);
export const deleteMaxWeightConfig = async (id: number) => await deleteBaseConfig(id, ApiPath.MAX_WEIGHT_CONFIG);

export const editRepsConfig = async (data: EditBaseConfigParams) => await editBaseConfig(data, ApiPath.REPS_CONFIG);
export const addRepsConfig = async (data: AddBaseConfigParams) => await addBaseConfig(data, ApiPath.REPS_CONFIG);
export const deleteRepsConfig = async (id: number) => await deleteBaseConfig(id, ApiPath.REPS_CONFIG);

export const editMaxRepsConfig = async (data: EditBaseConfigParams) => await editBaseConfig(data, ApiPath.MAX_REPS_CONFIG);
export const addMaxRepsConfig = async (data: AddBaseConfigParams) => await addBaseConfig(data, ApiPath.MAX_REPS_CONFIG);
export const deleteMaxRepsConfig = async (id: number) => await deleteBaseConfig(id, ApiPath.MAX_REPS_CONFIG);

export const editNrOfSetsConfig = async (data: EditBaseConfigParams) => await editBaseConfig(data, ApiPath.NR_OF_SETS_CONFIG);
export const addNrOfSetsConfig = async (data: AddBaseConfigParams) => await addBaseConfig(data, ApiPath.NR_OF_SETS_CONFIG);
export const deleteNrOfSetsConfig = async (id: number) => await deleteBaseConfig(id, ApiPath.NR_OF_SETS_CONFIG);

export const editRirConfig = async (data: EditBaseConfigParams) => await editBaseConfig(data, ApiPath.RIR_CONFIG);
export const addRirConfig = async (data: AddBaseConfigParams) => await addBaseConfig(data, ApiPath.RIR_CONFIG);
export const deleteRirConfig = async (id: number) => await deleteBaseConfig(id, ApiPath.RIR_CONFIG);

export const editRestConfig = async (data: EditBaseConfigParams) => await editBaseConfig(data, ApiPath.REST_CONFIG);
export const addRestConfig = async (data: AddBaseConfigParams) => await addBaseConfig(data, ApiPath.REST_CONFIG);
export const deleteRestConfig = async (id: number) => await deleteBaseConfig(id, ApiPath.REST_CONFIG);

export const editMaxRestConfig = async (data: EditBaseConfigParams) => await editBaseConfig(data, ApiPath.MAX_REST_CONFIG);
export const addMaxRestConfig = async (data: AddBaseConfigParams) => await addBaseConfig(data, ApiPath.MAX_REST_CONFIG);
export const deleteMaxRestConfig = async (id: number) => await deleteBaseConfig(id, ApiPath.MAX_REST_CONFIG);

