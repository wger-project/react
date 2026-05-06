import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTrophies } from "@/components/Trophies/api/trophies";
import { getUserTrophies, setTrophyAsNotified } from "@/components/Trophies/api/userTrophies";
import { getUserTrophyProgression } from "@/components/Trophies/api/userTrophyProgression";
import { QueryKey } from "@/core/lib/consts";

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
