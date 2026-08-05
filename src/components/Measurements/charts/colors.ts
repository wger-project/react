import { Theme } from "@mui/material/styles";
import { ChartSeriesRole } from "@/components/Measurements/charts/series";
import { generateChartColors } from "@/core/lib/colors";

/**
 * Colours the components of a group are drawn in, by position. Shared with the
 * lists that name the components, so a row and its line match.
 */
export const componentPalette = (componentCount: number): string[] =>
    [...generateChartColors(componentCount)];

export const componentColor = (palette: string[], index: number): string =>
    palette[index % palette.length];

/**
 * Colour of a change bar, by which way it points. Theme colours rather than
 * green and red: which direction is the good one depends on the goal (losing
 * weight, building muscle), and the chart should not assert one.
 */
export const deltaColor = (theme: Theme, delta: number): string =>
    delta < 0 ? theme.palette.info.main : theme.palette.secondary.main;

/**
 * Colour of a series. Components are coloured by their position, the other
 * roles have a fixed colour each.
 */
export const seriesColor = (
    theme: Theme,
    role: ChartSeriesRole,
    componentIndex: number,
    palette: string[],
): string => {
    switch (role) {
        case 'raw':
            return theme.palette.primary.main;
        case 'average':
            return theme.palette.info.main;
        case 'trend':
            return theme.palette.secondary.main;
        case 'component':
            return componentColor(palette, componentIndex);
    }
};
