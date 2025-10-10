import axios from 'axios';
import { EditProfileParams, Profile } from "components/User/models/profile";
import { ApiPath } from "utils/consts";
import { makeHeader, makeUrl } from "utils/url";

export const API_PROFILE_PATH = 'userprofile';


/*
 * Loads the user's profile
 */
export const getProfile = async (): Promise<Profile | null> => {
    const url = makeUrl(API_PROFILE_PATH);

    // We need to manually catch the error, otherwise react-query will retry the
    // query and report an error in the end
    try {
        const response = await axios.get(
            url,
            { headers: makeHeader() }
        );
        return Profile.fromJson(response.data);
    } catch {
        return null;
    }
};

/*
 * Edits the user's profile
 */
export const editProfile = async (data: Partial<EditProfileParams>): Promise<Profile> => {

    const { weightRounding, repetitionsRounding, ...rest } = data;
    const payload = {
        ...rest,
        // eslint-disable-next-line camelcase
        ...(weightRounding !== undefined && { weight_rounding: weightRounding }),
        // eslint-disable-next-line camelcase
        ...(repetitionsRounding !== undefined && { repetition_rounding: repetitionsRounding }),
    };

    const response = await axios.post(
        makeUrl(ApiPath.API_PROFILE_PATH),
        payload,
        { headers: makeHeader() }
    );

    return Profile.fromJson(response.data);
};
