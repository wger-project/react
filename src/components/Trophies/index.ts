/**
 * Public surface of the Trophies domain.
 *
 * Other code may only import from `@/components/Trophies`, never from
 * internal sub-paths.
 */
export { TrophiesDetail } from "./components/TrophiesDetail";

// Models
export { Trophy } from "./models/trophy";
export { UserTrophy } from "./models/userTrophy";
export { UserTrophyProgression } from "./models/userTrophyProgression";

// Query hooks
export { useUserTrophiesQuery } from "./queries/trophies";
