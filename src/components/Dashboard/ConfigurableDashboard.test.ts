import { AVAILABLE_WIDGETS, loadDashboardState, } from './ConfigurableDashboard';

describe('loadDashboardState migration', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('filters unknown ids and falls back to all widgets when none valid', () => {
        // Arrange
        const data = {
            "version": 1,
            "selectedWidgetIds": ["foo"],
            "layouts": {
                "lg": [
                    { "i": "foo", "w": 4, "h": 5, "x": 0, "y": 0, "minW": 3, "minH": 2 },
                ],
                "md": [],
                "sm": [],
                "xs": []
            },
        };
        localStorage.setItem('dashboard-state', JSON.stringify(data));

        // Act
        const res = loadDashboardState();

        // Assert
        expect(res).not.toBeNull();
        const allowed = AVAILABLE_WIDGETS.map((w) => w.id).slice().sort();
        expect(res!.selectedWidgetIds.slice().sort()).toEqual(allowed);
    });

    test('removes unknown IDs', () => {
        // Arrange
        const data = {
            "version": 1,
            "selectedWidgetIds": ["routine", "foo"],
            "layouts": {
                "lg": [
                    { "i": "routine", "w": 4, "h": 5, "x": 0, "y": 0, "minW": 3, "minH": 2 },
                    { "i": "foo", "w": 4, "h": 5, "x": 0, "y": 0, "minW": 3, "minH": 2 },
                ],
                "md": [],
                "sm": [],
                "xs": []
            }
        };
        localStorage.setItem('dashboard-state', JSON.stringify(data));

        // Act
        const res = loadDashboardState();

        // Assert
        expect(res).not.toBeNull();
        expect(res!.selectedWidgetIds).toEqual(['routine']);
        expect(res!.layouts!.lg.length).toEqual(1);
        expect(res!.layouts!.lg[0].i).toEqual('routine');
    });

    test('migrates old top-level structure', () => {
        // Arrange
        const oldData = {
            lg: [{ i: 'routine', x: 0, y: 0, w: 4, h: 5 }, { i: 'weight', x: 4, y: 0, w: 4, h: 5 }],
            md: [],
            sm: []
        };
        localStorage.setItem('dashboard-state', JSON.stringify(oldData));

        // Act
        const res = loadDashboardState();

        // Assert
        expect(res).not.toBeNull();
        expect(res!.version).toBe(1);
        // selectedWidgetIds should contain the extracted ids
        expect(res!.selectedWidgetIds).toEqual(expect.arrayContaining(['routine', 'weight']));

        const savedRaw = localStorage.getItem('dashboard-state');
        expect(savedRaw).not.toBeNull();
        const saved = JSON.parse(savedRaw!);
        expect(saved.version).toBe(1);
        expect(Array.isArray(saved.selectedWidgetIds)).toBe(true);
        expect(saved.selectedWidgetIds).toEqual(expect.arrayContaining(['routine', 'weight']));
        expect(saved.layouts).toBeDefined();
        expect(Array.isArray(saved.layouts.lg)).toBe(true);
        expect(saved.layouts.lg.length).toBe(2);
    });
});

