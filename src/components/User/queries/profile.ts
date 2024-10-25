import { useQuery } from "@tanstack/react-query";
import { getProfile } from "services/profile";
import { QUERY_PROFILE } from "utils/consts";

export function useProfileQuery() {
    return useQuery({
        queryKey: [QUERY_PROFILE],
        queryFn: getProfile
    });
}