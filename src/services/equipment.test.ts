import axios from "axios";
import { Equipment } from "components/Exercises/models/equipment";
import { getEquipment } from "services";

jest.mock("axios");


describe("equipment service tests", () => {

    test('GET equipment entries', async () => {

        // Arrange
        const response = {
            count: 3,
            next: null,
            previous: null,
            results: [
                {
                    "id": 1,
                    "name": "Barbell"
                },
                {
                    "id": 8,
                    "name": "Bench"
                },
                {
                    "id": 3,
                    "name": "Dumbbell"
                },
            ]
        };


        // Act
        (axios.get as jest.Mock).mockImplementation(() => Promise.resolve({ data: response }));
        const result = await getEquipment();

        // Assert
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(result).toStrictEqual([
            new Equipment(1, "Barbell"),
            new Equipment(8, "Bench"),
            new Equipment(3, "Dumbbell"),
        ]);
    });
});
