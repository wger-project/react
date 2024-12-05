import { useMediaQuery, useTheme } from '@mui/material';
import React from 'react';
import { dateToYYYYMMDD, isSameDay } from "../../../utils/date";
import { DayProps } from "./CalendarComponent";

interface CalendarDayProps {
    day: DayProps;
    currentMonth: number;
    currentDate: Date;
    selectedDay: DayProps;
    onClick: (day: DayProps) => void;
}

const CalendarDay: React.FC<CalendarDayProps> = ({ day, currentMonth, currentDate, selectedDay, onClick }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const isSelected = isSameDay(day.date, selectedDay.date);
    const isToday = isSameDay(day.date, currentDate);
    const isClickable = day.date.getMonth() === currentMonth
        && (day.date.getDate() <= currentDate.getDate()
            || day.date.getMonth() < currentDate.getMonth()
            || day.date.getFullYear() < currentDate.getFullYear());
    const isWeekend = day.date.getDay() === 6 || day.date.getDay() === 0;

    const getDayColor = (): string => {
        if (isSelected || isToday) return 'white';
        if (!isClickable) return 'gray';
        return isWeekend ? '#E53945' : 'black';
    };

    const getDaySize = () => {
        if (isMobile) return 35;
        if (isTablet) return 40;
        return 50;
    };

    const getDotSize = () => {
        if (isMobile) return 8;
        if (isTablet) return 9;
        return 10;
    };

    const hasDayEntry = () => {
        return day.measurements.length > 0 ||
            day.weightEntry !== undefined;
    };

    const handleClick = () => {
        if (isClickable) {
            onClick(day);
        }
    };

    const daySize = getDaySize();
    const dotSize = getDotSize();

    return (
        <div style={{
            position: 'relative',
            width: `${daySize}px`,
            height: `${daySize + (dotSize / 2)}px`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: `${daySize}px`,
                    height: `${daySize}px`,
                    fontSize: isMobile ? '0.8rem' : isTablet ? '0.9rem' : '1rem',
                    color: isSelected ? 'white' : isToday ? 'white' : getDayColor(),
                    backgroundColor: isSelected ? '#E53945' : isToday ? '#FEC107' : 'transparent',
                    borderRadius: '50%',
                    fontWeight: 'bold',
                    cursor: isClickable ? 'pointer' : 'default',
                    opacity: day.date.getMonth() !== currentMonth ? 0.25 : 1,
                }}
                data-testid={`day-${dateToYYYYMMDD(day.date)}`}
                onClick={handleClick}
            >
                {day.date.getDate()}
            </div>
            {hasDayEntry() && (
                <div
                    style={{
                        width: `${dotSize}px`,
                        height: `${dotSize}px`,
                        backgroundColor: 'black',
                        borderRadius: '50%',
                        position: 'absolute',
                        bottom: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 2
                    }}
                />
            )}
        </div>
    );
};

export default CalendarDay;