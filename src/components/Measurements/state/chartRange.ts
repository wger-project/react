import { useSyncExternalStore } from 'react';

import { CHART_RANGES, ChartRange, DEFAULT_CHART_RANGE } from "@/components/Measurements/charts/range";

/**
 * The chart range shared by the measurement screens (category overview,
 * category detail, body weight): a pick follows the user through them
 * instead of every screen starting over at its own default. The counterpart
 * of the flutter app's ChartRangeSetting provider.
 *
 * Backed by localStorage, not just module state: embedded in Django pages,
 * every navigation is a full page load that starts the components over, so
 * memory alone would forget the pick right when it matters.
 */
const STORAGE_KEY = 'wgerChartRange';

/**
 * The stored pick, or the default: a value this release does not know (or a
 * blocked storage) must never break the screens over a display preference.
 */
export const loadChartRange = (): ChartRange => {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);

        return (CHART_RANGES as readonly string[]).includes(stored ?? '')
            ? stored as ChartRange
            : DEFAULT_CHART_RANGE;
    } catch {
        return DEFAULT_CHART_RANGE;
    }
};

let currentRange: ChartRange = loadChartRange();
const listeners = new Set<() => void>();

export const setChartRange = (range: ChartRange) => {
    currentRange = range;
    try {
        window.localStorage.setItem(STORAGE_KEY, range);
    } catch {
        // Storage full or blocked: the pick still applies for this page load
    }
    listeners.forEach(listener => listener());
};

/** Back to the default, so one test's pick does not leak into the next */
export const resetChartRange = () => {
    try {
        window.localStorage.removeItem(STORAGE_KEY);
    } catch {
        // See setChartRange
    }
    currentRange = DEFAULT_CHART_RANGE;
    listeners.forEach(listener => listener());
};

const subscribe = (listener: () => void) => {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
};

export const useChartRange = (): ChartRange => useSyncExternalStore(subscribe, () => currentRange);
