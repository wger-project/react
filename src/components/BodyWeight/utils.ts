import { WeightEntry } from "components/BodyWeight/model";

export const processWeight = (weights: WeightEntry[]) => {
    // go through weights, referencing the same weights to have days and weight changes
    const processedWeights = weights.map((entry, i) => {

        const dayDiff = Math.abs(entry.date.getTime() - entry.date.getTime()) / (1000 * 60 * 60 * 24);

        // since there is no day before day 1, changes are 0
        if (i === 0) {
            return {
                entry,
                change: 0,
                days: dayDiff
            };
        }

        return {
            entry,
            change: weights[i].weight - weights[i - 1].weight,
            days: dayDiff
        };
    });

    return processedWeights;
};