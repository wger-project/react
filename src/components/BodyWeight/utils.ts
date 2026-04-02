import { WeightEntry } from "components/BodyWeight/model";

export const processWeight = (weights: WeightEntry[]) => {
    const sorted = [...weights].sort((a, b) => a.date.getTime() - b.date.getTime());
    // get first weight as reference for changes, if there are no weights, use 0 as reference
    const firstWeight = sorted.length > 0 ? sorted[0].weight : 0;

    // go through weights, referencing the same weights to have days and weight changes
    return sorted.map((entry, i) => {

        // since there is no day before day 1, changes are 0
        if (i === 0) {
            return {
                entry,
                change: 0,
                days: Math.abs(entry.date.getTime() - entry.date.getTime()) / (1000 * 60 * 60 * 24),
                totalChange: 0
            };
        }

        return {
            entry,
            change: sorted[i].weight - sorted[i - 1].weight,
            days: Math.abs(entry.date.getTime() - sorted[i - 1].date.getTime()) / (1000 * 60 * 60 * 24),
            totalChange: sorted[i].weight - firstWeight
        };
    });
};