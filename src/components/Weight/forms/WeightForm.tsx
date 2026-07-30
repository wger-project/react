import { Button, Stack, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { WeightEntry } from "@/components/Weight/models/WeightEntry";
import {
    useAddWeightEntryQuery,
    useBodyWeightCategoryQuery,
    useDisplayWeightUnit,
    useEditWeightEntryQuery
} from "@/components/Weight/queries";
import { useProfileQuery } from "@/components/User";
import { weightBounds, WeightUnit } from "@/core/lib/weightUnit";
import { LoadingPlaceholder } from "@/core/ui/LoadingWidget/LoadingWidget";
import { Form, Formik } from "formik";
import { DateTime } from "luxon";
import { useState } from 'react';
import { useTranslation } from "react-i18next";
import * as yup from 'yup';

interface WeightFormProps {
    weightEntry?: WeightEntry,
    closeFn?: () => void,
}

export const WeightForm = ({ weightEntry, closeFn }: WeightFormProps) => {

    const categoryQuery = useBodyWeightCategoryQuery();
    const profileQuery = useProfileQuery();
    const addWeightQuery = useAddWeightEntryQuery();
    const editWeightQuery = useEditWeightEntryQuery();
    const displayUnit = useDisplayWeightUnit();

    const [dateValue, setDateValue] = useState<DateTime | null>(weightEntry ? DateTime.fromJSDate(weightEntry.date) : DateTime.now);
    const [t, i18n] = useTranslation();

    const lb = weightBounds('lb');
    const kg = weightBounds('kg');
    const validationSchema = yup.object({
        unit: yup.string().oneOf(['kg', 'lb']),
        weight: yup
            .number()
            .required(t('forms.fieldRequired'))
            .when('unit', {
                is: 'lb',
                then: schema => schema
                    .min(lb.min, t('forms.minValue', { value: `${lb.min} ${t('server.lb')}` }))
                    .max(lb.max, t('forms.maxValue', { value: `${lb.max} ${t('server.lb')}` })),
                otherwise: schema => schema
                    .min(kg.min, t('forms.minValue', { value: `${kg.min} ${t('server.kg')}` }))
                    .max(kg.max, t('forms.maxValue', { value: `${kg.max} ${t('server.kg')}` })),
            }),
    });

    // Also wait for the profile: Formik freezes the initial values, and the
    // unit default falls back to kg while the profile has not loaded yet
    if (categoryQuery.isLoading || profileQuery.isLoading) {
        return <LoadingPlaceholder />;
    }

    return (
        (<Formik
            initialValues={{
                // when editing, show the value in the unit it was entered in
                weight: weightEntry ? weightEntry.weight : 0,
                unit: weightEntry ? weightEntry.unit : displayUnit,
                date: weightEntry ? weightEntry.date : new Date(),
            }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {

                // Edit existing weight entry
                if (weightEntry) {
                    editWeightQuery.mutate(WeightEntry.clone(
                        weightEntry,
                        { weight: values.weight, date: values.date, unit: values.unit }
                    ));

                    // Create a new weight entry
                } else {
                    addWeightQuery.mutate(new WeightEntry(values.date, values.weight, undefined, '', values.unit));
                }

                if (closeFn) {
                    closeFn();
                }
            }}
        >
            {formik => (
                <Form>
                    <Stack spacing={2}>
                        <Stack direction="row" spacing={2}>
                            <TextField
                                fullWidth
                                id="weight"
                                label={t('weight')}
                                error={formik.touched.weight && Boolean(formik.errors.weight)}
                                helperText={formik.touched.weight && formik.errors.weight}
                                slotProps={{ htmlInput: { inputMode: 'decimal' } }}
                                {...formik.getFieldProps('weight')}
                            />
                            <ToggleButtonGroup
                                exclusive
                                value={formik.values.unit}
                                onChange={(_, newUnit: WeightUnit | null) => {
                                    if (newUnit) {
                                        formik.setFieldValue('unit', newUnit);
                                    }
                                }}
                            >
                                <ToggleButton value="kg">{t('server.kg')}</ToggleButton>
                                <ToggleButton value="lb">{t('server.lb')}</ToggleButton>
                            </ToggleButtonGroup>
                        </Stack>

                        <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={i18n.language}>
                            <DateTimePicker
                                label={t('date')}
                                value={dateValue}
                                slotProps={{ textField: { variant: 'outlined' } }}
                                disableFuture={true}
                                onChange={(newValue) => {
                                    if (newValue) {
                                        formik.setFieldValue('date', newValue.toJSDate());
                                    }
                                    setDateValue(newValue);
                                }}
                            />
                        </LocalizationProvider>
                        <Stack direction="row" sx={{ justifyContent: "end", mt: 2 }}>
                            <Button color="primary" variant="contained" type="submit" sx={{ mt: 2 }}>
                                {t('submit')}
                            </Button>
                        </Stack>
                    </Stack>
                </Form>
            )}
        </Formik>)
    );
};
