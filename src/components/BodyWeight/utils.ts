import { BodyWeightType } from "../../types"

export const process_weight = (weights: BodyWeightType[]) => {
    const weights_with_date_object = weights.map(weight => {        
        return {
            ...weight,
            date: new Date(weight.date),
            weight: parseInt(weight.weight),
        }
    })    

    // go through weights, referencing the same weights to have days and weight changes
    const processed_weights = weights_with_date_object.map((weight, i) => {        
        // since there is no day before day 1, changes are 0
        if (i === 0) {
            return {
                ...weight,
                change: 0,
                days: Math.abs(weight.date.getTime() - weight.date.getTime()) / (1000 * 60 * 60 * 24)
            }
        }
        
        return {
            ...weight,
            change: weights_with_date_object[i].weight - weights_with_date_object[i-1].weight,
            days: Math.abs(weight.date.getTime() - weights_with_date_object[i-1].date.getTime()) / (1000 * 60 * 60 * 24)
        }
    })

    // sort array based on date to display from recent to oldest
    processed_weights.sort((a, b) => {        
        return a.date.getTime() > b.date.getTime() ? -1 : b.date.getTime() > a.date.getTime() ? 1 : 0;
    })

    return processed_weights;
}