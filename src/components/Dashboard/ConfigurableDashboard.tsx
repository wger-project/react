import { Box, Button, IconButton, Tooltip } from "@mui/material";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import DoneIcon from '@mui/icons-material/Done';
import React, { useState, useCallback, useMemo } from "react";
import { Responsive, WidthProvider, Layout, Layouts } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { NutritionCard } from "components/Dashboard/NutritionCard";
import { RoutineCard } from "components/Dashboard/RoutineCard";
import { WeightCard } from "components/Dashboard/WeightCard";
import { useTranslation } from "react-i18next";
import { FastingTimerCard } from "components/Fasting/FastingTimerCard";


const ResponsiveGridLayout = WidthProvider(Responsive);

// Local storage key for persisting layouts
//const LAYOUT_STORAGE_KEY = "dashboard-layout";
const LAYOUT_STORAGE_KEY = "dashboard-layout-v2";


// Define widget types for extensibility
//export type WidgetType = "routine" | "nutrition" | "weight";
export type WidgetType = "routine" | "nutrition" | "weight" | "fasting";

export interface WidgetConfig {
    id: string;
    type: WidgetType;
    component: React.ComponentType;
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
// export const AVAILABLE_WIDGETS: WidgetConfig[] = [
//     {
//         id: "routine",
//         type: "routine",
//         component: RoutineCard,
//         defaultLayout: { w: 4, h: 5, x: 0, y: 0, minW: 3, minH: 2 },
//     },
//     {
//         id: "fasting",
//         type: "fasting",
//         component: FastingTimerCard,
//         defaultLayout: { w: 4, h: 5, x: 0, y: 5, minW: 3, minH: 3 },
//     },
//     {
//         id: "nutrition",
//         type: "nutrition",
//         component: NutritionCard,
//         defaultLayout: { w: 4, h: 5, x: 4, y: 0, minW: 3, minH: 2 },
//     },
//     {
//         id: "weight",
//         type: "weight",
//         component: WeightCard,
//         defaultLayout: { w: 4, h: 5, x: 8, y: 0, minW: 3, minH: 2 },
//     },
// ];
// Widget registry - easy to add new widgets in the future
export const AVAILABLE_WIDGETS: WidgetConfig[] = [
    {
        id: "routine",
        type: "routine",
        component: RoutineCard,
        defaultLayout: { w: 3, h: 5, x: 0, y: 0, minW: 3, minH: 2 },
    },
    {
        id: "nutrition",
        type: "nutrition",
        component: NutritionCard,
        defaultLayout: { w: 3, h: 5, x: 3, y: 0, minW: 3, minH: 2 },
    },
    {
        id: "weight",
        type: "weight",
        component: WeightCard,
        defaultLayout: { w: 3, h: 5, x: 6, y: 0, minW: 3, minH: 2 },
    },
    {
        id: "fasting",
        type: "fasting",
        component: FastingTimerCard,
        defaultLayout: { w: 3, h: 5, x: 9, y: 0, minW: 3, minH: 3 },
    },
];


// Generate default layouts for all breakpoints
const generateDefaultLayouts = (): Layouts => {
    const lg: Layout[] = AVAILABLE_WIDGETS.map((widget) => ({
        i: widget.id,
        ...widget.defaultLayout,
    }));

    // For medium screens, make widgets full width in pairs
    const md: Layout[] = AVAILABLE_WIDGETS.map((widget, index) => ({
        i: widget.id,
        w: 6,
        h: widget.defaultLayout.h,
        x: (index % 2) * 6,
        y: Math.floor(index / 2) * widget.defaultLayout.h,
        minW: widget.defaultLayout.minW,
        minH: widget.defaultLayout.minH,
    }));

    // For small screens, stack vertically
    const sm: Layout[] = AVAILABLE_WIDGETS.map((widget, index) => ({
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

// Load layouts from localStorage
const loadLayouts = (): Layouts | null => {
    try {
        const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch (error) {
        console.error("Error loading dashboard layout:", error);
        return null;
    }
};

// Save layouts to localStorage
const saveLayouts = (layouts: Layouts) => {
    try {
        localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layouts));
    } catch (error) {
        console.error("Error saving dashboard layout:", error);
    }
};

export const ConfigurableDashboard: React.FC = () => {
    const [t] = useTranslation();
    const [isEditMode, setIsEditMode] = useState(false);
    const [layouts, setLayouts] = useState<Layouts>(() => {
        const savedLayouts = loadLayouts();
        return savedLayouts || generateDefaultLayouts();
    });

    const handleLayoutChange = useCallback((_: Layout[], allLayouts: Layouts) => {
        setLayouts(allLayouts);
        saveLayouts(allLayouts);
    }, []);

    const handleResetLayout = useCallback(() => {
        const defaultLayouts = generateDefaultLayouts();
        setLayouts(defaultLayouts);
        saveLayouts(defaultLayouts);
    }, []);

    const toggleEditMode = useCallback(() => {
        setIsEditMode((prev) => !prev);
    }, []);

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
                    <Box
                        sx={{
                            p: 1,
                            borderRadius: 1,
                            fontSize: "0.875rem",
                        }}
                    >
                        {t('dashboard.dragWidgetsHelp')}
                    </Box>
                )}
                {isEditMode && (
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
                )}
                <Tooltip title={isEditMode ? t('core.exitEditMode') : t('dashboard.customizeDashboard')}>
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
                {AVAILABLE_WIDGETS.map((widget) => {
                    const WidgetComponent = widget.component;
                    return (
                        <Box
                            key={widget.id}
                            sx={{
                                height: "100%",
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