import { WorkoutRoutine } from "components/WorkoutRoutines/models/WorkoutRoutine";

export const testRoutine1 = new WorkoutRoutine(
    1,
    'Test routine 1',
    '',
    new Date('2023-01-01')
);
export const testRoutine2 = new WorkoutRoutine(
    2,
    '',
    'The routine description',
    new Date('2023-02-01')
);

export const testRoutines = [testRoutine1, testRoutine2];


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