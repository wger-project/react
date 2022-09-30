import { useProfileQuery } from "components/User/queries/profile";
import { usePermissionQuery } from "components/User/queries/permission";
import { WgerPermissions } from "permissions";

export function useCanContributeExercises() {
    const profileQuery = useProfileQuery();
    const permissionQuery = usePermissionQuery(WgerPermissions.EDIT_EXERCISE);

    const result = { canContribute: false, anonymous: true, emailVerified: false, admin: false };

    if (profileQuery.isSuccess && permissionQuery.isSuccess) {

        // Profile is null, user is not logged in
        if (profileQuery.data === null) {
            return result;
        }

        result.anonymous = false;

        if (profileQuery.data?.emailVerified) {
            result.emailVerified = true;
        }

        if (permissionQuery.data) {
            result.admin = true;
        }

        if (result.admin || profileQuery.data?.isTrustworthy) {
            result.canContribute = true;
        }
    }
    return result;
}