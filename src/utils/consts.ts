export const ENGLISH_LANGUAGE_ID = 2;

export const MIN_ACCOUNT_AGE = process.env.MIN_ACCOUNT_AGE_TO_TRUST || 21;

export const REP_UNIT_REPETITIONS = 1;
export const REP_UNIT_TILL_FAILURE = 2;

export const WEIGHT_UNIT_KG = 1;
export const WEIGHT_UNIT_LB = 2;


export const QUERY_EXERCISE_BASES = 'bases';
export const QUERY_EXERCISE_BASES_VARIATIONS = 'bases-variations';
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
export const QUERY_ROUTINE_LOGS = 'routines-logs';


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