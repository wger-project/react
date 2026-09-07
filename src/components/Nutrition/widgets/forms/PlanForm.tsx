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
import { fieldErrorMessage, yupSchema } from "@/core/forms/formUtils";
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

/** The energy a macro goal amounts to, shown in front of it */
const energyOf = (goal: string, factor: number, t: TFunction) =>
    goal !== '' ? t('nutrition.valueEnergyKcal', { value: Number(goal) * factor }) : '';

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

    return (
        <form onSubmit={e => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
        }}>
            <Stack spacing={2}>
                <form.AppField name="description">
                    {field => <field.WgerTextField
                        title={t('description')}
                        fieldProps={{ variant: 'outlined' }}
                    />}
                </form.AppField>
                <Grid container spacing={1}>
                    <Grid size={6}>
                        <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={i18n.language}>
                            <form.Field name="start">
                                {field => {
                                    const error = field.state.meta.isTouched
                                        ? fieldErrorMessage(field.state.meta.errors)
                                        : undefined;
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
                                    const error = field.state.meta.isTouched
                                        ? fieldErrorMessage(field.state.meta.errors)
                                        : undefined;
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
                {/*TODO:  implement the options like in the mobile app */}
                {/*<FormControl fullWidth>*/}
                {/*    <InputLabel id="demo-simple-select-label">Goal Setting</InputLabel>*/}
                {/*    <Select*/}
                {/*        labelId="demo-simple-select-label"*/}
                {/*        id="demo-simple-select"*/}
                {/*        value={10}*/}
                {/*        label="Goal setting"*/}
                {/*        onChange={() => {*/}
                {/*        }}*/}
                {/*    >*/}
                {/*        <MenuItem value={10}>Based on my meals</MenuItem>*/}
                {/*        <MenuItem value={20}>Set basic macros</MenuItem>*/}
                {/*        <MenuItem value={30}>Set advanced macros</MenuItem>*/}
                {/*    </Select>*/}
                {/*</FormControl>*/}
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
                    <form.AppField name="goalEnergy">
                        {field => <field.WgerTextField
                            title={t('nutrition.goalEnergy')}
                            fieldProps={{
                                variant: 'outlined',
                                slotProps: {
                                    input: {
                                        endAdornment: <InputAdornment
                                            position="end">{t('nutrition.kcal')}</InputAdornment>
                                    },
                                    htmlInput: { inputMode: 'decimal' }
                                },
                            }}
                        />}
                    </form.AppField>
                    <Grid container spacing={1}>
                        <Grid size={4}>
                            <form.AppField name="goalProtein">
                                {field => <field.WgerTextField
                                    title={t('nutrition.goalProtein')}
                                    fieldProps={{
                                        variant: 'outlined',
                                        slotProps: {
                                            input: {
                                                startAdornment: <InputAdornment position="start">
                                                    {energyOf(field.state.value, ENERGY_FACTOR.protein, t)}
                                                </InputAdornment>,
                                                endAdornment: <InputAdornment position="end">
                                                    {t('nutrition.gramShort')}
                                                </InputAdornment>
                                            },
                                            htmlInput: { inputMode: 'decimal' }
                                        },
                                    }}
                                />}
                            </form.AppField>
                        </Grid>
                        <Grid size={4}>
                            <form.AppField name="goalCarbohydrates">
                                {field => <field.WgerTextField
                                    title={t('nutrition.goalCarbohydrates')}
                                    fieldProps={{
                                        variant: 'outlined',
                                        slotProps: {
                                            input: {
                                                startAdornment: <InputAdornment position="start">
                                                    {energyOf(field.state.value, ENERGY_FACTOR.carbohydrates, t)}
                                                </InputAdornment>,
                                                endAdornment:
                                                    <InputAdornment
                                                        position="end">{t('nutrition.gramShort')}</InputAdornment>
                                            },
                                            htmlInput: { inputMode: 'decimal' }
                                        },
                                    }}
                                />}
                            </form.AppField>
                        </Grid>
                        <Grid size={4}>
                            <form.AppField name="goalFat">
                                {field => <field.WgerTextField
                                    title={t('nutrition.goalFat')}
                                    fieldProps={{
                                        variant: 'outlined',
                                        slotProps: {
                                            input: {
                                                startAdornment: <InputAdornment position="start">
                                                    {energyOf(field.state.value, ENERGY_FACTOR.fat, t)}
                                                </InputAdornment>,
                                                endAdornment:
                                                    <InputAdornment
                                                        position="end">{t('nutrition.gramShort')}</InputAdornment>
                                            },
                                            htmlInput: { inputMode: 'decimal' }
                                        },
                                    }}
                                />}
                            </form.AppField>
                        </Grid>
                    </Grid>
                    <Grid container spacing={1}>
                        <Grid size={4}>
                            <form.AppField name="goalFiber">
                                {field => <field.WgerTextField
                                    title={t('nutrition.goalFiber')}
                                    fieldProps={{
                                        variant: 'outlined',
                                        slotProps: {
                                            input: {
                                                startAdornment: <InputAdornment position="start">
                                                    {t('nutrition.valueEnergyKcal', { value: 0 })}
                                                </InputAdornment>,
                                                endAdornment: <InputAdornment position="end">
                                                    {t('nutrition.gramShort')}
                                                </InputAdornment>
                                            },
                                            htmlInput: { inputMode: 'decimal' }
                                        },
                                    }}
                                />}
                            </form.AppField>
                        </Grid>
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
