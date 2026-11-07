/**
 * The calculations the server can run for a measurement category.
 *
 * Mirrored here rather than fetched: the labels are translated in the client
 * anyway, so a descriptor would carry what the client already knows. Keep in
 * step with wger/measurements/dynamic/types.py.
 */

/** The server's dynamic_type for a category the user fills in themselves */
export const CALCULATION_NONE = 'NONE';

/**
 * The keys are literal types so the labels and help texts resolve to actual
 * translation keys (measurements.calculations.params.<key>)
 */
export type CalculationParam =
/** One of the user's own measurement categories, filtered by its unit */
    | { key: 'category_id', kind: 'category', unitFilter: string[] }
    /** A single exercise, stored as its id */
    | { key: 'exercise_id', kind: 'exercise' }
    /** Two to five exercises, stored as a list of ids */
    | { key: 'exercise_ids', kind: 'exercises', minItems: number, maxItems: number }
    /** A bounded number with a value the server falls back to */
    | { key: 'max_reps' | 'window_days', kind: 'int', min: number, max: number, fallback: number };

/**
 * One row of the table below. The slug stays a plain string, the union is
 * derived from the table itself (see CalculationSlug).
 */
export interface CalculationType {
    slug: string;
    /** Prefill for the category unit; the user can still change it */
    unit: string;
    params: readonly CalculationParam[];
    /** Needs the height in the user profile, and computes nothing without it */
    needsHeight: boolean;
}

/**
 * The units a length may be written in, as the server reads them. Translated
 * spellings are deliberately not in here, that list has no end.
 */
export const LENGTH_UNITS = [
    'mm',
    'millimeter',
    'millimeters',
    'cm',
    'centimeter',
    'centimeters',
    'm',
    'meter',
    'meters',
    'in',
    'inch',
    'inches',
    '"',
    '\u2033',
];

/** The bounds repeat what the server validates, they are not read from its schema */
export const CALCULATION_TYPES = [
    {
        slug: 'BMI',
        unit: 'kg/m²',
        params: [],
        needsHeight: true,
    },
    {
        slug: 'WHTR',
        unit: '',
        params: [
            { key: 'category_id', kind: 'category', unitFilter: LENGTH_UNITS },
        ],
        needsHeight: true,
    },
    {
        slug: 'ONE_REP_MAX',
        unit: 'kg',
        params: [
            { key: 'exercise_id', kind: 'exercise' },
            { key: 'max_reps', kind: 'int', min: 1, max: 10, fallback: 5 },
        ],
        needsHeight: false,
    },
    {
        slug: 'ONE_RM_TOTAL',
        unit: 'kg',
        params: [
            { key: 'exercise_ids', kind: 'exercises', minItems: 2, maxItems: 5 },
            { key: 'max_reps', kind: 'int', min: 1, max: 10, fallback: 5 },
            { key: 'window_days', kind: 'int', min: 7, max: 120, fallback: 30 },
        ],
        needsHeight: false,
    },
] as const satisfies readonly CalculationType[];

/** What this release knows, derived from the table so the two cannot drift */
export type CalculationSlug = typeof CALCULATION_TYPES[number]['slug'];

/**
 * Bench press, squat and deadlift. By uuid, since the numeric id is local to
 * each instance; one that never synced them resolves nothing.
 */
export const BIG_THREE_UUIDS = [
    '3717d144-7815-4a97-9a56-956fb889c996',
    'a2f5b6ef-b780-49c0-8d96-fdaff23e27ce',
    'ee8e8db4-2d82-49e1-ab7f-891e9a354934',
];

export function calculationType(slug: string): CalculationType | undefined {
    return CALCULATION_TYPES.find(type => type.slug === slug);
}

/** Whether this release can render a stored calculation; an unknown one keeps its parameters */
export function isKnownCalculation(slug: string): boolean {
    return slug === CALCULATION_NONE || calculationType(slug) !== undefined;
}

/**
 * Whether a category's unit fits a parameter that asks for one. A trailing
 * dot is an abbreviation, not a different unit ("cm.")
 */
export function unitMatches(param: CalculationParam, unit: string): boolean {
    return param.kind === 'category'
        && param.unitFilter.includes(unit.trim().toLowerCase().replace(/\.$/, ''));
}

/**
 * The parameters a freshly picked calculation starts with. The numbers start
 * at the server's default so the user sees it, an empty field means it again.
 */
export function defaultParams(type: CalculationType): Record<string, unknown> {
    const params: Record<string, unknown> = {};
    for (const param of type.params) {
        if (param.kind === 'exercises') {
            params[param.key] = [];
        } else if (param.kind === 'int') {
            params[param.key] = param.fallback;
        } else {
            params[param.key] = null;
        }
    }
    return params;
}

/**
 * The parameter keys the server would refuse. A number may be absent, it then
 * falls back to the server's default.
 */
export function missingParams(type: CalculationType, params: Record<string, unknown>): string[] {
    return type.params.filter(param => {
        const value = params[param.key];
        switch (param.kind) {
            case 'exercises':
                return !Array.isArray(value)
                    || value.length < param.minItems
                    || value.length > param.maxItems;
            case 'int':
                if (value === undefined || value === null || value === '') {
                    return false;
                }
                return typeof value !== 'number'
                    || !Number.isInteger(value)
                    || value < param.min
                    || value > param.max;
            default:
                return value === null || value === undefined || value === '';
        }
    }).map(param => param.key);
}
