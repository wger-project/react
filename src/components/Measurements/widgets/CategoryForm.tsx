import { Button, Stack, TextField, FormControlLabel, Switch, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { MeasurementCategory } from "@/components/Measurements/models/Category";
import { useAddMeasurementCategoryQuery, useEditMeasurementCategoryQuery } from "@/components/Measurements/queries";
import { Form, Formik } from "formik";
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import * as yup from 'yup';

interface CategoryFormProps {
    category?: MeasurementCategory,
    closeFn?: () => void,
}

export const CategoryForm = ({ category, closeFn }: CategoryFormProps) => {

    const [t] = useTranslation();
    const useAddCategoryQuery = useAddMeasurementCategoryQuery();
    const useEditCategoryQuery = useEditMeasurementCategoryQuery(category?.id || 0);

    const [preset, setPreset] = useState(category?.is_dynamic && category.name === 'BMI' ? 'bmi' : 'custom');

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
                is_dynamic: category ? category.is_dynamic : false,
            }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
                // Edit existing weight entry
                if (category) {
                    useEditCategoryQuery.mutate({ ...values, id: category.id });
                } else {
                    useAddCategoryQuery.mutate(values);
                }

                if (closeFn) {
                    closeFn();
                }
            }}
        >
            {formik => (
                <Form>
                    <Stack spacing={2}>
                        {!category && (
                            <FormControl fullWidth>
                                <InputLabel id="template-select-label">Template</InputLabel>
                                <Select
                                    labelId="template-select-label"
                                    value={preset}
                                    label="Template"
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setPreset(val);
                                        
                                        if (val === 'bmi') {
                                            formik.setFieldValue('name', 'BMI');
                                            formik.setFieldValue('unit', 'kg/m²');
                                            formik.setFieldValue('is_dynamic', true);
                                        } else {
                                            formik.setFieldValue('name', '');
                                            formik.setFieldValue('unit', '');
                                            formik.setFieldValue('is_dynamic', false);
                                        }
                                    }}
                                >
                                    <MenuItem value="custom">Custom</MenuItem>
                                    <MenuItem value="bmi">BMI (Auto-populate)</MenuItem>
                                </Select>
                            </FormControl>
                        )}

                        <TextField
                            fullWidth
                            id="name"
                            label={t('name')}
                            disabled={preset === 'bmi'}
                            error={formik.touched.name && Boolean(formik.errors.name)}
                            helperText={formik.touched.name && formik.errors.name}
                            {...formik.getFieldProps('name')}
                        />
                        <TextField
                            fullWidth
                            id="unit"
                            label={t('unit')}
                            disabled={preset === 'bmi'}
                            error={formik.touched.unit && Boolean(formik.errors.unit)}
                            helperText={
                                formik.touched.unit && formik.errors.unit
                                    ? formik.errors.unit
                                    : t('measurements.unitFormHelpText')
                            }
                            {...formik.getFieldProps('unit')}
                        />
                        
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formik.values.is_dynamic}
                                    disabled={preset === 'bmi'}
                                    onChange={(e) => formik.setFieldValue('is_dynamic', e.target.checked)}
                                />
                            }
                            label="Is Dynamic (Auto-calculated)"
                        />

                        <Stack direction="row" sx={{ justifyContent: "end", mt: 2 }}>
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