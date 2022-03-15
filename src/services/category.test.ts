import axios from "axios";
import { getCategories } from "services";
import { Category } from "components/Exercises/models/category";

jest.mock("axios");

describe("category service tests", () => {

    test('GET category entries', async () => {

        // Arrange
        const response = {
            count: 3,
            next: null,
            previous: null,
            results: [
                {
                    "id": 10,
                    "name": "Abs"
                },
                {
                    "id": 8,
                    "name": "Arms"
                },
                {
                    "id": 12,
                    "name": "Back"
                },
            ]
        };

        // Act
        // @ts-ignore
        axios.get.mockImplementation(() => Promise.resolve({ data: response }));
        const result = await getCategories();

        // Assert
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(result).toStrictEqual([
            new Category(10, "Abs"),
            new Category(8, "Arms"),
            new Category(12, "Back"),
        ]);
    });
});
