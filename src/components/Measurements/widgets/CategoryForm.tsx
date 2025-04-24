import { Button, Stack, TextField } from "@mui/material";
import { MeasurementCategory } from "components/Measurements/models/Category";
import { useAddMeasurementCategoryQuery, useEditMeasurementCategoryQuery } from "components/Measurements/queries";
import { Form, Formik } from "formik";
import React from 'react';
import { useTranslation } from "react-i18next";
import * as yup from 'yup';

interface CategoryFormProps {
    category?: MeasurementCategory,
    closeFn?: Function,
}

export const CategoryForm = ({ category, closeFn }: CategoryFormProps) => {

    const [t] = useTranslation();
    const useAddCategoryQuery = useAddMeasurementCategoryQuery();
    const useEditCategoryQuery = useEditMeasurementCategoryQuery(category?.id!);
    const validationSchema = yup.object({
        name: yup
            .string()
            .required(t('forms.fieldRequired'))
            .max(20, t('forms.maxLength', { chars: '20' }))
            .min(3, t('forms.minLength', { chars: '3' })),
        unit: yup
            .string()
            .required(t('forms.fieldRequired'))
            .max(5, t('forms.maxLength', { chars: '5' }))
    });


    return (
        <Formik
            initialValues={{
                name: category ? category.name : "",
                unit: category ? category.unit : "",
            }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {

                // Edit existing weight entry
                if (category) {
                    useEditCategoryQuery.mutate({ ...values, id: category.id });
                } else {
                    useAddCategoryQuery.mutate(values);
                }

                // if closeFn is defined, close the modal (this form does not have to
                // be displayed in a modal)
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
                            label={t('name')}
                            error={formik.touched.name && Boolean(formik.touched.name)}
                            helperText={formik.touched.name && formik.errors.name}
                            {...formik.getFieldProps('name')}
                        />
                        <TextField
                            fullWidth
                            id="unit"
                            label={t('unit')}
                            error={formik.touched.unit && Boolean(formik.errors.unit)}
                            helperText={
                                formik.touched.unit && formik.errors.unit
                                    ? formik.errors.unit
                                    : t('measurements.unitFormHelpText')
                            }
                            {...formik.getFieldProps('unit')}
                        />
                        <Stack direction="row" justifyContent="end" sx={{ mt: 2 }}>
                            <Button color="primary" variant="contained" type="submit" sx={{ mt: 2 }}>
                                {t('submit')}
                            </Button>
                        </Stack>
                    </Stack>
                </Form>
            )}
        </Formik>
    );
};
