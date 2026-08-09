import { MAX_BAR_WIDTH } from "@/components/Measurements/charts/density";
import { durationAxis, valueOnly, valueWithUnit } from "@/components/Measurements/charts/format";
import { ChartPoint } from "@/components/Measurements/charts/series";
import { BarChartFrame, TooltipFrame, TooltipProps } from "@/components/Measurements/widgets/chartFrames";
import { useTranslation } from "react-i18next";
import { Bar } from "recharts";
import { theme } from "@/theme";

const RangeTooltip = (props: TooltipProps & { unit: string }) => {
    const [, i18n] = useTranslation();

    if (!props.active || !props.payload?.length) {
        return null;
    }

    const [low, high] = props.payload[0].value as [number, number];

    return <TooltipFrame label={props.label}>
        {/* a range is quoted as high over low, the way a blood pressure reading is written */}
        <p>
            {valueOnly(high, props.unit, i18n.language)}/
            {valueWithUnit(low, props.unit, i18n.language)}
        </p>
    </TooltipFrame>;
};

/**
 * The readings of a two-component group, each as one bar spanning from the
 * lower component to the upper one.
 *
 * A reading is one event: two lines would assert interpolation, but nothing
 * was measured between two readings, and connecting them buries the thing that
 * matters, the gap within one reading.
 */
export const MeasurementRangeBarChart = (props: { points: ChartPoint[], unit: string }) => {
    const data = props.points.map(point => ({ date: point.date, range: [point.min!, point.max!] }));

    return <BarChartFrame
        data={data}
        unit={props.unit}
        domainStart="auto"
        axis={durationAxis(
            props.unit,
            Math.min(...props.points.map(point => point.min!)),
            Math.max(...props.points.map(point => point.max!)),
        )}
        tooltip={<RangeTooltip unit={props.unit} />}>
        <Bar
            dataKey="range"
            fill={theme.palette.primary.main}
            maxBarSize={MAX_BAR_WIDTH} />
    </BarChartFrame>;
};
