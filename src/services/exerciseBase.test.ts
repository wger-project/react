import axios from "axios";
import { getExerciseBases } from "services/exerciseBase";
import { ExerciseBase } from "components/Exercises/models/exerciseBase";
import { Category } from "components/Exercises/models/category";
import { Equipment } from "components/Exercises/models/equipment";
import { Muscle } from "components/Exercises/models/muscle";
import { ExerciseImage } from "components/Exercises/models/image";

jest.mock("axios");


describe("equipment service tests", () => {

    test('GET equipment entries', async () => {

        // Arrange
        const response = {
            "count": 418,
            "next": "http://localhost:8000/api/v2/exerciseinfo/?format=json&limit=20&offset=20",
            "previous": null,
            "results": [{
                "id": 345,
                "name": "2 Handed Kettlebell Swing",
                "uuid": "c788d643-150a-4ac7-97ef-84643c6419bf",
                "description": "<p>Two Handed Russian Style Kettlebell swing</p>",
                "creation_date": "2015-08-03",
                "category": { "id": 10, "name": "Abs" },
                "muscles": [
                    {
                        "id": 10,
                        "name": "Quadriceps femoris",
                        "is_front": true,
                        "image_url_main": "/static/images/muscles/main/muscle-10.svg",
                        "image_url_secondary": "/static/images/muscles/secondary/muscle-10.svg"
                    }
                ],
                "muscles_secondary": [
                    {
                        "id": 11,
                        "name": "Biceps femoris",
                        "is_front": false,
                        "image_url_main": "/static/images/muscles/main/muscle-11.svg",
                        "image_url_secondary": "/static/images/muscles/secondary/muscle-11.svg"
                    }
                ],
                "equipment": [
                    { "id": 10, "name": "Kettlebell" },
                    { "id": 1, "name": "Test 123" },
                ],
                "language": { "id": 2, "short_name": "en", "full_name": "English" },
                "license": {
                    "id": 2,
                    "full_name": "Creative Commons Attribution Share Alike 4",
                    "short_name": "CC-BY-SA 4",
                    "url": "https://creativecommons.org/licenses/by-sa/4.0/deed.en"
                },
                "license_author": "deusinvictus",
                "images": [{
                    "id": 7,
                    "uuid": "2fe5f04b-5c9d-448c-a973-3fad6ddd4f74",
                    "exercise_base": 9,
                    "image": "http://localhost:8000/media/exercise-images/9/2fe5f04b-5c9d-448c-a973-3fad6ddd4f74.jpg",
                    "is_main": true,
                    "status": "2",
                    "style": "4"
                }],
                "comments": [
                    "This is a comment",
                    "This is another comment",
                    "This is a third comment"
                ],
                "variations": [
                    228,
                    66,
                    153,
                    266,
                    241
                ]
            }]
        };


        // Act
        // @ts-ignore
        axios.get.mockImplementation(() => Promise.resolve({ data: response }));
        const result = await getExerciseBases();

        // Assert
        const category = new Category(10, "Abs");
        const equipment1 = new Equipment(10, "Kettlebell");
        const equipment2 = new Equipment(1, "Test 123");
        const muscle1 = new Muscle(10, "Quadriceps femoris", true);
        const muscle2 = new Muscle(11, "Biceps femoris", false);
        const image = new ExerciseImage(
            7,
            "2fe5f04b-5c9d-448c-a973-3fad6ddd4f74",
            "http://localhost:8000/media/exercise-images/9/2fe5f04b-5c9d-448c-a973-3fad6ddd4f74.jpg",
            true);
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(result).toStrictEqual([
            new ExerciseBase(
                345,
                "c788d643-150a-4ac7-97ef-84643c6419bf",
                new Date('2015-08-03'),
                category,
                [equipment1, equipment2],
                [muscle1],
                [muscle2],
                [image],
                [228, 66, 153, 266, 241],
                [
                    "This is a comment",
                    "This is another comment",
                    "This is a third comment"
                ]
            )
        ]);
    });
});
