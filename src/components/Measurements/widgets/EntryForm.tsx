import { Button, Stack } from "@mui/material";
import {
    categoryDisplayName,
    MeasurementCategory
} from "@/components/Measurements/models/Category";
import { limitsSchema } from "@/components/Measurements/widgets/limitsSchema";
import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import { FormQueryErrors } from "@/core/ui/Widgets/FormError";
import {
    useAddGroupEntriesQuery,
    useAddMeasurementEntryQuery,
    useEditMeasurementEntryQuery
} from "@/components/Measurements/queries";
import { EntryDateTimeField } from "@/components/Measurements/widgets/EntryDateTimeField";
import { useAppForm } from "@/core/forms/appForm";
import { yupSchema, submitHandler } from "@/core/forms/formUtils";
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

interface EntryFormValues {
    // The text field hands over strings, the schema casts them to numbers
    value: string,
    date: Date | null,
    notes: string,
}

export const EntryForm = ({ entry, closeFn, category }: EntryFormProps) => {

    const [t] = useTranslation();
    const useAddEntryQuery = useAddMeasurementEntryQuery();
    const useEditEntryQuery = useEditMeasurementEntryQuery();


    // The bounds follow the metric type of the category, and for body weight
    // the unit the entry itself is in
    const validationSchema = yup.object({
        value: limitsSchema(
            category.metricType,
            entry ? entry.unitOrFallback(category.unit) : category.unit,
            t,
        ),
        date: yup
            .date()
            .required(t('forms.fieldRequired')),
        notes: yup
            .string()
            .max(100, t('forms.maxLength', { value: '100' })),
    });

    const initialDate = entry ? entry.date : new Date();
    const defaultValues: EntryFormValues = {
        value: String(entry ? entry.value : 0),
        date: initialDate,
        notes: entry ? entry.notes : "",
    };

    const form = useAppForm({
        defaultValues,
        validators: { onChange: yupSchema<EntryFormValues>(validationSchema) },
        onSubmit: async ({ value: values }) => {
            // The schema already refused a null date, this only narrows the type
            if (values.date === null) {
                return;
            }
            const value = Number(values.value);

            // The form closes only once the server took the entry, so a
            // rejected write is shown instead of disappearing with it
            const options = { onSuccess: () => closeFn?.() };

            // Edit existing entry
            if (entry) {
                useEditEntryQuery.mutate(MeasurementEntry.clone(entry, {
                    value: value,
                    date: values.date,
                    notes: values.notes,
                }), options);
            } else {
                useAddEntryQuery.mutate(
                    new MeasurementEntry(null, category.id!, values.date, value, values.notes),
                    options
                );
            }
        },
    });

    return (
        <form onSubmit={submitHandler(form)}>
            <Stack spacing={2}>
                <form.AppField name="value">
                    {field => <field.WgerTextField
                        title={t('value')}
                        fieldProps={{
                            type: 'number',
                            slotProps: { htmlInput: { inputMode: 'decimal' } },
                        }}
                    />}
                </form.AppField>
                <EntryDateTimeField
                    initialDate={initialDate}
                    onChange={date => form.setFieldValue('date', date)} />

                <form.AppField name="notes">
                    {field => <field.WgerTextField
                        title={t('notes')}
                        fieldProps={{ multiline: true }}
                    />}
                </form.AppField>
                <FormQueryErrors mutationQuery={entry ? useEditEntryQuery : useAddEntryQuery} />
                <Stack direction="row" sx={{ justifyContent: "end", mt: 2 }}>
                    <Button color="primary" variant="contained" type="submit" sx={{ mt: 2 }}>
                        {t('submit')}
                    </Button>
                </Stack>
            </Stack>
        </form>
    );
};

interface GroupEntryFormProps {
    group: MeasurementCategory,
    closeFn?: () => void,
}

interface GroupEntryFormValues {
    date: Date | null,
    // One value per child category, keyed by its id
    values: Record<string, string>,
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
        values: yup.object(Object.fromEntries(group.children.map(child =>
            [child.id!, limitsSchema(child.metricType, child.unit, t)]
        ))),
    });

    const initialDate = new Date();
    const defaultValues: GroupEntryFormValues = {
        date: initialDate,
        values: Object.fromEntries(group.children.map(child => [child.id!, ''])),
    };

    const form = useAppForm({
        defaultValues,
        validators: { onChange: yupSchema<GroupEntryFormValues>(validationSchema) },
        onSubmit: async ({ value: values }) => {
            if (values.date === null) {
                return;
            }
            const date = values.date;

            addGroupEntriesQuery.mutate(
                group.children.map(child => new MeasurementEntry(
                    null,
                    child.id!,
                    date,
                    Number(values.values[child.id!]),
                    '',
                )),
                { onSuccess: () => closeFn?.() }
            );
        },
    });

    return (
        <form onSubmit={submitHandler(form)}>
            <Stack spacing={2}>
                <EntryDateTimeField
                    initialDate={initialDate}
                    onChange={date => form.setFieldValue('date', date)} />
                {group.children.map(child =>
                    <form.AppField key={child.id} name={`values.${child.id}`}>
                        {field => <field.WgerTextField
                            title={`${categoryDisplayName(child, t)} (${child.unit || group.unit})`}
                            fieldProps={{
                                type: 'number',
                                slotProps: { htmlInput: { inputMode: 'decimal' } },
                            }}
                        />}
                    </form.AppField>
                )}
                <FormQueryErrors mutationQuery={addGroupEntriesQuery} />
                <Stack direction="row" sx={{ justifyContent: "end", mt: 2 }}>
                    <Button color="primary" variant="contained" type="submit" sx={{ mt: 2 }}>
                        {t('submit')}
                    </Button>
                </Stack>
            </Stack>
        </form>
    );
};
