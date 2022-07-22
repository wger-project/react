import { ExerciseTranslation, ExerciseTranslationAdapter } from "components/Exercises/models/exerciseTranslation";


describe("Exercise translation model tests", () => {

    // Arrange
    const e1 = new ExerciseTranslation(
        2,
        "uuid",
        "a very long name that should be truncated",
        "description",
        1
    );

    test('name helper', () => {

        // Assert
        expect(e1.nameLong).toBe("a very long name that …");
    });

    test('adapter - from json', () => {

        // Assert
        const adapter = new ExerciseTranslationAdapter();
        expect(adapter.fromJson({
            id: 2,
            uuid: "uuid",
            name: "a very long name that should be truncated",
            description: "description",
            language: 1,
            notes: [],
            aliases: [],
        })).toStrictEqual(e1);
    });

    test('adapter - to json', () => {

        // Assert
        const adapter = new ExerciseTranslationAdapter();
        expect(adapter.toJson(e1)).toStrictEqual({
            id: 2,
            uuid: "uuid",
            name: "a very long name that should be truncated",
            description: "description",
            language: 1,
        });
    });
});

