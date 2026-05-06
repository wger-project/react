import axios from "axios";
import { Ingredient } from "@/components/Nutrition/models/Ingredient";
import { getIngredient, getIngredients, searchIngredient } from "@/components/Nutrition/api/ingredient";
import { API_RESULTS_PAGE_SIZE } from "@/core/lib/consts";
import type { Mock } from 'vitest';

vi.mock("axios");

describe("Ingredient service tests", () => {

    const ingredientInfoResponse = {
        "id": 77897,
        "uuid": "7b13e612-14e6-424a-9418-4fd366ff3224",
        "code": "8801043020756",
        "name": "some test ingredient",
        "creation_date": "2020-12-20T01:00:00+01:00",
        "update_date": "2023-04-08T02:00:00+02:00",
        "energy": 470,
        "protein": "6.000",
        "carbohydrates": "72.000",
        "carbohydrates_sugar": "4.000",
        "fat": "18.000",
        "fat_saturated": "6.000",
        "fiber": null,
        "sodium": "0.508",
        "is_vegan": true,
        "is_vegetarian": true,
        "nutriscore": "a",
        "license": 5,
        "license_title": "감자깡",
        "license_object_url": "",
        "license_author": "Open Food Facts",
        "license_author_url": "",
        "license_derivative_source_url": "",
        "language": 2,
        "image": {
            "id": 1,
            "uuid": "b260b245-efe9-4c92-9d8f-d2c4406221dd",
            "image": "http://localhost:8000/media/ingredients/59197/b260b245-efe9-4c92-9d8f-d2c4406221dd.jpg",
            "created": "2023-08-10T14:02:50.819376+02:00",
            "last_update": "2023-08-10T14:02:50.832422+02:00",
            "size": 21159,
            "width": 400,
            "height": 194,
            "license": 1,
            "license_title": "Photo",
            "license_object_url": "https://world.openfoodfacts.org/cgi/product_image.pl?code=4250241203517&id=2",
            "license_author": "kiliweb",
            "license_author_url": "https://world.openfoodfacts.org/photographer/kiliweb",
            "license_derivative_source_url": ""
        },
        "thumbnails": {
            "small": "http://localhost:8000/974e62478222.jpg.200x200_q85.jpg",
            "small_cropped": "http://localhost:8000/974e62478222.jpg.200x200_q85_crop-smart.jpg",
            "medium": "http://localhost:8000/media/974e62478222.jpg.400x400_q85.jpg",
            "medium_cropped": "http://localhost:8000/media/974e62478222.jpg.400x400_q85_crop-smart.jpg",
            "large": "http://localhost:8000/media/974e62478222.jpg.800x800_q90.jpg",
            "large_cropped": "http://localhost:8000/media/974e62478222.jpg.800x800_q90_crop-smart.jpg"
        }
    };

    // A second, simpler ingredient response for paginated tests
    const ingredientInfoResponse2 = {
        ...ingredientInfoResponse,
        id: 77898,
        uuid: "7b13e612-14e6-424a-9418-4fd366ff3225",
        name: "another ingredient",
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('GET an ingredient', async () => {
        // Act
        (axios.get as Mock).mockImplementation(() => Promise.resolve({ data: ingredientInfoResponse }));
        const result = await getIngredient(1);

        // Assert
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(result.id).toEqual(77897);
        expect(result.uuid).toEqual("7b13e612-14e6-424a-9418-4fd366ff3224");
        expect(result.code).toEqual("8801043020756");
        expect(result.name).toEqual("some test ingredient");
        expect(result.energy).toEqual(470);
        expect(result.protein).toEqual(6);
        expect(result.carbohydrates).toEqual(72);
        expect(result.carbohydratesSugar).toEqual(4);
        expect(result.fat).toEqual(18);
        expect(result.fatSaturated).toEqual(6);
        expect(result.fiber).toEqual(null);
        expect(result.sodium).toEqual(0.508);
        expect(result.isVegan).toEqual(true);
        expect(result.isVegetarian).toEqual(true);
        expect(result.nutriscore).toEqual('a');
        expect(result.image?.url).toEqual('http://localhost:8000/media/ingredients/59197/b260b245-efe9-4c92-9d8f-d2c4406221dd.jpg');
    });

    test('getIngredients short-circuits and returns [] when called with an empty id list', async () => {
        const result = await getIngredients([]);

        expect(result).toEqual([]);
        // No HTTP request - the empty case is handled before any axios call
        expect(axios.get).not.toHaveBeenCalled();
    });

    test('getIngredients sends id__in and collects results across paginated pages', async () => {
        // Two pages: first has `next` set, second has next: null to end the loop
        (axios.get as Mock)
            .mockResolvedValueOnce({
                data: {
                    count: 2,
                    next: "https://example.com/page2",
                    previous: null,
                    results: [ingredientInfoResponse],
                },
            })
            .mockResolvedValueOnce({
                data: {
                    count: 2,
                    next: null,
                    previous: null,
                    results: [ingredientInfoResponse2],
                },
            });

        const result = await getIngredients([77897, 77898]);

        // First call uses the constructed url with id__in
        const firstUrl = (axios.get as Mock).mock.calls[0][0] as string;
        expect(firstUrl).toContain("/api/v2/ingredientinfo/");
        expect(firstUrl).toContain("id__in=77897%2C77898");
        // Second call follows the `next` cursor verbatim
        expect((axios.get as Mock).mock.calls[1][0]).toBe("https://example.com/page2");

        expect(result).toHaveLength(2);
        expect(result[0]).toBeInstanceOf(Ingredient);
        expect(result.map(i => i.id)).toEqual([77897, 77898]);
    });

    test('searchIngredient builds the language query and forwards filters', async () => {
        (axios.get as Mock).mockResolvedValue({
            data: { results: [ingredientInfoResponse] },
        });

        await searchIngredient("yogurt", {
            languageCode: "de",
            languageFilter: "current_english",
            isVegan: true,
            isVegetarian: false,
            nutriscoreMax: "b",
        });

        const url = (axios.get as Mock).mock.calls[0][0] as string;
        expect(url).toContain("name__search=yogurt");
        expect(url).toContain(`limit=${API_RESULTS_PAGE_SIZE}`);
        // current_english + non-English language => both codes are queried
        expect(url).toMatch(/language__code=de(%2C|,)en/);
        expect(url).toContain("is_vegan=true");
        expect(url).toContain("is_vegetarian=false");
        expect(url).toContain("nutriscore__lte=b");
    });

    test('searchIngredient with languageFilter="all" omits the language filter entirely', async () => {
        (axios.get as Mock).mockResolvedValue({ data: { results: [] } });

        await searchIngredient("rice", {
            languageCode: "de",
            languageFilter: "all",
        });

        const url = (axios.get as Mock).mock.calls[0][0] as string;
        expect(url).not.toContain("language__code");
    });

    test('searchIngredient with languageCode="en" does not duplicate English in the query', async () => {
        (axios.get as Mock).mockResolvedValue({ data: { results: [] } });

        await searchIngredient("rice", {
            languageCode: "en",
            languageFilter: "current_english",
        });

        const url = (axios.get as Mock).mock.calls[0][0] as string;
        // Single 'en' code, not 'en,en'
        expect(url).toMatch(/language__code=en(?!%2Cen|,en)/);
    });

    test('searchIngredient maps results into Ingredient instances', async () => {
        (axios.get as Mock).mockResolvedValue({
            data: { results: [ingredientInfoResponse, ingredientInfoResponse2] },
        });

        const result = await searchIngredient("yogurt", { languageCode: "en" });

        expect(result).toHaveLength(2);
        expect(result[0]).toBeInstanceOf(Ingredient);
        expect(result.map(i => i.id)).toEqual([77897, 77898]);
    });
});
