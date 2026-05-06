import axios from "axios";
import { NutritionalPlan } from "@/components/Nutrition/models/nutritionalPlan";
import {
    addNutritionalPlan,
    deleteNutritionalPlan,
    editNutritionalPlan,
    getLastNutritionalPlan,
    getNutritionalPlanFull,
    getNutritionalPlansSparse,
} from "@/services/nutritionalPlan";
import { getNutritionalDiaryEntries } from "@/services";
import { getMealsForPlan } from "@/services/meal";
import {
    responseEmptyPlanList,
    responseNutritionalPlanDetail,
    responseSinglePlanList,
} from "@/tests/nutritionTestdata";
import type { Mock } from 'vitest';

vi.mock("axios");
vi.mock("@/services/meal");
vi.mock("@/services", async () => {
    const actual = await vi.importActual<typeof import("@/services")>("@/services");
    return {
        ...actual,
        getNutritionalDiaryEntries: vi.fn(),
    };
});

describe("Nutritional plan service tests", () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('GET plans - sparse', async () => {

        const planResponse = {
            count: 2,
            next: null,
            previous: null,
            results: [
                {
                    "id": 72559,
                    "creation_date": "2023-05-26",
                    "start": "2023-06-01",
                    "end": "2023-06-30",
                    "description": "first plan",
                    "only_logging": true,
                },
                {
                    "id": 60131,
                    "creation_date": "2022-06-01",
                    "start": "2022-06-01",
                    "end": null,
                    "description": "",
                    "only_logging": false,
                },
                {
                    "id": 24752,
                    "creation_date": "2023-08-01",
                    "start": "2023-08-01",
                    "end": "2023-08-31",
                    "description": "",
                    "only_logging": false,
                },
            ]
        };

        (axios.get as Mock).mockImplementation(() => Promise.resolve({ data: planResponse }));

        const result = await getNutritionalPlansSparse();
        expect(axios.get).toHaveBeenCalledTimes(1);

        expect(result).toStrictEqual([
            new NutritionalPlan({
                id: 72559,
                creationDate: new Date('2023-05-26'),
                start: new Date('2023-06-01'),
                end: new Date('2023-06-30'),
                description: 'first plan',
                onlyLogging: true
            }),
            new NutritionalPlan({
                id: 60131,
                creationDate: new Date('2022-06-01'),
                description: '',
                onlyLogging: false
            }),
            new NutritionalPlan({
                id: 24752,
                creationDate: new Date('2023-08-01'),
                start: new Date('2023-08-01'),
                end: new Date('2023-08-31'),
                description: '',
                onlyLogging: false
            }),
        ]);
    });

    test('getLastNutritionalPlan returns null when no plans exist', async () => {
        (axios.get as Mock).mockResolvedValue({ data: responseEmptyPlanList });

        const result = await getLastNutritionalPlan();

        expect(result).toBeNull();
        // Only the list call - the full-plan loader is not triggered
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining("limit=1"),
            expect.anything()
        );
    });

    test('getLastNutritionalPlan loads the full plan when one exists', async () => {
        // First call: list (count=1); second call: detail
        (axios.get as Mock)
            .mockResolvedValueOnce({ data: responseSinglePlanList })
            .mockResolvedValueOnce({ data: responseNutritionalPlanDetail });
        (getMealsForPlan as Mock).mockResolvedValue([]);
        (getNutritionalDiaryEntries as Mock).mockResolvedValue([]);

        const result = await getLastNutritionalPlan();

        expect(result).toBeInstanceOf(NutritionalPlan);
        expect(result!.id).toBe(101);
        expect(getMealsForPlan).toHaveBeenCalledWith(101);
        // Diary entries are filtered by plan id
        expect(getNutritionalDiaryEntries).toHaveBeenCalledWith({
            filtersetQuery: { plan: 101 },
        });
    });

    test('getNutritionalPlanFull returns null for null id without making any request', async () => {
        const result = await getNutritionalPlanFull(null);

        expect(result).toBeNull();
        expect(axios.get).not.toHaveBeenCalled();
        expect(getMealsForPlan).not.toHaveBeenCalled();
    });

    test('getNutritionalPlanFull wires meals back to their diary entries by mealId', async () => {
        // Two diary entries, one for meal 78 and one for an unrelated meal
        const diaryEntries = [
            { mealId: 78 },
            { mealId: 99 },
            { mealId: 78 },
        ];
        const meals = [{ id: 78, diaryEntries: [] as { mealId: number }[] }];

        (axios.get as Mock).mockResolvedValue({ data: responseNutritionalPlanDetail });
        (getMealsForPlan as Mock).mockResolvedValue(meals);
        (getNutritionalDiaryEntries as Mock).mockResolvedValue(diaryEntries);

        const result = await getNutritionalPlanFull(101);

        expect(result).not.toBeNull();
        // The meal collected only the entries that match its id
        expect(meals[0].diaryEntries).toHaveLength(2);
        expect(meals[0].diaryEntries.every(e => e.mealId === 78)).toBe(true);
        // Both data sources are wired into the plan
        expect(result!.diaryEntries).toBe(diaryEntries);
        expect(result!.meals).toBe(meals);
    });

    test('getNutritionalPlanFull forwards filtersetQueryLogs to the diary loader', async () => {
        (axios.get as Mock).mockResolvedValue({ data: responseNutritionalPlanDetail });
        (getMealsForPlan as Mock).mockResolvedValue([]);
        (getNutritionalDiaryEntries as Mock).mockResolvedValue([]);

        await getNutritionalPlanFull(101, { filtersetQueryLogs: { datetime__date: "2024-08-01" } });

        expect(getNutritionalDiaryEntries).toHaveBeenCalledWith({
            filtersetQuery: { plan: 101, datetime__date: "2024-08-01" },
        });
    });

    test('addNutritionalPlan POSTs the serialized plan and returns the parsed plan', async () => {
        const plan = new NutritionalPlan({
            description: "summer body",
            start: new Date("2024-06-01"),
            end: new Date("2024-08-31"),
            onlyLogging: false,
            goalEnergy: 2200,
        });
        (axios.post as Mock).mockResolvedValue({ data: responseNutritionalPlanDetail });

        const result = await addNutritionalPlan(plan);

        expect(axios.post).toHaveBeenCalledTimes(1);
        const [url, body] = (axios.post as Mock).mock.calls[0];
        expect(url).toMatch(/\/api\/v2\/nutritionplan\/$/);
        expect(body).toMatchObject({
            description: "summer body",
            start: "2024-06-01",
            end: "2024-08-31",
            // eslint-disable-next-line camelcase
            only_logging: false,
            // eslint-disable-next-line camelcase
            goal_energy: 2200,
        });
        expect(body).not.toHaveProperty("id");
        expect(result).toBeInstanceOf(NutritionalPlan);
        expect(result.id).toBe(101);
    });

    test('editNutritionalPlan PATCHes /nutritionplan/<id>/', async () => {
        const plan = new NutritionalPlan({
            id: 101,
            description: "edited",
            start: new Date("2024-06-01"),
            end: new Date("2024-08-31"),
        });
        (axios.patch as Mock).mockResolvedValue({
            data: { ...responseNutritionalPlanDetail, description: "edited" },
        });

        const result = await editNutritionalPlan(plan);

        expect(axios.patch).toHaveBeenCalledTimes(1);
        const [url, body] = (axios.patch as Mock).mock.calls[0];
        expect(url).toMatch(/\/api\/v2\/nutritionplan\/101\/$/);
        expect(body).toMatchObject({ id: 101, description: "edited" });
        expect(result.description).toBe("edited");
    });

    test('deleteNutritionalPlan DELETEs /nutritionplan/<id>/', async () => {
        (axios.delete as Mock).mockResolvedValue({ status: 204 });

        await deleteNutritionalPlan(101);

        expect(axios.delete).toHaveBeenCalledWith(
            expect.stringMatching(/\/api\/v2\/nutritionplan\/101\/$/),
            expect.anything()
        );
    });
});
