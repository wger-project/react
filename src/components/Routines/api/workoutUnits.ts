import { RepetitionUnit, RepetitionUnitAdapter } from "@/components/Routines/models/RepetitionUnit";
import { WeightUnit, WeightUnitAdapter } from "@/components/Routines/models/WeightUnit";
import { ApiSettingRepUnitType, ApiSettingWeightUnitType } from '@/types';
import { API_MAX_PAGE_SIZE } from "@/core/lib/consts";
import { fetchPaginated } from "@/core/lib/requests";
import { makeHeader, makeUrl } from "@/core/lib/url";

export const API_SETTING_REP_UNIT_PATH = 'setting-repetitionunit';
export const API_SETTING_WEIGHT_UNIT_PATH = 'setting-weightunit';


export const getRoutineRepUnits = async (): Promise<RepetitionUnit[]> => {
    const url = makeUrl(API_SETTING_REP_UNIT_PATH, { query: { limit: API_MAX_PAGE_SIZE } });
    const adapter = new RepetitionUnitAdapter();
    const out: RepetitionUnit[] = [];
    for await (const page of fetchPaginated(url, makeHeader())) {
        out.push(...(page as ApiSettingRepUnitType[]).map(l => adapter.fromJson(l)));
    }
    return out;
};

export const getRoutineWeightUnits = async (): Promise<WeightUnit[]> => {
    const url = makeUrl(API_SETTING_WEIGHT_UNIT_PATH, { query: { limit: API_MAX_PAGE_SIZE } });
    const adapter = new WeightUnitAdapter();
    const out: WeightUnit[] = [];
    for await (const page of fetchPaginated(url, makeHeader())) {
        out.push(...(page as ApiSettingWeightUnitType[]).map(l => adapter.fromJson(l)));
    }
    return out;
};

