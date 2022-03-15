import axios from "axios";
import { getLanguageByShortName, getLanguages } from "services/language";
import { Language } from "components/Exercises/models/language";

jest.mock("axios");

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

describe("Test the getLanguageByShortName helper", () => {

    // Arrange
    const language = new Language(1, "de", "Deutsch");
    const language2 = new Language(2, "en", "English");
    const language3 = new Language(4, "es", "Español");
    const availableLanguages = [language, language2, language3];


    test('Short code could be found', () => {

        // Act
        const foundLanguage = getLanguageByShortName("de", availableLanguages);

        // Assert
        expect(foundLanguage).toStrictEqual(new Language(1, "de", "Deutsch"));
    });

    test('Short code has language code - can be found', () => {

        // Act
        const foundLanguage = getLanguageByShortName("de-AT", availableLanguages);

        // Assert
        expect(foundLanguage).toStrictEqual(new Language(1, "de", "Deutsch"));
    });

    test('Short code could not be found -> undefined', () => {

        // Act
        const foundLanguage = getLanguageByShortName("ab-CD", availableLanguages);

        // Assert
        expect(foundLanguage).toStrictEqual(undefined);
    });
});

