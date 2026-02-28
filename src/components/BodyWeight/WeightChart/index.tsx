import { Paper, useTheme } from "@mui/material";
import { WeightForm } from "components/BodyWeight/Form/WeightForm";
import { WeightEntry } from "components/BodyWeight/model";
import { WgerModal } from "components/Core/Modals/WgerModal";
import React from 'react';
import { useTranslation } from "react-i18next";
import { CartesianGrid, DotProps, Line, LineChart, ReferenceLine, Tooltip, XAxis, YAxis, Legend } from 'recharts';
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

interface WeightDataPoint {
    date: number;
    weight: number;
    entry: WeightEntry;
}

interface EMADataPoint {
    date: number;
    weight: number;
    ema: number;
}

/**
 * Calculate exponentially weighted moving average (EMA)
 * Using the Hacker's Diet approach with approximately 10% smoothing
 */
const calculateEMA = (weights: WeightDataPoint[], period: number = 10): EMADataPoint[] => {
    if (weights.length === 0) return [];
    
    // Smoothing factor: 2 / (period + 1)
    // For period=10, this gives us ~0.18 (10% smoothing as in Hacker's Diet)
    const smoothing = 2 / (period + 1);
    
    const emaData: EMADataPoint[] = [];
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const actualWeight = payload.find((p: any) => p.dataKey === 'weight');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

interface CustomDotProps extends DotProps {
    cx?: number;
    cy?: number;
    payload?: EMADataPoint;
    emaData: EMADataPoint[];
    yAxisDomain: [number, number];
    chartHeight: number;
    onClick: (payload: EMADataPoint) => void;
}

export const WeightChart = ({ weights, height }: WeightChartProps) => {

    height = height || 300;

    const theme = useTheme();
    const [t] = useTranslation();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [currentEntry, setCurrentEntry] = React.useState<WeightEntry>();
    const handleCloseModal = () => setIsModalOpen(false);

    // Sort and map the weights
    const sortedWeights = [...weights].sort((a, b) => a.date.getTime() - b.date.getTime());
    const weightData: WeightDataPoint[] = sortedWeights.map(weight => ({
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

    // Calculate Y-axis domain for proper variance line positioning
    const allWeights = emaData.flatMap(d => [d.weight, d.ema]);
    const minWeight = Math.min(...allWeights);
    const maxWeight = Math.max(...allWeights);
    const padding = (maxWeight - minWeight) * 0.1; // 10% padding
    const yAxisDomain: [number, number] = [minWeight - padding, maxWeight + padding];

    /*
     * Edit the currently selected weight
     */
    function handleClick(payload: EMADataPoint) {
        const entry = weights.find(w => w.date.getTime() === payload.date);
        if (entry) {
            setCurrentEntry(entry);
            setIsModalOpen(true);
        }
    }

    // Custom dot component that also renders variance lines
    const CustomDot = (props: CustomDotProps) => {
        const { cx, cy, payload, emaData, yAxisDomain, chartHeight, onClick } = props;
        
        if (cx === undefined || cy === undefined || !payload) {
            return null;
        }

        // Find the EMA value for this data point
        const emaPoint = emaData.find(d => d.date === payload.date);
        if (!emaPoint) {
            return null;
        }
        
        const variance = payload.weight - emaPoint.ema;
        
        // Calculate the y-coordinate for the EMA point
        // Map the EMA value to the chart coordinate system
        const [minY, maxY] = yAxisDomain;
        const valueRange = maxY - minY;
        const normalizedEma = (emaPoint.ema - minY) / valueRange;
        
        // In SVG, y=0 is at the top, so we need to invert
        // Account for chart margins (approximately 5 pixels top and bottom)
        const margin = 5;
        const effectiveHeight = chartHeight - (2 * margin);
        const emaY = margin + effectiveHeight * (1 - normalizedEma);
        
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
                    onClick={() => onClick(payload)}
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
                <YAxis domain={yAxisDomain} />
                
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
                    dot={(props: DotProps) => (
                        <CustomDot 
                            {...props} 
                            emaData={emaData} 
                            yAxisDomain={yAxisDomain}
                            chartHeight={height}
                            onClick={handleClick} 
                        />
                    )}
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
