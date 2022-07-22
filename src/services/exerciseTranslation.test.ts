import axios from "axios";
import { addExerciseTranslation } from "services";

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
        );

        // Assert
        expect(axios.post).toHaveBeenCalledTimes(1);
        expect(result).toEqual(886);
    });
});
