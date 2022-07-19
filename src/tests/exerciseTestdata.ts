import { Category } from "components/Exercises/models/category";
import { Language } from "components/Exercises/models/language";
import { Muscle } from "components/Exercises/models/muscle";
import { Equipment } from "components/Exercises/models/equipment";
import { ExerciseBase } from "components/Exercises/models/exerciseBase";
import { ExerciseTranslation } from "components/Exercises/models/exerciseTranslation";

export const testCategories = [
    new Category(1, 'Arms'),
    new Category(2, 'Legs'),
    new Category(3, 'Chest')
];

export const testLanguages = [
    new Language(1, 'de', 'Deutsch'),
    new Language(2, 'en', 'English'),
    new Language(3, 'fr', 'French')
];

export const testMuscles = [
    new Muscle(1, 'Biggus musculus', 'Big muscle', true),
    new Muscle(2, 'Musculus dacttilaris', 'Finger muscle', true),
    new Muscle(3, 'Deltoid', 'Shoulders', false),
    new Muscle(4, 'Rectus abdominis', 'Abs', true),
];

export const testEquipment = [
    new Equipment(1, 'Barbell'),
    new Equipment(2, 'Dumbbell'),
    new Equipment(10, "Kettlebell"),
    new Equipment(42, "Rocks"),
];

export const testExerciseSquats = new ExerciseBase(
    345,
    "c788d643-150a-4ac7-97ef-84643c6419bf",
    testCategories[1],
    [testEquipment[0], testEquipment[3]],
    [testMuscles[0], testMuscles[3]],
    [],
    [],
    null,
    [],
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
    testCategories[1],
    [testEquipment[0], testEquipment[3]],
    [testMuscles[1], testMuscles[2]],
    [],
    [],
    null,
    [],
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
    testCategories[0],
    [testEquipment[1]],
    [testMuscles[0], testMuscles[1]],
    [],
    [],
    null,
    [],
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
    testCategories[2],
    [testEquipment[3]],
    [testMuscles[2]],
    [],
    [],
    1,
    [],
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
    testCategories[0],
    [testEquipment[0]],
    [testMuscles[3]],
    [],
    [],
    2,
    [],
    [
        new ExerciseTranslation(111,
            '583281c7-2362-48e7-95d5-8fd6c455e0fb',
            'Skull crusher',
            'get some sick triceps pump',
            2
        ),

    ]
);