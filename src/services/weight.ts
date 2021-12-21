import axios from 'axios';
import {BodyWeightType} from '../types';
import {ResponseType} from "./responseType";

const API_PATH = '/api/v2/';
const BASEURL = process.env.REACT_APP_API_SERVER as string + API_PATH;
const WEIGHT_PATH = 'weightentry/';


export const get_weights = async () => {
    const {data: received_weights} = await axios.get<ResponseType<BodyWeightType>>(BASEURL + WEIGHT_PATH, {
        headers: {
            Authorization: process.env.REACT_APP_API_KEY as string
        }
    })
    return received_weights.results
};