import axios from "axios";
import { UserTrophy } from "@/components/Trophies/models/userTrophy";
import { ApiPath } from "@/core/lib/consts";
import { fetchAll } from "@/core/lib/requests";
import { makeHeader, makeUrl } from "@/core/lib/url";


export const getUserTrophies = async (): Promise<UserTrophy[]> => {

    const url = makeUrl(
        ApiPath.API_USER_TROPHIES_PATH,
        { query: { "trophy__is_hidden": false } }
    );
    return await fetchAll(url, UserTrophy.fromJson);
};


export const setTrophyAsNotified = async (trophyId: number): Promise<void> => {

    await axios.patch(
        makeUrl(ApiPath.API_USER_TROPHIES_PATH, { id: trophyId }),
        { id: trophyId, "is_notified": true },
        { headers: makeHeader() }
    );

};
