import axios from "axios";
import { WorkoutLog } from "components/WorkoutRoutines/models/WorkoutLog";
import { getExercise } from "services";
import { getRoutineLogs } from "services/workoutLogs";
import { getRepUnits, getWeightUnits } from "services/workoutUnits";
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
jest.mock("services/workoutUnits");
jest.mock("services/exercise");


describe("workout logs service tests", () => {

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


    test('GET the routine logs and the exercise bases', async () => {

        // Arrange
        // @ts-ignore
        axios.get.mockImplementation(() => Promise.resolve({ data: responseRoutineLogs }));
        // @ts-ignore
        getRepUnits.mockImplementation(() => Promise.resolve([testRepUnit1, testRepUnit2]));
        // @ts-ignore
        getWeightUnits.mockImplementation(() => Promise.resolve([testWeightUnit1, testWeightUnit2]));
// @ts-ignore
        getExercise.mockImplementation(() => Promise.resolve(testExerciseSquats));

        // Act
        const result = await getRoutineLogs(1, true);

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
                testWeightUnit1,
                testExerciseSquats
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
                testWeightUnit1,
                testExerciseSquats
            ),
        ]);
    });
});
