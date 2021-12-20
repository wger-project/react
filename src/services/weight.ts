import axios from 'axios';
import {BodyWeightType} from '../types';
import {ResponseType} from "./responseType";

const BASEURL = 'https://wger-master.rge.uber.space/api/v2/weightentry/'

export const get_weights = async () => {
    const {data: received_weights} = await axios.get<ResponseType<BodyWeightType>>(BASEURL, {
        headers: {
            Authorization: 'Token 31e2ea0322c07b9df583a9b6d1e794f7139e78d4'
        }
    })
    return received_weights.results
};