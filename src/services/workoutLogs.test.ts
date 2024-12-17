import axios from "axios";
import { WorkoutLog } from "components/WorkoutRoutines/models/WorkoutLog";
import { getExercise } from "services";
import { getRoutineLogs } from "services/workoutLogs";
import { getRoutineRepUnits, getRoutineWeightUnits } from "services/workoutUnits";
import { testExerciseSquats } from "tests/exerciseTestdata";
import {
    responseRoutineLogs,
    testRepUnit1,
    testRepUnit2,
    testWeightUnit1,
    testWeightUnit2
} from "tests/workoutRoutinesTestData";

jest.mock("axios");
jest.mock("services/workoutUnits");
jest.mock("services/exercise");


describe("workout logs service tests", () => {

    beforeEach(() => {
        jest.resetAllMocks();
    });

    test('GET the routine logs', async () => {

        // Arrange
        // @ts-ignore
        axios.get.mockImplementation(() => Promise.resolve({ data: responseRoutineLogs }));
        // @ts-ignore
        getRoutineRepUnits.mockImplementation(() => Promise.resolve([testRepUnit1, testRepUnit2]));
        // @ts-ignore
        getRoutineWeightUnits.mockImplementation(() => Promise.resolve([testWeightUnit1, testWeightUnit2]));

        // Act
        const result = await getRoutineLogs(1);

        // Assert
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(result).toStrictEqual([
            new WorkoutLog({
                id: 2,
                date: new Date("2023-05-10"),
                iteration: 1,
                exerciseId: 100,
                slotEntryId: 2,

                repetitionUnitObj: testRepUnit1,
                repetitionUnitId: 1,
                reps: 12,
                repsTarget: 12,

                weightUnitObj: testWeightUnit1,
                weightUnitId: 1,
                weight: 10.00,
                weightTarget: null,

                rir: null,
                rirTarget: null,
            }),

            new WorkoutLog({
                id: 1,
                date: new Date("2023-05-13"),
                iteration: 1,
                exerciseId: 100,
                slotEntryId: 2,

                repetitionUnitObj: testRepUnit1,
                repetitionUnitId: 1,
                reps: 10,
                repsTarget: null,

                weightUnitObj: testWeightUnit1,
                weightUnitId: 1,
                weight: 20,
                weightTarget: 20,

                rir: "1.5",
                rirTarget: "1",
            }),
        ]);
    });


    test('GET the routine logs and the exercise bases', async () => {

        // Arrange
        // @ts-ignore
        axios.get.mockImplementation(() => Promise.resolve({ data: responseRoutineLogs }));
        // @ts-ignore
        getRoutineRepUnits.mockImplementation(() => Promise.resolve([testRepUnit1, testRepUnit2]));
        // @ts-ignore
        getRoutineWeightUnits.mockImplementation(() => Promise.resolve([testWeightUnit1, testWeightUnit2]));
        // @ts-ignore
        getExercise.mockImplementation(() => Promise.resolve(testExerciseSquats));

        // Act
        const result = await getRoutineLogs(1, { loadExercises: true });

        // Assert
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(result).toStrictEqual([
            new WorkoutLog({
                id: 2,
                date: new Date("2023-05-10"),
                iteration: 1,
                exerciseObj: testExerciseSquats,
                exerciseId: 100,
                slotEntryId: 2,

                repetitionUnitObj: testRepUnit1,
                repetitionUnitId: 1,
                reps: 12,
                repsTarget: 12,

                weightUnitObj: testWeightUnit1,
                weightUnitId: 1,
                weight: 10.00,
                weightTarget: null,

                rir: null,
                rirTarget: null,
            }),

            new WorkoutLog({
                id: 1,
                date: new Date("2023-05-13"),
                iteration: 1,
                slotEntryId: 2,
                exerciseObj: testExerciseSquats,
                exerciseId: 100,

                repetitionUnitObj: testRepUnit1,
                repetitionUnitId: 1,
                reps: 10,
                repsTarget: null,

                weightUnitObj: testWeightUnit1,
                weightUnitId: 1,
                weight: 20,
                weightTarget: 20,

                rir: "1.5",
                rirTarget: "1",
            }),
        ]);
    });
});
