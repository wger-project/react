import axios from 'axios';
import { makeHeader, makeUrl } from "@/core/lib/url";

export const PERMISSION_PATH = 'check-permission';


/*
 * Checks if the user has a given permission
 */
export const checkPermission = async (permission: string): Promise<boolean> => {
    const url = makeUrl(PERMISSION_PATH, { query: { 'permission': permission } });

    // Axios rejects 4xx responses, and logged out users get a 400 here. We need to
    // catch that, otherwise react-query retries the query and reports an error for
    // what is a perfectly normal case.
    try {
        const response = await axios.get(
            url,
            { headers: makeHeader() }
        );
        return response.data.result;
    } catch {
        return false;
    }
};



