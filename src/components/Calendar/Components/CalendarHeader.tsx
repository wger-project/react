import React from 'react';
import { Button, Typography } from '@mui/material';
import {useTranslation} from "react-i18next";

interface CalendarHeaderProps {
    currentMonth: number;
    currentYear: number;
    onPrevMonth: () => void;
    onNextMonth: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({currentMonth, currentYear, onPrevMonth, onNextMonth,}) => {
    const { i18n } = useTranslation();
    const months = Array.from({ length: 12 }, (_, index) =>
        new Date(2024, index, 1).toLocaleString(i18n.language, { month: "long" })
    );

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            paddingBottom: '3%'
        }}>
            <Button variant="outlined" onClick={onPrevMonth}>
                &lt;
            </Button>
            <Typography variant="h5">
                {months[currentMonth]} {currentYear}
            </Typography>
            <Button variant="outlined" onClick={onNextMonth}>
                &gt;
            </Button>
        </div>
    );
};

export default CalendarHeader;