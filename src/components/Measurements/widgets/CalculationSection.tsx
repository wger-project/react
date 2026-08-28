import {
    CALCULATION_NONE,
    CALCULATION_TYPES,
    CalculationSlug,
    calculationType,
    CalculationType
} from "@/components/Measurements/models/Calculation";
import { MeasurementCategory } from "@/components/Measurements/models/Category";
import { CalculationParams } from "@/components/Measurements/widgets/CalculationParams";
import { useProfileQuery } from "@/components/User";
import { Alert, MenuItem, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { useFormikContext } from "formik";
import React from "react";
import { useTranslation } from "react-i18next";

interface CalculationValues {
    calculation: string;
    params: Record<string, unknown>;
}

interface CalculationSectionProps {
    /** The category being edited, absent while one is created */
    category?: MeasurementCategory;
    /** Every category of the user, group children included */
    categories: MeasurementCategory[];
    /** Switches to a calculation, which also prefills the name and the unit */
    onPick: (type?: CalculationType) => void;
}

/**
 * Who fills a category in: the user by hand, or the server by computing it.
 * Only free-form categories can be calculated, the API refuses the rest.
 */
export const CalculationSection = ({
                                       category,
                                       categories,
                                       onPick,
                                   }: CalculationSectionProps) => {

    const [t] = useTranslation();
    const { values, errors, submitCount, setFieldValue } = useFormikContext<CalculationValues>();
    const profileQuery = useProfileQuery();

    // What a category computes is what it is, like its metric type, so it is
    // set once: the server refuses a change, and stopping means deleting
    const isLocked = category?.isCalculated ?? false;
    const picked = calculationType(values.calculation);

    /** Whether the user has this calculation; only decidable without parameters */
    const isTaken = (type: CalculationType): boolean => type.params.length === 0
        && categories.some(candidate =>
            candidate.dynamicType === type.slug && candidate.id !== category?.id
        );

    /** What the switch starts at; a taken one would be refused when saved */
    const firstAvailable = (): CalculationType =>
        CALCULATION_TYPES.find(type => !isTaken(type)) ?? CALCULATION_TYPES[0];

    // The ratio names the category it reads, so the description needs it too
    const sourceId = (values.params as { category_id?: string }).category_id;
    const sourceName = categories.find(candidate => candidate.id === sourceId)?.name ?? '';

    // Not every calculation brings a description, see the translation file
    const description = t(
        `measurements.calculations.descriptions.${values.calculation as CalculationSlug}`,
        { category: sourceName, defaultValue: '' },
    );

    return <>
        {!isLocked && <>
            <ToggleButtonGroup
                exclusive
                fullWidth
                size="small"
                value={values.calculation === CALCULATION_NONE ? 'manual' : 'calculated'}
                onChange={(_event, mode) => {
                    if (mode === null) {
                        return;
                    }
                    if (mode === 'manual') {
                        setFieldValue('calculation', CALCULATION_NONE);
                        return;
                    }
                    onPick(firstAvailable());
                }}
            >
                <ToggleButton value="manual">
                    {t('measurements.calculations.sourceManual')}
                </ToggleButton>
                <ToggleButton value="calculated">
                    {t('measurements.calculations.sourceCalculated')}
                </ToggleButton>
            </ToggleButtonGroup>
        </>}

        {picked !== undefined && <>
            <TextField
                select
                fullWidth
                disabled={isLocked}
                id="calculation"
                label={t('measurements.calculations.type')}
                helperText={isLocked ? t('measurements.calculations.locked') : undefined}
                value={values.calculation}
                onChange={event => onPick(calculationType(event.target.value))}
            >
                {CALCULATION_TYPES.map(type =>
                    <MenuItem key={type.slug} value={type.slug} disabled={isTaken(type)}>
                        {t(`measurements.calculations.names.${type.slug}`)}
                        {isTaken(type) && ` (${t('measurements.metricAlreadyTracked')})`}
                    </MenuItem>
                )}
            </TextField>
            {description !== '' && <Typography variant="body2" color="text.secondary">
                {description}
            </Typography>}
            {picked.needsHeight && !profileQuery.data?.height && <Alert severity="warning">
                {t('measurements.calculations.missingHeight')}
            </Alert>}
            <CalculationParams
                type={picked}
                params={values.params}
                onChange={params => setFieldValue('params', params)}
                categories={categories}
                categoryId={category?.id}
            />
            {/* Only once sent: incomplete is the normal state while typing */}
            {submitCount > 0 && typeof errors.params === 'string' &&
                <Alert severity="error">{errors.params}</Alert>}
        </>}
    </>;
};
