import { CartesianGrid, DotProps, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import React from 'react';
import { WeightEntry } from "components/BodyWeight/model";
import { WeightForm } from "components/BodyWeight/Form/WeightForm";
import { WgerModal } from "components/Core/WgerModal/WgerModal";
import { useTranslation } from "react-i18next";
import { Paper, useTheme } from "@mui/material";

export interface WeightChartProps {
    weights: WeightEntry[],
    height?: number,
}

export interface TooltipProps {
    active?: boolean,
    payload?: any,
    label?: string,
}
 
const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    const [t, i18n] = useTranslation();

    if (active && payload && payload.length) {
        return (
            <Paper style={{
                padding: 8
            }}>
                <p><strong>{new Date(label!).toLocaleDateString(i18n.language)}</strong></p>
                <p>{t('weight')}: {payload[0].value}</p>
            </Paper>
        );
    }

    return null;
};

export const WeightChart = ({ weights, height }: WeightChartProps) => {

    const NR_OF_WEIGHTS_CHART_DOT = 30;
    height = height || 300;

    const theme = useTheme();
    const [t, i18n] = useTranslation();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [currentEntry, setCurrentEntry] = React.useState<WeightEntry>();
    const handleCloseModal = () => setIsModalOpen(false);

    // map the list of weights to an array of objects with the date and weight
    const weightData = [...weights].sort((a, b) => a.date.getTime() - b.date.getTime()).map(weight => {
        return {
            date: weight.date.getTime(),
            weight: weight.weight,
            entry: weight
        };
    });

    /*
     * Edit the currently selected weight
     */
    function handleClick(e: DotProps, data: any) {
        setCurrentEntry(data.payload.entry);
        setIsModalOpen(true);
    }

    return (
        <div>
            {
                currentEntry &&
                <WgerModal title={t('edit')} isOpen={isModalOpen} closeFn={handleCloseModal}>
                    <WeightForm weightEntry={currentEntry} />
                </WgerModal>
            }
            <ResponsiveContainer width="90%" height={height}>

                <LineChart data={weightData}>
                    <Line
                        type="monotone"
                        dataKey="weight"
                        stroke={theme.palette.secondary.main}
                        strokeWidth={2}
                        dot={weightData.length > NR_OF_WEIGHTS_CHART_DOT ? false : { strokeWidth: 1, r: 4 }}
                        activeDot={{
                            stroke: 'black',
                            strokeWidth: 1,
                            r: 6,
                            onClick: handleClick
                        }} />
                    <CartesianGrid
                        stroke="#ccc"
                        strokeDasharray="5 5" />
                    <XAxis
                        dataKey="date"
                        type={'number'}
                        domain={['dataMin', 'dataMax']}
                        tickFormatter={timeStr => new Date(timeStr).toLocaleDateString(i18n.language)}
                        tickCount={10}
                    />
                    <YAxis domain={['auto', 'auto']} />
                    <Tooltip content={<CustomTooltip />} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};