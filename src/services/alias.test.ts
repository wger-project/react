import axios from "axios";
import { postAlias } from "services/alias";
import { Alias } from "components/Exercises/models/alias";

jest.mock("axios");


describe("Exercise translation service API tests", () => {


    test('POST a new exercise translation', async () => {

        // Arrange
        const response = {
            "id": 200,
            "exercise": 100,
            "alias": "Elbow dislocator",

        };
        // @ts-ignore
        axios.post.mockImplementation(() => Promise.resolve({ data: response }));

        // Act
        const result = await postAlias(
            100,
            "Elbow dislocator",
        );

        // Assert
        expect(axios.post).toHaveBeenCalledTimes(1);
        expect(result).toEqual(new Alias(200, "Elbow dislocator"));
    });
});
