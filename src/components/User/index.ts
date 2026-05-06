/**
 * Public surface of the User domain (Django app: core, partial).
 *
 * Other code may only import from `@/components/User`, never from
 * internal sub-paths.
 */
export { type EditProfileParams, Profile } from "./models/profile";
export { WgerPermissions } from "./permissions";

// Query hooks
export { useCanContributeExercises } from "./queries/contribute";
export { usePermissionQuery } from "./queries/permission";
export { useEditProfileQuery, useProfileQuery } from "./queries/profile";
