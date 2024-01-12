import axios from "axios";
import { Alias } from "components/Exercises/models/alias";
import { postAlias } from "services";
import { deleteAlias } from "services/alias";

jest.mock("axios");


describe("Exercise translation service API tests", () => {


    test('POST a new alias', async () => {

        // Arrange
        const response = {
            "id": 200,
            "uuid": "eb18288d-4ca3-4c54-8279-343b110d86e0",
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
        expect(result).toEqual(new Alias(200, "eb18288d-4ca3-4c54-8279-343b110d86e0", "Elbow dislocator"));
    });

    test('DELETE an existing alias', async () => {

        // Arrange
        // @ts-ignore
        axios.delete.mockImplementation(() => Promise.resolve({ status: 204 }));

        // Act
        const result = await deleteAlias(100);

        // Assert
        expect(axios.delete).toHaveBeenCalledTimes(1);
        expect(result).toEqual(204);
    });
});
