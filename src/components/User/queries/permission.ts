import { useQuery } from "@tanstack/react-query";
import { WgerPermissions } from "@/components/User/permissions";
import { checkPermission } from "@/components/User/api/permission";
import { QueryKey } from "@/core/lib/consts";

export function usePermissionQuery(permission: WgerPermissions) {
    return useQuery({
        queryKey: [QueryKey.PERMISSION, permission],
        queryFn: () => checkPermission(permission.valueOf())
    });
}