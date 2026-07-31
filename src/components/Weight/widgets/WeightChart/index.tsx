import {
    ChartRange,
    cutoffFor,
    DEFAULT_CHART_RANGE,
    MeasurementEntry,
    measurementSeries,
    MeasurementSeriesChart,
    OverallChange,
    PlanPeriod
} from "@/components/Measurements";
import { WeightUnit } from "@/core/lib/weightUnit";
import React from "react";
import { useTranslation } from "react-i18next";

export interface WeightChartProps {
    weights: MeasurementEntry[],
    unit: WeightUnit,
    categoryUnit: string,
    range?: ChartRange,
    planPeriods?: PlanPeriod[],
    height?: number,
}

/**
 * Body weight over time: the same chart every other measurement gets, plus
 * the mean and the distance of each reading from the trend, which the weight
 * screens showed before body weight became a measurement.
 */
export const WeightChart = (
    { weights, unit, categoryUnit, range, planPeriods, height = 300 }: WeightChartProps,
) => {
    const [t] = useTranslation();

    // Entries can be stored in mixed units, so every value is converted
    // before anything is derived from it
    const series = measurementSeries(
        weights,
        unit,
        categoryUnit,
        cutoffFor(range ?? DEFAULT_CHART_RANGE),
    );

    return <>
        <MeasurementSeriesChart
            series={series}
            unit={t(`server.${unit}`)}
            height={height}
            planPeriods={planPeriods}
            showMean
            showVariance />
        <OverallChange series={series} unit={t(`server.${unit}`)} />
    </>;
};
