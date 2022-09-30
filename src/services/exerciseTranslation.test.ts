import axios from "axios";
import { addExerciseTranslation, deleteExerciseTranslation } from "services";
import { editExerciseTranslation } from "services/exerciseTranslation";

jest.mock("axios");


describe("Exercise translation service API tests", () => {


    test('POST a new exercise translation', async () => {

        // Arrange
        const response = {
            "id": 886,
            "uuid": "c788d643-150a-4ac7-97ef-84643c6419bf",
            "exercise_base": 100,
            "aliases": [],
            "name": "Test exercise",
            "description": "Test description",
            "notes": [],
            "creation_date": "2022-06-23",
            "language": 2,
            "license": 2,
            "author_history": [
                "tester"
            ]
        };
        // @ts-ignore
        axios.post.mockImplementation(() => Promise.resolve({ data: response }));

        // Act
        const result = await addExerciseTranslation(
            100,
            2,
            "Test exercise",
            "Test description",
            "Asimov"
        );

        // Assert
        expect(axios.post).toHaveBeenCalledTimes(1);
        expect(result.id).toEqual(886);
        expect(result.name).toEqual("Test exercise");
        expect(result.description).toEqual("Test description");
    });


    test('EDIT a new exercise translation', async () => {

        // Arrange
        const response = {
            "id": 886,
            "uuid": "c788d643-150a-4ac7-97ef-84643c6419bf",
            "exercise_base": 100,
            "aliases": [],
            "name": "A new, cooler name!!!",
            "description": "A new, cooler description!!!",
            "notes": [],
            "creation_date": "2022-06-23",
            "language": 2,
            "license": 2,
            "author_history": [
                "tester"
            ]
        };
        // @ts-ignore
        axios.patch.mockImplementation(() => Promise.resolve({ status: 200, data: response }));

        // Act
        const result = await editExerciseTranslation(
            886,
            100,
            2,
            "A new, cooler name!!!",
            "A new, cooler description!!!",
        );

        // Assert
        expect(axios.patch).toHaveBeenCalledTimes(1);
        expect(result.name).toEqual("A new, cooler name!!!");
    });

    test('DELETE an exercise translation', async () => {

        // Arrange
        // @ts-ignore
        axios.delete.mockImplementation(() => Promise.resolve({ status: 204 }));

        // Act
        const result = await deleteExerciseTranslation(1234);

        // Assert
        expect(axios.delete).toHaveBeenCalled();
        expect(axios.delete).toHaveBeenCalledWith(
            'https://example.com/api/v2/exercise-translation/1234/',
            expect.anything()
        );
        expect(result).toEqual(204);
    });
});
