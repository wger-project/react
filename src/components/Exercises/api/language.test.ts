import axios from "axios";
import { Language } from "@/components/Exercises/models/language";
import { getLanguages } from "@/components/Exercises/api/language";
import type { Mock } from 'vitest';

vi.mock("axios");

describe("Language service tests", () => {

    test('GET language entries', async () => {

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
        (axios.get as Mock).mockImplementation(() => Promise.resolve({ data: muscleResponse }));
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
