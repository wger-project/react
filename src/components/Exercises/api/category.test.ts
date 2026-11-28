import axios from "axios";
import { Category } from "@/components/Exercises/models/category";
import { getCategories } from "@/components/Exercises/api/category";
import { API_MAX_PAGE_SIZE } from "@/core/lib/consts";
import type { Mock } from 'vitest';

vi.mock("axios");

describe("category service tests", () => {

    beforeEach(() => {
        vi.resetAllMocks();
    });

    test('GET category entries', async () => {

        // Arrange
        const response = {
            count: 3,
            next: null,
            previous: null,
            results: [
                {
                    "id": 10,
                    "name": "Abs"
                },
                {
                    "id": 8,
                    "name": "Arms"
                },
                {
                    "id": 12,
                    "name": "Back"
                },
            ]
        };

        // Act
        (axios.get as Mock).mockImplementation(() => Promise.resolve({ data: response }));
        const result = await getCategories();

        // Assert
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(result).toStrictEqual([
            new Category(10, "Abs"),
            new Category(8, "Arms"),
            new Category(12, "Back"),
        ]);
    });

    test('follows the pagination and requests the maximum page size', async () => {
        (axios.get as Mock)
            .mockResolvedValueOnce({
                data: {
                    count: 2,
                    next: 'http://localhost:8000/api/v2/exercisecategory/?limit=1&offset=1',
                    previous: null,
                    results: [{ "id": 1, "name": "Category 1" }],
                }
            })
            .mockResolvedValueOnce({
                data: {
                    count: 2,
                    next: null,
                    previous: 'http://localhost:8000/api/v2/exercisecategory/?limit=1',
                    results: [{ "id": 21, "name": "Category 21" }],
                }
            });

        const result = await getCategories();

        expect(axios.get).toHaveBeenCalledTimes(2);
        expect((axios.get as Mock).mock.calls[0][0]).toContain(`limit=${API_MAX_PAGE_SIZE}`);
        expect((axios.get as Mock).mock.calls[1][0]).toBe('http://localhost:8000/api/v2/exercisecategory/?limit=1&offset=1');
        expect(result.map(e => e.id)).toEqual([1, 21]);
    });
});
