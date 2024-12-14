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
                repetitionUnitId: 1,
                reps: 12,
                weight: 10.00,
                weightUnitId: 1,
                rir: "",
                repetitionUnitObj: testRepUnit1,
                weightUnitObj: testWeightUnit1,
            }),

            new WorkoutLog({
                id: 1,
                date: new Date("2023-05-13"),
                iteration: 1,
                exerciseId: 100,
                slotEntryId: 2,
                repetitionUnitId: 1,
                reps: 10,
                weight: 20,
                weightUnitId: 1,
                rir: "",
                repetitionUnitObj: testRepUnit1,
                weightUnitObj: testWeightUnit1,
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
                exerciseId: 100,
                slotEntryId: 2,
                repetitionUnitId: 1,
                reps: 12,
                weight: 10.00,
                weightUnitId: 1,
                rir: "",
                repetitionUnitObj: testRepUnit1,
                weightUnitObj: testWeightUnit1,
                exerciseObj: testExerciseSquats,
            }),

            new WorkoutLog({
                id: 1,
                date: new Date("2023-05-13"),
                iteration: 1,
                exerciseId: 100,
                slotEntryId: 2,
                repetitionUnitId: 1,
                reps: 10,
                weight: 20,
                weightUnitId: 1,
                rir: "",
                repetitionUnitObj: testRepUnit1,
                weightUnitObj: testWeightUnit1,
                exerciseObj: testExerciseSquats,
            }),
        ]);
    });
});
