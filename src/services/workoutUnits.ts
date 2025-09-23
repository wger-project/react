import axios from 'axios';
import { RepetitionUnit, RepetitionUnitAdapter } from "components/WorkoutRoutines/models/RepetitionUnit";
import { WeightUnit, WeightUnitAdapter } from "components/WorkoutRoutines/models/WeightUnit";
import { ApiSettingRepUnitType, ApiSettingWeightUnitType } from 'types';
import { makeHeader, makeUrl } from "utils/url";
import { ResponseType } from "./responseType";

export const API_SETTING_REP_UNIT_PATH = 'setting-repetitionunit';
export const API_SETTING_WEIGHT_UNIT_PATH = 'setting-weightunit';


export const getRoutineRepUnits = async (): Promise<RepetitionUnit[]> => {
    const url = makeUrl(API_SETTING_REP_UNIT_PATH);
    const { data: receivedUnits } = await axios.get<ResponseType<ApiSettingRepUnitType>>(url, {
        headers: makeHeader(),
    });
    const adapter = new RepetitionUnitAdapter();
    return receivedUnits.results.map(l => adapter.fromJson(l));
};

export const getRoutineWeightUnits = async (): Promise<WeightUnit[]> => {
    const url = makeUrl(API_SETTING_WEIGHT_UNIT_PATH);
    const { data: receivedUnits } = await axios.get<ResponseType<ApiSettingWeightUnitType>>(url, {
        headers: makeHeader(),
    });
    const adapter = new WeightUnitAdapter();
    return receivedUnits.results.map(l => adapter.fromJson(l));
};

