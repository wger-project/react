import { processWeight } from "./utils";
import { WeightEntry } from "components/BodyWeight/model";

describe("process_weight tests", () => {
    test('process some weight entries', () => {

        const result = processWeight([
            new WeightEntry(new Date('2021-12-10'), 80, 1),
            new WeightEntry(new Date('2021-12-20'), 95, 2),
            new WeightEntry(new Date('2021-12-25'), 70, 3),
        ]);

        expect(result[0]).toStrictEqual({
            id: 3,
            weight: 70,
            date: new Date("2021-12-25T00:00:00.000Z"),
            change: -25,
            days: 5
        });
        expect(result[1]).toStrictEqual({
            id: 2,
            weight: 95,
            date: new Date("2021-12-20T00:00:00.000Z"),
            change: 15,
            days: 10
        });
        expect(result[2]).toStrictEqual({
            id: 1,
            weight: 80,
            date: new Date("2021-12-10T00:00:00.000Z"),
            change: 0,
            days: 0
        });
    });

    test('processing an empty weight entry list doesnt crash', () => {
        const result = processWeight([]);
        expect(result).toStrictEqual([]);
    });
});
