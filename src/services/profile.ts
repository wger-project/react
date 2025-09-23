import axios from 'axios';
import { EditProfileParams, Profile, ProfileAdapter } from "components/User/models/profile";
import { ApiPath } from "utils/consts";
import { makeHeader, makeUrl } from "utils/url";

export const API_PROFILE_PATH = 'userprofile';


/*
 * Loads the user's profile
 */
export const getProfile = async (): Promise<Profile | null> => {
    const url = makeUrl(API_PROFILE_PATH);
    const adapter = new ProfileAdapter();

    // We need to manually catch the error, otherwise react-query will retry the
    // query and report an error in the end
    try {
        const response = await axios.get(
            url,
            { headers: makeHeader() }
        );
        return adapter.fromJson(response.data);
    } catch (error) {
        return null;
    }
};

/*
 * Edits the user's profile
 */
export const editProfile = async (data: Partial<EditProfileParams>): Promise<Profile> => {
    const response = await axios.post(
        makeUrl(ApiPath.API_PROFILE_PATH),
        data,
        { headers: makeHeader() }
    );

    return new ProfileAdapter().fromJson(response.data);
};
