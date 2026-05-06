import { WeightEntry } from "@/components/BodyWeight/model";
import { calculateEMA, EMADataPoint } from "@/components/BodyWeight/WeightChart/ema";
import { dateToLocale } from "@/utils/date";
import { Paper, Stack, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ReferenceLine,
    Tooltip,
    useXAxisScale,
    useYAxisScale,
    XAxis,
    YAxis
} from 'recharts';

const NR_OF_WEIGHTS_CHART_DOT = 30;

export interface WeightChartProps {
    weights: WeightEntry[],
    height?: number,
}

export interface TooltipProps {
    active?: boolean,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any,
    label?: string,
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    const [t] = useTranslation();
    const theme = useTheme();

    if (active && payload && payload.length) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const actualWeight = payload.find((p: any) => p.dataKey === 'weight');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const trendWeight = payload.find((p: any) => p.dataKey === 'ema');
        const variance = actualWeight && trendWeight ? actualWeight.value - trendWeight.value : 0;

        return (
            <Paper style={{ padding: 8 }}>
                <p><strong>{dateToLocale(new Date(label!))}</strong></p>
                {actualWeight && <p>{t('weight')}: {actualWeight.value.toFixed(1)}</p>}
                {trendWeight && <p>{t('trend')}: {trendWeight.value.toFixed(1)}</p>}
                {actualWeight && trendWeight && (
                    <p style={{ color: variance > 0 ? theme.palette.error.main : theme.palette.success.main }}>
                        {t('variance')}: {variance > 0 ? '+' : ''}{variance.toFixed(1)}
                    </p>
                )}
            </Paper>
        );
    }

    return null;
};

const VarianceLines = ({ emaData }: { emaData: EMADataPoint[] }) => {
    const xScale = useXAxisScale();
    const yScale = useYAxisScale();
    const theme = useTheme();

    if (!xScale || !yScale || emaData.length > NR_OF_WEIGHTS_CHART_DOT) {
        return null;
    }

    return (
        <g>
            {emaData.map(point => {
                const x = xScale(point.date) as number;
                return (
                    <line
                        key={point.date}
                        x1={x}
                        y1={yScale(point.weight) as number}
                        x2={x}
                        y2={yScale(point.ema) as number}
                        stroke={point.weight > point.ema ? theme.palette.error.main : theme.palette.success.main}
                        strokeWidth={1}
                        strokeDasharray="2,2"
                        opacity={0.5}
                    />
                );
            })}
        </g>
    );
};

export const WeightChart = ({ weights, height = 300 }: WeightChartProps) => {
    const theme = useTheme();
    const [t] = useTranslation();

    const sortedWeights = [...weights].sort((a, b) => a.date.getTime() - b.date.getTime());
    const weightData = sortedWeights.map(weight => ({
        date: weight.date.getTime(),
        weight: weight.weight,
    }));

    const emaData = calculateEMA(weightData, 10);

    const meanWeight = weightData.length > 0
        ? weightData.reduce((sum, w) => sum + w.weight, 0) / weightData.length
        : 0;
    const currentTrend = emaData.length > 0 ? emaData[emaData.length - 1].ema : 0;

    const allWeights = emaData.flatMap(d => [d.weight, d.ema]);
    const minWeight = allWeights.length > 0 ? Math.min(...allWeights) : 0;
    const maxWeight = allWeights.length > 0 ? Math.max(...allWeights) : 0;
    const padding = (maxWeight - minWeight) * 0.1;
    const yAxisDomain: [number, number] = [minWeight - padding, maxWeight + padding];

    return (
        <div>
            {weightData.length > 0 && (
                <Stack direction="row" spacing={2} sx={{ px: 1, justifyContent: 'flex-end' }}>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                        {t('mean')}: {meanWeight.toFixed(1)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                        {t('currentTrend')}: {currentTrend.toFixed(1)}
                    </Typography>
                </Stack>
            )}
            <LineChart data={emaData} responsive height={height}>
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                <XAxis
                    dataKey="date"
                    type={'number'}
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={timeStr => dateToLocale(new Date(timeStr))}
                />
                <YAxis domain={yAxisDomain} tickFormatter={value => Math.round(value).toString()} />

                <ReferenceLine
                    y={meanWeight}
                    stroke="#9e9e9e"
                    strokeDasharray="5 5"
                    strokeWidth={1.5}
                />

                <ReferenceLine
                    y={currentTrend}
                    stroke={theme.palette.primary.main}
                    strokeDasharray="3 3"
                    strokeWidth={1}
                    ifOverflow="extendDomain"
                />

                <Line
                    type="monotone"
                    dataKey="ema"
                    stroke={theme.palette.primary.main}
                    strokeWidth={3}
                    dot={false}
                    name={t('trend')}
                    legendType="line"
                />

                <VarianceLines emaData={emaData} />

                <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="transparent"
                    strokeWidth={0}
                    dot={emaData.length > NR_OF_WEIGHTS_CHART_DOT
                        ? false
                        : {
                            fill: theme.palette.secondary.main,
                            stroke: theme.palette.secondary.dark,
                            strokeWidth: 1,
                            r: 4
                        }}
                    activeDot={{
                        fill: theme.palette.secondary.main,
                        stroke: theme.palette.secondary.dark,
                        strokeWidth: 2,
                        r: 6
                    }}
                    name={t('weight')}
                    legendType="circle"
                />

                <Tooltip content={<CustomTooltip />} />
                <Legend />
            </LineChart>
        </div>
    );
};
