import {
    Button,
    FormControlLabel,
    FormGroup,
    FormHelperText,
    InputAdornment,
    Stack,
    Switch,
    TextField
} from "@mui/material";
import Grid from '@mui/material/Grid';
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";

import { ENERGY_FACTOR } from "components/Nutrition/helpers/nutritionalValues";
import { NutritionalPlan } from "components/Nutrition/models/nutritionalPlan";
import { useAddNutritionalPlanQuery, useEditNutritionalPlanQuery } from "components/Nutrition/queries";
import { Form, Formik } from "formik";
import i18n from "i18n";
import { DateTime } from "luxon";
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { dateToYYYYMMDD } from "utils/date";
import * as yup from 'yup';

interface PlanFormProps {
    plan?: NutritionalPlan,
    closeFn?: () => void,
}

export const PlanForm = ({ plan, closeFn }: PlanFormProps) => {

    const [t] = useTranslation();
    const addPlanQuery = useAddNutritionalPlanQuery();
    const editPlanQuery = useEditNutritionalPlanQuery(plan?.id || 0);
    const [useGoals, setUseGoals] = useState(plan?.hasAnyGoals);
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


    return (
        (<Formik
            initialValues={{
                description: plan ? plan.description : t('nutrition.plan'),

                start: dateToYYYYMMDD(new Date()),
                end: null,

                onlyLogging: plan ? plan.onlyLogging : true,
                goalEnergy: plan ? plan.goalEnergy : null,
                goalProtein: plan ? plan.goalProtein : null,
                goalCarbohydrates: plan ? plan.goalCarbohydrates : null,
                goalFiber: plan ? plan.goalFiber : null,
                goalFat: plan ? plan.goalFat : null,
            }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
                values.goalEnergy = values.goalEnergy ? values.goalEnergy : null;
                values.goalProtein = values.goalProtein ? values.goalProtein : null;
                values.goalCarbohydrates = values.goalCarbohydrates ? values.goalCarbohydrates : null;
                values.goalFiber = values.goalFiber ? values.goalFiber : null;
                values.goalFat = values.goalFat ? values.goalFat : null;

                if (!useGoals) {
                    values.goalEnergy = null;
                    values.goalProtein = null;
                    values.goalCarbohydrates = null;
                    values.goalFiber = null;
                    values.goalFat = null;
                }


                const newPlan = new NutritionalPlan({

                    start: new Date(values.start),
                    end: values.end ? new Date(values.end) : null,

                    description: values.description,
                    onlyLogging: values.onlyLogging,
                    goalEnergy: values.goalEnergy,
                    goalProtein: values.goalProtein,
                    goalCarbohydrates: values.goalCarbohydrates,
                    goalFiber: values.goalFiber,
                    goalFat: values.goalFat,
                });


                if (plan) {
                    newPlan.id = plan.id!;
                    editPlanQuery.mutate(newPlan);
                } else {
                    addPlanQuery.mutate(newPlan);
                }

                // if closeFn is defined, close the modal (this form does not have to be displayed in one)
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
                            id="description"
                            label={t('description')}
                            error={formik.touched.description && Boolean(formik.errors.description)}
                            // @ts-ignore - the description might come from t(), which might be undefined
                            helperText={formik.touched.description && formik.errors.description}
                            {...formik.getFieldProps('description')}
                        />
                        <Grid container spacing={1}>
                            <Grid size={6}>
                                <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={i18n.language}>
                                    <DatePicker
                                        format="yyyy-MM-dd"
                                        label={t('start')}
                                        value={startDateValue}
                                        slotProps={{
                                            textField: {
                                                variant: "standard",
                                                fullWidth: true,
                                                error: formik.touched.start && Boolean(formik.errors.start),
                                                helperText: formik.touched.start && formik.errors.start ? String(formik.errors.start) : ''
                                            }
                                        }}
                                        onChange={(newValue) => {
                                            if (newValue) {
                                                formik.setFieldValue('start', newValue.toJSDate());
                                            }
                                            setStartDateValue(newValue);
                                        }}

                                    />
                                </LocalizationProvider>
                            </Grid>

                            <Grid size={6}>
                                <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={i18n.language}>
                                    <DatePicker
                                        format="yyyy-MM-dd"
                                        label={t('end')}
                                        value={endDateValue}
                                        slotProps={{
                                            textField: {
                                                variant: "standard",
                                                fullWidth: true,
                                                error: formik.touched.end && Boolean(formik.errors.end),
                                                helperText: formik.touched.end && formik.errors.end ? String(formik.errors.end) : ''
                                            }
                                        }}
                                        onChange={(newValue) => {
                                            if (newValue) {
                                                formik.setFieldValue('end', newValue.toJSDate());
                                            }
                                            setEndDateValue(newValue);
                                        }}

                                    />
                                </LocalizationProvider>
                            </Grid>
                        </Grid>

                        <FormGroup>
                            <FormControlLabel
                                label={t('nutrition.onlyLoggingHelpText')}
                                control={
                                    <Switch
                                        id="onlyLogging"
                                        checked={formik.values.onlyLogging}
                                        {...formik.getFieldProps('onlyLogging')}
                                    />}
                            />
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
                                        id="goalEnergy"
                                        checked={useGoals}
                                        onChange={() => setUseGoals(!useGoals)}

                                    />}
                            />
                        </FormGroup>
                        <FormHelperText>{t('nutrition.useGoalsHelpTextLong')}</FormHelperText>


                        {useGoals && <>
                            <TextField
                                fullWidth
                                id="energy"
                                label={t('nutrition.goalEnergy')}
                                error={formik.touched.goalEnergy && Boolean(formik.errors.goalEnergy)}
                                helperText={formik.touched.goalEnergy && formik.errors.goalEnergy}
                                {...formik.getFieldProps('goalEnergy')}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">{t('nutrition.kcal')}</InputAdornment>
                                }}
                            />
                            <Grid container spacing={1}>
                                <Grid size={4}>
                                    <TextField
                                        id="protein"
                                        fullWidth
                                        label={t('nutrition.goalProtein')}
                                        error={formik.touched.goalProtein && Boolean(formik.errors.goalProtein)}
                                        helperText={formik.touched.goalProtein && formik.errors.goalProtein}
                                        {...formik.getFieldProps('goalProtein')}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">
                                                {formik.values.goalProtein !== null && formik.values.goalProtein !== undefined
                                                    ? t('nutrition.valueEnergyKcal', { value: formik.values.goalProtein * ENERGY_FACTOR.protein })
                                                    : ''}
                                            </InputAdornment>,
                                            endAdornment: <InputAdornment position="end">
                                                {t('nutrition.gramShort')}
                                            </InputAdornment>
                                        }}
                                    />
                                </Grid>
                                <Grid size={4}>
                                    <TextField
                                        id="carbohydrates"
                                        fullWidth
                                        label={t('nutrition.goalCarbohydrates')}
                                        error={formik.touched.goalCarbohydrates && Boolean(formik.errors.goalCarbohydrates)}
                                        helperText={formik.touched.goalCarbohydrates && formik.errors.goalCarbohydrates}
                                        {...formik.getFieldProps('goalCarbohydrates')}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">
                                                {formik.values.goalCarbohydrates !== null && formik.values.goalCarbohydrates !== undefined
                                                    ? t('nutrition.valueEnergyKcal', { value: formik.values.goalCarbohydrates * ENERGY_FACTOR.carbohydrates })
                                                    : ''}
                                            </InputAdornment>,
                                            endAdornment:
                                                <InputAdornment
                                                    position="end">{t('nutrition.gramShort')}</InputAdornment>
                                        }}
                                    />
                                </Grid>
                                <Grid size={4}>
                                    <TextField
                                        id="fat"
                                        fullWidth
                                        label={t('nutrition.goalFat')}
                                        error={formik.touched.goalFat && Boolean(formik.errors.goalFat)}
                                        helperText={formik.touched.goalFat && formik.errors.goalFat}
                                        {...formik.getFieldProps('goalFat')}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">
                                                {formik.values.goalFat !== null && formik.values.goalFat !== undefined
                                                    ? t('nutrition.valueEnergyKcal', { value: formik.values.goalFat * ENERGY_FACTOR.fat })
                                                    : ''}
                                            </InputAdornment>,
                                            endAdornment:
                                                <InputAdornment
                                                    position="end">{t('nutrition.gramShort')}</InputAdornment>
                                        }}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={1}>
                                <Grid size={4}>
                                    <TextField
                                        id="fiber"
                                        fullWidth
                                        label={t('nutrition.goalFiber')}
                                        error={formik.touched.goalFiber && Boolean(formik.errors.goalFiber)}
                                        helperText={formik.touched.goalFiber && formik.errors.goalFiber}
                                        {...formik.getFieldProps('goalFiber')}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">
                                                {t('nutrition.valueEnergyKcal', { value: 0 })}
                                            </InputAdornment>,
                                            endAdornment: <InputAdornment position="end">
                                                {t('nutrition.gramShort')}
                                            </InputAdornment>
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </>}

                        <Stack direction="row" justifyContent="end" sx={{ mt: 2 }}>
                            <Button color="primary"
                                    variant="contained"
                                    type="submit"
                                    sx={{ mt: 2 }}>
                                {t('submit')}
                            </Button>
                        </Stack>
                    </Stack>
                </Form>
            )}
        </Formik>)
    );
};
