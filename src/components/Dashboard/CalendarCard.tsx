import { DashboardCard } from "components/Dashboard/DashboardCard";
import { Calendar } from "pages";
import React from "react";
import { useTranslation } from "react-i18next";


export const CalendarCard = () => {
    const { t } = useTranslation();


    return (
        <DashboardCard
            title={t("calendar")}
        >
            <Calendar />
        </DashboardCard>
    );
};