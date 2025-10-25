import { Button, Stack, TextField } from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { WeightEntry } from "components/BodyWeight/model";
import { useAddWeightEntryQuery, useBodyWeightQuery, useEditWeightEntryQuery } from "components/BodyWeight/queries";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { Form, Formik } from "formik";
import { DateTime } from "luxon";
import { useState } from 'react';
import { useTranslation } from "react-i18next";
import { dateToYYYYMMDD } from "utils/date";
import * as yup from 'yup';

interface WeightFormProps {
    weightEntry?: WeightEntry,
    closeFn?: () => void,
}

export const WeightForm = ({ weightEntry, closeFn }: WeightFormProps) => {

    const weightEntriesQuery = useBodyWeightQuery();
    const addWeightQuery = useAddWeightEntryQuery();
    const editWeightQuery = useEditWeightEntryQuery();

    const [dateValue, setDateValue] = useState<DateTime | null>(weightEntry ? DateTime.fromJSDate(weightEntry.date) : DateTime.now);
    const [t, i18n] = useTranslation();

    const validationSchema = yup.object({
        weight: yup
            .number()
            .min(30, 'Min weight is 30 kg')
            .max(300, 'Max weight is 300 kg')
            .required('Weight field is required'),
    });

    if (weightEntriesQuery.isLoading) {
        return <LoadingPlaceholder />;
    }

    return (
        (<Formik
            initialValues={{
                weight: weightEntry ? weightEntry.weight : 0,
                date: weightEntry ? weightEntry.date : new Date(),
            }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {

                // Edit existing weight entry
                if (weightEntry) {
                    weightEntry.weight = values.weight;
                    weightEntry.date = values.date;
                    editWeightQuery.mutate(weightEntry);

                    // Create a new weight entry
                } else {
                    weightEntry = new WeightEntry(values.date, values.weight);
                    addWeightQuery.mutate(weightEntry);
                }

                if (closeFn) {
                    closeFn();
                }
            }}
        >
            {formik => (
                <Form>
                    <Stack spacing={2}>
                        <TextField
                            fullWidth
                            id="weight"
                            label={t('weight')}
                            error={formik.touched.weight && Boolean(formik.touched.weight)}
                            helperText={formik.touched.weight && formik.errors.weight}
                            {...formik.getFieldProps('weight')}
                        />

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
                        <Stack direction="row" justifyContent="end" sx={{ mt: 2 }}>
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
