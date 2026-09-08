import { Button, Stack, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { MeasurementCategory, METRIC_TYPE_BODY_WEIGHT } from "@/components/Measurements/models/Category";
import { limitsSchema } from "@/components/Measurements/widgets/limitsSchema";
import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import { FormQueryErrors } from "@/core/ui/Widgets/FormError";
import {
    useAddMeasurementEntryQuery,
    useEditMeasurementEntryQuery
} from "@/components/Measurements/queries";
import { weightUnitOf } from "@/components/Measurements/models/bodyWeight";
import { useBodyWeightCategoryQuery, useDisplayWeightUnit } from "@/components/Measurements/queries/bodyWeight";
import { useProfileQuery } from "@/components/User";
import { useAppForm } from "@/core/forms/appForm";
import { yupSchema, submitHandler } from "@/core/forms/formUtils";
import { WeightUnit } from "@/core/lib/weightUnit";
import { LoadingPlaceholder } from "@/core/ui/LoadingWidget/LoadingWidget";
import { EntryDateTimeField } from "@/components/Measurements/widgets/EntryDateTimeField";
import { useTranslation } from "react-i18next";
import * as yup from 'yup';

interface WeightFormProps {
    weightEntry?: MeasurementEntry,
    closeFn?: () => void,
}

interface WeightFormValues {
    // The text field hands over strings, the schema casts them to numbers
    weight: string,
    unit: WeightUnit,
    date: Date | null,
}

export const WeightForm = ({ weightEntry, closeFn }: WeightFormProps) => {
    const categoryQuery = useBodyWeightCategoryQuery();
    const profileQuery = useProfileQuery();
    const displayUnit = useDisplayWeightUnit();

    // Also wait for the profile: the form freezes its default values, and the
    // unit default falls back to kg while the profile has not loaded yet
    if (categoryQuery.isLoading || profileQuery.isLoading) {
        return <LoadingPlaceholder />;
    }

    return <WeightFormFields
        category={categoryQuery.data!}
        displayUnit={displayUnit}
        weightEntry={weightEntry}
        closeFn={closeFn}
    />;
};

const WeightFormFields = ({ category, displayUnit, weightEntry, closeFn }: WeightFormProps & {
    category: MeasurementCategory,
    displayUnit: WeightUnit,
}) => {
    const addWeightQuery = useAddMeasurementEntryQuery();
    const editWeightQuery = useEditMeasurementEntryQuery();
    const [t] = useTranslation();

    const validationSchema = yup.object({
        // The date field delivers null for input it cannot store
        date: yup.date().nullable().required(t('forms.fieldRequired')),
        unit: yup.string().oneOf(['kg', 'lb']),
        // The bounds follow the unit the value is typed in
        weight: yup
            .number()
            .when('unit', {
                is: 'lb',
                then: () => limitsSchema(METRIC_TYPE_BODY_WEIGHT, 'lb', t, t('server.lb')),
                otherwise: () => limitsSchema(METRIC_TYPE_BODY_WEIGHT, 'kg', t, t('server.kg')),
            }),
    });

    const initialDate = weightEntry ? weightEntry.date : new Date();
    const defaultValues: WeightFormValues = {
        // when editing, show the value in the unit it was entered in
        weight: String(weightEntry ? weightEntry.value : 0),
        unit: weightEntry ? weightUnitOf(weightEntry, category.unit) : displayUnit,
        date: initialDate,
    };

    const form = useAppForm({
        defaultValues,
        validators: { onChange: yupSchema<WeightFormValues>(validationSchema) },
        onSubmit: async ({ value }) => {
            // The schema already refused a null date, this only narrows the type
            if (value.date === null) {
                return;
            }
            const weight = Number(value.weight);

            // The form closes only once the server took the entry, so a
            // rejected write is shown instead of disappearing with it
            const options = { onSuccess: () => closeFn?.() };

            // Edit existing weight entry
            if (weightEntry) {
                editWeightQuery.mutate(MeasurementEntry.clone(weightEntry, {
                    value: weight,
                    date: value.date,
                    extraData: weightEntry.extraDataInUnit(value.unit),
                }), options);

                // Create a new weight entry
            } else {
                addWeightQuery.mutate(new MeasurementEntry(
                    null,
                    category.id!,
                    value.date,
                    weight,
                    '',
                    'user',
                    { unit: value.unit },
                ), options);
            }
        },
    });

    return (
        <form onSubmit={submitHandler(form)}>
            <Stack spacing={2}>
                <Stack direction="row" spacing={2}>
                    <form.AppField name="weight">
                        {field => <field.WgerTextField
                            title={t('weight')}
                            fieldProps={{ slotProps: { htmlInput: { inputMode: 'decimal' } } }}
                        />}
                    </form.AppField>
                    <form.Field name="unit">
                        {field => (
                            <ToggleButtonGroup
                                exclusive
                                value={field.state.value}
                                onChange={(_, newUnit: WeightUnit | null) => {
                                    if (newUnit) {
                                        field.handleChange(newUnit);
                                    }
                                }}
                            >
                                <ToggleButton value="kg">{t('server.kg')}</ToggleButton>
                                <ToggleButton value="lb">{t('server.lb')}</ToggleButton>
                            </ToggleButtonGroup>
                        )}
                    </form.Field>
                </Stack>

                <EntryDateTimeField
                    initialDate={initialDate}
                    onChange={date => form.setFieldValue('date', date)} />
                <FormQueryErrors mutationQuery={weightEntry ? editWeightQuery : addWeightQuery} />
                <Stack direction="row" sx={{ justifyContent: "end", mt: 2 }}>
                    <Button color="primary" variant="contained" type="submit" sx={{ mt: 2 }}>
                        {t('submit')}
                    </Button>
                </Stack>
            </Stack>
        </form>
    );
};
