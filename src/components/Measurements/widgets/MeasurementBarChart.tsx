import { categoryDisplayName, MeasurementCategory } from "@/components/Measurements/models/Category";
import { aggregatePerDay, fillMissingDays } from "@/components/Measurements/charts/data";
import { MAX_BAR_WIDTH } from "@/components/Measurements/charts/density";
import { durationAxis, valueWithUnit } from "@/components/Measurements/charts/format";
import { ChartPoint } from "@/components/Measurements/charts/series";
import { BarChartFrame, TooltipFrame, TooltipProps } from "@/components/Measurements/widgets/chartFrames";
import { ChartEmptyState } from "@/components/Measurements/widgets/ChartEmptyState";
import { useTranslation } from "react-i18next";
import { Bar } from "recharts";
import { theme } from "@/theme";

const CustomTooltip = (props: TooltipProps & { category: MeasurementCategory }) => {
    const [t, i18n] = useTranslation();

    if (!props.active || !props.payload?.length) {
        return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = props.payload.find((entry: any) => entry.dataKey === 'value');

    return <TooltipFrame label={props.label}>
        {value && <p>
            {categoryDisplayName(props.category, t)}
            : {valueWithUnit(value.value, props.category.unit, i18n.language)}
        </p>}
    </TooltipFrame>;
};

export const MeasurementBarChart = (props: { category: MeasurementCategory, points: ChartPoint[] }) => {
    // Bars need a band axis (recharts miscomputes bar heights on a numeric
    // time axis), so make the bands time-proportional by filling in the
    // missing days instead
    const data = fillMissingDays(aggregatePerDay(props.points));

    if (data.length === 0) {
        return <ChartEmptyState />;
    }

    return <BarChartFrame
        data={data}
        unit={props.category.unit}
        domainStart={0}
        axis={durationAxis(props.category.unit, 0, Math.max(...data.map(point => point.value)))}
        tooltip={<CustomTooltip category={props.category} />}>
        <Bar
            dataKey="value"
            fill={theme.palette.secondary.main}
            maxBarSize={MAX_BAR_WIDTH} />
    </BarChartFrame>;
};
