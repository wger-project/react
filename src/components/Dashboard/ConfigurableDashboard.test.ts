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
        expect(res!.selectedWidgetIds).not.toContain('foo');
        expect(res!.selectedWidgetIds).toContain('routine');
        const lg = res?.layouts?.lg ?? [];
        expect(lg.length).toEqual(1);
        expect(lg[0]?.i).toEqual('routine');
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

    test('adds newly available widgets to selected when they are neither selected nor hidden', () => {
        // Arrange: saved state has 'routine' selected and 'nutrition' hidden, other widgets are missing
        const data = {
            version: 1,
            selectedWidgetIds: ['routine'],
            hiddenWidgetIds: ['nutrition'],
            layouts: {
                lg: [
                    { i: 'routine', w: 4, h: 5, x: 0, y: 0, minW: 3, minH: 2 }
                ],
                md: [],
                sm: [],
                xs: []
            }
        };
        localStorage.setItem('dashboard-state', JSON.stringify(data));

        // Act
        const res = loadDashboardState();

        // Assert
        expect(res).not.toBeNull();
        expect(res!.hiddenWidgetIds).toEqual(['nutrition']);
        expect(res!.selectedWidgetIds).toEqual(expect.arrayContaining(['routine']));
        const expectedSelected = AVAILABLE_WIDGETS.map((w) => w.id).filter((id) => id !== 'nutrition');
        expectedSelected.forEach((id) => {
            expect(res!.selectedWidgetIds).toEqual(expect.arrayContaining([id]));
        });

        // And the persisted state should also include the newly added widgets
        const savedRaw = localStorage.getItem('dashboard-state');
        expect(savedRaw).not.toBeNull();
        const saved = JSON.parse(savedRaw!);
        expectedSelected.forEach((id) => {
            expect(saved.selectedWidgetIds).toEqual(expect.arrayContaining([id]));
        });
        expect(saved.hiddenWidgetIds).toEqual(expect.arrayContaining(['nutrition']));
    });

    test('returns null when nothing was saved yet', () => {
        expect(loadDashboardState()).toBeNull();
    });

    test('returns null instead of throwing on corrupt data', () => {
        // Arrange
        localStorage.setItem('dashboard-state', '{not json');
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {
        });

        // Act
        const res = loadDashboardState();

        // Assert
        expect(res).toBeNull();
        expect(consoleError).toHaveBeenCalled();
        consoleError.mockRestore();
    });

    test('survives a saved state without layouts', () => {
        // Arrange
        // The layouts are rebuilt from the defaults, the widget selection must survive
        localStorage.setItem('dashboard-state', JSON.stringify({
            version: 1,
            selectedWidgetIds: ['routine'],
            hiddenWidgetIds: [],
            layouts: null,
        }));
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {
        });

        // Act
        const res = loadDashboardState();

        // Assert
        expect(res).not.toBeNull();
        expect(res!.selectedWidgetIds).toContain('routine');
        consoleError.mockRestore();
    });

    test('keeps the widgets the user explicitly hid', () => {
        // Arrange
        localStorage.setItem('dashboard-state', JSON.stringify({
            version: 1,
            selectedWidgetIds: [],
            hiddenWidgetIds: ['nutrition'],
            layouts: { lg: [], md: [], sm: [], xs: [] },
        }));

        // Act
        const res = loadDashboardState();

        // Assert
        // An empty selection falls back to everything, except what was hidden
        expect(res!.selectedWidgetIds).not.toContain('nutrition');
        expect(res!.selectedWidgetIds.length).toBe(AVAILABLE_WIDGETS.length - 1);
        expect(res!.hiddenWidgetIds).toEqual(['nutrition']);
    });
});
