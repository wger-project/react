import { Typography } from '@mui/material';
import Grid from "@mui/material/Grid2";
import React from 'react';
import { useTranslation } from "react-i18next";
import { DayProps } from "./CalendarComponent";
import CalendarDay from './CalendarDay';

interface CalendarDayGridProps {
    days: DayProps[];
    currentMonth: number;
    currentDate: Date;
    selectedDay: DayProps;
    onDayClick: (day: DayProps) => void;
}

const CalendarDayGrid: React.FC<CalendarDayGridProps> = ({
                                                             days,
                                                             currentMonth,
                                                             currentDate,
                                                             selectedDay,
                                                             onDayClick
                                                         }) => {
    const { i18n } = useTranslation();
    const weekDays = Array.from({ length: 7 }, (_, i) =>
        new Date(1970, 0, i + 5).toLocaleString(i18n.language, { weekday: 'short' })
    );

    return (
        <Grid container spacing={1} rowSpacing={2}>
            {weekDays.map((day, index) => (
                <Grid size={12 / 7} key={`weekday-${index}`}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                        {day}
                    </Typography>
                </Grid>
            ))}

            {days.map((day, index) => (
                <Grid size={12 / 7} key={`day-${index}`} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <CalendarDay
                        day={day}
                        currentMonth={currentMonth}
                        currentDate={currentDate}
                        selectedDay={selectedDay}
                        onClick={onDayClick}
                    />
                </Grid>
            ))}
        </Grid>
    );
};

export default CalendarDayGrid;