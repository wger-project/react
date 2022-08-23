import { useQuery } from "@tanstack/react-query";
import { QUERY_PERMISSION } from "utils/consts";
import { checkPermission } from "services/permission";
import { WgerPermissions } from "permissions";


export function usePermissionQuery(permission: WgerPermissions) {
    return useQuery(
        [QUERY_PERMISSION, permission],
        () => checkPermission(permission.valueOf())
    );
}
