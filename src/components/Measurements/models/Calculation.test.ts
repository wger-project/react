import translations from "@/locales/en/translation.json";
import {
    CALCULATION_TYPES,
    calculationType,
    defaultParams,
    isKnownCalculation,
    missingParams,
    unitMatches
} from "./Calculation";

describe('the calculation table', () => {

    test('a new calculation starts at the numbers the server would use', () => {
        const total = calculationType('ONE_RM_TOTAL')!;

        expect(defaultParams(total)).toStrictEqual({
            exercise_ids: [],
            max_reps: 5,
            window_days: 30,
        });
    });

    test('an absent number is the server default, a wrong one is refused', () => {
        const oneRm = calculationType('ONE_REP_MAX')!;
        const params = { exercise_id: 7 };

        expect(missingParams(oneRm, params)).toStrictEqual([]);
        expect(missingParams(oneRm, { ...params, max_reps: '' })).toStrictEqual([]);
        expect(missingParams(oneRm, { ...params, max_reps: 5.5 })).toStrictEqual(['max_reps']);
        expect(missingParams(oneRm, { ...params, max_reps: '5' })).toStrictEqual(['max_reps']);
    });

    test('a calculation is incomplete until its exercises are picked', () => {
        const total = calculationType('ONE_RM_TOTAL')!;
        const params = defaultParams(total);

        expect(missingParams(total, params)).toStrictEqual(['exercise_ids']);
        expect(missingParams(total, { ...params, exercise_ids: [1] })).toStrictEqual(['exercise_ids']);
        expect(missingParams(total, { ...params, exercise_ids: [1, 2] })).toStrictEqual([]);
    });

    test('a number outside its bounds counts as missing', () => {
        const oneRm = calculationType('ONE_REP_MAX')!;
        const params = { ...defaultParams(oneRm), exercise_id: 7 };

        expect(missingParams(oneRm, { ...params, max_reps: 5 })).toStrictEqual([]);
        expect(missingParams(oneRm, { ...params, max_reps: 42 })).toStrictEqual(['max_reps']);
    });

    test('BMI takes no parameters at all', () => {
        const bmi = calculationType('BMI')!;

        expect(defaultParams(bmi)).toStrictEqual({});
        expect(missingParams(bmi, {})).toStrictEqual([]);
    });

    test('the source of a ratio has to be a length', () => {
        const param = calculationType('WHTR')!.params[0];

        expect(unitMatches(param, 'cm')).toBe(true);
        expect(unitMatches(param, ' IN ')).toBe(true);
        expect(unitMatches(param, 'kg')).toBe(false);
    });

    test('a calculation of a newer server is not known here', () => {
        expect(isKnownCalculation('NONE')).toBe(true);
        expect(isKnownCalculation('BMI')).toBe(true);
        expect(isKnownCalculation('FFMI')).toBe(false);
    });

    test('every calculation brings the strings the form needs', () => {
        const strings = translations.measurements.calculations;

        for (const type of CALCULATION_TYPES) {
            expect(strings.names).toHaveProperty(type.slug);
            for (const param of type.params) {
                // An exercise picker labels itself, the other fields do not
                if (param.kind === 'category' || param.kind === 'int') {
                    expect(strings.params).toHaveProperty(param.key);
                }
                // the bounds of a number are explained under the field
                if (param.kind === 'int') {
                    expect(strings.paramsHelp).toHaveProperty(param.key);
                }
            }
        }

        // A description is optional, but a stray one is never rendered
        for (const slug of Object.keys(strings.descriptions)) {
            expect(isKnownCalculation(slug)).toBe(true);
        }
    });
});
