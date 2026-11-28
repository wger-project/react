export interface TimeSeriesPoint {
    date: number;
}

/**
 * Exponentially weighted moving average over a chronologically ordered series.
 * Smoothing factor is 2 / (period + 1), e.g. period=10 gives ~0.18.
 */
export const calculateEMA = <T extends TimeSeriesPoint>(
    points: T[],
    getValue: (point: T) => number,
    period: number = 10,
): (T & { ema: number })[] => {
    if (points.length === 0) {
        return [];
    }

    const smoothing = 2 / (period + 1);
    let ema = getValue(points[0]);

    return points.map((point, i) => {
        if (i > 0) {
            ema = getValue(point) * smoothing + ema * (1 - smoothing);
        }
        return { ...point, ema };
    });
};
