import {
    availableChartTypes,
    AVERAGE_WINDOWS,
    CHART_LINE_OFF,
    ChartType,
    MetricType,
    resolveChartType,
    TREND_CHARACTERS,
    TrendCharacter
} from "@/components/Measurements/models/Category";
import { CategoryFormValues } from "@/components/Measurements/widgets/categoryFormValues";
import { MenuItem, Stack, TextField } from "@mui/material";
import { useFormikContext } from "formik";
import React from 'react';
import { useTranslation } from "react-i18next";

/** What the chart type picker offers: no override, plus what the type allows */
const chartTypeChoices = (metricType: MetricType): ChartType[] =>
    ['auto', ...availableChartTypes(metricType)];

/**
 * Whether the line settings apply at all: only to a category that can be drawn
 * as a line, which a group never is.
 */
const canDrawLine = (metricType: MetricType, hasChildren: boolean): boolean =>
    !hasChildren && availableChartTypes(metricType).includes('line');

/** Whether the category is currently drawn as a line */
const drawsLine = (values: { metricType: MetricType, chartType: ChartType }): boolean =>
    resolveChartType(values.metricType, values.chartType) === 'line';

/**
 * How a category is drawn: the chart it is shown as, and the two settings of
 * the line. Renders nothing where the metric type leaves no choice.
 */
export const ChartSettingsFields = ({ hasChildren }: { hasChildren: boolean }) => {
    const [t] = useTranslation();
    const formik = useFormikContext<CategoryFormValues>();
    const metricType = formik.values.metricType;

    return <>
        {/*
          * Only the shapes that are a matter of taste are offered, and only
          * those the metric type can be drawn as. A group gets no picker at
          * all, its chart follows from what its components are to each other;
          * a category with children is one whatever its metric type says,
          * which is also how the charts decide
          */}
        {!hasChildren && availableChartTypes(metricType).length > 0 &&
            <TextField
                select
                fullWidth
                id="chartType"
                label={t('measurements.chartType')}
                {...formik.getFieldProps('chartType')}
            >
                {chartTypeChoices(metricType).map(chartType =>
                    <MenuItem key={chartType} value={chartType}>
                        {t(`measurements.chartTypes.${chartType}`)}
                    </MenuItem>
                )}
            </TextField>
        }
        {/* The trend line and the moving average are parts of the line chart:
          * a category that can never be drawn as one is not offered them at
          * all, and one that is currently drawn as something else keeps its
          * settings but cannot change them
          */}
        {canDrawLine(metricType, hasChildren) &&
            /* The two settings of the line share a row: they belong together
             * and the form is long enough
             */
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                    select
                    fullWidth
                    id="trend"
                    label={t('measurements.chartTrend')}
                    disabled={!drawsLine(formik.values)}
                    {...formik.getFieldProps('trend')}
                >
                    {TREND_CHARACTERS.map((trend: TrendCharacter) =>
                        <MenuItem key={trend} value={trend}>
                            {trend === CHART_LINE_OFF ? t('off') : t(`measurements.trends.${trend}`)}
                        </MenuItem>
                    )}
                </TextField>
                <TextField
                    select
                    fullWidth
                    id="averageWindow"
                    label={t('measurements.chartAverageWindow')}
                    disabled={!drawsLine(formik.values)}
                    {...formik.getFieldProps('averageWindow')}
                >
                    <MenuItem value={CHART_LINE_OFF}>{t('off')}</MenuItem>
                    {AVERAGE_WINDOWS.map(days =>
                        <MenuItem key={days} value={days}>
                            {t('measurements.chartAverageWindowDays', { count: days })}
                        </MenuItem>
                    )}
                </TextField>
            </Stack>}
    </>;
};
