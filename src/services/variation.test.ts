import axios from "axios";
import { addVariation } from "services/variation";

jest.mock("axios");


describe("Variation service API tests", () => {

    test('POST a new variation', async () => {

        // Arrange
        const response = {
            "id": 123
        };
        // @ts-ignore
        axios.post.mockImplementation(() => Promise.resolve({ data: response }));

        // Act
        const result = await addVariation();

        // Assert
        expect(axios.post).toHaveBeenCalledTimes(1);
        expect(result).toEqual(123);
    });
});
