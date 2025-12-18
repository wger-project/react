import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import DoneIcon from '@mui/icons-material/Done';
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import RuleIcon from '@mui/icons-material/Rule';
import { Box, Button, IconButton, ListItemText, Menu, MenuItem, Switch, Tooltip } from "@mui/material";
import { CalendarCard } from "components/Dashboard/CalendarCard";
import { MeasurementCard } from "components/Dashboard/MeasurementCard";
import { NutritionCard } from "components/Dashboard/NutritionCard";
import { RoutineCard } from "components/Dashboard/RoutineCard";
import { WeightCard } from "components/Dashboard/WeightCard";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Layout, Layouts, Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useTranslation } from "react-i18next";

const ResponsiveGridLayout = WidthProvider(Responsive);

const DASHBOARD_STORAGE_KEY = "dashboard-state";

const VERSION = 1;

type DashboardState = {
    version: number;
    selectedWidgetIds: string[];
    layouts: Layouts | null;
};

const BREAKPOINTS = ['lg', 'md', 'sm', 'xs'] as const;

// Define widget types for extensibility
export type WidgetType = "routine" | "nutrition" | "weight" | "calendar" | "measurement";

export interface WidgetConfig {
    id: string;
    type: WidgetType;
    component: React.ComponentType;
    translationKey: string; // key for i18n translations
    defaultLayout: {
        w: number;
        h: number;
        x: number;
        y: number;
        minW?: number;
        minH?: number;
    };
}

// Widget registry - easy to add new widgets in the future
export const AVAILABLE_WIDGETS: WidgetConfig[] = [
    {
        id: "routine",
        type: "routine",
        component: RoutineCard,
        translationKey: 'routines.routine',
        defaultLayout: { w: 4, h: 5, x: 0, y: 0, minW: 3, minH: 2 },
    },
    {
        id: "nutrition",
        type: "nutrition",
        component: NutritionCard,
        translationKey: 'nutritionalPlan',
        defaultLayout: { w: 4, h: 5, x: 4, y: 0, minW: 3, minH: 2 },
    },
    {
        id: "weight",
        type: "weight",
        component: WeightCard,
        translationKey: 'weight',
        defaultLayout: { w: 4, h: 5, x: 8, y: 0, minW: 3, minH: 2 },
    },
    {
        id: "calendar",
        type: "calendar",
        component: CalendarCard,
        translationKey: 'calendar',
        defaultLayout: { w: 8, h: 4, x: 0, y: 1, minW: 3, minH: 2 },
    },
    {
        id: "measurement",
        type: "measurement",
        component: MeasurementCard,
        translationKey: 'measurements.measurements',
        defaultLayout: { w: 4, h: 4, x: 8, y: 1, minW: 3, minH: 2 },
    },
];

/*
 * Load dashboard state from local storage, with migration support for older formats.
 * Returns null if no saved state exists.
 */
export const loadDashboardState = (): DashboardState | null => {
    try {
        const raw = localStorage.getItem(DASHBOARD_STORAGE_KEY);
        if (raw === null) {
            return null;
        }

        let out: DashboardState | null = null;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parsedAny = JSON.parse(raw) as any;

        // If version is not present -> treat as old format and migrate
        //TODO: Once some time has passed, this can be removed after some time, e.g. after 2026-01-31.
        if (typeof parsedAny.version === 'undefined') {
            out = migrateOldDashboardState(parsedAny);
            saveDashboardState(out);
        }

        // For future migrations, e.g.:
        // if (parsedAny.version === 1) {
        //     Note that here we should add widget defaults when new ones are added to AVAILABLE_WIDGETS
        //     in future versions
        //     out = migrateFromV1(parsedAny)
        // }

        out = parsedAny as DashboardState;

        // Sanity checks
        // * remove unknown ids from the selected widgets
        const allowed = new Set(AVAILABLE_WIDGETS.map((w) => w.id));
        out.selectedWidgetIds = out.selectedWidgetIds.filter((id) => allowed.has(id));
        if (out.selectedWidgetIds.length === 0) {
            out.selectedWidgetIds = AVAILABLE_WIDGETS.map((w) => w.id);
        }

        // * remove unknown ids from the layout
        for (const bp of BREAKPOINTS) {
            const arr = (out.layouts as Layouts)[bp] as Layout[] | undefined;
            if (Array.isArray(arr)) {
                (out.layouts as Layouts)[bp] = arr.filter((item: Layout) => item && allowed.has(String(item.i)));
            }
        }


        return out;
    } catch (error) {
        console.error('Error loading dashboard state', error);
        return null;
    }
};

const saveDashboardState = (state: DashboardState) => {
    try {
        const toSave: DashboardState = {
            ...state,
            version: state.version ?? 1,
            selectedWidgetIds: Array.isArray(state.selectedWidgetIds) ? [...state.selectedWidgetIds].slice().sort() : [],
        };
        localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
        console.error('Error saving dashboard state', error);
    }
};

// Migrate the old dashboard-state shape into the new DashboardState
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const migrateOldDashboardState = (parsedAny: any): DashboardState => {
    const parsed = parsedAny as DashboardState;
    parsed.version = 1;

    // If selectedWidgetIds missing, try to extract from layouts (or top-level breakpoints)
    if (!Array.isArray(parsed.selectedWidgetIds)) {
        const ids = new Set<string>();
        let layoutsSource: Layouts | undefined;
        if (parsed && parsed.layouts) {
            layoutsSource = parsed.layouts as Layouts;
        } else if (parsedAny && (parsedAny.lg || parsedAny.md || parsedAny.sm || parsedAny.xs)) {
            layoutsSource = {
                lg: parsedAny.lg ?? [],
                md: parsedAny.md ?? [],
                sm: parsedAny.sm ?? [],
                xs: parsedAny.xs ?? [],
            } as Layouts;
            parsed.layouts = layoutsSource;

            delete parsedAny.lg;
            delete parsedAny.md;
            delete parsedAny.sm;
            delete parsedAny.xs;
        }

        if (layoutsSource) {
            for (const bp of BREAKPOINTS) {
                const arr = layoutsSource[bp] as Layout[] | undefined;
                if (Array.isArray(arr)) arr.forEach((item: Layout) => {
                    if (item && item.i) ids.add(String(item.i));
                });
            }
        }

        if (ids.size > 0) parsed.selectedWidgetIds = Array.from(ids);
        else parsed.selectedWidgetIds = AVAILABLE_WIDGETS.map((w) => w.id);


    }

    return parsed;
};


// Generate default layouts for all breakpoints
const generateDefaultLayouts = (widgets: WidgetConfig[] = AVAILABLE_WIDGETS): Layouts => {
    const lg: Layout[] = widgets.map((widget) => ({
        i: widget.id,
        ...widget.defaultLayout,
    }));

    // For medium screens, make widgets full width in pairs
    const md: Layout[] = widgets.map((widget, index) => ({
        i: widget.id,
        w: 6,
        h: widget.defaultLayout.h,
        x: (index % 2) * 6,
        y: Math.floor(index / 2) * widget.defaultLayout.h,
        minW: widget.defaultLayout.minW,
        minH: widget.defaultLayout.minH,
    }));

    // For small screens, stack vertically
    const sm: Layout[] = widgets.map((widget, index) => ({
        i: widget.id,
        w: 12,
        h: widget.defaultLayout.h,
        x: 0,
        y: index * widget.defaultLayout.h,
        minW: widget.defaultLayout.minW,
        minH: widget.defaultLayout.minH,
    }));

    return { lg, md, sm, xs: sm };
};

interface ConfigurableDashboardProps {
    /** Optional list of widget IDs to show (defaults to all AVAILABLE_WIDGETS) */
    enabledWidgetIds?: string[];
}

export const ConfigurableDashboard: React.FC<ConfigurableDashboardProps> = ({ enabledWidgetIds }) => {
    const [tRaw] = useTranslation();
    // Cast t to a looser signature so we can call dynamic keys like `dashboard.widgets` without TS errors
    const t = tRaw as unknown as (key: string) => string;

    const [isEditMode, setIsEditMode] = useState(false);

    // Selected widgets (internal state) - initialize from prop or persisted single-state
    const [selectedWidgetIds, setSelectedWidgetIds] = useState<string[]>(() => {
        if (enabledWidgetIds && enabledWidgetIds.length > 0) return enabledWidgetIds;
        const saved = loadDashboardState();
        if (saved && Array.isArray(saved.selectedWidgetIds)) {
            return saved.selectedWidgetIds;
        }
        return AVAILABLE_WIDGETS.map((w) => w.id);
    });

    // Menu anchor for widget selection
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const visibleWidgets = useMemo(() => {
        return AVAILABLE_WIDGETS.filter((w) => selectedWidgetIds.includes(w.id));
    }, [selectedWidgetIds]);

    const [layouts, setLayouts] = useState<Layouts>(() => {
        const saved = loadDashboardState();
        return (saved && saved.layouts) || generateDefaultLayouts(visibleWidgets);
    });

    // when selected widgets change, either re-use the saved layouts (if the saved selection matches)
    // or generate defaults for the new visible set
    useEffect(() => {
        const saved = loadDashboardState();
        if (saved && Array.isArray(saved.selectedWidgetIds) && saved.layouts) {
            // compare as sets (order-insensitive)
            const sameLength = saved.selectedWidgetIds.length === selectedWidgetIds.length;
            const sameMembers = saved.selectedWidgetIds.every((id) => selectedWidgetIds.includes(id));
            if (sameLength && sameMembers) {
                setLayouts(saved.layouts);
                return;
            }
        }
        setLayouts(generateDefaultLayouts(visibleWidgets));
    }, [selectedWidgetIds, visibleWidgets]);

    const handleLayoutChange = useCallback((_: Layout[], allLayouts: Layouts) => {
        setLayouts(allLayouts);
    }, []);

    // Reset to defaults for all available widgets and make all widgets visible
    const handleResetLayout = useCallback(() => {
        const allWidgetIds = AVAILABLE_WIDGETS.map((w) => w.id);
        setSelectedWidgetIds(allWidgetIds);

        const defaultLayouts = generateDefaultLayouts(AVAILABLE_WIDGETS);
        setLayouts(defaultLayouts);
        saveDashboardState({ selectedWidgetIds: allWidgetIds, layouts: defaultLayouts, version: VERSION });
    }, []);

    const toggleEditMode = useCallback(() => {
        setIsEditMode((prev) => !prev);
    }, []);

    // Widget menu handlers
    const openWidgetMenu = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
    const closeWidgetMenu = () => setAnchorEl(null);

    const toggleWidget = (id: string) => {
        setSelectedWidgetIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
    };

    useEffect(() => {
        saveDashboardState({ selectedWidgetIds, layouts, version: VERSION });
    }, [selectedWidgetIds, layouts]);

    // Grid configuration
    const gridConfig = useMemo(
        () => ({
            className: "layout",
            layouts: layouts,
            breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480 },
            cols: { lg: 12, md: 12, sm: 12, xs: 12 },
            rowHeight: 100,
            isDraggable: isEditMode,
            isResizable: isEditMode,
            onLayoutChange: handleLayoutChange,
            draggableHandle: isEditMode ? undefined : ".no-drag",
            margin: [16, 16] as [number, number],
            containerPadding: [0, 0] as [number, number],
        }),
        [layouts, isEditMode, handleLayoutChange]
    );

    return (
        <Box>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    my: 1,
                    mx: 2,
                    gap: 1,
                }}
            >
                {isEditMode && (
                    <>
                        <Box
                            sx={{
                                p: 1,
                                borderRadius: 1,
                                fontSize: "0.875rem",
                            }}
                        >
                            {t('dashboard.dragWidgetsHelp')}
                        </Box>
                        <IconButton
                            size="small"
                            onClick={openWidgetMenu}
                            sx={{
                                color: "primary.main",
                                borderRadius: 1,
                                fontSize: "0.875rem",
                            }}
                        >
                            <RuleIcon />
                        </IconButton>
                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeWidgetMenu}>
                            {AVAILABLE_WIDGETS.map((widget) => (
                                <MenuItem key={widget.id} onClick={() => toggleWidget(widget.id)}>
                                    <Switch checked={selectedWidgetIds.includes(widget.id)} />
                                    <ListItemText primary={t(widget.translationKey)} />
                                </MenuItem>
                            ))}
                        </Menu>
                        <Tooltip title={t('dashboard.resetLayout')}>
                            <IconButton
                                onClick={handleResetLayout}
                                size="small"
                                sx={{
                                    color: "primary.main",
                                    borderRadius: 1,
                                    fontSize: "0.875rem",
                                }}
                            >
                                <RestartAltIcon />
                            </IconButton>
                        </Tooltip>
                    </>
                )}

                <Tooltip
                    title={isEditMode ? t('core.exitEditMode') : t('dashboard.customizeDashboard')}>
                    <Button
                        variant={isEditMode ? "contained" : "outlined"}
                        startIcon={isEditMode ? <DoneIcon /> : <DashboardCustomizeIcon />}
                        onClick={toggleEditMode}
                        size="small"
                        sx={{ p: 1 }}
                    >
                        {isEditMode ? t('save') : t('core.customize')}
                    </Button>
                </Tooltip>
            </Box>

            <ResponsiveGridLayout {...gridConfig}>
                {visibleWidgets.map((widget) => {
                    const WidgetComponent = widget.component;
                    return (
                        <Box
                            key={widget.id}
                            sx={{
                                // Add visual feedback in edit mode
                                border: isEditMode ? "1px dashed" : "none",
                                borderColor: "primary.main",
                                borderRadius: 1,
                                transition: "border 0.2s",
                                cursor: isEditMode ? "move" : "default",
                                "&:hover": isEditMode
                                    ? {
                                        borderColor: "primary.dark",
                                    }
                                    : {},
                            }}
                        >
                            <WidgetComponent />
                        </Box>
                    );
                })}
            </ResponsiveGridLayout>
        </Box>
    );
};
