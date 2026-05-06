export interface WeightDataPoint {
    date: number;
    weight: number;
}

export interface EMADataPoint extends WeightDataPoint {
    ema: number;
}

/**
 * Exponentially weighted moving average over a chronologically ordered series.
 * Smoothing factor is 2 / (period + 1) — e.g. period=10 gives ~0.18.
 */
export const calculateEMA = <T extends WeightDataPoint>(
    weights: T[],
    period: number = 10,
): (T & { ema: number })[] => {
    if (weights.length === 0) {
        return [];
    }

    const smoothing = 2 / (period + 1);
    let ema = weights[0].weight;

    return weights.map((point, i) => {
        if (i > 0) {
            ema = point.weight * smoothing + ema * (1 - smoothing);
        }
        return { ...point, ema };
    });
};
