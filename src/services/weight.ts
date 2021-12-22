import axios from 'axios';
import { BodyWeightType } from 'types';
import { ResponseType } from "./responseType";
import { makeHeader, makeUrl } from "utils/url";

const WEIGHT_PATH = 'weightentry';

export const get_weights = async () => {
    const {data: received_weights} = await axios.get<ResponseType<BodyWeightType>>(makeUrl(WEIGHT_PATH), {
        headers: makeHeader(),
    })
    return received_weights.results
};