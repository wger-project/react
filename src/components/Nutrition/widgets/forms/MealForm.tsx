import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { Meal } from "components/Nutrition/models/meal";
import { useAddMealQuery, useEditMealQuery } from "components/Nutrition/queries";
import { Form, Formik } from "formik";
import React from 'react';
import { useTranslation } from "react-i18next";
import { dateTimeToHHMM } from "utils/date";
import * as yup from 'yup';

interface MealFormProps {
    planId: number,
    meal?: Meal,
    closeFn?: Function,
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
                time: meal ? meal.time : new Date()
            }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {

                // The result from the datepicker is a Luxon DateTime object, not a JS DateTime...
                if (!(values.time instanceof Date)) {
                    // @ts-ignore
                    values.time = values.time.toJSDate();
                }

                const data = { ...values, time: dateTimeToHHMM(values.time) };

                if (meal) {
                    editMealQuery.mutate({ ...data, plan: planId, id: meal.id });
                } else {
                    addMealQuery.mutate({ ...data, plan: planId });
                }

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
                        <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={i18n.language}>
                            <TimePicker
                                label={t('timeOfDay')}
                                value={formik.values.time}
                                onChange={(newValue) => formik.setFieldValue('time', newValue)}
                                renderInput={(params) => <TextField {...params} {...formik.getFieldProps('time')} />}
                            />
                        </LocalizationProvider>
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
