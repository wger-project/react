export const ENGLISH_LANGUAGE_ID = 2;
export const ENGLISH_LANGUAGE_CODE = 'en';

export const MIN_ACCOUNT_AGE = import.meta.env.MIN_ACCOUNT_AGE_TO_TRUST || 21;

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
export const QUERY_PROFILE = 'profile';

export const QUERY_ROUTINES = 'routines';
export const QUERY_ROUTINE_DETAIL = 'routine';
export const QUERY_ROUTINES_SHALLOW = 'routines-shallow';
export const QUERY_ROUTINES_ACTIVE = 'routines-active';
export const QUERY_ROUTINE_LOGS = 'routines-logs';

export const QUERY_MEASUREMENTS = 'measurements';
export const QUERY_MEASUREMENTS_CATEGORIES = 'measurements-categories';

/*
 * Keys used for the queries
 *
 * These don't have any meaning, they just need to be globally unique
 */
export enum QueryKey {
    NUTRITIONAL_PLANS = 'nutritional-plans',
    NUTRITIONAL_PLAN = 'nutritional-plan',
    NUTRITIONAL_PLAN_LAST = 'nutritional-plan-last',
    INGREDIENT = 'ingredient',

    BODY_WEIGHT = 'body-weight',
}

/*
 * List of API endpoints
 */
export enum ApiPath {
    MEAL = 'meal',
    MEAL_ITEM = 'mealitem',
    NUTRITIONAL_DIARY = 'nutritiondiary',
    INGREDIENT_PATH = 'ingredientinfo',
    INGREDIENT_SEARCH_PATH = 'ingredient/search',
    INGREDIENT_WEIGHT_UNIT = 'ingredientweightunit'
}


export const API_MAX_PAGE_SIZE = '999';

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


export const TIMEZONE = import.meta.env.TIME_ZONE || 'Europe/Berlin';

export const LANGUAGE_SHORT_ENGLISH = 'en';

export const SNACKBAR_AUTO_HIDE_DURATION = 3000;