/**
 * Sorts entries by date (newest first) and computes the difference to
 * the previous entry ("change"), number of days since the previous entry ("days"),
 * as well as the cumulative change relative to the first entry ("totalChange").
 */
export const processTimeSeries = <T extends { date: Date }>(
    entries: T[],
    getValue: (entry: T) => number,
) => {
    if (entries.length === 0) {
        return [];
    }

    const sorted = [...entries].sort((a, b) => b.date.getTime() - a.date.getTime());
    const lastIndex = sorted.length - 1;
    const firstValue = getValue(sorted[lastIndex]);

    return sorted.map((entry, index) => ({
        entry,
        change: index === lastIndex ? 0 : getValue(entry) - getValue(sorted[index + 1]),
        days: index === lastIndex ? 0 : (entry.date.getTime() - sorted[index + 1].date.getTime()) / (1000 * 60 * 60 * 24),
        totalChange: getValue(entry) - firstValue,
    }));
};
