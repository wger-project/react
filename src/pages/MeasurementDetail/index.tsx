import { correlatesWithNutrition, MeasurementCategoryDetail, useMeasurementsQuery } from "@/components/Measurements";
import { useNutritionPlanPeriods } from "@/components/Nutrition";
import React from 'react';
import { useParams } from "react-router-dom";

/**
 * Reads the plans the detail chart shades. Whether they are worth reading
 * depends on the category, asked for here as well and answered from the cache.
 */
export const MeasurementDetail = () => {
    const params = useParams<{ categoryId: string }>();
    const categoryId = params.categoryId ?? '';
    const categoryQuery = useMeasurementsQuery(categoryId, categoryId !== '');
    const planPeriods = useNutritionPlanPeriods(
        correlatesWithNutrition(categoryQuery.data?.metricType ?? 'custom'),
    );

    return <MeasurementCategoryDetail planPeriods={planPeriods} />;
};
