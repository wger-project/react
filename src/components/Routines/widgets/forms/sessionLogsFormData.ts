import { Routine } from "@/components/Routines/models/Routine";
import { LogEntryForm } from "@/components/Routines/models/WorkoutLog";
import { DateTime } from "luxon";

export interface SessionLogsFormValues {
    logs: LogEntryForm[],
}

/**
 * One log per planned set of the day. Where the routine has an iteration for
 * the date, the logs carry its values as targets; otherwise the current
 * iteration's sets are offered empty and the iteration stays null.
 */
export function plannedLogs(routine: Routine, dayId: number, date: Date): {
    logs: LogEntryForm[],
    iteration: number | null,
} {
    const iterationDayData = routine.getDayData(dayId, date) ?? [];
    const hasNoIterationData = iterationDayData.length === 0;
    const dayDataList = hasNoIterationData
        ? routine.dayDataCurrentIteration.filter(dayData => dayData.day?.id === dayId)
        : iterationDayData;

    const logs: LogEntryForm[] = [];
    for (const dayData of dayDataList) {
        for (const slot of dayData.slots) {
            for (const config of slot.setConfigs) {
                for (let i = 0; i < config.nrOfSets; i++) {

                    logs.push({
                        clientKey: `${dayData.iteration}-${config.slotEntryId}-${config.exerciseId}-${i}`,
                        exercise: config.exercise!,
                        repetitionsUnit: config.repetitionsUnit!,
                        weightUnit: config.weightUnit!,
                        slotEntry: config.slotEntryId,

                        rir: !hasNoIterationData && config.rir !== null ? config.rir : '',
                        rirTarget: !hasNoIterationData && config.rir !== null ? config.rir : '',
                        repetitions: !hasNoIterationData && config.repetitions !== null ? config.repetitions : '',
                        repetitionsTarget: !hasNoIterationData && config.repetitions !== null ? config.repetitions : '',
                        weight: !hasNoIterationData && config.weight !== null ? config.weight : '',
                        weightTarget: !hasNoIterationData && config.weight !== null ? config.weight : ''
                    });
                }
            }
        }
    }

    return { logs, iteration: hasNoIterationData ? null : iterationDayData[0].iteration };
}

interface PayloadContext {
    date: DateTime,
    sessionId: string | null | undefined,
    iteration: number | null,
    dayId: number,
    routineId: number,
}

/** The logs the user filled in, as the server takes them; untouched sets are left out */
export function logsPayload(logs: LogEntryForm[], { date, sessionId, iteration, dayId, routineId }: PayloadContext) {
    return logs
        .filter(l => l.rir !== '' || l.repetitions !== '' || l.weight !== '')
        .map(l => ({
                date: date.toISO(),
                session: sessionId,
                iteration: iteration,
                exercise: l.exercise?.id,
                day: dayId,
                routine: routineId,
                // eslint-disable-next-line camelcase
                slot_entry: l.slotEntry,

                rir: l.rir !== '' ? l.rir : null,
                // eslint-disable-next-line camelcase
                rir_target: l.rirTarget !== '' ? l.rirTarget : null,

                // eslint-disable-next-line camelcase
                repetitions_unit: l.repetitionsUnit?.id,
                repetitions: l.repetitions !== '' ? l.repetitions : null,
                // eslint-disable-next-line camelcase
                repetitions_target: l.repetitionsTarget !== '' ? l.repetitionsTarget : null,

                // eslint-disable-next-line camelcase
                weight_unit: l.weightUnit?.id,
                weight: l.weight !== '' ? l.weight : null,
                // eslint-disable-next-line camelcase
                weight_target: l.weightTarget !== '' ? l.weightTarget : null,
            }
        ));
}
