import { Button, Checkbox, FormControlLabel, Stack, TextField } from "@mui/material";
import { NutritionalPlan } from "components/Nutrition/models/nutritionalPlan";

import { useAddNutritionalPlanQuery, useEditNutritionalPlanQuery } from "components/Nutrition/queries";
import { Form, Formik } from "formik";
import React from 'react';
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
    const validationSchema = yup.object({
        description: yup
            .string()
            .required()
            .max(25, t('forms.maxLength', { chars: '25' }))
            .min(3, t('forms.minLength', { chars: '3' })),
        // eslint-disable-next-line camelcase
        only_logging: yup
            .boolean()
    });


    return (
        <Formik
            initialValues={{
                description: plan ? plan.description : t('nutrition.plan'),
                // eslint-disable-next-line camelcase
                only_logging: plan ? plan.onlyLogging : false,
            }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {

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
                        <FormControlLabel
                            label={t('nutrition.onlyLoggingHelpText')}
                            control={
                                <Checkbox
                                    id="onlyLogging"
                                    checked={formik.values.only_logging}
                                    {...formik.getFieldProps('only_logging')}
                                />}

                        />

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
        </Formik>
    );
};
