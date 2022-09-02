import {
    testExerciseBenchPress,
    testExerciseSquats,
    testLanguageEnglish,
    testLanguageGerman
} from "tests/exerciseTestdata";
import { Language } from "components/Exercises/models/language";
import { ExerciseBaseAdapter } from "components/Exercises/models/exerciseBase";
import { responseApiExerciseBaseInfo, testApiExerciseBase1 } from "tests/responseApi";


describe("Exercise base model tests", () => {

    test('translation helper - default language', () => {

        // Assert
        expect(testExerciseSquats.getTranslation().name).toBe("Squats");
    });

    test('translation helper - explicit language - English', () => {

        // Assert
        expect(testExerciseSquats.getTranslation(testLanguageEnglish).name).toBe("Squats");
    });

    test('translation helper - explicit language - German', () => {

        // Assert
        expect(testExerciseSquats.getTranslation(testLanguageGerman).name).toBe("Kniebeuge");
    });

    test('translation helper - unknown language', () => {

        // Arrange
        const unknownLanguage = new Language(4, "kg", "Klingon");

        // Assert
        expect(testExerciseSquats.getTranslation(unknownLanguage).name).toBe("Squats");
    });

    test('adapter - from json', () => {

        // Act
        const adapter = new ExerciseBaseAdapter();
        const result = adapter.fromJson(responseApiExerciseBaseInfo.results[0]);

        // Assert
        expect(result).toEqual(testApiExerciseBase1);
    });


    test('adapter - to json', () => {

        // Assert
        const adapter = new ExerciseBaseAdapter();
        expect(adapter.toJson(testExerciseSquats)).toStrictEqual({
            id: 345,
            uuid: "c788d643-150a-4ac7-97ef-84643c6419bf",
            category: 2,
            equipment: [1, 42],
            muscles: [1, 4],
            // eslint-disable-next-line camelcase
            muscles_secondary: [],
            images: [],
        });
    });


    test('availableLanguages', () => {

        // Assert
        expect(testExerciseSquats.availableLanguages).toEqual([2, 1]);
        expect(testExerciseBenchPress.availableLanguages).toEqual([2]);
    });
});

