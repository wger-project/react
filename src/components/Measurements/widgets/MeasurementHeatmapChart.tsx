import { alpha, Box, Typography } from "@mui/material";
import { buildHeatmapGrid, DAYS_PER_WEEK, heatmapDayAt } from "@/components/Measurements/charts/data";
import { valueWithUnit } from "@/components/Measurements/charts/format";
import { ChartPoint } from "@/components/Measurements/charts/series";
import { ChartEmptyState } from "@/components/Measurements/widgets/ChartEmptyState";
import { dateToLocale } from "@/core/lib/date";
import React from "react";
import { useTranslation } from "react-i18next";
import { theme } from "@/theme";

/** Widest a heatmap cell gets, and the room its weekday labels need */
const MAX_HEATMAP_CELL = 22;
const WEEKDAY_LABEL_WIDTH = 30;

/**
 * Calendar heatmap: one cell per day, coloured by that day's value.
 *
 * Where a line or a bar answers how much, this answers how regularly, which for
 * steps or sleep is often the more interesting question. It is also the only
 * chart of the set where a gap is visible: a day without a measurement is an
 * empty cell instead of a line segment that silently spans it.
 *
 * Takes one point per calendar day; how a day's readings became that value
 * (summed, averaged) is decided by the caller.
 */
export const MeasurementHeatmapChart = (props: { points: ChartPoint[], unit: string }) => {
    const [t, i18n] = useTranslation();
    const [selected, setSelected] = React.useState<number | null>(null);

    if (props.points.length === 0) {
        return <ChartEmptyState />;
    }

    const grid = buildHeatmapGrid(props.points);
    const today = new Date().setHours(0, 0, 0, 0);
    const weekdays = Array.from({ length: DAYS_PER_WEEK }, (_, row) => row);
    const weeks = Array.from({ length: grid.weeks }, (_, column) => column);

    /**
     * A day without a measurement is neutral, everything else is tinted by how
     * large its value is within the grid. The scale is continuous and starts
     * well above transparent: a day that was measured has to read as measured
     * even when its value is the smallest one.
     */
    const cellColor = (value: number | undefined): string => {
        if (value === undefined) {
            return theme.palette.action.hover;
        }
        const share = grid.maxValue <= 0 ? 1 : Math.min(1, Math.max(0, value / grid.maxValue));

        return alpha(theme.palette.secondary.main, 0.3 + 0.7 * share);
    };

    // The grid is whole weeks and its last one usually runs past today, so the
    // span it covers ends today rather than on that Sunday
    const last = heatmapDayAt(grid, grid.weeks - 1, DAYS_PER_WEEK - 1);
    const selectedValue = selected === null ? undefined : grid.values.get(selected);
    const readout = selected === null
        ? `${dateToLocale(new Date(grid.start))} - ${dateToLocale(new Date(Math.min(last, today)))}`
        : `${dateToLocale(new Date(selected))}: ${selectedValue === undefined
            ? t('measurements.noDataAvailable')
            : valueWithUnit(selectedValue, props.unit, i18n.language)}`;

    const cells = weekdays.flatMap(weekday => weeks.map(week => {
        const day = heatmapDayAt(grid, week, weekday);

        return <Box
            key={day}
            onMouseEnter={() => setSelected(day)}
            onMouseLeave={() => setSelected(null)}
            sx={{
                aspectRatio: '1 / 1',
                backgroundColor: cellColor(grid.values.get(day)),
                borderRadius: '2px',
                // Days that have not happened yet are left blank rather than
                // drawn as a gap
                visibility: day > today ? 'hidden' : 'visible',
                outline: day === selected ? `1px solid ${theme.palette.text.primary}` : 'none',
            }} />;
    }));

    // The month above the column it starts in, which is what says where in the
    // year the grid is without a date axis
    const monthLabels = weeks.map(week => {
        const monday = heatmapDayAt(grid, week, 0);
        const day = new Date(monday);
        const previous = week === 0 ? -1 : new Date(heatmapDayAt(grid, week - 1, 0)).getMonth();

        return {
            day: monday,
            label: day.getMonth() === previous
                ? ''
                : day.toLocaleDateString(i18n.language, { month: 'short' }),
        };
    });

    const columns = `repeat(${grid.weeks}, 1fr)`;
    const labelStyle = {
        color: 'text.secondary',
        fontSize: '0.7rem',
        lineHeight: 1,
        whiteSpace: 'nowrap',
    } as const;

    return <Box sx={{ width: '90%' }}>
        <Typography variant="body2" sx={{ minHeight: '1.5em' }}>{readout}</Typography>
        {/*
          * The cells are square and share the width, so a short range would
          * blow them up into a chunky calendar; the grid stops growing at a
          * width its cells stay small in and keeps the rest of the space empty
          */}
        <Box sx={{
            display: 'grid',
            gap: '2px',
            gridTemplateColumns: 'auto 1fr',
            maxWidth: `${grid.weeks * MAX_HEATMAP_CELL + WEEKDAY_LABEL_WIDTH}px`,
        }}>
            <Box />
            <Box sx={{ display: 'grid', gap: '2px', gridTemplateColumns: columns }}>
                {monthLabels.map(({ day, label }) =>
                    <Typography key={day} sx={{ ...labelStyle, overflow: 'visible' }}>
                        {label}
                    </Typography>
                )}
            </Box>

            {/* Every other weekday: naming all seven needs more room than the rows have */}
            <Box sx={{ display: 'grid', gap: '2px', gridTemplateRows: `repeat(${DAYS_PER_WEEK}, 1fr)` }}>
                {weekdays.map(weekday =>
                    <Typography key={weekday} sx={{ ...labelStyle, alignSelf: 'center', pr: 0.5 }}>
                        {weekday % 2 === 0
                            ? new Date(heatmapDayAt(grid, 0, weekday))
                                .toLocaleDateString(i18n.language, { weekday: 'short' })
                            : ''}
                    </Typography>
                )}
            </Box>
            {/* The grid carries its meaning in colour alone, so it needs a name */}
            <Box
                role="img"
                aria-label={t('measurements.chartTypes.heatmap')}
                sx={{ display: 'grid', gap: '2px', gridTemplateColumns: columns }}>
                {cells}
            </Box>
        </Box>
    </Box>;
};
