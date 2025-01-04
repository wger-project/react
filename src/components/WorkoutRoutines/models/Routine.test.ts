import { Routine } from "components/WorkoutRoutines/models/Routine";

describe('Routine model tests', () => {

    let routine1: Routine;

    beforeEach(() => {
        routine1 = new Routine(
            1,
            'Routine 1',
            'Description',
            new Date('2025-01-01'),
            new Date('2025-01-01'),
            new Date('2025-01-02'),
            false,
        );
    });


    test('correctly calculates the routine duration - less than 1 week', () => {
        // Act
        const duration = routine1.duration;
        const durationText = routine1.durationText;

        // Assert
        expect(duration.days).toEqual(1);
        expect(duration.weeks).toEqual(0);
        expect(durationText).toEqual('durationWeeksDays');
    });

    test('correctly calculates the routine duration - exactly one week', () => {
        // Arrange
        routine1.end = new Date('2025-01-08');

        // Act
        const duration = routine1.duration;
        const durationText = routine1.durationText;

        // Assert
        expect(duration.days).toEqual(0);
        expect(duration.weeks).toEqual(1);
        expect(durationText).toEqual('durationWeeks');
    });

    test('correctly calculates the routine duration - more than one week', () => {
        // Arrange
        routine1.end = new Date('2025-01-10');

        // Act
        const duration = routine1.duration;
        const durationText = routine1.durationText;

        // Assert
        expect(duration.days).toEqual(2);
        expect(duration.weeks).toEqual(1);
        expect(durationText).toEqual('durationWeeksDays');
    });
});