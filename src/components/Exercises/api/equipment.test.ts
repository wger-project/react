import axios from "axios";
import { Equipment } from "@/components/Exercises/models/equipment";
import { getEquipment } from "@/components/Exercises/api/equipment";
import { API_MAX_PAGE_SIZE } from "@/core/lib/consts";
import type { Mock } from 'vitest';

vi.mock("axios");


describe("equipment service tests", () => {

    beforeEach(() => {
        vi.resetAllMocks();
    });

    test('GET equipment entries', async () => {

        // Arrange
        const response = {
            count: 3,
            next: null,
            previous: null,
            results: [
                {
                    "id": 1,
                    "name": "Barbell"
                },
                {
                    "id": 8,
                    "name": "Bench"
                },
                {
                    "id": 3,
                    "name": "Dumbbell"
                },
            ]
        };


        // Act
        (axios.get as Mock).mockImplementation(() => Promise.resolve({ data: response }));
        const result = await getEquipment();

        // Assert
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(result).toStrictEqual([
            new Equipment(1, "Barbell"),
            new Equipment(8, "Bench"),
            new Equipment(3, "Dumbbell"),
        ]);
    });

    test('follows the pagination and requests the maximum page size', async () => {
        (axios.get as Mock)
            .mockResolvedValueOnce({
                data: {
                    count: 2,
                    next: 'http://localhost:8000/api/v2/equipment/?limit=1&offset=1',
                    previous: null,
                    results: [{ "id": 1, "name": "Equipment 1" }],
                }
            })
            .mockResolvedValueOnce({
                data: {
                    count: 2,
                    next: null,
                    previous: 'http://localhost:8000/api/v2/equipment/?limit=1',
                    results: [{ "id": 21, "name": "Equipment 21" }],
                }
            });

        const result = await getEquipment();

        expect(axios.get).toHaveBeenCalledTimes(2);
        expect((axios.get as Mock).mock.calls[0][0]).toContain(`limit=${API_MAX_PAGE_SIZE}`);
        expect((axios.get as Mock).mock.calls[1][0]).toBe('http://localhost:8000/api/v2/equipment/?limit=1&offset=1');
        expect(result.map(e => e.id)).toEqual([1, 21]);
    });
});
