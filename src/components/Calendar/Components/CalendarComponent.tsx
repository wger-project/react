import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { Box, Card, CardContent, CardHeader, useMediaQuery, useTheme } from '@mui/material';
import { WeightEntry } from "components/BodyWeight/model";
import { useBodyWeightQuery } from "components/BodyWeight/queries";
import CalendarDayGrid from "components/Calendar/Components/CalendarDayGrid";
import CalendarHeader from "components/Calendar/Components/CalendarHeader";
import { CalendarMeasurement } from "components/Calendar/Helpers/CalendarMeasurement";
import { useMeasurementsCategoryQuery } from "components/Measurements/queries";
import React, { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
import { isSameDay } from "utils/date";
import Entries from './Entries';

export interface DayProps {
    date: Date,
    weightEntry: WeightEntry | undefined,
    measurements: CalendarMeasurement[]
}

function getMeasurements(): CalendarMeasurement[] {
    const categoryQuery = useMeasurementsCategoryQuery();
    const categories = categoryQuery.data;

    return categories?.flatMap(category =>
        category.entries.map(entry => new CalendarMeasurement(category.name, category.unit, entry.value, entry.date))
    ) ?? [];
}

const CalendarComponent = () => {
    const [t] = useTranslation();
    const weightsQuery = useBodyWeightQuery();
    const weights: WeightEntry[] | undefined = weightsQuery.data;
    const measurements: CalendarMeasurement[] = getMeasurements();

    const getDaysInMonth = (year: number, month: number): DayProps[] => {
        const date = new Date(year, month, 1);
        const days: DayProps[] = [];

        const firstDayOfMonth = new Date(year, month, 1);
        let dayOfWeek = firstDayOfMonth.getDay();
        dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

        for (let i = 0; i < dayOfWeek; i++) {
            days.push({
                date: new Date(year, month, -dayOfWeek + i + 1),
                weightEntry: undefined,
                measurements: []
            });
        }

        while (date.getMonth() === month) {
            days.push({
                date: new Date(date),
                weightEntry: weights?.find(w => isSameDay(w.date, date)),
                measurements: measurements.filter(m => isSameDay(m.date, date)),
            });
            date.setDate(date.getDate() + 1);
        }

        const lastDayOfMonth = new Date(year, month + 1, 0);
        dayOfWeek = lastDayOfMonth.getDay();
        const remainingDays = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                date: new Date(year, month + 1, i),
                weightEntry: undefined,
                measurements: []
            });
        }

        return days;
    };

    const currentDate = new Date();
    const defaultDay: DayProps = {
        date: currentDate,
        weightEntry: undefined,
        measurements: []
    };
    const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
    const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
    const days = getDaysInMonth(currentYear, currentMonth);
    const [selectedDay, setSelectedDay] = useState<DayProps>(days.find(day => isSameDay(day.date, currentDate)) || defaultDay);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        setCurrentMonth(selectedDay.date.getMonth());
        setCurrentYear(selectedDay.date.getFullYear());
    }, [selectedDay]);

    const handleDayClick = (day: DayProps) => {
        setSelectedDay(day);
    };

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth < currentDate.getMonth() || currentYear < currentDate.getFullYear()) {
            if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
            } else {
                setCurrentMonth(currentMonth + 1);
            }
        }
    };

    return (
        <Box sx={{
            display: 'flex',
            gap: 2,
            flexDirection: { xs: 'column', md: 'row' },
            height: {
                xs: 'auto',
                md: 'calc(100vh - 130px)'
            },
            width: '100%',
        }}>
            <Card sx={{
                width: {
                    xs: 'auto',
                    md: '65%'
                },
                height: {
                    xs: 'auto%',
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
                },
                display: 'flex',
                flexDirection: 'column'
            }}>
                <CardHeader
                    sx={{ '& .MuiCardHeader-content': { width: '100%' } }}
                    title={
                        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '16px'
                            }}>
                                <CalendarMonthIcon style={{
                                    width: isMobile ? '28px' : '32px',
                                    height: isMobile ? '28px' : '32px',
                                    marginRight: '12px'
                                }} />
                                <span style={{
                                    fontSize: isMobile ? '1.5rem' : '1.8rem',
                                    fontWeight: 'bold'
                                }}>
                                    {t("calendar")}
                                </span>
                            </div>
                        </div>
                    }
                />
                <CardContent sx={{
                    overflow: 'auto',
                    flex: 1,
                    '&:last-child': {
                        paddingBottom: 2
                    }
                }}>
                    <CalendarHeader
                        currentMonth={currentMonth}
                        currentYear={currentYear}
                        onPrevMonth={handlePrevMonth}
                        onNextMonth={handleNextMonth}
                    />
                    <CalendarDayGrid
                        days={days}
                        currentMonth={currentMonth}
                        currentDate={currentDate}
                        selectedDay={selectedDay}
                        onDayClick={handleDayClick}
                    />
                </CardContent>
            </Card>
            <Entries selectedDay={selectedDay} />
        </Box>
    );
};

export default CalendarComponent;