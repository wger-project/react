import axios from 'axios';
import { makeHeader, makeUrl } from "utils/url";

export const PERMISSION_PATH = 'check-permission';


/*
 * Checks if the user has a given permission
 */
export const checkPermission = async (permission: string): Promise<boolean> => {
    const url = makeUrl(PERMISSION_PATH, { query: { 'permission': permission } });
    const response = await axios.get(
        url,
        { headers: makeHeader() }
    );

    // User is logged out, etc.
    if (response.status === 400) {
        return false;
    }

    return response.data.result;
};



