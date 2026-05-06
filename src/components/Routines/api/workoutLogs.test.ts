import { getExercise } from "@/components/Exercises/api/exercise";
import { addLogs, deleteLog, editLog, getRoutineLogs } from "@/components/Routines/api/workoutLogs";
import { getRoutineRepUnits, getRoutineWeightUnits } from "@/components/Routines/api/workoutUnits";
import { WorkoutLog } from "@/components/Routines/models/WorkoutLog";
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
vi.mock("@/components/Routines/api/workoutUnits");
vi.mock("@/components/Exercises/api/exercise");


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

    test('deleteLog DELETEs /workoutlog/<id>/ and returns the response status', async () => {
        (axios.delete as Mock).mockResolvedValue({ status: 204 });

        const result = await deleteLog(7);

        expect(axios.delete).toHaveBeenCalledTimes(1);
        expect(axios.delete).toHaveBeenCalledWith(
            expect.stringMatching(/\/api\/v2\/workoutlog\/7\/$/),
            expect.anything()
        );
        expect(result).toBe(204);
    });

    test('editLog PATCHes /workoutlog/<id>/ with the snake_case body and returns the parsed log', async () => {
        const apiResponse = {
            id: 5,
            iteration: 1,
            date: "2024-08-01T08:00:00.000Z",
            exercise: 100,
            slot_entry: 2, // eslint-disable-line camelcase
            routine: 1,
            repetitions_unit: 1, // eslint-disable-line camelcase
            repetitions: "10.00",
            repetitions_target: "10.00", // eslint-disable-line camelcase
            weight_unit: 1, // eslint-disable-line camelcase
            weight: "20.00",
            weight_target: "20.00", // eslint-disable-line camelcase
            rir: "1.0",
            rir_target: null, // eslint-disable-line camelcase
            rest: 90,
            rest_target: null, // eslint-disable-line camelcase
        };
        (axios.patch as Mock).mockResolvedValue({ data: apiResponse });

        const log = new WorkoutLog({
            id: 5,
            routineId: 1,
            slotEntryId: 2,
            exerciseId: 100,
            iteration: 1,
            date: new Date("2024-08-01T08:00:00.000Z"),
            repetitions: 10,
            repetitionsTarget: 10,
            repetitionsUnitId: 1,
            weight: 20,
            weightTarget: 20,
            weightUnitId: 1,
            rir: 1,
            restTime: 90,
        });

        const result = await editLog(log);

        expect(axios.patch).toHaveBeenCalledTimes(1);
        const [url, body] = (axios.patch as Mock).mock.calls[0];
        expect(url).toMatch(/\/api\/v2\/workoutlog\/5\/$/);
        expect(body).toMatchObject({
            id: 5,
            exercise: 100,
            // eslint-disable-next-line camelcase
            slot_entry: 2,
            routine: 1,
            // eslint-disable-next-line camelcase
            repetitions_unit: 1,
        });
        expect(result).toBeInstanceOf(WorkoutLog);
        expect(result.id).toBe(5);
    });

    test('addLogs POSTs each entry sequentially and collects the parsed responses', async () => {
        const responses = [
            {
                id: 1,
                iteration: 1,
                date: "2024-08-01T00:00:00Z",
                exercise: 100,
                slot_entry: 2,
                routine: 1,
                repetitions_unit: 1,
                repetitions: "10.00",
                repetitions_target: null,
                weight_unit: 1,
                weight: "20.00",
                weight_target: null,
                rir: null,
                rir_target: null,
                rest: null,
                rest_target: null
            }, // eslint-disable-line camelcase
            {
                id: 2,
                iteration: 1,
                date: "2024-08-02T00:00:00Z",
                exercise: 100,
                slot_entry: 2,
                routine: 1,
                repetitions_unit: 1,
                repetitions: "11.00",
                repetitions_target: null,
                weight_unit: 1,
                weight: "20.00",
                weight_target: null,
                rir: null,
                rir_target: null,
                rest: null,
                rest_target: null
            }, // eslint-disable-line camelcase
        ];
        (axios.post as Mock)
            .mockResolvedValueOnce({ data: responses[0] })
            .mockResolvedValueOnce({ data: responses[1] });

        const result = await addLogs([
            { exercise: 100, repetitions: 10, weight: 20 },
            { exercise: 100, repetitions: 11, weight: 20 },
        ]);

        expect(axios.post).toHaveBeenCalledTimes(2);
        const url = (axios.post as Mock).mock.calls[0][0] as string;
        expect(url).toMatch(/\/api\/v2\/workoutlog\/$/);
        expect(result).toHaveLength(2);
        expect(result[0]).toBeInstanceOf(WorkoutLog);
        expect(result.map(l => l.id)).toEqual([1, 2]);
    });

    test('addLogs returns [] when given an empty list (no requests fire)', async () => {
        const result = await addLogs([]);

        expect(result).toEqual([]);
        expect(axios.post).not.toHaveBeenCalled();
    });
});
