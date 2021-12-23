import axios from 'axios';
import {BodyWeightType} from '../types';
import {ResponseType} from "./responseType";

const BASEURL = 'https://wger-master.rge.uber.space/api/v2/weightentry/';

export const getWeights = async () => {
    const {data: receivedWeights} = await axios.get<ResponseType<BodyWeightType>>(BASEURL, {
        headers: {
            Authorization: process.env.REACT_APP_API_KEY as string
        }
    });
    return receivedWeights.results;
};