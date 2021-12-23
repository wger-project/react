import { BodyWeightType } from "../../types";

export const processWeight = (weights: BodyWeightType[]) => {
    const weightsWithDateObject = weights.map(weight => {        
        return {
            ...weight,
            date: new Date(weight.date),
            weight: parseInt(weight.weight),
        };
    });    

    // go through weights, referencing the same weights to have days and weight changes
    const processedWeights = weightsWithDateObject.map((weight, i) => {        
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
            change: weightsWithDateObject[i].weight - weightsWithDateObject[i-1].weight,
            days: Math.abs(weight.date.getTime() - weightsWithDateObject[i-1].date.getTime()) / (1000 * 60 * 60 * 24)
        };
    });

    // sort array based on date to display from recent to oldest
    processedWeights.sort((a, b) => {        
        return a.date.getTime() > b.date.getTime() ? -1 : b.date.getTime() > a.date.getTime() ? 1 : 0;
    });

    return processedWeights;
};