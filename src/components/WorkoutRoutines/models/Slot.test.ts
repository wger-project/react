import { Slot } from "components/WorkoutRoutines/models/Slot";

describe('Slot model tests', () => {


    test('Correctly initialises the object with default values', () => {
        // Arrange
        const slot = new Slot({ dayId: 1234 });

        // Assert
        expect(slot.id).toEqual(null);
        expect(slot.dayId).toEqual(1234);
        expect(slot.order).toEqual(1);
        expect(slot.comment).toEqual('');
        expect(slot.config).toEqual(null);
        expect(slot.entries).toEqual([]);
    });

});