import { Button, Stack, TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { MeasurementEntry } from "components/Measurements/models/Entry";
import {
    useAddMeasurementEntryQuery,
    useEditMeasurementEntryQuery,
    useMeasurementsQuery
} from "components/Measurements/queries";
import { Form, Formik } from "formik";
import { DateTime, Settings } from "luxon";
import React from 'react';
import { useTranslation } from "react-i18next";
import { TIMEZONE } from "utils/consts";
import { dateToYYYYMMDD } from "utils/date";
import * as yup from 'yup';

Settings.defaultZone = TIMEZONE;

interface EntryFormProps {
    entry?: MeasurementEntry,
    closeFn?: () => void,
    categoryId: number,
}

export const EntryForm = ({ entry, closeFn, categoryId }: EntryFormProps) => {

    const [t, i18n] = useTranslation();
    const useAddEntryQuery = useAddMeasurementEntryQuery();
    const useEditEntryQuery = useEditMeasurementEntryQuery();
    const categoryQuery = useMeasurementsQuery(categoryId);

    const [dateValue, setDateValue] = React.useState<DateTime | null>(entry ? DateTime.fromJSDate(entry.date) : DateTime.now());

    const validationSchema = yup.object({
        value: yup
            .number()
            .required(t('forms.fieldRequired'))
            .min(0, t('forms.minValue', { value: '0' }))
            .max(1000, t('forms.maxValue', { value: '1000' })),
        date: yup
            .date()
            .required(t('forms.fieldRequired')),
        notes: yup
            .string()
            .max(500, t('forms.maxLength', { value: '500' })),
    });


    return (
        (<Formik
            initialValues={{
                value: entry ? entry.value : 0,
                date: entry ? entry.date : new Date(),
                notes: entry ? entry.notes : "",
            }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {

                // Edit existing weight entry
                if (entry) {
                    useEditEntryQuery.mutate({ ...values, id: entry.id! });
                } else {
                    useAddEntryQuery.mutate({ ...values, categoryId: categoryId });
                }

                // if closeFn is defined, close the modal (this form does not have to
                // be displayed in a modal)
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
                            id="value"
                            type={"number"}
                            label={t('value')}
                            error={formik.touched.value && Boolean(formik.errors.value)}
                            helperText={formik.touched.value && formik.errors.value}
                            {...formik.getFieldProps('value')}
                        />
                        {categoryQuery.isLoading
                            ? <LoadingPlaceholder />
                            : <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={i18n.language}>
                                <DatePicker
                                    format="yyyy-MM-dd"
                                    label={t('date')}
                                    value={dateValue}
                                    disableFuture={true}

                                    onChange={(newValue) => {
                                        if (newValue) {
                                            formik.setFieldValue('date', newValue.toJSDate());
                                        }
                                        setDateValue(newValue);
                                    }}
                                    shouldDisableDate={(date) => {
                                        // Allow the date of the current weight entry, since we are editing it
                                        if (entry && dateToYYYYMMDD(entry.date) === dateToYYYYMMDD(date.toJSDate())) {
                                            return false;
                                        }

                                        // if date is in list of existing entries, disable it
                                        if (date) {
                                            return categoryQuery.data!.entries.some(entry => dateToYYYYMMDD(entry.date) === dateToYYYYMMDD(date.toJSDate()));
                                        }

                                        // all other dates are allowed
                                        return false;
                                    }}
                                />
                            </LocalizationProvider>}

                        <TextField
                            fullWidth
                            id="notes"
                            label={t('notes')}
                            multiline
                            error={formik.touched.notes && Boolean(formik.errors.notes)}
                            helperText={formik.touched.notes && formik.errors.notes}
                            {...formik.getFieldProps('notes')}
                        />

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
