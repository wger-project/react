import { WgerPermissions } from "permissions";
import { useQuery } from "@tanstack/react-query";
import { QUERY_PERMISSION } from "utils/consts";
import { checkPermission } from "services/permission";

export function usePermissionQuery(permission: WgerPermissions) {
    return useQuery(
        [QUERY_PERMISSION, permission],
        () => checkPermission(permission.valueOf())
    );
}