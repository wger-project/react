import { Button, Stack, TextField, MenuItem, CircularProgress } from "@mui/material";
import { MeasurementCategory, DYNAMIC_TYPE_DEFAULTS } from "@/components/Measurements/models/Category";
import { useAddMeasurementCategoryQuery, useEditMeasurementCategoryQuery, useDynamicCategoriesQuery } from "@/components/Measurements/queries";
import { Form, Formik } from "formik";
import React from 'react';
import { useTranslation } from "react-i18next";
import * as yup from 'yup';

interface CategoryFormProps {
    category?: MeasurementCategory,
    closeFn?: () => void,
}

interface DynamicTypeOption {
    value: string;
    label: string;
}

export const CategoryForm = ({ category, closeFn }: CategoryFormProps) => {
    const [t] = useTranslation();
    const addCategoryQuery = useAddMeasurementCategoryQuery();
    const editCategoryQuery = useEditMeasurementCategoryQuery(category?.id || 0);

    const dynamicQuery = useDynamicCategoriesQuery();

    const validationSchema = yup.object({
        name: yup
            .string()
            .required(t('forms.fieldRequired'))
            .max(20, t('forms.maxLength', { chars: '20' }))
            .min(3, t('forms.minLength', { chars: '3' })),
        unit: yup
            .string()
            .required(t('forms.fieldRequired'))
            .max(5, t('forms.maxLength', { chars: '5' })),
        dynamic_type: yup
            .string()
            .required(t('forms.fieldRequired'))
    });

    return (
        <Formik
            initialValues={{
                name: category ? category.name : "",
                unit: category ? category.unit : "",
                dynamic_type: category ? category.dynamic_type : 'NONE',
            }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
                if (category) {
                    editCategoryQuery.mutate({ ...values, id: category.id });
                } else {
                    addCategoryQuery.mutate(values);
                }
                if (closeFn) closeFn();
            }}
        >
            {formik => {
                // extract the props so we can override onChange
                const dynamicTypeProps = formik.getFieldProps('dynamic_type');

                return (
                    <Form>
                        <Stack spacing={2}>
                            <TextField
                                fullWidth
                                id="name"
                                label={t('name')}
                                error={formik.touched.name && Boolean(formik.errors.name)}
                                helperText={formik.touched.name && formik.errors.name}
                                {...formik.getFieldProps('name')}
                            />
                            
                            <TextField
                                fullWidth
                                id="unit"
                                label={t('unit')}
                                error={formik.touched.unit && Boolean(formik.errors.unit)}
                                helperText={formik.touched.unit && formik.errors.unit}
                                {...formik.getFieldProps('unit')}
                            />

                            <TextField
                                select
                                fullWidth
                                id="dynamic_type"
                                label="Calculation Type"
                                disabled={dynamicQuery.isLoading}
                                error={formik.touched.dynamic_type && Boolean(formik.errors.dynamic_type)}
                                {...dynamicTypeProps}
                                onChange={(e) => {
                                    dynamicTypeProps.onChange(e);

                                    // check dynamic type default units
                                    const selectedVal = e.target.value;
                                    const defaults = DYNAMIC_TYPE_DEFAULTS[selectedVal];

                                    if (defaults) {
                                        formik.setFieldValue('unit', defaults.unit);
                                        
                                        // auto-fill the name only if the user hasn't typed anything yet
                                        if (!formik.values.name) {
                                            formik.setFieldValue('name', defaults.name);
                                        }
                                    }
                                }}
                            >
                                {dynamicQuery.isLoading && (
                                    <MenuItem disabled value="loading">
                                        <CircularProgress size={20} sx={{ mr: 1 }} /> Loading types...
                                    </MenuItem>
                                )}
                                {!dynamicQuery.isLoading && (dynamicQuery.data as unknown as DynamicTypeOption[])?.map(type => (
                                    <MenuItem key={type.value} value={type.value}>
                                        {type.label}
                                    </MenuItem>
                                ))}
                                {!dynamicQuery.isLoading && (!dynamicQuery.data || dynamicQuery.data.length === 0) && (
                                    <MenuItem value="NONE">Standard (Manual Entry)</MenuItem>
                                )}
                            </TextField>

                            <Stack direction="row" sx={{ justifyContent: "end", mt: 2 }}>
                                <Button color="primary" variant="contained" type="submit">
                                    {t('submit')}
                                </Button>
                            </Stack>
                        </Stack>
                    </Form>
                );
            }}
        </Formik>
    );
};