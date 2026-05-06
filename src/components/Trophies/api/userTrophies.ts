import axios from "axios";
import { UserTrophy } from "@/components/Trophies/models/userTrophy";
import { API_MAX_PAGE_SIZE, ApiPath } from "@/core/lib/consts";
import { fetchPaginated } from "@/core/lib/requests";
import { makeHeader, makeUrl } from "@/core/lib/url";


export const getUserTrophies = async (): Promise<UserTrophy[]> => {

    const url = makeUrl(
        ApiPath.API_USER_TROPHIES_PATH,
        { query: { limit: API_MAX_PAGE_SIZE } }
    );
    const out: UserTrophy[] = [];

    for await (const page of fetchPaginated(url, makeHeader())) {
        for (const logData of page) {
            out.push(UserTrophy.fromJson(logData));
        }
    }
    return out;
};


export const setTrophyAsNotified = async (trophyId: number): Promise<void> => {

    await axios.patch(
        makeUrl(ApiPath.API_USER_TROPHIES_PATH, { id: trophyId }),
        { id: trophyId, "is_notified": true },
        { headers: makeHeader() }
    );

};
