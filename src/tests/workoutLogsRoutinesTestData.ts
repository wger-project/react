import { WorkoutLog } from "@/components/Routines/models/WorkoutLog";
import { WorkoutSession } from "@/components/Routines/models/WorkoutSession";
import { testExerciseCurls, testExerciseSquats } from "@/tests/exerciseTestdata";
import { testRepUnitRepetitions, testWeightUnitKg } from "@/tests/unitsTestData";

const testWorkoutLog1 = new WorkoutLog({
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-000000000005',
    routineId: 1,
    date: new Date(2023, 1, 1),
    iteration: 1,
    exerciseId: 345,
    slotEntryId: 123,
    repetitionsUnitId: 1,
    repetitions: 8,
    weight: 80,
    weightUnitId: 1,
    rir: 1.5,
    repetitionsUnit: testRepUnitRepetitions,
    weightUnit: testWeightUnitKg,
    exercise: testExerciseSquats
});

const testWorkoutLog2 = new WorkoutLog({
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-000000000006',
    routineId: 1,
    date: new Date(2023, 1, 2),
    iteration: 1,
    exerciseId: 345,
    slotEntryId: 123,
    repetitionsUnitId: 1,
    repetitions: 8,
    weight: 82.5,
    weightUnitId: 1,
    rir: 1.5,
    repetitionsUnit: testRepUnitRepetitions,
    weightUnit: testWeightUnitKg,
    exercise: testExerciseSquats
});

const testWorkoutLog3 = new WorkoutLog({
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-000000000007',
    routineId: 1,
    date: new Date(2023, 1, 3),
    iteration: 1,
    exerciseId: 345,
    slotEntryId: 123,
    repetitionsUnitId: 1,
    repetitions: 8,
    weight: 85,
    weightUnitId: 1,
    rir: 1.5,
    repetitionsUnit: testRepUnitRepetitions,
    weightUnit: testWeightUnitKg,
    exercise: testExerciseSquats
});

const testWorkoutLog4 = new WorkoutLog({
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-000000000008',
    routineId: 1,
    date: new Date(2023, 1, 10),
    iteration: 1,
    exerciseId: 345,
    slotEntryId: 123,
    repetitionsUnitId: 1,
    repetitions: 8,
    weight: 10,
    weightUnitId: 1,
    rir: 1.5,
    repetitionsUnit: testRepUnitRepetitions,
    weightUnit: testWeightUnitKg,
    exercise: testExerciseSquats
});

/*
 * A log for an exercise that is not part of the routine's structure
 */
export const testWorkoutLogCurls = new WorkoutLog({
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-000000000009',
    routineId: 1,
    date: new Date(2023, 1, 3),
    iteration: null,
    exerciseId: 3,
    slotEntryId: null,
    repetitionsUnitId: 1,
    repetitions: 12,
    weight: 20,
    weightUnitId: 1,
    rir: null,
    repetitionsUnit: testRepUnitRepetitions,
    weightUnit: testWeightUnitKg,
    exercise: testExerciseCurls
});

/*
 * A log whose exercise could not be loaded, e.g. because it was deleted
 */
export const testWorkoutLogUnknownExercise = new WorkoutLog({
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-000000000010',
    routineId: 1,
    date: new Date(2023, 1, 4),
    iteration: null,
    exerciseId: 999,
    slotEntryId: null,
    repetitionsUnitId: 1,
    repetitions: 10,
    weight: 30,
    weightUnitId: 1,
    rir: null,
    repetitionsUnit: testRepUnitRepetitions,
    weightUnit: testWeightUnitKg,
});

export const testWorkoutLogs = [
    testWorkoutLog1,
    testWorkoutLog2,
    testWorkoutLog3,
    testWorkoutLog4
];

export const testWorkoutSession = new WorkoutSession({
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-000000000001',
    dayId: 2,
    routineId: 3,
    notes: 'everything is awesome',
    impression: "1",
    datetimeStart: new Date(2025, 1, 10, 10, 30),
    datetimeEnd: new Date(2025, 1, 10, 12, 0),
});