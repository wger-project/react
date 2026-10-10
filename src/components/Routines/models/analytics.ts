import { ChartRange, cutoffFor } from "@/components/Measurements";
import { WorkoutLog } from "@/components/Routines/models/WorkoutLog";
import { KG_PER_LB } from "@/core/lib/weightUnit";
import { WEIGHT_UNIT_KG, WEIGHT_UNIT_LB } from "@/core/lib/consts";
import { DAY_MS } from "@/core/lib/date";

export type AnalyticsMetric = 'weight' | 'volume' | 'reps';
export type AnalyticsUnit = 'kg' | 'kgReps' | 'reps' | 'seconds';
export type AnalyticsFilter = { exerciseId: number | null, muscleId: number | null };
export type AnalyticsDateFilter = { date__gte?: string, date__lt?: string };

export interface AnalyticsSeries {
    key: string;
    exerciseId: number | null;
    unit: AnalyticsUnit;
    points: { date: number, value: number }[];
}

/** Whole local days, including today. An exclusive end avoids cutting off today's logs at midnight. */
export const analyticsDateFilter = (range: ChartRange, now = new Date()): AnalyticsDateFilter => {
    const cutoff = cutoffFor(range, now);
    if (cutoff === null) {
        return {};
    }
    // Reuse the measurement ranges, but subtract calendar days rather than
    // hours so a daylight-saving transition cannot change the boundary.
    const days = Math.round((now.getTime() - cutoff.getTime()) / DAY_MS);
    return {
        'date__gte': new Date(now.getFullYear(), now.getMonth(), now.getDate() - days).toISOString(),
        'date__lt': new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString(),
    };
};

export const matchesAnalyticsFilter = (log: WorkoutLog, filter: AnalyticsFilter): boolean => {
    if (filter.exerciseId !== null && log.exerciseId !== filter.exerciseId) {
        return false;
    }
    return filter.muscleId === null || [
        ...log.exerciseObj?.muscles ?? [],
        ...log.exerciseObj?.musclesSecondary ?? [],
    ].some(muscle => muscle.id === filter.muscleId);
};

const finite = (value: number | null): value is number => value !== null && Number.isFinite(value);

/** kg/lb are comparable; plates, speed and body weight are not external kilograms. */
const weightInKg = (log: WorkoutLog): number | null => {
    if (!finite(log.weight)) {
        return null;
    }
    if (log.weightUnitId === WEIGHT_UNIT_KG) {
        return log.weight;
    }
    return log.weightUnitId === WEIGHT_UNIT_LB ? log.weight * KG_PER_LB : null;
};

const valueFor = (log: WorkoutLog, metric: AnalyticsMetric): { value: number, unit: AnalyticsUnit } | null => {
    const weight = weightInKg(log);
    if (metric === 'weight') {
        return weight === null ? null : { value: weight, unit: 'kg' };
    }
    if (!finite(log.repetitions) || log.repetitions < 0) {
        return null;
    }

    const unit = log.repetitionUnitObj;
    const type = unit?.unitType;
    if (metric === 'reps') {
        return type === 'REPETITIONS' ? { value: log.repetitions, unit: 'reps' } : null;
    }
    // A hold is duration, never repetitions. Keep it separate from kg × reps.
    if (type === 'TIME') {
        const multiplier = unit?.multiplier;
        if (multiplier === null || multiplier === undefined) {
            return null;
        }
        const seconds = log.repetitions * multiplier;
        return Number.isFinite(seconds) && multiplier > 0 ? { value: seconds, unit: 'seconds' } : null;
    }
    if (type !== 'REPETITIONS') {
        return null;
    }
    if (weight !== null && weight > 0) {
        return { value: weight * log.repetitions, unit: 'kgReps' };
    }
    // Zero/missing external weight or the explicit Body Weight unit: count
    // repetitions. Unknown units and negative assistance are not weighted volume.
    if (log.weightUnitId === 3 || ((log.weight === null || log.weight === 0)
        && [null, WEIGHT_UNIT_KG, WEIGHT_UNIT_LB].includes(log.weightUnitId))) {
        return { value: log.repetitions, unit: 'reps' };
    }
    return null;
};

/**
 * Daily maxima for weight, daily sums for reps/volume, across every routine.
 * A muscle selection combines its exercises once (primary OR secondary).
 * Otherwise each exercise keeps its own series. Units always stay separate.
 */
export const aggregateAnalytics = (
    logs: WorkoutLog[], metric: AnalyticsMetric, filter: AnalyticsFilter,
): { series: AnalyticsSeries[], skipped: number } => {
    const groups = new Map<string, { exerciseId: number | null, unit: AnalyticsUnit, days: Map<number, number> }>();
    const seen = new Set<string>();
    let skipped = 0;

    for (const log of logs) {
        if (seen.has(log.id) || !matchesAnalyticsFilter(log, filter)) {
            continue;
        }
        seen.add(log.id);
        const entry = valueFor(log, metric);
        if (entry === null || !Number.isFinite(entry.value) || !Number.isFinite(log.date.getTime())) {
            skipped++;
            continue;
        }
        const exerciseId = filter.muscleId !== null && filter.exerciseId === null ? null : log.exerciseId;
        const key = `${exerciseId ?? 'muscle'}-${entry.unit}`;
        if (!groups.has(key)) {
            groups.set(key, { exerciseId, unit: entry.unit, days: new Map() });
        }
        const group = groups.get(key)!;
        const day = new Date(log.date.getFullYear(), log.date.getMonth(), log.date.getDate()).getTime();
        const previous = group.days.get(day);
        group.days.set(day, metric === 'weight'
            ? Math.max(previous ?? -Infinity, entry.value)
            : (previous ?? 0) + entry.value);
    }
    return {
        skipped,
        series: Array.from(groups, ([key, group]) => ({
            key,
            exerciseId: group.exerciseId,
            unit: group.unit,
            points: Array.from(group.days, ([date, value]) => ({ date, value })).sort((a, b) => a.date - b.date),
        })).sort((a, b) => a.key.localeCompare(b.key)),
    };
};
