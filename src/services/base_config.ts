import axios from 'axios';
import { BaseConfig, BaseConfigAdapter } from "components/WorkoutRoutines/models/BaseConfig";
import { makeHeader, makeUrl } from "utils/url";

export interface AddBaseConfigParams {
    value: number;
    slot_config: number;
    iteration?: number;
    operation?: "+" | "-" | "r";
    step?: "abs" | "percent";
    need_log_to_apply?: boolean;
}

export interface EditBaseConfigParams extends Partial<AddBaseConfigParams> {
    id: number,
}

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

