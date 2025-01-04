import { Day } from "components/WorkoutRoutines/models/Day";
import { RepetitionUnit } from "components/WorkoutRoutines/models/RepetitionUnit";
import { Routine } from "components/WorkoutRoutines/models/Routine";
import { RoutineDayData } from "components/WorkoutRoutines/models/RoutineDayData";
import { RoutineLogData } from "components/WorkoutRoutines/models/RoutineLogData";
import { SetConfigData } from "components/WorkoutRoutines/models/SetConfigData";
import { Slot } from "components/WorkoutRoutines/models/Slot";
import { SlotData } from "components/WorkoutRoutines/models/SlotData";
import { SlotEntry } from "components/WorkoutRoutines/models/SlotEntry";
import { WeightUnit } from "components/WorkoutRoutines/models/WeightUnit";
import { WorkoutSession } from "components/WorkoutRoutines/models/WorkoutSession";
import { testExerciseBenchPress, testExerciseSquats } from "tests/exerciseTestdata";
import { testWorkoutLogs } from "tests/workoutLogsRoutinesTestData";

export const testWeightUnitKg = new WeightUnit(1, "kg");
export const testWeightUnitLb = new WeightUnit(2, "lb");
export const testWeightUnitPlates = new WeightUnit(3, "Plates");

export const testRepUnitRepetitions = new RepetitionUnit(1, "Repetitions");
export const testRepUnitUnitFailure = new RepetitionUnit(2, "Unit failure");
export const testRepUnitUnitMinutes = new RepetitionUnit(3, "Minutes");

const testDayLegs = new Day({
    id: 5,
    order: 1,
    name: "Every day is leg day 🦵🏻",
    description: '',
    isRest: false,
    needLogsToAdvance: false,
    type: 'custom',
    config: null,
    slots: [
        new Slot({
            id: 1,
            dayId: 5,
            order: 1,
            comment: '',
            config: null,
            entries: [
                new SlotEntry({
                    id: 1,
                    slotId: 1,
                    exerciseId: 345,
                    exercise: testExerciseSquats,
                    repetitionUnitId: 1,
                    repetitionRounding: 1,
                    weightUnitId: 1,
                    weightRounding: 1,
                    order: 1,
                    comment: 'test',
                    type: 'normal',
                    config: null
                })
            ]
        }),
        new Slot({
            id: 2,
            dayId: 5,
            order: 1,
            comment: '',
            config: null,
            entries: [
                new SlotEntry({
                    id: 1,
                    slotId: 1,
                    exerciseId: 2,
                    exercise: testExerciseBenchPress,
                    repetitionUnitId: 1,
                    repetitionRounding: 1,
                    weightUnitId: 1,
                    weightRounding: 1,
                    order: 1,
                    comment: 'test',
                    type: 'normal',
                    config: null
                })
            ]
        }),
    ]
});

const testDayPull = new Day({
    id: 6,
    order: 2,
    name: 'Pull day',
    description: '',
    isRest: false,
    needLogsToAdvance: false,
    type: 'custom',
    config: null
});

const testRestDay = new Day({
    id: 19,
    order: 3,
    name: '',
    description: '',
    isRest: true,
    needLogsToAdvance: false,
    type: 'custom',
    config: null
});

export const testRoutineDataCurrentIteration1 = [
    new RoutineDayData(
        5,
        new Date('2024-05-05'),
        '',
        testDayLegs,
        [
            new SlotData(
                '',
                false,
                [1],
                [
                    new SetConfigData({
                            exerciseId: 1,
                            slotEntryId: 1,
                            type: 'normal',
                            nrOfSets: 4,
                            maxNrOfSets: null,
                            weight: 20,
                            maxWeight: null,
                            weightUnitId: 1,
                            weightRounding: 1.25,
                            reps: 5,
                            maxReps: 6,
                            repsUnitId: 1,
                            repsRounding: 1,
                            rir: 2,
                            rpe: 8,
                            restTime: 120,
                            maxRestTime: null,
                            textRepr: "4 Sets, 5 x 20 @ 2Rir",
                            comment: '',
                            exercise: testExerciseSquats
                        },
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
        1,
        new Date('2024-07-01'),
        'everything was great today!',
        '1',
        new Date('2024-12-01 12:30'),
        new Date('2024-12-01 17:30'),
    ),
    testWorkoutLogs
);

export const testRoutine1 = new Routine(
    1,
    'Test routine 1',
    'Full body routine',
    new Date('2024-01-01'),
    new Date('2024-05-01'),
    new Date('2024-06-01'),
    false,
    [testDayLegs, testRestDay, testDayPull]
);
testRoutine1.dayDataAllIterations = testRoutineDataCurrentIteration1;
testRoutine1.dayDataCurrentIteration = testRoutineDataCurrentIteration1;
testRoutine1.logData = [testRoutineLogData];

export const testRoutine2 = new Routine(
    2,
    '',
    'The routine description',
    new Date('2024-02-01'),
    new Date('2024-02-01'),
    new Date('2024-03-01'),
    false
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
            "created": "2022-01-01T12:34:30+01:00",
            "start": "2024-03-01",
            "end": "2024-04-30",
            "fit_in_week": false
        },
        {
            "id": 2,
            "name": "Beach body",
            "description": "Train only arms and chest, no legs!!!",
            "created": "2023-01-01T17:22:22+02:00",
            "start": "2024-03-01",
            "end": "2024-04-30",
            "fit_in_week": false
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
            "iteration": 1,
            "date": "2023-05-10",
            "exercise": 100,
            "routine": 1,
            "slot_entry": 2,

            "repetition_unit": 1,
            "reps": 12,
            "reps_target": 12,

            "weight_unit": 1,
            "weight": "10.00",
            "weight_target": null,

            "rir": null,
            "rir_target": null
        },
        {
            "id": 1,
            "iteration": 1,
            "date": "2023-05-13",
            "exercise": 100,
            "routine": 1,
            "slot_entry": 2,

            "repetition_unit": 1,
            "reps": 10,
            "reps_target": null,

            "weight_unit": 1,
            "weight": "20.00",
            "weight_target": "20.00",

            "rir": "1.5",
            "rir_target": "1"
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
            "order": 5,
            "name": "Push day",
            "type": "custom",
            "description": "",
            "is_rest": false,
            "last_day_in_week": false,
            "need_logs_to_advance": false,
            "config": null
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
                        "slot_entry_id": 1000,
                        "type": "dropset",
                        "sets": 5,
                        "max_sets": null,
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
                        "slot_entry_id": 1001,
                        "exercise": 12,
                        "sets": 3,
                        "max_sets": null,
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