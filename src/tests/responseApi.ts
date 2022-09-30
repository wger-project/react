import { ExerciseTranslation } from "components/Exercises/models/exerciseTranslation";
import { Note } from "components/Exercises/models/note";
import { Alias } from "components/Exercises/models/alias";
import { Category } from "components/Exercises/models/category";
import { Equipment } from "components/Exercises/models/equipment";
import { Muscle } from "components/Exercises/models/muscle";
import { ExerciseImage } from "components/Exercises/models/image";
import { ExerciseBase } from "components/Exercises/models/exerciseBase";
import { ExerciseVideo } from "components/Exercises/models/video";

const testExerciseTranslation1 = new ExerciseTranslation(
    111,
    '583281c7-2362-48e7-95d5-8fd6c455e0fb',
    'Squats',
    'Do a squat',
    2,
    [
        new Note(133, 174, 'do the exercise correctly'),
    ],
    [
        new Alias(1, 'test 123'),
        new Alias(2, 'another name'),
    ]
);
const testExerciseTranslation2 = new ExerciseTranslation(
    9,
    'dae6f6ed-9408-4e62-a59a-1a33f4e8ab36',
    'Kniebeuge',
    'Kniebeuge machen',
    1
);
const category = new Category(10, "Abs");
const equipment1 = new Equipment(10, "Kettlebell");
const equipment2 = new Equipment(1, "Test 123");
const muscle1 = new Muscle(10, "Quadriceps femoris", "Quads", true);
const muscle2 = new Muscle(11, "Biceps femoris", "Hamstrings", false);
const image = new ExerciseImage(
    7,
    "2fe5f04b-5c9d-448c-a973-3fad6ddd4f74",
    "http://localhost:8000/media/exercise-images/9/2fe5f04b-5c9d-448c-a973-3fad6ddd4f74.jpg",
    true
);

export const testApiExerciseBase1 = new ExerciseBase(
    345,
    "c788d643-150a-4ac7-97ef-84643c6419bf",
    category,
    [equipment1, equipment2],
    [muscle1],
    [muscle2],
    [image],
    228,
    [
        testExerciseTranslation1,
        testExerciseTranslation2
    ],
    [
        new ExerciseVideo(
            1,
            "b1c934fa-c4f8-4d84-8cb4-7802be0d284c",
            "http://localhost:8000/media/exercise-video/258/b1c934fa-c4f8-4d84-8cb4-7802be0d284c.mp4",
            false
        )
    ],
    [
        "wger.de",
        "author 1",
        "somebody else"
    ]
);


export const responseApiExerciseBaseInfo = {
    "count": 418,
    "next": "http://localhost:8000/api/v2/exercisebaseinfo/?format=json&limit=20&offset=20",
    "previous": null,
    "results": [{
        "id": 345,
        "uuid": "c788d643-150a-4ac7-97ef-84643c6419bf",
        "category": {
            "id": 10,
            "name": "Abs"
        },
        "muscles": [
            {
                "id": 10,
                "name": "Quadriceps femoris",
                "name_en": "Quads",
                "is_front": true,
                "image_url_main": "/static/images/muscles/main/muscle-10.svg",
                "image_url_secondary": "/static/images/muscles/secondary/muscle-10.svg"
            }
        ],
        "muscles_secondary": [
            {
                "id": 11,
                "name": "Biceps femoris",
                "name_en": "Hamstrings",
                "is_front": false,
                "image_url_main": "/static/images/muscles/main/muscle-11.svg",
                "image_url_secondary": "/static/images/muscles/secondary/muscle-11.svg"
            }
        ],
        "equipment": [
            {
                "id": 10,
                "name": "Kettlebell"
            },
            {
                "id": 1,
                "name": "Test 123"
            },
        ],
        "license": {
            "id": 2,
            "full_name": "Creative Commons Attribution Share Alike 4",
            "short_name": "CC-BY-SA 4",
            "url": "https://creativecommons.org/licenses/by-sa/4.0/deed.en"
        },
        "images": [{
            "id": 7,
            "uuid": "2fe5f04b-5c9d-448c-a973-3fad6ddd4f74",
            "exercise_base": 9,
            "image": "http://localhost:8000/media/exercise-images/9/2fe5f04b-5c9d-448c-a973-3fad6ddd4f74.jpg",
            "is_main": true,
            "status": "2",
            "style": "4"
        }],
        "videos": [
            {
                "id": 1,
                "uuid": "b1c934fa-c4f8-4d84-8cb4-7802be0d284c",
                "exercise_base": 418,
                "exercise_base_uuid": "6260e3aa-e46b-4b4b-8ada-58bfd0922d3a",
                "video": "http://localhost:8000/media/exercise-video/258/b1c934fa-c4f8-4d84-8cb4-7802be0d284c.mp4",
                "is_main": false,
                "size": 0,
                "duration": "0.00",
                "width": 0,
                "height": 0,
                "codec": "",
                "codec_long": "",
                "license": 2,
                "license_author": null
            }
        ],
        "comments": [
            "This is a comment",
            "This is another comment",
            "This is a third comment"
        ],
        "variations": 228,
        "exercises": [
            {
                "id": 111,
                "uuid": "583281c7-2362-48e7-95d5-8fd6c455e0fb",
                "name": "Squats",
                "description": "Do a squat",
                "creation_date": "2022-10-22",
                "language": 2,
                "license": 2,
                "license_author": "some dude",
                "aliases": [
                    {
                        "id": 1,
                        "alias": "test 123"
                    },
                    {
                        "id": 2,
                        "alias": "another name"
                    }
                ],
                "notes": [
                    {
                        "id": 133,
                        "exercise": 174,
                        "comment": "do the exercise correctly"
                    }
                ]
            },
            {
                "id": 9,
                "uuid": "dae6f6ed-9408-4e62-a59a-1a33f4e8ab36",
                "name": "Kniebeuge",
                "description": "Kniebeuge machen",
                "creation_date": "2022-01-01",
                "language": 1,
                "license": 2,
                "license_author": "some dude",
                "aliases": [],
                "notes": []
            }
        ],
        "author_history": [
            "wger.de",
            "author 1",
            "somebody else"
        ]
    }]
};