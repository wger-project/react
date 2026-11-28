import { MeasurementValueCount } from "@/components/Measurements/models/Bucket";
import { convertStoredValue } from "@/core/lib/weightUnit";

/**
 * Fewest values a distribution says anything about: below this a histogram is
 * noise with gaps, and the chart falls back to the derived default. Same
 * principle as a group whose readings are all unpaired falling back to lines:
 * never an empty or misleading card.
 */
export const DISTRIBUTION_MIN_VALUES = 15;

/**
 * Widest a histogram gets, in bins. A single outlier (a lb reading stored into
 * a kg category) would otherwise stretch a fixed-width histogram into hundreds
 * of near-empty bins.
 */
const DISTRIBUTION_MAX_BINS = 100;

/**
 * A bin width for values nothing is known about: the span split into
 * targetBins, rounded up to 1, 2 or 5 times a power of ten so the edges land
 * on round numbers. For the typed metrics the maintained widths in binWidthFor
 * are used instead.
 */
export const niceBinWidth = (min: number, max: number, targetBins: number = 20): number => {
    const span = max - min;
    if (span <= 0) {
        return 1;
    }

    const raw = span / targetBins;
    const magnitude = Math.pow(10, Math.floor(Math.log10(raw)));
    const normalized = raw / magnitude;

    return (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) * magnitude;
};

/**
 * A distribution: the values of a period binned by size instead of plotted
 * over time, which is what shows the spread and the outliers.
 */
export interface Histogram {
    /**
     * Lower edge of the first bin, a multiple of binWidth so the edges land on
     * round numbers (60-62, not 59.3-61.3)
     */
    firstEdge: number;
    binWidth: number;
    /**
     * How many values each bin holds. Bins between the occupied ones are
     * present with a zero: a gap in the distribution is worth seeing.
     */
    counts: number[];
    /** Median of the binned values */
    median: number;
    /** The newest value, i.e. where in the distribution the user is today */
    latest: number;
}

/**
 * Bins the points into a histogram of binWidth-wide bins aligned to round
 * boundaries; without a width (free-form categories) one is derived from the
 * span, see niceBinWidth.
 *
 * What one value stands for (a reading, a daily total) is the caller's
 * decision, the same split as for the heatmap: the summed types distribute
 * their days, the sample types every reading.
 */
export const buildHistogram = (
    values: ValueCount[],
    latest: number,
    binWidth?: number,
): Histogram => {
    const sorted = [...values].sort((a, b) => a.value - b.value);
    const minValue = sorted[0].value;
    const maxValue = sorted[sorted.length - 1].value;

    let width = binWidth ?? niceBinWidth(minValue, maxValue);
    // Doubling keeps the edges round, unlike recomputing a fitted width
    while (Math.floor(maxValue / width) - Math.floor(minValue / width) >= DISTRIBUTION_MAX_BINS) {
        width *= 2;
    }

    const firstBin = Math.floor(minValue / width);
    const counts = new Array<number>(Math.floor(maxValue / width) - firstBin + 1).fill(0);
    for (const entry of sorted) {
        counts[Math.floor(entry.value / width) - firstBin] += entry.count;
    }

    return {
        firstEdge: firstBin * width,
        binWidth: width,
        counts: counts,
        median: weightedMedian(sorted),
        latest: latest,
    };
};

/** One value and how often it occurred, which is what a histogram bins */
export interface ValueCount {
    value: number;
    count: number;
}

/** The middle value, counting each one as often as it occurred */
const weightedMedian = (sorted: ValueCount[]): number => {
    const total = sorted.reduce((sum, entry) => sum + entry.count, 0);
    const at = (index: number) => {
        let seen = 0;
        for (const entry of sorted) {
            seen += entry.count;
            if (index < seen) {
                return entry.value;
            }
        }
        return sorted[sorted.length - 1].value;
    };

    const first = at(Math.floor((total - 1) / 2));

    return total % 2 === 1 ? first : (first + at(Math.floor(total / 2))) / 2;
};

/**
 * The counted values of a category in the target unit, and where the user
 * stands today.
 *
 * Values are counted per unit they were entered in, so each goes through the
 * conversion helper before equal ones are added up.
 */
export const valueHistogram = (
    counts: MeasurementValueCount[],
    targetUnit: string,
    categoryUnit: string,
): { values: ValueCount[], latest: number } => {
    const convert = (value: number, from: string | null) =>
        convertStoredValue(value, from, categoryUnit, targetUnit);

    const merged = new Map<number, number>();
    for (const count of counts) {
        const value = convert(count.value, count.unit);
        merged.set(value, (merged.get(value) ?? 0) + count.count);
    }

    const newest = counts.reduce(
        (a, b) => b.newest > a.newest ? b : a,
        counts[0],
    );

    return {
        values: [...merged.entries()].map(([value, count]) => ({ value: value, count: count })),
        latest: newest === undefined ? 0 : convert(newest.value, newest.unit),
    };
};
