import { ExerciseImage, ExerciseImageAdapter, ImageStyle } from "@/components/Exercises/models/image";

describe("Exercise image adapter", () => {

    const apiResponse = {
        id: 77,
        uuid: "004bb79f-36bf-4c48-8c00-d863d724717c",
        exercise: 101,
        image: "https://wger.de/media/img.jpg",
        is_main: true,
        style: ImageStyle.PHOTO,
        license_title: "a title",
        license_author: "an author",
        license_author_url: "https://author.example",
        license_object_url: "https://object.example",
        license_derivative_source_url: "https://derivative.example",
        is_ai_generated: true,
    };

    test('parses the response of the API', () => {

        // Act
        const result = new ExerciseImageAdapter().fromJson(apiResponse);

        // Assert
        // The positional constructor makes a wrong order easy to miss
        expect(result).toEqual(new ExerciseImage(
            77,
            "004bb79f-36bf-4c48-8c00-d863d724717c",
            "https://wger.de/media/img.jpg",
            true,
            "a title",
            "an author",
            "https://author.example",
            "https://object.example",
            "https://derivative.example",
            ImageStyle.PHOTO,
            true,
        ));
    });

    test('defaults is_ai_generated to false when the server omits it', () => {

        // Act
        const { is_ai_generated, ...withoutFlag } = apiResponse;
        const result = new ExerciseImageAdapter().fromJson(withoutFlag);

        // Assert
        expect(is_ai_generated).toBe(true);
        expect(result.isAi).toBe(false);
    });

    test('serializes the keys the API expects', () => {

        // Act
        const adapter = new ExerciseImageAdapter();
        const json = adapter.toJson(adapter.fromJson(apiResponse));

        // Assert
        // The main flag is 'is_main', 'is_front' belongs to the muscles
        expect(json).toEqual({
            id: 77,
            image: "https://wger.de/media/img.jpg",
            is_main: true,
        });
        expect(json).not.toHaveProperty('is_front');
    });
});
