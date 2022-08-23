import { useQuery } from "@tanstack/react-query";
import { QUERY_PERMISSION, QUERY_PROFILE } from "utils/consts";
import { checkPermission } from "services/permission";
import { WgerPermissions } from "permissions";
import { getProfile } from "services/profile";


export function usePermissionQuery(permission: WgerPermissions) {
    return useQuery(
        [QUERY_PERMISSION, permission],
        () => checkPermission(permission.valueOf())
    );
}

export function useProfileQuery() {
    return useQuery(
        [QUERY_PROFILE],
        () => getProfile()
    );
}
