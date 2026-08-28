import { Typography } from "@mui/material";
import { overallChange } from "@/components/Measurements/charts/data";
import { pointsOfRole } from "@/components/Measurements/charts/groups";
import { valueWithUnit } from "@/components/Measurements/charts/format";
import { ChartSeries } from "@/components/Measurements/charts/series";
import React from "react";
import { useTranslation } from "react-i18next";

/**
 * How far the values moved over the charted period.
 *
 * Read off the average rather than off the values: the first and the last
 * reading of a densely sampled metric are two arbitrary moments.
 */
export const OverallChange = (props: { series: ChartSeries[], unit: string }) => {
    const [t, i18n] = useTranslation();

    const change = overallChange(pointsOfRole(props.series, 'average'));
    if (change === null) {
        return null;
    }

    return <Typography variant="caption" sx={{ textAlign: 'center' }}>
        {t('measurements.overallChangeWeight')}
        {' '}
        {change > 0 ? '+' : change < 0 ? '-' : ''}
        {valueWithUnit(Math.abs(change), props.unit, i18n.language)}
    </Typography>;
};
