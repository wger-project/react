import { BodyWeight } from "@/components/Measurements";
import { useNutritionPlanPeriods } from "@/components/Nutrition";
import React from 'react';

/** Reads the plans the weight chart shades */
export const WeightOverview = () => {
    const planPeriods = useNutritionPlanPeriods();

    return <BodyWeight planPeriods={planPeriods} />;
};
