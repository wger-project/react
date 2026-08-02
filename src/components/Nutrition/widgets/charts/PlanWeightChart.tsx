import { Typography } from "@mui/material";
import { NutritionalPlan } from "@/components/Nutrition/models/nutritionalPlan";
import {
    useBodyWeightCategoryQuery,
    useBodyWeightQuery,
    useDisplayWeightUnit,
    WeightChart
} from "@/components/Weight";
import React from "react";
import { useTranslation } from "react-i18next";

/**
 * Body weight during the plan's period.
 *
 * Hidden while the weight data is not loaded and when fewer than two readings
 * fall into the period. All series are derived from the readings inside the
 * period only, so the trend starts from a real measurement instead of an
 * interpolated boundary point.
 */
export const PlanWeightChart = (props: { plan: NutritionalPlan }) => {
    const [t] = useTranslation();
    // The chart starts at the plan, so nothing before it has to be fetched.
    // The upper end stays a client-side filter, because the plan's last day
    // counts in full and a date bound would cut it at midnight
    const weightQuery = useBodyWeightQuery({ "date__gte": props.plan.start.toISOString() });
    const categoryQuery = useBodyWeightCategoryQuery();
    const displayUnit = useDisplayWeightUnit();

    if (!weightQuery.data || !categoryQuery.data) {
        return null;
    }

    // The end date is inclusive: readings on the plan's last day still count
    const endExclusive = props.plan.end === null
        ? null
        : new Date(props.plan.end.getTime() + 24 * 60 * 60 * 1000);
    const entries = weightQuery.data.filter(entry =>
        entry.date >= props.plan.start && (endExclusive === null || entry.date < endExclusive));

    // A single reading has no development to show
    if (entries.length < 2) {
        return null;
    }

    return <>
        <Typography gutterBottom variant="h4">{t('weight')}</Typography>
        <WeightChart
            weights={entries}
            unit={displayUnit}
            categoryUnit={categoryQuery.data.unit}
            range="all"
            height={200} />
    </>;
};
