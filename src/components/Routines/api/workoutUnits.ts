import { RepetitionUnit, RepetitionUnitAdapter } from "@/components/Routines/models/RepetitionUnit";
import { WeightUnit, WeightUnitAdapter } from "@/components/Routines/models/WeightUnit";
import { fetchAll } from "@/core/lib/requests";
import { makeUrl } from "@/core/lib/url";

export const API_SETTING_REP_UNIT_PATH = 'setting-repetitionunit';
export const API_SETTING_WEIGHT_UNIT_PATH = 'setting-weightunit';


export const getRoutineRepUnits = async (): Promise<RepetitionUnit[]> => {
    const adapter = new RepetitionUnitAdapter();
    return await fetchAll(makeUrl(API_SETTING_REP_UNIT_PATH), json => adapter.fromJson(json));
};

export const getRoutineWeightUnits = async (): Promise<WeightUnit[]> => {
    const adapter = new WeightUnitAdapter();
    return await fetchAll(makeUrl(API_SETTING_WEIGHT_UNIT_PATH), json => adapter.fromJson(json));
};

