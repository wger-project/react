import { Day } from "components/WorkoutRoutines/models/Day";
import { RepetitionUnit } from "components/WorkoutRoutines/models/RepetitionUnit";
import { Routine } from "components/WorkoutRoutines/models/Routine";
import { RoutineDayData } from "components/WorkoutRoutines/models/RoutineDayData";
import { RoutineLogData } from "components/WorkoutRoutines/models/RoutineLogData";
import { SetConfigData } from "components/WorkoutRoutines/models/SetConfigData";
import { SlotData } from "components/WorkoutRoutines/models/SlotData";
import { WeightUnit } from "components/WorkoutRoutines/models/WeightUnit";
import { WorkoutSession } from "components/WorkoutRoutines/models/WorkoutSession";
import { testExerciseSquats } from "tests/exerciseTestdata";
import { testWorkoutLogs } from "tests/workoutLogsRoutinesTestData";

export const testWeightUnitKg = new WeightUnit(1, "kg");
export const testWeightUnitLb = new WeightUnit(2, "lb");
export const testWeightUnitPlates = new WeightUnit(3, "Plates");

export const testRepUnitRepetitions = new RepetitionUnit(1, "Repetitions");
export const testRepUnitUnitFailure = new RepetitionUnit(2, "Unit failure");
export const testRepUnitUnitMinutes = new RepetitionUnit(3, "Minutes");

const testDayLegs = new Day(
    5,
    null,
    "Every day is leg day 🦵🏻",
    '',
    false,
    false,
    false,
    'custom'
);

const testDayPull = new Day(
    6,
    null,
    'Pull day',
    '',
    false,
    false,
    false,
    'custom'
);
const testRestDay = new Day(
    19,
    null,
    '',
    '',
    true,
    false,
    false,
    'custom'
);

export const testRoutineDataCurrentIteration1 = [
    new RoutineDayData(
        5,
        new Date('2024-01-10'),
        '',
        testDayLegs,
        [
            new SlotData(
                '',
                false,
                [1],
                [
                    new SetConfigData(
                        1,
                        1,
                        'normal',
                        4,
                        20,
                        null,
                        1,
                        1.25,
                        5,
                        6,
                        1,
                        1,
                        2,
                        8,
                        120,
                        null,
                        "4 Sets, 5 x 20 @ 2Rir",
                        '',
                        testExerciseSquats
                    )
                ],
                [testExerciseSquats]
            )
        ]
    ),

];

export const testRoutineLogData = new RoutineLogData(
    new WorkoutSession(
        111,
        2,
        new Date('2024-07-01'),
        'everything was great today!',
        '1',
        '12:30',
        '17:11',
    ),
    testWorkoutLogs
);

export const testRoutine1 = new Routine(
    1,
    'Test routine 1',
    'Full body routine',
    1,
    new Date('2024-01-01'),
    new Date('2024-01-01'),
    new Date('2024-02-01'),
    [testDayLegs, testRestDay, testDayPull]
);
testRoutine1.dayDataCurrentIteration = testRoutineDataCurrentIteration1;
testRoutine1.logData = [testRoutineLogData];

export const testRoutine2 = new Routine(
    2,
    '',
    'The routine description',
    1,
    new Date('2024-02-01'),
    new Date('2024-02-01'),
    new Date('2024-03-01')
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

export const responseRoutineIterationDataToday = [
    {
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
                "is_superset": true,
                "exercises": [
                    9,
                    12
                ],
                "sets": [
                    {
                        "exercise": 9,
                        "slot_config_id": 1000,
                        "type": "dropset",
                        "sets": 5,
                        "weight": "100.00",
                        "max_weight": "120.00",
                        "weight_unit": 1,
                        "weight_rounding": "1.25",
                        "reps": "10.00",
                        "max_reps": null,
                        "reps_unit": 1,
                        "reps_rounding": "1.00",
                        "rir": "2.00",
                        "rpe": "8.00",
                        "rest": "120.00",
                        "max_rest": "180.00",
                        "text_repr": "5 Sets, 10 × 100-120 kg @ 2 RiR",
                        "comment": "foo"
                    },
                    {
                        "slot_config_id": 1001,
                        "exercise": 12,
                        "sets": 3,
                        "weight": "90.00",
                        "max_weight": null,
                        "weight_unit": 1,
                        "weight_rounding": "1.25",
                        "reps": "12.00",
                        "max_reps": null,
                        "reps_unit": 1,
                        "reps_rounding": "1.00",
                        "rir": "2.00",
                        "rpe": "8.00",
                        "rest": "120.00",
                        "max_rest": null,
                        "type": "normal",
                        "text_repr": "3 Sets, 12 × 90 kg @ 2 RiR",
                        "comment": "bar"
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
    }
];