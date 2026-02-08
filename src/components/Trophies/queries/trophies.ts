import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTrophies } from "components/Trophies/services/trophies";
import { getUserTrophies, setTrophyAsNotified } from "components/Trophies/services/userTrophies";
import { getUserTrophyProgression } from "components/Trophies/services/userTrophyProgression";
import { QueryKey } from "utils/consts";

export const useTrophiesQuery = () => useQuery({
    queryFn: () => getTrophies(),
    queryKey: [QueryKey.TROPHIES],
});

export const useUserTrophiesQuery = () => useQuery({
    queryFn: () => getUserTrophies(),
    queryKey: [QueryKey.USER_TROPHIES],
});

export const useSetTrophyAsNotifiedQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (trophyId: number) => setTrophyAsNotified(trophyId),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: [QueryKey.USER_TROPHIES]
        })
    });
};

export const useUserTrophyProgressionQuery = () => useQuery({
    queryFn: () => getUserTrophyProgression(),
    queryKey: [QueryKey.USER_TROPHY_PROGRESSION],
});
