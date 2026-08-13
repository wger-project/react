import { deltaColor } from "@/components/Measurements/charts/colors";
import { MAX_BAR_WIDTH } from "@/components/Measurements/charts/density";
import { durationAxis, valueWithUnit } from "@/components/Measurements/charts/format";
import { ChartPoint } from "@/components/Measurements/charts/series";
import { BarChartFrame, TooltipFrame, TooltipProps } from "@/components/Measurements/widgets/chartFrames";
import { ChartEmptyState } from "@/components/Measurements/widgets/ChartEmptyState";
import { useTranslation } from "react-i18next";
import { Bar, Cell, ReferenceLine } from "recharts";
import { theme } from "@/theme";

const DeltaTooltip = (props: TooltipProps & { unit: string }) => {
    const [, i18n] = useTranslation();

    if (!props.active || !props.payload?.length) {
        return null;
    }

    const value = props.payload[0].value as number;

    return <TooltipFrame label={props.label}>
        {/* the plus is ours, only the minus comes out of the number format */}
        <p>{value > 0 ? '+' : ''}{valueWithUnit(value, props.unit, i18n.language)}</p>
    </TooltipFrame>;
};

/**
 * Week-over-week change: one bar per calendar week, hanging off a zero line
 * and coloured by its direction. Answers "is it going the right way" more
 * directly than the trend line does.
 */
export const MeasurementDeltaBarChart = (props: { points: ChartPoint[], unit: string }) => {
    const [t] = useTranslation();

    if (props.points.length === 0) {
        return <ChartEmptyState />;
    }

    const values = props.points.map(point => point.value);

    return <BarChartFrame
        data={props.points}
        unit={props.unit}
        domainStart="auto"
        axis={durationAxis(props.unit, Math.min(0, ...values), Math.max(0, ...values))}
        tooltip={<DeltaTooltip unit={props.unit} />}
        ariaLabel={t('measurements.chartTypes.delta')}>
        {/* without the baseline a chart of only decreases reads as a normal one pointing down */}
        <ReferenceLine y={0} stroke={theme.palette.text.primary} />
        <Bar dataKey="value" maxBarSize={MAX_BAR_WIDTH}>
            {props.points.map(point =>
                <Cell key={point.date} fill={deltaColor(theme, point.value)} />)}
        </Bar>
    </BarChartFrame>;
};
