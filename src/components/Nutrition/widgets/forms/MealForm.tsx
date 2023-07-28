import React from 'react';
import * as yup from 'yup';
import { Form, Formik } from "formik";
import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Meal } from "components/Nutrition/models/meal";
import { useAddMealQuery, useEditMealQuery } from "components/Nutrition/queries";

interface MealFormProps {
    planId: number,
    meal?: Meal,
    closeFn?: Function,
}

export const MealForm = ({ meal, planId, closeFn }: MealFormProps) => {

    const [t] = useTranslation();
    const addMealQuery = useAddMealQuery(planId);
    const editMealQuery = useEditMealQuery(planId);
    const validationSchema = yup.object({
        name: yup
            .string()
            .max(25, t('forms.maxLength', { chars: '25' }))
            .min(3, t('forms.minLength', { chars: '3' })),
        time: yup
            .string()
            .max(25, t('forms.maxLength', { chars: '25' }))
            .min(3, t('forms.minLength', { chars: '3' })),
    });

    if (closeFn && (addMealQuery.isSuccess || editMealQuery.isSuccess)) {
        closeFn();
    }


    return (
        <Formik
            initialValues={{
                name: meal ? meal.name : "",
                time: meal ? meal.time : "12:00"
            }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
                if (meal) {
                    editMealQuery.mutate({ ...values, plan: planId, id: meal.id });
                } else {
                    addMealQuery.mutate({ ...values, plan: planId });
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
                            id="name"
                            label={t('description')}
                            error={formik.touched.name && Boolean(formik.errors.name)}
                            helperText={formik.touched.name && formik.errors.name}
                            {...formik.getFieldProps('name')}
                        />
                        <TextField
                            fullWidth
                            id="time"
                            label={t('description')}
                            error={formik.touched.time && Boolean(formik.errors.time)}
                            helperText={formik.touched.time && formik.errors.time}
                            {...formik.getFieldProps('time')}
                        />
                        <Stack direction="row" justifyContent="end" sx={{ mt: 2 }}>
                            <Button
                                disabled={addMealQuery.isLoading || editMealQuery.isLoading || addMealQuery.isSuccess || editMealQuery.isSuccess}
                                color="primary"
                                variant="contained"
                                type="submit"
                                sx={{ mt: 2 }}
                            >
                                {addMealQuery.isSuccess || editMealQuery.isSuccess
                                    ? <CircularProgress />
                                    : t('submit')
                                }
                            </Button>

                        </Stack>
                    </Stack>
                </Form>
            )}
        </Formik>
    );
};
