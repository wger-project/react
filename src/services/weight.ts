import axios from 'axios';
import { BodyWeightType } from 'types';
import { ResponseType } from "./responseType";
import { WeightAdapter, WeightEntry } from "components/BodyWeight/model";

const BASEURL = 'https://wger-master.rge.uber.space/api/v2/weightentry/';

export const getWeights = async (): Promise<WeightEntry[]> => {
    const { data: receivedWeights } = await axios.get<ResponseType<BodyWeightType>>(BASEURL, {
        headers: {
            Authorization: process.env.REACT_APP_API_KEY as string
        }
    });

    const adapter = new WeightAdapter();
    return receivedWeights.results.map(weight => adapter.fromJson(weight));
};