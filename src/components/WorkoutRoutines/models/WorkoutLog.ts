/* eslint-disable camelcase */

import { Exercise } from "components/Exercises/models/exercise";
import { RepetitionUnit } from "components/WorkoutRoutines/models/RepetitionUnit";
import { WeightUnit } from "components/WorkoutRoutines/models/WeightUnit";
import { Adapter } from "utils/Adapter";

export interface LogEntryForm {
    exercise: Exercise | null;
    repetitionsUnit: RepetitionUnit | null;
    weightUnit: WeightUnit | null;
    slotEntry: number | null;
    rir: number | string;
    rirTarget: number | string | null;
    repetitions: number | string;
    repetitionsTarget: number | string | null;
    weight: number | string;
    weightTarget: number | string | null;
}


export class WorkoutLog {
    public id: number;
    public date: Date;
    public iteration: number | null;
    public exerciseId: number;
    public slotEntryId: number | null;
    public sessionId: number | null;
    public routineId: number | null;

    public repetitionUnitObj: RepetitionUnit | null;
    public repetitionUnitId: number | null;
    public repetitions: number | null;
    public repetitionsTarget: number | null;

    public weightUnitObj: WeightUnit | null;
    public weightUnitId: number | null;
    public weight: number | null;
    public weightTarget: number | null;

    public rir: number | null;
    public rirTarget: number | null;

    public restTime: number | null;
    public restTimeTarget: number | null;


    public exerciseObj?: Exercise;

    constructor(data: {
        id: number;
        date: Date | string;
        iteration: number | null;
        slotEntryId: number | null;
        sessionId?: number | null;
        routineId?: number | null;

        exercise?: Exercise;
        exerciseId: number;

        repetitionsUnit?: RepetitionUnit;
        repetitionsUnitId?: number | null;
        repetitions: number | null;
        repetitionsTarget?: number | null;

        weightUnit?: WeightUnit;
        weightUnitId?: number | null;
        weight: number | null;
        weightTarget?: number | null;

        rir: number | null;
        rirTarget?: number | null;

        restTime?: number | null;
        restTimeTarget?: number | null
    }) {
        this.id = data.id;
        this.date = typeof data.date === 'string' ? new Date(data.date) : data.date;
        this.iteration = data.iteration;
        this.slotEntryId = data.slotEntryId;
        this.sessionId = data.sessionId || null;
        this.routineId = data.routineId || null;

        this.exerciseObj = data.exercise;
        this.exerciseId = data.exerciseId;

        this.repetitionUnitObj = data.repetitionsUnit || null;
        this.repetitionUnitId = data.repetitionsUnitId || null;
        this.repetitions = data.repetitions;
        this.repetitionsTarget = data.repetitionsTarget || null;

        this.weightUnitObj = data.weightUnit || null;
        this.weightUnitId = data.weightUnitId || null;
        this.weight = data.weight;
        this.weightTarget = data.weightTarget || null;

        this.rir = data.rir;
        this.rirTarget = data.rirTarget || null;

        this.restTime = data.restTime || null;
        this.restTimeTarget = data.restTimeTarget || null;
    }

    get rirString(): string {
        return this.rir === null ? "-/-" : this.rir.toString();
    }
}


export class WorkoutLogAdapter implements Adapter<WorkoutLog> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fromJson = (item: any) =>
        new WorkoutLog({
            id: item.id,
            date: item.date, // Pass the date string directly
            iteration: item.iteration,
            exerciseId: item.exercise,
            slotEntryId: item.slot_entry,
            sessionId: item.session,
            routineId: item.routine,

            repetitionsUnitId: item.repetitions_unit,
            repetitions: item.repetitions === null ? null : Number.parseFloat(item.repetitions),
            repetitionsTarget: item.repetitions_target === null ? null : Number.parseFloat(item.repetitions_target),

            weightUnitId: item.weight_unit,
            weight: item.weight === null ? null : Number.parseFloat(item.weight),
            weightTarget: item.weight_target === null ? null : Number.parseFloat(item.weight_target),

            rir: item.rir === null ? null : Number.parseFloat(item.rir),
            rirTarget: item.rir_target === null ? null : Number.parseFloat(item.rir_target),

            restTime: item.rest,
            restTimeTarget: item.rest_target
        });

    toJson = (item: WorkoutLog) => ({
        id: item.id,
        iteration: item.iteration,
        date: item.date.toISOString(),
        slot_entry: item.slotEntryId,
        exercise: item.exerciseId,
        routine: item.routineId,

        repetitions_unit: item.repetitionUnitId,
        repetitions: item.repetitions,
        repetitions_target: item.repetitionsTarget,

        weight_unit: item.weightUnitId,
        weight: item.weight,
        weight_target: item.weightTarget,

        rir: item.rir,
        rir_target: item.rirTarget,

        rest: item.restTime,
        rest_target: item.restTimeTarget
    });
}