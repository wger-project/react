import { WeightEntry } from "components/BodyWeight/model";

export const processWeight = (weights: WeightEntry[]) => {
    // go through weights, referencing the same weights to have days and weight changes
    const processedWeights = weights.map((entry, i) => {

        // since there is no day before day 1, changes are 0
        if (i === 0) {
            return {
                entry,
                change: 0,
                days: Math.abs(entry.date.getTime() - entry.date.getTime()) / (1000 * 60 * 60 * 24)
            };
        }

        return {
            entry,
            change: weights[i].weight - weights[i - 1].weight,
            days: Math.abs(entry.date.getTime() - weights[i - 1].date.getTime()) / (1000 * 60 * 60 * 24)
        };
    });

    return processedWeights;
};