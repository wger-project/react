import { WorkoutLog } from "@/components/WorkoutRoutines/models/WorkoutLog";
import { getExercise } from "@/services";
import { getRoutineLogs } from "@/services/workoutLogs";
import { getRoutineRepUnits, getRoutineWeightUnits } from "@/services/workoutUnits";
import { testExerciseSquats } from "@/tests/exerciseTestdata";
import {
    responseRoutineLogs,
    testRepUnit1,
    testRepUnit2,
    testWeightUnit1,
    testWeightUnit2
} from "@/tests/workoutRoutinesTestData";
import axios from "axios";

import type { Mock } from 'vitest';

vi.mock("axios");
vi.mock("@/services/workoutUnits");
vi.mock("@/services/exercise");


describe("workout logs service tests", () => {

    beforeEach(() => {
        vi.resetAllMocks();
    });

    test('GET the routine logs', async () => {

        (axios.get as Mock).mockImplementation(() => Promise.resolve({ data: responseRoutineLogs }));
        (getRoutineRepUnits as Mock).mockImplementation(() => Promise.resolve([testRepUnit1, testRepUnit2]));
        (getRoutineWeightUnits as Mock).mockImplementation(() => Promise.resolve([testWeightUnit1, testWeightUnit2]));

        // Act
        const result = await getRoutineLogs(1);

        // Assert
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(result).toStrictEqual([
            new WorkoutLog({
                id: 2,
                routineId: 1,
                date: new Date("2023-05-10"),
                iteration: 1,
                exerciseId: 100,
                slotEntryId: 2,

                repetitionsUnit: testRepUnit1,
                repetitionsUnitId: 1,
                repetitions: 12,
                repetitionsTarget: 12,

                weightUnit: testWeightUnit1,
                weightUnitId: 1,
                weight: 10.00,
                weightTarget: null,

                rir: null,
                rirTarget: null,
            }),

            new WorkoutLog({
                id: 1,
                routineId: 1,
                date: new Date("2023-05-13"),
                iteration: 1,
                exerciseId: 100,
                slotEntryId: 2,

                repetitionsUnit: testRepUnit1,
                repetitionsUnitId: 1,
                repetitions: 10,
                repetitionsTarget: null,

                weightUnit: testWeightUnit1,
                weightUnitId: 1,
                weight: 20,
                weightTarget: 20,

                rir: 1.5,
                rirTarget: 1,
            }),
        ]);
    });


    test('GET the routine logs and the exercise bases', async () => {

        // Arrange
        (axios.get as Mock).mockImplementation(() => Promise.resolve({ data: responseRoutineLogs }));
        (getRoutineRepUnits as Mock).mockImplementation(() => Promise.resolve([testRepUnit1, testRepUnit2]));
        (getRoutineWeightUnits as Mock).mockImplementation(() => Promise.resolve([testWeightUnit1, testWeightUnit2]));
        (getExercise as Mock).mockImplementation(() => Promise.resolve(testExerciseSquats));

        // Act
        const result = await getRoutineLogs(1, { loadExercises: true });

        // Assert
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(result).toStrictEqual([
            new WorkoutLog({
                id: 2,
                routineId: 1,
                date: new Date("2023-05-10"),
                iteration: 1,
                exercise: testExerciseSquats,
                exerciseId: 100,
                slotEntryId: 2,
                sessionId: null,

                repetitionsUnit: testRepUnit1,
                repetitionsUnitId: 1,
                repetitions: 12,
                repetitionsTarget: 12,

                weightUnit: testWeightUnit1,
                weightUnitId: 1,
                weight: 10.00,
                weightTarget: null,

                rir: null,
                rirTarget: null,
            }),

            new WorkoutLog({
                id: 1,
                routineId: 1,
                date: new Date("2023-05-13"),
                iteration: 1,
                slotEntryId: 2,
                exercise: testExerciseSquats,
                exerciseId: 100,
                sessionId: null,

                repetitionsUnit: testRepUnit1,
                repetitionsUnitId: 1,
                repetitions: 10,
                repetitionsTarget: null,

                weightUnit: testWeightUnit1,
                weightUnitId: 1,
                weight: 20,
                weightTarget: 20,

                rir: 1.5,
                rirTarget: 1,
            }),
        ]);
    });
});
