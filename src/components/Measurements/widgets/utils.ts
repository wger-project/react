import { MeasurementEntry } from "components/Measurements/models/Entry";

/**
 * Taken from processWeights in BodyWeight/utils, but adapted to work with MeasurementEntry instead of WeightEntry.
 * Sorts measurements by date (newest first) and computes the difference to
 * the previous entry ("change"), number of days since the previous entry ("days"),
 * as well as the cumulative change relative to the first entry ("totalChange").
 */
export const processEntries = (measurements: MeasurementEntry[]) => {
    if (measurements.length === 0) {
        return [];
    }

    const sorted = [...measurements].sort((a, b) => b.date.getTime() - a.date.getTime());
    const lastIndex = sorted.length - 1;
    const firstWeight = sorted[lastIndex].value;

    return sorted.map((entry, index) => ({
        entry,
        change: index === lastIndex ? 0 : entry.value - sorted[index + 1].value,
        days: index === lastIndex ? 0 : (entry.date.getTime() - sorted[index + 1].date.getTime()) / (1000 * 60 * 60 * 24),
        totalChange: entry.value - firstWeight
    }));
};