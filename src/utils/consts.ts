import { Language } from "components/Exercises/models/language";
import { MIN_ACCOUNT_AGE_TO_TRUST, TIME_ZONE } from "config";

export const ENGLISH_LANGUAGE_ID = 2;
export const ENGLISH_LANGUAGE_CODE = 'en';
export const ENGLISH_LANGUAGE_OBJ = new Language(ENGLISH_LANGUAGE_ID, ENGLISH_LANGUAGE_CODE, 'English');

export const MIN_ACCOUNT_AGE = MIN_ACCOUNT_AGE_TO_TRUST || 21;


export const REP_UNIT_REPETITIONS = 1;
export const REP_UNIT_TILL_FAILURE = 2;

export const WEIGHT_UNIT_KG = 1;
export const WEIGHT_UNIT_LB = 2;


export const QUERY_EXERCISES = 'exercises';
export const QUERY_EXERCISE_VARIATIONS = 'variations';
export const QUERY_EXERCISE_DETAIL = 'detail';
export const QUERY_LANGUAGES = 'languages';
export const QUERY_CATEGORIES = 'categories';
export const QUERY_EQUIPMENT = 'equipment';
export const QUERY_MUSCLES = 'muscles';
export const QUERY_NOTES = 'notes';

export const QUERY_PERMISSION = 'permission';

export const QUERY_MEASUREMENTS = 'measurements';
export const QUERY_MEASUREMENTS_CATEGORIES = 'measurements-categories';

/*
 * Keys used for the queries
 *
 * These don't have any meaning, they just need to be globally unique
 */
export enum QueryKey {
    ROUTINE_OVERVIEW = 'routine-overview',
    ROUTINE_DETAIL = 'routine-detail',
    SESSION_SEARCH = 'session-search',
    SESSIONS_FULL = 'sessions-full',
    ROUTINE_LOGS = 'routine-logs',
    ROUTINE_LOG_DATA = 'routine-log-data',
    ROUTINE_STATS = 'routine-stats',
    ROUTINES_ACTIVE = 'routines-active',
    ROUTINES_SHALLOW = 'routines-shallow',
    PRIVATE_TEMPLATES = 'private-templates',
    PUBLIC_TEMPLATES = 'public-templates',

    NUTRITIONAL_PLANS = 'nutritional-plans',
    NUTRITIONAL_PLAN = 'nutritional-plan',
    NUTRITIONAL_PLAN_DIARY = 'nutritional-plan-diary',
    NUTRITIONAL_PLAN_LAST = 'nutritional-plan-last',
    INGREDIENT = 'ingredient',

    BODY_WEIGHT = 'body-weight',

    ROUTINE_WEIGHT_UNITS = 'weight-units',
    ROUTINE_REP_UNITS = 'rep-units',

    QUERY_PROFILE = 'profile',

    EXERCISES = 'exercises',
    EXERCISE_VARIATIONS = 'variations',
    EXERCISE_DETAIL = 'detail',
    LANGUAGES = 'languages',
    CATEGORIES = 'categories',
    EQUIPMENT = 'equipment',
    MUSCLES = 'muscles',
    QUERY_NOTES = 'notes',
}

/*
 * List of API endpoints
 */
export enum ApiPath {

    // Nutrition
    MEAL = 'meal',
    MEAL_ITEM = 'mealitem',
    NUTRITIONAL_DIARY = 'nutritiondiary',
    INGREDIENTINFO_PATH = 'ingredientinfo',
    INGREDIENT_SEARCH_PATH = 'ingredient/search',
    INGREDIENT_WEIGHT_UNIT = 'ingredientweightunit',

    // Routines
    ROUTINE = 'routine',
    WEIGHT_CONFIG = 'weight-config',
    MAX_WEIGHT_CONFIG = 'max-weight-config',
    REPETITIONS_CONFIG = 'repetitions-config',
    MAX_REPS_CONFIG = 'max-repetitions-config',
    RIR_CONFIG = 'rir-config',
    MAX_RIR_CONFIG = 'max-rir-config',
    NR_OF_SETS_CONFIG = 'sets-config',
    MAX_NR_OF_SETS_CONFIG = 'max-sets-config',
    REST_CONFIG = 'rest-config',
    MAX_REST_CONFIG = 'max-rest-config',
    DAY = 'day',
    SLOT = 'slot',
    SLOT_ENTRY = 'slot-entry',
    SESSION = 'workoutsession',

    WORKOUT_LOG = 'workoutlog',
    PRIVATE_TEMPLATE = 'templates',
    PUBLIC_TEMPLATE = 'public-templates',

    // Profile
    API_PROFILE_PATH = 'userprofile',
}


export const API_MAX_PAGE_SIZE = '999';

export const API_RESULTS_PAGE_SIZE = '100';

/*
 * List of colors to use in charts
 *
 * Use e.g. like LIST_OF_COLORS[key % LIST_OF_COLORS.length] so that there
 * are no errors when there are more categories than colors
 *
 * https://www.learnui.design/tools/data-color-picker.html#palette
 */
export const LIST_OF_COLORS8 = [
    "#2a4c7d",
    "#5b5291",
    "#8e5298",
    "#bf5092",
    "#e7537e",
    "#ff6461",
    "#ff813d",
    "#ffa600",
];
export const LIST_OF_COLORS5 = [
    "#2a4c7d",
    "#825298",
    "#d45089",
    "#ff6a59",
    "#ffa600",
];
export const LIST_OF_COLORS3 = [
    "#2a4c7d",
    "#d45089",
    "#ffa600",
];


export const PAGINATION_OPTIONS = {
    pageSizeOptions: [5, 10, 25, 50, 100],
    pageSize: 10,
};


export const TIMEZONE = TIME_ZONE || 'Europe/Berlin';

export const LANGUAGE_SHORT_ENGLISH = 'en';

export const SNACKBAR_AUTO_HIDE_DURATION = 3000;

export const DEBOUNCE_ROUTINE_FORMS = 500;