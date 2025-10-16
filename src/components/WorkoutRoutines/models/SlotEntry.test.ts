import { SlotEntry } from "components/WorkoutRoutines/models/SlotEntry";
import { testSlotEntryApiResponse } from "tests/slotEntryApiResponse";

describe('SlotEntry model tests', () => {


    test('correctly parses the JSON response', () => {
        // Act
        const result = SlotEntry.fromJson(testSlotEntryApiResponse);

        // Assert
        expect(result.id).toEqual(143);
        expect(result.nrOfSetsConfigs[0].id).toEqual(145);
        expect(result.nrOfSetsConfigs[0].value).toEqual(2);

        expect(result.maxNrOfSetsConfigs[0].id).toEqual(222);
        expect(result.maxNrOfSetsConfigs[0].value).toEqual(4);

        expect(result.weightConfigs[0].id).toEqual(142);
        expect(result.weightConfigs[0].value).toEqual(102.5);

        expect(result.maxWeightConfigs[0].id).toEqual(143);
        expect(result.maxWeightConfigs[0].value).toEqual(120);

        expect(result.restTimeConfigs[0].id).toEqual(54);
        expect(result.restTimeConfigs[0].value).toEqual(120);

        expect(result.maxRestTimeConfigs[0].id).toEqual(45);
        expect(result.maxRestTimeConfigs[0].value).toEqual(150);
    });
});