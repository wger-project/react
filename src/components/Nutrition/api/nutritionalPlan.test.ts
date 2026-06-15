import { getMealsForPlan } from "@/components/Nutrition/api/meal";
import { getNutritionalDiaryEntries } from "@/components/Nutrition/api/nutritionalDiary";
import {
    addNutritionalPlan,
    deleteNutritionalPlan,
    editNutritionalPlan,
    getLastNutritionalPlan,
    getNutritionalPlanFull,
    getNutritionalPlansSparse,
} from "@/components/Nutrition/api/nutritionalPlan";
import { NutritionalPlan } from "@/components/Nutrition/models/nutritionalPlan";
import {
    RESPONSE_MEAL_UUID,
    RESPONSE_PLAN_UUID,
    responseEmptyPlanList,
    responseNutritionalPlanDetail,
    responseSinglePlanList,
} from "@/tests/nutritionTestdata";
import axios from "axios";
import type { Mock } from 'vitest';

vi.mock("axios");
vi.mock("@/components/Nutrition/api/meal");
vi.mock("@/components/Nutrition/api/nutritionalDiary", async () => {
    const actual = await vi.importActual<typeof import("@/components/Nutrition/api/nutritionalDiary")>(
        "@/components/Nutrition/api/nutritionalDiary"
    );
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

        const PLAN_UUID_A = 'aaaaaaaa-0000-0000-0000-000000072559';
        const PLAN_UUID_B = 'aaaaaaaa-0000-0000-0000-000000060131';
        const PLAN_UUID_C = 'aaaaaaaa-0000-0000-0000-000000024752';

        const planResponse = {
            count: 2,
            next: null,
            previous: null,
            results: [
                {
                    "id": PLAN_UUID_A,
                    "creation_date": "2023-05-26",
                    "start": "2023-06-01",
                    "end": "2023-06-30",
                    "description": "first plan",
                    "only_logging": true,
                },
                {
                    "id": PLAN_UUID_B,
                    "creation_date": "2022-06-01",
                    "start": "2022-06-01",
                    "end": null,
                    "description": "",
                    "only_logging": false,
                },
                {
                    "id": PLAN_UUID_C,
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
                id: PLAN_UUID_A,
                creationDate: new Date('2023-05-26'),
                start: new Date('2023-06-01'),
                end: new Date('2023-06-30'),
                description: 'first plan',
                onlyLogging: true
            }),
            new NutritionalPlan({
                id: PLAN_UUID_B,
                creationDate: new Date('2022-06-01'),
                description: '',
                onlyLogging: false
            }),
            new NutritionalPlan({
                id: PLAN_UUID_C,
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
        expect(result!.id).toBe(RESPONSE_PLAN_UUID);
        expect(getMealsForPlan).toHaveBeenCalledWith(RESPONSE_PLAN_UUID);
        // Diary entries are filtered by plan id
        expect(getNutritionalDiaryEntries).toHaveBeenCalledWith({
            filtersetQuery: { plan: RESPONSE_PLAN_UUID },
        });
    });

    test('getNutritionalPlanFull returns null for null id without making any request', async () => {
        const result = await getNutritionalPlanFull(null);

        expect(result).toBeNull();
        expect(axios.get).not.toHaveBeenCalled();
        expect(getMealsForPlan).not.toHaveBeenCalled();
    });

    test('getNutritionalPlanFull wires meals back to their diary entries by mealId', async () => {
        const OTHER_MEAL_UUID = 'bbbbbbbb-0000-0000-0000-000000000099';
        // Two diary entries, one for the matching meal and one for an unrelated meal
        const diaryEntries = [
            { mealId: RESPONSE_MEAL_UUID },
            { mealId: OTHER_MEAL_UUID },
            { mealId: RESPONSE_MEAL_UUID },
        ];
        const meals = [{ id: RESPONSE_MEAL_UUID, diaryEntries: [] as { mealId: string }[] }];

        (axios.get as Mock).mockResolvedValue({ data: responseNutritionalPlanDetail });
        (getMealsForPlan as Mock).mockResolvedValue(meals);
        (getNutritionalDiaryEntries as Mock).mockResolvedValue(diaryEntries);

        const result = await getNutritionalPlanFull(RESPONSE_PLAN_UUID);

        expect(result).not.toBeNull();
        // The meal collected only the entries that match its id
        expect(meals[0].diaryEntries).toHaveLength(2);
        expect(meals[0].diaryEntries.every(e => e.mealId === RESPONSE_MEAL_UUID)).toBe(true);
        // Both data sources are wired into the plan
        expect(result!.diaryEntries).toBe(diaryEntries);
        expect(result!.meals).toBe(meals);
    });

    test('getNutritionalPlanFull forwards filtersetQueryLogs to the diary loader', async () => {
        (axios.get as Mock).mockResolvedValue({ data: responseNutritionalPlanDetail });
        (getMealsForPlan as Mock).mockResolvedValue([]);
        (getNutritionalDiaryEntries as Mock).mockResolvedValue([]);

        await getNutritionalPlanFull(RESPONSE_PLAN_UUID, { filtersetQueryLogs: { datetime__date: "2024-08-01" } });

        expect(getNutritionalDiaryEntries).toHaveBeenCalledWith({
            filtersetQuery: { plan: RESPONSE_PLAN_UUID, datetime__date: "2024-08-01" },
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

            only_logging: false,

            goal_energy: 2200,
        });
        expect(body).not.toHaveProperty("id");
        expect(result).toBeInstanceOf(NutritionalPlan);
        expect(result.id).toBe(RESPONSE_PLAN_UUID);
    });

    test('editNutritionalPlan PATCHes /nutritionplan/<id>/', async () => {
        const plan = new NutritionalPlan({
            id: RESPONSE_PLAN_UUID,
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
        expect(url).toMatch(new RegExp(`/api/v2/nutritionplan/${RESPONSE_PLAN_UUID}/$`));
        expect(body).toMatchObject({ id: RESPONSE_PLAN_UUID, description: "edited" });
        expect(result.description).toBe("edited");
    });

    test('deleteNutritionalPlan DELETEs /nutritionplan/<id>/', async () => {
        (axios.delete as Mock).mockResolvedValue({ status: 204 });

        await deleteNutritionalPlan(RESPONSE_PLAN_UUID);

        expect(axios.delete).toHaveBeenCalledWith(
            expect.stringMatching(new RegExp(`/api/v2/nutritionplan/${RESPONSE_PLAN_UUID}/$`)),
            expect.anything()
        );
    });
});
