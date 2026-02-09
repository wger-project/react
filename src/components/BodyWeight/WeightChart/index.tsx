import { Paper, useTheme } from "@mui/material";
import { WeightForm } from "components/BodyWeight/Form/WeightForm";
import { WeightEntry } from "components/BodyWeight/model";
import { WgerModal } from "components/Core/Modals/WgerModal";
import React from 'react';
import { useTranslation } from "react-i18next";
import { CartesianGrid, Line, LineChart, ReferenceLine, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import { dateToLocale } from "utils/date";

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

/**
 * Calculate exponentially weighted moving average (EMA)
 * Using the Hacker's Diet approach with approximately 10% smoothing
 */
const calculateEMA = (weights: { date: number, weight: number }[], period: number = 10) => {
    if (weights.length === 0) return [];
    
    // Smoothing factor: 2 / (period + 1)
    // For period=10, this gives us ~0.18 (10% smoothing as in Hacker's Diet)
    const smoothing = 2 / (period + 1);
    
    const emaData: { date: number, weight: number, ema: number }[] = [];
    let ema = weights[0].weight; // Start with first measurement
    
    for (let i = 0; i < weights.length; i++) {
        if (i === 0) {
            ema = weights[i].weight;
        } else {
            // EMA = (Current Value × Smoothing) + (Previous EMA × (1 - Smoothing))
            ema = weights[i].weight * smoothing + ema * (1 - smoothing);
        }
        
        emaData.push({
            date: weights[i].date,
            weight: weights[i].weight,
            ema: ema
        });
    }
    
    return emaData;
};

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    const [t] = useTranslation();

    if (active && payload && payload.length) {
        const actualWeight = payload.find((p: any) => p.dataKey === 'weight');
        const trendWeight = payload.find((p: any) => p.dataKey === 'ema');
        const variance = actualWeight && trendWeight ? actualWeight.value - trendWeight.value : 0;
        
        return (
            <Paper style={{ padding: 8 }}>
                <p><strong>{dateToLocale(new Date(label!))}</strong></p>
                {actualWeight && <p>{t('weight')}: {actualWeight.value.toFixed(1)}</p>}
                {trendWeight && <p>Trend: {trendWeight.value.toFixed(1)}</p>}
                {actualWeight && trendWeight && (
                    <p style={{ color: variance > 0 ? '#ff6b6b' : '#51cf66' }}>
                        Variance: {variance > 0 ? '+' : ''}{variance.toFixed(1)}
                    </p>
                )}
            </Paper>
        );
    }

    return null;
};

/**
 * Custom shape to render vertical lines from each point to the trendline
 */
const VarianceLine = (props: any) => {
    const { points, emaData } = props;
    
    if (!points || points.length === 0 || !emaData) return null;
    
    return (
        <g>
            {points.map((point: any, index: number) => {
                if (!point || !emaData[index]) return null;
                
                const emaPoint = emaData[index];
                const x = point.x;
                const y1 = point.y; // Actual weight y-coordinate
                
                // Find the corresponding EMA y-coordinate
                // We need to calculate it based on the chart's scale
                const yScale = point.y / point.payload.weight;
                const y2 = emaPoint.ema * yScale; // EMA weight y-coordinate
                
                return (
                    <line
                        key={`variance-line-${index}`}
                        x1={x}
                        y1={y1}
                        x2={x}
                        y2={y2}
                        stroke={point.payload.weight > emaPoint.ema ? '#ff6b6b' : '#51cf66'}
                        strokeWidth={1}
                        strokeDasharray="2,2"
                        opacity={0.5}
                    />
                );
            })}
        </g>
    );
};

export const WeightChart = ({ weights, height }: WeightChartProps) => {

    height = height || 300;

    const theme = useTheme();
    const [t] = useTranslation();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [currentEntry, setCurrentEntry] = React.useState<WeightEntry>();
    const handleCloseModal = () => setIsModalOpen(false);

    // Sort and map the weights
    const sortedWeights = [...weights].sort((a, b) => a.date.getTime() - b.date.getTime());
    const weightData = sortedWeights.map(weight => ({
        date: weight.date.getTime(),
        weight: weight.weight,
        entry: weight
    }));

    // Calculate EMA (exponentially weighted moving average)
    const emaData = calculateEMA(weightData, 10);

    // Calculate mean weight
    const meanWeight = weightData.length > 0 
        ? weightData.reduce((sum, w) => sum + w.weight, 0) / weightData.length 
        : 0;

    // Get current trend (latest EMA value)
    const currentTrend = emaData.length > 0 ? emaData[emaData.length - 1].ema : 0;

    /*
     * Edit the currently selected weight
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function handleClick(data: any) {
        setCurrentEntry(data.entry);
        setIsModalOpen(true);
    }

    // Custom dot component that also renders variance lines
    const CustomDot = (props: any) => {
        const { cx, cy, payload, index } = props;
        
        if (!payload || !emaData[index]) return null;
        
        const emaPoint = emaData[index];
        const variance = payload.weight - emaPoint.ema;
        
        // Calculate EMA point y-coordinate on the same scale
        const yScale = (props.yAxis.scale as any);
        const emaY = yScale(emaPoint.ema);
        
        return (
            <g>
                {/* Variance line from dot to trend */}
                <line
                    x1={cx}
                    y1={cy}
                    x2={cx}
                    y2={emaY}
                    stroke={variance > 0 ? '#ff6b6b' : '#51cf66'}
                    strokeWidth={1}
                    strokeDasharray="2,2"
                    opacity={0.5}
                />
                {/* The actual dot */}
                <circle
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill={theme.palette.secondary.main}
                    stroke={theme.palette.secondary.dark}
                    strokeWidth={1}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleClick(payload)}
                />
            </g>
        );
    };

    return (
        <div>
            {
                currentEntry &&
                <WgerModal title={t('edit')} isOpen={isModalOpen} closeFn={handleCloseModal}>
                    <WeightForm weightEntry={currentEntry} />
                </WgerModal>
            }
            <LineChart data={emaData} responsive height={height}>
                <CartesianGrid
                    stroke="#ccc"
                    strokeDasharray="5 5" />
                <XAxis
                    dataKey="date"
                    type={'number'}
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={timeStr => dateToLocale(new Date(timeStr))}
                />
                <YAxis domain={['auto', 'auto']} />
                
                {/* Mean weight reference line */}
                <ReferenceLine 
                    y={meanWeight} 
                    stroke="#9e9e9e"
                    strokeDasharray="5 5"
                    strokeWidth={1.5}
                    label={{ 
                        value: `Mean: ${meanWeight.toFixed(1)}`, 
                        position: 'right',
                        fill: '#666',
                        fontSize: 12
                    }}
                />
                
                {/* Current trend annotation */}
                <ReferenceLine 
                    y={currentTrend} 
                    stroke={theme.palette.primary.main}
                    strokeDasharray="3 3"
                    strokeWidth={1}
                    label={{ 
                        value: `Current Trend: ${currentTrend.toFixed(1)}`, 
                        position: 'right',
                        fill: theme.palette.primary.main,
                        fontSize: 12,
                        fontWeight: 'bold'
                    }}
                    ifOverflow="extendDomain"
                />
                
                {/* Trend line (EMA) - smooth line */}
                <Line
                    type="monotone"
                    dataKey="ema"
                    stroke={theme.palette.primary.main}
                    strokeWidth={3}
                    dot={false}
                    name="Trend"
                    legendType="line"
                />
                
                {/* Individual weight measurements - dots with variance lines */}
                <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="transparent"
                    strokeWidth={0}
                    dot={<CustomDot emaData={emaData} />}
                    activeDot={{
                        stroke: 'black',
                        strokeWidth: 2,
                        r: 6,
                    }}
                    name="Weight"
                    legendType="circle"
                />
                
                <Tooltip content={<CustomTooltip />} />
                <Legend />
            </LineChart>
        </div>
    );
};
