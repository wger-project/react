import axios from 'axios';
import {
    BaseConfig,
    BaseConfigAdapter,
    OperationType,
    RuleRequirements,
    StepType
} from "components/WorkoutRoutines/models/BaseConfig";
import { ApiPath } from "utils/consts";
import { makeHeader, makeUrl } from "utils/url";

export interface AddBaseConfigParams {
    value: number;
    slot_entry: number;
    iteration?: number;
    operation?: OperationType;
    step?: StepType;
    requirements?: RuleRequirements;
}

export interface EditBaseConfigParams extends Partial<AddBaseConfigParams> {
    id: number,
}

export interface ProcessBaseConfigsParams {
    toAdd: AddBaseConfigParams[],
    toEdit: EditBaseConfigParams[],
    toDelete: number[],
    apiPath: ApiPath
}


export const processBaseConfigs = async ({ values, maxValues }: {
    values?: ProcessBaseConfigsParams,
    maxValues?: ProcessBaseConfigsParams
}): Promise<void> => {
    const processEntries = async (entries: ProcessBaseConfigsParams) => {
        const { toAdd, toEdit, toDelete, apiPath } = entries;

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

    if (values !== undefined) {
        await processEntries(values);
    }
    if (maxValues !== undefined) {
        await processEntries(maxValues);
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

