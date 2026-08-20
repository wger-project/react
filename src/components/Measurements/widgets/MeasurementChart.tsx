import {
    AVERAGE_WINDOWS,
    averageWindowOf,
    binWidthFor,
    categoryDisplayName,
    isSummedPerDay,
    MeasurementCategory,
    resolveChartType
} from "@/components/Measurements/models/Category";
import {
    aggregatePerDay,
    averagePerDay,
    chartQueryFor,
    chartPointsForBuckets,
    DISTRIBUTION_MIN_VALUES,
    groupChart,
    groupComponentPoints,
    movingAverage,
    valueHistogram,
    weeklyDeltas
} from "@/components/Measurements/charts/data";
import {
    useMeasurementBucketsQuery,
    useMeasurementValueCountsQuery
} from "@/components/Measurements/queries";
import {
    ChartRange,
    DEFAULT_CHART_RANGE,
    displayCutoffFor,
    displayFilterFor,
    pointsSince
} from "@/components/Measurements/charts/range";
import { PlanPeriod } from "@/components/Measurements/charts/series";
import { MeasurementBarChart } from "@/components/Measurements/widgets/MeasurementBarChart";
import { MeasurementDeltaBarChart } from "@/components/Measurements/widgets/MeasurementDeltaBarChart";
import { MeasurementDistributionChart } from "@/components/Measurements/widgets/MeasurementDistributionChart";
import { MeasurementHeatmapChart } from "@/components/Measurements/widgets/MeasurementHeatmapChart";
import { MeasurementLineChart } from "@/components/Measurements/widgets/MeasurementLineChart";
import { MeasurementRangeBarChart } from "@/components/Measurements/widgets/MeasurementRangeBarChart";
import { MeasurementSeriesChart } from "@/components/Measurements/widgets/MeasurementSeriesChart";
import { MeasurementStackedBarChart } from "@/components/Measurements/widgets/MeasurementStackedBarChart";
import { OverallChange } from "@/components/Measurements/widgets/OverallChange";
import { useTranslation } from "react-i18next";

/**
 * The chart of a category: which one it is follows from the metric type and
 * what the user picked, each of them a widget of its own.
 */
export const MeasurementChart = (props: {
    category: MeasurementCategory,
    range?: ChartRange,
    planPeriods?: PlanPeriod[],
}) => {
    const [t] = useTranslation();
    const category = props.category;
    const range = props.range ?? DEFAULT_CHART_RANGE;
    const cutoff = displayCutoffFor(range);
    const summed = isSummedPerDay(category.metricType);

    // A pick that does not fit the metric type falls back to the derived chart,
    // which is also what a category configured on another client gets here
    const resolved = resolveChartType(category.metricType, category.chartType);

    const { ids, level, filters } = chartQueryFor(category, range);
    const buckets = useMeasurementBucketsQuery(ids, level, filters).data ?? [];

    // Its own query, since a histogram needs every value and the points above
    // are condensed. Over the range itself, without the average lead: counted
    // values carry no date and cannot be trimmed afterwards.
    const counts = useMeasurementValueCountsQuery(
        category.id!,
        summed,
        displayFilterFor(range),
        !category.isGroup && resolved === 'distribution',
    ).data ?? [];

    if (category.isGroup) {
        const points = groupComponentPoints(category, buckets, cutoff);
        // The components are labelled by their metric type, like everywhere else
        const chart = groupChart(category, points, c => categoryDisplayName(c, t));

        switch (chart.kind) {
            case 'stacked':
                return <MeasurementStackedBarChart
                    points={chart.points}
                    labels={chart.labels}
                    unit={category.unit} />;
            case 'range':
                return <MeasurementRangeBarChart points={chart.points} unit={category.unit} />;
            case 'components':
                return <MeasurementSeriesChart series={chart.series} unit={category.unit} />;
        }
    }

    const all = chartPointsForBuckets(buckets, category.unit, category.unit, summed);
    const points = pointsSince(all, cutoff);

    if (resolved === 'delta') {
        return <>
            <MeasurementDeltaBarChart
                // Not condensed: a week is already the bucket, and the deltas
                // are what the chart draws rather than the values behind them
                points={weeklyDeltas(points, summed)}
                unit={category.unit} />
            {/* the one-number version of the bars above; a summed metric has no level to change */}
            {!summed && <OverallChange
                series={[{
                    // Its own smoothing: the number answers where the level
                    // went, also for a chart whose average line is turned off
                    points: pointsSince(
                        movingAverage(all, averageWindowOf(category.chartConfig) ?? AVERAGE_WINDOWS[0]),
                        cutoff,
                    ),
                    role: 'average',
                }]}
                unit={category.unit} />}
        </>;
    }

    if (resolved === 'distribution') {
        // Values are counted per unit they were entered in, so each goes
        // through the conversion helper before equal ones are added up
        const histogram = valueHistogram(counts, category.unit, category.unit);
        // How many readings there are, not how many distinct values: a
        // hundred weigh-ins around one number are a distribution, three are
        // not, however far apart they lie
        const readings = counts.reduce((sum, count) => sum + count.count, 0);

        // A histogram of a handful of readings is noise with gaps, so too few
        // fall through to the derived default chart below
        if (readings >= DISTRIBUTION_MIN_VALUES) {
            return <MeasurementDistributionChart
                values={histogram.values}
                latest={histogram.latest}
                unit={category.unit}
                binWidth={binWidthFor(category.metricType, category.unit)}
                countsAreDays={summed} />;
        }
    }

    if (resolved === 'heatmap') {
        // The cells are days, so how a day's readings become one value has to
        // be decided here: the summed types are a daily total, the sample types
        // are repeated readings of the same thing and average
        return <MeasurementHeatmapChart
            points={summed ? aggregatePerDay(points) : averagePerDay(points)}
            unit={category.unit} />;
    }

    return summed
        ? <MeasurementBarChart category={category} points={points} />
        : <MeasurementLineChart
            unit={category.unit}
            points={all}
            cutoff={cutoff}
            config={category.chartConfig}
            planPeriods={props.planPeriods} />;
};
