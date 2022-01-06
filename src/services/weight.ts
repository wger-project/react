import axios from 'axios';
import {BodyWeightType} from '../types';
import {ResponseType} from "./responseType";
import { WeightAdapter, WeightEntry } from "components/BodyWeight/model";
import { makeHeader, makeUrl } from "utils/url";

const WEIGHT_PATH = 'weightentry';

export const getWeights = async (): Promise<WeightEntry[]> => {
    const {data: receivedWeights} = await axios.get<ResponseType<BodyWeightType>>(makeUrl(WEIGHT_PATH), {
        headers: makeHeader(),
    });
    const adapter = new WeightAdapter();
    return receivedWeights.results.map(weight => adapter.fromJson(weight));
};

export const deleteWeight = async (id: number): Promise<number> => { //
    const response = await axios.delete<ResponseType<null>>(makeUrl(WEIGHT_PATH, {id: id}), { //
        headers: makeHeader(),
    });

    return response.status;
};