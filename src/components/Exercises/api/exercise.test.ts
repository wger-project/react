import {
    addFullExercise,
    deleteExercise,
    editExercise,
    getExercise,
    getExercises,
    getExercisesByIds,
    getExercisesForVariation,
    processExerciseApiData
} from "@/components/Exercises/api/exercise";
import { responseApiExerciseInfo, testApiExercise1 } from "@/tests/responseApi";
import axios from "axios";
import type { Mock } from 'vitest';

vi.mock("axios");

describe("Exercise service API tests", () => {

    beforeEach(() => {
        vi.resetAllMocks();
    });

    test('GET exercise data entries', async () => {

        // Arrange (next: null so the paginated fetch stops after the first page)
        (axios.get as Mock).mockResolvedValue({ data: { ...responseApiExerciseInfo, next: null } });

        // Act
        const result = await getExercises();

        // Assert
        expect(axios.get).toHaveBeenCalledTimes(1);
        const url = (axios.get as Mock).mock.calls[0][0] as string;
        expect(url).toContain("limit=300");
        expect(result).toEqual([testApiExercise1]);
    });

    test('getExercises follows pagination and accumulates every page', async () => {

        // Arrange: a first page that points to a second, then a final page
        (axios.get as Mock)
            .mockResolvedValueOnce({
                data: {
                    ...responseApiExerciseInfo,
                    next: 'http://localhost:8000/api/v2/exerciseinfo/?limit=300&offset=300',
                },
            })
            .mockResolvedValueOnce({ data: { ...responseApiExerciseInfo, next: null } });

        // Act
        const result = await getExercises();

        // Assert: both pages were fetched and their results combined
        expect(axios.get).toHaveBeenCalledTimes(2);
        expect(result).toEqual([testApiExercise1, testApiExercise1]);
    });

    test('GET exercise data for single entry', async () => {

        // Arrange
        (axios.get as Mock).mockImplementation(() => Promise.resolve({ data: responseApiExerciseInfo.results[0] }));

        // Act
        const result = await getExercise(345);

        // Assert
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(result).toEqual(testApiExercise1);
    });

    test('getExercisesByIds returns [] for an empty id list without calling the API', async () => {
        const result = await getExercisesByIds([]);

        expect(result).toEqual([]);
        expect(axios.get).not.toHaveBeenCalled();
    });

    test('getExercisesByIds queries by id__in and parses the results', async () => {
        // next: null so the paginated fetch stops after the first page
        (axios.get as Mock).mockResolvedValue({ data: { ...responseApiExerciseInfo, next: null } });

        const result = await getExercisesByIds([345, 999]);

        const url = (axios.get as Mock).mock.calls[0][0] as string;
        expect(url).toContain("/api/v2/exerciseinfo/");
        expect(url).toContain("id__in=345");
        // A requested id that no longer exists is simply absent from the result
        expect(result).toEqual([testApiExercise1]);
    });

    test('EDIT an existing exercise', async () => {

        // Arrange
        const response = {
            "id": 749,
            "uuid": "1b020b3a-3732-4c7e-92fd-a0cec90ed69b",
            "creation_date": "2022-06-23",
            "update_date": "2022-06-23T18:22:54.909478+02:00",
            "category": 3,
            "muscles": [3, 4],
            "muscles_secondary": [9],
            "equipment": [1, 2],
            "variation_group": null
        };
        (axios.patch as Mock).mockImplementation(() => Promise.resolve({ data: response, status: 200 }));

        // Act
        const result = await editExercise(
            749,
            {
                category: 3,
                equipment: [1, 2],
                muscles: [3, 4],

                muscles_secondary: [9]
            }
        );

        // Assert
        expect(axios.patch).toHaveBeenCalled();
        expect(result).toEqual(200);
    });

    test('DELETE exercise', async () => {

        // Arrange
        (axios.delete as Mock).mockImplementation(() => Promise.resolve({ status: 204 }));

        // Act
        const result = await deleteExercise(1);

        // Assert
        expect(axios.delete).toHaveBeenCalled();
        expect(result).toEqual(204);
    });

    test('DELETE exercise with replacement UUID adds replaced_by query', async () => {
        (axios.delete as Mock).mockResolvedValue({ status: 204 });

        await deleteExercise(1, { replacementUUID: "abc-123" });

        const url = (axios.delete as Mock).mock.calls[0][0] as string;
        expect(url).toContain("replaced_by=abc-123");
        expect(url).not.toContain("transfer_media");
        expect(url).not.toContain("transfer_translations");
    });

    test('DELETE exercise with transferMedia and transferTranslations adds both flags', async () => {
        (axios.delete as Mock).mockResolvedValue({ status: 204 });

        await deleteExercise(1, {
            replacementUUID: "abc-123",
            transferMedia: true,
            transferTranslations: true,
        });

        const url = (axios.delete as Mock).mock.calls[0][0] as string;
        expect(url).toContain("replaced_by=abc-123");
        expect(url).toContain("transfer_media=1");
        expect(url).toContain("transfer_translations=1");
    });

    test('getExercisesForVariation returns [] when given a null id', async () => {
        const result = await getExercisesForVariation(null);

        expect(result).toEqual([]);
        expect(axios.get).not.toHaveBeenCalled();
    });

    test('getExercisesForVariation returns [] for an undefined id', async () => {
        const result = await getExercisesForVariation(undefined);

        expect(result).toEqual([]);
        expect(axios.get).not.toHaveBeenCalled();
    });

    test('getExercisesForVariation queries by variation_group and parses results', async () => {
        (axios.get as Mock).mockResolvedValue({ data: responseApiExerciseInfo });

        const result = await getExercisesForVariation("group-uuid");

        const url = (axios.get as Mock).mock.calls[0][0] as string;
        expect(url).toContain("/api/v2/exerciseinfo/");
        expect(url).toContain("variation_group=group-uuid");
        expect(result).toEqual([testApiExercise1]);
    });

    test('addFullExercise POSTs the full submission payload and returns the new id', async () => {
        (axios.post as Mock).mockResolvedValue({ data: { id: 999 } });

        const result = await addFullExercise({
            author: "alice",
            exercise: {
                categoryId: 3,
                equipmentIds: [1, 2],
                muscleIds: [3, 4],
                secondaryMuscleIds: [9],
            },
            variationGroup: "group-uuid",
            variationsConnectTo: 42,
            translations: [
                {
                    name: "Squats",
                    description: "Do a squat",
                    language: 2,
                    aliases: [{ alias: "Knee bender" }],
                    comments: [{ comment: "keep back straight" }],
                },
            ],
        });

        expect(result).toBe(999);
        expect(axios.post).toHaveBeenCalledTimes(1);
        const [url, payload] = (axios.post as Mock).mock.calls[0];
        expect(url).toMatch(/\/api\/v2\/exercise-submission\/$/);
        expect(payload).toMatchObject({
            category: 3,
            equipment: [1, 2],
            muscles: [3, 4],

            muscles_secondary: [9],

            license_author: "alice",

            variation_group: "group-uuid",

            variations_connect_to: 42,
        });
        expect(payload.translations).toHaveLength(1);
        expect(payload.translations[0]).toMatchObject({
            name: "Squats",

            description_source: "Do a squat",
            language: 2,

            license_author: "alice",
            aliases: [{ alias: "Knee bender" }],
            comments: [{ comment: "keep back straight" }],
        });
    });

    test('addFullExercise defaults the optional fields when omitted', async () => {
        (axios.post as Mock).mockResolvedValue({ data: { id: 1 } });

        await addFullExercise({
            exercise: {
                categoryId: 1,
                equipmentIds: [],
                muscleIds: [],
                secondaryMuscleIds: [],
            },
            translations: [
                { name: "n", description: "d", language: 2 },
            ],
        });

        const [, payload] = (axios.post as Mock).mock.calls[0];
        expect(payload).toMatchObject({

            license_author: "",

            variation_group: null,

            variations_connect_to: null,
        });
        // Aliases and comments default to empty arrays
        expect(payload.translations[0].aliases).toEqual([]);
        expect(payload.translations[0].comments).toEqual([]);
    });
});


describe("Exercise service parser tests", () => {

    test('process api data', () => {

        // Act
        const result = processExerciseApiData(responseApiExerciseInfo);

        // Assert
        expect(result).toEqual([testApiExercise1]);
    });

    test('processExerciseApiData skips entries that throw during parsing', () => {
        // Mute console.error for this test - the function logs the failure
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {
        });

        // First entry: valid; second entry: malformed (missing required fields the adapter
        // dereferences). The function must keep the good one and skip the bad one.
        const malformed = {
            results: [
                responseApiExerciseInfo.results[0],
                null, // adapter.fromJson(null) will throw on property access
            ],
        };

        const result = processExerciseApiData(malformed);

        expect(result).toEqual([testApiExercise1]);
        expect(consoleErrorSpy).toHaveBeenCalled();
        consoleErrorSpy.mockRestore();
    });
});
