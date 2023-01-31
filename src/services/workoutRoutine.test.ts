import axios from "axios";
import { WorkoutRoutine } from "components/WorkoutRoutines/models/WorkoutRoutine";
import { getWorkoutRoutinesShallow } from "services";
import { responseApiWorkoutRoutine } from "tests/workoutRoutinesTestData";

jest.mock("axios");

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
});
