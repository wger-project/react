import axios from "axios";
import { Routine } from "components/WorkoutRoutines/models/Routine";
import { WorkoutLog } from "components/WorkoutRoutines/models/WorkoutLog";
import { getRoutinesShallow } from "services";
import { getRoutineLogs } from "services/workoutLogs";
import { getRepUnits, getWeightUnits } from "services/workoutUnits";
import {
    responseApiWorkoutRoutine,
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

});
