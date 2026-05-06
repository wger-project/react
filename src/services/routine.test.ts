import { Day } from "@/components/Routines/models/Day";
import { Routine } from "@/components/Routines/models/Routine";
import { RoutineStatsData } from "@/components/Routines/models/LogStats";
import { SetConfigData } from "@/components/Routines/models/SetConfigData";
import { WorkoutLog } from "@/components/Routines/models/WorkoutLog";
import { getRoutinesShallow } from "@/services";
import {
    addRoutine,
    deleteRoutine,
    editRoutine,
    getActiveRoutine,
    getPrivateTemplatesShallow,
    getPublicTemplatesShallow,
    getRoutine,
    getRoutineDayDataAllIterations,
    getRoutineLogData,
    getRoutineStatisticsData,
    getRoutineStructure,
} from "@/services/routine";
import { getExercise } from "@/services/exercise";
import { getRoutineLogs } from "@/services/workoutLogs";
import { getRoutineRepUnits, getRoutineWeightUnits } from "@/services/workoutUnits";
import { testExerciseBenchPress, testExerciseCurls } from "@/tests/exerciseTestdata";
import {
    responseAddRoutine,
    responseApiWorkoutRoutine,
    responseEditRoutine,
    responseEmptyRoutineList,
    responsePrivateTemplate,
    responsePublicTemplate,
    responseRoutineDayData,
    responseRoutineLogData,
    responseRoutineLogs,
    responseRoutineStats,
    responseRoutineStructure,
    responseRoutinesShallowWithTemplate,
    responseSingleRoutineDetail,
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

describe("workout routine service tests", () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });


    test('GET the routine data - shallow', async () => {

        // Arrange
        (axios.get as Mock).mockImplementation(() => Promise.resolve({ data: responseApiWorkoutRoutine }));

        // Act
        const result = await getRoutinesShallow();

        // Assert
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(result).toStrictEqual([
            new Routine({
                id: 1,
                name: 'My first routine!',
                description: 'Well rounded full body routine',
                created: new Date("2022-01-01T12:34:30+01:00"),
                start: new Date("2024-03-01T00:00:00.000Z"),
                end: new Date("2024-04-30T00:00:00.000Z"),
                fitInWeek: false,
            }),
            new Routine({
                id: 2,
                name: 'Beach body',
                description: 'Train only arms and chest, no legs!!!',
                created: new Date("2023-01-01T17:22:22+02:00"),
                start: new Date("2024-03-01T00:00:00.000Z"),
                end: new Date("2024-04-30T00:00:00.000Z"),
                fitInWeek: false,
            }),
        ]);
        expect(result[0].days.length).toEqual(0);
        expect(result[1].days.length).toEqual(0);
    });

    test('GET the routine data - shallow filters out templates', async () => {
        (axios.get as Mock).mockImplementation(() => Promise.resolve({ data: responseRoutinesShallowWithTemplate }));

        const result = await getRoutinesShallow();

        // Only non-template routines are returned
        expect(result).toHaveLength(2);
        expect(result.find(r => r.id === 99)).toBeUndefined();
    });


    test('GET the routine logs', async () => {

        // Arrange
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
                repetitionsUnitId: 1,
                repetitions: 12,
                repetitionsTarget: 12,
                weight: 10.00,
                weightUnitId: 1,
                rir: null,
                repetitionsUnit: testRepUnit1,
                weightUnit: testWeightUnit1,
            }),

            new WorkoutLog({
                id: 1,
                routineId: 1,
                date: new Date("2023-05-13"),
                iteration: 1,
                exerciseId: 100,
                slotEntryId: 2,
                repetitionsUnitId: 1,
                repetitions: 10,
                weight: 20,
                weightTarget: 20,
                weightUnitId: 1,
                rir: 1.5,
                rirTarget: 1,
                repetitionsUnit: testRepUnit1,
                weightUnit: testWeightUnit1,
            }),
        ]);
    });

    test('GET the routine day data', async () => {
        // Arrange
        (axios.get as Mock).mockImplementation(() => Promise.resolve({ data: responseRoutineDayData }));

        // Act
        const result = await getRoutineDayDataAllIterations(1);

        // Assert
        expect(axios.get).toHaveBeenCalledTimes(1);

        expect(result[0].iteration).toStrictEqual(42);
        expect(result[0].date).toStrictEqual(new Date('2024-04-01'));
        expect(result[0].label).toStrictEqual('first label');
        expect(result[0].day).toStrictEqual(
            new Day({
                id: 100,
                routineId: null,
                order: 5,
                name: 'Push day',
                description: '',
                isRest: false,
                needLogsToAdvance: false,
                type: 'custom',
                config: null
            })
        );
        expect(result[0].slots[0].comment).toEqual('Push set 1');
        expect(result[0].slots[0].isSuperset).toEqual(true);
        expect(result[0].slots[0].exerciseIds).toEqual([9, 12]);
        expect(result[0].slots[0].setConfigs[0]).toEqual(
            new SetConfigData({
                    exerciseId: 9,
                    slotEntryId: 1000,
                    type: "dropset",
                    nrOfSets: 5,
                    maxNrOfSets: null,
                    weight: 100,
                    maxWeight: 120,
                    weightUnitId: 1,
                    weightRounding: 1.25,
                    repetitions: 10,
                    maxRepetitions: null,
                    repetitionsUnitId: 1,
                    repetitionsRounding: 1,
                    rir: 2,
                    maxRir: null,
                    rpe: 8,
                    restTime: 120,
                    maxRestTime: 180,
                    textRepr: "5 Sets, 10 × 100-120 kg @ 2 RiR",
                    comment: "foo"
                },
            )
        );
        expect(result[0].slots[0].setConfigs[1]).toEqual(
            new SetConfigData({
                    exerciseId: 12,
                    slotEntryId: 1001,
                    type: "normal",
                    nrOfSets: 3,
                    maxNrOfSets: null,
                    weight: 90,
                    maxWeight: null,
                    weightUnitId: 1,
                    weightRounding: 1.25,
                    repetitions: 12,
                    maxRepetitions: null,
                    repetitionsUnitId: 1,
                    repetitionsRounding: 1,
                    rir: 2,
                    rpe: 8,
                    restTime: 120,
                    maxRestTime: null,
                    textRepr: "3 Sets, 12 × 90 kg @ 2 RiR",
                    comment: "bar"
                },
            )
        );
    });

    test('getActiveRoutine returns null when no routines exist', async () => {
        (axios.get as Mock).mockResolvedValue({ data: responseEmptyRoutineList });

        const result = await getActiveRoutine();

        expect(result).toBeNull();
        // Only the list call should have happened; processRoutine must not be triggered.
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining("is_template=false"),
            expect.anything()
        );
    });

    test('getPrivateTemplatesShallow hits the templates path and maps all results', async () => {
        (axios.get as Mock).mockResolvedValue({ data: responsePrivateTemplate });

        const result = await getPrivateTemplatesShallow();

        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining("/api/v2/templates/"),
            expect.anything()
        );
        // Templates are NOT filtered out here (different from getRoutinesShallow)
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(11);
        expect(result[0].isTemplate).toBe(true);
    });

    test('getPublicTemplatesShallow hits the public-templates path', async () => {
        (axios.get as Mock).mockResolvedValue({ data: responsePublicTemplate });

        const result = await getPublicTemplatesShallow();

        expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining("/api/v2/public-templates/"),
            expect.anything()
        );
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(22);
        expect(result[0].isPublic).toBe(true);
    });

    test('addRoutine POSTs the serialized routine and returns the parsed response', async () => {
        const routine = new Routine({
            name: 'New plan',
            description: 'desc',
            start: new Date('2024-08-01'),
            end: new Date('2024-09-01'),
            fitInWeek: true,
        });
        (axios.post as Mock).mockResolvedValue({ data: responseAddRoutine });

        const result = await addRoutine(routine);

        expect(axios.post).toHaveBeenCalledTimes(1);
        const [url, body] = (axios.post as Mock).mock.calls[0];
        expect(url).toMatch(/\/api\/v2\/routine\/$/);
        // Body must be the snake_case payload from toJson
        expect(body).toMatchObject({
            name: 'New plan',
            description: 'desc',
            start: '2024-08-01',
            end: '2024-09-01',
            // eslint-disable-next-line camelcase
            fit_in_week: true,
        });
        expect(result).toBeInstanceOf(Routine);
        expect(result.id).toBe(77);
    });

    test('editRoutine PATCHes the routine endpoint with the id in the URL', async () => {
        const routine = new Routine({
            id: 42,
            name: 'Edited',
            description: 'updated description',
            start: new Date('2024-08-01'),
            end: new Date('2024-09-01'),
        });
        (axios.patch as Mock).mockResolvedValue({ data: responseEditRoutine });

        const result = await editRoutine(routine);

        expect(axios.patch).toHaveBeenCalledTimes(1);
        const [url, body] = (axios.patch as Mock).mock.calls[0];
        expect(url).toMatch(/\/api\/v2\/routine\/42\/$/);
        expect(body.name).toBe('Edited');
        expect(result.id).toBe(42);
    });

    test('deleteRoutine DELETEs and returns the response status', async () => {
        (axios.delete as Mock).mockResolvedValue({ status: 204 });

        const result = await deleteRoutine(13);

        expect(axios.delete).toHaveBeenCalledTimes(1);
        expect(axios.delete).toHaveBeenCalledWith(
            expect.stringMatching(/\/api\/v2\/routine\/13\/$/),
            expect.anything()
        );
        expect(result).toBe(204);
    });

    test('getRoutineStructure hits the structure endpoint and parses days', async () => {
        (axios.get as Mock).mockResolvedValue({ data: responseRoutineStructure });

        const result = await getRoutineStructure(7);

        expect(axios.get).toHaveBeenCalledWith(
            expect.stringMatching(/\/api\/v2\/routine\/7\/structure\/$/),
            expect.anything()
        );
        expect(result).toHaveLength(2);
        expect(result[0]).toBeInstanceOf(Day);
        expect(result[0].name).toBe('Push day');
        expect(result[1].name).toBe('Pull day');
    });

    test('getRoutineLogData hits the logs endpoint and maps via the adapter', async () => {
        (axios.get as Mock).mockResolvedValue({ data: responseRoutineLogData });

        const result = await getRoutineLogData(1);

        expect(axios.get).toHaveBeenCalledWith(
            expect.stringMatching(/\/api\/v2\/routine\/1\/logs\/$/),
            expect.anything()
        );
        expect(result).toHaveLength(1);
        expect(result[0].session.id).toBe(1);
        expect(result[0].session.dayId).toBe(5);
        expect(result[0].logs).toEqual([]);
    });

    test('getRoutine assembles detail + structure + dayData + units into a single Routine', async () => {
        // processRoutine fans out to several endpoints. Route the axios.get mock
        // by URL so each call returns the right fixture.
        (axios.get as Mock).mockImplementation((url: string) => {
            if (url.includes("date-sequence-display")) {
                return Promise.resolve({ data: responseRoutineDayData });
            }
            if (url.includes("structure")) {
                return Promise.resolve({ data: responseRoutineStructure });
            }
            // Default: the routine detail itself
            return Promise.resolve({ data: responseSingleRoutineDetail });
        });
        (getRoutineRepUnits as Mock).mockResolvedValue([testRepUnit1, testRepUnit2]);
        (getRoutineWeightUnits as Mock).mockResolvedValue([testWeightUnit1, testWeightUnit2]);
        // The dayData fixture references exercise ids 9 and 12 - return a stub for each.
        (getExercise as Mock).mockImplementation((id: number) =>
            Promise.resolve(id === 9 ? testExerciseBenchPress : testExerciseCurls)
        );

        const result = await getRoutine(1);

        expect(result).toBeInstanceOf(Routine);
        expect(result.id).toBe(1);
        expect(result.name).toBe("My first routine!");
        // Both endpoints (dayData + structure) ran and were attached to the routine
        expect(result.dayData.length).toBe(responseRoutineDayData.length);
        expect(result.days.length).toBe(responseRoutineStructure.days.length);
        // The detail + dayData + structure endpoints were each hit
        const calledUrls = (axios.get as Mock).mock.calls.map(([url]) => url as string);
        expect(calledUrls.some(u => u.includes("date-sequence-display"))).toBe(true);
        expect(calledUrls.some(u => u.includes("structure"))).toBe(true);
        // Unit lookups happened too
        expect(getRoutineRepUnits).toHaveBeenCalled();
        expect(getRoutineWeightUnits).toHaveBeenCalled();
    });

    test('getRoutineStatisticsData hits the stats endpoint and returns RoutineStatsData', async () => {
        (axios.get as Mock).mockResolvedValue({ data: responseRoutineStats });

        const result = await getRoutineStatisticsData(3);

        expect(axios.get).toHaveBeenCalledWith(
            expect.stringMatching(/\/api\/v2\/routine\/3\/stats\/$/),
            expect.anything()
        );
        expect(result).toBeInstanceOf(RoutineStatsData);
        expect(result.sets.mesocycle.exercises[9]).toBe(5);
        expect(result.sets.mesocycle.total).toBe(5);
    });
});
