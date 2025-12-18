import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { Button, IconButton, List, ListItem, ListItemText, Typography } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
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