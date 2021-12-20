import axios from 'axios';
import { BodyWeightType } from '../types';

const BASEURL = 'https://wger-master.rge.uber.space/api/v2/weightentry/'

interface ResponseType {
    count: number,
    next: number | null,
    previous: number | null,
    results: BodyWeightType[]
}

export const get_weights = async () => {    
    const {data: received_weights} = await axios.get<ResponseType>(BASEURL, {
                headers: {
                    Authorization: process.env.REACT_APP_API_KEY as string
                }
            })
    return received_weights.results    
};