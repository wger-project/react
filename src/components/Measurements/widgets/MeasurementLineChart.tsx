import { ChartConfig } from "@/components/Measurements/models/Category";
import { measurementSeries } from "@/components/Measurements/charts/groups";
import { ChartPoint, PlanPeriod } from "@/components/Measurements/charts/series";
import { MeasurementSeriesChart } from "@/components/Measurements/widgets/MeasurementSeriesChart";
import { OverallChange } from "@/components/Measurements/widgets/OverallChange";

/** The default chart: the values with their moving average and trend, plus the overall change */
export const MeasurementLineChart = (props: {
    unit: string,
    points: ChartPoint[],
    cutoff: Date | null,
    config: ChartConfig,
    planPeriods?: PlanPeriod[],
}) => {
    const series = measurementSeries(props.points, props.cutoff, props.config);

    return <>
        <MeasurementSeriesChart
            series={series}
            unit={props.unit}
            planPeriods={props.planPeriods} />
        <OverallChange series={series} unit={props.unit} />
    </>;
};
