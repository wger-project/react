import {
    Button,
    FormControlLabel,
    FormGroup,
    FormHelperText,
    InputAdornment,
    Stack,
    Switch
} from "@mui/material";
import Grid from '@mui/material/Grid';
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";

import { ENERGY_FACTOR } from "@/components/Nutrition/helpers/nutritionalValues";
import { FormQueryErrors } from "@/core/ui/Widgets/FormError";
import { NutritionalPlan } from "@/components/Nutrition/models/nutritionalPlan";
import { useAddNutritionalPlanQuery, useEditNutritionalPlanQuery } from "@/components/Nutrition/queries";
import { useAppForm } from "@/core/forms/appForm";
import { yupSchema, fieldError, submitHandler } from "@/core/forms/formUtils";
import i18n from "@/i18n";
import { TFunction } from "i18next";
import { DateTime } from "luxon";
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { dateToYYYYMMDD, yyyymmddToDate } from "@/core/lib/date";
import * as yup from 'yup';

interface PlanFormProps {
    plan?: NutritionalPlan,
    closeFn?: () => void,
}

interface PlanFormValues {
    description: string,
    // YYYY-MM-DD, what the date pickers hand over
    start: string,
    end: string | null,
    onlyLogging: boolean,
    // The text fields hand over strings, the schema casts them to numbers;
    // the empty string is a goal that is not set
    goalEnergy: string,
    goalProtein: string,
    goalCarbohydrates: string,
    goalFiber: string,
    goalFat: string,
}

const goalString = (goal: number | null | undefined): string =>
    goal === null || goal === undefined ? '' : String(goal);

type GoalName = 'goalEnergy' | 'goalProtein' | 'goalCarbohydrates' | 'goalFiber' | 'goalFat';

/** The energy a macro goal amounts to, shown in front of it; fibre has none, so its zero always shows */
const energyOf = (goal: string, factor: number, t: TFunction) =>
    goal !== '' || factor === 0 ? t('nutrition.valueEnergyKcal', { value: Number(goal) * factor }) : '';

export const PlanForm = ({ plan, closeFn }: PlanFormProps) => {

    const [t] = useTranslation();
    const addPlanQuery = useAddNutritionalPlanQuery();
    const editPlanQuery = useEditNutritionalPlanQuery(plan?.id ?? '');
    const [useGoals, setUseGoals] = useState(plan?.hasAnyGoals ?? false);
    const [startDateValue, setStartDateValue] = useState<DateTime | null>(plan ? DateTime.fromJSDate(plan.start) : DateTime.now);
    const [endDateValue, setEndDateValue] = useState<DateTime | null>(plan && plan?.end !== null ? DateTime.fromJSDate(plan!.end) : null);

    const validationSchema = yup.object({
        description: yup
            .string()
            .required()
            .max(25, t('forms.maxLength', { chars: '25' }))
            .min(3, t('forms.minLength', { chars: '3' })),
        onlyLogging: yup
            .boolean(),
        goalEnergy: yup
            .number()
            .notRequired()
            .positive()
            .max(6000, t('forms.maxValue', { value: '6000kcal' })),
        goalProtein: yup
            .number()
            .notRequired()
            .positive()
            .max(500, t('forms.maxValue', { value: '500' })),
        goalCarbohydrates: yup
            .number()
            .notRequired()
            .positive() // TODO: allow 0 but not negative
            .max(750, t('forms.maxValue', { value: '750' })),
        goalFiber: yup
            .number()
            .notRequired()
            .positive()
            .max(500, t('forms.maxValue', { value: '500' })),
        goalFat: yup
            .number()
            .notRequired()
            .positive()
            .max(500, t('forms.maxValue', { value: '500' })),
        start: yup
            .date()
            .required(),
        end: yup
            .date()
            .nullable()
            .min(
                yup.ref('start'),
                t('forms.endBeforeStart')
            )
    });

    const defaultValues: PlanFormValues = {
        description: plan ? plan.description : t('nutrition.plan'),

        start: plan ? dateToYYYYMMDD(plan.start) : dateToYYYYMMDD(new Date()),
        end: plan && plan.end !== null ? dateToYYYYMMDD(plan.end) : null,

        onlyLogging: plan ? plan.onlyLogging : true,
        goalEnergy: goalString(plan?.goalEnergy),
        goalProtein: goalString(plan?.goalProtein),
        goalCarbohydrates: goalString(plan?.goalCarbohydrates),
        goalFiber: goalString(plan?.goalFiber),
        goalFat: goalString(plan?.goalFat),
    };

    const form = useAppForm({
        defaultValues,
        validators: { onChange: yupSchema<PlanFormValues>(validationSchema) },
        onSubmit: async ({ value }) => {
            // A goal counts only while the goals are switched on
            const goal = (entered: string): number | null =>
                useGoals && entered !== '' ? Number(entered) : null;

            const newPlan = new NutritionalPlan({

                // the values are YYYY-MM-DD strings, parse them as local dates:
                // new Date() would interpret them as UTC midnight and shift the
                // day in timezones behind UTC
                start: yyyymmddToDate(value.start),
                end: value.end ? yyyymmddToDate(value.end) : null,

                description: value.description,
                onlyLogging: value.onlyLogging,
                goalEnergy: goal(value.goalEnergy),
                goalProtein: goal(value.goalProtein),
                goalCarbohydrates: goal(value.goalCarbohydrates),
                goalFiber: goal(value.goalFiber),
                goalFat: goal(value.goalFat),
            });


            // The dialog closes only once the server took the plan, so a
            // rejected write is shown instead of disappearing with it
            const options = { onSuccess: () => closeFn?.() };

            if (plan) {
                newPlan.id = plan.id!;
                editPlanQuery.mutate(newPlan, options);
            } else {
                addPlanQuery.mutate(newPlan, options);
            }
        },
    });

    /** A goal in kcal or grams; with an energy factor the field shows what the grams amount to */
    const goalField = (name: GoalName, energyFactor?: number) => (
        <form.AppField name={name}>
            {field => <field.WgerTextField
                title={t(`nutrition.${name}`)}
                fieldProps={{
                    slotProps: {
                        input: {
                            startAdornment: energyFactor !== undefined
                                ? <InputAdornment position="start">
                                    {energyOf(field.state.value, energyFactor, t)}
                                </InputAdornment>
                                : undefined,
                            endAdornment: <InputAdornment position="end">
                                {t(name === 'goalEnergy' ? 'nutrition.kcal' : 'nutrition.gramShort')}
                            </InputAdornment>,
                        },
                        htmlInput: { inputMode: 'decimal' },
                    },
                }}
            />}
        </form.AppField>
    );

    return (
        <form onSubmit={submitHandler(form)}>
            <Stack spacing={2}>
                <form.AppField name="description">
                    {field => <field.WgerTextField
                        title={t('description')}
                    />}
                </form.AppField>
                <Grid container spacing={1}>
                    <Grid size={6}>
                        <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={i18n.language}>
                            <form.Field name="start">
                                {field => {
                                    const error = fieldError(field);
                                    return <DatePicker
                                        format="yyyy-MM-dd"
                                        label={t('start')}
                                        value={startDateValue}
                                        slotProps={{
                                            textField: {
                                                variant: "standard",
                                                fullWidth: true,
                                                error: error !== undefined,
                                                helperText: error ?? ''
                                            }
                                        }}
                                        onChange={(newValue) => {
                                            if (newValue) {
                                                field.handleChange(dateToYYYYMMDD(newValue.toJSDate()));
                                            }
                                            setStartDateValue(newValue);
                                        }}
                                    />;
                                }}
                            </form.Field>
                        </LocalizationProvider>
                    </Grid>

                    <Grid size={6}>
                        <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={i18n.language}>
                            <form.Field name="end">
                                {field => {
                                    const error = fieldError(field);
                                    return <DatePicker
                                        format="yyyy-MM-dd"
                                        label={t('end')}
                                        value={endDateValue}
                                        slotProps={{
                                            textField: {
                                                variant: "standard",
                                                fullWidth: true,
                                                error: error !== undefined,
                                                helperText: error ?? ''
                                            }
                                        }}
                                        onChange={(newValue) => {
                                            if (newValue) {
                                                field.handleChange(dateToYYYYMMDD(newValue.toJSDate()));
                                            }
                                            setEndDateValue(newValue);
                                        }}
                                    />;
                                }}
                            </form.Field>
                        </LocalizationProvider>
                    </Grid>
                </Grid>

                <FormGroup>
                    <form.Field name="onlyLogging">
                        {field => <FormControlLabel
                            label={t('nutrition.onlyLoggingHelpText')}
                            control={
                                <Switch
                                    id="onlyLogging"
                                    name={field.name}
                                    checked={field.state.value}
                                    onChange={event => field.handleChange(event.target.checked)}
                                    onBlur={field.handleBlur}
                                />}
                        />}
                    </form.Field>
                </FormGroup>
                <FormGroup>
                    <FormControlLabel
                        label={t('nutrition.useGoalsHelpText')}
                        control={
                            <Switch
                                id="useGoals"
                                checked={useGoals}
                                onChange={() => setUseGoals(!useGoals)}

                            />}
                    />
                </FormGroup>
                <FormHelperText>{t('nutrition.useGoalsHelpTextLong')}</FormHelperText>


                {useGoals && <>
                    {goalField('goalEnergy')}
                    <Grid container spacing={1}>
                        <Grid size={4}>{goalField('goalProtein', ENERGY_FACTOR.protein)}</Grid>
                        <Grid size={4}>{goalField('goalCarbohydrates', ENERGY_FACTOR.carbohydrates)}</Grid>
                        <Grid size={4}>{goalField('goalFat', ENERGY_FACTOR.fat)}</Grid>
                    </Grid>
                    <Grid container spacing={1}>
                        <Grid size={4}>{goalField('goalFiber', 0)}</Grid>
                    </Grid>
                </>}

                <FormQueryErrors mutationQuery={plan ? editPlanQuery : addPlanQuery} />
                <Stack direction="row" sx={{ justifyContent: "end", mt: 2 }}>
                    <Button color="primary"
                            variant="contained"
                            type="submit"
                            sx={{ mt: 2 }}>
                        {t('submit')}
                    </Button>
                </Stack>
            </Stack>
        </form>
    );
};
