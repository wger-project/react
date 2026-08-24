import { Button, Stack, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { limitsFor, METRIC_TYPE_BODY_WEIGHT } from "@/components/Measurements/models/Category";
import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import { FormQueryErrors } from "@/core/ui/Widgets/FormError";
import {
    useAddMeasurementEntryQuery,
    useEditMeasurementEntryQuery
} from "@/components/Measurements/queries";
import { weightUnitOf } from "@/components/Measurements/models/bodyWeight";
import { useBodyWeightCategoryQuery, useDisplayWeightUnit } from "@/components/Measurements/queries/bodyWeight";
import { useProfileQuery } from "@/components/User";
import { WeightUnit } from "@/core/lib/weightUnit";
import { LoadingPlaceholder } from "@/core/ui/LoadingWidget/LoadingWidget";
import { EntryDateTimeField } from "@/components/Measurements/widgets/EntryDateTimeField";
import { Form, Formik } from "formik";
import { useTranslation } from "react-i18next";
import * as yup from 'yup';

interface WeightFormProps {
    weightEntry?: MeasurementEntry,
    closeFn?: () => void,
}

export const WeightForm = ({ weightEntry, closeFn }: WeightFormProps) => {

    const categoryQuery = useBodyWeightCategoryQuery();
    const profileQuery = useProfileQuery();
    const addWeightQuery = useAddMeasurementEntryQuery();
    const editWeightQuery = useEditMeasurementEntryQuery();
    const displayUnit = useDisplayWeightUnit();

    const [t] = useTranslation();

    const lb = limitsFor(METRIC_TYPE_BODY_WEIGHT, 'lb');
    const kg = limitsFor(METRIC_TYPE_BODY_WEIGHT, 'kg');
    const validationSchema = yup.object({
        // The date field delivers null for input it cannot store
        date: yup.date().nullable().required(t('forms.fieldRequired')),
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

    const category = categoryQuery.data!;

    return (
        (<Formik
            initialValues={{
                // when editing, show the value in the unit it was entered in
                weight: weightEntry ? weightEntry.value : 0,
                unit: weightEntry ? weightUnitOf(weightEntry, category.unit) : displayUnit,
                date: weightEntry ? weightEntry.date : new Date(),
            }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
                // The form closes only once the server took the entry, so a
                // rejected write is shown instead of disappearing with it
                const options = { onSuccess: () => closeFn?.() };

                // Edit existing weight entry
                if (weightEntry) {
                    editWeightQuery.mutate(MeasurementEntry.clone(weightEntry, {
                        value: values.weight,
                        date: values.date,
                        extraData: weightEntry.extraDataInUnit(values.unit),
                    }), options);

                    // Create a new weight entry
                } else {
                    addWeightQuery.mutate(new MeasurementEntry(
                        null,
                        category.id!,
                        values.date,
                        values.weight,
                        '',
                        'user',
                        { unit: values.unit },
                    ), options);
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

                        <EntryDateTimeField
                            initialDate={weightEntry ? weightEntry.date : new Date()}
                            onChange={date => formik.setFieldValue('date', date)} />
                        <FormQueryErrors mutationQuery={weightEntry ? editWeightQuery : addWeightQuery} />
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
