import { CartesianGrid, DotProps, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import React from 'react';
import { WeightTableProps } from "components/BodyWeight/Table";
import i18n, { t } from "i18next";
import { WeightEntry } from "components/BodyWeight/model";
import { WeightForm } from "components/BodyWeight/Form/WeightForm";
import { WgerModal } from "components/Core/WgerModal/WgerModal";

// don't require the "fetchNewWeights" prop from the WeightTableProps
export const WeightChart = ({ weights }: Omit<WeightTableProps, "fetchNewWeights">) => {

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [currentEntry, setCurrentEntry] = React.useState<WeightEntry>();
    const handleCloseModal = () => setIsModalOpen(false);

    // map the list of weights to an array of objects with the date and weight
    const weightData = weights.sort((a, b) => a.date.getTime() - b.date.getTime()).map(weight => {
        return {
            // Format date according to the locale
            date: new Date(weight.date).toLocaleDateString(i18n.language),
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
            <ResponsiveContainer width="90%" height={300}>
                <LineChart data={weightData}>
                    <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#2A4C7D"
                        strokeWidth={4}
                        dot={{ strokeWidth: 2, r: 7 }}
                        activeDot={{
                            stroke: '#2A4C7D',
                            strokeWidth: 2,
                            r: 6,
                            onClick: handleClick
                        }} />
                    <CartesianGrid
                        stroke="#ccc"
                        strokeDasharray="5 5" />
                    <XAxis dataKey="date" />
                    <YAxis domain={['auto', 'auto']} />

                    <Tooltip />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};