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
import Grid from '@mui/material/Grid2';

import { ENERGY_FACTOR } from "components/Nutrition/helpers/nutritionalValues";
import { NutritionalPlan } from "components/Nutrition/models/nutritionalPlan";
import { useAddNutritionalPlanQuery, useEditNutritionalPlanQuery } from "components/Nutrition/queries";
import { Form, Formik } from "formik";
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import * as yup from 'yup';

interface PlanFormProps {
    plan?: NutritionalPlan,
    closeFn?: Function,
}

export const PlanForm = ({ plan, closeFn }: PlanFormProps) => {

    const [t] = useTranslation();
    const addPlanQuery = useAddNutritionalPlanQuery();
    const editPlanQuery = useEditNutritionalPlanQuery(plan?.id!);
    const [useGoals, setUseGoals] = useState(plan?.hasAnyGoals);
    const validationSchema = yup.object({
        description: yup
            .string()
            .required()
            .max(25, t('forms.maxLength', { chars: '25' }))
            .min(3, t('forms.minLength', { chars: '3' })),
        // eslint-disable-next-line camelcase
        only_logging: yup
            .boolean(),
        // eslint-disable-next-line camelcase
        goal_energy: yup
            .number()
            .notRequired()
            .positive()
            .max(6000, t('forms.maxValue', { value: '6000kcal' })),
        // .test(
        //     'goal_energy_test',
        //     'the energy is too damn high!',
        //     (value, context) => {
        //         return context.parent.goal_protein * ENERGY_FACTOR.protein < context.parent.goal_energy;
        //     }),
        // eslint-disable-next-line camelcase
        goal_protein: yup
            .number()
            .notRequired()
            .positive()
            .max(500, t('forms.maxValue', { value: '500' })),
        // eslint-disable-next-line camelcase
        goal_carbohydrates: yup
            .number()
            .notRequired()
            .positive() // TODO: allow 0 but not negative
            .max(750, t('forms.maxValue', { value: '750' })),
        // eslint-disable-next-line camelcase
        goal_fiber: yup
            .number()
            .notRequired()
            .positive()
            .max(500, t('forms.maxValue', { value: '500' })),
        // eslint-disable-next-line camelcase
        goal_fat: yup
            .number()
            .notRequired()
            .positive()
            .max(500, t('forms.maxValue', { value: '500' })),
    });


    return (
        (<Formik
            initialValues={{
                description: plan ? plan.description : t('nutrition.plan'),
                // eslint-disable-next-line camelcase
                only_logging: plan ? plan.onlyLogging : true,
                // eslint-disable-next-line camelcase
                goal_energy: plan ? plan.goalEnergy : null,
                // eslint-disable-next-line camelcase
                goal_protein: plan ? plan.goalProtein : null,
                // eslint-disable-next-line camelcase
                goal_carbohydrates: plan ? plan.goalCarbohydrates : null,
                // eslint-disable-next-line camelcase
                goal_fiber: plan ? plan.goalFiber : null,
                // eslint-disable-next-line camelcase
                goal_fat: plan ? plan.goalFat : null,
            }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {

                // eslint-disable-next-line camelcase
                values.goal_energy = values.goal_energy ? values.goal_energy : null;
                // eslint-disable-next-line camelcase
                values.goal_protein = values.goal_protein ? values.goal_protein : null;
                // eslint-disable-next-line camelcase
                values.goal_carbohydrates = values.goal_carbohydrates ? values.goal_carbohydrates : null;
                // eslint-disable-next-line camelcase
                values.goal_fiber = values.goal_fiber ? values.goal_fiber : null;
                // eslint-disable-next-line camelcase
                values.goal_fat = values.goal_fat ? values.goal_fat : null;

                if (plan) {
                    editPlanQuery.mutate({ ...values, id: plan.id });
                } else {
                    addPlanQuery.mutate(values);
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
                        <FormGroup>
                            <FormControlLabel
                                label={t('nutrition.onlyLoggingHelpText')}
                                control={
                                    <Switch
                                        id="onlyLogging"
                                        checked={formik.values.only_logging}
                                        {...formik.getFieldProps('only_logging')}
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
                        <FormControlLabel
                            label={t('nutrition.useGoalsHelpText')}
                            control={
                                <Switch
                                    id="goalEnergy"
                                    checked={useGoals}
                                    onChange={() => setUseGoals(!useGoals)}
                                />}
                        />
                        <FormHelperText>{t('nutrition.useGoalsHelpTextLong')}</FormHelperText>


                        {useGoals && <>
                            <TextField
                                fullWidth
                                id="energy"
                                label={t('nutrition.goalEnergy')}
                                error={formik.touched.goal_energy && Boolean(formik.errors.goal_energy)}
                                helperText={formik.touched.goal_energy && formik.errors.goal_energy}
                                {...formik.getFieldProps('goal_energy')}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">{t('nutrition.kcal')}</InputAdornment>
                                }}
                            />
                            <Grid container spacing={1}>
                                <Grid size={4}>
                                    <TextField
                                        id="protein"
                                        label={t('nutrition.goalProtein')}
                                        error={formik.touched.goal_protein && Boolean(formik.errors.goal_protein)}
                                        helperText={formik.touched.goal_protein && formik.errors.goal_protein}
                                        {...formik.getFieldProps('goal_protein')}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">
                                                {formik.values.goal_protein !== null && formik.values.goal_protein !== undefined
                                                    ? t('nutrition.valueEnergyKcal', { value: formik.values.goal_protein * ENERGY_FACTOR.protein })
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
                                        label={t('nutrition.goalCarbohydrates')}
                                        error={formik.touched.goal_carbohydrates && Boolean(formik.errors.goal_carbohydrates)}
                                        helperText={formik.touched.goal_carbohydrates && formik.errors.goal_carbohydrates}
                                        {...formik.getFieldProps('goal_carbohydrates')}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">
                                                {formik.values.goal_carbohydrates !== null && formik.values.goal_carbohydrates !== undefined
                                                    ? t('nutrition.valueEnergyKcal', { value: formik.values.goal_carbohydrates * ENERGY_FACTOR.carbohydrates })
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
                                        label={t('nutrition.goalFat')}
                                        error={formik.touched.goal_fat && Boolean(formik.errors.goal_fat)}
                                        helperText={formik.touched.goal_fat && formik.errors.goal_fat}
                                        {...formik.getFieldProps('goal_fat')}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">
                                                {formik.values.goal_fat !== null && formik.values.goal_fat !== undefined
                                                    ? t('nutrition.valueEnergyKcal', { value: formik.values.goal_fat * ENERGY_FACTOR.fat })
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
                                        label={t('nutrition.goalFiber')}
                                        error={formik.touched.goal_fiber && Boolean(formik.errors.goal_fiber)}
                                        helperText={formik.touched.goal_fiber && formik.errors.goal_fiber}
                                        {...formik.getFieldProps('goal_fiber')}
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
