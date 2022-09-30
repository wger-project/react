import { useQuery } from "@tanstack/react-query";
import { QUERY_PROFILE } from "utils/consts";
import { getProfile } from "services/profile";

export function useProfileQuery() {
    return useQuery(
        [QUERY_PROFILE],
        () => getProfile()
    );
}