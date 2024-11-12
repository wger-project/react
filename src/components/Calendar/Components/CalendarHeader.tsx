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
    const [t] = useTranslation();
    const months = [t("months.january"), t("months.february"), t("months.march"), t("months.april"), t("months.may"), t("months.june"),
        t("months.july"), t("months.august"), t("months.september"), t("months.october"), t("months.november"), t("months.december")];

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