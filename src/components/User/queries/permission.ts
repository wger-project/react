import { useQuery } from "@tanstack/react-query";
import { WgerPermissions } from "@/components/User/permissions";
import { checkPermission } from "@/components/User/api/permission";
import { QUERY_PERMISSION } from "@/core/lib/consts";

export function usePermissionQuery(permission: WgerPermissions) {
    return useQuery({
        queryKey: [QUERY_PERMISSION, permission],
        queryFn: () => checkPermission(permission.valueOf())
    });
}