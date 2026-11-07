import { act, renderHook } from '@testing-library/react';
import { DEFAULT_CHART_RANGE } from "@/components/Measurements/charts/range";
import { loadChartRange, resetChartRange, setChartRange, useChartRange } from "./chartRange";

describe('chartRange store', () => {

    afterEach(() => {
        resetChartRange();
    });

    test('starts at the default the screens used to seed themselves with', () => {
        const { result } = renderHook(() => useChartRange());

        expect(result.current).toBe(DEFAULT_CHART_RANGE);
    });

    test('a pick is what every watcher reads afterwards', () => {
        // Two hooks stand in for two screens: the overview and the detail
        // reached from it read the same store
        const first = renderHook(() => useChartRange());
        const second = renderHook(() => useChartRange());

        act(() => setChartRange('lastWeek'));

        expect(first.result.current).toBe('lastWeek');
        expect(second.result.current).toBe('lastWeek');
    });

    test('a pick is persisted, so the next page load starts from it', () => {
        // Deliberately not the default, or the test would pass without storing
        act(() => setChartRange('lastYear'));

        // What the module reads when a full page load re-imports it
        expect(loadChartRange()).toBe('lastYear');
    });

    test('a stored value this release does not know falls back to the default', () => {
        window.localStorage.setItem('wgerChartRange', 'lastDecade');

        expect(loadChartRange()).toBe(DEFAULT_CHART_RANGE);
    });
});
