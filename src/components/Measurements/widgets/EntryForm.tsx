import { Button, Stack, TextField } from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { LoadingPlaceholder } from "@/core/ui/LoadingWidget/LoadingWidget";
import {
    categoryDisplayName,
    limitsFor,
    MeasurementCategory
} from "@/components/Measurements/models/Category";
import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import { FormQueryErrors } from "@/core/ui/Widgets/FormError";
import {
    useAddGroupEntriesQuery,
    useAddMeasurementEntryQuery,
    useEditMeasurementEntryQuery,
    useMeasurementsQuery
} from "@/components/Measurements/queries";
import { Form, Formik } from "formik";
import { DateTime } from "luxon";
import React from 'react';
import { useTranslation } from "react-i18next";
import * as yup from 'yup';

interface EntryFormProps {
    entry?: MeasurementEntry,
    closeFn?: () => void,
    categoryId: string,
}

export const EntryForm = ({ entry, closeFn, categoryId }: EntryFormProps) => {

    const [t, i18n] = useTranslation();
    const useAddEntryQuery = useAddMeasurementEntryQuery();
    const useEditEntryQuery = useEditMeasurementEntryQuery();
    const categoryQuery = useMeasurementsQuery(categoryId);

    const [dateValue, setDateValue] = React.useState<DateTime | null>(entry ? DateTime.fromJSDate(entry.date) : DateTime.now());

    // The bounds follow the metric type of the category, and for body weight
    // the unit the entry itself is in
    const category = categoryQuery.data;
    const limits = limitsFor(
        category?.metricType ?? 'custom',
        entry && category ? entry.unitOrFallback(category.unit) : category?.unit,
    );
    const validationSchema = yup.object({
        value: yup
            .number()
            .required(t('forms.fieldRequired'))
            .min(limits.min, t('forms.minValue', { value: String(limits.min) }))
            .max(limits.max, t('forms.maxValue', { value: String(limits.max) })),
        date: yup
            .date()
            .required(t('forms.fieldRequired')),
        notes: yup
            .string()
            .max(100, t('forms.maxLength', { value: '100' })),
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
                // The form closes only once the server took the entry, so a
                // rejected write is shown instead of disappearing with it
                const options = { onSuccess: () => closeFn?.() };

                // Edit existing entry
                if (entry) {
                    useEditEntryQuery.mutate(MeasurementEntry.clone(entry, values), options);
                } else {
                    useAddEntryQuery.mutate(
                        new MeasurementEntry(null, categoryId, values.date, values.value, values.notes),
                        options
                    );
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
                            slotProps={{ htmlInput: { inputMode: 'decimal' } }}
                            {...formik.getFieldProps('value')}
                        />
                        {categoryQuery.isLoading
                            ? <LoadingPlaceholder />
                            : <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={i18n.language}>
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
                        <FormQueryErrors mutationQuery={entry ? useEditEntryQuery : useAddEntryQuery} />
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

interface GroupEntryFormProps {
    group: MeasurementCategory,
    closeFn?: () => void,
}

/**
 * Adds one reading for every component of a multi-value group (e.g. systolic
 * and diastolic blood pressure): date and time are shared, one value field
 * per child category
 */
export const GroupEntryForm = ({ group, closeFn }: GroupEntryFormProps) => {

    const [t, i18n] = useTranslation();
    const addGroupEntriesQuery = useAddGroupEntriesQuery();

    const [dateValue, setDateValue] = React.useState<DateTime | null>(DateTime.now());

    const validationSchema = yup.object({
        date: yup
            .date()
            .required(t('forms.fieldRequired')),
        // Each component is bounded by its own type: systolic and diastolic
        // do not share a range
        values: yup.object(Object.fromEntries(group.children.map(child => {
            const limits = limitsFor(child.metricType, child.unit);

            return [
                child.id!,
                yup
                    .number()
                    .required(t('forms.fieldRequired'))
                    .min(limits.min, t('forms.minValue', { value: String(limits.min) }))
                    .max(limits.max, t('forms.maxValue', { value: String(limits.max) })),
            ];
        }))),
    });

    return (
        (<Formik
            initialValues={{
                date: new Date(),
                values: Object.fromEntries(group.children.map(child => [child.id!, ''])),
            }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
                addGroupEntriesQuery.mutate(
                    group.children.map(child => new MeasurementEntry(
                        null,
                        child.id!,
                        values.date,
                        Number(values.values[child.id!]),
                        '',
                    )),
                    { onSuccess: () => closeFn?.() }
                );
            }}
        >
            {formik => (
                <Form>
                    <Stack spacing={2}>
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
                        {group.children.map(child =>
                            <TextField
                                key={child.id}
                                fullWidth
                                id={`values.${child.id}`}
                                type={"number"}
                                label={`${categoryDisplayName(child, t)} (${child.unit || group.unit})`}
                                error={
                                    Boolean(formik.touched.values?.[child.id!])
                                    && Boolean(formik.errors.values?.[child.id!])
                                }
                                helperText={
                                    formik.touched.values?.[child.id!]
                                    && formik.errors.values?.[child.id!]
                                }
                                slotProps={{ htmlInput: { inputMode: 'decimal' } }}
                                {...formik.getFieldProps(`values.${child.id}`)}
                            />
                        )}
                        <FormQueryErrors mutationQuery={addGroupEntriesQuery} />
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