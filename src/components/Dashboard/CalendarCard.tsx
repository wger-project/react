import CalendarComponent from "components/Calendar/Components/CalendarComponent";
import { DashboardCard } from "components/Dashboard/DashboardCard";
import React from "react";
import { useTranslation } from "react-i18next";


export const CalendarCard = () => {
    const { t } = useTranslation();


    return (
        <DashboardCard title={t("calendar")}>
            <CalendarComponent showBorder={false} />
        </DashboardCard>
    );
};