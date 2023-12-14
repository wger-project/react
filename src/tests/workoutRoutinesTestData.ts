import { WorkoutRoutine } from "components/WorkoutRoutines/models/WorkoutRoutine";
import { WeightUnit } from "components/WorkoutRoutines/models/WeightUnit";
import { RepetitionUnit } from "components/WorkoutRoutines/models/RepetitionUnit";
import { Day } from "components/WorkoutRoutines/models/Day";
import { WorkoutSet } from "components/WorkoutRoutines/models/WorkoutSet";
import { WorkoutSetting } from "components/WorkoutRoutines/models/WorkoutSetting";
import { testExerciseSquats } from "tests/exerciseTestdata";

export const testWeightUnitKg = new WeightUnit(1, "kg");
export const testWeightUnitLb = new WeightUnit(2, "lb");
export const testWeightUnitPlates = new WeightUnit(3, "Plates");

export const testRepUnitRepetitions = new RepetitionUnit(1, "Repetitions");
export const testRepUnitUnitFailure = new RepetitionUnit(2, "Unit failure");
export const testRepUnitUnitMinutes = new RepetitionUnit(3, "Minutes");

const testSetting1 = new WorkoutSetting(
    5,
    new Date(2011, 1, 1),
    1,
    2,
    8,
    80,
    1,
    "1.5",
    1,
    "this is a comment",
    testRepUnitRepetitions,
    testWeightUnitKg
);
testSetting1.base = testExerciseSquats;

const testSet1 = new WorkoutSet(10,
    4,
    1,
    "range of motion!!",
    [testSetting1]
);

const testDayLegs = new Day(5,
    "Every day is leg day 🦵🏻",
    [1, 2, 3],
    [testSet1]
);

export const testRoutine1 = new WorkoutRoutine(
    1,
    'Test routine 1',
    'Full body routine',
    new Date('2023-01-01'),
    [testDayLegs]
);


export const testRoutine2 = new WorkoutRoutine(
    2,
    '',
    'The routine description',
    new Date('2023-02-01')
);

export const TEST_ROUTINES = [testRoutine1, testRoutine2];


export const responseApiWorkoutRoutine = {
    "count": 1,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "name": "My first routine!",
            "creation_date": "2022-01-01",
            "description": "Well rounded full body routine"
        },
        {
            "id": 2,
            "name": "Beach body",
            "creation_date": "2023-01-01",
            "description": "Train only arms and chest, no legs!!!"
        }
    ]
};

export const responseApiDay = {
    "count": 1,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "training": 1,
            "description": "Tag 2",
            "day": [
                2,
                3
            ]
        }
    ]
};

export const responseApiSet = {
    "count": 1,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "exerciseday": 1,
            "sets": 4,
            "order": 1,
            "comment": "start slowly"
        }
    ]
};

export const responseApiSetting = {
    "count": 1,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "set": 1,
            "exercise_base": 427,
            "repetition_unit": 1,
            "reps": 11,
            "weight": null,
            "weight_unit": 1,
            "rir": null,
            "order": 1,
            "comment": ""
        }
    ]
};
export const responseRoutineLogs = {
    "count": 2,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 2,
            "reps": 12,
            "weight": "10.00",
            "date": "2023-05-10",
            "rir": "",
            "exercise_base": 100,
            "workout": 1,
            "repetition_unit": 1,
            "weight_unit": 1
        },
        {
            "id": 1,
            "reps": 10,
            "weight": "20.00",
            "date": "2023-05-13",
            "rir": "",
            "exercise_base": 100,
            "workout": 1,
            "repetition_unit": 1,
            "weight_unit": 1
        }
    ]
};

export const testWeightUnit1 = new WeightUnit(
    1,
    'kg',
);
export const testWeightUnit2 = new WeightUnit(
    2,
    'stone',
);
export const testRepUnit1 = new RepetitionUnit(
    1,
    'reps',
);
export const testRepUnit2 = new RepetitionUnit(
    2,
    'minutes',
);