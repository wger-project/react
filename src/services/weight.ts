import axios from 'axios';
import { BodyWeightType } from 'types';
import { ResponseType } from "./responseType";
import { make_url } from "utils/url";

const WEIGHT_PATH = 'weightentry';

export const get_weights = async () => {
    const {data: received_weights} = await axios.get<ResponseType<BodyWeightType>>(make_url(process.env.REACT_APP_API_SERVER!, WEIGHT_PATH), {
        headers: {
            Authorization: process.env.REACT_APP_API_KEY as string
        }
    })
    return received_weights.results
};