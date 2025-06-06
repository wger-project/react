import axios from "axios";
import { Muscle } from "components/Exercises/models/muscle";
import { getMuscles } from "services";

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

        (axios.get as jest.Mock).mockImplementation(() => Promise.resolve({ data: muscleResponse }));

        const result = await getMuscles();
        expect(axios.get).toHaveBeenCalledTimes(1);

        expect(result).toStrictEqual([
            new Muscle(2, "Anterior deltoid", "Shoulders", true),
            new Muscle(1, "Biceps brachii", "Biceps", false),
        ]);
    });
});

