import { WeightEntry } from "components/BodyWeight/model";

export const processWeight = (weights: WeightEntry[]) => {
    // go through weights, referencing the same weights to have days and weight changes
    const processedWeights = weights.map((weight, i) => {
        // since there is no day before day 1, changes are 0
        if (i === 0) {
            return {
                ...weight,
                change: 0,
                days: Math.abs(weight.date.getTime() - weight.date.getTime()) / (1000 * 60 * 60 * 24)
            };
        }

        return {
            ...weight,
            change: weights[i].weight - weights[i - 1].weight,
            days: Math.abs(weight.date.getTime() - weights[i - 1].date.getTime()) / (1000 * 60 * 60 * 24)
        };
    });

    // sort array based on date to display from recent to oldest
    processedWeights.sort((a, b) => {
        return a.date.getTime() > b.date.getTime() ? -1 : b.date.getTime() > a.date.getTime() ? 1 : 0;
    });

    return processedWeights;
};