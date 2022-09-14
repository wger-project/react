import axios from "axios";
import {
    addExerciseBase,
    deleteExerciseBase,
    editExerciseBase,
    getExerciseBase,
    getExerciseBases,
    processBaseData
} from "services/exerciseBase";
import { responseApiExerciseBaseInfo, testApiExerciseBase1 } from "tests/responseApi";

jest.mock("axios");

describe("Exercise service API tests", () => {

    test('GET exercise base data entries', async () => {

        // Arrange
        // @ts-ignore
        axios.get.mockImplementation(() => Promise.resolve({ data: responseApiExerciseBaseInfo }));

        // Act
        const result = await getExerciseBases();

        // Assert
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(result).toEqual([testApiExerciseBase1]);
    });

    test('GET exercise base data for single entry', async () => {

        // Arrange
        // @ts-ignore
        axios.get.mockImplementation(() => Promise.resolve({ data: responseApiExerciseBaseInfo.results[0] }));

        // Act
        const result = await getExerciseBase(345);

        // Assert
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(result).toEqual(testApiExerciseBase1);
    });

    test('POST a new exercise base', async () => {

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
        // @ts-ignore
        axios.post.mockImplementation(() => Promise.resolve({ data: response }));

        // Act
        const result = await addExerciseBase(3, [1, 2], [3, 4], [9], null);

        // Assert
        expect(axios.post).toHaveBeenCalledTimes(1);
        expect(result).toEqual(749);
    });

    test('EDIT an existing exercise base', async () => {

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
        // @ts-ignore
        axios.patch.mockImplementation(() => Promise.resolve({ data: response, status: 200 }));

        // Act
        const result = await editExerciseBase(
            749,
            {
                category: 3,
                equipment: [1, 2],
                muscles: [3, 4],
                muscles_secondary: [9]
            }
        );

        // Assert
        expect(axios.patch).toHaveBeenCalled();
        expect(result).toEqual(200);
    });

    test('DELETE exercise base', async () => {

        // Arrange
        // @ts-ignore
        axios.delete.mockImplementation(() => Promise.resolve({ status: 204 }));

        // Act
        const result = await deleteExerciseBase(1);

        // Assert
        expect(axios.delete).toHaveBeenCalled();
        expect(result).toEqual(204);
    });

});


describe("Exercise base service parser tests", () => {

    test('processBaseData', () => {

        // Act
        const result = processBaseData(responseApiExerciseBaseInfo);

        // Assert
        expect(result).toEqual([testApiExerciseBase1]);
    });
});
