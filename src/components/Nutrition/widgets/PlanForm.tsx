import { Button, Stack, TextField } from "@mui/material";
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
            .max(25, t('forms.maxLength', { chars: '25' }))
            .min(3, t('forms.minLength', { chars: '3' })),
    });


    return (
        <Formik
            initialValues={{
                description: plan ? plan.description : "",
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
                            helperText={formik.touched.description && formik.errors.description}
                            {...formik.getFieldProps('description')}
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
