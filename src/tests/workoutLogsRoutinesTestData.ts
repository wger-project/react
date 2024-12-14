import { WorkoutLog } from "components/WorkoutRoutines/models/WorkoutLog";
import { testExerciseSquats } from "tests/exerciseTestdata";
import { testRepUnitRepetitions, testWeightUnitKg } from "tests/workoutRoutinesTestData";

const testWorkoutLog1 = new WorkoutLog({
    id: 5,
    date: new Date(2023, 1, 1),
    iteration: 345,
    exerciseId: 1,
    slotEntryId: 123,
    repetitionUnitId: 1,
    reps: 8,
    weight: 80,
    weightUnitId: 1,
    rir: "1.5",
    repetitionUnitObj: testRepUnitRepetitions,
    weightUnitObj: testWeightUnitKg,
    exerciseObj: testExerciseSquats
});

const testWorkoutLog2 = new WorkoutLog({
    id: 6,
    date: new Date(2023, 1, 2),
    iteration: 345,
    exerciseId: 1,
    slotEntryId: 123,
    repetitionUnitId: 1,
    reps: 8,
    weight: 82.5,
    weightUnitId: 1,
    rir: "1.5",
    repetitionUnitObj: testRepUnitRepetitions,
    weightUnitObj: testWeightUnitKg,
    exerciseObj: testExerciseSquats
});

const testWorkoutLog3 = new WorkoutLog({
    id: 7,
    date: new Date(2023, 1, 3),
    iteration: 345,
    exerciseId: 1,
    slotEntryId: 123,
    repetitionUnitId: 1,
    reps: 8,
    weight: 85,
    weightUnitId: 1,
    rir: "1.5",
    repetitionUnitObj: testRepUnitRepetitions,
    weightUnitObj: testWeightUnitKg,
    exerciseObj: testExerciseSquats
});

const testWorkoutLog4 = new WorkoutLog({
    id: 8,
    date: new Date(2023, 1, 10),
    iteration: 345,
    exerciseId: 1,
    slotEntryId: 123,
    repetitionUnitId: 1,
    reps: 8,
    weight: 10,
    weightUnitId: 1,
    rir: "1.5",
    repetitionUnitObj: testRepUnitRepetitions,
    weightUnitObj: testWeightUnitKg,
    exerciseObj: testExerciseSquats
});

export const testWorkoutLogs = [
    testWorkoutLog1,
    testWorkoutLog2,
    testWorkoutLog3,
    testWorkoutLog4
];