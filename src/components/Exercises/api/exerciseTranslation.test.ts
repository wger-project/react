import {
    addTranslation,
    deleteExerciseTranslation,
    editTranslation,
    getExerciseTranslations,
    searchExerciseTranslations,
} from "@/components/Exercises/api/exerciseTranslation";
import axios from "axios";
import type { Mock } from 'vitest';

vi.mock("axios");


describe("Exercise translation service API tests", () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });



    test('POST a new exercise translation', async () => {

        // Arrange
        const response = {
            "id": 886,
            "uuid": "c788d643-150a-4ac7-97ef-84643c6419bf",
            "exercise": 100,
            "aliases": [],
            "name": "Test exercise",
            "description": "Test description",
            "notes": [],
            "creation_date": "2022-06-23",
            "language": 2,
            "license": 2,
            "author_history": [
                "tester"
            ]
        };
        (axios.post as Mock).mockImplementation(() => Promise.resolve({ data: response }));

        // Act
        const result = await addTranslation({
            exerciseId: 100,
            languageId: 2,
            name: "Test exercise",
            descriptionSource: "Test description",
            author: "Asimov"
        });

        // Assert
        expect(axios.post).toHaveBeenCalledTimes(1);
        expect(result.id).toEqual(886);
        expect(result.name).toEqual("Test exercise");
        expect(result.description).toEqual("Test description");
    });


    test('EDIT a new exercise translation', async () => {

        // Arrange
        const response = {
            "id": 886,
            "uuid": "c788d643-150a-4ac7-97ef-84643c6419bf",
            "exercise": 100,
            "aliases": [],
            "name": "A new, cooler name!!!",
            "description": "A new, cooler description!!!",
            "notes": [],
            "creation_date": "2022-06-23",
            "language": 2,
            "license": 2,
            "author_history": [
                "tester"
            ]
        };
        (axios.patch as Mock).mockImplementation(() => Promise.resolve({ status: 200, data: response }));

        // Act
        const result = await editTranslation({
            id: 886,
            exerciseId: 100,
            languageId: 2,
            name: "A new, cooler name!!!",
            descriptionSource: "A new, cooler description!!!",
            author: "Asimov"
        });

        // Assert
        expect(axios.patch).toHaveBeenCalledTimes(1);
        expect(result.name).toEqual("A new, cooler name!!!");
    });

    test('DELETE an exercise translation', async () => {

        // Arrange
        (axios.delete as Mock).mockImplementation(() => Promise.resolve({ status: 204 }));

        // Act
        const result = await deleteExerciseTranslation(1234);

        // Assert
        expect(axios.delete).toHaveBeenCalled();
        expect(axios.delete).toHaveBeenCalledWith(
            'https://example.com/api/v2/exercise-translation/1234/',
            expect.anything()
        );
        expect(result).toEqual(204);
    });

    test('getExerciseTranslations queries the exercise endpoint with the given exercise id', async () => {
        const apiResponse = {
            count: 1,
            next: null,
            previous: null,
            results: [
                {
                    id: 1,
                    uuid: "u1",
                    exercise: 100,
                    aliases: [],
                    name: "Squats",
                    description: "Do a squat",
                    notes: [],
                    creation_date: "2022-06-23", // eslint-disable-line camelcase
                    language: 2,
                    license: 2,
                    author_history: ["tester"], // eslint-disable-line camelcase
                },
            ],
        };
        (axios.get as Mock).mockResolvedValue({ data: apiResponse });

        const result = await getExerciseTranslations(100);

        const [url] = (axios.get as Mock).mock.calls[0];
        expect(url).toContain("/api/v2/exercise/");
        expect(url).toContain("exercise=100");
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(1);
        expect(result[0].name).toBe("Squats");
    });

    test('searchExerciseTranslations builds the URL with name__search and language__code', async () => {
        (axios.get as Mock).mockResolvedValue({
            data: { count: 0, next: null, previous: null, results: [] },
        });

        await searchExerciseTranslations("squat", "de");

        const url = (axios.get as Mock).mock.calls[0][0] as string;
        expect(url).toContain("/api/v2/exerciseinfo/");
        expect(url).toContain("name__search=squat");
        expect(url).toMatch(/language__code=de(%2C|,)en/);
        expect(url).toContain("limit=50");
    });

    test('searchExerciseTranslations with exactMatch uses name__exact', async () => {
        (axios.get as Mock).mockResolvedValue({
            data: { count: 0, next: null, previous: null, results: [] },
        });

        await searchExerciseTranslations("squat", "en", "current_english", true);

        const url = (axios.get as Mock).mock.calls[0][0] as string;
        expect(url).toContain("name__exact=squat");
        expect(url).not.toContain("name__search");
    });

    test('searchExerciseTranslations with languageFilter "all" omits the language filter', async () => {
        (axios.get as Mock).mockResolvedValue({
            data: { count: 0, next: null, previous: null, results: [] },
        });

        await searchExerciseTranslations("squat", "de", "all");

        const url = (axios.get as Mock).mock.calls[0][0] as string;
        expect(url).not.toContain("language__code");
    });

    test('searchExerciseTranslations returns [] on network/parse errors', async () => {
        (axios.get as Mock).mockRejectedValue(new Error("network"));

        const result = await searchExerciseTranslations("squat");

        expect(result).toEqual([]);
    });

    test('searchExerciseTranslations returns [] when results are missing or malformed', async () => {
        (axios.get as Mock).mockResolvedValue({ data: { results: null } });

        const result = await searchExerciseTranslations("squat");

        expect(result).toEqual([]);
    });
});
