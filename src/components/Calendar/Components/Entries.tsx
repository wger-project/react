import React from 'react';
import { Card, CardHeader, CardContent, Typography } from '@mui/material';
import {DayProps} from "./CalendarComponent";
import {useTranslation} from "react-i18next";

interface WeightLogProps {
    selectedDay: DayProps;
}

const Entries: React.FC<WeightLogProps> = ({ selectedDay }) => {
    const [t] = useTranslation();
    return (
        <Card
            sx={{
                width: {
                    xs: 'auto',
                    md: '65%'
                },
                height: {
                    xs: '60%',
                    md: '100%'
                },
                m: {
                    xs: 0,
                    sm: 1,
                    md: 2
                },
                p: {
                    xs: 1,
                    sm: 1.5,
                    md: 2
                }
            }}
        >
            <CardHeader
                title={
                    <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                        {t("entries")} - {selectedDay.date.toLocaleDateString()}
                    </Typography>
                }
            />
            <CardContent sx={{
                flex: 1,
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 2
            }}>
                <div className="flex items-center gap-2">
                    <span className="font-extrabold">{t("weight")}: </span>
                    <span className={`${selectedDay.weightEntry ? 'text-xl font-semibold' : 'text-gray-500'}`}>
                        {selectedDay.weightEntry
                            ? `${selectedDay.weightEntry.weight.toFixed(1)} kg`
                            : "No weight entry for this day"
                        }
                    </span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="font-bold">{t("measurements.measurements")}: </span>
                    {selectedDay.measurements.length === 0 ? (
                        <span className="text-gray-500 mt-1">No measurements for this day</span>
                    ) : (
                        <div className="flex flex-col gap-0.5">
                            {selectedDay.measurements.map((measurement) => (
                                <div key={measurement.name}>
                                    {measurement.name}: {measurement.value} {measurement.unit}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default Entries;