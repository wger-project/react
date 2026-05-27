import { editProfile, getProfile } from "@/components/User/api/profile";
import { EditProfileParams } from "@/components/User/models/profile";
import { QueryKey } from "@/core/lib/consts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useProfileQuery() {
    return useQuery({
        queryKey: [QueryKey.PROFILE],
        queryFn: getProfile
    });
}

export const useEditProfileQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<EditProfileParams>) => editProfile(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: [QueryKey.PROFILE] });
        }
    });
};