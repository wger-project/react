import axios from "axios";
import { Muscle } from "@/components/Exercises/models/muscle";
import { getMuscles } from "@/components/Exercises/api/muscles";
import { API_MAX_PAGE_SIZE } from "@/core/lib/consts";
import type { Mock } from 'vitest';

vi.mock("axios");

describe("muscle service tests", () => {

    beforeEach(() => {
        vi.resetAllMocks();
    });

    test('GET muscle entries', async () => {

        const muscleResponse = {
            count: 2,
            next: null,
            previous: null,
            results: [
                {
                    "id": 2,
                    "name": "Anterior deltoid",
                    "name_en": "Shoulders",
                    "is_front": true,
                    "image_url_main": "/static/images/muscles/main/muscle-2.svg",
                    "image_url_secondary": "/static/images/muscles/secondary/muscle-2.svg"
                },
                {
                    "id": 1,
                    "name": "Biceps brachii",
                    "name_en": "Biceps",
                    "is_front": false,
                    "image_url_main": "/static/images/muscles/main/muscle-1.svg",
                    "image_url_secondary": "/static/images/muscles/secondary/muscle-1.svg"
                },
            ]
        };

        (axios.get as Mock).mockImplementation(() => Promise.resolve({ data: muscleResponse }));

        const result = await getMuscles();
        expect(axios.get).toHaveBeenCalledTimes(1);

        expect(result).toStrictEqual([
            new Muscle(2, "Anterior deltoid", "Shoulders", true),
            new Muscle(1, "Biceps brachii", "Biceps", false),
        ]);
    });

    test('follows the pagination and requests the maximum page size', async () => {
        const muscleJson = (id: number) => ({
            "id": id,
            "name": `Muscle ${id}`,
            "name_en": "",
            "is_front": true,
            "image_url_main": `/static/images/muscles/main/muscle-${id}.svg`,
            "image_url_secondary": `/static/images/muscles/secondary/muscle-${id}.svg`
        });

        (axios.get as Mock)
            .mockResolvedValueOnce({
                data: {
                    count: 2,
                    next: 'http://localhost:8000/api/v2/muscle/?limit=1&offset=1',
                    previous: null,
                    results: [muscleJson(1)],
                }
            })
            .mockResolvedValueOnce({
                data: {
                    count: 2,
                    next: null,
                    previous: 'http://localhost:8000/api/v2/muscle/?limit=1',
                    results: [muscleJson(21)],
                }
            });

        const result = await getMuscles();

        expect(axios.get).toHaveBeenCalledTimes(2);
        expect((axios.get as Mock).mock.calls[0][0]).toContain(`limit=${API_MAX_PAGE_SIZE}`);
        expect((axios.get as Mock).mock.calls[1][0]).toBe('http://localhost:8000/api/v2/muscle/?limit=1&offset=1');
        expect(result.map(m => m.id)).toEqual([1, 21]);
    });
});

