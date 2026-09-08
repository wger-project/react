import { Button, Stack } from "@mui/material";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { Meal } from "@/components/Nutrition/models/meal";
import { useAddMealQuery, useEditMealQuery } from "@/components/Nutrition/queries";
import { useAppForm } from "@/core/forms/appForm";
import { yupSchema, submitHandler } from "@/core/forms/formUtils";
import { FormQueryErrors } from "@/core/ui/Widgets/FormError";
import { DateTime } from "luxon";
import React from 'react';
import { useTranslation } from "react-i18next";
import * as yup from "yup";

interface MealFormProps {
    planId: string,
    meal?: Meal,
    closeFn?: () => void,
}

interface MealFormValues {
    name: string,
    time: Date | null,
}

export const MealForm = ({ meal, planId, closeFn }: MealFormProps) => {

    const [t, i18n] = useTranslation();
    const addMealQuery = useAddMealQuery(planId);
    const editMealQuery = useEditMealQuery(planId);
    const validationSchema = yup.object({
        name: yup
            .string()
            .required()
            .max(25, t('forms.maxLength', { chars: '25' }))
            .min(3, t('forms.minLength', { chars: '3' })),
        time: yup
            .date()
            .required()
    });

    const defaultValues: MealFormValues = {
        name: meal ? meal.name : "",
        time: meal ? meal.time : new Date(),
    };

    const form = useAppForm({
        defaultValues,
        validators: { onChange: yupSchema<MealFormValues>(validationSchema) },
        onSubmit: async ({ value }) => {
            // The schema already refused a missing time, this only narrows the type
            if (value.time === null) {
                return;
            }

            // The dialog closes only once the server took the meal, so a
            // rejected write is shown instead of disappearing with it
            const options = { onSuccess: () => closeFn?.() };

            if (meal) {
                // Edit
                const newMeal = Meal.clone(meal, { name: value.name, time: value.time });
                editMealQuery.mutate(newMeal, options);

            } else {
                // Add
                addMealQuery.mutate(new Meal({
                    planId: planId,
                    name: value.name,
                    time: value.time,
                }), options);
            }
        },
    });

    return (
        <form onSubmit={submitHandler(form)}>
            <Stack spacing={2}>
                <form.AppField name="name">
                    {field => <field.WgerTextField
                        title={t('description')}
                    />}
                </form.AppField>

                <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={i18n.language}>
                    <form.Field name="time">
                        {field => <TimePicker
                            label={t('timeOfDay')}
                            value={field.state.value !== null ? DateTime.fromJSDate(field.state.value) : null}
                            onChange={newValue => field.handleChange(newValue ? newValue.toJSDate() : null)}
                        />}
                    </form.Field>
                </LocalizationProvider>
                <FormQueryErrors mutationQuery={meal ? editMealQuery : addMealQuery} />
                <Stack direction="row" spacing={2} sx={{ justifyContent: "end" }}>
                    {closeFn !== undefined
                        && <Button color="primary" variant="outlined" onClick={() => closeFn()}>
                            {t('close')}
                        </Button>}
                    <Button
                        disabled={addMealQuery.isPending || editMealQuery.isPending}
                        color="primary"
                        variant="contained"
                        type="submit"
                    >
                        {t('submit')}
                    </Button>
                </Stack>
            </Stack>
        </form>
    );
};
