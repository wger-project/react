import { Trophy } from "components/Trophies/models/trophy";
import { API_MAX_PAGE_SIZE, ApiPath } from "utils/consts";
import { fetchPaginated } from "utils/requests";
import { makeHeader, makeUrl } from "utils/url";


export const getTrophies = async (): Promise<Trophy[]> => {

    const url = makeUrl(
        ApiPath.API_TROPHIES_PATH,
        { query: { limit: API_MAX_PAGE_SIZE } }
    );
    const out: Trophy[] = [];

    for await (const page of fetchPaginated(url, makeHeader())) {
        for (const logData of page) {
            out.push(Trophy.fromJson(logData));
        }
    }
    return out;
};

