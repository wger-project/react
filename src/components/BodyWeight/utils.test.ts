import { processWeight } from "./utils";
import { WeightEntry } from "components/BodyWeight/model";

describe("process_weight tests", () => {
    test('process some weight entries', () => {

        // Arrange
        //
        const entry1 = new WeightEntry(new Date('2021-12-10'), 80, 1);
        const entry2 = new WeightEntry(new Date('2021-12-20'), 95, 2);
        const entry3 = new WeightEntry(new Date('2021-12-25'), 70, 3);

        // Act
        //
        const result = processWeight([
            entry1,
            entry2,
            entry3,
        ]);

        // Assert
        //
        expect(result[0]).toStrictEqual({
            entry: entry1,
            change: 0,
            days: 0
        });
        expect(result[1]).toStrictEqual({
            entry: entry2,
            change: 15,
            days: 10
        });
        expect(result[2]).toStrictEqual({
            entry: entry3,
            change: -25,
            days: 5
        });
    });

    test('processing an empty weight entry list doesnt crash', () => {
        const result = processWeight([]);
        expect(result).toStrictEqual([]);
    });
});
