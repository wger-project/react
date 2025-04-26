import axios from "axios";
import { addTranslation, deleteExerciseTranslation, editTranslation } from "services";

jest.mock("axios");


describe("Exercise translation service API tests", () => {


    test('POST a new exercise translation', async () => {

        // Arrange
        const response = {
            "id": 886,
            "uuid": "c788d643-150a-4ac7-97ef-84643c6419bf",
            "exercise": 100,
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
        (axios.post as jest.Mock).mockImplementation(() => Promise.resolve({ data: response }));

        // Act
        const result = await addTranslation({
            exerciseId: 100,
            languageId: 2,
            name: "Test exercise",
            description: "Test description",
            author: "Asimov"
        });

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
            "exercise": 100,
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
        (axios.patch as jest.Mock).mockImplementation(() => Promise.resolve({ status: 200, data: response }));

        // Act
        const result = await editTranslation({
            id: 886,
            exerciseId: 100,
            languageId: 2,
            name: "A new, cooler name!!!",
            description: "A new, cooler description!!!",
            author: "Asimov"
        });

        // Assert
        expect(axios.patch).toHaveBeenCalledTimes(1);
        expect(result.name).toEqual("A new, cooler name!!!");
    });

    test('DELETE an exercise translation', async () => {

        // Arrange
        (axios.delete as jest.Mock).mockImplementation(() => Promise.resolve({ status: 204 }));

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
