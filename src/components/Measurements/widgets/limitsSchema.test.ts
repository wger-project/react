import { limitsSchema } from "@/components/Measurements/widgets/limitsSchema";
import type { TFunction } from "i18next";

// Honours the interpolation the real t performs, so the assertions can see
// the unit landing in the message
const t = ((key: string, options?: { value?: string }) =>
    options?.value !== undefined ? `${key}:${options.value}` : key) as unknown as TFunction;

describe('limitsSchema', () => {

    test('bounds follow the metric type and the messages carry the unit', () => {
        const schema = limitsSchema('body_weight', 'kg', t);

        expect(schema.isValidSync(80)).toBe(true);
        expect(() => schema.validateSync(10)).toThrow('forms.minValue:20 kg');
        expect(() => schema.validateSync(400)).toThrow('forms.maxValue:350 kg');
    });

    test('a label overrides what the message shows, not which bounds apply', () => {
        const schema = limitsSchema('body_weight', 'lb', t, 'server.lb');

        expect(schema.isValidSync(400)).toBe(true);
        expect(() => schema.validateSync(10)).toThrow('forms.minValue:44 server.lb');
    });

    test('a unitless category gets a bare number', () => {
        expect(() => limitsSchema('custom', undefined, t).validateSync(-1))
            .toThrow('forms.minValue:0');
    });

    test('what does not parse as a number is refused, not compared', () => {
        expect(() => limitsSchema('body_weight', 'kg', t).validateSync('abc'))
            .toThrow('forms.fieldRequired');
    });
});
