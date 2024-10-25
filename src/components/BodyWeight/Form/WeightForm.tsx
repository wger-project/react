import { Button, Stack, TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { WeightEntry } from "components/BodyWeight/model";
import { useAddWeightEntryQuery, useBodyWeightQuery, useEditWeightEntryQuery } from "components/BodyWeight/queries";
import { Form, Formik } from "formik";
import { DateTime } from "luxon";
import { useState } from 'react';
import { useTranslation } from "react-i18next";
import { dateToYYYYMMDD } from "utils/date";
import * as yup from 'yup';

interface WeightFormProps {
    weightEntry?: WeightEntry,
    closeFn?: Function,
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

    return (
        (<Formik
            initialValues={{
                weight: weightEntry ? weightEntry.weight : 0,
                date: weightEntry ? dateToYYYYMMDD(weightEntry.date) : dateToYYYYMMDD(new Date()),
            }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {

                // Edit existing weight entry
                if (weightEntry) {
                    weightEntry.weight = values.weight;
                    weightEntry.date = new Date(values.date);
                    try {
                        editWeightQuery.mutate(weightEntry);
                    } catch (error) {

                    }

                    // Create new weight entry
                } else {
                    weightEntry = new WeightEntry(new Date(values.date), values.weight);
                    try {
                        addWeightQuery.mutate(weightEntry);
                    } catch (error) {
                    }
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
                            <DatePicker
                                format="yyyy-MM-dd"
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
                                shouldDisableDate={(date) => {

                                    // Allow the date of the current weight entry, since we are editing it
                                    if (weightEntry && dateToYYYYMMDD(weightEntry.date) === date.toISODate()) {
                                        return false;
                                    }

                                    // if date is in list of weight entries, disable it
                                    if (date) {
                                        return weightEntriesQuery.data!.some(entry => dateToYYYYMMDD(entry.date) === (date as unknown as DateTime).toISODate());
                                    }

                                    // all other dates are allowed
                                    return false;
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
