import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { CHART_RANGES, ChartRange } from "@/components/Measurements/charts/range";
import { TFunction } from "i18next";
import React from "react";
import { useTranslation } from "react-i18next";

/**
 * Label of a range, counted rather than one string per range, so a range
 * added here needs no new translation.
 */
const rangeLabel = (range: ChartRange, t: TFunction): string => {
    switch (range) {
        case 'lastWeek':
            return t('measurements.chartRangeWeeks', { count: 1 });
        case 'lastMonth':
            return t('measurements.chartRangeMonths', { count: 1 });
        case 'last3Months':
            return t('measurements.chartRangeMonths', { count: 3 });
        case 'lastYear':
            return t('measurements.chartRangeYears', { count: 1 });
        case 'all':
            return t('measurements.chartRangeAll');
    }
};

/** Picks how far back the charts below go */
export const ChartRangeSelector = (props: {
    value: ChartRange,
    onChange: (range: ChartRange) => void,
}) => {
    const [t] = useTranslation();

    return <ToggleButtonGroup
        exclusive
        size="small"
        value={props.value}
        onChange={(_, range: ChartRange | null) => {
            // null arrives when the selected button is clicked again
            if (range !== null) {
                props.onChange(range);
            }
        }}
    >
        {CHART_RANGES.map(range =>
            <ToggleButton key={range} value={range}>{rangeLabel(range, t)}</ToggleButton>)}
    </ToggleButtonGroup>;
};
