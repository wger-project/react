import { Category } from "components/Exercises/models/category";
import { Language } from "components/Exercises/models/language";
import { Muscle } from "components/Exercises/models/muscle";
import { Equipment } from "components/Exercises/models/equipment";
import { ExerciseBase } from "components/Exercises/models/exerciseBase";
import { ExerciseTranslation } from "components/Exercises/models/exerciseTranslation";

export const testCategoryArms = new Category(1, 'Arms');
export const testCategoryLegs = new Category(2, 'Legs');
export const testCategoryChest = new Category(3, 'Chest');
export const testCategories = [
    testCategoryArms,
    testCategoryLegs,
    testCategoryChest
];

export const testLanguageGerman = new Language(1, 'de', 'Deutsch');
export const testLanguageEnglish = new Language(2, 'en', 'English');
export const testLanguageFrench = new Language(3, 'fr', 'French');
export const testLanguages = [
    testLanguageGerman,
    testLanguageEnglish,
    testLanguageFrench
];

export const testMuscleBiggus = new Muscle(1, 'Biggus musculus', 'Big muscle', true);
export const testMuscleDacttilaris = new Muscle(2, 'Musculus dacttilaris', 'Finger muscle', true);
export const testMuscleDeltoid = new Muscle(3, 'Deltoid', 'Shoulders', false);
export const testMuscleRectusAbdominis = new Muscle(4, 'Rectus abdominis', 'Abs', true);
export const testMuscles = [
    testMuscleBiggus,
    testMuscleDacttilaris,
    testMuscleDeltoid,
    testMuscleRectusAbdominis
];

export const testEquipmentBarbell = new Equipment(1, 'Barbell');
export const testEquipmentDumbbell = new Equipment(2, 'Dumbbell');
export const testEquipmentKettlebell = new Equipment(10, "Kettlebell");
export const testEquipmentRocks = new Equipment(42, "Rocks");
export const testEquipment = [
    testEquipmentBarbell,
    testEquipmentDumbbell,
    testEquipmentKettlebell,
    testEquipmentRocks,
];

export const testExerciseSquats = new ExerciseBase(
    345,
    "c788d643-150a-4ac7-97ef-84643c6419bf",
    testCategoryLegs,
    [testEquipmentBarbell, testEquipmentRocks],
    [testMuscleBiggus, testMuscleRectusAbdominis],
    [],
    [],
    null,
    [
        new ExerciseTranslation(111,
            '583281c7-2362-48e7-95d5-8fd6c455e0fb',
            'Squats',
            'Do a squat',
            2
        ),
        new ExerciseTranslation(9,
            'dae6f6ed-9408-4e62-a59a-1a33f4e8ab36',
            'Kniebeuge',
            'Kniebeuge machen',
            1
        )
    ]
);

export const testExerciseBenchPress = new ExerciseBase(
    2,
    "abcdef-150a-4ac7-97ef-84643c6419bf",
    testCategoryLegs,
    [testEquipmentBarbell, testEquipmentRocks],
    [testMuscleDacttilaris, testMuscleDeltoid],
    [],
    [],
    1,
    [
        new ExerciseTranslation(111,
            '583281c7-2362-48e7-95d5-8fd6c455e0fb',
            'Benchpress',
            'Do a benchpress',
            2
        ),
    ]
);
export const testExerciseCurls = new ExerciseBase(
    3,
    "abcdef-150a-4ac7-97ef-84643c6419bf",
    testCategoryArms,
    [testEquipmentDumbbell],
    [testMuscleBiggus, testMuscleDacttilaris],
    [],
    [],
    1,
    [
        new ExerciseTranslation(111,
            '583281c7-2362-48e7-95d5-8fd6c455e0fb',
            'Curls',
            'curls! yeah!',
            2
        ),
    ]
);
export const testExerciseCrunches = new ExerciseBase(
    4,
    "abcdef-150a-4ac7-97ef-84643c6419bf",
    testCategoryChest,
    [testEquipmentRocks],
    [testMuscleDeltoid],
    [],
    [],
    1,
    [
        new ExerciseTranslation(111,
            '583281c7-2362-48e7-95d5-8fd6c455e0fb',
            'Crunches',
            'Do some crunches',
            2
        ),
    ]
);
export const testExerciseSkullCrusher = new ExerciseBase(
    5,
    "abcdef-150a-4ac7-97ef-84643c6419bf",
    testCategoryArms,
    [testEquipmentBarbell],
    [testMuscleRectusAbdominis],
    [],
    [],
    2,
    [
        new ExerciseTranslation(111,
            '583281c7-2362-48e7-95d5-8fd6c455e0fb',
            'Skull crusher',
            'get some sick triceps pump',
            2
        ),
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
        ]
    }]
};