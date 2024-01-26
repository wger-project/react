import { Alias } from "components/Exercises/models/alias";
import { Category } from "components/Exercises/models/category";
import { Equipment } from "components/Exercises/models/equipment";
import { Exercise } from "components/Exercises/models/exercise";
import { Language } from "components/Exercises/models/language";
import { Muscle } from "components/Exercises/models/muscle";
import { Translation } from "components/Exercises/models/translation";

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

export const testExerciseSquats = new Exercise(
    345,
    "c788d643-150a-4ac7-97ef-84643c6419bf",
    testCategoryLegs,
    [testEquipmentBarbell, testEquipmentRocks],
    [testMuscleBiggus, testMuscleRectusAbdominis],
    [],
    [],
    null,
    [
        new Translation(111,
            '583281c7-2362-48e7-95d5-8fd6c455e0fb',
            'Squats',
            'Do a squat',
            2
        ),
        new Translation(9,
            'dae6f6ed-9408-4e62-a59a-1a33f4e8ab36',
            'Kniebeuge',
            'Die Kniebeuge ist eine Übung zur Kräftigung der Oberschenkelmuskulatur',
            1,
            [],
            [
                new Alias(1, 'e30eab18-7adf-4361-ad63-192c76103cf0', 'Königsübung'),
                new Alias(2, 'f4f616f8-224e-4aba-a4e1-11ec0b59af33', 'Beinverdicker'),
            ]
        )
    ]
);

export const testExerciseBenchPress = new Exercise(
    2,
    "abcdef-150a-4ac7-97ef-84643c6419bf",
    testCategoryLegs,
    [testEquipmentBarbell, testEquipmentRocks],
    [testMuscleDacttilaris, testMuscleDeltoid],
    [],
    [],
    1,
    [
        new Translation(111,
            '583281c7-2362-48e7-95d5-8fd6c455e0fb',
            'Benchpress',
            'Do a benchpress',
            2
        ),
    ]
);
export const testExerciseCurls = new Exercise(
    3,
    "abcdef-150a-4ac7-97ef-84643c6419bf",
    testCategoryArms,
    [testEquipmentDumbbell],
    [testMuscleBiggus, testMuscleDacttilaris],
    [],
    [],
    1,
    [
        new Translation(111,
            '583281c7-2362-48e7-95d5-8fd6c455e0fb',
            'Curls',
            'curls! yeah!',
            2
        ),
    ]
);
export const testExerciseCrunches = new Exercise(
    4,
    "abcdef-150a-4ac7-97ef-84643c6419bf",
    testCategoryChest,
    [testEquipmentRocks],
    [testMuscleDeltoid],
    [],
    [],
    null,
    [
        new Translation(111,
            '583281c7-2362-48e7-95d5-8fd6c455e0fb',
            'Crunches',
            'Do some crunches',
            2
        ),
    ]
);
export const testExerciseSkullCrusher = new Exercise(
    5,
    "abcdef-150a-4ac7-97ef-84643c6419bf",
    testCategoryArms,
    [testEquipmentBarbell],
    [testMuscleRectusAbdominis],
    [],
    [],
    2,
    [
        new Translation(111,
            '583281c7-2362-48e7-95d5-8fd6c455e0fb',
            'Skull crusher',
            'get some sick triceps pump',
            2
        ),
    ]
);

