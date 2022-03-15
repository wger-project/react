import axios from "axios";
import { getMuscles } from "services";
import { Muscle } from "components/Exercises/models/muscle";

jest.mock("axios");

describe("muscle service tests", () => {

    test('GET muscle entries', async () => {

        const muscleResponse = {
            count: 2,
            next: null,
            previous: null,
            results: [
                {
                    "id": 2,
                    "name": "Anterior deltoid",
                    "is_front": true,
                    "image_url_main": "/static/images/muscles/main/muscle-2.svg",
                    "image_url_secondary": "/static/images/muscles/secondary/muscle-2.svg"
                },
                {
                    "id": 1,
                    "name": "Biceps brachii",
                    "is_front": false,
                    "image_url_main": "/static/images/muscles/main/muscle-1.svg",
                    "image_url_secondary": "/static/images/muscles/secondary/muscle-1.svg"
                },
            ]
        };

        // @ts-ignore
        axios.get.mockImplementation(() => Promise.resolve({ data: muscleResponse }));

        const result = await getMuscles();
        expect(axios.get).toHaveBeenCalledTimes(1);

        expect(result).toStrictEqual([
            new Muscle(2, "Anterior deltoid", true),
            new Muscle(1, "Biceps brachii", false),
        ]);
    });
});

