import axios from "axios";
import { getLanguages } from "services/language";
import { Language } from "components/Exercises/models/language";

jest.mock("axios");

describe("muscle service tests", () => {

    test('GET muscle entries', async () => {

        // Arrange
        const muscleResponse = {
            count: 3,
            next: null,
            previous: null,
            results: [
                {
                    "id": 1,
                    "short_name": "de",
                    "full_name": "Deutsch"
                },
                {
                    "id": 2,
                    "short_name": "en",
                    "full_name": "English"
                },
                {
                    "id": 4,
                    "short_name": "es",
                    "full_name": "Español"
                },
            ]
        };

        // Act
        // @ts-ignore
        axios.get.mockImplementation(() => Promise.resolve({ data: muscleResponse }));
        const result = await getLanguages();
        
        // Assert
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(result).toStrictEqual([
            new Language(1, "de", "Deutsch"),
            new Language(2, "en", "English"),
            new Language(4, "es", "Español"),
        ]);
    });
});

