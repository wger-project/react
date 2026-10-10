import { loadAnalyticsRange, saveAnalyticsRange } from "./analyticsRange";

afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.removeItem('wgerAnalyticsRange');
});

test('uses one year for missing or invalid saved preferences', () => {
    expect(loadAnalyticsRange()).toBe('lastYear');
    window.localStorage.setItem('wgerAnalyticsRange', 'invalid');
    expect(loadAnalyticsRange()).toBe('lastYear');
});

test('restores a saved range without changing the measurements preference', () => {
    const measurementsRange = window.localStorage.getItem('wgerChartRange');
    saveAnalyticsRange('lastWeek');
    expect(loadAnalyticsRange()).toBe('lastWeek');
    expect(window.localStorage.getItem('wgerChartRange')).toBe(measurementsRange);
});

test('continues with the default when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(loadAnalyticsRange()).toBe('lastYear');
    expect(() => saveAnalyticsRange('all')).not.toThrow();
});
