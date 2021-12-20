import axios from 'axios';
import { BodyWeightType } from '../types';

const BASEURL = 'https://wger-master.rge.uber.space/api/v2/weightentry/'

interface ResponseType {
    count: number,
    next: number | null,
    previous: number | null,
    results: [BodyWeightType]
}

export const get_weights = async () => {
    const {data: received_weights} = await axios.get<ResponseType>(BASEURL, {
                headers: {
                    Authorization: 'Token 31e2ea0322c07b9df583a9b6d1e794f7139e78d4'
                }
            })
    return received_weights.results
};