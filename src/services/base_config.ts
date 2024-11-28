import axios from 'axios';
import { BaseConfig, BaseConfigAdapter, OperationType, StepType } from "components/WorkoutRoutines/models/BaseConfig";
import { ApiPath } from "utils/consts";
import { makeHeader, makeUrl } from "utils/url";

export interface AddBaseConfigParams {
    value: number;
    slot_entry: number;
    iteration?: number;
    operation?: OperationType;
    step?: StepType;
    need_log_to_apply?: boolean;
}

export interface EditBaseConfigParams extends Partial<AddBaseConfigParams> {
    id: number,
}

export const processBaseConfigs = async (toAdd: AddBaseConfigParams[], toEdit: EditBaseConfigParams[], toDelete: number[], apiPath: ApiPath): Promise<void> => {

    for (const entry of toAdd) {
        await addBaseConfig(entry, apiPath);
    }

    for (const entry of toEdit) {
        await editBaseConfig(entry, apiPath);
    }

    for (const entry of toDelete) {
        await deleteBaseConfig(entry, apiPath);
    }
};

export const editBaseConfig = async (data: EditBaseConfigParams, url: string): Promise<BaseConfig> => {

    const response = await axios.patch(
        makeUrl(url, { id: data.id }),
        data,
        { headers: makeHeader() }
    );

    const adapter = new BaseConfigAdapter();
    return adapter.fromJson(response.data);
};

export const addBaseConfig = async (data: AddBaseConfigParams, url: string): Promise<BaseConfig> => {

    const response = await axios.post(
        makeUrl(url),
        data,
        { headers: makeHeader() }
    );

    const adapter = new BaseConfigAdapter();
    return adapter.fromJson(response.data);
};

export const deleteBaseConfig = async (id: number, url: string): Promise<void> => await axios.delete(makeUrl(url, { id: id }), { headers: makeHeader() });

