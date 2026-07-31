import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { CHART_RANGES, ChartRange } from "@/components/Measurements/charts/range";
import React from "react";
import { useTranslation } from "react-i18next";

const LABELS = {
    last3Months: 'measurements.chartRangeLast3Months',
    lastYear: 'measurements.chartRangeLastYear',
    all: 'measurements.chartRangeAll',
} as const satisfies Record<ChartRange, string>;

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
            <ToggleButton key={range} value={range}>{t(LABELS[range])}</ToggleButton>)}
    </ToggleButtonGroup>;
};
