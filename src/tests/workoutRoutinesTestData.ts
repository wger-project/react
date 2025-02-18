import { BaseConfig } from "components/WorkoutRoutines/models/BaseConfig";
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

export const testWeightUnits = [testWeightUnitKg, testWeightUnitLb, testWeightUnitPlates];

export const testRepUnitRepetitions = new RepetitionUnit(1, "Repetitions");
export const testRepUnitUnitFailure = new RepetitionUnit(2, "Unit failure");
export const testRepUnitUnitMinutes = new RepetitionUnit(3, "Minutes");

export const testRepetitionUnits = [testRepUnitRepetitions, testRepUnitUnitFailure, testRepUnitUnitMinutes];

export const testDayLegs = new Day({
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
                    config: null,
                    configs: {
                        nrOfSetsConfigs: [
                            new BaseConfig({
                                id: 1,
                                slotEntryId: 1,
                                iteration: 1,
                                value: 5,
                            }),
                        ],
                        weightConfigs: [
                            new BaseConfig({
                                id: 2,
                                slotEntryId: 1,
                                iteration: 1,
                                value: 80,
                            }),
                        ],
                        repetitionsConfigs: [
                            new BaseConfig({
                                id: 5,
                                slotEntryId: 1,
                                iteration: 1,
                                value: 6,
                            }),
                        ],
                        maxRepetitionsConfigs: [
                            new BaseConfig({
                                id: 51,
                                slotEntryId: 1,
                                iteration: 1,
                                value: 8,
                            }),
                        ],
                        restTimeConfigs: [
                            new BaseConfig({
                                id: 9,
                                slotEntryId: 1,
                                iteration: 1,
                                value: 120,
                            }),
                        ],
                        maxRestTimeConfigs: [
                            new BaseConfig({
                                id: 101,
                                slotEntryId: 1,
                                iteration: 1,
                                value: 150,
                            }),
                        ]
                    }
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

export const testRoutineDayData1 = [
    new RoutineDayData(
        1,
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
                        repetitions: 5,
                        maxRepetitions: 6,
                        repetitionsUnitId: 1,
                        repetitionsRounding: 1,
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
    new WorkoutSession({
        id: 111,
        dayId: 2,
        routineId: 1,
        date: new Date('2024-07-01'),
        notes: 'everything was great today!',
        impression: '1',
        timeStart: new Date('2024-12-01 12:30'),
        timeEnd: new Date('2024-12-01 17:30'),
    }),
    testWorkoutLogs
);

export const testRoutine1 = new Routine({
    id: 1,
    name: 'Test routine 1',
    description: 'Full body routine',
    created: new Date('2024-01-01'),
    start: new Date('2024-05-01'),
    end: new Date('2024-06-01'),
    fitInWeek: false,
    isTemplate: false,
    isPublic: false,
    days: [testDayLegs, testRestDay, testDayPull],
    dayData: testRoutineDayData1,
    logData: [testRoutineLogData],
});

export const testRoutine2 = new Routine({
    id: 2,
    name: '',
    description: 'The routine description',
    created: new Date('2024-02-01'),
    start: new Date('2024-02-01'),
    end: new Date('2024-03-01'),
    fitInWeek: false,
    isTemplate: false,
    isPublic: false,
});

export const testPublicTemplate1 = new Routine({
    id: 3,
    name: 'public template 1',
    description: 'lorem ipsum',
    created: new Date('2025-01-01'),
    start: new Date('2025-01-10'),
    end: new Date('2025-02-01'),
    fitInWeek: false,
    isTemplate: true,
    isPublic: true,
});

export const testPrivateTemplate1 = new Routine({
    id: 4,
    name: 'private template 1',
    description: 'lorem ipsum',
    created: new Date('2025-01-01'),
    start: new Date('2025-01-10'),
    end: new Date('2025-02-01'),
    fitInWeek: false,
    isTemplate: true,
    isPublic: false,
})

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
            "fit_in_week": false,
            "is_template": false,
            "is_public": false
        },
        {
            "id": 2,
            "name": "Beach body",
            "description": "Train only arms and chest, no legs!!!",
            "created": "2023-01-01T17:22:22+02:00",
            "start": "2024-03-01",
            "end": "2024-04-30",
            "fit_in_week": false,
            "is_template": false,
            "is_public": false
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

            "repetitions_unit": 1,
            "repetitions": 12,
            "repetitions_target": 12,

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

            "repetitions_unit": 1,
            "repetitions": 10,
            "repetitions_target": null,

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

export const responseRoutineDayData = [
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
                        "repetitions": "10.00",
                        "max_repetitions": null,
                        "repetitions_unit": 1,
                        "repetitions_rounding": "1.00",
                        "rir": "2.00",
                        "max_rir": null,
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
                        "repetitions": "12.00",
                        "max_repetitions": null,
                        "repetitions_unit": 1,
                        "repetitions_rounding": "1.00",
                        "rir": "2.00",
                        "max_rir": null,
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