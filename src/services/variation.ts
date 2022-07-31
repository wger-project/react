import axios from 'axios';
import { makeHeader, makeUrl } from "utils/url";

export const VARIATION_PATH = 'variation';


/*
 * Create a new exercise base
 */
export const addVariation = async (): Promise<number> => {

    const url = makeUrl(VARIATION_PATH);
    const response = await axios.post(url, {}, {
        headers: makeHeader(),
    });

    return response.data.id;
};