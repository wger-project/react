import { generateChartColors } from "utils/colors";

describe("test the color utility", () => {

    test('3 items or less', () => {
        const result = generateChartColors(2);
        expect(result.next().value).toStrictEqual("#2a4c7d");
        expect(result.next().value).toStrictEqual("#d45089");
    });

    test('5 items or less', () => {
        const result = generateChartColors(5);

        expect(result.next().value).toStrictEqual("#2a4c7d");
        expect(result.next().value).toStrictEqual("#825298");
        expect(result.next().value).toStrictEqual("#d45089");
        expect(result.next().value).toStrictEqual("#ff6a59");
        expect(result.next().value).toStrictEqual("#ffa600");
    });

    test('8 items or more - last ones undefined', () => {
        const result = generateChartColors(8);

        expect(result.next().value).toStrictEqual("#2a4c7d");
        expect(result.next().value).toStrictEqual("#5b5291");
        expect(result.next().value).toStrictEqual("#8e5298");
        expect(result.next().value).toStrictEqual("#bf5092");
        expect(result.next().value).toStrictEqual("#e7537e");
        expect(result.next().value).toStrictEqual("#ff6461");
        expect(result.next().value).toStrictEqual("#ff813d");
        expect(result.next().value).toStrictEqual("#ffa600");

        // If we continue, we get undefined, but that's acceptable since the chart
        // renders this as black
        expect(result.next().value).toStrictEqual(undefined);
    });

});
