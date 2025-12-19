import { UserTrophyProgression } from "components/Trophies/models/userTrophyProgression";
import { API_MAX_PAGE_SIZE, ApiPath } from "utils/consts";
import { fetchPaginated } from "utils/requests";
import { makeHeader, makeUrl } from "utils/url";


export const getUserTrophyProgression = async (): Promise<UserTrophyProgression[]> => {

    const url = makeUrl(
        ApiPath.API_USER_TROPHY_PROGRESSION_PATH,
        { query: { limit: API_MAX_PAGE_SIZE } }
    );
    const out: UserTrophyProgression[] = [];

    for await (const page of fetchPaginated(url, makeHeader())) {
        for (const logData of page) {
            out.push(UserTrophyProgression.fromJson(logData));
        }
    }
    return out;
};

