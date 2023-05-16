import axios from "axios";
import { WorkoutRoutine } from "components/WorkoutRoutines/models/WorkoutRoutine";
import { getWorkoutRoutinesShallow } from "services";
import { getRepUnits, getWeightUnits } from "services/workoutUnits";
import {
    responseApiWorkoutRoutine,
    responseRoutineLogs,
    testRepUnit1,
    testRepUnit2,
    testWeightUnit1,
    testWeightUnit2
} from "tests/workoutRoutinesTestData";
import { getRoutineLogs } from "services/workoutRoutine";
import { WorkoutLog } from "components/WorkoutRoutines/models/WorkoutLog";

jest.mock("axios");
jest.mock("services/workoutUnits");
jest.mock("services/workoutUnits");

describe("workout routine service tests", () => {

    test('GET the routine data - shallow', async () => {

        // Arrange
        // @ts-ignore
        axios.get.mockImplementation(() => Promise.resolve({ data: responseApiWorkoutRoutine }));

        // Act
        const result = await getWorkoutRoutinesShallow();

        // Assert
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(result).toStrictEqual([
            new WorkoutRoutine(1,
                'My first routine!',
                'Well rounded full body routine',
                new Date("2022-01-01T00:00:00.000Z"),
            ),
            new WorkoutRoutine(2,
                'Beach body',
                'Train only arms and chest, no legs!!!',
                new Date("2023-01-01T00:00:00.000Z"),
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
                1,
                new Date("2023-05-10"),
                100,
                1,
                12,
                10.00,
                1,
                "",
                "",
            ),

            new WorkoutLog(
                1,
                new Date("2023-05-10"),
                100,
                1,
                10,
                10.00,
                1,
                "",
                "",
            ),
        ]);
    });
});
