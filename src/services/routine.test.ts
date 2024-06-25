import axios from "axios";
import { Day } from "components/WorkoutRoutines/models/Day";
import { Routine } from "components/WorkoutRoutines/models/Routine";
import { SetConfigData } from "components/WorkoutRoutines/models/SetConfigData";
import { WorkoutLog } from "components/WorkoutRoutines/models/WorkoutLog";
import { getRoutinesShallow } from "services";
import { getRoutineDayDataCurrentIteration } from "services/routine";
import { getRoutineLogs } from "services/workoutLogs";
import { getRepUnits, getWeightUnits } from "services/workoutUnits";
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
jest.mock("services/workoutUnits");
jest.mock("services/exercise");


describe("workout routine service tests", () => {

    test('GET the routine data - shallow', async () => {

        // Arrange
        // @ts-ignore
        axios.get.mockImplementation(() => Promise.resolve({ data: responseApiWorkoutRoutine }));

        // Act
        const result = await getRoutinesShallow();

        // Assert
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(result).toStrictEqual([
            new Routine(1,
                'My first routine!',
                'Well rounded full body routine',
                3,
                new Date("2022-01-01T12:34:30+01:00"),
                new Date("2024-03-01T00:00:00.000Z"),
                new Date("2024-04-30T00:00:00.000Z"),
            ),
            new Routine(2,
                'Beach body',
                'Train only arms and chest, no legs!!!',
                5,
                new Date("2023-01-01T17:22:22+02:00"),
                new Date("2024-03-01T00:00:00.000Z"),
                new Date("2024-04-30T00:00:00.000Z"),
            ),
        ]);
        expect(result[0].days.length).toEqual(0);
        expect(result[1].days.length).toEqual(0);
    });


    test('GET the routine logs', async () => {

        // Arrange
        // @ts-ignore
        axios.get.mockImplementation(() => Promise.resolve({ data: responseRoutineLogs }));
        // @ts-ignore
        getRepUnits.mockImplementation(() => Promise.resolve([testRepUnit1, testRepUnit2]));
        // @ts-ignore
        getWeightUnits.mockImplementation(() => Promise.resolve([testWeightUnit1, testWeightUnit2]));

        // Act
        const result = await getRoutineLogs(1);

        // Assert
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(result).toStrictEqual([
            new WorkoutLog(
                2,
                new Date("2023-05-10"),
                1,
                100,
                2,
                1,
                12,
                10.00,
                1,
                "",
                testRepUnit1,
                testWeightUnit1
            ),

            new WorkoutLog(
                1,
                new Date("2023-05-13"),
                1,
                100,
                2,
                1,
                10,
                20,
                1,
                "",
                testRepUnit1,
                testWeightUnit1
            ),
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
            new Day(
                100,
                101,
                'Push day',
                '',
                false,
                false,
                false
            )
        );
        expect(result[0].slots[0].comment).toEqual('Push set 1');
        expect(result[0].slots[0].isSuperset).toEqual(true);
        expect(result[0].slots[0].exerciseIds).toEqual([9, 12]);
        expect(result[0].slots[0].setConfigs[0]).toEqual(
            new SetConfigData(
                9,
                1000,
                "dropset",
                5,
                100,
                120,
                1,
                1.25,
                10,
                null,
                1,
                1,
                2.00,
                8.00,
                120,
                180,
                "5 Sets, 10 × 100-120 kg @ 2 RiR",
                "foo"
            )
        );
        expect(result[0].slots[0].setConfigs[1]).toEqual(
            new SetConfigData(
                12,
                1001,
                "normal",
                3,
                90,
                null,
                1,
                1.25,
                12,
                null,
                1,
                1,
                2.00,
                8.00,
                120,
                null,
                "3 Sets, 12 × 90 kg @ 2 RiR",
                "bar"
            )
        );

    });

});
