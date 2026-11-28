import { CalculationSlug } from "@/components/Measurements/models/Calculation";
import { MeasurementCategory } from "@/components/Measurements/models/Category";
import { Chip, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

/**
 * Marks a category whose entries the server computes. The mark sits on the
 * category, not on every entry: all of them are calculated.
 */
export const CalculationBadge = ({ category }: { category: MeasurementCategory }) => {
    const [t] = useTranslation();

    if (!category.isCalculated) {
        return null;
    }

    return <Chip
        size="small"
        variant="outlined"
        color="primary"
        label={t('measurements.calculations.badge')}
    />;
};

/**
 * What the values are computed from, in words. Doubles as the explanation for
 * an empty category; a calculation without such a sentence renders nothing.
 * The name of a source category is passed in.
 */
export const CalculationSource = ({
                                      category,
                                      sourceName,
                                  }: {
    category: MeasurementCategory,
    sourceName?: string,
}) => {
    const [t] = useTranslation();

    // Absent for a calculation of a newer server as well
    const description = t(
        `measurements.calculations.descriptions.${category.dynamicType as CalculationSlug}`,
        { category: sourceName ?? '', defaultValue: '' },
    );

    if (!category.isCalculated || description === '') {
        return null;
    }

    return <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {description}
    </Typography>;
};

/** The id of the category a calculation reads, if it reads one */
export const calculationSourceId = (category: MeasurementCategory): string | undefined =>
    (category.dynamicParams as { category_id?: string }).category_id;
