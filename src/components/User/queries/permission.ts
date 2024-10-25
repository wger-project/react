import { useQuery } from "@tanstack/react-query";
import { WgerPermissions } from "permissions";
import { checkPermission } from "services/permission";
import { QUERY_PERMISSION } from "utils/consts";

export function usePermissionQuery(permission: WgerPermissions) {
    return useQuery({
        queryKey: [QUERY_PERMISSION, permission],
        queryFn: () => checkPermission(permission.valueOf())
    });
}