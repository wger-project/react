import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EditProfileParams } from "components/User/models/profile";
import { editProfile, getProfile } from "services/profile";
import { QueryKey } from "utils/consts";

export function useProfileQuery() {
    return useQuery({
        queryKey: [QueryKey.QUERY_PROFILE],
        queryFn: getProfile
    });
}

export const useEditProfileQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<EditProfileParams>) => editProfile(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: [QueryKey.QUERY_PROFILE] });
        }
    });
};