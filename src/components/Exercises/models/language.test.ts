import { getLanguageByShortName, Language } from "@/components/Exercises/models/language";


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
