import { Day } from "components/WorkoutRoutines/models/Day";
import { RepetitionUnit } from "components/WorkoutRoutines/models/RepetitionUnit";
import { Routine } from "components/WorkoutRoutines/models/Routine";
import { WeightUnit } from "components/WorkoutRoutines/models/WeightUnit";
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

const testDayLegs = new Day(
    5,
    null,
    "Every day is leg day 🦵🏻",
    '',
    false,
    false,
    false,
);

export const testRoutine1 = new Routine(
    1,
    'Test routine 1',
    'Full body routine',
    1,
    new Date('2023-01-01'),
    new Date('2023-01-01'),
    new Date('2023-02-01'),
    [testDayLegs]
);


export const testRoutine2 = new Routine(
    2,
    '',
    'The routine description',
    1,
    new Date('2023-02-01'),
    new Date('2023-02-01'),
    new Date('2023-03-01')
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
            "description": "Well rounded full body routine",
            "first_day": 3,
            "created": "2022-01-01T12:34:30+01:00",
            "start": "2024-03-01",
            "end": "2024-04-30",
        },
        {
            "id": 2,
            "name": "Beach body",
            "description": "Train only arms and chest, no legs!!!",
            "created": "2023-01-01T17:22:22+02:00",
            "first_day": 5,
            "start": "2024-03-01",
            "end": "2024-04-30",
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

export const responseRoutineLogs = {
    "count": 2,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 2,
            "reps": 12,
            "iteration": 1,
            "set_config": 2,
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
            "iteration": 1,
            "set_config": 2,
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

export const responseRoutineDayDataToday = {
    "iteration": 42,
    "date": "2024-04-01",
    "label": "first label",
    "day": {
        "id": 100,
        "next_day": 101,
        "name": "Push day",
        "description": "",
        "is_rest": false,
        "last_day_in_week": false,
        "need_logs_to_advance": false
    },
    "slots": [
        {
            "comment": "Push set 1",
            "exercises": [
                9,
                12
            ],
            "sets": [
                {
                    "exercise": 9,
                    "sets": 5,
                    "weight": "100.00",
                    "weight_unit": 1,
                    "weight_rounding": "1.25",
                    "reps": "10.00",
                    "reps_unit": 1,
                    "reps_rounding": "1.00",
                    "rir": "2.00",
                    "rest": "120.00"
                },
                {
                    "exercise": 12,
                    "sets": 3,
                    "weight": "90.00",
                    "weight_unit": 1,
                    "weight_rounding": "1.25",
                    "reps": "12.00",
                    "reps_unit": 1,
                    "reps_rounding": "1.00",
                    "rir": "2.00",
                    "rest": "120.00"
                },
                {
                    "exercise": 9,
                    "sets": 5,
                    "weight": "100.00",
                    "weight_unit": 1,
                    "weight_rounding": "1.25",
                    "reps": "10.00",
                    "reps_unit": 1,
                    "reps_rounding": "1.00",
                    "rir": "2.00",
                    "rest": "120.00"
                },
                {
                    "exercise": 12,
                    "sets": 3,
                    "weight": "90.00",
                    "weight_unit": 1,
                    "weight_rounding": "1.25",
                    "reps": "12.00",
                    "reps_unit": 1,
                    "reps_rounding": "1.00",
                    "rir": "2.00",
                    "rest": "120.00"
                },
                {
                    "exercise": 9,
                    "sets": 5,
                    "weight": "100.00",
                    "weight_unit": 1,
                    "weight_rounding": "1.25",
                    "reps": "10.00",
                    "reps_unit": 1,
                    "reps_rounding": "1.00",
                    "rir": "2.00",
                    "rest": "120.00"
                },
                {
                    "exercise": 12,
                    "sets": 3,
                    "weight": "90.00",
                    "weight_unit": 1,
                    "weight_rounding": "1.25",
                    "reps": "12.00",
                    "reps_unit": 1,
                    "reps_rounding": "1.00",
                    "rir": "2.00",
                    "rest": "120.00"
                },
                {
                    "exercise": 9,
                    "sets": 5,
                    "weight": "100.00",
                    "weight_unit": 1,
                    "weight_rounding": "1.25",
                    "reps": "10.00",
                    "reps_unit": 1,
                    "reps_rounding": "1.00",
                    "rir": "2.00",
                    "rest": "120.00"
                },
                {
                    "exercise": 9,
                    "sets": 5,
                    "weight": "100.00",
                    "weight_unit": 1,
                    "weight_rounding": "1.25",
                    "reps": "10.00",
                    "reps_unit": 1,
                    "reps_rounding": "1.00",
                    "rir": "2.00",
                    "rest": "120.00"
                }
            ]
        },
        {
            "comment": "Push set 2",
            "exercises": [],
            "sets": []
        },
        {
            "comment": "Push set 3",
            "exercises": [],
            "sets": []
        }
    ]
};