import { Button, Stack, TextField } from "@mui/material";
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
    useEditMeasurementEntryQuery
} from "@/components/Measurements/queries";
import { EntryDateTimeField } from "@/components/Measurements/widgets/EntryDateTimeField";
import { Form, Formik } from "formik";
import { useTranslation } from "react-i18next";
import * as yup from 'yup';

interface EntryFormProps {
    entry?: MeasurementEntry,
    closeFn?: () => void,
    /**
     * The category the entry goes into. Taken as an object rather than an id
     * because the form needs no more than its metric type and unit: fetching
     * it would pull in the whole history for those two fields, and until it
     * arrived the value would be bounded by the custom fallback range instead
     * of the metric's own.
     */
    category: MeasurementCategory,
}

export const EntryForm = ({ entry, closeFn, category }: EntryFormProps) => {

    const [t] = useTranslation();
    const useAddEntryQuery = useAddMeasurementEntryQuery();
    const useEditEntryQuery = useEditMeasurementEntryQuery();


    // The bounds follow the metric type of the category, and for body weight
    // the unit the entry itself is in
    const limits = limitsFor(
        category.metricType,
        entry ? entry.unitOrFallback(category.unit) : category.unit,
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
                        new MeasurementEntry(null, category.id!, values.date, values.value, values.notes),
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
                        <EntryDateTimeField
                            initialDate={entry ? entry.date : new Date()}
                            onChange={date => formik.setFieldValue('date', date)} />

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

    const [t] = useTranslation();
    const addGroupEntriesQuery = useAddGroupEntriesQuery();


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
                        <EntryDateTimeField
                            initialDate={new Date()}
                            onChange={date => formik.setFieldValue('date', date)} />
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