import axios from "axios";
import { Day } from "components/WorkoutRoutines/models/Day";
import { Routine } from "components/WorkoutRoutines/models/Routine";
import { SetConfigData } from "components/WorkoutRoutines/models/SetConfigData";
import { WorkoutLog } from "components/WorkoutRoutines/models/WorkoutLog";
import { getRoutinesShallow } from "services";
import { getRoutineDayDataCurrentIteration } from "services/routine";
import { getRoutineLogs } from "services/workoutLogs";
import { getRoutineRepUnits, getRoutineWeightUnits } from "services/workoutUnits";
import {
    responseApiWorkoutRoutine,
    responseRoutineIterationDataToday,
    responseRoutineLogs,
    testRepUnit1,
    testRepUnit2,
    testWeightUnit1,
    testWeightUnit2
} from "tests/workoutRoutinesTestData";

jest.mock("axios");
jest.mock("services/workoutUnits");
jest.mock("services/exercise");


describe("workout routine service tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });


    test('GET the routine data - shallow', async () => {

        // Arrange
        // @ts-ignore
        axios.get.mockImplementation(() => Promise.resolve({ data: responseApiWorkoutRoutine }));

        // Act
        const result = await getRoutinesShallow();

        // @ts-ignore
        // console.log(axios.get.mock.calls)

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
                repsTarget: 12,
                weight: 10.00,
                weightUnitId: 1,
                rir: null,
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
                weightTarget: 20,
                weightUnitId: 1,
                rir: 1.5,
                rirTarget: 1,
                repetitionUnitObj: testRepUnit1,
                weightUnitObj: testWeightUnit1,
            }),
        ]);
    });

    test('GET the routine day data for today', async () => {
        // Arrange
        // @ts-ignore
        axios.get.mockImplementation(() => Promise.resolve({ data: responseRoutineIterationDataToday }));

        // Act
        const result = await getRoutineDayDataCurrentIteration(1);

        // Assert
        expect(axios.get).toHaveBeenCalledTimes(1);

        expect(result[0].iteration).toStrictEqual(42);
        expect(result[0].date).toStrictEqual(new Date('2024-04-01'));
        expect(result[0].label).toStrictEqual('first label');
        expect(result[0].day).toStrictEqual(
            new Day({
                id: 100,
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
                    reps: 10,
                    maxReps: null,
                    repsUnitId: 1,
                    repsRounding: 1,
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
                    reps: 12,
                    maxReps: null,
                    repsUnitId: 1,
                    repsRounding: 1,
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
});
