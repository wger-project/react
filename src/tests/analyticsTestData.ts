import { WorkoutLog } from "@/components/Routines/models/WorkoutLog";
import { RepetitionUnit } from "@/components/Routines/models/RepetitionUnit";
import { testExerciseSquats } from "@/tests/exerciseTestdata";

export const analyticsLog = (overrides: Partial<WorkoutLog> = {}): WorkoutLog => Object.assign(new WorkoutLog({
    id: 'log-1',
    date: new Date(2026, 5, 1, 18),
    routineId: 1,
    sessionId: 'session-1',
    iteration: null,
    slotEntryId: null,
    exerciseId: testExerciseSquats.id!,
    exercise: testExerciseSquats,
    repetitions: 10,
    repetitionsUnitId: 1,
    repetitionsUnit: new RepetitionUnit(1, 'Repetitions', 'REPETITIONS', 1),
    weight: 50,
    weightUnitId: 1,
    rir: null,
}), overrides);
