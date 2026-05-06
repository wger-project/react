import axios from "axios";
import { ApiUserTrophyType, UserTrophyProgression } from "@/components/Trophies/models/userTrophyProgression";
import { ApiPath } from "@/core/lib/consts";
import { makeHeader, makeUrl } from "@/core/lib/url";


export const getUserTrophyProgression = async (): Promise<UserTrophyProgression[]> => {

    const { data: trophyData } = await axios.get(
        makeUrl(ApiPath.API_USER_TROPHY_PROGRESSION_PATH),
        { headers: makeHeader() }
    );

    return trophyData.map((item: ApiUserTrophyType) => UserTrophyProgression.fromJson(item));
};

