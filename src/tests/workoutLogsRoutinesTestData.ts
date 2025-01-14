import { WorkoutLog } from "components/WorkoutRoutines/models/WorkoutLog";
import { WorkoutSession } from "components/WorkoutRoutines/models/WorkoutSession";
import { testExerciseSquats } from "tests/exerciseTestdata";
import { testRepUnitRepetitions, testWeightUnitKg } from "tests/workoutRoutinesTestData";

const testWorkoutLog1 = new WorkoutLog({
    id: 5,
    date: new Date(2023, 1, 1),
    iteration: 345,
    exerciseId: 1,
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
    id: 6,
    date: new Date(2023, 1, 2),
    iteration: 345,
    exerciseId: 1,
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
    id: 7,
    date: new Date(2023, 1, 3),
    iteration: 345,
    exerciseId: 1,
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
    id: 8,
    date: new Date(2023, 1, 10),
    iteration: 345,
    exerciseId: 1,
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

export const testWorkoutLogs = [
    testWorkoutLog1,
    testWorkoutLog2,
    testWorkoutLog3,
    testWorkoutLog4
];

export const testWorkoutSession = new WorkoutSession({
    id: 1,
    dayId: 2,
    routineId: 3,
    date: new Date(2025, 1, 10),
    notes: 'everything is awesome',
    impression: "1",
    timeStart: new Date(2025, 1, 10, 10, 30),
    timeEnd: new Date(2025, 1, 10, 12, 0),
});