import { testExerciseSquats } from "tests/exerciseTestdata";
import { WorkoutLog } from "components/WorkoutRoutines/models/WorkoutLog";
import { testRepUnitRepetitions, testWeightUnitKg } from "tests/workoutRoutinesTestData";

const testWorkoutLog1 = new WorkoutLog(
    5,
    new Date(2023, 1, 1),
    345,
    1,
    8,
    80,
    1,
    "1.5",
    testRepUnitRepetitions,
    testWeightUnitKg,
    testExerciseSquats
);

const testWorkoutLog2 = new WorkoutLog(
    6,
    new Date(2023, 1, 2),
    345,
    1,
    8,
    82.5,
    1,
    "1.5",
    testRepUnitRepetitions,
    testWeightUnitKg,
    testExerciseSquats
);

const testWorkoutLog3 = new WorkoutLog(
    7,
    new Date(2023, 1, 3),
    345,
    1,
    8,
    85,
    1,
    "1.5",
    testRepUnitRepetitions,
    testWeightUnitKg,
    testExerciseSquats
);

const testWorkoutLog4 = new WorkoutLog(
    8,
    new Date(2023, 1, 10),
    345,
    1,
    8,
    10,
    1,
    "1.5",
    testRepUnitRepetitions,
    testWeightUnitKg,
    testExerciseSquats
);

export const testWorkoutLogs = [
    testWorkoutLog1,
    testWorkoutLog2,
    testWorkoutLog3,
    testWorkoutLog4
];