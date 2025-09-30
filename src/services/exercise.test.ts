import axios from "axios";
import { deleteExercise, editExercise, getExercise, getExercises, processExerciseApiData } from "services";
import { responseApiExerciseInfo, testApiExercise1 } from "tests/responseApi";

jest.mock("axios");

describe("Exercise service API tests", () => {

    beforeEach(() => {
        jest.resetAllMocks();
    });

    test('GET exercise data entries', async () => {

        // Arrange
        (axios.get as jest.Mock).mockImplementation(() => Promise.resolve({ data: responseApiExerciseInfo }));

        // Act
        const result = await getExercises();

        // Assert
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(result).toEqual([testApiExercise1]);
    });

    test('GET exercise data for single entry', async () => {

        // Arrange
        (axios.get as jest.Mock).mockImplementation(() => Promise.resolve({ data: responseApiExerciseInfo.results[0] }));

        // Act
        const result = await getExercise(345);

        // Assert
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(result).toEqual(testApiExercise1);
    });

    test('EDIT an existing exercise', async () => {

        // Arrange
        const response = {
            "id": 749,
            "uuid": "1b020b3a-3732-4c7e-92fd-a0cec90ed69b",
            "creation_date": "2022-06-23",
            "update_date": "2022-06-23T18:22:54.909478+02:00",
            "category": 3,
            "muscles": [3, 4],
            "muscles_secondary": [9],
            "equipment": [1, 2],
            "variations": null
        };
        (axios.patch as jest.Mock).mockImplementation(() => Promise.resolve({ data: response, status: 200 }));

        // Act
        const result = await editExercise(
            749,
            {
                category: 3,
                equipment: [1, 2],
                muscles: [3, 4],
                // eslint-disable-next-line camelcase
                muscles_secondary: [9]
            }
        );

        // Assert
        expect(axios.patch).toHaveBeenCalled();
        expect(result).toEqual(200);
    });

    test('DELETE exercise', async () => {

        // Arrange
        (axios.delete as jest.Mock).mockImplementation(() => Promise.resolve({ status: 204 }));

        // Act
        const result = await deleteExercise(1);

        // Assert
        expect(axios.delete).toHaveBeenCalled();
        expect(result).toEqual(204);
    });

});


describe("Exercise service parser tests", () => {

    test('process api data', () => {

        // Act
        const result = processExerciseApiData(responseApiExerciseInfo);

        // Assert
        expect(result).toEqual([testApiExercise1]);
    });
});
