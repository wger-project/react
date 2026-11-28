import { componentColor, componentPalette } from "@/components/Measurements/charts/colors";
import { StackedPoint } from "@/components/Measurements/charts/groups";
import { MAX_BAR_WIDTH } from "@/components/Measurements/charts/density";
import { durationAxis, valueOnly, valueWithUnit } from "@/components/Measurements/charts/format";
import { BarChartFrame, TooltipFrame, TooltipProps } from "@/components/Measurements/widgets/chartFrames";
import { useTranslation } from "react-i18next";
import { Bar } from "recharts";

/** The whole bar with its parts: a single segment says little without the night it belongs to */
const StackedTooltip = (props: TooltipProps & { unit: string }) => {
    const [, i18n] = useTranslation();

    if (!props.active || !props.payload?.length) {
        return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parts = props.payload.filter((entry: any) => entry.value > 0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const total = parts.reduce((sum: number, entry: any) => sum + entry.value, 0);

    return <TooltipFrame label={props.label}>
        <p>{valueWithUnit(total, props.unit, i18n.language)}</p>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {parts.map((entry: any) => <p key={entry.dataKey}>
            {entry.dataKey}: {valueOnly(entry.value, props.unit, i18n.language)}
        </p>)}
    </TooltipFrame>;
};

/**
 * Stacked bar chart for a group whose components are parts of one whole, e.g.
 * the sleep stages of a night.
 *
 * One bar per day, split into a segment per component in the components' own
 * order, so the bar's height is the night and its segments are how it was
 * spent. Colours come from the component palette by position, which is what
 * ties a segment to the row naming it.
 */
export const MeasurementStackedBarChart = (props: {
    points: StackedPoint[],
    labels: string[],
    unit: string,
}) => {
    const palette = componentPalette(props.labels.length);
    const data = props.points.map(point => ({
        date: point.date,
        ...Object.fromEntries(props.labels.map((label, index) => [label, point.values[index]])),
    }));
    // The bar is as tall as its segments together, so that is what the axis
    // has to cover
    const totals = props.points.map(
        point => point.values.reduce((sum: number, value) => sum + (value ?? 0), 0),
    );

    return <BarChartFrame
        data={data}
        unit={props.unit}
        domainStart={0}
        axis={durationAxis(props.unit, 0, Math.max(...totals))}
        tooltip={<StackedTooltip unit={props.unit} />}>
        {props.labels.map((label, index) => <Bar
            key={label}
            dataKey={label}
            stackId="components"
            fill={componentColor(palette, index)}
            maxBarSize={MAX_BAR_WIDTH} />)}
    </BarChartFrame>;
};
