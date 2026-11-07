import { convertWeight } from "./weightUnit";

describe('convertWeight', () => {

    test('returns the value unchanged for the same unit', () => {
        expect(convertWeight(81.234, 'kg', 'kg')).toBe(81.234);
        expect(convertWeight(180.5, 'lb', 'lb')).toBe(180.5);
    });

    test('converts lb to kg, quantized to 2 decimals', () => {
        expect(convertWeight(90, 'lb', 'kg')).toBe(40.82);
        expect(convertWeight(1, 'lb', 'kg')).toBe(0.45);
    });

    test('converts kg to lb, quantized to 2 decimals', () => {
        expect(convertWeight(80, 'kg', 'lb')).toBe(176.37);
        expect(convertWeight(1, 'kg', 'lb')).toBe(2.2);
    });
});
