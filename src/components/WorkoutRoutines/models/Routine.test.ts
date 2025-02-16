import { Routine } from "components/WorkoutRoutines/models/Routine";
import {
    testMuscleBiggus,
    testMuscleDacttilaris,
    testMuscleDeltoid,
    testMuscleRectusAbdominis
} from "tests/exerciseTestdata";
import { testRoutine1, testRoutineDayData1 } from "tests/workoutRoutinesTestData";

describe('Routine model tests', () => {

    let routine: Routine;

    beforeEach(() => {
        routine = testRoutine1;
    });


    test('correctly calculates the routine duration - less than 1 week', () => {
        // Arrange
        routine.start = new Date('2025-01-01');
        routine.end = new Date('2025-01-02');

        // Act
        const duration = routine.duration;
        const durationText = routine.durationText;

        // Assert
        expect(duration.days).toEqual(1);
        expect(duration.weeks).toEqual(0);
        expect(durationText).toEqual('durationWeeksDays');
    });

    test('correctly calculates the routine duration - exactly one week', () => {
        // Arrange
        routine.end = new Date('2025-01-08');

        // Act
        const duration = routine.duration;
        const durationText = routine.durationText;

        // Assert
        expect(duration.days).toEqual(0);
        expect(duration.weeks).toEqual(1);
        expect(durationText).toEqual('durationWeeks');
    });

    test('correctly calculates the routine duration - more than one week', () => {
        // Arrange
        routine.end = new Date('2025-01-10');

        // Act
        const duration = routine.duration;
        const durationText = routine.durationText;

        // Assert
        expect(duration.days).toEqual(2);
        expect(duration.weeks).toEqual(1);
        expect(durationText).toEqual('durationWeeksDays');
    });

    test('correctly returns all the trained muscles', () => {
        // Act
        const muscles = routine.mainMuscles;

        // Assert
        expect(muscles).toEqual([testMuscleBiggus, testMuscleRectusAbdominis, testMuscleDacttilaris, testMuscleDeltoid]);
    });

    test('correctly returns all the secondary trained muscles', () => {
        // Act
        const muscles = routine.secondaryMuscles;

        // Assert
        expect(muscles).toEqual([]);
    });

    test('correctly calculates the iteration for a date', () => {

        // Assert
        expect(routine.getIteration(new Date('2024-01-01'))).toEqual(null);
        expect(routine.getIteration(new Date('2024-05-05'))).toEqual(1);
    });

    test('correctly returns the DayData for an iteration', () => {

        // Assert
        expect(routine.dayDataCurrentIteration).toEqual(testRoutineDayData1);
    });
});