import axios from 'axios';
import {BodyWeightType} from '../types';
import {ResponseType} from "./responseType";

const BASEURL = 'https://wger-master.rge.uber.space/api/v2/weightentry/'

export const get_weights = async () => {    
    const {data: received_weights} = await axios.get<ResponseType<BodyWeightType>>(BASEURL, {
                headers: {
                    Authorization: process.env.REACT_APP_API_KEY as string
                }
            })
    return received_weights.results    
};