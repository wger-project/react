import { Trophy } from "@/components/Trophies/models/trophy";
import { ApiPath } from "@/core/lib/consts";
import { fetchAll } from "@/core/lib/requests";
import { makeUrl } from "@/core/lib/url";


export const getTrophies = async (): Promise<Trophy[]> => {

    const url = makeUrl(
        ApiPath.API_TROPHIES_PATH
    );
    return await fetchAll(url, Trophy.fromJson);
};

