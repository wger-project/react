import { WeightEntry } from "@/components/BodyWeight/model";
import { processWeights } from "./utils";

describe("process_weight tests", () => {
    test('process some weight entries', () => {

        // Arrange
        //
        const entry1 = new WeightEntry(new Date('2021-12-10'), 80, 1);
        const entry2 = new WeightEntry(new Date('2021-12-20'), 95, 2);
        const entry3 = new WeightEntry(new Date('2021-12-25'), 70, 3);

        // Act
        //
        const result = processWeights([
            entry1,
            entry2,
            entry3,
        ]);

        // Assert
        //
        expect(result[0]).toStrictEqual({
            entry: entry3,
            change: -25,
            days: 5,
            totalChange: -10
        });
        expect(result[1]).toStrictEqual({
            entry: entry2,
            change: 15,
            days: 10,
            totalChange: 15
        });
        expect(result[2]).toStrictEqual({
            entry: entry1,
            change: 0,
            days: 0,
            totalChange: 0
        });
    });

    test('processing an empty weight entry list doesnt crash', () => {
        const result = processWeights([]);
        expect(result).toStrictEqual([]);
    });

    test('totalChange accumulates correctly with multiple entries', () => {
        const entry1 = new WeightEntry(new Date('2021-12-10'), 80, 1);
        const entry2 = new WeightEntry(new Date('2021-12-15'), 75, 2);
        const entry3 = new WeightEntry(new Date('2021-12-20'), 82, 3);
        const entry4 = new WeightEntry(new Date('2021-12-25'), 70, 4);

        const result = processWeights([entry1, entry2, entry3, entry4]);

        expect(result[0].totalChange).toStrictEqual(-10);
        expect(result[1].totalChange).toStrictEqual(2);
        expect(result[2].totalChange).toStrictEqual(-5);
        expect(result[3].totalChange).toStrictEqual(0);
    });
});
