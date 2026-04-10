import { WeightEntry } from "components/BodyWeight/model";

/**
 * Sorts weight entries by date (newest first) and computes the difference to
 * the previous entry ("change"), number of days since the previous entry ("days"),
 * as well as the cumulative change relative to the first entry ("totalChange").
 */
export const processWeights = (weights: WeightEntry[]) => {
    if (weights.length === 0) {
        return [];
    }

    const sorted = [...weights].sort((a, b) => b.date.getTime() - a.date.getTime());
    const lastIndex = sorted.length - 1;
    const firstWeight = sorted[lastIndex].weight;

    return sorted.map((entry, index) => ({
        entry,
        change: index === lastIndex ? 0 : entry.weight - sorted[index + 1].weight,
        days: index === lastIndex ? 0 : (entry.date.getTime() - sorted[index + 1].date.getTime()) / (1000 * 60 * 60 * 24),
        totalChange: entry.weight - firstWeight
    }));
};