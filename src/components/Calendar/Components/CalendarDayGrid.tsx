import React from 'react';
import {Grid, Typography} from '@mui/material';
import CalendarDay from './CalendarDay';
import {DayProps} from "./CalendarComponent";
import {useTranslation} from "react-i18next";

interface CalendarDayGridProps {
    days: DayProps[];
    currentMonth: number;
    currentDate: Date;
    selectedDay: DayProps;
    onDayClick: (day: DayProps) => void;
}

const CalendarDayGrid: React.FC<CalendarDayGridProps> = ({days, currentMonth, currentDate, selectedDay, onDayClick}) => {
    const [t] = useTranslation();
    const weekDays = [t("calendarDays.monday"), t("calendarDays.tuesday"), t("calendarDays.wednesday"),
        t("calendarDays.thursday"), t("calendarDays.friday"), t("calendarDays.saturday"), t("calendarDays.sunday")];

    return (
        <Grid container spacing={1} rowSpacing={2}>
            {weekDays.map((day, index) => (
                <Grid item xs={12 / 7} key={`weekday-${index}`}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                        {day}
                    </Typography>
                </Grid>
            ))}

            {days.map((day, index) => (
                <Grid item xs={12 / 7} key={`day-${index}`} sx={{ display: 'flex', justifyContent: 'center' }}>
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